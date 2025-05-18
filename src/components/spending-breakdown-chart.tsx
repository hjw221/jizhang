'use client';

import { useExpenses } from '@/context/expense-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"
import type { ExpenseCategory } from '@/types';
import { useMemo, useState, useEffect } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, getYear, getMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChartDataPoint {
  name: ExpenseCategory;
  value: number;
  fill: string;
}
interface MonthOption {
  value: string; // "YYYY-MM" or "all"
  label: string; // "Month YYYY" or "All Time"
}

const formatCurrencyForChartTooltip = (value: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(value);
};

export function SpendingBreakdownChart() {
  const { expenses, getCategoryTotals } = useExpenses();
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' or 'YYYY-MM'

  const monthOptions = useMemo<MonthOption[]>(() => {
    const options: MonthOption[] = [{ value: 'all', label: '所有时间' }];
    if (expenses.length === 0) {
       const now = new Date();
       // Ensure there's at least the current month option if no expenses
       options.push({ value: format(now, 'yyyy-MM'), label: format(now, 'yyyy年MMMM', { locale: zhCN }) });
       return options;
    }
    const dates = expenses.map(e => parseISO(e.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const interval = { start: startOfMonth(minDate), end: endOfMonth(maxDate) };
    eachMonthOfInterval(interval)
      .map(date => ({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'yyyy年MMMM', { locale: zhCN }),
      }))
      .reverse() // Show most recent first
      .forEach(opt => options.push(opt));
    return options;
  }, [expenses]);


  const chartData = useMemo<ChartDataPoint[]>(() => {
    let expensesToConsider = expenses;
    if (selectedMonth !== 'all') {
      const [year, monthIndex] = selectedMonth.split('-').map(Number);
      expensesToConsider = expenses.filter(expense => {
        const expenseDate = parseISO(expense.date);
        return getYear(expenseDate) === year && getMonth(expenseDate) === monthIndex - 1;
      });
    }
    return getCategoryTotals(expensesToConsider);
  }, [expenses, getCategoryTotals, selectedMonth]);

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    chartData.forEach(item => {
      config[item.name] = { label: item.name, color: item.fill };
    });
    return config;
  }, [chartData]);
  
  // Effect to sync selectedMonth, especially if 'all' is selected and expenses load, or if current month has no data initially.
  useEffect(() => {
    if (monthOptions.length > 0 && !monthOptions.find(opt => opt.value === selectedMonth)) {
      // If selectedMonth is invalid (e.g. was a specific month but now no expenses for it), default to 'all'
      // Or, if it's initial and not 'all', and 'all' is an option, it's fine.
      // This logic ensures 'all' is preferred if the specific month becomes unavailable.
      if (selectedMonth !== 'all' || monthOptions.every(opt => opt.value !== 'all')) {
         setSelectedMonth(monthOptions[0].value); // Default to the first available option, which should be 'all' or most recent month
      }
    }
  }, [monthOptions, selectedMonth]);


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl">支出明细</CardTitle>
            <CardDescription>按类别可视化您的支出。</CardDescription>
          </div>
           <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="选择时期" />
            </SelectTrigger>
            <SelectContent className="bg-card">
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-10 min-h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">此期间无数据显示图表。</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="name" valueFormatter={formatCurrencyForChartTooltip} />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={70}
                strokeWidth={2}
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" className="flex-wrap justify-center" />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
