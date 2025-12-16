import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DatePickerComponent } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { CalendarIcon, X, Funnel } from "lucide-react";
import { format } from "date-fns";
import {
  DemographicFilters,
  FilterOptions,
  DateRangeParams,
} from "@/lib/admin-api";

interface FinancialClinicFiltersProps {
  filters: DemographicFilters;
  onFiltersChange: (filters: DemographicFilters) => void;
  dateParams: DateRangeParams;
  onDateParamsChange: (params: DateRangeParams) => void;
  availableOptions: FilterOptions | null;
}

const DATE_RANGE_PRESETS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
  { value: "ytd", label: "Year to date" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom range" },
];

export function FinancialClinicFilters({
  filters,
  onFiltersChange,
  dateParams,
  onDateParamsChange,
  availableOptions,
}: FinancialClinicFiltersProps) {
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Calculate active filter count
  const activeFilterCount = Object.entries(filters).reduce(
    (count, [key, value]) => {
      if (key === "unique_users_only") {
        return count + (value ? 1 : 0);
      }
      return count + (Array.isArray(value) ? value.length : 0);
    },
    0
  );

  const hasActiveFilters = activeFilterCount > 0;

  // Handle date range preset selection
  const handleDateRangeChange = (value: string) => {
    if (value === "custom") {
      setShowCustomDatePicker(true);
      onDateParamsChange({ dateRange: undefined });
    } else {
      setShowCustomDatePicker(false);
      onDateParamsChange({ dateRange: value as any });
    }
  };

  // Handle custom date selection
  const handleCustomDateApply = () => {
    if (startDate && endDate) {
      onDateParamsChange({
        dateRange: undefined,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      });
      setShowCustomDatePicker(false);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({});
    onDateParamsChange({ dateRange: "30d" });
    setStartDate(undefined);
    setEndDate(undefined);
    setShowCustomDatePicker(false);
  };

  // Remove specific filter value
  const removeFilterValue = (
    filterKey: Exclude<keyof DemographicFilters, "unique_users_only">,
    value: string
  ) => {
    const currentValues = (filters[filterKey] as string[]) || [];
    const newValues = currentValues.filter((v: string) => v !== value);

    onFiltersChange({
      ...filters,
      [filterKey]: newValues.length > 0 ? newValues : undefined,
    });
  };

  if (!availableOptions) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">
              Loading filters...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Range Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Date Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={
              dateParams.dateRange || (showCustomDatePicker ? "custom" : "30d")
            }
            onValueChange={handleDateRangeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Date Picker */}
          {showCustomDatePicker && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-2 block">Start Date</Label>
                <DatePickerComponent
                  date={startDate}
                  onSelect={setStartDate}
                  placeholder="Select start date"
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                />
              </div>
              <div>
                <Label className="text-xs mb-2 block">End Date</Label>
                <DatePickerComponent
                  date={endDate}
                  onSelect={setEndDate}
                  placeholder="Select end date"
                  disabled={(date) => {
                    const today = new Date();
                    const minDate = new Date("1900-01-01");
                    return (
                      date > today ||
                      date < minDate ||
                      !!(startDate && date < startDate)
                    );
                  }}
                />
              </div>
              <Button
                onClick={handleCustomDateApply}
                disabled={!startDate || !endDate}
                className="col-span-2"
              >
                Apply Custom Range
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demographic Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Funnel className="w-4 h-4" />
              Demographic Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount} active
                </Badge>
              )}
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Age Group Filter */}
            <div>
              <Label className="text-xs font-semibold mb-2 block">
                Age Group
              </Label>
              <MultiSelect
                options={availableOptions.ageGroups.map((age) => ({
                  label: age,
                  value: age,
                }))}
                selected={filters.ageGroups || []}
                onChange={(values) =>
                  onFiltersChange({
                    ...filters,
                    ageGroups: values.length > 0 ? values : undefined,
                  })
                }
                placeholder="Select age groups"
              />
            </div>

            {/* Gender Filter */}
            <div>
              <Label className="text-xs font-semibold mb-2 block">Gender</Label>
              <MultiSelect
                options={availableOptions.genders.map((gender) => ({
                  label: gender,
                  value: gender,
                }))}
                selected={filters.genders || []}
                onChange={(values) =>
                  onFiltersChange({
                    ...filters,
                    genders: values.length > 0 ? values : undefined,
                  })
                }
                placeholder="Select genders"
              />
            </div>

            {/* Nationality Filter */}
            <div>
              <Label className="text-xs font-semibold mb-2 block">
                Nationality
              </Label>
              <MultiSelect
                options={availableOptions.nationalities.map((nationality) => ({
                  label: nationality,
                  value: nationality,
                }))}
                selected={filters.nationalities || []}
                onChange={(values) =>
                  onFiltersChange({
                    ...filters,
                    nationalities: values.length > 0 ? values : undefined,
                  })
                }
                placeholder="Select nationalities"
              />
            </div>

            {/* Emirate Filter */}
            <div>
              <Label className="text-xs font-semibold mb-2 block">
                Emirate
              </Label>
              <MultiSelect
                style={{ color: "#5E5E5E !important" }}
                options={availableOptions.emirates.map((emirate) => ({
                  label: emirate,
                  value: emirate,
                }))}
                selected={filters.emirates || []}
                onChange={(values) =>
                  onFiltersChange({
                    ...filters,
                    emirates: values.length > 0 ? values : undefined,
                  })
                }
                placeholder="Select emirates"
              />
            </div>

            {/* Employment Status Filter */}
            <div>
              <Label className="text-xs font-semibold mb-2 block">
                Employment
              </Label>
              <MultiSelect
                options={availableOptions.employmentStatuses.map((status) => ({
                  label: status,
                  value: status,
                }))}
                selected={filters.employmentStatuses || []}
                onChange={(values) =>
                  onFiltersChange({
                    ...filters,
                    employmentStatuses: values.length > 0 ? values : undefined,
                  })
                }
                placeholder="Select employment status"
              />
            </div>

            {/* Income Range Filter */}
            <div>
              <Label className="text-xs font-semibold mb-2 block">
                Income Range
              </Label>
              <MultiSelect
                options={availableOptions.incomeRanges.map((income) => ({
                  label: income,
                  value: income,
                }))}
                selected={filters.incomeRanges || []}
                onChange={(values) =>
                  onFiltersChange({
                    ...filters,
                    incomeRanges: values.length > 0 ? values : undefined,
                  })
                }
                placeholder="Select income ranges"
              />
            </div>

            {/* Children Filter */}
            <div>
              <Label className="text-xs font-semibold mb-2 block">
                Children
              </Label>
              <MultiSelect
                options={availableOptions.childrenOptions.map((children) => ({
                  label: children,
                  value: children,
                }))}
                selected={filters.children || []}
                onChange={(values) =>
                  onFiltersChange({
                    ...filters,
                    children: values.length > 0 ? values : undefined,
                  })
                }
                placeholder="Select children options"
              />
            </div>

            {/* Companies Filter - Searchable */}
            <div>
              <Label className="text-xs font-semibold mb-2 block">
                Company
              </Label>
              <MultiSelect
                options={Array.from(
                  new Map(
                    availableOptions.companies.map((company) => [
                      company.unique_url,
                      { label: company.name, value: company.unique_url },
                    ])
                  ).values()
                )}
                selected={filters.companies || []}
                onChange={(values) =>
                  onFiltersChange({
                    ...filters,
                    companies: values.length > 0 ? values : undefined,
                  })
                }
                placeholder="Select companies"
              />
            </div>
          </div>

          {/* Unique Users Filter */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="unique-users-filter"
                checked={filters.unique_users_only || false}
                onCheckedChange={(checked) => {
                  onFiltersChange({
                    ...filters,
                    unique_users_only: checked === true ? true : undefined,
                  });
                }}
              />
              <label
                htmlFor="unique-users-filter"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Show Unique Users Only
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              Filter by unique email address, showing only the most recent
              submission for each user
            </p>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {filters.unique_users_only && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Unique Users Only
                    <button
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          unique_users_only: undefined,
                        })
                      }
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {Object.entries(filters).map(
                  ([filterKey, values]) =>
                    filterKey !== "unique_users_only" &&
                    Array.isArray(values) &&
                    values.map((value: string) => (
                      <Badge
                        key={`${filterKey}-${value}`}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {value}
                        <button
                          onClick={() =>
                            removeFilterValue(
                              filterKey as Exclude<
                                keyof DemographicFilters,
                                "unique_users_only"
                              >,
                              value
                            )
                          }
                          className="ml-1 hover:text-destructive"
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
    </div>
  );
}
