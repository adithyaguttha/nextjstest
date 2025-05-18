'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, XMarkIcon, PlusIcon, FolderIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface MediaUploadProps {
  formData: {
    name: string;
    cover_image_url: string;
    video_url: string;
    brochure_url: string;
    project_images: Array<{
      url: string;
      category: string;
      storage_path?: string;
    }>;
    storage_folder?: string;
  };
  updateFormData: (data: Partial<unknown>) => void;
  onNext: () => void;
  onBack: () => void;
}

const imageCategories = [
  'Elevation',
  'Bedroom',
  'Kitchen',
  'Living Area',
  'Dining Area',
  'Amenities',
  'Floor Plan',
  'Location Plan',
  'Construction Status',
  'Others'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_PDF_TYPES = ['application/pdf'];

const MediaUpload: React.FC<MediaUploadProps> = ({
  formData,
  updateFormData,
  onNext,
  onBack,
}) => {
  const [imageUploading, setImageUploading] = useState(false);
  const [brochureUploading, setBrochureUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [brochureUploadProgress, setBrochureUploadProgress] = useState(0);
  const [activeCategory, setActiveCategory] = useState(imageCategories[0]);
  const [projectStorageFolder, setProjectStorageFolder] = useState(formData.storage_folder || '');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Initialize project folder using project name
  React.useEffect(() => {
    if (!projectStorageFolder && formData.name) {
      // Create a URL-friendly version of the project name
      const sanitizedName = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
      
      const folder = sanitizedName;
      setProjectStorageFolder(folder);
      updateFormData({ storage_folder: folder });
    }
  }, [projectStorageFolder, formData.name, updateFormData]);

  useEffect(() => {
    if (toastMessage) {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToastMessage(null), 3500);
    }
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, [toastMessage, setToastMessage]);

  const validateFile = (file: File, allowedTypes: string[] = ALLOWED_IMAGE_TYPES) => {
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return false;
    }
    return true;
  };

  // Handle cover image upload
  const onDropCoverImage = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    console.log('Starting cover image upload for file:', file.name, 'Size:', file.size);
    
    if (!validateFile(file)) {
      console.log('File validation failed');
      return;
    }

    try {
      setImageUploading(true);
      setImageUploadProgress(0);
      console.log('Upload state set to true');

      const fileExt = file.name.split('.').pop();
      const fileName = `cover-${Date.now()}.${fileExt}`;
      const filePath = `${projectStorageFolder}/cover/${fileName}`;
      console.log('Preparing to upload to path:', filePath);

      // Upload file
      console.log('Initiating Supabase storage upload...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        if (uploadError.message.includes('duplicate')) {
          throw new Error('A file with this name already exists. Please rename your file and try again.');
        }
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);
      // Update progress after successful upload
      setImageUploadProgress(100);

      console.log('Getting public URL...');
      const { data: urlData } = supabase.storage
        .from('project-media')
        .getPublicUrl(filePath);

      console.log('Public URL data:', urlData);
      updateFormData({ cover_image_url: urlData.publicUrl });
      toast.success('Cover image uploaded successfully');
    } catch (error) {
      console.error('Error uploading cover image:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      toast.error(error instanceof Error ? error.message : 'Failed to upload cover image. Please try again.');
    } finally {
      console.log('Resetting upload state');
      setImageUploading(false);
      setImageUploadProgress(0);
    }
  }, [projectStorageFolder, updateFormData]);

  // Handle multiple project images upload
  const onDropProjectImages = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Validate all files first
    const validFiles = acceptedFiles.filter(file => validateFile(file, ALLOWED_IMAGE_TYPES));
    if (validFiles.length === 0) return;

    try {
      setImageUploading(true);
      setImageUploadProgress(0);

      const totalFiles = validFiles.length;
      let uploadedCount = 0;
      let failedUploads = 0;

      // Process files in batches of 3 concurrent uploads
      const batchSize = 3;
      for (let i = 0; i < validFiles.length; i += batchSize) {
        const batch = validFiles.slice(i, i + batchSize);
        const uploadPromises = batch.map(async (file, batchIndex) => {
          try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${activeCategory.toLowerCase().replace(/\s+/g, '_')}-${Date.now()}-${i + batchIndex}.${fileExt}`;
            const filePath = `${projectStorageFolder}/${activeCategory.toLowerCase().replace(/\s+/g, '_')}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('project-media')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
              });

            if (uploadError) {
              console.error(`Error uploading ${file.name}:`, uploadError);
              failedUploads++;
              return null;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('project-media')
              .getPublicUrl(filePath);

            uploadedCount++;
            // Update progress after each successful upload
            setImageUploadProgress((uploadedCount / totalFiles) * 100);

            return {
              url: publicUrl,
              category: activeCategory,
              storage_path: filePath
            };
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            failedUploads++;
            return null;
          }
        });

        // Wait for all uploads in the current batch to complete
        const results = await Promise.all(uploadPromises);
        
        // Filter out failed uploads and update form data with successful ones
        const successfulUploads = results.filter((result): result is NonNullable<typeof result> => result !== null);
        if (successfulUploads.length > 0) {
          updateFormData({
            project_images: [
              ...formData.project_images,
              ...successfulUploads
            ]
          });
        }
      }

      if (uploadedCount > 0) {
        toast.success(`Successfully uploaded ${uploadedCount} image(s)`);
      }
      if (failedUploads > 0) {
        toast.error(`Failed to upload ${failedUploads} image(s). Please try again.`);
      }
    } catch (error) {
      console.error('Error in batch upload:', error);
      toast.error('Failed to upload some images. Please try again.');
    } finally {
      setImageUploading(false);
      setImageUploadProgress(0);
    }
  }, [activeCategory, projectStorageFolder, formData.project_images, updateFormData]);

  // Add brochure upload handler
  const onDropBrochure = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    console.log('Starting brochure upload for file:', file.name, 'Size:', file.size);
    
    if (!validateFile(file, ALLOWED_PDF_TYPES)) {
      console.log('File validation failed');
      return;
    }

    try {
      setBrochureUploading(true);
      setBrochureUploadProgress(0);
      console.log('Upload state set to true');

      const fileExt = file.name.split('.').pop();
      const fileName = `brochure-${Date.now()}.${fileExt}`;
      const filePath = `${projectStorageFolder}/brochure/${fileName}`;
      console.log('Preparing to upload to path:', filePath);

      // Upload file
      console.log('Initiating Supabase storage upload...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        if (uploadError.message.includes('duplicate')) {
          throw new Error('A file with this name already exists. Please rename your file and try again.');
        }
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);
      setBrochureUploadProgress(100);

      console.log('Getting public URL...');
      const { data: urlData } = supabase.storage
        .from('project-media')
        .getPublicUrl(filePath);

      console.log('Public URL data:', urlData);
      updateFormData({ brochure_url: urlData.publicUrl });
      toast.success('Brochure uploaded successfully');
    } catch (error) {
      console.error('Error uploading brochure:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      toast.error(error instanceof Error ? error.message : 'Failed to upload brochure. Please try again.');
    } finally {
      console.log('Resetting upload state');
      setBrochureUploading(false);
      setBrochureUploadProgress(0);
    }
  }, [projectStorageFolder, updateFormData]);

  const { getRootProps: getCoverImageRootProps, getInputProps: getCoverImageInputProps } = useDropzone({
    onDrop: onDropCoverImage,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    disabled: imageUploading || brochureUploading
  });

  const { getRootProps: getProjectImagesRootProps, getInputProps: getProjectImagesInputProps } = useDropzone({
    onDrop: onDropProjectImages,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true,
    disabled: imageUploading || brochureUploading
  });

  // Add brochure dropzone
  const { getRootProps: getBrochureRootProps, getInputProps: getBrochureInputProps } = useDropzone({
    onDrop: onDropBrochure,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: imageUploading || brochureUploading
  });

  const removeImage = (imageUrl: string) => {
    const updatedImages = formData.project_images.filter(img => img.url !== imageUrl);
    updateFormData({ project_images: updatedImages });
    toast.success('Image removed successfully');
  };

  const handleNext = async () => {
    if (!formData.cover_image_url) {
      toast.error('Please upload a cover image');
      return;
    }

    try {
      onNext();
    } catch (error) {
      console.error('Error in media validation:', error);
      toast.error('Failed to process media. Please try again.');
    }
  };

  // Add YouTube URL validation and extraction
  const validateYouTubeUrl = (url: string): string | null => {
    if (!url) return null;
    
    // Regular expressions for different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/, // Standard YouTube URL
      /youtube\.com\/embed\/([^&\n?#]+)/, // Embed URL
      /youtube\.com\/v\/([^&\n?#]+)/, // Short URL
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1]; // Return the video ID
      }
    }

    return null;
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoError(null);

    if (!url) {
      updateFormData({ video_url: '' });
      return;
    }

    const videoId = validateYouTubeUrl(url);
    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      updateFormData({ video_url: embedUrl });
    } else {
      setVideoError('Please enter a valid YouTube URL');
      updateFormData({ video_url: '' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Project Storage Info */}
      {projectStorageFolder && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start">
            <FolderIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-700 font-medium">Project Storage</p>
              <p className="text-blue-600 text-sm mt-1">
                All media for this project will be stored in: <span className="font-mono bg-blue-100 px-1 rounded">{projectStorageFolder}</span>
                {!formData.name && (
                  <span className="text-red-500 ml-2">(Please enter project name first)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cover Image Upload */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cover Image <span className="text-red-500">*</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Upload a high-quality cover image for your project (Recommended size: 1920x1080px)
            <br />
            <span className="text-xs text-gray-400">
              Supported formats: JPG, PNG, WEBP (max 10MB)
            </span>
          </p>
        </div>

        <div
          {...getCoverImageRootProps()}
          className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 cursor-pointer
            ${imageUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}`}
        >
          <div className="text-center">
            {formData.cover_image_url ? (
              <div className="relative">
                <Image
                  src={formData.cover_image_url}
                  alt="Cover"
                  className="mx-auto h-32 w-auto object-cover rounded-lg"
                  width={1280}
                  height={720}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFormData({ cover_image_url: '' });
                    toast.success('Cover image removed');
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <span className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                    {imageUploading ? 'Uploading...' : 'Upload a file'}
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">PNG, JPG, WEBP up to 10MB</p>
              </>
            )}
            <input {...getCoverImageInputProps()} />
          </div>
        </div>
        {imageUploading && imageUploadProgress > 0 && (
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                    Uploading Image
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-indigo-600">
                    {Math.round(imageUploadProgress)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                <div
                  style={{ width: `${imageUploadProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* YouTube Video Link */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Video <span className="text-gray-400">(optional)</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Add a YouTube video link for your project
            <br />
            <span className="text-xs text-gray-400">
              Supported formats: YouTube video URLs
            </span>
          </p>
        </div>

        <div className="mt-2">
          <input
            type="text"
            placeholder="Enter YouTube video URL"
            value={formData.video_url ? `https://www.youtube.com/watch?v=${formData.video_url.split('/').pop()}` : ''}
            onChange={handleVideoUrlChange}
            className={`block w-full rounded-lg border ${
              videoError ? 'border-red-400' : 'border-gray-300'
            } px-3 py-2 text-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500`}
          />
          {videoError && (
            <p className="mt-1 text-xs text-red-500">{videoError}</p>
          )}
        </div>

        {/* Video Preview */}
        {formData.video_url && (
          <div className="mt-4 relative">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100">
              <iframe
                src={formData.video_url}
                title="Project Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                updateFormData({ video_url: '' });
                setVideoError(null);
              }}
              className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Project Images Upload */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Images <span className="text-gray-400">(optional)</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Upload multiple images for your project, organized by categories
            <br />
            <span className="text-xs text-gray-400">
              Supported formats: JPG, PNG, WEBP (max 10MB per file)
            </span>
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {imageCategories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors
                ${activeCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {formData.project_images
            .filter(img => img.category === activeCategory)
            .map((image, index) => (
              <div key={index} className="relative group">
                <Image
                  src={image.url}
                  alt={`${activeCategory} ${index + 1}`}
                  className="h-32 w-full object-cover rounded-lg"
                  width={1280}
                  height={720}
                />
                <button
                  type="button"
                  onClick={() => removeImage(image.url)}
                  className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}

          {/* Upload Button */}
          <div
            {...getProjectImagesRootProps()}
            className={`h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50
              ${imageUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {imageUploading ? (
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-6 w-6 text-indigo-600 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs text-gray-500">Uploading...</span>
              </div>
            ) : (
              <>
                <PlusIcon className="w-8 h-8 text-gray-400" />
                <span className="mt-1 text-xs text-gray-500">Add Images</span>
                <span className="text-xs text-gray-400">Drag & drop or click to upload</span>
              </>
            )}
            <input {...getProjectImagesInputProps()} />
          </div>
        </div>
        {imageUploading && imageUploadProgress > 0 && (
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                    Uploading Images
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-indigo-600">
                    {Math.round(imageUploadProgress)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                <div
                  style={{ width: `${imageUploadProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Brochure Upload */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Brochure <span className="text-gray-400">(optional)</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Upload a PDF brochure for your project
            <br />
            <span className="text-xs text-gray-400">
              Supported format: PDF (max 10MB)
            </span>
          </p>
        </div>

        <div
          {...getBrochureRootProps()}
          className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 cursor-pointer
            ${imageUploading || brochureUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}`}
        >
          <div className="text-center">
            {formData.brochure_url ? (
              <div className="relative">
                <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-600">Project Brochure</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFormData({ brochure_url: '' });
                    toast.success('Brochure removed');
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                <a
                  href={formData.brochure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Brochure
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <span className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                    {imageUploading || brochureUploading ? 'Uploading...' : 'Upload a file'}
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">PDF up to 10MB</p>
              </>
            )}
            <input {...getBrochureInputProps()} />
          </div>
        </div>
        {brochureUploading && brochureUploadProgress > 0 && (
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                    Uploading Brochure
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-green-600">
                    {Math.round(brochureUploadProgress)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                <div
                  style={{ width: `${brochureUploadProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={imageUploading || brochureUploading || !formData.cover_image_url}
          className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm
            ${imageUploading || brochureUploading || !formData.cover_image_url
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
        >
          {imageUploading || brochureUploading ? 'Uploading...' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default MediaUpload; 