'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ListingCard from '@/components/ListingCard';
import EnquiryModal from '@/components/EnquiryModal';
import ContactModal from '@/components/ContactModal';
import { supabase } from '@/lib/supabase';
import FilterBar, { FilterOptions } from '../components/FilterBar';
import { Suspense } from 'react';

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

// Add type for project model
type ProjectModel = {
  bhk_type: string;
};

// Create a client component wrapper
function ListingsPageClient() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('search') || '';
  const cityQuery = searchParams.get('city'); // Get city from query params
  const searchQuery = searchParams.get('query'); // Get search term from query params
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [projectImagesMap, setProjectImagesMap] = useState<Record<string, { url: string; category?: string }[]>>({});
  const [localityMap, setLocalityMap] = useState<Record<string, string>>({});
  const [cityMap, setCityMap] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<FilterOptions>({
    bhkTypes: [],
    budgetRange: [0, 100],
    possessionStatus: [],
    propertyTypes: [],
    developers: [],
    localities: [],
  });
  const [availableBhkTypes, setAvailableBhkTypes] = useState<string[]>([]);
  const [availableDevelopers, setAvailableDevelopers] = useState<{ id: string; name: string; }[]>([]);
  const [availableLocalities, setAvailableLocalities] = useState<{ id: string; name: string; city_id: string; }[]>([]);

  // Initialize filters from URL params
  useEffect(() => {
    const bhk = searchParams.get('bhk')?.split(',') || [];
    const budgetMin = Number(searchParams.get('budget_min')) || 0;
    const budgetMax = Number(searchParams.get('budget_max')) || 100;
    const status = searchParams.get('status')?.split(',') || [];
    const type = searchParams.get('type')?.split(',') || [];
    const developer = searchParams.get('developer')?.split(',') || [];
    const locality = searchParams.get('locality')?.split(',') || [];

    setFilters({
      bhkTypes: bhk,
      budgetRange: [budgetMin, budgetMax] as [number, number],
      possessionStatus: status,
      propertyTypes: type,
      developers: developer,
      localities: locality,
    });
  }, [searchParams]);

  // Fetch available filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch unique BHK types
        const { data: bhkData, error: bhkError } = await supabase
          .from('project_models')
          .select('bhk_type')
          .not('bhk_type', 'is', null)
          .order('bhk_type');
        
        if (!bhkError && bhkData) {
          const uniqueBhkTypes = [...new Set(bhkData.map((m: ProjectModel) => m.bhk_type))];
          setAvailableBhkTypes(uniqueBhkTypes);
        }

        // Fetch developers
        const { data: devData, error: devError } = await supabase
          .from('developers')
          .select('id, name')
          .order('name');
        
        if (!devError && devData) {
          setAvailableDevelopers(devData);
        }

        // Fetch localities
        const { data: locData, error: locError } = await supabase
          .from('localities')
          .select('id, name, city_id')
          .order('name');
        
        if (!locError && locData) {
          setAvailableLocalities(locData);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch all projects and images on mount (with city filter)
  useEffect(() => {
    const fetchProjectsAndImages = async () => {
      try {
        setLoading(true);
        let cityId: string | null = null;
        let localityIds: string[] = [];
        let cityIds: string[] = [];
        let developerIds: string[] = [];

        // Get locality_id from query params if present
        const localityIdParam = searchParams.get('locality_id');
        if (localityIdParam) {
          localityIds = [localityIdParam];
          // If we have a locality_id, get its city_id
          const { data: localityData, error: localityError } = await supabase
            .from('localities')
            .select('city_id')
            .eq('id', localityIdParam)
            .single();
          
          if (!localityError && localityData) {
            cityId = localityData.city_id;
          }
        } else if (cityQuery) {
          // If we have a city name, get city ID
          const { data: cityData, error: cityError } = await supabase
            .from('cities')
            .select('id')
            .eq('name', cityQuery)
            .single();
          
          if (cityError) throw new Error(`Failed to fetch city: ${cityError.message}`);
          cityId = cityData?.id || null;

          // If we have a search query and city ID, try to find matching locality
          if (cityId && searchQuery) {
            const { data: localityData, error: localityError } = await supabase
              .from('localities')
              .select('id')
              .ilike('name', `%${searchQuery}%`)
              .eq('city_id', cityId)
              .single();
            
            if (!localityError && localityData) {
              localityIds = [localityData.id];
            }
          }
        } else if (searchQuery) {
          // If only searchQuery is present, search for cities, localities, and developers
          // First, search for matching cities
          const { data: citiesData, error: citiesError } = await supabase
            .from('cities')
            .select('id')
            .ilike('name', `%${searchQuery}%`);

          if (!citiesError && citiesData) {
            cityIds = citiesData.map(city => city.id);
          }

          // Then search for matching localities
          const { data: localitiesData, error: localitiesError } = await supabase
            .from('localities')
            .select('id, city_id')
            .ilike('name', `%${searchQuery}%`);

          if (!localitiesError && localitiesData && localitiesData.length > 0) {
            localityIds = localitiesData.map(loc => loc.id);
            const localityCityIds = [...new Set(localitiesData.map(loc => loc.city_id))];
            cityIds = [...new Set([...cityIds, ...localityCityIds])];
          }

          // Finally, search for matching developers
          const { data: developersData, error: developersError } = await supabase
            .from('developers')
            .select('id')
            .ilike('name', `%${searchQuery}%`);

          if (!developersError && developersData) {
            developerIds = developersData.map(dev => dev.id);
          }
        }

        // Fetch projects with all filters
        let query = supabase
          .from('projects')
          .select(`
            id, name, developer_id, city_id, locality_id,
            developer:developer_id(name, phone), 
            city:city_id(name), 
            locality:locality_id(name), 
            price_range, emi_details, construction_status, project_highlights,
            location_coordinates, brochure_url, project_size, created_at, updated_at, created_by, is_active, cover_image_url, amenities, is_featured, possession_date, rera_verified, rera_id, video_url, slug, developer_name, models:project_models(bhk_type, availability_status)
          `)
          .eq('is_active', true);

        // Apply city filter
        if (cityId) {
          query = query.eq('city_id', cityId);
        } else if (cityIds.length > 0) {
          query = query.in('city_id', cityIds);
        }

        // Apply locality filter
        if (localityIds.length > 0) {
          query = query.in('locality_id', localityIds);
        } else if (filters.localities.length > 0) {
          query = query.in('locality_id', filters.localities);
        }

        // Apply developer filter
        if (developerIds.length > 0) {
          query = query.in('developer_id', developerIds);
        } else if (filters.developers.length > 0) {
          query = query.in('developer_id', filters.developers);
        }

        // Apply BHK type filter
        if (filters.bhkTypes.length > 0) {
          // First get project IDs that have the selected BHK types
          const { data: projectIdsWithBhk, error: bhkError } = await supabase
            .from('project_models')
            .select('project_id')
            .in('bhk_type', filters.bhkTypes);

          if (bhkError) throw bhkError;

          // If we found projects with these BHK types, filter by their IDs
          if (projectIdsWithBhk && projectIdsWithBhk.length > 0) {
            const uniqueProjectIds = [...new Set(projectIdsWithBhk.map(p => p.project_id))];
            query = query.in('id', uniqueProjectIds);
          } else {
            // If no projects found with these BHK types, return empty result
            query = query.eq('id', 'none');
          }
        }

        // Apply budget range filter
        if (filters.budgetRange[0] > 0 || filters.budgetRange[1] < 100) {
          query = query.gte('price_range->min', filters.budgetRange[0])
            .lte('price_range->max', filters.budgetRange[1]);
        }

        // Apply possession status filter
        if (filters.possessionStatus.length > 0) {
          query = query.in('construction_status', filters.possessionStatus);
        }

        // Apply property type filter
        if (filters.propertyTypes.length > 0) {
          query = query.in('property_type', filters.propertyTypes);
        }

        // If no specific filters match, search by project name or developer
        if (!cityId && cityIds.length === 0 && localityIds.length === 0 && developerIds.length === 0 && 
            filters.localities.length === 0 && filters.developers.length === 0 && searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,developer_name.ilike.%${searchQuery}%`);
        }

        const { data: rawProjects, error: projectsError } = await query;
        if (projectsError) throw new Error(`Failed to fetch projects: ${projectsError.message}`);
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
        if (imagesError) throw new Error(`Failed to fetch project images: ${imagesError.message}`);
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
  }, [cityQuery, searchQuery, searchParams, filters]);

  // Fetch cities and localities for mapping
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase.from('cities').select('id, name');
        if (error) throw error;
        const map: Record<string, string> = {};
        (data || []).forEach(city => { map[city.id] = city.name; });
        setCityMap(map);
      } catch (err) { console.error('Error fetching cities:', err); }
    };
    fetchCities();
  }, []);
  useEffect(() => {
    const fetchLocalities = async () => {
      try {
        const { data, error } = await supabase.from('localities').select('id, name');
        if (error) throw error;
        const map: Record<string, string> = {};
        (data || []).forEach(loc => { map[loc.id] = loc.name; });
        setLocalityMap(map);
      } catch (err) { console.error('Error fetching localities:', err); }
    };
    fetchLocalities();
  }, []);

  const handleEnquirySubmit = (formData: { name: string; phone: string; message: string }) => {
    console.log('Enquiry submitted:', formData);
      setShowEnquiryModal(false);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <FilterBar
              onFilterChange={handleFilterChange}
              initialFilters={filters}
              availableBhkTypes={availableBhkTypes}
              availableDevelopers={availableDevelopers}
              availableLocalities={availableLocalities}
            />
          </div>

          {/* Projects Grid - Full width on mobile */}
          <div className="col-span-1 lg:col-span-3">
            {/* Mobile Filter Button and Panel */}
            <div className="lg:hidden">
              <FilterBar
                onFilterChange={handleFilterChange}
                initialFilters={filters}
                availableBhkTypes={availableBhkTypes}
                availableDevelopers={availableDevelopers}
                availableLocalities={availableLocalities}
              />
            </div>

            {urlQuery && (
              <h2 className="text-2xl font-semibold mb-6">Showing results for &quot;{urlQuery}&quot;</h2>
            )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allProjects.map((project) => (
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
                {allProjects.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                    <p className="mt-2 text-gray-600">Try adjusting your filters or search criteria.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
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
    </main>
  );
}

// Server component that wraps the client component in Suspense
export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#044ca3] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ListingsPageClient />
    </Suspense>
  );
}