'use client';

import React, { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

interface Amenity {
  id: string;
  name: string;
}

interface SearchableAmenityDropdownProps {
  selectedAmenity: string | null;
  onSelect: (amenityId: string | null) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchableAmenityDropdown({
  selectedAmenity,
  onSelect,
  placeholder = 'Select an amenity',
  className = '',
}: SearchableAmenityDropdownProps) {
  const [query, setQuery] = useState('');
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch amenities on mount
  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('amenities')
        .select('id, name')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      setAmenities(data || []);
    } catch (error) {
      console.error('Error fetching amenities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter amenities based on search query
  const filteredAmenities = query === ''
    ? amenities
    : amenities.filter(amenity => 
        amenity.name.toLowerCase().includes(query.toLowerCase())
      );

  // Get name of selected amenity
  const getSelectedAmenityName = () => {
    if (!selectedAmenity) return '';
    const amenity = amenities.find(amenity => amenity.id === selectedAmenity);
    return amenity?.name || '';
  };

  return (
    <div className={className}>
      <Combobox value={selectedAmenity} onChange={onSelect}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg border border-gray-300 bg-white text-left focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              placeholder={loading ? "Loading amenities..." : placeholder}
              displayValue={getSelectedAmenityName}
              onChange={(event) => setQuery(event.target.value)}
              disabled={loading}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
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
                  value={amenity.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-green-100 text-green-900' : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {amenity.name}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-green-600' : 'text-green-600'
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
} 