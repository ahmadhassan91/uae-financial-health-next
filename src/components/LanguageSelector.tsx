'use client';

import { useLocalization } from '@/contexts/LocalizationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

export function LanguageSelector({ variant = 'default', className = '' }: LanguageSelectorProps) {
  const { language, setLanguage, t, isRTL } = useLocalization();

  const languages = [
    { code: 'en' as const, name: 'English', nativeName: 'English' },
    { code: 'ar' as const, name: 'Arabic', nativeName: 'العربية' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  if (variant === 'icon-only') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-9 w-9 p-0 ${className}`}
            aria-label={t('language_selector')}
          >
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center justify-between ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              <span className={`font-medium ${isRTL ? 'ml-2' : 'mr-2'}`}>
                {lang.nativeName}
              </span>
              {language === lang.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-8 px-3 ${className}`}
          >
            <Globe className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
            <span className="text-xs font-medium">
              {currentLanguage?.code.toUpperCase()}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center justify-between ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              <span className={`font-medium ${isRTL ? 'ml-2' : 'mr-2'}`}>
                {lang.nativeName}
              </span>
              {language === lang.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`${className} ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Globe className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          <span>{currentLanguage?.nativeName || t('language_selector')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center justify-between ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">{lang.name}</span>
            </div>
            {language === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}