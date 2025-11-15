import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Funnel, ArrowCounterClockwise } from '@phosphor-icons/react';

export interface DemographicFilters {
  ageGroup: string[];
  gender: string[];
  nationality: string[];
  emirate: string[];
  employmentStatus: string[];
  incomeRange: string[];
}

interface DemographicFiltersProps {
  filters: DemographicFilters;
  onFiltersChange: (filters: DemographicFilters) => void;
  availableOptions: {
    ageGroups: string[];
    genders: string[];
    nationalities: string[];
    emirates: string[];
    employmentStatuses: string[];
    incomeRanges: string[];
  };
}

export function DemographicFiltersComponent({ 
  filters, 
  onFiltersChange, 
  availableOptions 
}: DemographicFiltersProps) {
  const updateFilter = (filterType: keyof DemographicFilters, value: string) => {
    const currentValues = filters[filterType];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      [filterType]: newValues
    });
  };

  const removeFilter = (filterType: keyof DemographicFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [filterType]: filters[filterType].filter(v => v !== value)
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      ageGroup: [],
      gender: [],
      nationality: [],
      emirate: [],
      employmentStatus: [],
      incomeRange: []
    });
  };

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);
  const activeFilterCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Funnel className="w-5 h-5" />
            <CardTitle>Demographic Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllFilters}
              className="flex items-center gap-2"
            >
              <ArrowCounterClockwise className="w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Age Group Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Age Group</label>
            <Select onValueChange={(value) => updateFilter('ageGroup', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.ageGroups.map(age => (
                  <SelectItem key={age} value={age}>{age}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Gender</label>
            <Select onValueChange={(value) => updateFilter('gender', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.genders.map(gender => (
                  <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nationality Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nationality</label>
            <Select onValueChange={(value) => updateFilter('nationality', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.nationalities.map(nationality => (
                  <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Emirate Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Emirate</label>
            <Select onValueChange={(value) => updateFilter('emirate', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select emirate" />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.emirates.map(emirate => (
                  <SelectItem key={emirate} value={emirate}>{emirate}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employment Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Employment Status</label>
            <Select onValueChange={(value) => updateFilter('employmentStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select employment" />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.employmentStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Income Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Income Range</label>
            <Select onValueChange={(value) => updateFilter('incomeRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select income range" />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.incomeRanges.map(range => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Active Filters:</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([filterType, values]) =>
                values.map(value => (
                  <Badge 
                    key={`${filterType}-${value}`} 
                    variant="secondary" 
                    className="flex items-center gap-1"
                  >
                    <span className="text-xs opacity-70">
                      {filterType.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                    </span>
                    {value}
                    <button
                      onClick={() => removeFilter(filterType as keyof DemographicFilters, value)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}