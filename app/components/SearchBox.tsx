'use client';

import { useState } from 'react';

type Location = {
  id: string;
  name: string;
  state: string;
};

const locations: Location[] = [
  { id: '1', name: 'Mumbai', state: 'Maharashtra' },
  { id: '2', name: 'Delhi', state: 'Delhi' },
  { id: '3', name: 'Bangalore', state: 'Karnataka' },
  { id: '4', name: 'Hyderabad', state: 'Telangana' },
  { id: '5', name: 'Chennai', state: 'Tamil Nadu' },
];

export default function SearchBox() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by location..."
          className="w-full px-4 py-3 text-gray-700 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 text-white bg-[#044ca3] rounded-md hover:bg-[#033b7d] transition-colors"
        >
          Search
        </button>
      </div>

      {isOpen && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
          <ul className="py-1 overflow-auto max-h-60">
            {filteredLocations.map((location) => (
              <li
                key={location.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSearchTerm(location.name);
                  setIsOpen(false);
                }}
              >
                <div className="font-medium">{location.name}</div>
                <div className="text-sm text-gray-500">{location.state}</div>
              </li>
            ))}
            {filteredLocations.length === 0 && (
              <li className="px-4 py-2 text-gray-500">No locations found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}