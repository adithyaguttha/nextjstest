'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { ProjectFormData } from '../page';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface ReviewSubmitProps {
  formData: ProjectFormData;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

interface ReferenceData {
  developer: { name: string } | null;
  city: { name: string } | null;
  locality: { name: string } | null;
}

export default function ReviewSubmit({ formData, onSubmit, onBack, loading }: ReviewSubmitProps) {
  const [referenceData, setReferenceData] = useState<ReferenceData>({
    developer: null,
    city: null,
    locality: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submissionStage, setSubmissionStage] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch developer
        const { data: developer } = await supabase
          .from('developers')
          .select('name')
          .eq('id', formData.developer_id)
          .single();

        // Fetch city
        const { data: city } = await supabase
          .from('cities')
          .select('name')
          .eq('id', formData.city_id)
          .single();

        // Fetch locality
        const { data: locality } = await supabase
          .from('localities')
          .select('name')
          .eq('id', formData.locality_id)
          .single();

        setReferenceData({
          developer,
          city,
          locality,
        });
      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    };

    fetchReferenceData();
  }, [formData]);

  const getDeveloperName = () => {
    return referenceData.developer?.name || 'Unknown Developer';
  };

  const getCityName = () => {
    return referenceData.city?.name || 'Unknown City';
  };

  const getLocalityName = () => {
    return referenceData.locality?.name || 'Unknown Locality';
  };

  const handleSubmitClick = () => {
    setShowConfirmation(true);
  };

  const handleCancelSubmit = () => {
    setShowConfirmation(false);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmation(false);
    setSubmissionStage('Submitting project data...');
    try {
      await onSubmit();
      setSubmissionStage('Project created successfully!');
    } catch (err) {
      setSubmissionStage(null);
      setError((err as Error).message || 'Failed to create project');
    }
  };

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 border border-red-200">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      {submissionStage && (
        <div className="mb-6 p-4 rounded-md bg-blue-50 border border-blue-200 flex items-center">
          <div className="mr-3">
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            )}
          </div>
          <p className="text-sm text-blue-700">{submissionStage}</p>
        </div>
      )}

      {/* Basic Information */}
      <section>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Project Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Developer</dt>
            <dd className="mt-1 text-sm text-gray-900">{getDeveloperName()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Location</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {getLocalityName()}, {getCityName()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Construction Status</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.construction_status}</dd>
          </div>
          {/* Add RERA information after Construction Status */}
          <div>
            <dt className="text-sm font-medium text-gray-500">RERA Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.rera_verified ? (
                <>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                  <div className="mt-1">
                    RERA ID: <span className="font-medium">{formData.rera_id}</span>
                  </div>
                </>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Not Verified
                </span>
              )}
            </dd>
          </div>
          {(formData.construction_status === 'Ready to Move' || formData.construction_status === 'Under Construction') && formData.possession_date && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Expected Possession Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(formData.possession_date).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Project Size</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.project_size.total_area} {formData.project_size.unit}
              <br />
              <span className="text-gray-500">Built-up Area: {formData.project_size.built_up_area} {formData.project_size.unit}</span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Price Range</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {(() => {
                const { min, max, currency } = formData.price_range;
                const min_unit = (formData.price_range as any).min_unit || '';
                const max_unit = (formData.price_range as any).max_unit || '';
                if (min && max) {
                  return `${currency} ${min}${min_unit ? ' ' + min_unit : ''} - ${max}${max_unit ? ' ' + max_unit : ''}`;
                } else if (min) {
                  return `${currency} ${min}${min_unit ? ' ' + min_unit : ''}`;
                } else if (max) {
                  return `${currency} ${max}${max_unit ? ' ' + max_unit : ''}`;
                } else {
                  return 'N/A';
                }
              })()}
            </dd>
          </div>
        </dl>
      </section>

      {/* Project Media */}
      <section>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Project Media</h2>
        <div className="space-y-4">
          {/* Cover Image */}
          <div>
            <dt className="text-sm font-medium text-gray-500 mb-2">Cover Image</dt>
            {formData.cover_image_url ? (
              <img 
                src={formData.cover_image_url} 
                alt="Cover" 
                className="w-full h-60 object-cover rounded-lg"
              />
            ) : (
              <div className="text-sm text-gray-500">No cover image provided</div>
            )}
          </div>

          {/* Video URL */}
          {formData.video_url && (
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-2">Video</dt>
              <a 
                href={formData.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {formData.video_url}
              </a>
            </div>
          )}

          {/* Project Images */}
          {formData.project_images.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-2">Project Images</dt>
              
              {/* Group images by category */}
              {Array.from(new Set(formData.project_images.map(img => img.category))).map(category => (
                <div key={category} className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">{category}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.project_images
                      .filter(img => img.category === category)
                      .map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.url}
                            alt={`${category} ${index + 1}`}
                            className="h-24 w-full object-cover rounded-lg"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Brochure */}
          {formData.brochure_url && (
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-2">Brochure</dt>
              <a 
                href={formData.brochure_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                View Brochure
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Project Details */}
      <section>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Project Details</h2>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{formData.description}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Project Highlights</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <ul className="list-disc pl-5 space-y-1">
                {formData.project_highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">EMI Details</dt>
            <dd className="mt-1 text-sm text-gray-900">
              Amount: {formData.price_range.currency} {(formData.emi_details.amount || 0).toLocaleString()}
              <br />
              Duration: {formData.emi_details.duration || 0} years
              <br />
              Interest Rate: {formData.emi_details.interest_rate || 0}%
            </dd>
          </div>
        </dl>
      </section>

      {/* Models */}
      <section>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Models & Pricing</h2>
        <div className="space-y-6">
          {formData.models.map((model, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-base font-medium text-gray-900 mb-3">{model.bhk_type}</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Areas</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Super Built-up: {model.super_built_up_area} {formData.project_size.unit}
                    <br />
                    Carpet Area: {model.carpet_area} {formData.project_size.unit}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pricing</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Price: {formData.price_range.currency} {(model.price || 0).toLocaleString()}
                    <br />
                    Price per sq.ft.: {formData.price_range.currency} {(model.price_per_sqft || 0).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Specifications</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Bedrooms: {model.specifications.bedrooms}
                    <br />
                    Bathrooms: {model.specifications.bathrooms}
                    <br />
                    Balconies: {model.specifications.balconies}
                    <br />
                    Parking: {model.specifications.parking}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Availability</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{model.availability_status}</dd>
                </div>
                {model.floor_plan_url && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Floor Plan</dt>
                  <dd className="mt-1">
                    <img 
                      src={model.floor_plan_url} 
                      alt={`Floor Plan for ${model.bhk_type}`} 
                      className="h-40 object-contain border rounded"
                    />
                  </dd>
                </div>
                )}
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* Amenities */}
      <section>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Amenities & Features</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {formData.amenities.map(amenity => (
              <li key={amenity} className="flex items-center text-sm text-gray-600">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                {amenity}
              </li>
            ))}
            {formData.amenities.length === 0 && (
              <li className="text-sm text-gray-500">No amenities selected</li>
            )}
          </ul>
        </div>
      </section>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="mr-2 -ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous Step
        </button>
        <button
          type="button"
          onClick={handleSubmitClick}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Project...
            </>
          ) : (
            <>
              Create Project
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Project Creation</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to create this project? This action cannot be easily undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancelSubmit}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Confirm & Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 