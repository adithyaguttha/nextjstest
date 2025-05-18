'use client';

import React, { useState } from 'react';
import type { ProjectFormData } from '../page';
import { supabase } from '../../../../lib/supabase';
import { ArrowRightIcon, ArrowLeftIcon, PlusIcon, TrashIcon, PhotoIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import BHKTypeDropdown from '../../../components/BHKTypeDropdown';
import { toast } from 'react-hot-toast';

const priceUnits = ['Rupees', 'Lakhs', 'Crores'];

interface Model {
  bhk_type: string;
  super_built_up_area: number | string;
  carpet_area: number | string;
  price: number | string;
  price_unit: string;
  price_per_sqft: number | string;
  price_per_sqft_unit: string;
  availability_status: 'available' | 'sold_out' | 'coming_soon';
  floor_plan_url: string;
  specifications: {
    bedrooms: number | string;
    bathrooms: number | string;
    balconies: number | string;
    parking: number | string;
  };
}

const emptyModel: Model = {
  bhk_type: '',
  super_built_up_area: '',
  carpet_area: '',
  price: '',
  price_unit: 'Rupees',
  price_per_sqft: '',
  price_per_sqft_unit: 'Rupees',
  availability_status: 'available',
  floor_plan_url: '',
  specifications: {
    bedrooms: '',
    bathrooms: '',
    balconies: '',
    parking: '',
  },
};

interface ModelsPricingProps {
  formData: {
    models: Model[];
    [key: string]: any;
  };
  updateFormData: (data: Partial<{ models: Model[] }>) => void;
  onNext: () => void;
  onBack: () => void;
  projectId?: string;
}

interface ModelValidationErrors {
  bhk_type?: string;
  super_built_up_area?: string;
  carpet_area?: string;
  price?: string;
  price_per_sqft?: string;
  specifications?: {
    bedrooms?: string;
    bathrooms?: string;
    balconies?: string;
    parking?: string;
  };
}

const ModelsPricing: React.FC<ModelsPricingProps> = ({ formData, updateFormData, onNext, onBack, projectId }) => {
  const [errors, setErrors] = useState<{ [key: number]: ModelValidationErrors }>({});
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [expandedModels, setExpandedModels] = useState<{ [key: number]: boolean }>({});

  // Helper function to calculate price per sqft
  const calculatePricePerSqft = (price: number, area: number): number => {
    if (!price || !area || area === 0) return 0;
    return Math.round((price / area) * 100) / 100; // Round to 2 decimal places
  };

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const validateModel = (model: any, index: number): ModelValidationErrors => {
    const modelErrors: ModelValidationErrors = {};

    if (!model.bhk_type?.trim()) {
      modelErrors.bhk_type = 'BHK type is required';
    }

    // Convert string values to numbers, handling empty strings
    const superBuiltUpArea = model.super_built_up_area === '' ? 0 : Number(model.super_built_up_area);
    const carpetArea = model.carpet_area === '' ? 0 : Number(model.carpet_area);
    const price = model.price === '' ? 0 : Number(model.price);

    if (!superBuiltUpArea || superBuiltUpArea <= 0) {
      modelErrors.super_built_up_area = 'Super built-up area must be greater than 0';
    }

    if (!carpetArea || carpetArea <= 0) {
      modelErrors.carpet_area = 'Carpet area must be greater than 0';
    }

    if (carpetArea > superBuiltUpArea) {
      modelErrors.carpet_area = 'Carpet area cannot be greater than super built-up area';
    }

    if (!price || price <= 0) {
      modelErrors.price = 'Price must be greater than 0';
    }

    // Validate specifications
    modelErrors.specifications = {};
    const bedrooms = model.specifications.bedrooms === '' ? 0 : Number(model.specifications.bedrooms);
    const bathrooms = model.specifications.bathrooms === '' ? 0 : Number(model.specifications.bathrooms);
    const balconies = model.specifications.balconies === '' ? 0 : Number(model.specifications.balconies);
    const parking = model.specifications.parking === '' ? 0 : Number(model.specifications.parking);

    if (!bedrooms || bedrooms < 0) {
      modelErrors.specifications.bedrooms = 'Number of bedrooms is required';
    }
    if (!bathrooms || bathrooms < 0) {
      modelErrors.specifications.bathrooms = 'Number of bathrooms is required';
    }
    if (balconies < 0) {
      modelErrors.specifications.balconies = 'Number of balconies cannot be negative';
    }
    if (parking < 0) {
      modelErrors.specifications.parking = 'Number of parking spaces cannot be negative';
    }

    // Only include specifications errors if there are any
    if (Object.keys(modelErrors.specifications).length === 0) {
      delete modelErrors.specifications;
    }

    return modelErrors;
  };

  const handleModelChange = (idx: number, field: string, value: any) => {
    const updatedModels = formData.models.map((model, i) => {
      if (i === idx) {
        // Keep empty string values as is, only convert to number when needed
        let processedValue = value;
        if (field === 'super_built_up_area' || field === 'carpet_area' || field === 'price') {
          processedValue = value === '' ? '' : Number(value) || 0;
        }

        const updatedModel = { ...model, [field]: processedValue };

        // Auto-calculate price per sqft when price or area changes
        if (field === 'price' || field === 'super_built_up_area') {
          const price = field === 'price' ? (value === '' ? 0 : Number(value) || 0) : Number(model.price) || 0;
          const area = field === 'super_built_up_area' ? (value === '' ? 0 : Number(value) || 0) : Number(model.super_built_up_area) || 0;
          const pricePerSqft = calculatePricePerSqft(price, area);
          updatedModel.price_per_sqft = pricePerSqft;
        }

        return updatedModel;
      }
      return model;
    });

    updateFormData({ models: updatedModels });
    // Clear errors for this field
    setErrors(prev => ({
      ...prev,
      [idx]: { ...prev[idx], [field]: undefined }
    }));
  };

  const handleSpecChange = (idx: number, spec: string, value: any) => {
    const updatedModels = formData.models.map((model, i) =>
      i === idx ? {
        ...model,
        specifications: {
          ...model.specifications,
          [spec]: value === '' ? '' : Number(value) || 0
        }
      } : model
    );
    updateFormData({ models: updatedModels });
    // Clear errors for this specification
    setErrors(prev => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        specifications: { ...prev[idx]?.specifications, [spec]: undefined }
      }
    }));
  };

  const toggleModelExpansion = (idx: number) => {
    setExpandedModels(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const addModel = () => {
    const newModelIndex = formData.models.length;
    // Collapse all existing models
    const newExpandedModels = Object.keys(expandedModels).reduce((acc, key) => ({
      ...acc,
      [key]: false
    }), {});
    // Expand the new model
    setExpandedModels({
      ...newExpandedModels,
      [newModelIndex]: true
    });
    updateFormData({ models: [...formData.models, { ...emptyModel }] });
  };

  const removeModel = (idx: number) => {
    // Remove the model and its expansion state
    const newExpandedModels = { ...expandedModels };
    delete newExpandedModels[idx];
    // Shift all expansion states down by one for models after the removed one
    const updatedExpandedModels = Object.keys(newExpandedModels).reduce((acc, key) => {
      const numKey = parseInt(key);
      if (numKey > idx) {
        acc[numKey - 1] = newExpandedModels[numKey];
      } else {
        acc[numKey] = newExpandedModels[numKey];
      }
      return acc;
    }, {} as { [key: number]: boolean });
    setExpandedModels(updatedExpandedModels);
    updateFormData({ models: formData.models.filter((_, i) => i !== idx) });
  };

  const validateAllModels = (): boolean => {
    const newErrors: { [key: number]: ModelValidationErrors } = {};
    let hasErrors = false;

    formData.models.forEach((model, index) => {
      const modelErrors = validateModel(model, index);
      if (Object.keys(modelErrors).length > 0) {
        newErrors[index] = modelErrors;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleNext = async () => {
    if (formData.models.length === 0) {
      toast.error('Please add at least one model');
      return;
    }

    if (!validateAllModels()) {
      toast.error('Please fix the errors in the model details');
      return;
    }

    try {
      onNext();
    } catch (error) {
      console.error('Error in models validation:', error);
      toast.error('Failed to process model data. Please try again.');
    }
  };

  // Floor plan upload with structured path
  const handleFloorPlanUpload = async (idx: number, file: File) => {
    setUploadingIdx(idx);
    setUploadError(null);
    const ext = file.name.split('.').pop();
    // Try to get projectId from props, modelId if available, fallback to bhk_type
    const project = projectId || 'unknown-project';
    const model = formData.models[idx];
    const modelId = (model as any).id || model.bhk_type || `model${idx+1}`;
    const fileName = `floorplan-${Date.now()}.${ext}`;
    const filePath = `${project}/${modelId}/${fileName}`;
    const { data, error } = await supabase.storage.from('floorplans').upload(filePath, file, { upsert: true });
    if (error) {
      setUploadError('Failed to upload image.');
      setUploadingIdx(null);
      return;
    }
    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('floorplans').getPublicUrl(filePath);
    const url = publicUrlData?.publicUrl || '';
    handleModelChange(idx, 'floor_plan_url', url);
    setUploadingIdx(null);
  };

  const handleRemoveFloorPlan = (idx: number) => {
    handleModelChange(idx, 'floor_plan_url', '');
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
      <div className="space-y-6">
        {formData.models.map((model, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            {/* Model Header - Always visible */}
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100"
              onClick={() => toggleModelExpansion(idx)}
            >
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {model.bhk_type || 'New Model'}
                </h3>
                {model.super_built_up_area && (
                  <span className="text-sm text-gray-500">
                    ({model.super_built_up_area} sq.ft.)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeModel(idx);
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleModelExpansion(idx);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  {expandedModels[idx] ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Model Content - Collapsible */}
            {expandedModels[idx] && (
              <div className="p-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BHK Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      BHK Type <span className="text-red-500">*</span>
                    </label>
                    <BHKTypeDropdown
                      selectedBHK={model.bhk_type}
                      onChange={(value) => handleModelChange(idx, 'bhk_type', value)}
                      placeholder="Select BHK type"
                      error={!!errors[idx]?.bhk_type}
                    />
                    {errors[idx]?.bhk_type && (
                      <p className="text-xs text-red-500 mt-1">{errors[idx].bhk_type}</p>
                    )}
                  </div>

                  {/* Super Built-up Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Super Built-up Area (sq.ft.) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={model.super_built_up_area || ''}
                      onChange={(e) => handleModelChange(idx, 'super_built_up_area', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                      className={`w-full rounded-lg border ${
                        errors[idx]?.super_built_up_area ? 'border-red-400' : 'border-gray-300'
                      } px-3 py-2`}
                      min="0"
                      step="0.01"
                    />
                    {errors[idx]?.super_built_up_area && (
                      <p className="text-xs text-red-500 mt-1">{errors[idx].super_built_up_area}</p>
                    )}
                  </div>

                  {/* Carpet Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carpet Area (sq.ft.) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={model.carpet_area || ''}
                      onChange={(e) => handleModelChange(idx, 'carpet_area', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                      className={`w-full rounded-lg border ${
                        errors[idx]?.carpet_area ? 'border-red-400' : 'border-gray-300'
                      } px-3 py-2`}
                      min="0"
                      step="0.01"
                    />
                    {errors[idx]?.carpet_area && (
                      <p className="text-xs text-red-500 mt-1">{errors[idx].carpet_area}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={model.price || ''}
                        onChange={(e) => handleModelChange(idx, 'price', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                        className={`w-full rounded-lg border ${
                          errors[idx]?.price ? 'border-red-400' : 'border-gray-300'
                        } pl-8 pr-3 py-2`}
                        min="0"
                      />
                    </div>
                    {errors[idx]?.price && (
                      <p className="text-xs text-red-500 mt-1">{errors[idx].price}</p>
                    )}
                    {model.price && model.super_built_up_area && (
                      <p className="text-xs text-gray-500 mt-1">
                        Price per sq.ft.: {formatCurrency(Number(model.price_per_sqft) || 0)}
                      </p>
                    )}
                  </div>

                  {/* Specifications */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specifications
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Bedrooms</label>
                        <input
                          type="number"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                          value={model.specifications.bedrooms || ''}
                          onChange={e => handleSpecChange(idx, 'bedrooms', e.target.value === '' ? '' : parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Bathrooms</label>
                        <input
                          type="number"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                          value={model.specifications.bathrooms || ''}
                          onChange={e => handleSpecChange(idx, 'bathrooms', e.target.value === '' ? '' : parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Balconies</label>
                        <input
                          type="number"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                          value={model.specifications.balconies || ''}
                          onChange={e => handleSpecChange(idx, 'balconies', e.target.value === '' ? '' : parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Parking</label>
                        <input
                          type="number"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                          value={model.specifications.parking || ''}
                          onChange={e => handleSpecChange(idx, 'parking', e.target.value === '' ? '' : parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Floor Plan Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Floor Plan Image</label>
                    {model.floor_plan_url ? (
                      <div className="flex items-center gap-4 mb-2">
                        <img src={model.floor_plan_url} alt="Floor Plan" className="w-32 h-24 object-contain rounded border" />
                        <button
                          type="button"
                          className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                          onClick={() => handleRemoveFloorPlan(idx)}
                        >
                          <XMarkIcon className="w-4 h-4 mr-1" /> Remove
                        </button>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleFloorPlanUpload(idx, e.target.files[0]);
                            }
                          }}
                          disabled={uploadingIdx === idx}
                        />
                        <span className="inline-flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg shadow hover:bg-green-200 text-xs font-medium">
                          <PhotoIcon className="w-4 h-4 mr-1" />
                          {uploadingIdx === idx ? 'Uploading...' : model.floor_plan_url ? 'Replace Image' : 'Upload Image'}
                        </span>
                      </label>
                      {uploadError && uploadingIdx === idx && (
                        <span className="text-xs text-red-500 ml-2">{uploadError}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addModel}
          className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg shadow hover:bg-green-200 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> Add Model
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default ModelsPricing; 