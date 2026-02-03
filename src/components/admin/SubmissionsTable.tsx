'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { DatePickerComponent } from "@/components/ui/date-picker";
import {

  Search,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  MoreVertical,
  User,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Award,
  Building,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { apiClient } from '@/lib/api-client';
import { DateRangeParams } from '@/lib/admin-api';

interface FinancialClinicSubmission {
  id: number;
  profile_id: number;
  profile_name: string;
  profile_email: string;
  profile_mobile: string;
  gender: string;
  nationality: string;
  emirate: string;
  age: number | null;
  employment_status: string;
  income_range: string;
  company_name: string | null;
  company_id: number | null;
  total_score: number;
  status_band: string;
  questions_answered: number;
  total_questions: number;
  category_scores: {
    [key: string]: { score: number; max_score: number };
  };
  created_at: string;
  completed_at: string | null;
  insights?: {
    category: string;
    status_level: string;
    text: string;
    text_ar: string;
    priority: number;
  }[];
}

interface SubmissionStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  average_score: number;
}

interface Company {
  id: number;
  name: string;
  unique_url: string | null;
}

interface UniqueUrl {
  id: number;
  name: string;
  unique_url: string;
}

interface SubmissionsTableProps {
  filters?: DemographicFilters;
  dateParams?: DateRangeParams;
}

