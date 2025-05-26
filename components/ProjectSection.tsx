import { Project } from '@/types/project';
import ListingCard from './ListingCard';
import StandardProjectCard from './StandardProjectCard';
import OverlayProjectCard from './OverlayProjectCard';
import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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
  const [projectsPerPage, setProjectsPerPage] = useState(2);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setProjectsPerPage(1);
      } else {
        if (title.toLowerCase().includes('featured')) {
          setProjectsPerPage(2);
        } else if (title.toLowerCase().includes('recent')) {
          setProjectsPerPage(3);
        } else {
          setProjectsPerPage(6);
        }
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [title]);

  if (projects.length === 0) return null;

  const isFeatured = title.toLowerCase().includes('featured');
  const isRecent = title.toLowerCase().includes('recent');

  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const currentProjects = projects.slice(
    currentPage * projectsPerPage,
    (currentPage + 1) * projectsPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const showCarouselArrows = projects.length > projectsPerPage;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          {showCarouselArrows && (
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                className="p-2 rounded-full bg-white shadow hover:bg-gray-50 transition-colors"
                aria-label="Previous projects"
              >
                <FiChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <span className="text-sm text-gray-600">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={nextPage}
                className="p-2 rounded-full bg-white shadow hover:bg-gray-50 transition-colors"
                aria-label="Next projects"
              >
                <FiChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          )}
        </div>
        <div
          className="flex gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex-nowrap pb-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onWheel={e => {
            if (e.deltaY !== 0) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
        >
          {currentProjects.map((project) => (
            isFeatured ? (
              <div className="min-w-full w-full md:min-w-[320px] md:max-w-xs" key={project.id}>
                <OverlayProjectCard
                  project={project}
                  projectImages={projectImagesMap[project.id] || []}
                  localityName={localityMap[project.locality_id] || 'Unknown Locality'}
                  cityName={cityMap[project.city_id] || 'Unknown City'}
                />
              </div>
            ) : isRecent ? (
              <div className="min-w-full w-full md:min-w-[320px] md:max-w-xs" key={project.id}>
                <StandardProjectCard
                  project={project}
                  projectImages={projectImagesMap[project.id] || []}
                  localityName={localityMap[project.locality_id] || 'Unknown Locality'}
                  cityName={cityMap[project.city_id] || 'Unknown City'}
                />
              </div>
            ) : (
              <div className="min-w-full w-full md:min-w-[320px] md:max-w-xs" key={project.id}>
                <ListingCard
                  project={project}
                  projectImages={projectImagesMap[project.id] || []}
                  localityName={localityMap[project.locality_id] || 'Unknown Locality'}
                  cityName={cityMap[project.city_id] || 'Unknown City'}
                  onEnquire={() => onEnquire(project)}
                  onContact={() => onContact(project)}
                />
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
} 