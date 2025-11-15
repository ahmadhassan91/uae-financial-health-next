'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SupportedLanguage = 'en' | 'ar';

export interface AdminLocalizationContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, any>) => string;
  isRTL: boolean; // Always false for admin
  formatNumber: (num: number) => string;
  formatDate: (date: Date) => string;
  isLoading: boolean;
  translations: Record<string, string>;
}

const AdminLocalizationContext = createContext<AdminLocalizationContextType | undefined>(undefined);

interface AdminLocalizationProviderProps {
  children: ReactNode;
}

// Admin translations (always in English for consistency)
const ADMIN_TRANSLATIONS: Record<string, string> = {
  // Admin Interface
  'admin_dashboard': 'Admin Dashboard',
  'localization_management': 'Localization Management',
  'manage_translations': 'Manage translations and localized content for multiple languages',
  'content_type': 'Content Type',
  'language': 'Language',
  'version': 'Version',
  'status': 'Status',
  'actions': 'Actions',
  'active': 'Active',
  'inactive': 'Inactive',
  'add_content': 'Add Content',
  'new_workflow': 'New Workflow',
  'create_translation_workflow': 'Create Translation Workflow',
  'source_language': 'Source Language',
  'target_language': 'Target Language',
  'workflow_type': 'Workflow Type',
  'priority': 'Priority',
  'content_ids': 'Content IDs',
  'notes': 'Notes',
  'create_workflow': 'Create Workflow',
  'add_localized_content': 'Add Localized Content',
  'create_new_localized_content': 'Create new localized content for questions, recommendations, or UI elements',
  'content_id': 'Content ID',
  'title_optional': 'Title (Optional)',
  'text': 'Text',
  'localized_text_content': 'Localized text content',
  'create_content': 'Create Content',
  'filters': 'Filters',
  'all_types': 'All types',
  'all_languages': 'All languages',
  'active_only': 'Active only',
  'localized_content': 'Localized Content',
  'content_items_found': 'content items found',
  'no_localized_content_found': 'No localized content found',
  'translation_workflows': 'Translation Workflows',
  'active_completed_workflows': 'Active and completed translation workflows',
  'no_translation_workflows_found': 'No translation workflows found',
  'analytics': 'Analytics',
  'workflows': 'Workflows',
  'content': 'Content',
  
  // Common actions
  'save': 'Save',
  'cancel': 'Cancel',
  'edit': 'Edit',
  'delete': 'Delete',
  'confirm': 'Confirm',
  'back': 'Back',
  'continue': 'Continue',
  'complete': 'Complete',
  'skip': 'Skip',
  
  // Status Messages
  'loading': 'Loading...',
  'error': 'Error',
  'success': 'Success',
  'warning': 'Warning',
  'info': 'Information',
  
  // Language selector (for admin, shows what language content they're managing)
  'language_selector': 'Content Language',
  'english': 'English',
  'arabic': 'Arabic',
};

export function AdminLocalizationProvider({ children }: AdminLocalizationProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [translations, setTranslations] = useState<Record<string, string>>(ADMIN_TRANSLATIONS);
  const [isLoading, setIsLoading] = useState(false);

  // Admin interface always stays in English/LTR layout
  // Language selection only affects which content they're managing, not the UI
  
  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    // Don't change the admin interface language, just track what content language they're working with
  };

  const t = (key: string, params?: Record<string, any>): string => {
    let translation = translations[key] || key;
    
    // Simple parameter substitution
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{{${paramKey}}}`, String(value));
      });
    }
    
    return translation;
  };

  // Admin interface is always LTR
  const isRTL = false;

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const value: AdminLocalizationContextType = {
    language,
    setLanguage,
    t,
    isRTL,
    formatNumber,
    formatDate,
    isLoading,
    translations
  };

  return (
    <AdminLocalizationContext.Provider value={value}>
      {children}
    </AdminLocalizationContext.Provider>
  );
}

export function useAdminLocalization(): AdminLocalizationContextType {
  const context = useContext(AdminLocalizationContext);
  if (context === undefined) {
    throw new Error('useAdminLocalization must be used within an AdminLocalizationProvider');
  }
  return context;
}