'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import CitySearchDropdown from '@/components/CitySearchDropdown';

const TAG_COLORS = {
  Developer: 'bg-blue-100 text-blue-700',
  Project: 'bg-green-100 text-green-700',
  Locality: 'bg-yellow-100 text-yellow-700',
};

type ResultItem = {
  id: string;
  name: string;
  type: 'Developer' | 'Project' | 'Locality' | 'Unknown';
};

interface City {
  id: string;
  name: string;
}

const PLACEHOLDER_TEXTS = [
  'Search Projects',
  'Search Localities',
  'Search Developers'
];

// Tag label mapping for display
const TAG_LABELS: Record<string, string> = {
  Project: 'Project',
  Locality: 'Locality',
  Developer: 'Developer',
  Unknown: 'Unknown',
};

const TAG_ICONS: Record<string, string> = {
  Project: '🏗️',
  Locality: '📍',
  Developer: '🧱',
  Unknown: '❓',
};

const TAG_COLORS_SAFE = {
  Project: TAG_COLORS.Project,
  Locality: TAG_COLORS.Locality,
  Developer: TAG_COLORS.Developer,
  Unknown: 'bg-gray-200 text-gray-700',
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

interface SearchBoxProps {
  cardClassName?: string;
}

export default function SearchBox({ cardClassName = '' }: SearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);
  const [suggestions, setSuggestions] = useState<ResultItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearchTerm) {
        setSuggestions([]);
        setShowSuggestions(false);
      return;
    }

      setIsLoading(true);
      try {
        // Fetch projects
        const { data: projects } = await supabase
        .from('projects')
        .select('id, name')
          .ilike('name', `%${debouncedSearchTerm}%`)
        .limit(5);

        // Fetch localities
      const { data: localities } = await supabase
        .from('localities')
        .select('id, name')
          .ilike('name', `%${debouncedSearchTerm}%`)
          .limit(5);

        // Fetch developers
        const { data: developers } = await supabase
          .from('developers')
          .select('id, name')
          .ilike('name', `%${debouncedSearchTerm}%`)
        .limit(5);

        const allSuggestions: ResultItem[] = [
          ...(projects || []).map(p => ({ id: p.id, name: p.name, type: 'Project' as const })),
          ...(localities || []).map(l => ({ id: l.id, name: l.name, type: 'Locality' as const })),
          ...(developers || []).map(d => ({ id: d.id, name: d.name, type: 'Developer' as const }))
        ];

        setSuggestions(allSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = async (suggestion: ResultItem) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    
    const queryParams = new URLSearchParams();
    
    if (selectedCity) {
      queryParams.set('city', selectedCity.name);
    }

    if (suggestion.type === 'Locality') {
      // For localities, we need to get the locality ID and city ID
      try {
        const { data: localityData, error: localityError } = await supabase
          .from('localities')
          .select('id, city_id')
          .eq('id', suggestion.id)
          .single();

        if (localityError) throw localityError;

        if (localityData) {
          queryParams.set('locality_id', localityData.id);
          // If no city is selected, get the city name for this locality
          if (!selectedCity) {
            const { data: cityData, error: cityError } = await supabase
              .from('cities')
              .select('name')
              .eq('id', localityData.city_id)
              .single();
            
            if (!cityError && cityData) {
              queryParams.set('city', cityData.name);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching locality details:', error);
      }
      } else {
      // For other types (Project, Developer), just pass the name
      queryParams.set('query', suggestion.name);
      queryParams.set('type', suggestion.type.toLowerCase());
    }

    router.push(`/listings?${queryParams.toString()}`);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaceholderVisible(false);
      setTimeout(() => {
        setCurrentPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
        setIsPlaceholderVisible(true);
      }, 400);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle search button click
  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (selectedCity) {
      queryParams.set('city', selectedCity.name);
    }
    if (searchTerm) {
      queryParams.set('query', searchTerm);
    }
    router.push(`/listings?${queryParams.toString()}`);
  };

  // Update placeholder text to combine city context with rotating placeholders
  const getPlaceholderText = () => {
    const basePlaceholder = PLACEHOLDER_TEXTS[currentPlaceholderIndex];
    if (selectedCity) {
      return `${basePlaceholder} in ${selectedCity.name}`;
    }
    return basePlaceholder;
  };

  // Update the input onChange handler in both mobile and desktop layouts
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  // Render suggestions dropdown
  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;

    return (
      <div
        ref={dropdownRef}
        className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto"
      >
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
        ) : (
          <div className="py-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.id}`}
                className={cn(
                  "w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2",
                  highlightedIndex === index && "bg-gray-50"
                )}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <span className="text-lg">{TAG_ICONS[suggestion.type]}</span>
                <span className="flex-1">{suggestion.name}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  TAG_COLORS_SAFE[suggestion.type]
                )}>
                  {TAG_LABELS[suggestion.type]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center">
      {/* Mobile Hero Card */}
      <div className={cn("block sm:hidden w-[90vw] max-w-md bg-white rounded-xl shadow-xl px-6 py-8 flex flex-col items-center space-y-5 mx-auto z-10", cardClassName)}>
        {/* Heading */}
        <h1 className="text-3xl font-bold text-center leading-tight">
          Find Your Dream<br />Property
        </h1>
        {/* Subtitle */}
        <p className="text-base text-gray-600 text-center">
          Discover the perfect home across India&apos;s top cities
        </p>
        {/* City Dropdown */}
        <div className="w-full">
          <CitySearchDropdown
            selectedCity={selectedCity}
            onSelect={(city) => {
              setSelectedCity(city);
            }}
            className="w-full h-12 rounded-lg border border-gray-200 text-base px-4"
          />
        </div>
        {/* Search Input with Suggestions */}
        <div className="w-full relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            ref={inputRef}
            type="text"
            placeholder={getPlaceholderText()}
            className={cn(
              "w-full h-12 rounded-lg border border-gray-200 pl-11 pr-4 text-base placeholder:text-gray-500 bg-white",
              "transition-[opacity] duration-700 ease-in-out",
              isPlaceholderVisible 
                ? "placeholder:opacity-100" 
                : "placeholder:opacity-0"
            )}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => {
              if (searchTerm) setShowSuggestions(true);
            }}
            onBlur={() => setShowSuggestions(false)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {renderSuggestions()}
        </div>
        {/* Search Button */}
        <button
          className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold text-lg shadow hover:bg-blue-700 transition"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {/* Desktop/Tablet Layout (unchanged) */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-lg px-4 sm:px-6 py-4 sm:py-5 w-full max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
          <div className="w-full sm:w-[200px]">
            <CitySearchDropdown
              selectedCity={selectedCity}
              onSelect={(city) => {
                setSelectedCity(city);
              }}
              className="w-full h-[46px] sm:h-[42px] text-base sm:text-sm"
            />
          </div>
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder={getPlaceholderText()}
              className={cn(
                "w-full h-[46px] sm:h-[42px] pl-10 pr-4 rounded-xl sm:rounded-lg",
                "border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500",
                "text-gray-700 bg-white shadow-sm text-base sm:text-sm",
                "placeholder:text-gray-500 placeholder:text-sm sm:placeholder:text-base",
                "transition-[opacity] duration-700 ease-in-out",
                isPlaceholderVisible 
                  ? "placeholder:opacity-100" 
                  : "placeholder:opacity-0"
              )}
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => {
                if (searchTerm) setShowSuggestions(true);
              }}
              onBlur={() => setShowSuggestions(false)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            {renderSuggestions()}
          </div>
          <button
            className={cn(
              "w-full sm:w-auto h-[46px] sm:h-[42px] px-6 sm:px-8",
              "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
              "text-white rounded-xl sm:rounded-lg",
              "font-semibold text-base sm:text-sm",
              "shadow-sm hover:shadow transition-shadow",
              "flex items-center justify-center"
            )}
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}