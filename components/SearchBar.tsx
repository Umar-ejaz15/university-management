'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, User, Building2, GraduationCap, X } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  type: 'faculty' | 'department' | 'person';
  id: string;
  name: string;
  subtitle?: string;
  url: string;
  facultyId?: string;
}

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({ placeholder = 'Search faculties, departments, or people...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (response.ok) {
          setResults(data.results);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'faculty':
        return <Building2 className="w-5 h-5 text-[#2d6a4f]" />;
      case 'department':
        return <GraduationCap className="w-5 h-5 text-[#40916c]" />;
      case 'person':
        return <User className="w-5 h-5 text-[#52b788]" />;
      default:
        return <Search className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative bg-white rounded-2xl shadow-sm border border-[#e5e5e5] overflow-hidden">
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#666666] w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-14 pr-14 py-4 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-transparent transition-all bg-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-[#999999] hover:text-[#1a1a1a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showResults && (query.trim().length >= 2) && (
        <div className="absolute z-50 w-full mt-3 bg-white rounded-2xl shadow-lg border border-[#e5e5e5] max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d6a4f] mx-auto mb-3"></div>
              <p className="text-sm text-[#666666]">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.url}
                  onClick={() => {
                    setShowResults(false);
                    setQuery('');
                  }}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f5f5f5] transition-colors border-b border-[#e5e5e5] last:border-b-0"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#f5f5f5] flex items-center justify-center">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-[#1a1a1a] truncate text-sm">{result.name}</p>
                    {result.subtitle && (
                      <p className="text-xs text-[#666666] truncate mt-0.5">{result.subtitle}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs font-medium text-[#999999] uppercase tracking-wider px-2 py-1 bg-[#f5f5f5] rounded-full">
                      {result.type}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-[#e5e5e5] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#666666]">No results found for "{query}"</p>
              <p className="text-xs text-[#999999] mt-1">Try searching for faculties, departments, or people</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
