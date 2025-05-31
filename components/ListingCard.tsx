import { FiMessageSquare, FiPhone, FiHome, FiChevronLeft, FiChevronRight, FiShare2, FiX, FiFileText, FiYoutube } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaTwitter } from 'react-icons/fa';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import SaveButton from '@/app/components/SaveButton';

// Update Project type to match exact database schema
type Project = {
  id: string;
  name: string;
  developer_id: string;
  price_range: {
    min: number;
    max: number;
    currency: string;
    min_unit: string | null;
    max_unit: string | null;
  };
  emi_details: {
    amount: number;
    duration: number;
    interest_rate: number;
  };
  construction_status: 'Ready to Move' | 'Under Construction' | 'Not Started' | 'Completed';
  project_highlights: string[];
  location_coordinates: {
    latitude: number;
    longitude: number;
  };
  city: {
    id: string;
    name: string;
  };
  locality: {
    id: string;
    name: string;
  };
  brochure_url: string | null;
  project_size: {
    unit: string;
    total_area: string | number;
    built_up_area: number;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
  cover_image_url: string;
  amenities: string[];
  is_featured: boolean;
  possession_date: string | null;
  rera_verified: boolean;
  rera_id: string | null;
  video_url: string | null;
  slug: string | null;
  developer_name: string | null;
  developer: {
    id: string;
    name: string;
    phone: string;
  };
  project_images?: { url: string }[];
  models?: {
    bhk_type: string;
    availability_status: 'available' | 'sold_out' | 'coming_soon';
  }[];
};

interface ListingCardProps {
  project: Project;
  projectImages: { url: string; category?: string }[];
  localityName: string;
  cityName: string;
  onEnquire: () => void;
  onContact: () => void;
}

export default function ListingCard({ project, projectImages, localityName, cityName, onEnquire, onContact }: ListingCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Close share popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShowShare(false);
      }
    }
    if (showShare) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShare]);

  // Carousel state
  const images = [
    project.cover_image_url,
    ...projectImages.map(img => img.url)
  ];
  const [currentImage, setCurrentImage] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }
    if (isRightSwipe) {
      setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    }
  }, [touchStart, touchEnd, images.length]);

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Format phone number for WhatsApp link
  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove any non-digit characters
    return phone.replace(/\D/g, '');
  };

  // Format price with unit, no rounding
  const formatPriceWithUnit = (price: number | string | undefined, unit: string | undefined) => {
    if (price === undefined || price === null || price === '') return '';
    return `₹${price}${unit ? ' ' + unit : ''}`;
  };

  // Placeholder component for when no image is available
  const ImagePlaceholder = () => (
    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <FiHome className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No image available</p>
      </div>
    </div>
  );

  // Get location string safely
  const getLocationString = () => {
    const parts = [];
    if (localityName) parts.push(localityName);
    if (cityName) parts.push(cityName);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  // Get developer name safely
  const getDeveloperName = () => {
    return project.developer?.name || project.developer_name || 'Developer not specified';
  };

  // Get developer phone safely
  const getDeveloperPhone = () => {
    return project.developer?.phone || '';
  };

  // Share handlers
  const shareUrl = typeof window !== 'undefined' ? window.location.origin + '/project/' + project.id : '';
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowShare(false);
  };

  // Add a function to get available BHK types
  const getAvailableBHKTypes = (models?: Project['models']) => {
    if (!models || models.length === 0) return null;
    
    // Get unique BHK types that are available
    const availableBHKs = [...new Set(
      models
        .filter(model => model.availability_status === 'available')
        .map(model => model.bhk_type)
    )].sort();
    
    return availableBHKs.length > 0 ? availableBHKs : null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Image Carousel */}
      <div 
        className="relative h-52 w-full bg-gray-100 flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Top right icons */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-2 z-20">
          <SaveButton projectId={project.id} size="sm" variant="ghost" />
          <div className="relative">
            <button
              className="bg-white bg-opacity-80 rounded-full p-1.5 shadow hover:bg-opacity-100 transition-colors"
              title="Share"
              onClick={() => setShowShare((v) => !v)}
            >
              <FiShare2 className="w-4 h-4 text-gray-700" />
            </button>
            {showShare && (
              <div ref={shareRef} className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 p-3 z-30 flex flex-col gap-2 animate-fade-in">
                <button
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 text-green-600"
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank')}
                >
                  <FaWhatsapp className="w-4 h-4" /> WhatsApp
                </button>
                <button
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 text-gray-700"
                  onClick={handleCopyLink}
                >
                  <FiShare2 className="w-4 h-4" /> Copy Link
                </button>
                <button
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 text-blue-600"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
                >
                  <FaFacebook className="w-4 h-4" /> Facebook
                </button>
                <button
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 text-sky-500"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')}
                >
                  <FaTwitter className="w-4 h-4" /> Twitter
                </button>
                <button
                  className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowShare(false)}
                  title="Close"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
        {images.length > 1 && (
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-100 transition-colors z-10"
            aria-label="Previous image"
          >
            <FiChevronLeft className="w-6 h-6 drop-shadow-lg" />
          </button>
        )}
        {!imageError && images[currentImage] ? (
          <Image
            src={images[currentImage]}
            alt={project.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <ImagePlaceholder />
        )}
        {images.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-100 transition-colors z-10"
            aria-label="Next image"
          >
            <FiChevronRight className="w-6 h-6 drop-shadow-lg" />
          </button>
        )}
        {project.is_featured && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-medium">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-grow">
        {/* Project Name and RERA Badge */}
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-[15px] font-semibold text-gray-900 line-clamp-1 flex-1">{project.name}</h3>
          {project.rera_verified && project.rera_id && (
            <span
              className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-semibold cursor-pointer relative group flex-shrink-0"
              title={project.rera_id}
            >
              RERA
            </span>
          )}
        </div>

        {/* Location and Price Range */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <p className="text-[13px] text-gray-600 line-clamp-1 flex-1">
            {getLocationString()}
          </p>
          <div className="text-right flex-shrink-0">
            <span className="text-[15px] font-bold text-[#044ca3] block">
              {formatPriceWithUnit(project.price_range.min, project.price_range.min_unit || undefined)}
              {project.price_range.max ?
                ` - ${formatPriceWithUnit(project.price_range.max, project.price_range.max_unit || undefined)}`
                : ''}
            </span>
          </div>
        </div>

        {/* BHK types display */}
        {(() => {
          const availableBHKs = getAvailableBHKTypes(project.models);
          return availableBHKs ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {availableBHKs.map((bhk) => (
                <span key={bhk} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                  {bhk}
                </span>
              ))}
            </div>
          ) : null;
        })()}

        <div className="mt-auto">
          {/* Project Size and Possession */}
          <div className="text-[13px] text-gray-600 mb-2.5 flex flex-wrap gap-2">
            <span className="bg-gray-50 px-2 py-1 rounded">
              {project.project_size.total_area} {project.project_size.unit}
            </span>
            {project.possession_date && (
              <span className="bg-gray-50 px-2 py-1 rounded">
                Possession: {new Date(project.possession_date).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Developer Info */}
          <div className="border-t border-gray-100 pt-2.5 mb-2.5">
            <p className="text-[13px] text-gray-600 line-clamp-1">By {getDeveloperName()}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 mt-2.5 pt-2.5 border-t border-gray-100">
            {/* Call Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onContact();
              }}
              className="flex-1 text-[13px] text-[#044ca3] hover:text-[#033b7d] flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 rounded px-2 py-1.5 transition-colors"
            >
              <FiPhone className="w-3.5 h-3.5" />
              <span>Call</span>
            </button>

            {/* WhatsApp Button - Icon Only */}
            <a
              href={`https://wa.me/${formatPhoneForWhatsApp(getDeveloperPhone())}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-green-600 hover:text-green-700 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded p-1.5 transition-colors"
              title="Chat on WhatsApp"
            >
              <FaWhatsapp className="w-4 h-4" />
            </a>

            {/* Enquire Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEnquire();
              }}
              className="flex-1 text-[13px] text-white bg-[#044ca3] hover:bg-[#033b7d] flex items-center justify-center gap-1.5 rounded px-2 py-1.5 transition-colors"
            >
              <FiMessageSquare className="w-3.5 h-3.5" />
              <span>Enquire</span>
            </button>
          </div>

          {/* Additional Links */}
          {(project.brochure_url || project.video_url) && (
            <div className="flex gap-2.5 mt-2.5 pt-2.5 border-t border-gray-100">
              {project.brochure_url && (
                <a
                  href={project.brochure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-[#044ca3] hover:text-[#033b7d] flex items-center gap-1.5"
                >
                  <FiFileText className="w-3.5 h-3.5" />
                  <span className="line-clamp-1">Brochure</span>
                </a>
              )}
              {project.video_url && (
                <a
                  href={project.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-[#044ca3] hover:text-[#033b7d] flex items-center gap-1.5"
                >
                  <FiYoutube className="w-3.5 h-3.5" />
                  <span className="line-clamp-1">Video</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 