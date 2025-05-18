'use client';

import React, { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

interface Amenity {
  id: string;
  name: string;
}

interface MultiSelectAmenityDropdownProps {
  selectedAmenities: string[];
  onChange: (amenityIds: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelectAmenityDropdown({
  selectedAmenities,
  onChange,
  placeholder = 'Select amenities',
  className = '',
}: MultiSelectAmenityDropdownProps) {
  const [query, setQuery] = useState('');
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

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

  const toggleAmenity = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      onChange(selectedAmenities.filter(id => id !== amenityId));
    } else {
      onChange([...selectedAmenities, amenityId]);
    }
  };

  const removeAmenity = (amenityId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from bubbling up
    onChange(selectedAmenities.filter(id => id !== amenityId));
  };

  return (
    <div className={className}>
      <div className="relative">
        {/* Input field */}
        <div 
          className="relative w-full cursor-pointer overflow-hidden rounded-lg border border-gray-300 bg-white text-left focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500"
          onClick={() => setOpen(true)}
        >
          <input
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
            placeholder={loading ? "Loading amenities..." : placeholder}
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            onClick={() => setOpen(true)}
            onFocus={() => setOpen(true)}
          />
          <button 
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-2"
            onClick={() => setOpen(!open)}
          >
            <ChevronDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Dropdown options */}
        {open && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredAmenities.length === 0 && query !== '' ? (
              <li className="relative cursor-default select-none py-2 px-4 text-gray-700">
                Nothing found.
              </li>
            ) : (
              filteredAmenities.map((amenity) => (
                <li
                  key={amenity.id}
                  className={`relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    selectedAmenities.includes(amenity.id) ? 'bg-green-50 font-medium' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    toggleAmenity(amenity.id);
                    setQuery(''); // Clear the search after selection
                  }}
                >
                  <span className="block truncate">
                    {amenity.name}
                  </span>
                  {selectedAmenities.includes(amenity.id) && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Selected amenities */}
      {selectedAmenities.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedAmenities.map(id => {
            const amenity = amenities.find(a => a.id === id);
            if (!amenity) return null;
            
            return (
              <div 
                key={id}
                className="flex items-center gap-1 bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-sm"
              >
                <span>{amenity.name}</span>
                <button
                  type="button"
                  onClick={(e) => removeAmenity(id, e)}
                  className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-green-600 hover:bg-green-200 hover:text-green-900 focus:outline-none focus:bg-green-500 focus:text-white"
                >
                  <span className="sr-only">Remove {amenity.name}</span>
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 