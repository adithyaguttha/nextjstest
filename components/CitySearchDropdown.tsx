'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/lib/supabase';

interface City {
  id: string;
  name: string;
}

interface CitySearchDropdownProps {
  selectedCity: City | null;
  onSelect: (city: City | null) => void;
  className?: string;
}

export default function CitySearchDropdown({
  selectedCity,
  onSelect,
  className,
}: CitySearchDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [cities, setCities] = React.useState<City[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch cities on component mount
  React.useEffect(() => {
    let isMounted = true;

    const fetchCities = async () => {
      if (!isMounted) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        if (isMounted) {
          setCities(data || []);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCities();

    return () => {
      isMounted = false;
    };
  }, [setLoading]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[200px] justify-between bg-white",
            className
          )}
        >
          {selectedCity ? selectedCity.name : "Search City"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search city..." />
          <CommandEmpty>No city found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {loading ? (
              <div className="py-2 px-4 text-sm text-gray-500">Loading cities...</div>
            ) : (
              cities.map((city) => (
                <CommandItem
                  key={city.id}
                  value={city.name}
                  onSelect={() => {
                    onSelect(city);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCity?.id === city.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {city.name}
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 