import { Project } from '@/types/project';
import { useState, useCallback, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiPhone, FiShare2 } from 'react-icons/fi';
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

  const shareRef = useRef<HTMLDivElement>(null);
  const [showShare, setShowShare] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.origin + '/project/' + project.id : '';
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowShare(false);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
      {/* Image section with carousel */}
      <div 
        className="relative w-full h-56 sm:h-64 bg-gray-100 flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Top right action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          {project.developer?.phone && (
            <a
              href={`tel:${project.developer.phone}`}
              className="text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
              title="Call Developer"
              onClick={e => e.stopPropagation()}
            >
              <FiPhone className="w-5 h-5" />
            </a>
          )}
          {/* Share Button */}
          <div className="relative" ref={shareRef}>
            <button
              className="text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
              title="Share"
              onClick={e => { e.stopPropagation(); setShowShare(v => !v); }}
            >
              <FiShare2 className="w-5 h-5" />
            </button>
            {showShare && (
              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 p-3 z-30 flex flex-col gap-2 animate-fade-in">
                <button
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 text-gray-700"
                  onClick={handleCopyLink}
                >
                  <FiShare2 className="w-4 h-4" /> Copy Link
                </button>
                <button
                  className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowShare(false)}
                  title="Close"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 gap-2 sm:gap-0">
        {/* Left: Project info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{project.name}</h3>
          <div className="text-gray-500 text-xs sm:text-sm mb-2">by {project.developer?.name || 'Unknown Developer'}</div>
          {bhkPropertyString && (
            <div className="text-sm font-medium text-gray-800 mb-1">{bhkPropertyString}</div>
          )}
          <div className="text-gray-600 text-xs sm:text-sm mb-1">{locationString}</div>
        </div>
        {/* Right: Price and Actions */}
        <div className="flex flex-col items-end min-w-[100px] sm:min-w-[120px] ml-0 sm:ml-4 mt-2 sm:mt-0 gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-[#044ca3]">
            {formatPriceWithUnit(project.price_range.min, project.price_range.min_unit)}
            {project.price_range.max ?
              ` - ${formatPriceWithUnit(project.price_range.max, project.price_range.max_unit)}`
              : ''}
          </span>
        </div>
      </div>
    </div>
  );
} 