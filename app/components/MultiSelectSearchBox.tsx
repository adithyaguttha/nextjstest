import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

const TAG_COLORS: Record<string, string> = {
  Developer: 'bg-blue-100 text-blue-700',
  Project: 'bg-green-100 text-green-700',
  Location: 'bg-yellow-100 text-yellow-700',
};

export type MultiSelectItem = {
  id: string;
  name: string;
  type: 'Developer' | 'Project' | 'Location';
};

interface MultiSelectSearchBoxProps {
  initialSelected?: MultiSelectItem[];
  placeholder?: string;
  onSearch: (selected: MultiSelectItem[]) => void;
}

export default function MultiSelectSearchBox({ initialSelected = [], placeholder = 'Search...', onSearch }: MultiSelectSearchBoxProps) {
  const [selected, setSelected] = useState<MultiSelectItem[]>(initialSelected);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<MultiSelectItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!input) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    setShowDropdown(true);
    (async () => {
      // Developers
      const { data: devs } = await supabase
        .from('developers')
        .select('id, name')
        .ilike('name', `%${input}%`)
        .limit(5);
      // Projects
      const { data: projs } = await supabase
        .from('projects')
        .select('id, name')
        .ilike('name', `%${input}%`)
        .limit(5);
      // Cities
      const { data: cities } = await supabase
        .from('cities')
        .select('id, name')
        .ilike('name', `%${input}%`)
        .limit(5);
      // Localities
      const { data: localities } = await supabase
        .from('localities')
        .select('id, name')
        .ilike('name', `%${input}%`)
        .limit(5);
      // Merge locations
      const locations: MultiSelectItem[] = [
        ...(cities || []).map((c) => ({ id: c.id, name: c.name, type: 'Location' as const })),
        ...(localities || []).map((l) => ({ id: l.id, name: l.name, type: 'Location' as const })),
      ];
      const allResults: MultiSelectItem[] = [
        ...(devs || []).map((d) => ({ id: d.id, name: d.name, type: 'Developer' as const })),
        ...(projs || []).map((p) => ({ id: p.id, name: p.name, type: 'Project' as const })),
        ...locations,
      ];
      // Exclude already selected
      setResults(allResults.filter(r => !selected.some(s => s.id === r.id && s.type === r.type)));
      setLoading(false);
    })();
  }, [input, selected]);

  const handleAdd = (item: MultiSelectItem) => {
    setSelected([...selected, item]);
    setInput('');
    setShowDropdown(false);
    setHighlighted(-1);
    inputRef.current?.focus();
  };

  const handleRemove = (id: string, type: string) => {
    setSelected(selected.filter(s => !(s.id === id && s.type === type)));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      setHighlighted((h) => (h + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      setHighlighted((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (highlighted >= 0 && highlighted < results.length) {
        handleAdd(results[highlighted]);
      } else if (input) {
        setInput('');
        setShowDropdown(false);
      }
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selected.length > 0) {
      onSearch(selected);
    }
  };

  return (
    <form className="flex items-center gap-2 w-full" onSubmit={handleSearch}>
      <div className="flex flex-1 items-center flex-wrap gap-2 min-h-[44px] px-2 py-1 border border-blue-200 rounded-full bg-white focus-within:ring-2 focus-within:ring-blue-400">
        {selected.map((item) => (
          <span key={item.type + '-' + item.id} className={`flex items-center gap-1 px-3 py-1 rounded-full border border-blue-200 ${TAG_COLORS[item.type]} text-base font-medium`}>
            {item.name}
            <button type="button" className="ml-1 focus:outline-none" onClick={() => handleRemove(item.id, item.type)}>
              <FiX className="w-4 h-4" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[120px] border-none outline-none bg-transparent py-2 px-2 text-base"
          placeholder={selected.length === 0 ? placeholder : 'Add more'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onFocus={() => input && setShowDropdown(true)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button type="submit" className="ml-2 p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600">
        <FiSearch className="w-5 h-5" />
      </button>
      {/* Autocomplete Dropdown */}
      {showDropdown && (results.length > 0 || loading) && (
        <div className="absolute left-0 mt-14 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-72 overflow-auto">
          {loading ? (
            <div className="px-4 py-3 text-gray-500">Searching...</div>
          ) : (
            results.map((item, idx) => (
              <div
                key={item.type + '-' + item.id + '-' + item.name}
                className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-50 ${highlighted === idx ? 'bg-blue-100' : ''}`}
                onMouseDown={() => handleAdd(item)}
              >
                <span className="truncate font-medium">{item.name}</span>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${TAG_COLORS[item.type]}`}>{item.type}</span>
              </div>
            ))
          )}
        </div>
      )}
    </form>
  );
} 