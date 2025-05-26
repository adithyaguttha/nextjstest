'use client';

import { useState, useMemo, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import ListingCard from '@/components/ListingCard';
import EnquiryModal from '@/components/EnquiryModal';
import ContactModal from '@/components/ContactModal';
import { Toaster } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

// Update Project type to include models
type Project = {
  id: string;
  name: string;
  developer_id: string;
  city_id: string;
  locality_id: string;
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
  models?: {
    bhk_type: string;
    availability_status: 'available' | 'sold_out' | 'coming_soon';
  }[];
};

// Type for raw database response
type RawProject = Omit<Project, 'city' | 'locality' | 'developer'> & {
  city: { id: string; name: string; }[];
  locality: { id: string; name: string; }[];
  developer: { id: string; name: string; phone: string; }[];
};

type FilterOptions = {
  priceRange: [number, number];
  propertyType: string[];
  bedrooms: string[];
  location: string[];
  city: string[];
  status: string[];
};

export default function ListingsPage() {
  // State management
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 100000000],
    propertyType: [],
    bedrooms: [],
    location: [],
    city: [],
    status: [],
  });
  const [projectImagesMap, setProjectImagesMap] = useState<Record<string, { url: string; category?: string }[]>>({});
  const [localityMap, setLocalityMap] = useState<Record<string, string>>({});
  const [cityMap, setCityMap] = useState<Record<string, string>>({});

  // Fetch projects and images from database
  useEffect(() => {
    const fetchProjectsAndImages = async () => {
      try {
        setLoading(true);
        // Fetch projects
        const { data: rawProjects, error: projectsError } = await supabase
          .from('projects')
          .select(`
            id, 
            name, 
            developer_id,
            city_id,
            locality_id,
            developer:developer_id(name, phone), 
            city:city_id(name), 
            locality:locality_id(name), 
            price_range,
            emi_details,
            construction_status,
            project_highlights,
            location_coordinates,
            brochure_url,
            project_size,
            created_at,
            updated_at,
            created_by,
            is_active,
            cover_image_url,
            amenities,
            is_featured,
            possession_date,
            rera_verified,
            rera_id,
            video_url,
            slug,
            developer_name,
            models:project_models(bhk_type, availability_status)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (projectsError) {
          throw new Error(`Failed to fetch projects: ${projectsError.message}`);
        }

        // Transform projects as before
        const transformedProjects = (rawProjects as RawProject[] || []).map(project => ({
          ...project,
          city: project.city?.[0] || { id: project.city_id || '', name: 'Unknown City' },
          locality: project.locality?.[0] || { id: project.locality_id || '', name: 'Unknown Location' },
          developer: Array.isArray(project.developer)
            ? (project.developer[0] || { id: project.developer_id || '', name: project.developer_name || 'Unknown Developer', phone: '' })
            : (project.developer || { id: project.developer_id || '', name: project.developer_name || 'Unknown Developer', phone: '' })
        }));
        setAllProjects(transformedProjects);

        // Fetch all project images
        const projectIds = transformedProjects.map(p => p.id);
        const { data: allImages, error: imagesError } = await supabase
          .from('project_images')
          .select('project_id, image_url, category')
          .in('project_id', projectIds);
        if (imagesError) {
          throw new Error(`Failed to fetch project images: ${imagesError.message}`);
        }
        // Group images by project_id
        const imagesMap: Record<string, { url: string; category?: string }[]> = {};
        (allImages || []).forEach(img => {
          if (!imagesMap[img.project_id]) imagesMap[img.project_id] = [];
          imagesMap[img.project_id].push({ url: img.image_url, category: img.category });
        });
        setProjectImagesMap(imagesMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjectsAndImages();
  }, []);

  // Fetch cities for filter options
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('id, name');
        if (error) throw error;
        const map: Record<string, string> = {};
        (data || []).forEach(city => { map[city.id] = city.name; });
        setCityMap(map);
      } catch (err) {
        console.error('Error fetching cities:', err);
      }
    };
    fetchCities();
  }, []);

  // Fetch localities
  useEffect(() => {
    const fetchLocalities = async () => {
      try {
        const { data, error } = await supabase
          .from('localities')
          .select('id, name');
        if (error) throw error;
        const map: Record<string, string> = {};
        (data || []).forEach(loc => { map[loc.id] = loc.name; });
        setLocalityMap(map);
      } catch (err) {
        console.error('Error fetching localities:', err);
      }
    };
    fetchLocalities();
  }, []);

  // Filter projects based on search query and filters
  const filteredProjects = useMemo(() => {
    return allProjects.filter(project => {
      // Search query filter
      const matchesSearch = searchQuery === '' || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.city?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.locality?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.developer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.project_highlights.some(highlight => highlight.toLowerCase().includes(searchQuery.toLowerCase()));

      // Price range filter
      const matchesPrice = project.price_range.min >= filters.priceRange[0] && 
                          project.price_range.max <= filters.priceRange[1];

      // Property type filter (based on models)
      const matchesPropertyType = filters.propertyType.length === 0 || 
        project.amenities.some(amenity => filters.propertyType.includes(amenity));

      // Bedrooms filter (based on models)
      const matchesBedrooms = filters.bedrooms.length === 0 || 
        project.amenities.some(amenity => 
          filters.bedrooms.includes(amenity)
        );

      // Location filter
      const matchesLocation = filters.location.length === 0 || 
        filters.location.some(loc => 
          project.locality?.name.toLowerCase().includes(loc.toLowerCase())
        );

      // City filter
      const matchesCity = filters.city.length === 0 || 
        filters.city.includes(project.city?.id || '');

      // Status filter
      const matchesStatus = filters.status.length === 0 || 
        filters.status.includes(project.construction_status);

      return matchesSearch && matchesPrice && matchesPropertyType && 
             matchesBedrooms && matchesLocation && matchesCity && matchesStatus;
    });
  }, [allProjects, searchQuery, filters]);

  const handleEnquirySubmit = (formData: { name: string; phone: string; message: string }) => {
    console.log('Enquiry submitted:', formData);
      setShowEnquiryModal(false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({
      priceRange: [0, 100000000],
      propertyType: [],
      bedrooms: [],
      location: [],
      city: [],
      status: [],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header with Search and Filters - Sticky below navbar */}
      <div className="bg-white shadow-sm sticky top-16 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3 items-center overflow-x-auto">
            {/* Search Bar */}
            <div className="flex-shrink-0 w-full max-w-xs">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, location, developer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#044ca3] focus:border-transparent"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#044ca3] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-red-600">Error</h3>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        ) : (
          <>
      {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
          <ListingCard
            key={project.id}
            project={project}
                  projectImages={projectImagesMap[project.id] || []}
                  localityName={localityMap[project.locality_id] || 'Unknown Locality'}
                  cityName={cityMap[project.city_id] || 'Unknown City'}
            onEnquire={() => {
              setSelectedProject(project);
              setShowEnquiryModal(true);
            }}
            onContact={() => {
              setSelectedProject(project);
              setShowContactModal(true);
            }}
          />
        ))}
      </div>

      {/* Empty State */}
            {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
          <p className="mt-2 text-gray-600">
            We couldn&apos;t find any projects matching your criteria.
          </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 text-[#044ca3] hover:text-[#033b7d] transition-colors"
                >
                  Clear all filters
                </button>
        </div>
      )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedProject && (
        <>
          <EnquiryModal
            isOpen={showEnquiryModal}
            onClose={() => setShowEnquiryModal(false)}
            onSubmit={handleEnquirySubmit}
            projectName={selectedProject.name}
          />
          <ContactModal
            isOpen={showContactModal}
            onClose={() => setShowContactModal(false)}
            projectName={selectedProject.name}
            developerName={selectedProject.developer?.name || ''}
            developerPhone={selectedProject.developer?.phone || ''}
          />
        </>
      )}
    </div>
  );
}