'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

type SavedProject = {
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
  saved_at: string;
};

type DatabaseProject = {
  id: string;
  name: string;
  cover_image_url: string;
  city: { name: string; }[];
  locality: { name: string; }[];
};

type DatabaseSavedProject = {
  id: string;
  saved_at: string;
  project: DatabaseProject;
};

export default function SavedProjects() {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedProjects();
  }, []);

  const fetchSavedProjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('saved_projects')
        .select(`
          id,
          saved_at,
          project:project_id (
            id,
            name,
            cover_image_url,
            city:city_id (name),
            locality:locality_id (name)
          )
        `)
        .eq('user_id', session.user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our SavedProject type
      const transformedData: SavedProject[] = (data as unknown as DatabaseSavedProject[] || []).map(item => ({
        id: item.id,
        saved_at: item.saved_at,
        project: {
          id: item.project.id,
          name: item.project.name,
          cover_image_url: item.project.cover_image_url,
          city: { name: item.project.city[0]?.name || 'Unknown City' },
          locality: { name: item.project.locality[0]?.name || 'Unknown Location' }
        }
      }));

      setSavedProjects(transformedData);
    } catch (err) {
      console.error('Error fetching saved projects:', err);
      toast.error('Failed to load saved projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (savedId: string) => {
    try {
      setRemovingId(savedId);
      const { error } = await supabase
        .from('saved_projects')
        .delete()
        .eq('id', savedId);

      if (error) throw error;

      setSavedProjects(prev => prev.filter(p => p.id !== savedId));
      toast.success('Project removed from saved list');
    } catch (err) {
      console.error('Error removing saved project:', err);
      toast.error('Failed to remove project');
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (savedProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No saved projects</h3>
        <p className="mt-2 text-gray-500">Projects you save will appear here.</p>
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
      {savedProjects.map((saved) => (
        <div
          key={saved.id}
          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <Link href={`/projects/${saved.project.id}`} className="block">
            <div className="relative h-48 w-full">
              <Image
                src={saved.project.cover_image_url || '/placeholder-project.jpg'}
                alt={saved.project.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {saved.project.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {saved.project.locality.name}, {saved.project.city.name}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Saved on {new Date(saved.saved_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
          <div className="px-4 pb-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleRemove(saved.id)}
              disabled={removingId === saved.id}
            >
              {removingId === saved.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2 fill-current" />
                  Remove
                </>
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
} 