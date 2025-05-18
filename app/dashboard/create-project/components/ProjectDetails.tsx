'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRightIcon, ArrowLeftIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { ProjectFormData } from '../page';
import { toast } from 'react-hot-toast';

interface ProjectDetailsProps {
  formData: ProjectFormData;
  updateFormData: (data: Partial<ProjectFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ formData, updateFormData, onNext, onBack }) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newHighlight, setNewHighlight] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (toastMessage) {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToastMessage(null), 3500);
    }
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, [toastMessage]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required.';
    }
    
    if (!formData.project_highlights.length || formData.project_highlights.every(h => !h.trim())) {
      newErrors.project_highlights = 'At least one project highlight is required.';
    }
    
    if (!formData.emi_details.amount || !formData.emi_details.duration || !formData.emi_details.interest_rate) {
      newErrors.emi_details = 'All EMI details are required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'description') {
      updateFormData({ description: value });
    } else if (name.startsWith('emi_details.')) {
      updateFormData({
        emi_details: {
          ...formData.emi_details,
          [name.split('.')[1]]: parseFloat(value) || 0,
        },
      });
    }
  };

  // Add new highlight
  const handleAddHighlight = () => {
    if (!newHighlight.trim()) {
      setToastMessage('Please enter a highlight');
      return;
    }
    updateFormData({
      project_highlights: [...formData.project_highlights, newHighlight.trim()]
    });
    setNewHighlight('');
  };

  // Remove highlight
  const handleRemoveHighlight = (index: number) => {
    const updatedHighlights = formData.project_highlights.filter((_, i) => i !== index);
    updateFormData({ project_highlights: updatedHighlights });
  };

  // Handle enter key in highlight input
  const handleHighlightKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddHighlight();
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    try {
      onNext();
    } catch (error) {
      console.error('Error in project details validation:', error);
      toast.error('Failed to process project details. Please try again.');
    }
  };

  return (
    <form onSubmit={handleNext} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Description <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DocumentTextIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`pl-10 pr-3 py-2 w-full rounded-lg border ${
                errors.description ? 'border-red-400' : 'border-gray-300'
              } focus:ring-green-500 focus:border-green-500`}
              placeholder="Describe the project..."
            />
          </div>
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Project Highlights */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Highlights <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {/* List of existing highlights */}
            {formData.project_highlights.length > 0 && (
              <div className="space-y-2">
                {formData.project_highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                    <span className="flex-1 text-sm text-gray-700">{highlight}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add new highlight input */}
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyPress={handleHighlightKeyPress}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter a project highlight"
                />
              </div>
              <button
                type="button"
                onClick={handleAddHighlight}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add Highlight
              </button>
            </div>
            {errors.project_highlights && (
              <p className="text-xs text-red-500 mt-1">{errors.project_highlights}</p>
            )}
            <p className="text-xs text-gray-500">
              Press Enter or click Add Highlight to add each highlight. You can add multiple highlights.
            </p>
          </div>
        </div>

        {/* EMI Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            EMI Amount (₹) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">₹</span>
            <input
              type="number"
              name="emi_details.amount"
              value={formData.emi_details.amount || ''}
              onChange={handleChange}
              className={`pl-8 pr-3 py-2 w-full rounded-lg border ${
                errors.emi_details ? 'border-red-400' : 'border-gray-300'
              } focus:ring-green-500 focus:border-green-500`}
              placeholder="EMI amount"
              min={0}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            EMI Duration (years) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="emi_details.duration"
            value={formData.emi_details.duration || ''}
            onChange={handleChange}
            className={`px-3 py-2 w-full rounded-lg border ${
              errors.emi_details ? 'border-red-400' : 'border-gray-300'
            } focus:ring-green-500 focus:border-green-500`}
            placeholder="Duration in years"
            min={0}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            EMI Interest Rate (%) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute right-3 top-2 text-gray-500">%</span>
            <input
              type="number"
              name="emi_details.interest_rate"
              value={formData.emi_details.interest_rate || ''}
              onChange={handleChange}
              className={`pl-3 pr-8 py-2 w-full rounded-lg border ${
                errors.emi_details ? 'border-red-400' : 'border-gray-300'
              } focus:ring-green-500 focus:border-green-500`}
              placeholder="Interest rate"
              min={0}
              step="0.01"
            />
          </div>
        </div>

        {errors.emi_details && (
          <div className="md:col-span-2">
            <p className="text-xs text-red-500">{errors.emi_details}</p>
          </div>
        )}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Next
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </button>
      </div>
    </form>
  );
};

export default ProjectDetails; 