'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import ProjectSection from '@/components/ProjectSection';
import EnquiryModal from '@/components/EnquiryModal';
import ContactModal from '@/components/ContactModal';
import { Toaster } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import SearchBox from './components/SearchBox';
import DeveloperCard, { type Developer } from './components/DeveloperCard';
import Footer from './components/Footer';

// Type for raw database response
type RawProject = Omit<Project, 'city' | 'locality' | 'developer'> & {
  city: { id: string; name: string; }[];
  locality: { id: string; name: string; }[];
  developer: { id: string; name: string; phone: string; }[];
};

export default function HomePage() {
  // State management
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [projectImagesMap, setProjectImagesMap] = useState<Record<string, { url: string; category?: string }[]>>({});
  const [localityMap, setLocalityMap] = useState<Record<string, string>>({});
  const [cityMap, setCityMap] = useState<Record<string, string>>({});
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loadingDevelopers, setLoadingDevelopers] = useState(true);

  // Fetch projects and images from database
  useEffect(() => {
    const fetchProjectsAndImages = async () => {
      try {
        setLoading(true);
        
        // Fetch featured projects first
        const { data: featuredRawProjects, error: featuredError } = await supabase
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
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (featuredError) throw featuredError;

        // If no featured projects, fetch recent projects instead
        let projectsToShow = featuredRawProjects;
        if (!projectsToShow || projectsToShow.length === 0) {
          const { data: recentRawProjects, error: recentError } = await supabase
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
            .order('created_at', { ascending: false })
            .limit(6);

          if (recentError) throw recentError;
          projectsToShow = recentRawProjects;
        }

        // Transform featured/recent projects
        const transformedFeaturedProjects = (projectsToShow as RawProject[] || []).map(project => ({
          ...project,
          city: project.city?.[0] || { id: project.city_id || '', name: 'Unknown City' },
          locality: project.locality?.[0] || { id: project.locality_id || '', name: 'Unknown Location' },
          developer: Array.isArray(project.developer)
            ? (project.developer[0] || { id: project.developer_id || '', name: project.developer_name || 'Unknown Developer', phone: '' })
            : (project.developer || { id: project.developer_id || '', name: project.developer_name || 'Unknown Developer', phone: '' })
        }));
        setFeaturedProjects(transformedFeaturedProjects);

        // Fetch recent projects (excluding featured ones)
        const { data: recentRawProjects, error: recentError } = await supabase
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
          .neq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (recentError) throw recentError;

        // Transform recent projects
        const transformedRecentProjects = (recentRawProjects as RawProject[] || []).map(project => ({
          ...project,
          city: project.city?.[0] || { id: project.city_id || '', name: 'Unknown City' },
          locality: project.locality?.[0] || { id: project.locality_id || '', name: 'Unknown Location' },
          developer: Array.isArray(project.developer)
            ? (project.developer[0] || { id: project.developer_id || '', name: project.developer_name || 'Unknown Developer', phone: '' })
            : (project.developer || { id: project.developer_id || '', name: project.developer_name || 'Unknown Developer', phone: '' })
        }));
        setRecentProjects(transformedRecentProjects);

        // Fetch all project images
        const allProjects = [...transformedFeaturedProjects, ...transformedRecentProjects];
        const projectIds = allProjects.map(p => p.id);
        const { data: allImages, error: imagesError } = await supabase
          .from('project_images')
          .select('project_id, image_url, category')
          .in('project_id', projectIds);

        if (imagesError) throw imagesError;

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

  // Fetch cities for mapping
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

  // Fetch localities for mapping
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

  // Fetch developers dynamically
  useEffect(() => {
    const fetchDevelopers = async () => {
      setLoadingDevelopers(true);
      const { data, error } = await supabase
        .from('developers')
        .select('id, name, logo_url, description, phone');
      if (!error && data) {
        setDevelopers(data);
      }
      setLoadingDevelopers(false);
    };
    fetchDevelopers();
  }, []);

  const handleEnquirySubmit = (formData: { name: string; phone: string; message: string }) => {
    console.log('Enquiry submitted:', formData);
    setShowEnquiryModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#044ca3]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600">Error</h3>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Hero Section */}
      <section className="relative h-[360px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("/assets/hero.png")',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            Find Your Dream Property
          </h1>
          <p className="text-lg sm:text-xl text-white mb-6 sm:mb-8 max-w-2xl mx-auto">
            Discover the perfect home across India&apos;s top cities
          </p>
          <div className="hero-search-container w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl mx-auto">
          <SearchBox />
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <ProjectSection
        title={featuredProjects.length > 0 ? "Featured Projects" : "Latest Projects"}
        projects={featuredProjects}
        projectImagesMap={projectImagesMap}
        localityMap={localityMap}
        cityMap={cityMap}
        onEnquire={(project) => {
          setSelectedProject(project);
          setShowEnquiryModal(true);
        }}
        onContact={(project) => {
          setSelectedProject(project);
          setShowContactModal(true);
        }}
      />

      {/* Recently Added Projects Section */}
      <ProjectSection
        title="Recently Added Projects"
        projects={recentProjects}
        projectImagesMap={projectImagesMap}
        localityMap={localityMap}
        cityMap={cityMap}
        onEnquire={(project) => {
          setSelectedProject(project);
          setShowEnquiryModal(true);
        }}
        onContact={(project) => {
          setSelectedProject(project);
          setShowContactModal(true);
        }}
      />

      {/* Popular Developers Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Popular Developers</h2>
          {loadingDevelopers ? (
            <div>Loading developers...</div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {developers.map((developer) => (
              <DeveloperCard key={developer.id} developer={developer} />
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />

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
