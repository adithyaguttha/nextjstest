import { Project } from '@/types/project';
import ListingCard from './ListingCard';
import StandardProjectCard from './StandardProjectCard';
import OverlayProjectCard from './OverlayProjectCard';
import { useState, useEffect, useCallback, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface ProjectSectionProps {
  title: string;
  projects: Project[];
  projectImagesMap: Record<string, { url: string; category?: string }[]>;
  localityMap: Record<string, string>;
  cityMap: Record<string, string>;
  onEnquire: (project: Project) => void;
  onContact: (project: Project) => void;
}

export default function ProjectSection({
  title,
  projects,
  projectImagesMap,
  localityMap,
  cityMap,
  onEnquire,
  onContact,
}: ProjectSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Define isFeatured and isRecent before they're used in hooks
  const isFeatured = title.toLowerCase().includes('featured');
  const isRecent = title.toLowerCase().includes('recent');

  // For featured projects, show 1 project per page on mobile, 2 on desktop
  const projectsPerPage = isFeatured ? (isMobile ? 1 : 2) : 6;
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isFeatured && isMobile) {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isFeatured && isMobile) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const handleTouchEnd = useCallback(() => {
    if (!isFeatured || !isMobile || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setSlideDirection('left');
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }
    if (isRightSwipe) {
      setSlideDirection('right');
      setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    }
  }, [touchStart, touchEnd, isMobile, totalPages, isFeatured]);

  const handleNavigation = (direction: 'left' | 'right') => {
    setSlideDirection(direction);
    if (direction === 'left') {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    } else {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset slide direction after animation
  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => {
        setSlideDirection(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  if (projects.length === 0) return null;

  const currentProjects = projects.slice(
    currentPage * projectsPerPage,
    (currentPage + 1) * projectsPerPage
  );

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          {isFeatured && !isMobile && projects.length > 2 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavigation('right')}
                className="p-2 rounded-full bg-white shadow hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous projects"
              >
                <FiChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => handleNavigation('left')}
                className="p-2 rounded-full bg-white shadow hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next projects"
              >
                <FiChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          )}
        </div>
        <div 
          ref={carouselRef}
          className={cn(
            "grid gap-6 relative",
            isFeatured ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
            isFeatured && "overflow-hidden"
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: isFeatured && isMobile ? 'pan-y pinch-zoom' : 'auto' }}
        >
          {currentProjects.map((project) => (
            <div
              key={project.id}
              className={cn(
                "transition-transform duration-300 ease-in-out",
                isFeatured && slideDirection === 'left' && "animate-slide-left",
                isFeatured && slideDirection === 'right' && "animate-slide-right"
              )}
            >
              {isFeatured ? (
              <OverlayProjectCard
                project={project}
                projectImages={projectImagesMap[project.id] || []}
                localityName={localityMap[project.locality_id] || 'Unknown Locality'}
                cityName={cityMap[project.city_id] || 'Unknown City'}
              />
            ) : isRecent ? (
              <StandardProjectCard
                project={project}
                projectImages={projectImagesMap[project.id] || []}
                localityName={localityMap[project.locality_id] || 'Unknown Locality'}
                cityName={cityMap[project.city_id] || 'Unknown City'}
              />
            ) : (
              <ListingCard
                project={project}
                projectImages={projectImagesMap[project.id] || []}
                localityName={localityMap[project.locality_id] || 'Unknown Locality'}
                cityName={cityMap[project.city_id] || 'Unknown City'}
                onEnquire={() => onEnquire(project)}
                onContact={() => onContact(project)}
              />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}