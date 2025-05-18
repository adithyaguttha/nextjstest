'use client';

import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { ProjectFormData } from '../page';
import { BuildingOffice2Icon, UserIcon, MapPinIcon, CurrencyRupeeIcon, ArrowRightIcon, MapIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
}

const unitOptions = ['sq.ft.', 'sq.m.', 'acres'];

const priceUnitOptions = [
  { label: 'Crores', value: 'cr' },
  { label: 'Lakhs', value: 'lakhs' },
  { label: 'Thousands', value: 'thousands' },
  { label: 'Rupees', value: 'rupees' },
];

const BasicInfo: React.FC<BasicInfoProps> = ({ formData, updateFormData, onNext }) => {
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
  const toastRef = useRef<string | null>(null);
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
    if (toastRef.current) {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => { toastRef.current = null; }, 3500);
    }
    return () => { if (toastTimeout.current) clearTimeout(toastTimeout.current); };
  }, []);

  // (Removed "Update toastRef" effect entirely.) (Instead, update toastRef synchronously (on mount) via useLayoutEffect.)
  useLayoutEffect(() => { toastRef.current = toast; }, []);

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
    <form onSubmit={handleNext} className="space-y-8">
      {/* Form Header with Reset Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Basic Project Information</h3>
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
              className={`pl-10 pr-3 py-2 w-full rounded-lg border ${errors.locality_id ? 'border-red-400' : 'border-gray-300'} focus:ring-green-500 focus:border-green-500 bg-white cursor-pointer`