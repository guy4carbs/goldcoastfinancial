/**
 * UniversalSearch - Command palette with ⌘K shortcut
 * Searches across leads, policies, users, and more based on user role
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  User,
  FileText,
  Building2,
  Ticket,
  Bot,
  Settings,
  Search,
  Clock,
  ArrowRight,
  Users,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

// =============================================================================
// TYPES
// =============================================================================

interface SearchResult {
  id: string;
  type: 'lead' | 'policy' | 'client' | 'agent' | 'ticket' | 'user';
  title: string;
  subtitle?: string;
  url: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const RECENT_SEARCHES_KEY = 'gcf-recent-searches';
const MAX_RECENT_SEARCHES = 5;

const RESULT_ICONS: Record<string, LucideIcon> = {
  lead: User,
  policy: FileText,
  client: Building2,
  agent: Users,
  ticket: Ticket,
  user: User,
  ai_agent: Bot,
};

const QUICK_ACTIONS = [
  { id: 'new-lead', label: 'Create new lead', icon: User, url: '/agents/inbox?action=new' },
  { id: 'new-quote', label: 'Generate quote', icon: FileText, url: '/agents/quotes?action=new' },
  { id: 'settings', label: 'Open settings', icon: Settings, url: '/agents/settings' },
];

// =============================================================================
// HELPERS
// =============================================================================

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  try {
    const recent = getRecentSearches();
    const updated = [query, ...recent.filter((q) => q !== query)].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Silent fail
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Silent fail
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

interface UniversalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UniversalSearch({ open, onOpenChange }: UniversalSearchProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [open]);

  // Keyboard shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Search API mutation
  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string): Promise<SearchResponse> => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
  });

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      searchMutation.reset();
      return;
    }

    const timer = setTimeout(() => {
      searchMutation.mutate(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle result selection
  const handleSelect = useCallback(
    (url: string, searchQuery?: string) => {
      if (searchQuery) {
        saveRecentSearch(searchQuery);
      }
      onOpenChange(false);
      setQuery('');
      setLocation(url);
    },
    [onOpenChange, setLocation]
  );

  // Handle recent search click
  const handleRecentSearch = useCallback((recentQuery: string) => {
    setQuery(recentQuery);
    searchMutation.mutate(recentQuery);
  }, []);

  // Clear recent searches
  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const results = searchMutation.data?.results || [];
  const isLoading = searchMutation.isPending;
  const hasQuery = query.length >= 2;
  const hasResults = results.length > 0;

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    const group = acc[result.type] || [];
    group.push(result);
    acc[result.type] = group;
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        ref={inputRef}
        placeholder="Search leads, policies, clients..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {/* Loading state */}
        {isLoading && (
          <div className="py-6 text-center text-sm text-gray-500">
            <Search className="w-4 h-4 animate-pulse mx-auto mb-2" />
            Searching...
          </div>
        )}

        {/* No results */}
        {hasQuery && !isLoading && !hasResults && (
          <CommandEmpty>
            No results found for "{query}"
          </CommandEmpty>
        )}

        {/* Search Results */}
        {hasResults && (
          <>
            {Object.entries(groupedResults).map(([type, items]) => {
              const Icon = RESULT_ICONS[type] || FileText;
              const label = type.charAt(0).toUpperCase() + type.slice(1) + 's';

              return (
                <CommandGroup key={type} heading={label}>
                  {items.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={`${result.type}-${result.id}`}
                      onSelect={() => handleSelect(result.url, query)}
                      className="flex items-center gap-3 py-2"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </>
        )}

        {/* No query - show recent searches and quick actions */}
        {!hasQuery && !isLoading && (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <CommandGroup heading="Recent Searches">
                {recentSearches.map((recent, idx) => (
                  <CommandItem
                    key={idx}
                    value={`recent-${idx}`}
                    onSelect={() => handleRecentSearch(recent)}
                    className="flex items-center gap-3"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{recent}</span>
                  </CommandItem>
                ))}
                <CommandItem
                  value="clear-recent"
                  onSelect={handleClearRecent}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear recent searches
                </CommandItem>
              </CommandGroup>
            )}

            <CommandSeparator />

            {/* Quick Actions */}
            <CommandGroup heading="Quick Actions">
              {QUICK_ACTIONS.map((action) => (
                <CommandItem
                  key={action.id}
                  value={action.id}
                  onSelect={() => handleSelect(action.url)}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <action.icon className="w-4 h-4 text-violet-600" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 text-[10px] text-gray-400">
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">↑↓</kbd>
          <span>Navigate</span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">↵</kbd>
          <span>Select</span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">esc</kbd>
          <span>Close</span>
        </div>
        <span>⌘K to open</span>
      </div>
    </CommandDialog>
  );
}

export default UniversalSearch;
