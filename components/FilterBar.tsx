import React, { useEffect } from 'react';

export type FilterOptions = {
  priceRange: [number, number];
  bhkTypes: string[];
  developers: string[];
  localities: string[];
  amenities: string[];
  availabilityStatus: string;
  propertyType: string;
  possessions: string[];
  sortBy: string;
};

type FilterBarProps = {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
};

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  // Move the useEffect inside the component
  useEffect(() => {
    const queryParams = new URLSearchParams();
    
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100) {
      queryParams.set('price', `${filters.priceRange[0]}-${filters.priceRange[1]}`);
    }
    
    if (filters.bhkTypes.length > 0) {
      queryParams.set('bhk', filters.bhkTypes.join(','));
    }
    
    if (filters.developers.length > 0) {
      queryParams.set('developer', filters.developers.join(','));
    }
    
    if (filters.localities.length > 0) {
      queryParams.set('locality', filters.localities.join(','));
    }
    
    if (filters.amenities.length > 0) {
      queryParams.set('amenities', filters.amenities.join(','));
    }
    
    if (filters.availabilityStatus !== 'all') {
      queryParams.set('status', filters.availabilityStatus);
    }
    
    if (filters.propertyType !== 'all') {
      queryParams.set('type', filters.propertyType);
    }
    
    if (filters.possessions.length > 0) {
      queryParams.set('possession', filters.possessions.join(','));
    }
    
    if (filters.sortBy !== 'recommended') {
      queryParams.set('sort', filters.sortBy);
    }
    
    const newUrl = queryParams.toString() ? `?${queryParams.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [filters]); // Added filters as dependency

  // Example of using onFilterChange
  const handleClearFilters = () => {
    const defaultFilters: FilterOptions = {
      priceRange: [0, 100],
      bhkTypes: [],
      developers: [],
      localities: [],
      amenities: [],
      availabilityStatus: 'all',
      propertyType: 'all',
      possessions: [],
      sortBy: 'recommended'
    };
    onFilterChange(defaultFilters);
  };

  // Render the filter UI
  return (
    <div>
      {/* Filter UI implementation */}
      <p>Filter component content goes here</p>
      <button onClick={handleClearFilters}>Clear Filters</button>
    </div>
  );
}