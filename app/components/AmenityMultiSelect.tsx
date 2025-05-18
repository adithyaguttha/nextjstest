'use client';

import React, { useState } from 'react';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Amenity options - these should match the ENUM values in the database
const amenityOptions = [
  'Swimming Pool',
  'Gym',
  'Garden',
  'Parking',
  'Security',
  'Power Backup',
  'Lift',
  'Club House',
  'Children\'s Play Area',
  'Indoor Games',
  'Outdoor Sports',
  'Party Hall',
  'Community Hall',
  'Rain Water Harvesting',
  'Solar Power',
  'Vaastu Compliant',
  'Pet Friendly',
  'Senior Citizen Friendly',
  'Wheelchair Accessible',
  '24/7 Water Supply',
  'Intercom',
  'CCTV Surveillance',
  'Fire Safety',
  'Gas Pipeline',
  'Shopping Center',
  'School',
  'Hospital',
  'Bank',
  'Restaurant',
  'Public Transport'
] as const;

export type Amenity = typeof amenityOptions[number];

interface AmenityMultiSelectProps {
  selectedAmenities: Amenity[];
  onChange: (amenities: Amenity[]) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export default function AmenityMultiSelect({
  selectedAmenities,
  onChange,
  placeholder = 'Select amenities',
  className = '',
  error = false,
}: AmenityMultiSelectProps) {
  const [query, setQuery] = useState('');

  // Filter amenities based on search query
  const filteredOptions = query === ''
    ? amenityOptions
    : amenityOptions.filter(option => 
        option.toLowerCase().includes(query.toLowerCase())
      );

  const removeAmenity = (amenity: Amenity) => {
    onChange(selectedAmenities.filter(a => a !== amenity));
  };

  return (
    <div className={className}>
      <Combobox value={selectedAmenities} onChange={(value: Amenity[]) => onChange(value)} multiple>
        <div className="relative">
          <div className={`relative w-full cursor-default overflow-hidden rounded-lg border ${
            error ? 'border-red-400' : 'border-gray-300'
          } bg-white text-left focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500`}>
            {/* Selected amenities chips */}
            <div className="flex flex-wrap gap-1 p-1">
              {selectedAmenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm px-2 py-1 rounded"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAmenity(amenity);
                    }}
                    className="hover:text-green-900"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
              <Combobox.Input
                className="flex-1 border-none py-2 pl-2 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 min-w-[120px]"
                placeholder={selectedAmenities.length === 0 ? placeholder : ''}
                onChange={(event) => setQuery(event.target.value)}
                displayValue={() => query}
              />
            </div>
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filteredOptions.map((amenity) => (
                <Combobox.Option
                  key={amenity}
                  value={amenity}
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
                        {amenity}
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