'use client';

import { useParams } from 'next/navigation';

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.id;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Project Details</h1>
          <p className="text-gray-600">Project ID: {projectId}</p>
        </div>

        {/* Project Images */}
        <div className="mb-8 rounded-lg overflow-hidden">
          <div className="aspect-w-16 aspect-h-9 bg-gray-100">
            {/* Image carousel will go here */}
          </div>
        </div>

        {/* Project Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600">
                Project description will be loaded here...
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Details</h3>
              <div className="space-y-4">
                {/* Project details will go here */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}