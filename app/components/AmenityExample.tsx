'use client';

import React, { useState } from 'react';
import SearchableAmenityDropdown from './SearchableAmenityDropdown';

export default function AmenityExample() {
  const [selectedAmenityId, setSelectedAmenityId] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Select Amenity</h2>
      
      <SearchableAmenityDropdown
        selectedAmenity={selectedAmenityId}
        onSelect={setSelectedAmenityId}
        placeholder="Search for an amenity..."
      />
      
      {selectedAmenityId && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Selected amenity ID: <span className="font-medium">{selectedAmenityId}</span>
          </p>
        </div>
      )}
    </div>
  );
} 