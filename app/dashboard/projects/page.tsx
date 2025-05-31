'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon, ChevronUpIcon, ChevronDownIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import DeleteProjectModal from '../../components/DeleteProjectModal';

// Define the interface to match the Supabase query result structure
interface Project {
  id: string;
  name: string;
  developer: {
    name: string;
  } | null;
  city: {
    name: string;
  } | null;
  locality: {
    name: string;
  } | null;
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
  created_at: string;
  is_active: boolean;
}

type SortColumn = 'name' | 'created_at' | 'price_range->>min';
type SortDirection = 'asc' | 'desc';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('projects')
        .select(`
          id, 
          name, 
          developer:developer_id(name), 
          city:city_id(name), 
          locality:locality_id(name), 
          price_range,
          created_at,
          is_active
        `);

      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        const isActive = statusFilter === 'active';
        query = query.eq('is_active', isActive);
      }

      // Apply sorting
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      
      // Cast data to match our interface
      const typedData = (data || []) as unknown as Project[];
      setProjects(typedData);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortColumn, sortDirection]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle sort direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column with default sort direction
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowsUpDownIcon className="w-4 h-4 ml-1" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
      <ChevronDownIcon className="w-4 h-4 ml-1" />;
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete({ id: project.id, name: project.name });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (deleteMedia: boolean) => {
    if (!projectToDelete) return;

    try {
      setLoading(true);
      
      if (deleteMedia) {
        // Delete all media files from the project's folder
        const { data: mediaFiles, error: listError } = await supabase.storage
          .from('project-media')
          .list(projectToDelete.id);

        if (listError) throw listError;

        // Delete each file
        for (const file of mediaFiles) {
          const { error: deleteError } = await supabase.storage
            .from('project-media')
            .remove([`${projectToDelete.id}/${file.name}`]);
          
          if (deleteError) {
            console.error(`Error deleting file ${file.name}:`, deleteError);
          }
        }

        // Delete floor plans
        const { data: floorPlans, error: floorPlanListError } = await supabase.storage
          .from('floorplans')
          .list(projectToDelete.id);

        if (floorPlanListError) throw floorPlanListError;

        // Delete each floor plan
        for (const plan of floorPlans) {
          const { error: deleteError } = await supabase.storage
            .from('floorplans')
            .remove([`${projectToDelete.id}/${plan.name}`]);
          
          if (deleteError) {
            console.error(`Error deleting floor plan ${plan.name}:`, deleteError);
          }
        }
      }

      // Delete the project record (this will cascade delete related records)
      const { error } = await supabase.from('projects').delete().eq('id', projectToDelete.id);
      if (error) throw error;
      
      // Refresh the projects list
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      throw new Error('Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  // Filter projects by search term (client-side filtering)
  const filteredProjects = projects.filter(project => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      project.name.toLowerCase().includes(searchLower) ||
      (project.developer?.name?.toLowerCase() || '').includes(searchLower) ||
      (project.city?.name?.toLowerCase() || '').includes(searchLower) ||
      (project.locality?.name?.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-7xl">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all real estate projects in the system.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              href="/dashboard/create-project"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              Add Project
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Filters and search */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative rounded-md shadow-sm flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
            />
          </div>
          <div className="w-full sm:w-auto flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={() => {
                setSortColumn('created_at');
                setSortDirection('desc');
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center px-4 py-2">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Loading projects...</span>
                    </div>
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No projects found. {searchTerm ? 'Try different search terms or ' : ''}Create a new project to get started.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          <button 
                            onClick={() => handleSort('name')}
                            className="group inline-flex items-center font-semibold text-gray-900"
                          >
                            Project Name
                            {getSortIcon('name')}
                          </button>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Developer
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Location
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          <button 
                            onClick={() => handleSort('price_range->>min')}
                            className="group inline-flex items-center font-semibold text-gray-900"
                          >
                            Price Range
                            {getSortIcon('price_range->>min')}
                          </button>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          <button 
                            onClick={() => handleSort('created_at')}
                            className="group inline-flex items-center font-semibold text-gray-900"
                          >
                            Created
                            {getSortIcon('created_at')}
                          </button>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredProjects.map((project) => (
                        <tr key={project.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {project.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {project.developer?.name || 'Unknown Developer'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {project.locality?.name || 'Unknown Locality'}, {project.city?.name || 'Unknown City'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {project.price_range.currency} {project.price_range.min.toLocaleString()} - {project.price_range.max.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(project.created_at).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                project.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {project.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex justify-end space-x-2">
                              <Link
                                href={`/project/${project.id}`}
                                className="text-blue-600 hover:text-blue-900"
                                title="View"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </Link>
                              <Link
                                href={`/dashboard/projects/edit/${project.id}`}
                                className="text-green-600 hover:text-green-900"
                                title="Edit"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleDeleteClick(project)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add the DeleteProjectModal */}
        {projectToDelete && (
          <DeleteProjectModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setProjectToDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </div>
    </div>
  );
} 