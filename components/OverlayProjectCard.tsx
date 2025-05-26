import { Project } from '@/types/project';
import { useState, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight, FiHeart, FiPhone } from 'react-icons/fi';
import Image from 'next/image';

interface OverlayProjectCardProps {
  project: Project;
  projectImages: { url: string; category?: string }[];
  localityName: string;
  cityName: string;
}

export default function OverlayProjectCard({
  project,
  projectImages,
  localityName,
  cityName,
}: OverlayProjectCardProps) {
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

  // Compose BHK types string (e.g., "2, 2.5, 3 BHK Apartment")
  let bhkTypes = '';
  if (project.models && project.models.length > 0) {
    const uniqueBHKs = Array.from(new Set(project.models.map(m => m.bhk_type)));
    bhkTypes = uniqueBHKs.join(', ');
  }
  const allowedPropertyTypes = ['apartment', 'villa', 'house', 'plot'];
  const propertyType = project.amenities?.find(a =>
    allowedPropertyTypes.includes(a.toLowerCase())
  ) || '';
  // Do not append extra 'BHK' if already present in bhkTypes
  const bhkPropertyString = bhkTypes
    ? propertyType ? `${bhkTypes} ${propertyType}` : bhkTypes
    : propertyType;

  // Format price
  const formatPriceWithUnit = (price: number | string | undefined, unit: string | undefined | null) => {
    if (price === undefined || price === null || price === '') return '';
    return `₹${price}${unit ? ' ' + unit : ''}`;
  };

  return (
    <div className="relative rounded-lg overflow-hidden shadow group h-72">
      {/* Top right icons */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
        {/* Heart Icon with Tooltip */}
        <div className="relative">
          <button className="peer text-gray-300 hover:text-pink-400 bg-black/30 hover:bg-black/50 rounded-full p-2 transition-colors">
            <FiHeart className="w-5 h-5" />
          </button>
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 peer-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            Add to Wishlist
          </span>
        </div>
        {/* Call Icon with Tooltip */}
        <div className="relative">
          <button className="peer text-gray-300 hover:text-green-400 bg-black/30 hover:bg-black/50 rounded-full p-2 transition-colors">
            <FiPhone className="w-5 h-5" />
          </button>
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 peer-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            Call Developer
          </span>
        </div>
      </div>
      {/* Image section with overlay and carousel */}
      <div 
        className="relative w-full h-full bg-gray-100 flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {allImages.length > 0 && (
          <Image
            src={allImages[currentImage]}
            alt={project.name}
            fill
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
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
        {/* Overlayed details */}
        <div className="absolute bottom-0 left-0 w-full p-5 flex flex-row justify-between items-end z-10">
          {/* Left: Project info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1 truncate drop-shadow">{project.name}</h3>
            <div className="text-gray-200 text-xs mb-2 truncate drop-shadow">by {project.developer?.name || 'Unknown Developer'}</div>
            {bhkPropertyString && (
              <div className="text-sm font-medium text-white mb-1 drop-shadow">{bhkPropertyString}</div>
            )}
            <div className="text-gray-200 text-xs truncate drop-shadow">{locationString}</div>
          </div>
          {/* Right: Price */}
          <div className="flex flex-col items-end min-w-[120px] ml-4">
            <span className="text-lg font-bold text-white drop-shadow">
              {formatPriceWithUnit(project.price_range.min, project.price_range.min_unit)}
              {project.price_range.max ?
                ` - ${formatPriceWithUnit(project.price_range.max, project.price_range.max_unit)}`
                : ''}
            </span>
            <span className="text-xs text-gray-200 mt-1 drop-shadow">Price</span>
          </div>
        </div>
      </div>
    </div>
  );
} 