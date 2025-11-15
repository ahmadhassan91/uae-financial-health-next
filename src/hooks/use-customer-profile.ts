/**
 * Customer profile hook for managing user profile data with FastAPI backend
 */
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';
import { CustomerProfile } from '../lib/types';
import { useSimpleAuth } from './use-simple-auth';

interface ApiProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  nationality: string;
  emirate: string;
  city?: string;
  employment_status: string;
  industry?: string;
  position?: string;
  monthly_income: string;
  household_size: number;
  phone_number?: string;
  preferred_language: string;
  created_at: string;
  updated_at?: string;
}

// Convert API profile to frontend profile format
function apiProfileToCustomerProfile(apiProfile: ApiProfile): CustomerProfile {
  return {
    name: `${apiProfile.first_name} ${apiProfile.last_name}`,
    age: apiProfile.age,
    gender: apiProfile.gender as 'Male' | 'Female',
    nationality: apiProfile.nationality,
    children: 'No', // We'll need to add this field to backend or derive it
    employmentStatus: apiProfile.employment_status,
    employmentSector: apiProfile.industry || '',
    incomeRange: apiProfile.monthly_income,
    emailAddress: '', // We'll get this from user data
    residence: apiProfile.emirate,
  };
}

// Convert frontend profile to API format
function customerProfileToApiProfile(profile: CustomerProfile): {
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  nationality: string;
  emirate: string;
  employment_status: string;
  industry?: string;
  monthly_income: string;
  household_size: number;
  preferred_language?: string;
} {
  const [firstName, ...lastNameParts] = profile.name.split(' ');
  return {
    first_name: firstName,
    last_name: lastNameParts.join(' ') || firstName, // Fallback if no last name
    age: profile.age,
    gender: profile.gender.toLowerCase(),
    nationality: profile.nationality,
    emirate: profile.residence.toLowerCase().replace(/\s+/g, '_'),
    employment_status: profile.employmentStatus.toLowerCase().replace(/\s+/g, '_'),
    industry: profile.employmentSector,
    monthly_income: profile.incomeRange.toLowerCase().replace(/\s+/g, '_'),
    household_size: 1, // Default, could be derived from profile
    preferred_language: 'en',
  };
}

export function useCustomerProfile() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated: isSimpleAuthAuthenticated } = useSimpleAuth();

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const shouldUseApi = isSimpleAuthAuthenticated ||
        (apiClient.isAuthenticated() && localStorage.getItem('auth_token'));

      if (shouldUseApi) {
        // Authenticated user: load from API
        try {
          const apiProfile = await apiClient.getProfile();
          const customerProfile = apiProfileToCustomerProfile(apiProfile);
          setProfile(customerProfile);
        } catch (apiError) {
          console.error('Failed to load profile from API, falling back to localStorage:', apiError);
          // Fallback to localStorage if API fails
          const localProfile = localStorage.getItem('customer-profile');
          if (localProfile) {
            setProfile(JSON.parse(localProfile));
          }
        }
      } else {
        // Guest user: load from localStorage
        const localProfile = localStorage.getItem('customer-profile');
        if (localProfile) {
          setProfile(JSON.parse(localProfile));
        } else {
          setProfile(null);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        // Profile doesn't exist yet, this is OK
        setProfile(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (newProfile: CustomerProfile) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Saving profile:', newProfile);
      console.log('Is authenticated:', apiClient.isAuthenticated());

      // For guest users, always save to localStorage only
      // Only use API if user is authenticated through simple auth or has valid API token
      const shouldUseApi = isSimpleAuthAuthenticated ||
        (apiClient.isAuthenticated() && localStorage.getItem('auth_token'));

      console.log('Should use API:', shouldUseApi);
      console.log('Simple auth authenticated:', isSimpleAuthAuthenticated);

      if (shouldUseApi) {
        // Authenticated user: save to API
        try {
          const apiProfileData = customerProfileToApiProfile(newProfile);
          console.log('API profile data:', apiProfileData);

          if (profile) {
            // Update existing profile
            console.log('Updating existing profile');
            await apiClient.updateProfile(apiProfileData);
          } else {
            // Create new profile
            console.log('Creating new profile');
            await apiClient.createProfile(apiProfileData);
          }
        } catch (apiError) {
          console.error('API profile save failed, falling back to localStorage:', apiError);
          // Fallback to localStorage if API fails
          localStorage.setItem('customer-profile', JSON.stringify(newProfile));
        }
      } else {
        // Guest user: save to localStorage
        console.log('Saving to localStorage (guest user)');
        localStorage.setItem('customer-profile', JSON.stringify(newProfile));
      }

      setProfile(newProfile);
      console.log('Profile saved successfully');
    } catch (err) {
      console.error('Profile save error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
      setError(errorMessage);

      // Don't throw error for guest users - just save to localStorage as fallback
      try {
        localStorage.setItem('customer-profile', JSON.stringify(newProfile));
        setProfile(newProfile);
        console.log('Fallback to localStorage successful');
      } catch (fallbackError) {
        console.error('Fallback save failed:', fallbackError);
        throw new Error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<CustomerProfile>) => {
    if (!profile) {
      throw new Error('No profile to update');
    }

    const updatedProfile = { ...profile, ...updates };
    await saveProfile(updatedProfile);
  };

  const deleteProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (apiClient.isAuthenticated()) {
        // Authenticated user: delete from API
        await apiClient.deleteProfile();
      } else {
        // Guest user: remove from localStorage
        localStorage.removeItem('customer-profile');
      }

      setProfile(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearProfile = () => {
    setProfile(null);
    setError(null);

    // Also clear localStorage for guest users
    if (!apiClient.isAuthenticated()) {
      localStorage.removeItem('customer-profile');
    }
  };

  return {
    profile,
    loading,
    error,
    saveProfile,
    updateProfile,
    deleteProfile,
    clearProfile,
    reloadProfile: loadProfile,
  };
}
