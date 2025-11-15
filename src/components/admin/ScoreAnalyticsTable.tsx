import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { ScoreAnalyticsRow, ScoreAnalyticsResponse } from '@/lib/admin-api';

interface ScoreAnalyticsTableProps {
  data: ScoreAnalyticsResponse | null;
}

interface GroupedQuestion extends ScoreAnalyticsRow {
  isFirstInCategory: boolean;
  categoryRowSpan: number;
}

export function ScoreAnalyticsTable({ data }: ScoreAnalyticsTableProps) {
  // Extract questions array from the response
  const questions = data?.questions || [];
  const sortedData = [...questions].sort((a, b) => a.question_number - b.question_number);

  // Group data by category and calculate rowspans
  const groupedData = useMemo(() => {
    const grouped: GroupedQuestion[] = [];
    const categoryMap = new Map<string, number>();

    // First pass: count questions per category
    sortedData.forEach(row => {
      categoryMap.set(row.category, (categoryMap.get(row.category) || 0) + 1);
    });

    // Second pass: mark first occurrence and add rowspan
    const categoryFirstOccurrence = new Map<string, boolean>();
    
    sortedData.forEach(row => {
      const isFirstInCategory = !categoryFirstOccurrence.has(row.category);
      if (isFirstInCategory) {
        categoryFirstOccurrence.set(row.category, true);
      }

      grouped.push({
        ...row,
        isFirstInCategory,
        categoryRowSpan: categoryMap.get(row.category) || 1
      });
    });

    return grouped;
  }, [sortedData]);

  const formatScore = (score: number | null, count: number) => {
    if (score === null || count === 0) {
      return <span className="text-muted-foreground text-sm">-</span>;
    }
    return (
      <div className="flex flex-col items-center">
        <span className="font-semibold">{score.toFixed(2)}</span>
        <span className="text-xs text-muted-foreground">({count})</span>
      </div>
    );
  };

  const calculateTotal = (emirati: number | null, nonEmirati: number | null, emiratiCount: number, nonEmiratiCount: number) => {
    if ((emirati === null || emiratiCount === 0) && (nonEmirati === null || nonEmiratiCount === 0)) {
      return <span className="text-muted-foreground text-sm">-</span>;
    }

    let total = 0;
    let validCount = 0;

    if (emirati !== null && emiratiCount > 0) {
      total += emirati;
      validCount++;
    }

    if (nonEmirati !== null && nonEmiratiCount > 0) {
      total += nonEmirati;
      validCount++;
    }

    const average = validCount > 0 ? total / validCount : 0;

    return (
      <div className="flex flex-col items-center">
        <span className="font-semibold">{average.toFixed(2)}</span>
        <span className="text-xs text-muted-foreground">({emiratiCount + nonEmiratiCount})</span>
      </div>
    );
  };

  const formatCategoryName = (category: string) => {
    // Convert category names to display format
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Question-Level Score Analytics
          {data?.question_set_type === 'company_variation' && data?.variation_set_name && (
            <Badge variant="secondary" className="ml-2">
              {data.variation_set_name}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Detailed breakdown by question comparing Emirati vs Non-Emirati responses
          {data?.question_set_type === 'company_variation' && (
            <span className="block mt-1 text-xs">
              Showing company-specific question variations
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {groupedData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No score analytics data available.
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold min-w-[150px]">Category</TableHead>
                    <TableHead className="font-semibold min-w-[350px]">Questions</TableHead>
                    <TableHead className="text-center font-semibold" colSpan={3}>
                      Avg Score
                    </TableHead>
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableHead className="border-r"></TableHead>
                    <TableHead className="border-r"></TableHead>
                    <TableHead className="text-center font-semibold w-[120px]">Emiratis</TableHead>
                    <TableHead className="text-center font-semibold w-[120px]">Non-Emiratis</TableHead>
                    <TableHead className="text-center font-semibold w-[120px]">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedData.map((row, index) => (
                    <TableRow key={row.question_number} className="hover:bg-muted/20">
                      {row.isFirstInCategory && (
                        <TableCell 
                          className="font-semibold align-top bg-muted/10 border-r"
                          rowSpan={row.categoryRowSpan}
                        >
                          {formatCategoryName(row.category)}
                        </TableCell>
                      )}
                      <TableCell className="text-sm border-r">
                        <div className="flex gap-2">
                          <span className="font-medium text-muted-foreground min-w-[20px]">
                            {row.question_number}.
                          </span>
                          <span>{row.question_text}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {formatScore(row.emirati_avg, row.emirati_count)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatScore(row.non_emirati_avg, row.non_emirati_count)}
                      </TableCell>
                      <TableCell className="text-center bg-muted/10">
                        {calculateTotal(row.emirati_avg, row.non_emirati_avg, row.emirati_count, row.non_emirati_count)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
                <p className="text-2xl font-bold">{groupedData.length}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Emirati Responses</p>
                <p className="text-2xl font-bold">
                  {groupedData.reduce((sum, row) => sum + row.emirati_count, 0)}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Non-Emirati Responses</p>
                <p className="text-2xl font-bold">
                  {groupedData.reduce((sum, row) => sum + row.non_emirati_count, 0)}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
