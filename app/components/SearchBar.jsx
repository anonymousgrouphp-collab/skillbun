"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ pages: [], roadmaps: [] });
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  const openSearch = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        closeSearch();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search
  useEffect(() => {
    if (!isOpen) return;

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          if (query.trim().length > 1) {
            trackEvent('search_query', {
              query: query.trim(),
              resultsCount: (data.pages?.length || 0) + (data.roadmaps?.length || 0),
            });
          }
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleResultClick = (href) => {
    closeSearch();
    setQuery('');
    router.push(href);
  };

  return (
    <div className={`search-container ${isOpen ? 'is-open' : ''}`} ref={searchRef}>
      <button
        type="button"
        className="search-mobile-trigger"
        aria-label="Open search"
        aria-expanded={isOpen}
        onClick={openSearch}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <div className="search-panel">
        <div
          className={`search-input-wrapper ${isOpen ? 'active' : ''}`}
          onClick={openSearch}
        >
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search roadmaps, pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={openSearch}
          />
          <div className="search-shortcut">
            <kbd>⌘K</kbd>
          </div>
        </div>

        {isOpen && (
          <div className="search-dropdown">
            {isLoading && !results.pages.length && !results.roadmaps.length ? (
              <div className="search-loading">
                <span className="search-spinner"></span> Searching...
              </div>
            ) : (
              <>
                {results.pages.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-label">Pages</div>
                    {results.pages.map((page) => (
                      <div
                        key={page.title}
                        className="search-item"
                        onClick={() => handleResultClick(page.href)}
                      >
                        <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {page.title}
                      </div>
                    ))}
                  </div>
                )}

                {results.roadmaps.length > 0 && (
                  <div className="search-group">
                    <div className="search-group-label">Roadmaps</div>
                    {results.roadmaps.map((roadmap) => (
                      <div
                        key={roadmap.slug}
                        className="search-item"
                        onClick={() => handleResultClick(`/roadmap/${roadmap.slug}`)}
                      >
                        <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        {roadmap.title}
                      </div>
                    ))}
                  </div>
                )}

                {results.pages.length === 0 && results.roadmaps.length === 0 && !isLoading && (
                  <div className="search-empty">
                    No results found for "{query}"
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