export function SubmissionsTable({ filters, dateParams }: SubmissionsTableProps) {
  const [submissions, setSubmissions] = useState<FinancialClinicSubmission[]>([]);
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]); // From CompanyDetails table
  const [uniqueUrls, setUniqueUrls] = useState<UniqueUrl[]>([]); // From CompanyTracker table
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [nationalityFilter, setNationalityFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [uniqueUrlFilter, setUniqueUrlFilter] = useState<string>('all');
  const [companySearch, setCompanySearch] = useState<string>('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState<boolean>(false);
  const [uniqueUrlSearch, setUniqueUrlSearch] = useState<string>('');
  const [showUniqueUrlDropdown, setShowUniqueUrlDropdown] = useState<boolean>(false);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [incomeFilter, setIncomeFilter] = useState<string>('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FinancialClinicSubmission | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const pageSize = 20;

  useEffect(() => {
    loadCompanies();
  }, []);

  // Sync dateParams prop to local date state
  useEffect(() => {
    if (dateParams?.startDate) {
      setDateFrom(new Date(dateParams.startDate));
    } else {
      setDateFrom(undefined);
    }

    if (dateParams?.endDate) {
      const end = new Date(dateParams.endDate);
      // Determine if we need to adjust the end date based on time or if it's just a date string
      setDateTo(end);
    } else {
      setDateTo(undefined);
    }
  }, [dateParams]);

  useEffect(() => {
    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(companySearch.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [companySearch, companies]);

  useEffect(() => {
    loadSubmissions();
    loadStats();
  }, [page, searchTerm, statusFilter, nationalityFilter, companyFilter, uniqueUrlFilter, incomeFilter, ageGroupFilter, dateFrom, dateTo, filters, dateParams]);

  const loadCompanies = async () => {
    try {
      const response = await apiClient.request('/admin/simple/filter-options') as any;
      // Use activeCompanies from CompanyDetails table for company filter
      setCompanies(response.activeCompanies || []);
      // Use companies from CompanyTracker table for unique URL filter
      setUniqueUrls(response.companies || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status_band', statusFilter);
      if (nationalityFilter !== 'all') params.append('nationality', nationalityFilter);
      if (companyFilter !== 'all') params.append('company_name', companyFilter); // Changed to company_name for CompanyDetails
      if (uniqueUrlFilter !== 'all') params.append('company_id', uniqueUrlFilter); // Unique URL uses company_id
      if (incomeFilter !== 'all') params.append('income_range', incomeFilter);
      if (incomeFilter !== 'all') params.append('income_range', incomeFilter);
      if (ageGroupFilter !== 'all') params.append('age_group', ageGroupFilter);

      // Add global date range params
      if (dateParams?.dateRange) params.append('date_range', dateParams.dateRange);
      if (dateParams?.startDate) params.append('start_date', dateParams.startDate);
      if (dateParams?.endDate) params.append('end_date', dateParams.endDate);

      // Add global demographic filters
      if (filters) {
        if (filters.genders) params.append('genders', filters.genders.join(','));
        if (filters.nationalities) params.append('nationalities', filters.nationalities.join(','));
        if (filters.emirates) params.append('emirates', filters.emirates.join(','));
        if (filters.employmentStatuses) params.append('employment_statuses', filters.employmentStatuses.join(','));
        if (filters.incomeRanges) params.append('income_ranges', filters.incomeRanges.join(','));
        if (filters.ageGroups) params.append('age_groups', filters.ageGroups.join(','));
        if (filters.children) params.append('children', filters.children.join(','));
        if (filters.activeCompanies) params.append('activeCompanies', filters.activeCompanies.join(','));
        if (filters.exclude_unique_urls) params.append('exclude_unique_urls', 'true');
      }

      console.log('🔧 [DEBUG] Loading submissions with params:', params.toString());
      const response = await apiClient.request(`/admin/simple/submissions?${params}`) as any;
      console.log('🔧 [DEBUG] Submissions response:', response);

      if (response.submissions && response.submissions.length > 0) {
        console.log('🔧 [DEBUG] First submission company data:', {
          id: response.submissions[0].id,
          company_name: response.submissions[0].company_name,
          profile_name: response.submissions[0].profile_name
        });
      }

      setSubmissions(response.submissions || []);
      setTotalPages(response.total_pages || 1);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Build filter params for stats
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status_band', statusFilter);
      if (nationalityFilter !== 'all') params.append('nationality', nationalityFilter);
      if (companyFilter !== 'all') params.append('company_name', companyFilter);
      if (uniqueUrlFilter !== 'all') params.append('company_id', uniqueUrlFilter);
      if (incomeFilter !== 'all') params.append('income_range', incomeFilter);
      if (ageGroupFilter !== 'all') params.append('age_group', ageGroupFilter);

      // Add global date range params
      if (dateParams?.dateRange) params.append('date_range', dateParams.dateRange);
      if (dateParams?.startDate) params.append('start_date', dateParams.startDate);
      if (dateParams?.endDate) params.append('end_date', dateParams.endDate);

      // Add global demographic filters
      if (filters) {
        if (filters.genders) params.append('genders', filters.genders.join(','));
        if (filters.nationalities) params.append('nationalities', filters.nationalities.join(','));
        if (filters.emirates) params.append('emirates', filters.emirates.join(','));
        if (filters.employmentStatuses) params.append('employment_statuses', filters.employmentStatuses.join(','));
        if (filters.incomeRanges) params.append('income_ranges', filters.incomeRanges.join(','));
        if (filters.ageGroups) params.append('age_groups', filters.ageGroups.join(','));
        if (filters.children) params.append('children', filters.children.join(','));
        if (filters.activeCompanies) params.append('activeCompanies', filters.activeCompanies.join(','));
        if (filters.exclude_unique_urls) params.append('exclude_unique_urls', 'true');
      }

      const queryString = params.toString();
      const url = queryString ? `/admin/simple/submissions/stats?${queryString}` : '/admin/simple/submissions/stats';
      const data = await apiClient.request(url) as any;
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.request(`/admin/simple/submissions/${id}`, {
        method: 'DELETE',
      });
      toast.success('Submission deleted successfully');
      loadSubmissions();
      loadStats();
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission');
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status_band', statusFilter);
      if (nationalityFilter !== 'all') params.append('nationality', nationalityFilter);
      if (companyFilter !== 'all') params.append('company_name', companyFilter);
      if (uniqueUrlFilter !== 'all') params.append('company_id', uniqueUrlFilter);
      if (incomeFilter !== 'all') params.append('income_range', incomeFilter);
      if (ageGroupFilter !== 'all') params.append('age_group', ageGroupFilter);
      if (dateFrom) params.append('date_from', dateFrom.toISOString());
      if (dateTo) params.append('date_to', dateTo.toISOString());

      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(
        `${apiClient.getBaseUrl()}/admin/simple/export-csv?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-clinic-submissions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Export completed successfully');
      } else {
        toast.error('Failed to export submissions');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('An error occurred during export');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (statusBand: string, score: number) => {
    const variants: Record<string, { className: string; label: string }> = {
      excellent: { className: 'bg-green-100 text-green-800', label: 'Excellent' },
      good: { className: 'bg-blue-100 text-blue-800', label: 'Good' },
      'needs improvement': { className: 'bg-yellow-100 text-yellow-800', label: 'Needs Improvement' },
      'at risk': { className: 'bg-red-100 text-red-800', label: 'At Risk' },
    };

    const status = variants[statusBand.toLowerCase()] || variants['at risk'];

    return (
      <Badge className={status.className}>
        {status.label} ({score.toFixed(1)})
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryScore = (categoryScores: any, categoryName: string) => {
    if (!categoryScores) return 0;

    // Handle nested structure: categoryScores[categoryName].score
    const categoryData = categoryScores[categoryName];
    if (categoryData && typeof categoryData === 'object' && 'score' in categoryData) {
      return categoryData.score;
    }

    // Fallback for direct numeric values
    if (typeof categoryData === 'number') {
      return categoryData;
    }

    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.this_week}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.this_month}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {stats.average_score.toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Survey Submissions</CardTitle>
              <CardDescription>View and manage all Financial Clinic submissions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadSubmissions} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleExport} disabled={isExporting} size="sm">
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-2">
              <div className="w-full sm:w-[200px]">
                <DatePickerComponent
                  date={dateFrom}
                  onSelect={setDateFrom}
                  placeholder="Date From"
                  maxDate={dateTo || new Date()}
                />
              </div>
              <div className="w-full sm:w-[200px]">
                <DatePickerComponent
                  date={dateTo}
                  onSelect={setDateTo}
                  placeholder="Date To"
                  minDate={dateFrom}
                  maxDate={new Date()}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
              <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by nationality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Nationalities</SelectItem>
                  <SelectItem value="Emirati">Emirati</SelectItem>
                  <SelectItem value="Non-Emirati">Non-Emirati</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-[200px]">
                <Popover open={showCompanyDropdown} onOpenChange={setShowCompanyDropdown}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={showCompanyDropdown}
                      className="w-full justify-between"
                    >
                      {companyFilter === 'all'
                        ? "Filter by company"
                        : companyFilter === 'other'
                          ? "Other"
                          : companies.find((company) => company.name === companyFilter)?.name || companyFilter}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search company..." />
                      <CommandList>
                        <CommandEmpty>No company found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all companies"
                            onSelect={() => {
                              setCompanyFilter("all");
                              setCompanySearch("");
                              setShowCompanyDropdown(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                companyFilter === "all" ? "opacity-100" : "opacity-0"
                              )}
                            />
                            All Companies
                          </CommandItem>
                          {companies.map((company) => (
                            <CommandItem
                              key={company.id}
                              value={company.name}
                              onSelect={(currentValue) => {
                                setCompanyFilter(currentValue === companyFilter ? "all" : currentValue);
                                setCompanySearch(currentValue === companyFilter ? "" : currentValue);
                                setShowCompanyDropdown(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  companyFilter === company.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {company.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Additional Demographic Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-[200px]">
                <Popover open={showUniqueUrlDropdown} onOpenChange={setShowUniqueUrlDropdown}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={showUniqueUrlDropdown}
                      className="w-full justify-between"
                    >
                      {uniqueUrlFilter === 'all'
                        ? "Unique URL"
                        : uniqueUrls.find((url) => url.id.toString() === uniqueUrlFilter)?.name || "Unique URL"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search URL..." />
                      <CommandList>
                        <CommandEmpty>No unique URL found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all unique urls"
                            onSelect={() => {
                              setUniqueUrlFilter("all");
                              setUniqueUrlSearch("");
                              setShowUniqueUrlDropdown(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                uniqueUrlFilter === "all" ? "opacity-100" : "opacity-0"
                              )}
                            />
                            All Unique URLs
                          </CommandItem>
                          {uniqueUrls.map((url) => (
                            <CommandItem
                              key={url.id}
                              value={url.name}
                              onSelect={() => {
                                setUniqueUrlFilter(url.id.toString());
                                setUniqueUrlSearch(url.name);
                                setShowUniqueUrlDropdown(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  uniqueUrlFilter === url.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {url.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Select value={incomeFilter} onValueChange={setIncomeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Income Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Income Ranges</SelectItem>
                  <SelectItem value="Below 5K">Below 5K</SelectItem>
                  <SelectItem value="5K-10K">5K-10K</SelectItem>
                  <SelectItem value="10K-15K">10K-15K</SelectItem>
                  <SelectItem value="15K-20K">15K-20K</SelectItem>
                  <SelectItem value="20K-30K">20K-30K</SelectItem>
                  <SelectItem value="30K-50K">30K-50K</SelectItem>
                  <SelectItem value="Above 50K">Above 50K</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Age Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Age Groups</SelectItem>
                  <SelectItem value="< 18">&lt; 18</SelectItem>
                  <SelectItem value="18-25">18-25</SelectItem>
                  <SelectItem value="26-35">26-35</SelectItem>
                  <SelectItem value="36-45">36-45</SelectItem>
                  <SelectItem value="46-60">46-60</SelectItem>
                  <SelectItem value="60+">60+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Demographics</TableHead>
                  <TableHead>Score & Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading submissions...
                    </TableCell>
                  </TableRow>
                ) : submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No submissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-mono text-sm">#{submission.id}</TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{submission.profile_name}</div>
                            <div className="text-xs text-gray-500">
                              {submission.gender} • {submission.age ? `${submission.age}y` : 'N/A'}
                            </div>
                            {submission.company_name && (
                              <div className="flex items-center gap-1 mt-1">
                                <Building className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600 truncate">
                                  {submission.company_name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[150px]">{submission.profile_email}</span>
                          </div>
                          {submission.profile_mobile && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span>{submission.profile_mobile}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <Badge variant="outline" className="text-xs">
                            {submission.nationality}
                          </Badge>
                          <div className="text-xs text-gray-500">{submission.emirate}</div>
                          <div className="text-xs text-gray-500">{submission.employment_status}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(submission.status_band, submission.total_score)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-[80px]">
                            <div className="text-xs text-gray-500 mb-1">
                              {submission.questions_answered} / {submission.total_questions}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${(submission.questions_answered / submission.total_questions) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span className="text-xs whitespace-nowrap">{formatDate(submission.created_at)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setIsDetailDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(submission.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>Detailed information about this survey submission</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6 py-4">
              {/* Profile Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <div className="font-medium">{selectedSubmission.profile_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <div className="font-medium break-all">{selectedSubmission.profile_email}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <div className="font-medium">{selectedSubmission.profile_mobile || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Gender:</span>
                    <div className="font-medium">{selectedSubmission.gender}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <div className="font-medium">{selectedSubmission.age || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Nationality:</span>
                    <div className="font-medium">{selectedSubmission.nationality}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Emirate:</span>
                    <div className="font-medium">{selectedSubmission.emirate}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Employment:</span>
                    <div className="font-medium">{selectedSubmission.employment_status}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Income Range:</span>
                    <div className="font-medium">{selectedSubmission.income_range}</div>
                  </div>
                  {selectedSubmission.company_name && (
                    <div>
                      <span className="text-gray-500">Company:</span>
                      <div className="font-medium flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {selectedSubmission.company_name}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Score Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Score & Assessment
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Score:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{selectedSubmission.total_score.toFixed(1)}</span>
                      {getStatusBadge(selectedSubmission.status_band, selectedSubmission.total_score)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Questions Answered:</span>
                    <span className="font-semibold">
                      {selectedSubmission.questions_answered} / {selectedSubmission.total_questions}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Scores */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Category Scores
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { key: 'Income Stream', label: 'Income Stream' },
                    { key: 'Savings Habit', label: 'Savings Habit' },
                    { key: 'Debt Management', label: 'Debt Management' },
                    { key: 'Retirement Planning', label: 'Retirement Planning' },
                    { key: 'Protecting Your Family', label: 'Financial Protection' },
                    { key: 'Financial Knowledge', label: 'Financial Knowledge' },
                  ].map((category) => (
                    <div key={category.key} className="p-3 border rounded-lg">
                      <div className="text-gray-500 text-xs mb-1">{category.label}</div>
                      <div className="font-bold text-lg">
                        {getCategoryScore(selectedSubmission.category_scores, category.key)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {/* Insights */}
              {selectedSubmission.insights && selectedSubmission.insights.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Key Insights
                  </h3>
                  <div className="space-y-3">
                    {selectedSubmission.insights.map((insight, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-blue-50/50 border-blue-100">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-blue-900">{insight.category}</h4>
                          <Badge variant="outline" className="text-xs bg-white capitalize">
                            {insight.status_level.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{insight.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Started:</span>
                    <span className="font-medium">{formatDate(selectedSubmission.created_at)}</span>
                  </div>
                  {selectedSubmission.completed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Completed:</span>
                      <span className="font-medium">{formatDate(selectedSubmission.completed_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
}
