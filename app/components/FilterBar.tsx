'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Slider } from "@/components/ui/slider";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Filter, X } from "lucide-react";
// import { supabase } from '@/lib/supabase';

type FilterBarProps = {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  availableBhkTypes: string[];
  availableDevelopers: { id: string; name: string; }[];
  availableLocalities: { id: string; name: string; city_id: string; }[];
};

export type FilterOptions = {
  bhkTypes: string[];
  budgetRange: [number, number];
  possessionStatus: string[];
  propertyTypes: string[];
  developers: string[];
  localities: string[];
};

const DEFAULT_FILTERS: FilterOptions = {
  bhkTypes: [],
  budgetRange: [0, 100],
  possessionStatus: [],
  propertyTypes: [],
  developers: [],
  localities: [],
};

const POSSESSION_STATUSES = [
  'Ready to Move',
  'Under Construction',
  'Not Started',
  'Completed'
] as const;

const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Plot',
  'Commercial',
  'Farm House'
] as const;

export default function FilterBar({ 
  onFilterChange, 
  initialFilters = DEFAULT_FILTERS,
  availableBhkTypes,
  availableDevelopers,
  availableLocalities,
}: FilterBarProps) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const prevFiltersRef = useRef<string>(JSON.stringify(initialFilters));

  // Initialize filters from URL on component mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newFilters = { ...DEFAULT_FILTERS };

    // Parse BHK types
    const bhkParam = params.get('bhk');
    if (bhkParam) {
      newFilters.bhkTypes = bhkParam.split(',');
    }

    // Parse budget range
    const budgetMin = params.get('budget_min');
    const budgetMax = params.get('budget_max');
    if (budgetMin && budgetMax) {
      newFilters.budgetRange = [Number(budgetMin), Number(budgetMax)];
    }

    // Parse possession status
    const statusParam = params.get('status');
    if (statusParam) {
      newFilters.possessionStatus = statusParam.split(',');
    }

    // Parse property types
    const typeParam = params.get('type');
    if (typeParam) {
      newFilters.propertyTypes = typeParam.split(',');
    }

    // Parse developers
    const developerParam = params.get('developer');
    if (developerParam) {
      newFilters.developers = developerParam.split(',');
    }

    // Parse localities
    const localityParam = params.get('locality');
    if (localityParam) {
      newFilters.localities = localityParam.split(',');
    }

    // Only update if there are actual changes to prevent infinite loops
    const currentFiltersString = prevFiltersRef.current;
    const newFiltersString = JSON.stringify(newFilters);
    
    if (currentFiltersString !== newFiltersString) {
      setFilters(newFilters);
      onFilterChange(newFilters);
      prevFiltersRef.current = newFiltersString;
    }
  }, [searchParams, onFilterChange]); // No need for filters dependency as we use the ref

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove filter params
    if (filters.bhkTypes.length > 0) {
      params.set('bhk', filters.bhkTypes.join(','));
    } else {
      params.delete('bhk');
    }

    if (filters.budgetRange[0] !== DEFAULT_FILTERS.budgetRange[0] || 
        filters.budgetRange[1] !== DEFAULT_FILTERS.budgetRange[1]) {
      params.set('budget_min', filters.budgetRange[0].toString());
      params.set('budget_max', filters.budgetRange[1].toString());
    } else {
      params.delete('budget_min');
      params.delete('budget_max');
    }

    if (filters.possessionStatus.length > 0) {
      params.set('status', filters.possessionStatus.join(','));
    } else {
      params.delete('status');
    }

    if (filters.propertyTypes.length > 0) {
      params.set('type', filters.propertyTypes.join(','));
    } else {
      params.delete('type');
    }

    if (filters.developers.length > 0) {
      params.set('developer', filters.developers.join(','));
    } else {
      params.delete('developer');
    }

    if (filters.localities.length > 0) {
      params.set('locality', filters.localities.join(','));
    } else {
      params.delete('locality');
    }

    // Update URL without refreshing the page
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    
    // Update the ref with current filters
    prevFiltersRef.current = JSON.stringify(filters);
  }, [filters, searchParams]); // Keep both filters and searchParams as dependencies

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleBhkTypeChange = (bhkType: string) => {
    const newBhkTypes = filters.bhkTypes.includes(bhkType)
      ? filters.bhkTypes.filter(type => type !== bhkType)
      : [...filters.bhkTypes, bhkType];
    handleFilterChange({ bhkTypes: newBhkTypes });
  };

  const handleBudgetChange = (value: number[]) => {
    handleFilterChange({ budgetRange: [value[0], value[1]] as [number, number] });
  };

  const handlePossessionStatusChange = (status: string) => {
    const newStatus = filters.possessionStatus.includes(status)
      ? filters.possessionStatus.filter(s => s !== status)
      : [...filters.possessionStatus, status];
    handleFilterChange({ possessionStatus: newStatus });
  };

  const handlePropertyTypeChange = (type: string) => {
    const newTypes = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter(t => t !== type)
      : [...filters.propertyTypes, type];
    handleFilterChange({ propertyTypes: newTypes });
  };

  // const handleDeveloperChange = (developerId: string) => {
  //   const newDevelopers = filters.developers.includes(developerId)
  //     ? filters.developers.filter(id => id !== developerId)
  //     : [...filters.developers, developerId];
  //   handleFilterChange({ developers: newDevelopers });
  // };

  // const handleLocalityChange = (localityId: string) => {
  //   const newLocalities = filters.localities.includes(localityId)
  //     ? filters.localities.filter(id => id !== localityId)
  //     : [...filters.localities, localityId];
  //   handleFilterChange({ localities: newLocalities });
  // };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
  };

  const FilterContent = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear All
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* BHK Type Filter */}
      <div className="space-y-2">
        <Label>BHK Type</Label>
        <div className="flex flex-wrap gap-2">
          {availableBhkTypes.map((type) => (
            <Button
              key={type}
              variant={filters.bhkTypes.includes(type) ? "default" : "outline"}
              size="sm"
              onClick={() => handleBhkTypeChange(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Budget Range Filter */}
      <div className="space-y-2">
        <Label>Budget Range (in Lakhs)</Label>
        <div className="px-2">
          <Slider
            value={filters.budgetRange}
            onValueChange={handleBudgetChange}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>₹{filters.budgetRange[0]}L</span>
            <span>₹{filters.budgetRange[1]}L</span>
          </div>
        </div>
      </div>

      {/* Possession Status Filter */}
      <div className="space-y-2">
        <Label>Possession Status</Label>
        <div className="flex flex-wrap gap-2">
          {POSSESSION_STATUSES.map((status) => (
            <Button
              key={status}
              variant={filters.possessionStatus.includes(status) ? "default" : "outline"}
              size="sm"
              onClick={() => handlePossessionStatusChange(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Property Type Filter */}
      <div className="space-y-2">
        <Label>Property Type</Label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => (
            <Button
              key={type}
              variant={filters.propertyTypes.includes(type) ? "default" : "outline"}
              size="sm"
              onClick={() => handlePropertyTypeChange(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Developer Filter */}
      <div className="space-y-2">
        <Label>Developer</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={filters.developers.length > 0}
              className="w-full justify-between"
            >
              {filters.developers.length > 0
                ? `${filters.developers.length} selected`
                : "Select developers..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search developers..." />
              <CommandEmpty>No developer found.</CommandEmpty>
              <CommandGroup>
                {availableDevelopers.map((developer) => (
                  <CommandItem
                    key={developer.id}
                    onSelect={() => {
                      handleFilterChange({
                        developers: filters.developers.includes(developer.id)
                          ? filters.developers.filter(id => id !== developer.id)
                          : [...filters.developers, developer.id]
                      });
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        filters.developers.includes(developer.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {developer.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Locality Filter */}
      <div className="space-y-2">
        <Label>Locality</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={filters.localities.length > 0}
              className="w-full justify-between"
            >
              {filters.localities.length > 0
                ? `${filters.localities.length} selected`
                : "Select localities..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search localities..." />
              <CommandEmpty>No locality found.</CommandEmpty>
              <CommandGroup>
                {availableLocalities.map((locality) => (
                  <CommandItem
                    key={locality.id}
                    onSelect={() => {
                      handleFilterChange({
                        localities: filters.localities.includes(locality.id)
                          ? filters.localities.filter(id => id !== locality.id)
                          : [...filters.localities, locality.id]
                      });
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        filters.localities.includes(locality.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {locality.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <Button
        variant="outline"
        className="lg:hidden fixed bottom-4 right-4 z-50 shadow-lg"
        onClick={() => setIsMobileFilterOpen(true)}
      >
        <Filter className="h-5 w-5 mr-2" />
        Filters
      </Button>

      {/* Mobile Filter Panel */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity",
          isMobileFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileFilterOpen(false)}
      >
        <div
          className={cn(
            "fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
            isMobileFilterOpen ? "translate-x-0" : "translate-x-full"
          )}
          onClick={e => e.stopPropagation()}
        >
          <FilterContent />
        </div>
      </div>

      {/* Desktop Filter Sidebar */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>
    </>
  );
}