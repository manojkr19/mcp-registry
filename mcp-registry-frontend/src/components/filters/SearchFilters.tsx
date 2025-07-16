'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, Code, Database, Server } from 'lucide-react';
import { Server as ServerType, SearchFilters as SearchFiltersType } from '@/lib/types';
import { utils } from '@/lib/api';

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFiltersType) => void;
  servers: ServerType[];
  className?: string;
}

export function SearchFilters({ onFiltersChange, servers, className }: SearchFiltersProps) {
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Extract unique technologies and categories from servers
  const technologies = servers.reduce((acc, server) => {
    const tech = utils.extractTechnology(server);
    acc[tech] = (acc[tech] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = servers.reduce((acc, server) => {
    const category = utils.extractCategory(server);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleTechnologyToggle = (tech: string) => {
    const newTechnologies = selectedTechnologies.includes(tech)
      ? selectedTechnologies.filter(t => t !== tech)
      : [...selectedTechnologies, tech];
    
    setSelectedTechnologies(newTechnologies);
    onFiltersChange({
      languages: newTechnologies,
      categories: selectedCategories,
    });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    onFiltersChange({
      languages: selectedTechnologies,
      categories: newCategories,
    });
  };

  const clearAllFilters = () => {
    setSelectedTechnologies([]);
    setSelectedCategories([]);
    onFiltersChange({});
  };

  const hasActiveFilters = selectedTechnologies.length > 0 || selectedCategories.length > 0;

  return (
    <Card className={`sticky top-24 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Server className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTechnologies.map(tech => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => handleTechnologyToggle(tech)}
                >
                  {tech}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              {selectedCategories.map(category => (
                <Badge
                  key={category}
                  variant="outline"
                  className="flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
            <Separator />
          </div>
        )}

        {/* Technologies */}
        {Object.keys(technologies).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Code className="h-4 w-4" />
              Technologies
            </h4>
            <div className="space-y-2">
              {Object.entries(technologies)
                .sort(([, a], [, b]) => b - a)
                .map(([tech, count]) => (
                  <div
                    key={tech}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      selectedTechnologies.includes(tech)
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleTechnologyToggle(tech)}
                  >
                    <span className="text-sm font-medium">{tech}</span>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Categories */}
        {Object.keys(categories).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Categories
            </h4>
            <div className="space-y-2">
              {Object.entries(categories)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => (
                  <div
                    key={category}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-accent/10 text-accent'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    <span className="text-sm font-medium">{category}</span>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}