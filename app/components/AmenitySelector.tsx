'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Combobox } from '@headlessui/react';
import { supabase } from '../../lib/supabase';
import Image from 'next/image';

interface Amenity {
  id: string;
  name: string;
  category: string;
  description?: string;
  icon_url?: string | null;
  created_by?: string;
}

interface AmenitySelectorProps {
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
  className?: string;
}

const AmenitySelector: React.FC<AmenitySelectorProps> = ({
  selectedAmenities,
  onChange,
  className = '',
}) => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAmenities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('amenities')
        .select('id, name, category, description, icon_url')
        .order('category, name');

      if (error) throw error;
      setAmenities(data || []);
    } catch (err) {
      setError('Failed to load amenities');
      console.error('Error fetching amenities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  const filteredAmenities = query === ''
    ? amenities
    : amenities.filter((amenity) =>
        amenity.name.toLowerCase().includes(query.toLowerCase()) ||
        amenity.category.toLowerCase().includes(query.toLowerCase()) ||
        (amenity.description && amenity.description.toLowerCase().includes(query.toLowerCase()))
      );

  const handleSelect = (amenity: Amenity) => {
    const isSelected = selectedAmenities.includes(amenity.id);
    if (isSelected) {
      onChange(selectedAmenities.filter(id => id !== amenity.id));
    } else {
      onChange([...selectedAmenities, amenity.id]);
    }
  };

  const removeAmenity = (amenityId: string) => {
    onChange(selectedAmenities.filter(id => id !== amenityId));
  };

  if (loading) {
    return <div className="text-gray-500">Loading amenities...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className={className}>
      <Combobox value={selectedAmenities} onChange={() => {}} multiple>
        <div className="relative">
          <div className="relative w-full">
            <Combobox.Input
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={(selectedIds: string[]) => {
                const selectedNames = selectedIds
                  .map(id => amenities.find(a => a.id === id)?.name)
                  .filter(Boolean)
                  .join(', ');
                return selectedNames || 'Select amenities...';
              }}
              placeholder="Search amenities..."
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredAmenities.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filteredAmenities.map((amenity) => (
                <Combobox.Option
                  key={amenity.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-green-100 text-green-900' : 'text-gray-900'
                    }`
                  }
                  value={amenity}
                  onClick={() => handleSelect(amenity)}
                >
                  {({ selected }) => (
                    <div className="flex items-center">
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                      {amenity.icon_url && (
                        <span className="mr-2 flex-shrink-0">
                          <Image 
                            src={amenity.icon_url} 
                            alt={amenity.name} 
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain"
                          />
                        </span>
                      )}
                      <div>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {amenity.name}
                        </span>
                        <span className="block text-xs text-gray-500">{amenity.category}</span>
                      </div>
                    </div>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>

      {/* Selected Amenities Tags */}
      {selectedAmenities.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedAmenities.map((amenityId) => {
            const amenity = amenities.find(a => a.id === amenityId);
            if (!amenity) return null;
            return (
              <span
                key={amenityId}
                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
              >
                {amenity.icon_url && (
                  <Image 
                    src={amenity.icon_url} 
                    alt={amenity.name} 
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                )}
                {amenity.name}
                <button
                  type="button"
                  onClick={() => removeAmenity(amenityId)}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-green-200"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AmenitySelector; 