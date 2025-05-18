'use client';

import React from 'react';
import type { ProjectFormData } from '../page';
import AmenityMultiSelect from '../../../components/AmenityMultiSelect';

interface AmenitiesFeaturesProps {
  formData: ProjectFormData;
  updateFormData: (data: Partial<ProjectFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const AmenitiesFeatures: React.FC<AmenitiesFeaturesProps> = ({
  formData,
  updateFormData,
  onNext,
  onBack,
}) => {
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleNext} className="space-y-8">
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2">
            Project Amenities (Optional)
          </h2>
          <p className="text-sm text-gray-500">
            Search and select the amenities that will be available in your project. You can skip this step if your project doesn't have any amenities.
          </p>
        </div>
        
        <AmenityMultiSelect
          selectedAmenities={formData.amenities}
          onChange={(amenities) => {
            updateFormData({ amenities });
          }}
          placeholder="Search amenities by name..."
          className="w-full"
        />
        
        <div className="mt-4 text-sm text-gray-600 flex justify-between">
          <span>Tip: Type to search more amenities</span>
          <span className="font-medium">{formData.amenities.length} selected</span>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Back
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default AmenitiesFeatures; 