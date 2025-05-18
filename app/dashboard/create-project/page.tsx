'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';
import BasicInfo from './components/BasicInfo';
import ProjectDetails from './components/ProjectDetails';
import MediaUpload from './components/MediaUpload';
import ModelsPricing from './components/ModelsPricing';
import AmenitiesFeatures from './components/AmenitiesFeatures';
import ReviewSubmit from './components/ReviewSubmit';
import { UserIcon, AcademicCapIcon, BriefcaseIcon, PhotoIcon, ClipboardDocumentListIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../../lib/supabase';
import { Toaster, toast } from 'react-hot-toast';
import type { Amenity } from '../../components/AmenityMultiSelect';
import { NavigationGuardProvider, useNavigationGuard } from './NavigationGuardProvider';

// Define the project form data interface
export interface ProjectFormData {
  // Basic Information
  name: string;
  developer_id: string;
  city_id: string;
  locality_id: string;
  construction_status: 'Ready to Move' | 'Under Construction' | 'Not Started' | 'Completed';
  possession_date: string | null;
  is_featured: boolean;
  project_size: {
    total_area: number;
    unit: string;
    built_up_area: number;
  };
  price_range: {
    min: number;
    max: number;
    currency: string;
    min_unit?: string;
    max_unit?: string;
  };
  emi_details: {
    amount: number;
    duration: number;
    interest_rate: number;
  };
  location_coordinates: {
    latitude: number;
    longitude: number;
  };

  // Project Details
  project_highlights: string[];
  description: string;
  brochure_url: string;
  // Media
  cover_image_url: string;
  video_url: string;
  project_images: Array<{
    url: string;
    category: string; // e.g., 'Exterior', 'Interior', 'Amenities', etc.
    storage_path?: string; // Optional path in storage bucket
  }>;
  
  // Storage
  storage_folder?: string; // Path to project folder in storage

  // Models & Pricing
  models: Array<{
    bhk_type: string;
    super_built_up_area: number | string;
    carpet_area: number | string;
    price: number | string;
    price_unit: string;
    price_per_sqft: number | string;
    price_per_sqft_unit: string;
    availability_status: 'available' | 'sold_out' | 'coming_soon';
    floor_plan_url: string;
    specifications: {
      bedrooms: number | string;
      bathrooms: number | string;
      balconies: number | string;
      parking: number | string;
    };
  }>;

  // Amenities & Features
  amenities: Amenity[]; // Array of amenity types

  // RERA fields
  rera_verified: boolean;
  rera_id: string;
}

const initialFormData: ProjectFormData = {
  name: '',
  developer_id: '',
  city_id: '',
  locality_id: '',
  construction_status: 'Under Construction',
  possession_date: null,
  is_featured: false,
  project_size: {
    total_area: 0,
    unit: 'acres',
    built_up_area: 0,
  },
  price_range: {
    min: 0,
    max: 0,
    currency: 'INR',
    min_unit: '',
    max_unit: '',
  },
  emi_details: {
    amount: 0,
    duration: 0,
    interest_rate: 0,
  },
  location_coordinates: {
    latitude: 0,
    longitude: 0,
  },
  project_highlights: [],
  description: '',
  brochure_url: '',
  cover_image_url: '',
  video_url: '',
  project_images: [],
  models: [],
  amenities: [],
  rera_verified: false,
  rera_id: '',
};

const stepLabels = [
  { label: 'Basic Info', subtitle: 'Project basics' },
  { label: 'Project Details', subtitle: 'Details & highlights' },
  { label: 'Media Upload', subtitle: 'Images & videos' },
  { label: 'Models & Pricing', subtitle: 'BHKs & pricing' },
  { label: 'Amenities', subtitle: 'Select amenities' },
  { label: 'Review', subtitle: 'Final review' },
];

export function CreateProject() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useNavigationGuard(hasUnsavedChanges);

  // Add effect to handle browser reload/close/back/forward warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm(
          'You have unsaved changes. Are you sure you want to leave this page? All form data will be lost.'
        );
        if (!confirmLeave) {
          // Prevent navigation
          throw 'Route change aborted by user';
        }
      }
    };

    // @ts-ignore
    router.events?.on('routeChangeStart', handleRouteChange);

    return () => {
      // @ts-ignore
      router.events?.off('routeChangeStart', handleRouteChange);
    };
  }, [hasUnsavedChanges, router]);

  const resetCurrentStep = () => {
    if (window.confirm('Are you sure you want to reset this form? This will clear all data in the current step.')) {
      switch (currentStep) {
        case 1: // Basic Info
          updateFormData({
            name: '',
            developer_id: '',
            city_id: '',
            locality_id: '',
            construction_status: 'Under Construction',
            project_size: initialFormData.project_size,
            price_range: initialFormData.price_range,
            location_coordinates: initialFormData.location_coordinates,
          });
          break;
        case 2: // Project Details
          updateFormData({
            project_highlights: [],
            description: '',
            brochure_url: '',
            emi_details: initialFormData.emi_details,
          });
          break;
        case 3: // Media Upload
          updateFormData({
            cover_image_url: '',
            video_url: '',
            project_images: [],
          });
          break;
        case 4: // Models & Pricing
          updateFormData({
            models: [],
          });
          break;
        case 5: // Amenities
          updateFormData({
            amenities: [],
          });
          break;
      }
      setHasUnsavedChanges(false);
    }
  };

  const updateFormData = (data: Partial<ProjectFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setHasUnsavedChanges(true);
  };

  const totalSteps = 6;
  const progressPercent = ((currentStep - 1) / (stepLabels.length - 1)) * 100;

  const handleNext = async () => {
    try {
      switch (currentStep) {
        case 1: // Basic Info
          // Basic info validation is handled in the component
          break;

        case 2: // Project Details
          // Project details validation is handled in the component
          break;

        case 3: // Media Upload
          // Media Upload validation is handled in the component
          break;

        case 4: // Models & Pricing
          // Validate models data
          if (formData.models.length === 0) {
            toast.error('Please add at least one model');
            return;
          }
          // Sanitize numeric values
          const sanitizedModels = formData.models.map(model => ({
            ...model,
            super_built_up_area: typeof model.super_built_up_area === 'string' ? parseFloat(model.super_built_up_area) || 0 : model.super_built_up_area || 0,
            carpet_area: typeof model.carpet_area === 'string' ? parseFloat(model.carpet_area) || 0 : model.carpet_area || 0,
            price: typeof model.price === 'string' ? parseFloat(model.price) || 0 : model.price || 0,
            price_per_sqft: typeof model.price_per_sqft === 'string' ? parseFloat(model.price_per_sqft) || 0 : model.price_per_sqft || 0,
            specifications: {
              bedrooms: typeof model.specifications.bedrooms === 'string' ? parseInt(model.specifications.bedrooms) || 0 : model.specifications.bedrooms || 0,
              bathrooms: typeof model.specifications.bathrooms === 'string' ? parseInt(model.specifications.bathrooms) || 0 : model.specifications.bathrooms || 0,
              balconies: typeof model.specifications.balconies === 'string' ? parseInt(model.specifications.balconies) || 0 : model.specifications.balconies || 0,
              parking: typeof model.specifications.parking === 'string' ? parseInt(model.specifications.parking) || 0 : model.specifications.parking || 0,
            }
          }));
          updateFormData({ models: sanitizedModels });
          break;

        case 5: // Amenities
          // No validation needed for amenities as they are optional
          break;
      }

      setCurrentStep(prev => prev + 1);
    } catch (error) {
      console.error('Error in handleNext:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to create a project');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Starting project creation...');
      
      // Structure data according to SQL schema
      console.log('Preparing project data...');
      
      // Prepare price_range as JSONB
      const priceRange = {
        min: formData.price_range.min,
        max: formData.price_range.max,
        currency: formData.price_range.currency
      };

      // Prepare project_size as JSONB
      const projectSize = {
        total_area: formData.project_size.total_area,
        unit: formData.project_size.unit,
        built_up_area: formData.project_size.built_up_area
      };

      // Prepare emi_details as JSONB
      const emiDetails = {
        amount: formData.emi_details.amount,
        duration: formData.emi_details.duration,
        interest_rate: formData.emi_details.interest_rate
      };

      // Format location coordinates as POINT type
      const locationPoint = `(${formData.location_coordinates.latitude},${formData.location_coordinates.longitude})`;

      // Prepare project data (excluding cover_image_url if not present)
      const projectData: any = {
        name: formData.name,
        developer_id: formData.developer_id,
        city_id: formData.city_id, 
        locality_id: formData.locality_id,
        construction_status: formData.construction_status,
        possession_date: formData.possession_date,
        is_featured: formData.is_featured,
        project_highlights: formData.project_highlights,
        location_coordinates: locationPoint,
        price_range: priceRange,
        emi_details: emiDetails,
        project_size: projectSize,
        created_by: user.id,
        updated_at: new Date().toISOString(),
        is_active: true,
        amenities: formData.amenities,
        rera_verified: formData.rera_verified,
        rera_id: formData.rera_verified ? formData.rera_id : null,
      };

      // Add optional fields if they exist
      if (formData.brochure_url) {
        projectData['brochure_url'] = formData.brochure_url;
      }
      
      if (formData.video_url) {
        projectData['video_url'] = formData.video_url;
      }
      
      if (formData.cover_image_url) {
        projectData['cover_image_url'] = formData.cover_image_url;
      }

      console.log('Inserting project record with data:', JSON.stringify(projectData, null, 2));
      // Create project record
      const { data: insertedProject, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (projectError) {
        console.error('Project creation error:', projectError);
        throw new Error(`Failed to create project: ${projectError.message}`);
      }

      if (!insertedProject) {
        console.error('No project data returned after insertion');
        throw new Error('Failed to create project: No data returned');
      }

      console.log('Project created successfully, ID:', insertedProject.id);
      const projectId = insertedProject.id;

      // Create project images records
      if (formData.project_images.length > 0) {
        console.log('Creating project images...');
        const imagesToInsert = formData.project_images.map(image => ({
          project_id: projectId,
          image_url: image.url,
          category: image.category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: imagesError } = await supabase
          .from('project_images')
          .insert(imagesToInsert);

        if (imagesError) {
          console.error('Error creating project images:', imagesError);
          throw new Error(`Failed to create project images: ${imagesError.message}`);
        }
        console.log('Project images created successfully');
      }

      // Create project models
      if (formData.models.length > 0) {
        console.log('Creating project models...');
        try {
          for (const model of formData.models) {
            console.log('Processing model:', model.bhk_type);
            
            const modelData = {
              project_id: projectId,
              bhk_type: model.bhk_type,
              super_built_up_area: parseFloat(model.super_built_up_area.toString()) || 0,
              carpet_area: parseFloat(model.carpet_area.toString()) || 0,
              price: parseFloat(model.price.toString()) || 0,
              price_unit: model.price_unit || 'INR',
              price_per_sqft: parseFloat(model.price_per_sqft.toString()) || 0,
              price_per_sqft_unit: model.price_per_sqft_unit || 'INR',
              availability_status: model.availability_status,
              bedrooms: parseInt(model.specifications.bedrooms.toString()) || 0,
              bathrooms: parseInt(model.specifications.bathrooms.toString()) || 0,
              balconies: parseInt(model.specifications.balconies.toString()) || 0,
              parking: parseInt(model.specifications.parking.toString()) || 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            console.log('Inserting model with data:', JSON.stringify(modelData, null, 2));
            const { error: modelError } = await supabase
              .from('project_models')
              .insert(modelData);

            if (modelError) {
              console.error('Error creating model:', model.bhk_type, modelError);
              throw new Error(`Failed to create model ${model.bhk_type}: ${modelError.message}`);
            }
          }
          console.log('All models created successfully');
        } catch (error) {
          console.error('Error in model creation:', error);
          throw error;
        }
      }

      console.log('Project creation completed successfully');
      setMessage({ type: 'success', text: 'Project created successfully! Redirecting to projects page...' });
      setTimeout(() => {
        router.push('/dashboard/projects');
      }, 2000);
    } catch (err) {
      console.error('Error in project creation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      setMessage({ type: 'error', text: `Failed to create project: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      onBack: handleBack,
      onReset: resetCurrentStep,
    };

    switch (currentStep) {
      case 1:
        return <BasicInfo {...commonProps} />;
      case 2:
        return <ProjectDetails {...commonProps} />;
      case 3:
        return <MediaUpload {...commonProps} />;
      case 4:
        return <ModelsPricing {...commonProps} />;
      case 5:
        return <AmenitiesFeatures {...commonProps} />;
      case 6:
        return (
          <ReviewSubmit
            formData={formData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-8">
        {/* Modern Horizontal Progress Bar */}
        <div className="w-full max-w-2xl mb-8 relative">
          {/* Progress Track */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full" />
          {/* Progress Fill */}
          <div
            className="absolute top-6 left-0 h-1 bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
          <ol className="flex items-center justify-between w-full relative z-10">
            {stepLabels.map((step, idx) => {
              const isActive = currentStep === idx + 1;
              const isCompleted = currentStep > idx + 1;
              return (
                <li key={step.label} className="flex-1 flex flex-col items-center">
                  <div className="flex items-center justify-center">
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full border-2 text-xs font-bold transition-colors duration-200
                        ${isActive ? 'bg-green-500 border-green-500 text-white' : isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}
                    >
                      {isCompleted ? (
                        <span className="w-3 h-3 bg-white rounded-full block" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                  </div>
                  <span className={`mt-2 text-sm font-semibold ${isActive ? 'text-green-700' : 'text-gray-500'}`}>{step.label}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{step.subtitle}</span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Main Form Card */}
        <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Step Header */}
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div>
            <h2 className="text-xl font-bold text-gray-900">
              {stepLabels[currentStep - 1].label}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {stepLabels[currentStep - 1].subtitle}
            </p>
            </div>
            {currentStep < 6 && (
              <button
                type="button"
                onClick={resetCurrentStep}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Form
              </button>
            )}
          </div>
          {/* Form Body */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {message && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                } border`}
              >
                <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {message.text}
                </p>
              </div>
            )}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Add Featured Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="is_featured" className="block text-sm font-medium text-gray-700">
                      Featured Project
                    </label>
                    <p className="mt-1 text-sm text-gray-500">
                      Featured projects will be highlighted on the homepage and listings page
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.is_featured}
                      onClick={() => setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }))}
                      className={`${
                        formData.is_featured ? 'bg-green-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                    >
                      <span className="sr-only">Toggle featured status</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          formData.is_featured ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                </div>
                {renderStep()}
              </div>
            )}
            {currentStep > 1 && renderStep()}
          </div>
        </div>
      </div>
    </>
  );
}

export function CreateProjectWithGuard() {
  return (
    <NavigationGuardProvider>
      <CreateProject />
    </NavigationGuardProvider>
  );
}

export default CreateProjectWithGuard; 