'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/AuthContext';

// Add Indian states list
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep',
  'Puducherry'
].sort();

interface City {
  id: string;
  name: string;
  description: string;
  image_url: string;
  state: string;  // Changed from country to state
  created_by: string;
  created_at: string;
}

interface Locality {
  id: string;
  city_id: string;
  name: string;
  description: string;
  image_url: string;
  created_by: string;
  created_at: string;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

export default function CitiesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'cities' | 'localities'>('cities');
  const [cityTab, setCityTab] = useState<'list' | 'add'>('list');
  const [localityTab, setLocalityTab] = useState<'list' | 'add'>('list');
  const [formDirty, setFormDirty] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [localitySearchTerm, setLocalitySearchTerm] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewingCity, setViewingCity] = useState<City | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editingLocality, setEditingLocality] = useState<Locality | null>(null);
  const [showLocalityDeleteConfirm, setShowLocalityDeleteConfirm] = useState<string | null>(null);
  const [viewingLocality, setViewingLocality] = useState<Locality | null>(null);
  const [localityImageFile, setLocalityImageFile] = useState<File | null>(null);
  const [localityImagePreview, setLocalityImagePreview] = useState<string>('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);

  const [cityForm, setCityForm] = useState<{
    name: string;
    description: string;
    image_url: string;
    state: string;  // Changed from country to state
  }>({
    name: '',
    description: '',
    image_url: '',
    state: '',  // Changed from country to state
  });

  const [localityForm, setLocalityForm] = useState<{
    city_id: string;
    name: string;
    description: string;
    image_url: string;
  }>({
    city_id: '',
    name: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    fetchCities();
    fetchLocalities();

    // Check localStorage for tab preferences
    const savedActiveTab = localStorage.getItem('activeTab');
    const savedCityTab = localStorage.getItem('cityTab');
    const savedLocalityTab = localStorage.getItem('localityTab');

    if (savedActiveTab === 'cities' || savedActiveTab === 'localities') {
      setActiveTab(savedActiveTab);
      // Clear the localStorage after reading
      localStorage.removeItem('activeTab');
    }

    if (savedActiveTab === 'cities' && savedCityTab === 'add') {
      setCityTab('add');
      // Clear the localStorage after reading
      localStorage.removeItem('cityTab');
    }

    if (savedActiveTab === 'localities' && savedLocalityTab === 'add') {
      setLocalityTab('add');
      // Clear the localStorage after reading
      localStorage.removeItem('localityTab');
    }
  }, []);

  // Add click outside handler for state dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
        setShowStateDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter states based on search term
  const filteredStates = useMemo(() => {
    if (!stateSearchTerm) return INDIAN_STATES;
    return INDIAN_STATES.filter(state => 
      state.toLowerCase().includes(stateSearchTerm.toLowerCase())
    );
  }, [stateSearchTerm]);

  const fetchCities = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCities((data as City[]) || []);
    } catch (err) {
      setError('Failed to load cities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocalities = async () => {
    try {
      const { data, error } = await supabase
        .from('localities')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLocalities((data as Locality[]) || []);
    } catch (err) {
      console.error('Failed to load localities:', err);
    }
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCityForm((prev) => ({ ...prev, [name]: value }));
    setFormDirty(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image file size should be less than 2MB' });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormDirty(true);
    }
  };

  const validateCityForm = () => {
    if (!cityForm.name.trim()) {
      setMessage({ type: 'error', text: 'City name is required' });
      return false;
    }
    if (!cityForm.description.trim()) {
      setMessage({ type: 'error', text: 'Description is required' });
      return false;
    }
    if (!cityForm.state.trim()) {  // Changed from country to state
      setMessage({ type: 'error', text: 'State is required' });
      return false;
    }
    return true;
  };

  const handleEditCity = (city: City) => {
    setEditingCity(city);
    setCityForm({
      name: city.name,
      description: city.description,
      image_url: city.image_url,
      state: city.state,  // Changed from country to state
    });
    setImageFile(null);
    setImagePreview(city.image_url || '');
    setCityTab('add');
  };

  const handleDeleteCity = async (id: string) => {
    setLoading(true);
    setMessage(null);
    try {
      // First check if there are any localities associated with this city
      const { data: localities } = await supabase
        .from('localities')
        .select('id')
        .eq('city_id', id);
      
      if (localities && localities.length > 0) {
        setMessage({ 
          type: 'error', 
          text: `⚠️ Cannot delete city! Please remove all ${localities.length} localities first.` 
        });
        return;
      }

      const { error } = await supabase
        .from('cities')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(`Failed to delete city: ${error.message}`);
      setMessage({ type: 'success', text: '✅ City deleted successfully!' });
      fetchCities();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to delete city. Please try again.' 
      });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleCitySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateCityForm() || !user) return;
    setLoading(true);
    setMessage(null);
    try {
      let image_url = cityForm.image_url;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `city-images/${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('cities')
          .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });
        if (uploadError) throw new Error(`Failed to upload image: ${uploadError.message}`);
        const { data } = supabase.storage
          .from('cities')
          .getPublicUrl(fileName);
        image_url = data.publicUrl;
      }

      if (editingCity) {
        const { error: updateError } = await supabase
          .from('cities')
          .update({
            name: cityForm.name,
            description: cityForm.description,
            image_url,
            state: cityForm.state,
          })
          .eq('id', editingCity.id);
        if (updateError) throw new Error(`Failed to update city: ${updateError.message}`);
        setMessage({ type: 'success', text: 'City updated successfully!' });
      } else {
        const { error: insertError } = await supabase
          .from('cities')
          .insert({
            name: cityForm.name,
            description: cityForm.description,
            image_url,
            state: cityForm.state,
            created_by: user.id,
          });
        if (insertError) throw new Error(`Failed to create city: ${insertError.message}`);
        setMessage({ type: 'success', text: 'City added successfully!' });
      }

      setCityForm({ 
        name: '', 
        description: '', 
        image_url: '', 
        state: ''  // Changed from country to state
      });
      setImageFile(null);
      setImagePreview('');
      setFormDirty(false);
      setEditingCity(null);
      fetchCities();
      setTimeout(() => setCityTab('list'), 1200);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save city. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return cities;
    return cities.filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cities, searchTerm]);

  const getLocalityCount = (cityId: string) => {
    return localities.filter(loc => loc.city_id === cityId).length;
  };

  const handleLocalityInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalityForm((prev) => ({ ...prev, [name]: value }));
    setFormDirty(true);
  };

  const handleLocalityImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image file size should be less than 2MB' });
        return;
      }
      setLocalityImageFile(file);
      setLocalityImagePreview(URL.createObjectURL(file));
      setFormDirty(true);
    }
  };

  const validateLocalityForm = () => {
    if (!localityForm.city_id) {
      setMessage({ type: 'error', text: 'Please select a city' });
      return false;
    }
    if (!localityForm.name.trim()) {
      setMessage({ type: 'error', text: 'Locality name is required' });
      return false;
    }
    if (!localityForm.description.trim()) {
      setMessage({ type: 'error', text: 'Description is required' });
      return false;
    }
    return true;
  };

  const handleEditLocality = (locality: Locality) => {
    setEditingLocality(locality);
    setLocalityForm({
      city_id: locality.city_id,
      name: locality.name,
      description: locality.description,
      image_url: locality.image_url,
    });
    setLocalityImageFile(null);
    setLocalityImagePreview(locality.image_url || '');
    setLocalityTab('add');
  };

  const handleDeleteLocality = async (id: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('localities')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(`Failed to delete locality: ${error.message}`);
      setMessage({ type: 'success', text: 'Locality deleted successfully!' });
      fetchLocalities();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to delete locality. Please try again.' 
      });
    } finally {
      setLoading(false);
      setShowLocalityDeleteConfirm(null);
    }
  };

  const handleLocalitySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateLocalityForm() || !user) return;
    setLoading(true);
    setMessage(null);
    try {
      // Check for duplicate locality in the same city
      if (!editingLocality) {
        const { data: existingLocality } = await supabase
          .from('localities')
          .select('id')
          .eq('city_id', localityForm.city_id)
          .eq('name', localityForm.name.trim())
          .single();

        if (existingLocality) {
          setMessage({ 
            type: 'error', 
            text: 'A locality with this name already exists in the selected city. Please choose a different name.' 
          });
          setLoading(false);
          return;
        }
      }

      let image_url = localityForm.image_url;
      if (localityImageFile) {
        const fileExt = localityImageFile.name.split('.').pop();
        const fileName = `locality-images/${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('localities')
          .upload(fileName, localityImageFile, { cacheControl: '3600', upsert: false });
        if (uploadError) throw new Error(`Failed to upload image: ${uploadError.message}`);
        const { data } = supabase.storage
          .from('localities')
          .getPublicUrl(fileName);
        image_url = data.publicUrl;
      }

      if (editingLocality) {
        // For editing, check if the new name conflicts with other localities in the same city
        if (localityForm.name.trim() !== editingLocality.name.trim()) {
          const { data: existingLocality } = await supabase
            .from('localities')
            .select('id')
            .eq('city_id', localityForm.city_id)
            .eq('name', localityForm.name.trim())
            .neq('id', editingLocality.id)
            .single();

          if (existingLocality) {
            setMessage({ 
              type: 'error', 
              text: 'A locality with this name already exists in the selected city. Please choose a different name.' 
            });
            setLoading(false);
            return;
          }
        }

        const { error: updateError } = await supabase
          .from('localities')
          .update({
            city_id: localityForm.city_id,
            name: localityForm.name.trim(),
            description: localityForm.description.trim(),
            image_url,
          })
          .eq('id', editingLocality.id);
        if (updateError) throw new Error(`Failed to update locality: ${updateError.message}`);
        setMessage({ type: 'success', text: 'Locality updated successfully!' });
      } else {
        const { error: insertError } = await supabase
          .from('localities')
          .insert({
            city_id: localityForm.city_id,
            name: localityForm.name.trim(),
            description: localityForm.description.trim(),
            image_url,
            created_by: user.id,
          });
        if (insertError) throw new Error(`Failed to create locality: ${insertError.message}`);
        setMessage({ type: 'success', text: 'Locality added successfully!' });
      }

      setLocalityForm({ 
        city_id: '', 
        name: '', 
        description: '', 
        image_url: ''
      });
      setLocalityImageFile(null);
      setLocalityImagePreview('');
      setFormDirty(false);
      setEditingLocality(null);
      fetchLocalities();
      setTimeout(() => setLocalityTab('list'), 1200);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save locality. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLocalities = useMemo(() => {
    let filtered = localities;
    
    // Filter by city if a city is selected
    if (selectedCity !== 'all') {
      filtered = filtered.filter(loc => loc.city_id === selectedCity);
    }
    
    // Filter by search term
    if (localitySearchTerm.trim()) {
      const searchLower = localitySearchTerm.toLowerCase();
      filtered = filtered.filter(loc => 
        loc.name.toLowerCase().includes(searchLower) ||
        loc.description.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [localities, selectedCity, localitySearchTerm]);

  const getCityName = (cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : 'Unknown City';
  };

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (message) {
      setShowToast(true);
      timeoutId = setTimeout(() => {
        setShowToast(false);
        // Clear message after animation
        setTimeout(() => setMessage(null), 300);
      }, 5000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [message]);

  return (
    <div className="space-y-6">
      {/* Toast Message */}
      <div 
        className={`fixed right-4 z-40 transition-all duration-300 ease-in-out ${
          showToast ? 'top-20 opacity-100 translate-y-0' : 'top-0 opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {message && (
          <div 
            className={`px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 min-w-[300px] max-w-md ${
              message.type === 'error' 
                ? 'bg-red-50 border-l-4 border-red-500 text-red-700' 
                : 'bg-green-50 border-l-4 border-green-500 text-green-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {message.type === 'error' ? (
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <p className="font-medium text-sm sm:text-base">{message.text}</p>
              </div>
              <button
                onClick={() => {
                  setShowToast(false);
                  setTimeout(() => setMessage(null), 300);
                }}
                className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Cities & Localities</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('cities')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'cities'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            Cities
          </button>
          <button
            onClick={() => setActiveTab('localities')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'localities'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            Localities
          </button>
        </div>
      </div>

      {/* Content Sections */}
      {activeTab === 'cities' && (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Cities Management</h1>
            <button
              onClick={() => {
                if (formDirty) {
                  if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                    setCityTab('add');
                    setFormDirty(false);
                    setEditingCity(null);
                    setCityForm({
                      name: '',
                      description: '',
                      image_url: '',
                      state: '',
                    });
                    setImageFile(null);
                    setImagePreview('');
                  }
                } else {
                  setCityTab('add');
                  setEditingCity(null);
                  setCityForm({
                    name: '',
                    description: '',
                    image_url: '',
                    state: '',
                  });
                  setImageFile(null);
                  setImagePreview('');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New City
            </button>
          </div>

          {/* Cities List Tab */}
          {cityTab === 'list' && (
            <div>
              <div className="relative mb-6">
                <input
                  type="text"
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              ) : filteredCities.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {searchTerm ? `No cities matching "${searchTerm}"` : 'No cities'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try a different search term or clear your search.' : 'Get started by adding a new city.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCities.map((city) => (
                    <div key={city.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      <div className="relative h-48">
                        {city.image_url ? (
                          <Image
                            src={city.image_url}
                            alt={city.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-4xl font-medium text-blue-600">{city.name[0]}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">{city.name}</h3>
                          <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                            {getLocalityCount(city.id)} localities
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{city.description}</p>
                        <div className="mt-4 flex justify-center space-x-2">
                          <button
                            className="px-3 py-1 text-sm border border-blue-300 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                            onClick={() => setViewingCity(city)}
                          >
                            View
                          </button>
                          <button
                            className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                            onClick={() => handleEditCity(city)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 text-sm border border-red-300 rounded text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => setShowDeleteConfirm(city.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add City Tab */}
          {cityTab === 'add' && (
            <div>
              <form onSubmit={handleCitySubmit} className="space-y-6 max-w-2xl mx-auto">
                {/* Image Upload */}
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 p-6 bg-gray-50 rounded-lg">
                  <div className="relative group">
                    {imagePreview ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                        <Image src={imagePreview} alt="City Image" width={128} height={128} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                        <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <label htmlFor="image-upload" className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                    <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-medium text-gray-900">City Image</h3>
                    <p className="text-sm text-gray-500 mt-1">Upload a city image. JPG, PNG or GIF up to 2MB.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">City Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={cityForm.name}
                      onChange={handleCityInputChange}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      placeholder="Enter city name"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={cityForm.description}
                      onChange={handleCityInputChange}
                      rows={4}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      placeholder="Enter city description"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <div className="relative" ref={stateDropdownRef}>
                      <input
                        type="text"
                        id="state"
                        value={cityForm.state}
                        onClick={() => setShowStateDropdown(true)}
                        onChange={(e) => {
                          setCityForm(prev => ({ ...prev, state: e.target.value }));
                          setStateSearchTerm(e.target.value);
                          setShowStateDropdown(true);
                        }}
                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                        placeholder="Select a state"
                        autoComplete="off"
                      />
                      {showStateDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
                          {filteredStates.length === 0 ? (
                            <div className="px-4 py-2 text-sm text-gray-500">No states found</div>
                          ) : (
                            filteredStates.map((state) => (
                              <div
                                key={state}
                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                onClick={() => {
                                  setCityForm(prev => ({ ...prev, state }));
                                  setStateSearchTerm('');
                                  setShowStateDropdown(false);
                                }}
                              >
                                {state}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (formDirty) {
                        if (window.confirm('You have unsaved changes. Are you sure you want to go back?')) {
                          setCityTab('list');
                          setFormDirty(false);
                          setEditingCity(null);
                        }
                      } else {
                        setCityTab('list');
                        setEditingCity(null);
                      }
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                  >
                    Back to Cities
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    {editingCity ? (loading ? 'Updating...' : 'Update City') : (loading ? 'Adding...' : 'Add City')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-30 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4">Delete City</h3>
                <p className="mb-6">Are you sure you want to delete this city? This action cannot be undone.</p>
                <div className="flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => setShowDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    onClick={() => handleDeleteCity(showDeleteConfirm)}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View City Modal */}
          {viewingCity && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-30 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">City Details</h3>
                  <button
                    onClick={() => setViewingCity(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                  {viewingCity.image_url ? (
                    <Image
                      src={viewingCity.image_url}
                      alt={viewingCity.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-4xl font-medium text-blue-600">{viewingCity.name[0]}</span>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900">{viewingCity.name}</h4>
                  <div className="mt-2 flex items-center">
                    <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      {viewingCity.state}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{viewingCity.description}</p>
                </div>

                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Localities</h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600">
                      {getLocalityCount(viewingCity.id)} localities in this city
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setViewingCity(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'localities' && (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Localities Management</h1>
            <button
              onClick={() => {
                if (formDirty) {
                  if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                    setLocalityTab('add');
                    setFormDirty(false);
                    setEditingLocality(null);
                    setLocalityForm({
                      city_id: '',
                      name: '',
                      description: '',
                      image_url: '',
                    });
                    setLocalityImageFile(null);
                    setLocalityImagePreview('');
                  }
                } else {
                  setLocalityTab('add');
                  setEditingLocality(null);
                  setLocalityForm({
                    city_id: '',
                    name: '',
                    description: '',
                    image_url: '',
                  });
                  setLocalityImageFile(null);
                  setLocalityImagePreview('');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Locality
            </button>
          </div>

          {/* Localities List Tab */}
          {localityTab === 'list' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search localities..."
                    value={localitySearchTerm}
                    onChange={(e) => setLocalitySearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Cities</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              ) : filteredLocalities.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {localitySearchTerm || selectedCity !== 'all' ? 'No localities found' : 'No localities'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {localitySearchTerm || selectedCity !== 'all' 
                      ? 'Try adjusting your search or filters.' 
                      : 'Get started by adding a new locality.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredLocalities.map((locality) => (
                    <div key={locality.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      <div className="relative h-48">
                        {locality.image_url ? (
                          <Image
                            src={locality.image_url}
                            alt={locality.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-4xl font-medium text-blue-600">{locality.name[0]}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">{locality.name}</h3>
                          <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                            {getCityName(locality.city_id)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{locality.description}</p>
                        <div className="mt-4 flex justify-center space-x-2">
                          <button
                            className="px-3 py-1 text-sm border border-blue-300 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                            onClick={() => setViewingLocality(locality)}
                          >
                            View
                          </button>
                          <button
                            className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                            onClick={() => handleEditLocality(locality)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 text-sm border border-red-300 rounded text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => setShowLocalityDeleteConfirm(locality.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Locality Tab */}
          {localityTab === 'add' && (
            <div>
              <form onSubmit={handleLocalitySubmit} className="space-y-6 max-w-2xl mx-auto">
                {/* Image Upload */}
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 p-6 bg-gray-50 rounded-lg">
                  <div className="relative group">
                    {localityImagePreview ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                        <Image src={localityImagePreview} alt="Locality Image" width={128} height={128} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                        <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <label htmlFor="locality-image-upload" className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                    <input id="locality-image-upload" type="file" accept="image/*" className="hidden" onChange={handleLocalityImageChange} />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-medium text-gray-900">Locality Image</h3>
                    <p className="text-sm text-gray-500 mt-1">Upload a locality image. JPG, PNG or GIF up to 2MB.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                    <label htmlFor="city_id" className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <select
                      id="city_id"
                      name="city_id"
                      value={localityForm.city_id}
                      onChange={handleLocalityInputChange}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    >
                      <option value="">Select a city</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Locality Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={localityForm.name}
                      onChange={handleLocalityInputChange}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      placeholder="Enter locality name"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={localityForm.description}
                      onChange={handleLocalityInputChange}
                      rows={4}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      placeholder="Enter locality description"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (formDirty) {
                        if (window.confirm('You have unsaved changes. Are you sure you want to go back?')) {
                          setLocalityTab('list');
                          setFormDirty(false);
                          setEditingLocality(null);
                        }
                      } else {
                        setLocalityTab('list');
                        setEditingLocality(null);
                      }
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                  >
                    Back to Localities
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    {editingLocality ? (loading ? 'Updating...' : 'Update Locality') : (loading ? 'Adding...' : 'Add Locality')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Delete Locality Confirmation Modal */}
          {showLocalityDeleteConfirm && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-30 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4">Delete Locality</h3>
                <p className="mb-6">Are you sure you want to delete this locality? This action cannot be undone.</p>
                <div className="flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => setShowLocalityDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    onClick={() => handleDeleteLocality(showLocalityDeleteConfirm)}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Locality Modal */}
          {viewingLocality && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-30 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Locality Details</h3>
                  <button
                    onClick={() => setViewingLocality(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                  {viewingLocality.image_url ? (
                    <Image
                      src={viewingLocality.image_url}
                      alt={viewingLocality.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-4xl font-medium text-blue-600">{viewingLocality.name[0]}</span>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{viewingLocality.name}</h4>
                    <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      {getCityName(viewingLocality.city_id)}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{viewingLocality.description}</p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setViewingLocality(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 