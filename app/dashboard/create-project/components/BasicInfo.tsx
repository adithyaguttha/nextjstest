'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { ProjectFormData } from '../page';
import { BuildingOffice2Icon, UserIcon, MapPinIcon, CurrencyRupeeIcon, MapIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Developer {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
}

interface Locality {
  id: string;
  name: string;
  city_id: string;
}

interface BasicInfoProps {
  formData: ProjectFormData;
  updateFormData: (data: Partial<ProjectFormData>) => void;
  onNext: () => void;
  onReset: () => void;
}

const unitOptions = ['sq.ft.', 'sq.m.', 'acres'];

const BasicInfo: React.FC<BasicInfoProps> = ({ formData, updateFormData, onNext, onReset }) => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // Searchable dropdown states
  const [devQuery, setDevQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [localityQuery, setLocalityQuery] = useState('');
  const [showDevDropdown, setShowDevDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);
  // Toaster
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchDevelopers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('id, name')
        .order('name');
      if (error) throw error;
      setDevelopers(data || []);
    } catch (err) {
      console.error('Error fetching developers:', err);
      setErrors(prev => ({ ...prev, developer_id: 'Failed to load developers' }));
    }
  }, []);

  const fetchCities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name')
        .order('name');
      if (error) throw error;
      setCities(data || []);
    } catch (err) {
      console.error('Error fetching cities:', err);
      setErrors(prev => ({ ...prev, city_id: 'Failed to load cities' }));
    }
  }, []);

  const fetchLocalities = useCallback(async (cityId: string) => {
    try {
      const { data, error } = await supabase
        .from('localities')
        .select('id, name, city_id')
        .eq('city_id', cityId)
        .order('name');
      if (error) throw error;
      setLocalities(data || []);
    } catch (err) {
      console.error('Error fetching localities:', err);
      setErrors(prev => ({ ...prev, locality_id: 'Failed to load localities' }));
    }
  }, []);

  useEffect(() => {
    fetchDevelopers();
    fetchCities();
  }, [fetchDevelopers, fetchCities]);

  useEffect(() => {
    if (formData.city_id) {
      fetchLocalities(formData.city_id);
    } else {
      setLocalities([]);
      updateFormData({ locality_id: '' });
    }
  }, [formData.city_id, updateFormData, fetchLocalities]);

  useEffect(() => {
    if (toast) {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToast(null), 3500);
    }
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, [toast]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required.';
    }
    if (!formData.developer_id) {
      newErrors.developer_id = 'Developer is required.';
    }
    if (!formData.city_id) {
      newErrors.city_id = 'City is required.';
    }
    if (!formData.locality_id) {
      newErrors.locality_id = 'Locality is required.';
    }
    if (!formData.construction_status) {
      newErrors.construction_status = 'Construction status is required.';
    }
    if (formData.construction_status === 'Ready to Move' && !formData.possession_date) {
      newErrors.possession_date = 'Possession date is required for Ready to Move projects.';
    }
    if (formData.possession_date && new Date(formData.possession_date) < new Date()) {
      newErrors.possession_date = 'Possession date cannot be in the past.';
    }
    if (!formData.project_size.total_area || formData.project_size.total_area <= 0) newErrors.total_area = 'Total area is required.';
    // Price validation: at least one of min or max is required
    if ((!(formData.price_range.min && formData.price_range.min > 0)) && (!(formData.price_range.max && formData.price_range.max > 0))) {
      newErrors.price_min = 'At least one price (min or max) is required.';
    }
    if (!formData.location_coordinates.latitude || !formData.location_coordinates.longitude) newErrors.location = 'Location coordinates are required.';
    // Add RERA validation
    if (formData.rera_verified && !formData.rera_id.trim()) {
      newErrors.rera_id = 'RERA ID is required when project is RERA verified.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('project_size.')) {
      updateFormData({
        project_size: {
          ...formData.project_size,
          [name.split('.')[1]]: value,
        },
      });
    } else if (name.startsWith('price_range.')) {
      const field = name.split('.')[1];
      // Handle numeric fields (min, max) and string fields (min_unit, max_unit) differently
      if (field === 'min' || field === 'max') {
        const numericValue = value === '' ? '' : parseFloat(value);
        updateFormData({
          price_range: {
            ...formData.price_range,
            [field]: numericValue,
          },
        });
      } else {
        // Handle unit fields (min_unit, max_unit) as strings
      updateFormData({
        price_range: {
          ...formData.price_range,
            [field]: value,
        },
      });
      }
    } else if (name.startsWith('location_coordinates.')) {
      updateFormData({
        location_coordinates: {
          ...formData.location_coordinates,
          [name.split('.')[1]]: value,
        },
      });
    } else {
      updateFormData({ [name]: value });
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onNext();
  };

  // Dropdown click outside handler
  const devDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const localityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        devDropdownRef.current && !devDropdownRef.current.contains(e.target as Node)
      ) setShowDevDropdown(false);
      if (
        cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)
      ) setShowCityDropdown(false);
      if (
        localityDropdownRef.current && !localityDropdownRef.current.contains(e.target as Node)
      ) setShowLocalityDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [devDropdownRef, cityDropdownRef, localityDropdownRef, setShowDevDropdown, setShowCityDropdown, setShowLocalityDropdown]);

  return (
    <div className="space-y-8">
      {/* Form Header with Reset Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Basic Project Information</h3>
        <button type="button" onClick={onReset} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Form
        </button>
      </div>

      {/* Toaster */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 min-w-[220px] max-w-xs bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow flex items-center gap-2 animate-fade-in-out">
          <XMarkIcon className="w-5 h-5 text-red-400" />
          <span className="flex-1 text-sm">{toast}</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
          <div className="relative">
            <UserIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`pl-10 pr-3 py-2 w-full rounded-lg border ${errors.name ? 'border-red-400' : 'border-gray-300'} focus:ring-green-500 focus:border-green-500`}
              placeholder="Enter project name"
            />
          </div>
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Developer Searchable Dropdown */}
        <div ref={devDropdownRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Developer</label>
          <div className="relative">
            <BuildingOffice2Icon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              className={`pl-10 pr-3 py-2 w-full rounded-lg border ${errors.developer_id ? 'border-red-400' : 'border-gray-300'} focus:ring-green-500 focus:border-green-500 bg-white cursor-pointer`}
              placeholder="Search developer"
              value={devQuery !== null ? devQuery : (developers.find(d => d.id === formData.developer_id)?.name || '')}
              onChange={e => {
                const newValue = e.target.value;
                setDevQuery(newValue);
                if (newValue === '') {
                  updateFormData({ developer_id: '' });
                }
                setShowDevDropdown(true);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowDevDropdown(true);
              }}
              onFocus={() => setShowDevDropdown(true)}
              readOnly={false}
            />
            {/* Dropdown */}
            {showDevDropdown && (
              <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto">
                {developers.map(dev => (
                    <li
                      key={dev.id}
                      className={`px-4 py-2 cursor-pointer hover:bg-green-50 ${formData.developer_id === dev.id ? 'bg-green-100' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFormData({ developer_id: dev.id });
                        setDevQuery(dev.name);
                        setShowDevDropdown(false);
                      }}
                    >
                      {dev.name}
                    </li>
                ))}
              </ul>
            )}
          </div>
          {errors.developer_id && <p className="text-xs text-red-500 mt-1">{errors.developer_id}</p>}
        </div>

        {/* City Searchable Dropdown */}
        <div ref={cityDropdownRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <div className="relative">
            <MapPinIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              className={`pl-10 pr-3 py-2 w-full rounded-lg border ${errors.city_id ? 'border-red-400' : 'border-gray-300'} focus:ring-green-500 focus:border-green-500 bg-white cursor-pointer`}
              placeholder="Search city"
              value={cityQuery !== null ? cityQuery : (cities.find(c => c.id === formData.city_id)?.name || '')}
              onChange={e => {
                const newValue = e.target.value;
                setCityQuery(newValue);
                if (newValue === '') {
                  updateFormData({ city_id: '', locality_id: '' });
                }
                setShowCityDropdown(true);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowCityDropdown(true);
              }}
              onFocus={() => setShowCityDropdown(true)}
              readOnly={false}
            />
            {/* Dropdown */}
            {showCityDropdown && (
              <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto">
                {cities.map(city => (
                    <li
                      key={city.id}
                      className={`px-4 py-2 cursor-pointer hover:bg-green-50 ${formData.city_id === city.id ? 'bg-green-100' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFormData({ city_id: city.id, locality_id: '' });
                        setCityQuery(city.name);
                        setShowCityDropdown(false);
                        setLocalityQuery('');
                      }}
                    >
                      {city.name}
                    </li>
                ))}
              </ul>
            )}
          </div>
          {errors.city_id && <p className="text-xs text-red-500 mt-1">{errors.city_id}</p>}
        </div>
        {/* Locality Searchable Dropdown */}
        <div ref={localityDropdownRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
          <div className="relative">
            <MapIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              className={`pl-10 pr-3 py-2 w-full rounded-lg border ${errors.locality_id ? 'border-red-400' : 'border-gray-300'} focus:ring-green-500 focus:border-green-500 bg-white cursor-pointer`}
              placeholder="Search locality"
              value={localityQuery !== null ? localityQuery : (localities.find(l => l.id === formData.locality_id)?.name || '')}
              onChange={e => {
                const newValue = e.target.value;
                setLocalityQuery(newValue);
                if (newValue === '') {
                  updateFormData({ locality_id: '' });
                }
                if (formData.city_id) {
                  setShowLocalityDropdown(true);
                } else {
                  setToast('Please select a city first');
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!formData.city_id) {
                  setToast('Please select a city first');
                } else {
                  setShowLocalityDropdown(true);
                }
              }}
              onFocus={() => {
                if (!formData.city_id) {
                  setToast('Please select a city first');
                } else {
                  setShowLocalityDropdown(true);
                }
              }}
              readOnly={false}
            />
            {/* Dropdown */}
            {showLocalityDropdown && formData.city_id && (
              <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto">
                {localities.map(loc => (
                    <li
                      key={loc.id}
                      className={`px-4 py-2 cursor-pointer hover:bg-green-50 ${formData.locality_id === loc.id ? 'bg-green-100' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFormData({ locality_id: loc.id });
                        setLocalityQuery(loc.name);
                        setShowLocalityDropdown(false);
                      }}
                    >
                      {loc.name}
                    </li>
                ))}
              </ul>
            )}
          </div>
          {errors.locality_id && <p className="text-xs text-red-500 mt-1">{errors.locality_id}</p>}
        </div>
        {/* Construction Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Construction Status <span className="text-red-500">*</span>
          </label>
          <select
            name="construction_status"
            value={formData.construction_status}
            onChange={handleChange}
            className={`px-3 py-2 w-full rounded-lg border ${
              errors.construction_status ? 'border-red-400' : 'border-gray-300'
            } focus:ring-green-500 focus:border-green-500`}
          >
            <option value="Not Started">Not Started</option>
            <option value="Under Construction">Under Construction</option>
            <option value="Completed">Completed</option>
            <option value="Ready to Move">Ready to Move</option>
          </select>
          {errors.construction_status && (
            <p className="text-xs text-red-500 mt-1">{errors.construction_status}</p>
          )}
        </div>

        {/* Possession Date - Always visible */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Possession Date {formData.construction_status === 'Ready to Move' && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            name="possession_date"
            value={formData.possession_date || ''}
            onChange={handleChange}
            className={`px-3 py-2 w-full rounded-lg border ${
              errors.possession_date ? 'border-red-400' : 'border-gray-300'
            } focus:ring-green-500 focus:border-green-500`}
            min={new Date().toISOString().split('T')[0]} // Set min date to today
          />
          {errors.possession_date && (
            <p className="text-xs text-red-500 mt-1">{errors.possession_date}</p>
          )}
          {formData.construction_status !== 'Ready to Move' && (
            <p className="text-xs text-gray-500 mt-1">Optional for non-Ready to Move projects</p>
          )}
        </div>
        {/* Project Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Size (Total Area)</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              name="project_size.total_area"
              value={formData.project_size.total_area}
              onChange={handleChange}
              className={`pl-3 pr-3 py-2 w-2/3 rounded-lg border ${errors.total_area ? 'border-red-400' : 'border-gray-300'} focus:ring-green-500 focus:border-green-500`}
              placeholder="Total area"
              min={0}
              step="any"
            />
            <select
              name="project_size.unit"
              value={formData.project_size.unit}
              onChange={handleChange}
              className="py-2 px-2 w-1/3 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
            >
              {unitOptions.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
          {errors.total_area && <p className="text-xs text-red-500 mt-1">{errors.total_area}</p>}
        </div>
        {/* Price Range */}
        <div className='md:col-span-2'>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (Min - Max)</label>
          <div className="flex items-center space-x-2">
            {/* Min Price + Unit */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <CurrencyRupeeIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="number"
                  name="price_range.min"
                  value={formData.price_range.min}
                  onChange={handleChange}
                  className={`pl-10 pr-3 py-2 w-full rounded-lg border ${errors.price_min ? 'border-red-400' : 'border-gray-300'} focus:ring-green-500 focus:border-green-500`}
                  placeholder="Min price"
                  min={0}
                  step="0.01"
                />
              </div>
              <select
                name="price_range.min_unit"
                value={formData.price_range.min_unit}
                onChange={handleChange}
                className="py-2 px-2 rounded-lg border border-gray-300 bg-white focus:ring-green-500 focus:border-green-500"
                style={{ minWidth: '90px' }}
              >
                <option value="">Select</option>
                <option value="L">L</option>
                <option value="Cr">Cr</option>
                <option value="K">K</option>
                <option value="Rupees">Rupees</option>
              </select>
            </div>
            {/* Max Price + Unit */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <CurrencyRupeeIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="number"
                  name="price_range.max"
                  value={formData.price_range.max}
                  onChange={handleChange}
                  className={`pl-10 pr-3 py-2 w-full rounded-lg border ${errors.price_min ? 'border-red-400' : 'border-gray-300'} focus:ring-green-500 focus:border-green-500`}
                  placeholder="Max price (optional)"
                  min={0}
                  step="0.01"
                />
              </div>
              <select
                name="price_range.max_unit"
                value={formData.price_range.max_unit}
                onChange={handleChange}
                className="py-2 px-2 rounded-lg border border-gray-300 bg-white focus:ring-green-500 focus:border-green-500"
                style={{ minWidth: '90px' }}
              >
                <option value="">Select</option>
                <option value="L">L</option>
                <option value="Cr">Cr</option>
                <option value="K">K</option>
                <option value="Rupees">Rupees</option>
              </select>
            </div>
          </div>
          {errors.price_min && <p className="text-xs text-red-500 mt-1">{errors.price_min}</p>}
        </div>
        {/* Location Coordinates */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location Coordinates</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              name="location_coordinates.latitude"
              value={formData.location_coordinates.latitude}
              onChange={handleChange}
              className={`pl-3 pr-3 py-2 w-1/2 rounded-lg border ${errors.location ? 'border-red-400' : 'border-gray-300'} focus:ring-green-500 focus:border-green-500`}
              placeholder="Latitude"
              step="any"
            />
            <input
              type="number"
              name="location_coordinates.longitude"
              value={formData.location_coordinates.longitude}
              onChange={handleChange}
              className={`pl-3 pr-3 py-2 w-1/2 rounded-lg border ${errors.location ? 'border-red-400' : 'border-gray-300'} focus:ring-green-500 focus:border-green-500`}
              placeholder="Longitude"
              step="any"
            />
          </div>
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
        </div>
        {/* Add RERA Verification section after Location Coordinates */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rera_verified"
              name="rera_verified"
              checked={formData.rera_verified}
              onChange={(e) => {
                updateFormData({
                  rera_verified: e.target.checked,
                  rera_id: e.target.checked ? formData.rera_id : ''
                });
              }}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="rera_verified" className="text-sm font-medium text-gray-700">
              RERA Verified Project
            </label>
          </div>

          {formData.rera_verified && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RERA ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="rera_id"
                value={formData.rera_id}
                onChange={handleChange}
                className={`px-3 py-2 w-full rounded-lg border ${
                  errors.rera_id ? 'border-red-400' : 'border-gray-300'
                } focus:ring-green-500 focus:border-green-500`}
                placeholder="Enter RERA registration ID"
              />
              {errors.rera_id && (
                <p className="text-xs text-red-500 mt-1">{errors.rera_id}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter the official RERA registration ID for this project
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button type="button" onClick={handleNext} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Next
        </button>
      </div>
    </div>
  );
};

export default BasicInfo; 