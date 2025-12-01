/**
 * Chart Utilities
 * 
 * Shared utility functions for formatting chart data and labels
 * across the admin dashboard.
 */

import { format, parseISO } from 'date-fns';

/**
 * Format percentage to 1 decimal place
 * @param value - Number to format as percentage
 * @returns Formatted string like "54.1%"
 */
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0.0%';
  return `${value.toFixed(1)}%`;
};

/**
 * Format number to 1 decimal place
 * @param value - Number to format
 * @returns Formatted string like "71.2"
 */
export const formatDecimal = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0.0';
  return value.toFixed(1);
};

/**
 * Format date for chart display
 * Default format: DD-MMM-YY (e.g., 31-Jul-26, 16-Nov-25)
 * 
 * @param date - Date string or Date object
 * @param formatString - Optional custom format string (default: 'dd-MMM-yy')
 * @returns Formatted date string
 */
export const formatChartDate = (
  date: string | Date,
  formatString: string = 'dd-MMM-yy'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return typeof date === 'string' ? date : '';
  }
};

/**
 * Group age from number into standardized slabs
 * New slabs: < 18, 18-25, 26-35, 36-45, 46-60, 60+
 * 
 * @param age - Age in years
 * @returns Age group string
 */
export const getAgeGroup = (age: number): string => {
  if (age < 18) return '< 18';
  if (age >= 18 && age <= 25) return '18-25';
  if (age >= 26 && age <= 35) return '26-35';
  if (age >= 36 && age <= 45) return '36-45';
  if (age >= 46 && age <= 60) return '46-60';
  return '60+';
};

/**
 * Get ordered age groups for consistent display
 * @returns Array of age group strings in order
 */
export const getOrderedAgeGroups = (): string[] => {
  return ['< 18', '18-25', '26-35', '36-45', '46-60', '60+'];
};

/**
 * Calculate age from date of birth string (DD/MM/YYYY format)
 * @param dob - Date of birth string in DD/MM/YYYY format
 * @returns Age in years
 */
export const calculateAgeFromDOB = (dob: string): number => {
  try {
    const parts = dob.split('/');
    if (parts.length !== 3) return 0;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const year = parseInt(parts[2], 10);

    const birthDate = new Date(year, month, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return 0;
  }
};

/**
 * Custom label renderer for recharts data labels
 * @param value - The value to display
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted value for display
 */
export const renderDataLabel = (value: number, decimals: number = 1): string => {
  if (value === null || value === undefined) return '';
  return value.toFixed(decimals);
};

/**
 * Filter out Financial Knowledge category from category list
 * @param categories - Array of category objects
 * @returns Filtered array without Financial Knowledge
 */
export const filterFinancialKnowledge = <T extends { category: string }>(
  categories: T[]
): T[] => {
  return categories.filter(
    cat => cat.category !== 'financial_knowledge' &&
      cat.category !== 'Financial Knowledge'
  );
};
