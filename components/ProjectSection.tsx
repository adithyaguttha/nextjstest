import { Project } from '@/types/project';
import ListingCard from './ListingCard';
import StandardProjectCard from './StandardProjectCard';
import OverlayProjectCard from './OverlayProjectCard';
import { useState } from 'react';
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
  if (projects.length === 0) return null;

  const isFeatured = title.toLowerCase().includes('featured');
  const isRecent = title.toLowerCase().includes('recent');

  // For featured projects, show 2 projects per page
  const projectsPerPage = isFeatured ? 2 : 6;
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

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          {isFeatured && projects.length > 2 && (
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
        <div className={`grid gap-6 ${isFeatured ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {currentProjects.map((project) => (
            isFeatured ? (
              <OverlayProjectCard
                key={project.id}
                project={project}
                projectImages={projectImagesMap[project.id] || []}
                localityName={localityMap[project.locality_id] || 'Unknown Locality'}
                cityName={cityMap[project.city_id] || 'Unknown City'}
              />
            ) : isRecent ? (
              <StandardProjectCard
                key={project.id}
                project={project}
                projectImages={projectImagesMap[project.id] || []}
                localityName={localityMap[project.locality_id] || 'Unknown Locality'}
                cityName={cityMap[project.city_id] || 'Unknown City'}
              />
            ) : (
              <ListingCard
                key={project.id}
                project={project}
                projectImages={projectImagesMap[project.id] || []}
                localityName={localityMap[project.locality_id] || 'Unknown Locality'}
                cityName={cityMap[project.city_id] || 'Unknown City'}
                onEnquire={() => onEnquire(project)}
                onContact={() => onContact(project)}
              />
            )
          ))}
        </div>
      </div>
    </section>
  );
} 