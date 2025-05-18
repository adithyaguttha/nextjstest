'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../../lib/AuthContext';
import { supabase } from '../../../lib/supabase';

interface FormData {
  name: string;
  description: string;
  website_link: string;
  phone: string;
  email: string;
  logo_url: string;
}

export default function AddDeveloperPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    website_link: '',
    phone: '',
    email: '',
    logo_url: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth?tab=login');
      return;
    }

    if (!user.is_admin) {
      router.push('/');
      return;
    }
  }, [user, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setMessage({ type: 'error', text: 'Logo file size should be less than 2MB' });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Developer name is required' });
      return false;
    }
    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Email is required' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return false;
    }
    if (!formData.phone.trim()) {
      setMessage({ type: 'error', text: 'Phone number is required' });
      return false;
    }
    if (!formData.website_link.trim()) {
      setMessage({ type: 'error', text: 'Website link is required' });
      return false;
    }
    if (!/^https?:\/\/.+/.test(formData.website_link)) {
      setMessage({ type: 'error', text: 'Please enter a valid website URL' });
      return false;
    }
    if (!formData.description.trim()) {
      setMessage({ type: 'error', text: 'Description is required' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.is_admin) return;

    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      let logo_url = formData.logo_url;

      // Upload logo if selected
      if (logoFile) {
        try {
          const fileExt = logoFile.name.split('.').pop();
          const fileName = `developer-logos/${user.id}-${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('developers')
            .upload(fileName, logoFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error(`Failed to upload logo: ${uploadError.message}`);
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('developers')
            .getPublicUrl(fileName);

          logo_url = publicUrl;
        } catch (uploadErr) {
          console.error('Logo upload error:', uploadErr);
          throw new Error(uploadErr instanceof Error ? uploadErr.message : 'Failed to upload logo');
        }
      }

      // Create developer
      try {
        const { error: insertError } = await supabase
          .from('developers')
          .insert({
            name: formData.name,
            description: formData.description,
            website_link: formData.website_link,
            phone: formData.phone,
            email: formData.email,
            logo_url,
            created_by: user.id,
          });

        if (insertError) {
          console.error('Database insert error:', insertError);
          throw new Error(`Failed to create developer: ${insertError.message}`);
        }

        setMessage({ type: 'success', text: 'Developer added successfully!' });
        
        // Clear form
        setFormData({
          name: '',
          description: '',
          website_link: '',
          phone: '',
          email: '',
          logo_url: '',
        });
        setLogoFile(null);
        setLogoPreview('');

        // Redirect after a short delay
        setTimeout(() => {
          router.push('/developers');
        }, 1500);

      } catch (dbErr) {
        console.error('Database error:', dbErr);
        throw new Error(dbErr instanceof Error ? dbErr.message : 'Failed to create developer record');
      }

    } catch (error) {
      console.error('Error adding developer:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to add developer. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.is_admin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Add New Developer</h1>
            <p className="mt-2 text-sm text-gray-600">
              Fill in the details to add a new property developer
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo Upload */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 p-6 bg-gray-50 rounded-lg">
              <div className="relative group">
                {logoPreview ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={logoPreview}
                      alt="Developer Logo"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <svg
                      className="w-12 h-12 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                )}
                <label
                  htmlFor="logo-upload"
                  className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-medium text-gray-900">Developer Logo</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Upload a logo image. JPG, PNG or GIF up to 2MB.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name */}
              <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Developer Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  placeholder="Enter developer name"
                />
              </div>

              {/* Email */}
              <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  placeholder="Enter email address"
                />
              </div>

              {/* Phone */}
              <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Website */}
              <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                <label htmlFor="website_link" className="block text-sm font-medium text-gray-700 mb-2">
                  Website Link *
                </label>
                <input
                  type="url"
                  id="website_link"
                  name="website_link"
                  value={formData.website_link}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  placeholder="https://example.com"
                />
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg p-4 transition-all duration-300 hover:bg-gray-50">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  placeholder="Enter developer description"
                />
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              } transition-all duration-300`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/developers')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  'Add Developer'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 