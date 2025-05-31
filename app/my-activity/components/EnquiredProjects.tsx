'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';

type EnquiryStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

type Enquiry = {
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
  status: EnquiryStatus;
  message: string;
  created_at: string;
  developer_notes?: string;
};

type DatabaseProject = {
  id: string;
  name: string;
  cover_image_url: string;
  city: { name: string; }[];
  locality: { name: string; }[];
};

type DatabaseEnquiry = {
  id: string;
  status: EnquiryStatus;
  message: string;
  created_at: string;
  developer_notes?: string;
  project: DatabaseProject;
};

const statusColors: Record<EnquiryStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels: Record<EnquiryStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export default function EnquiredProjects() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('project_enquiries')
        .select(`
          id,
          status,
          message,
          created_at,
          developer_notes,
          project:project_id (
            id,
            name,
            cover_image_url,
            city:city_id (name),
            locality:locality_id (name)
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Enquiry type
      const transformedData: Enquiry[] = (data as unknown as DatabaseEnquiry[] || []).map(item => ({
        id: item.id,
        status: item.status,
        message: item.message,
        created_at: item.created_at,
        developer_notes: item.developer_notes,
        project: {
          id: item.project.id,
          name: item.project.name,
          cover_image_url: item.project.cover_image_url,
          city: { name: item.project.city[0]?.name || 'Unknown City' },
          locality: { name: item.project.locality[0]?.name || 'Unknown Location' }
        }
      }));

      setEnquiries(transformedData);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      toast.error('Failed to load enquiries');
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

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No enquiries yet</h3>
        <p className="mt-2 text-gray-500">Your project enquiries will appear here.</p>
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
    <div className="space-y-6">
      {enquiries.map((enquiry) => (
        <div
          key={enquiry.id}
          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link href={`/projects/${enquiry.project.id}`} className="block">
                  <h3 className="font-semibold text-lg text-gray-900 hover:text-primary">
                    {enquiry.project.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {enquiry.project.locality.name}, {enquiry.project.city.name}
                  </p>
                </Link>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Your Message:</span> {enquiry.message}
                  </p>
                  {enquiry.developer_notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Developer&apos;s Response:</span> {enquiry.developer_notes}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Enquired on {new Date(enquiry.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="ml-4">
                <Badge className={statusColors[enquiry.status]}>
                  {statusLabels[enquiry.status]}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 