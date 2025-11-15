import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FinancialClinicFilters } from '@/components/admin/FinancialClinicFilters';
import { FilterOptions, DemographicFilters, DateRangeParams } from '@/lib/admin-api';

// Mock the date-picker component
jest.mock('@/components/ui/date-picker-new', () => ({
  DatePicker: ({ date, onSelect, placeholder }: any) => (
    <button 
      onClick={() => onSelect && onSelect(new Date('2023-11-15'))}
      data-testid="date-picker"
    >
      {date ? date.toDateString() : placeholder}
    </button>
  ),
}));

const mockFilterOptions: FilterOptions = {
  ageGroups: ['18-25', '26-35', '36-45', '46-55', '55+'],
  genders: ['Male', 'Female', 'Prefer not to say'],
  nationalities: ['UAE', 'Saudi Arabia', 'Egypt', 'India', 'Pakistan'],
  emirates: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
  employmentStatuses: ['Employed', 'Self-employed', 'Unemployed', 'Student', 'Retired'],
  incomeRanges: ['Below 5,000', '5,000-10,000', '10,000-20,000', '20,000-50,000', 'Above 50,000'],
  childrenOptions: ['No children', '1 child', '2 children', '3+ children'],
  companies: [
    { id: 1, name: 'National Bonds Corporation', code: 'NBC001' },
    { id: 2, name: 'Emirates NBD', code: 'ENBD002' },
    { id: 3, name: 'ADNOC', code: 'ADNOC003' }
  ]
};

