import { Project } from '@/types/project';
import { useState, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Image from 'next/image';

interface StandardProjectCardProps {
  project: Project;
  projectImages: { url: string; category?: string }[];
  localityName: string;
  cityName: string;
}

export default function StandardProjectCard({
  project,
  projectImages,
  localityName,
  cityName,
}: StandardProjectCardProps) {
  // Prepare images: cover image first, then the rest (excluding duplicates)
  const allImages = [
    project.cover_image_url,
    ...projectImages.map(img => img.url).filter(url => url && url !== project.cover_image_url)
  ];
  const [currentImage, setCurrentImage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

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
      setCurrentImage((prev) => (prev + 1) % allImages.length);
    }
    if (isRightSwipe) {
      setCurrentImage((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  }, [touchStart, touchEnd, allImages.length]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % allImages.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Compose location string
  const locationString = [localityName, cityName].filter(Boolean).join(', ');

  // Compose BHK and property type string (e.g., "3 BHK Apartment")
  const bhkType = project.models && project.models.length > 0 ? project.models[0].bhk_type : '';
  const propertyType = project.amenities?.find(a => a.toLowerCase().includes('apartment') || a.toLowerCase().includes('villa') || a.toLowerCase().includes('house') || a.toLowerCase().includes('plot')) || '';
  const bhkPropertyString = [bhkType, propertyType].filter(Boolean).join(' ');

  // Format price
  const formatPriceWithUnit = (price: number | string | undefined, unit: string | undefined | null) => {
    if (price === undefined || price === null || price === '') return '';
    return `₹${price}${unit ? ' ' + unit : ''}`;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Image section with carousel */}
      <div 
        className="relative w-full h-64 bg-gray-100 flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {allImages.length > 0 && (
          <Image
            src={allImages[currentImage]}
            alt={project.name}
            fill
            className="object-cover w-full h-full"
            loading="lazy"
          />
        )}
        {allImages.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-100 transition-colors"
              onClick={prevImage}
              aria-label="Previous image"
            >
              <FiChevronLeft className="w-6 h-6 drop-shadow-lg" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-100 transition-colors"
              onClick={nextImage}
              aria-label="Next image"
            >
              <FiChevronRight className="w-6 h-6 drop-shadow-lg" />
            </button>
          </>
        )}
      </div>
      {/* Details section */}
      <div className="flex flex-row justify-between items-start p-5">
        {/* Left: Project info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{project.name}</h3>
          <div className="text-gray-500 text-sm mb-3 truncate">by {project.developer?.name || 'Unknown Developer'}</div>
          {bhkPropertyString && (
            <div className="text-base font-medium text-gray-800 mb-1">{bhkPropertyString}</div>
          )}
          <div className="text-gray-600 text-sm truncate">{locationString}</div>
        </div>
        {/* Right: Price */}
        <div className="flex flex-col items-end min-w-[120px] ml-4">
          <span className="text-xl font-bold text-[#044ca3]">
            {formatPriceWithUnit(project.price_range.min, project.price_range.min_unit)}
            {project.price_range.max ?
              ` - ${formatPriceWithUnit(project.price_range.max, project.price_range.max_unit)}`
              : ''}
          </span>
          <span className="text-xs text-gray-500 mt-1">Price</span>
        </div>
      </div>
    </div>
  );
} 