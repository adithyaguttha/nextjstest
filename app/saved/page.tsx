'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import PropertyCard from '../components/PropertyCard';

// This will be replaced with actual data from Supabase
const sampleSavedProperties = [
  {
    id: '1',
    title: 'Modern Apartment in Downtown',
    price: 450000,
    location: 'Downtown, City',
    imageUrl: '/sample-property.jpg',
    description: 'Beautiful modern apartment with stunning city views and premium amenities.',
    savedAt: '2024-03-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Suburban Family Home',
    price: 750000,
    location: 'Suburban Area',
    imageUrl: '/sample-property.jpg',
    description: 'Spacious family home with large backyard and modern amenities.',
    savedAt: '2024-03-14T15:45:00Z',
  },
];

export default function SavedPropertiesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [savedProperties, setSavedProperties] = useState(sampleSavedProperties);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?tab=login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const handleUnsave = (propertyId: string) => {
    // TODO: Implement unsave functionality with Supabase
    setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Saved Properties</h1>
          <p className="text-gray-600">
            {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>

        {savedProperties.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved properties yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring properties and save the ones you like!
            </p>
            <a
              href="/listings"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse Properties
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                isAuthenticated={true}
                isSaved={true}
                onSave={() => handleUnsave(property.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 