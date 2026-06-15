import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SelectOption {
  id: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: SelectOption[];
  selected: SelectOption[];
  onToggle: (option: SelectOption) => void;
  placeholder: string;
  error?: string;
  onSearch?: (query: string) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selected,
  onToggle,
  placeholder,
  error,
  onSearch,
  onLoadMore,
  isLoading,
  hasMore,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const selectedIds = new Set(selected.map(s => s.id));

  const filtered = onSearch
    ? options
    : search
      ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
      : options;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(p => !p)}
        className={`flex items-center justify-between w-full px-4 py-3 bg-surface-overlay border ${error ? 'border-red-700' : 'border-stroke-medium'} rounded-lg cursor-pointer font-inter text-sm text-text-tertiary text-left box-border`}
      >
        <span>{placeholder}</span>
        <ChevronDown size={16} className="text-text-tertiary shrink-0" />
      </button>

      {error && (
        <span className="block mt-1 font-inter text-xs text-red-700">{error}</span>
      )}

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-surface-card border border-stroke-medium rounded-lg shadow-lg z-[100] flex flex-col max-h-64">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-stroke-light shrink-0">
            <Search size={14} className="text-text-tertiary shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search…"
              className="flex-1 border-none outline-none bg-transparent font-inter text-sm text-text-primary placeholder:text-text-placeholder"
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="border-none bg-transparent cursor-pointer p-0 flex items-center"
              >
                <X size={14} className="text-text-tertiary" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 && !isLoading ? (
              <p className="m-0 px-4 py-3 font-inter text-sm text-text-tertiary text-center">
                No results found
              </p>
            ) : (
              <>
                {filtered.map(option => {
                  const isSelected = selectedIds.has(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onToggle(option)}
                      className={`flex items-center gap-2.5 w-full px-4 py-2.5 border-none cursor-pointer text-left box-border ${isSelected ? 'bg-primary-50' : 'bg-transparent hover:bg-canvas-100'}`}
                    >
                      <div className={`w-4 h-4 rounded shrink-0 flex items-center justify-center border-2 ${isSelected ? 'bg-brand-navy border-brand-navy' : 'bg-transparent border-stroke-medium'}`}>
                        {isSelected && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="font-inter text-sm text-text-primary">{option.label}</span>
                    </button>
                  );
                })}
                {isLoading && (
                  <div className="flex justify-center py-3">
                    <div className="w-4 h-4 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!isLoading && hasMore && onLoadMore && (
                  <button
                    type="button"
                    onClick={onLoadMore}
                    className="w-full px-4 py-2.5 border-none border-t border-stroke-light bg-transparent cursor-pointer font-inter text-sm text-brand-navy hover:bg-canvas-100 text-center"
                  >
                    Load more
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
