'use client';

/**
 * Hook for migrating guest user data to authenticated user account
 */
import { useState } from 'react';
import { useSimpleAuth } from './use-simple-auth';
import { apiClient } from '../lib/api-client';

interface GuestMigrationHook {
    migrateGuestData: () => Promise<void>;
    loading: boolean;
    error: string | null;
    clearError: () => void;
}

export function useGuestMigration(): GuestMigrationHook {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useSimpleAuth();

    const migrateGuestData = async () => {
        if (!isAuthenticated) {
            throw new Error('User must be authenticated to migrate guest data');
        }

        try {
            setLoading(true);
            setError(null);

            // Get guest data from localStorage
            const guestHistory = localStorage.getItem('survey-history');
            const guestProfile = localStorage.getItem('customer-profile');

            if (!guestHistory && !guestProfile) {
                // No guest data to migrate
                return;
            }

            // Parse guest data
            const parsedHistory = guestHistory ? JSON.parse(guestHistory) : [];
            const parsedProfile = guestProfile ? JSON.parse(guestProfile) : null;

            // If there's a profile, create it for the authenticated user
            if (parsedProfile && apiClient.isAuthenticated()) {
                try {
                    await apiClient.createProfile(parsedProfile);
                } catch (profileError) {
                    // Profile might already exist, try to update instead
                    try {
                        await apiClient.updateProfile(parsedProfile);
                    } catch (updateError) {
                        console.warn('Could not migrate profile:', updateError);
                    }
                }
            }

            // Migrate survey responses
            if (parsedHistory.length > 0 && apiClient.isAuthenticated()) {
                for (const historyItem of parsedHistory) {
                    try {
                        // Convert responses back to the format expected by the API
                        const responsesObject = historyItem.responses.reduce((acc: Record<string, number>, response: { questionId: string; value: number }) => {
                            acc[response.questionId] = response.value;
                            return acc;
                        }, {});

                        // Submit each historical survey
                        await apiClient.submitSurvey({
                            responses: responsesObject,
                            completion_time: historyItem.completionTime || undefined
                        });
                    } catch (surveyError) {
                        console.warn('Could not migrate survey response:', surveyError);
                    }
                }
            }

            // Clear guest data after successful migration
            localStorage.removeItem('survey-history');
            localStorage.removeItem('customer-profile');

        } catch (err) {
            console.error('Guest data migration failed:', err);
            setError(err instanceof Error ? err.message : 'Migration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return {
        migrateGuestData,
        loading,
        error,
        clearError
    };
}