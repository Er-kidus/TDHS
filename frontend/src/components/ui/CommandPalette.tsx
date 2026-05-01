import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Phone, Calendar, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { debounce } from '@/lib/utils';

interface Patient {
  id: string;
  national_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  address: string;
  city: string;
  blood_type: string;
  last_visit: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: Patient) => void;
}

export function CommandPalette({ isOpen, onClose, onSelectPatient }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/emr/patients/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.patients || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  // Search on query change
  useEffect(() => {
    debouncedSearch(query);
  }, [query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelectPatient(results[selectedIndex]);
          onClose();
          setQuery('');
          setResults([]);
        }
        break;
      case 'Escape':
        onClose();
        setQuery('');
        setResults([]);
        break;
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    onSelectPatient(patient);
    onClose();
    setQuery('');
    setResults([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
              placeholder="Search patients by National ID, Phone, or Name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={onClose}
              className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">ESC</kbd>
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
                <span className="text-gray-600">Searching patients...</span>
              </div>
            )}

            {!loading && query.length < 2 && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Type at least 2 characters to search</p>
                <p className="text-sm text-gray-400 mt-2">
                  Search by National ID, Phone Number, or Patient Name
                </p>
              </div>
            )}

            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No patients found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Try searching with different criteria
                </p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {results.length} {results.length === 1 ? 'Patient' : 'Patients'} Found
                </div>
                {results.map((patient, index) => (
                  <div
                    key={patient.id}
                    className={cn(
                      'px-4 py-3 cursor-pointer transition-colors',
                      index === selectedIndex
                        ? 'bg-emerald-50 border-l-4 border-emerald-500'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    )}
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="font-medium text-gray-900 truncate">
                            {patient.first_name} {patient.last_name}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {patient.phone}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(patient.date_of_birth)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {patient.city}
                          </div>
                        </div>
                        <div className="flex items-center mt-2 text-xs text-gray-400 space-x-4">
                          <span>ID: {patient.national_id}</span>
                          <span>Blood: {patient.blood_type}</span>
                          {patient.last_visit && (
                            <span>Last: {formatDate(patient.last_visit)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Enter</kbd>
                <span>Select patient</span>
              </div>
              <div className="flex items-center space-x-4">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for using command palette
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  // Global keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
    selectedPatient,
    setSelectedPatient,
  };
}
