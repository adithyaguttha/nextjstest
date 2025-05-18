'use client';

import React, { useState } from 'react';
import MultiSelectAmenityDropdown from './MultiSelectAmenityDropdown';

export default function AmenityMultiSelectExample() {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Select Amenities</h2>
      
      <MultiSelectAmenityDropdown
        selectedAmenities={selectedAmenities}
        onChange={setSelectedAmenities}
        placeholder="Search and select amenities..."
      />
      
      {selectedAmenities.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected amenities:</h3>
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
            {selectedAmenities.join(', ')}
          </div>
        </div>
      )}
      
      <div className="pt-2 text-right text-xs text-gray-500">
        {selectedAmenities.length} amenities selected
      </div>
    </div>
  );
} 