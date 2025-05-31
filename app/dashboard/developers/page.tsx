'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/AuthContext';
import { toast } from 'react-hot-toast';

interface Developer {
  id: string;
  name: string;
  description: string;
  website_link: string;
  phone: string;
  email: string;
  logo_url: string;
  created_by: string;
  created_at: string;
}

export default function DevelopersPage() {
  const { user } = useAuth();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [devLoading, setDevLoading] = useState<boolean>(false);
  const [devError, setDevError] = useState<string | null>(null);
  const [developerTab, setDeveloperTab] = useState<'list' | 'add'>('list');
  const [formDirty, setFormDirty] = useState(false);
  const [developerSearchTerm, setDeveloperSearchTerm] = useState<string>('');
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewingDeveloper, setViewingDeveloper] = useState<Developer | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const [devForm, setDevForm] = useState<{
    name: string;
    description: string;
    website_link: string;
    phone: string;
    email: string;
    logo_url: string;
  }>({
    name: '',
    description: '',
    website_link: '',
    phone: '',
    email: '',
    logo_url: '',
  });

  useEffect(() => {
    fetchDevelopers();

    // Check localStorage for tab preference
    const savedDeveloperTab = localStorage.getItem('developerTab');
    if (savedDeveloperTab === 'add') {
      setDeveloperTab('add');
      // Clear the localStorage after reading
      localStorage.removeItem('developerTab');
    }
  }, []);

  const fetchDevelopers = async () => {
    setDevLoading(true);
    setDevError(null);
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDevelopers((data as Developer[]) || []);
    } catch {
      setDevError('Failed to load developers');
    } finally {
      setDevLoading(false);
    }
  };

  const handleDevInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDevForm((prev) => ({ ...prev, [name]: value }));
    setFormDirty(true);
  };

  const handleDevLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo file size should be less than 2MB', { duration: 3000 });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setFormDirty(true);
    }
  };

  const validateDevForm = () => {
    if (!devForm.name.trim()) {
      toast.error('Developer name is required', { duration: 3000 });
      return false;
    }
    if (!devForm.email.trim()) {
      toast.error('Email is required', { duration: 3000 });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(devForm.email)) {
      toast.error('Please enter a valid email address', { duration: 3000 });
      return false;
    }
    if (!devForm.phone.trim()) {
      toast.error('Phone number is required', { duration: 3000 });
      return false;
    }
    if (!devForm.website_link.trim()) {
      toast.error('Website link is required', { duration: 3000 });
      return false;
    }
    if (!/^https?:\/\/.+/.test(devForm.website_link)) {
      toast.error('Please enter a valid website URL', { duration: 3000 });
      return false;
    }
    if (!devForm.description.trim()) {
      toast.error('Description is required', { duration: 3000 });
      return false;
    }
    return true;
  };

  const handleEditDeveloper = (developer: Developer) => {
    setEditingDeveloper(developer);
    setDevForm({
      name: developer.name,
      description: developer.description,
      website_link: developer.website_link,
      phone: developer.phone,
      email: developer.email,
      logo_url: developer.logo_url,
    });
    setLogoFile(null);
    setLogoPreview(developer.logo_url || '');
    setDeveloperTab('add');
  };

  const handleDeleteDeveloper = async (id: string) => {
    setDevLoading(true);
    try {
      const { error } = await supabase
        .from('developers')
        .delete()
        .eq('id', id);
      if (error) throw new Error(`Failed to delete developer: ${error.message}`);
      toast.success('Developer deleted successfully!', { duration: 3000 });
      fetchDevelopers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete developer. Please try again.', { duration: 3000 });
    } finally {
      setDevLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleDevSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateDevForm() || !user) return;
    setDevLoading(true);
    try {
      let logo_url = devForm.logo_url;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `developer-logos/${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('developers')
          .upload(fileName, logoFile, { cacheControl: '3600', upsert: false });
        if (uploadError) throw new Error(`Failed to upload logo: ${uploadError.message}`);
        const { data } = supabase.storage
          .from('developers')
          .getPublicUrl(fileName);
        logo_url = data.publicUrl;
      }
      if (editingDeveloper) {
        // Update
        const { error: updateError } = await supabase
          .from('developers')
          .update({
            name: devForm.name,
            description: devForm.description,
            website_link: devForm.website_link,
            phone: devForm.phone,
            email: devForm.email,
            logo_url,
          })
          .eq('id', editingDeveloper.id);
        if (updateError) throw new Error(`Failed to update developer: ${updateError.message}`);
        toast.success('Developer updated successfully!', { duration: 3000 });
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('developers')
          .insert({
            name: devForm.name,
            description: devForm.description,
            website_link: devForm.website_link,
            phone: devForm.phone,
            email: devForm.email,
            logo_url,
            created_by: user.id,
          });
        if (insertError) throw new Error(`Failed to create developer: ${insertError.message}`);
        toast.success('Developer added successfully!', { duration: 3000 });
      }
      setDevForm({ name: '', description: '', website_link: '', phone: '', email: '', logo_url: '' });
      setLogoFile(null);
      setLogoPreview('');
      setFormDirty(false);
      setEditingDeveloper(null);
      fetchDevelopers();
      setTimeout(() => setDeveloperTab('list'), 1200);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save developer. Please try again.', { duration: 3000 });
    } finally {
      setDevLoading(false);
    }
  };

  const filteredDevelopers = useMemo(() => {
    if (!developerSearchTerm.trim()) return developers;
    return developers.filter(dev => 
      dev.name.toLowerCase().includes(developerSearchTerm.toLowerCase()) ||
      dev.email.toLowerCase().includes(developerSearchTerm.toLowerCase()) ||
      dev.description.toLowerCase().includes(developerSearchTerm.toLowerCase())
    );
  }, [developers, developerSearchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-7xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Developers</h1>
        <button
          onClick={() => {
            if (formDirty) {
              if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                setDeveloperTab('add');
                setFormDirty(false);
                setEditingDeveloper(null);
                setDevForm({
                  name: '',
                  description: '',
                  website_link: '',
                  phone: '',
                  email: '',
                  logo_url: '',
                });
                setLogoFile(null);
                setLogoPreview('');
              }
            } else {
              setDeveloperTab('add');
              setEditingDeveloper(null);
              setDevForm({
                name: '',
                description: '',
                website_link: '',
                phone: '',
                email: '',
                logo_url: '',
              });
              setLogoFile(null);
              setLogoPreview('');
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Developer
        </button>
      </div>

      {/* Modern Developers Section Tabs */}
      <div className="relative flex w-full max-w-xl mx-auto bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <button
          className={`flex-1 flex items-center justify-center py-3 text-center font-semibold focus:outline-none transition-colors duration-300 z-10 ${developerTab === 'list' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
          onClick={() => {
            if (formDirty) {
              if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                setDeveloperTab('list');
                setFormDirty(false);
              }
            } else {
              setDeveloperTab('list');
            }
          }}
        >
          <span className="w-full text-center">Developers List</span>
        </button>
        <button
          className={`flex-1 flex items-center justify-center py-3 text-center font-semibold focus:outline-none transition-colors duration-300 z-10 ${developerTab === 'add' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
          onClick={() => {
            if (formDirty) {
              if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                setDeveloperTab('add');
                setFormDirty(false);
              }
            } else {
              setDeveloperTab('add');
            }
          }}
        >
          <span className="w-full text-center">Add Developer</span>
        </button>
      </div>

      {/* Developers List Tab */}
      {developerTab === 'list' && (
        <div>
          <div className="relative mb-6">
            <input
              type="text"
              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search developers..."
              value={developerSearchTerm}
              onChange={(e) => setDeveloperSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {devLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : devError ? (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{devError}</p>
            </div>
          ) : filteredDevelopers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {developerSearchTerm ? `No developers matching "${developerSearchTerm}"` : 'No developers'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {developerSearchTerm ? 'Try a different search term or clear your search.' : 'Get started by adding a new developer.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDevelopers.map((developer) => (
                <div key={developer.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {developer.logo_url ? (
                          <Image src={developer.logo_url} alt={developer.name} width={48} height={48} className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <span className="text-xl font-medium text-blue-600">{developer.name[0]}</span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{developer.name}</h3>
                          <p className="text-sm text-gray-500">{developer.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {developer.website_link && (
                        <a href={developer.website_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Website
                        </a>
                      )}
                      {developer.phone && (
                        <span className="text-gray-500">{developer.phone}</span>
                      )}
                    </div>
                    <div className="mt-6 flex justify-center space-x-2">
                      <button
                        className="px-3 py-1 text-sm border border-blue-300 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                        onClick={() => setViewingDeveloper(developer)}
                      >
                        View
                      </button>
                      <button
                        className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                        onClick={() => handleEditDeveloper(developer)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 text-sm border border-red-300 rounded text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => setShowDeleteConfirm(developer.id)}
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

      {/* Add Developer Tab */}
      {developerTab === 'add' && (
        <div>
          <form onSubmit={handleDevSubmit} className="space-y-6 max-w-2xl mx-auto">
            {/* Logo Upload */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 p-6 bg-gray-50 rounded-lg">
              <div className="relative group">
                {logoPreview ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <Image src={logoPreview} alt="Developer Logo" width={128} height={128} className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
                <label htmlFor="logo-upload" className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleDevLogoChange} />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-medium text-gray-900">Developer Logo</h3>
                <p className="text-sm text-gray-500 mt-1">Upload a logo image. JPG, PNG or GIF up to 2MB.</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Developer Name *</label>
                <input type="text" id="name" name="name" value={devForm.name} onChange={handleDevInputChange} className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300" placeholder="Enter developer name" />
              </div>
              <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input type="email" id="email" name="email" value={devForm.email} onChange={handleDevInputChange} className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300" placeholder="Enter email address" />
              </div>
              <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input type="tel" id="phone" name="phone" value={devForm.phone} onChange={handleDevInputChange} className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300" placeholder="Enter phone number" />
              </div>
              <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                <label htmlFor="website_link" className="block text-sm font-medium text-gray-700 mb-2">Website Link *</label>
                <input type="url" id="website_link" name="website_link" value={devForm.website_link} onChange={handleDevInputChange} className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300" placeholder="https://example.com" />
              </div>
              <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea id="description" name="description" value={devForm.description} onChange={handleDevInputChange} rows={4} className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300" placeholder="Enter developer description" />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (formDirty) {
                    if (window.confirm('You have unsaved changes. Are you sure you want to go back?')) {
                      setDeveloperTab('list');
                      setFormDirty(false);
                      setEditingDeveloper(null);
                    }
                  } else {
                    setDeveloperTab('list');
                    setEditingDeveloper(null);
                  }
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
              >
                Back to Developers
              </button>
              <button
                type="submit"
                disabled={devLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                {editingDeveloper ? (devLoading ? 'Updating...' : 'Update Developer') : (devLoading ? 'Adding...' : 'Add Developer')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Developer</h3>
            <p className="mb-6">Are you sure you want to delete this developer? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => handleDeleteDeveloper(showDeleteConfirm)}
                disabled={devLoading}
              >
                {devLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Developer Modal */}
      {viewingDeveloper && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Developer Details</h3>
              <button
                onClick={() => setViewingDeveloper(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center mb-6">
              {viewingDeveloper.logo_url ? (
                <Image src={viewingDeveloper.logo_url} alt={viewingDeveloper.name} width={80} height={80} className="h-20 w-20 rounded-lg object-cover" />
              ) : (
                <div className="h-20 w-20 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-medium text-blue-600">{viewingDeveloper.name[0]}</span>
                </div>
              )}
              <div className="ml-6">
                <h4 className="text-lg font-medium text-gray-900">{viewingDeveloper.name}</h4>
                <p className="text-gray-600 mt-1">{viewingDeveloper.email}</p>
                <p className="text-gray-600">{viewingDeveloper.phone}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h5>
              <p className="text-gray-800">{viewingDeveloper.description}</p>
            </div>
            
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Website</h5>
              <a 
                href={viewingDeveloper.website_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {viewingDeveloper.website_link}
              </a>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setViewingDeveloper(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 