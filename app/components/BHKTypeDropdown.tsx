'use client';

import React, { useState } from 'react';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// BHK type options
const bhkOptions = [
  "1BHK",
  "2BHK",
  "3BHK",
  "4BHK",
  "5BHK",
  "6BHK"
];

interface BHKTypeDropdownProps {
  selectedBHK: string;
  onChange: (bhkType: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export default function BHKTypeDropdown({
  selectedBHK,
  onChange,
  placeholder = 'Select BHK type',
  className = '',
  error = false,
}: BHKTypeDropdownProps) {
  const [query, setQuery] = useState('');

  // Filter BHK types based on search query
  const filteredOptions = query === ''
    ? bhkOptions
    : bhkOptions.filter(option => 
        option.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className={className}>
      <Combobox value={selectedBHK} onChange={onChange}>
        <div className="relative">
          <div className={`relative w-full cursor-default overflow-hidden rounded-lg border ${
            error ? 'border-red-400' : 'border-gray-300'
          } bg-white text-left focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500`}>
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              placeholder={placeholder}
              displayValue={(selected: string) => selected}
              onChange={(event) => setQuery(event.target.value)}
            />
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
              filteredOptions.map((option) => (
                <Combobox.Option
                  key={option}
                  value={option}
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
                        {option}
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