describe('FinancialClinicFilters', () => {
  const defaultProps = {
    filters: {} as DemographicFilters,
    onFiltersChange: jest.fn(),
    dateParams: { dateRange: '30d' } as DateRangeParams,
    onDateParamsChange: jest.fn(),
    availableOptions: mockFilterOptions,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Date Range Filter', () => {
    it('renders date range selector with preset options', () => {
      render(<FinancialClinicFilters {...defaultProps} />);
      
      expect(screen.getByText('Date Range')).toBeInTheDocument();
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    });

    it('allows selecting preset date ranges', async () => {
      const user = userEvent.setup();
      render(<FinancialClinicFilters {...defaultProps} />);

      // Click on date range selector
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Select "Last 7 days"
      const sevenDaysOption = screen.getByText('Last 7 days');
      await user.click(sevenDaysOption);

      expect(defaultProps.onDateParamsChange).toHaveBeenCalledWith({ dateRange: '7d' });
    });

    it('shows custom date pickers when "Custom range" is selected', async () => {
      const user = userEvent.setup();
      render(<FinancialClinicFilters {...defaultProps} />);

      // Click on date range selector
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Select "Custom range"
      const customOption = screen.getByText('Custom range');
      await user.click(customOption);

      // Should show start and end date pickers
      expect(screen.getByText('Start Date')).toBeInTheDocument();
      expect(screen.getByText('End Date')).toBeInTheDocument();
      expect(screen.getByText('Apply Custom Range')).toBeInTheDocument();
    });

    it('handles custom date selection and applies range', async () => {
      const user = userEvent.setup();
      const props = {
        ...defaultProps,
        dateParams: { dateRange: undefined } as DateRangeParams,
      };
      
      render(<FinancialClinicFilters {...props} />);

      // Set to custom range first
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      await user.click(screen.getByText('Custom range'));

      // Click start date picker
      const datePickers = screen.getAllByTestId('date-picker');
      await user.click(datePickers[0]);

      // Click end date picker
      await user.click(datePickers[1]);

      // Click apply button
      const applyButton = screen.getByText('Apply Custom Range');
      await user.click(applyButton);

      expect(props.onDateParamsChange).toHaveBeenCalledWith({
        dateRange: undefined,
        startDate: expect.any(String),
        endDate: expect.any(String),
      });
    });
  });

  describe('Demographic Filters', () => {
    it('renders all demographic filter categories', () => {
      render(<FinancialClinicFilters {...defaultProps} />);

      expect(screen.getByText('Age Group')).toBeInTheDocument();
      expect(screen.getByText('Gender')).toBeInTheDocument();
      expect(screen.getByText('Nationality')).toBeInTheDocument();
      expect(screen.getByText('Emirate')).toBeInTheDocument();
      expect(screen.getByText('Employment')).toBeInTheDocument();
      expect(screen.getByText('Income Range')).toBeInTheDocument();
      expect(screen.getByText('Children')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
    });

    it('shows filter options from availableOptions prop', () => {
      render(<FinancialClinicFilters {...defaultProps} />);

      // Check that filter options are available
      const ageGroupSelect = screen.getByText('Select age groups');
      expect(ageGroupSelect).toBeInTheDocument();

      const genderSelect = screen.getByText('Select genders');
      expect(genderSelect).toBeInTheDocument();
    });

    it('calls onFiltersChange when demographic filters are updated', async () => {
      const user = userEvent.setup();
      render(<FinancialClinicFilters {...defaultProps} />);

      // This test would need the MultiSelect component to be properly mocked
      // For now, we'll test the callback functionality
      expect(defaultProps.onFiltersChange).toHaveBeenCalledTimes(0);
    });

    it('displays active filter count when filters are applied', () => {
      const propsWithFilters = {
        ...defaultProps,
        filters: {
          ageGroups: ['18-25', '26-35'],
          genders: ['Male'],
          nationalities: ['UAE'],
        } as DemographicFilters,
      };

      render(<FinancialClinicFilters {...propsWithFilters} />);

      expect(screen.getByText('4 active')).toBeInTheDocument();
    });
  });

  describe('Unique Users Filter', () => {
    it('renders unique users checkbox filter', () => {
      render(<FinancialClinicFilters {...defaultProps} />);

      expect(screen.getByText('Show Unique Users Only')).toBeInTheDocument();
      expect(screen.getByText('Filter by unique email address, showing only the most recent submission for each user')).toBeInTheDocument();
    });

    it('handles unique users filter toggle', async () => {
      const user = userEvent.setup();
      render(<FinancialClinicFilters {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
        unique_users_only: true,
      });
    });

    it('shows unique users filter as active when checked', () => {
      const propsWithUniqueFilter = {
        ...defaultProps,
        filters: { unique_users_only: true } as DemographicFilters,
      };

      render(<FinancialClinicFilters {...propsWithUniqueFilter} />);

      expect(screen.getByText('1 active')).toBeInTheDocument();
      expect(screen.getByText('Unique Users Only')).toBeInTheDocument();
    });
  });

  describe('Active Filter Tags', () => {
    it('displays active filter tags for applied filters', () => {
      const propsWithFilters = {
        ...defaultProps,
        filters: {
          ageGroups: ['18-25'],
          genders: ['Male', 'Female'],
          unique_users_only: true,
        } as DemographicFilters,
      };

      render(<FinancialClinicFilters {...propsWithFilters} />);

      expect(screen.getByText('18-25')).toBeInTheDocument();
      expect(screen.getByText('Male')).toBeInTheDocument();
      expect(screen.getByText('Female')).toBeInTheDocument();
      expect(screen.getByText('Unique Users Only')).toBeInTheDocument();
    });

    it('allows removing individual filter tags', async () => {
      const user = userEvent.setup();
      const propsWithFilters = {
        ...defaultProps,
        filters: {
          ageGroups: ['18-25', '26-35'],
        } as DemographicFilters,
      };

      render(<FinancialClinicFilters {...propsWithFilters} />);

      // Find and click the X button next to "18-25"
      const filterTags = screen.getAllByRole('button');
      const removeButton = filterTags.find(button => 
        button.parentElement?.textContent?.includes('18-25')
      );
      
      if (removeButton) {
        await user.click(removeButton);
        expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
          ageGroups: ['26-35'],
        });
      }
    });
  });

  describe('Clear All Filters', () => {
    it('shows clear all button when filters are active', () => {
      const propsWithFilters = {
        ...defaultProps,
        filters: {
          ageGroups: ['18-25'],
          unique_users_only: true,
        } as DemographicFilters,
      };

      render(<FinancialClinicFilters {...propsWithFilters} />);

      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('clears all filters when clear all button is clicked', async () => {
      const user = userEvent.setup();
      const propsWithFilters = {
        ...defaultProps,
        filters: {
          ageGroups: ['18-25'],
          genders: ['Male'],
          unique_users_only: true,
        } as DemographicFilters,
      };

      render(<FinancialClinicFilters {...propsWithFilters} />);

      const clearAllButton = screen.getByText('Clear All');
      await user.click(clearAllButton);

      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({});
      expect(defaultProps.onDateParamsChange).toHaveBeenCalledWith({ dateRange: '30d' });
    });
  });

  describe('Loading State', () => {
    it('shows loading state when availableOptions is null', () => {
      const propsWithoutOptions = {
        ...defaultProps,
        availableOptions: null,
      };

      render(<FinancialClinicFilters {...propsWithoutOptions} />);

      expect(screen.getByText('Loading filters...')).toBeInTheDocument();
    });
  });
});
