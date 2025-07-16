'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useServers, useSearchServers } from '@/hooks/useServers';
import { SearchFilters as SearchFiltersType } from '@/lib/types';
import { ServerGrid } from '@/components/servers/ServerGrid';
import { SearchFilters } from '@/components/filters/SearchFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Grid, List } from 'lucide-react';
import { motion } from 'framer-motion';

export function ServersList() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({
    limit: 20,
  });

  // Use search or regular servers query based on search input
  const { data: searchData, isLoading: isSearchLoading } = useSearchServers(
    searchQuery, 
    filters,
  );
  const { data: serversData, isLoading: isServersLoading } = useServers(filters);

  const data = searchQuery.trim() ? searchData : serversData;
  const isLoading = searchQuery.trim() ? isSearchLoading : isServersLoading;
  const servers = data?.servers || [];

  // Update search query when URL search param changes
  useEffect(() => {
    if (initialSearch !== searchQuery) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is handled by the useSearchServers hook automatically
  };

  const handleLoadMore = () => {
    setFilters(prev => ({ ...prev, limit: (prev.limit || 20) + 20 }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Servers'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {servers.length > 0 
              ? `Showing ${servers.length} server${servers.length === 1 ? '' : 's'}`
              : 'No servers found'
            }
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search servers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </form>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-accent text-accent-foreground' : ''}
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            <div className="flex border rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`h-8 px-3 ${viewMode === 'grid' ? 'bg-background shadow-sm' : ''}`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={`h-8 px-3 ${viewMode === 'list' ? 'bg-background shadow-sm' : ''}`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:w-80 shrink-0"
          >
            <SearchFilters 
              onFiltersChange={setFilters}
              servers={servers}
            />
          </motion.aside>
        )}

        {/* Server Grid */}
        <div className="flex-1">
          <ServerGrid 
            servers={servers} 
            isLoading={isLoading}
            className={viewMode === 'list' ? 'grid-cols-1 lg:grid-cols-2' : ''}
          />

          {/* Load More */}
          {servers.length > 0 && servers.length >= (filters.limit || 20) && (
            <div className="mt-12 text-center">
              <Button 
                onClick={handleLoadMore}
                variant="outline"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Servers'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}