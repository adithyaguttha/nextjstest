'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

type SeenProject = {
  id: string;
  project: {
    id: string;
    name: string;
    cover_image_url: string;
    city: {
      name: string;
    };
    locality: {
      name: string;
    };
  };
  viewed_at: string;
};

type DatabaseProject = {
  id: string;
  name: string;
  cover_image_url: string;
  city: { name: string; }[];
  locality: { name: string; }[];
};

type DatabaseSeenProject = {
  id: string;
  viewed_at: string;
  project: DatabaseProject;
};

export default function SeenProjects() {
  const [seenProjects, setSeenProjects] = useState<SeenProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSeenProjects();
  }, []);

  const fetchSeenProjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('seen_projects')
        .select(`
          id,
          viewed_at,
          project:project_id (
            id,
            name,
            cover_image_url,
            city:city_id (name),
            locality:locality_id (name)
          )
        `)
        .eq('user_id', session.user.id)
        .order('viewed_at', { ascending: false })
        .limit(50); // Limit to last 50 viewed projects

      if (error) throw error;

      // Transform the data to match our SeenProject type
      const transformedData: SeenProject[] = (data as unknown as DatabaseSeenProject[] || []).map(item => ({
        id: item.id,
        viewed_at: item.viewed_at,
        project: {
          id: item.project.id,
          name: item.project.name,
          cover_image_url: item.project.cover_image_url,
          city: { name: item.project.city[0]?.name || 'Unknown City' },
          locality: { name: item.project.locality[0]?.name || 'Unknown Location' }
        }
      }));

      setSeenProjects(transformedData);
    } catch (err) {
      console.error('Error fetching seen projects:', err);
      toast.error('Failed to load recently viewed projects');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (seenProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No recently viewed projects</h3>
        <p className="mt-2 text-gray-500">Projects you view will appear here.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.href = '/listings'}
        >
          Browse Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {seenProjects.map((seen) => (
        <div
          key={seen.id}
          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <Link href={`/projects/${seen.project.id}`} className="block">
            <div className="relative h-48 w-full">
              <Image
                src={seen.project.cover_image_url || '/placeholder-project.jpg'}
                alt={seen.project.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {seen.project.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {seen.project.locality.name}, {seen.project.city.name}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Viewed {new Date(seen.viewed_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
} 