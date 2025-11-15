import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScoreCalculation } from '@/lib/types';
import { DemographicFilters } from '@/components/admin/DemographicFilters';

export function useDemographicFilters(scoreHistory: ScoreCalculation[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<DemographicFilters>(() => {
    return {
      ageGroup: searchParams.get('ageGroup')?.split(',').filter(Boolean) || [],
      gender: searchParams.get('gender')?.split(',').filter(Boolean) || [],
      nationality: searchParams.get('nationality')?.split(',').filter(Boolean) || [],
      emirate: searchParams.get('emirate')?.split(',').filter(Boolean) || [],
      employmentStatus: searchParams.get('employmentStatus')?.split(',').filter(Boolean) || [],
      incomeRange: searchParams.get('incomeRange')?.split(',').filter(Boolean) || []
    };
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(','));
      }
    });

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Extract available filter options from data
  const availableOptions = useMemo(() => {
    const ageGroups = new Set<string>();
    const genders = new Set<string>();
    const nationalities = new Set<string>();
    const emirates = new Set<string>();
    const employmentStatuses = new Set<string>();
    const incomeRanges = new Set<string>();

    // Handle undefined or empty scoreHistory
    if (!scoreHistory || !Array.isArray(scoreHistory)) {
      return {
        ageGroups: [],
        genders: [],
        nationalities: [],
        emirates: [],
        employmentStatuses: [],
        incomeRanges: []
      };
    }

    scoreHistory.forEach(score => {
      // Age groups
      const age = score.profile.age;
      let ageGroup = '55+';
      if (age < 25) ageGroup = '18-24';
      else if (age < 35) ageGroup = '25-34';
      else if (age < 45) ageGroup = '35-44';
      else if (age < 55) ageGroup = '45-54';
      ageGroups.add(ageGroup);

      genders.add(score.profile.gender);
      nationalities.add(score.profile.nationality);
      emirates.add(score.profile.residence);
      employmentStatuses.add(score.profile.employmentStatus);
      incomeRanges.add(score.profile.incomeRange);
    });

    return {
      ageGroups: Array.from(ageGroups).sort(),
      genders: Array.from(genders).sort(),
      nationalities: Array.from(nationalities).sort(),
      emirates: Array.from(emirates).sort(),
      employmentStatuses: Array.from(employmentStatuses).sort(),
      incomeRanges: Array.from(incomeRanges).sort()
    };
  }, [scoreHistory]);

  // Filter the data based on current filters
  const filteredData = useMemo(() => {
    // Handle undefined or empty scoreHistory
    if (!scoreHistory || !Array.isArray(scoreHistory)) {
      return [];
    }

    return scoreHistory.filter(score => {
      // Age group filter
      if (filters.ageGroup.length > 0) {
        const age = score.profile.age;
        let ageGroup = '55+';
        if (age < 25) ageGroup = '18-24';
        else if (age < 35) ageGroup = '25-34';
        else if (age < 45) ageGroup = '35-44';
        else if (age < 55) ageGroup = '45-54';
        
        if (!filters.ageGroup.includes(ageGroup)) return false;
      }

      // Gender filter
      if (filters.gender.length > 0 && !filters.gender.includes(score.profile.gender)) {
        return false;
      }

      // Nationality filter
      if (filters.nationality.length > 0 && !filters.nationality.includes(score.profile.nationality)) {
        return false;
      }

      // Emirate filter
      if (filters.emirate.length > 0 && !filters.emirate.includes(score.profile.residence)) {
        return false;
      }

      // Employment status filter
      if (filters.employmentStatus.length > 0 && !filters.employmentStatus.includes(score.profile.employmentStatus)) {
        return false;
      }

      // Income range filter
      if (filters.incomeRange.length > 0 && !filters.incomeRange.includes(score.profile.incomeRange)) {
        return false;
      }

      return true;
    });
  }, [scoreHistory, filters]);

  return {
    filters,
    setFilters,
    availableOptions,
    filteredData,
    hasActiveFilters: Object.values(filters).some(arr => arr.length > 0),
    activeFilterCount: Object.values(filters).reduce((sum, arr) => sum + arr.length, 0)
  };
}