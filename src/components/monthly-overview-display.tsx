
'use client';

import { useExpenses } from '@/context/expense-context';
import type { Expense } from '@/types';
import { useState, useMemo, useEffect } from 'react';
import { format, parseISO as fnsParseISO, startOfMonth, endOfMonth, eachMonthOfInterval, getYear, getMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpenseListItem } from './expense-list-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress'; // Import Progress component
import { cn } from '@/lib/utils'; // Import cn utility

interface MonthOption {
  value: string; // "YYYY-MM"
  label: string; // "Month YYYY"
}

// Helper to parse ISO string for dates consistently
const parseISO = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  // JavaScript months are 0-indexed, so subtract 1 from month
  return new Date(year, month - 1, day || 1);
};


export function MonthlyOverviewDisplay() {
  const { expenses, getBudget } = useExpenses(); // Add getBudget
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return format(now, 'yyyy-MM');
  });

  const monthOptions = useMemo<MonthOption[]>(() => {
    if (expenses.length === 0) {
      const now = new Date();
      return [{ value: format(now, 'yyyy-MM'), label: format(now, 'yyyy年MMMM', { locale: zhCN }) }];
    }
    const dates = expenses.map(e => parseISO(e.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const interval = { start: startOfMonth(minDate), end: endOfMonth(maxDate) };
    return eachMonthOfInterval(interval)
      .map(date => ({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'yyyy年MMMM', { locale: zhCN }),
      }))
      .sort((a,b) => b.value.localeCompare(a.value)); // Show most recent first, matches budget page
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (!selectedMonth) return [];
    const [year, monthIndex] = selectedMonth.split('-').map(Number);
    return expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      return getYear(expenseDate) === year && getMonth(expenseDate) === monthIndex - 1;
    });
  }, [expenses, selectedMonth]);

  const totalForMonth = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const currentMonthBudget = useMemo(() => {
    return getBudget(selectedMonth);
  }, [selectedMonth, getBudget]);

  const budgetProgress = useMemo(() => {
    if (currentMonthBudget === undefined || currentMonthBudget === 0) return 0;
    return Math.min((totalForMonth / currentMonthBudget) * 100, 100); // Cap at 100%
  }, [totalForMonth, currentMonthBudget]);

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };
  
  useEffect(() => {
    if (monthOptions.length > 0 && !monthOptions.find(opt => opt.value === selectedMonth)) {
      setSelectedMonth(monthOptions[0].value);
    }
  }, [monthOptions, selectedMonth]);


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl">月度概览</CardTitle>
            <CardDescription>查看选定月份的费用和预算情况。</CardDescription>
          </div>
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="选择月份" />
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
        <div className="mb-6 p-4 border rounded-lg bg-secondary/50 space-y-3">
          <p className="text-lg font-semibold text-foreground">
            {monthOptions.find(opt => opt.value === selectedMonth)?.label || '选定月份'} 总支出:
            <span className="ml-2 text-primary font-bold">
              {new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(totalForMonth)}
            </span>
          </p>
          {currentMonthBudget !== undefined ? (
            <>
              <p className="text-lg font-semibold text-foreground">
                预算:
                <span className="ml-2 text-accent font-bold">
                  {new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(currentMonthBudget)}
                </span>
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                        {totalForMonth > currentMonthBudget ? 
                            `超出预算: ${new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(totalForMonth - currentMonthBudget)}` 
                            : 
                            `剩余预算: ${new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(currentMonthBudget - totalForMonth)}`}
                    </span>
                    <span>{budgetProgress.toFixed(0)}%</span>
                </div>
                <Progress value={budgetProgress} className={cn("h-3", totalForMonth > currentMonthBudget && "[&>div]:bg-destructive")} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">本月未设置预算。</p>
          )}
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">本月无费用记录。</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-3 text-foreground">费用明细:</h3>
            <ScrollArea className="h-[400px] w-full pr-4"> {/* Adjusted height */}
              {filteredExpenses.map(expense => (
                <ExpenseListItem 
                    key={expense.id} 
                    expense={expense} 
                    onEdit={() => {}} 
                    onDelete={() => {}} 
                    showActions={false} // Pass false to hide actions
                />
              ))}
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}

