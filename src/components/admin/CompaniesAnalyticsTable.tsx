import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Building, Search } from 'lucide-react';
import { CompanyAnalytics } from '@/lib/admin-api';

interface CompaniesAnalyticsTableProps {
  data: CompanyAnalytics[];
}

type SortField = 'company' | 'total_submissions' | 'average_score';
type SortOrder = 'asc' | 'desc';

export function CompaniesAnalyticsTable({ data }: CompaniesAnalyticsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('total_submissions');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Ensure data is always an array
  const tableData = Array.isArray(data) ? data : [];

  // Filter by search term
  const filteredData = tableData.filter((company) =>
    (company.company?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const comparison = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getStatusBadge = (score: number) => {
    if (score >= 65) return <Badge className="bg-green-600">Excellent</Badge>;
    if (score >= 50) return <Badge className="bg-blue-600">Good</Badge>;
    if (score >= 35) return <Badge className="bg-yellow-600">Needs Improvement</Badge>;
    return <Badge className="bg-red-600">At Risk</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Companies Analytics
            </CardTitle>
            <CardDescription>Performance metrics by company</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No companies found matching your search.' : 'No company data available.'}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('company')}
                        className="h-8 font-semibold"
                      >
                        Company
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('total_submissions')}
                        className="h-8 font-semibold"
                      >
                        Total
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('average_score')}
                        className="h-8 font-semibold"
                      >
                        Avg Score
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Excellent</TableHead>
                    <TableHead className="text-center">Good</TableHead>
                    <TableHead className="text-center">Needs Imp.</TableHead>
                    <TableHead className="text-center">At Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((company, index) => (
                    <TableRow key={`${company.company}-${index}`}>
                      <TableCell className="font-medium">{company.company}</TableCell>
                      <TableCell className="text-center font-semibold">
                        {company.total_submissions}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-lg">
                          {company.average_score.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(company.average_score)}
                      </TableCell>
                      <TableCell className="text-center text-green-600 font-medium">
                        {company.excellent}
                      </TableCell>
                      <TableCell className="text-center text-blue-600 font-medium">
                        {company.good}
                      </TableCell>
                      <TableCell className="text-center text-yellow-600 font-medium">
                        {company.needs_improvement}
                      </TableCell>
                      <TableCell className="text-center text-red-600 font-medium">
                        {company.at_risk}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {sortedData.length} of {tableData.length} companies
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
