
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExpenses } from '@/context/expense-context'; // Assuming setBudget and getBudget will be added here
import { useToast } from '@/hooks/use-toast';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface MonthOption {
  value: string; // "YYYY-MM"
  label: string; // "Month YYYY"
}

// Helper to parse ISO string for dates from expenses
const parseISO = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month -1, day || 1);
}

export default function BudgetPage() {
  const { expenses, setBudget, getBudget } = useExpenses();
  const { toast } = useToast();
  
  const [selectedMonth, setSelectedMonth] = useState<string>(() => format(new Date(), 'yyyy-MM'));
  const [budgetAmount, setBudgetAmount] = useState<string>('');

  const monthOptions = useMemo<MonthOption[]>(() => {
    // Generate a range of months, e.g., last 12 months and next 12 months from today
    // Or base it on existing expense dates plus some future months
    const N_MONTHS_PAST = 12;
    const N_MONTHS_FUTURE = 12;
    const today = new Date();
    const start = subMonths(startOfMonth(today), N_MONTHS_PAST);
    const end = addMonths(endOfMonth(today), N_MONTHS_FUTURE);

    let uniqueMonthsSet = new Set<string>();
    expenses.forEach(e => uniqueMonthsSet.add(format(parseISO(e.date), 'yyyy-MM')));
    
    const interval = { start, end };
     eachMonthOfInterval(interval).forEach(date => {
      uniqueMonthsSet.add(format(date, 'yyyy-MM'));
    });

    // If no expenses and default interval doesn't include current month (edge case)
    if (!uniqueMonthsSet.has(format(today, 'yyyy-MM'))) {
        uniqueMonthsSet.add(format(today, 'yyyy-MM'));
    }

    return Array.from(uniqueMonthsSet)
      .map(monthStr => ({
        value: monthStr,
        label: format(parseISO(monthStr + '-01'), 'yyyy年MMMM', { locale: zhCN }),
      }))
      .sort((a, b) => b.value.localeCompare(a.value)); // Show most recent first
  }, [expenses]);


  // Load budget for the selected month when it changes
  useEffect(() => {
    const currentBudget = getBudget(selectedMonth);
    setBudgetAmount(currentBudget !== undefined ? String(currentBudget) : '');
  }, [selectedMonth, getBudget]);
  
  // Ensure selectedMonth is valid if monthOptions change
  useEffect(() => {
    if (monthOptions.length > 0 && !monthOptions.find(opt => opt.value === selectedMonth)) {
      setSelectedMonth(monthOptions[0].value);
    } else if (monthOptions.length === 0 && selectedMonth !== format(new Date(), 'yyyy-MM')) {
      // Fallback if monthOptions becomes empty for some reason
      setSelectedMonth(format(new Date(), 'yyyy-MM'));
    }
  }, [monthOptions, selectedMonth]);


  const handleSaveBudget = () => {
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: '无效金额',
        description: '请输入一个有效的正数作为预算金额。',
        variant: 'destructive',
      });
      return;
    }
    setBudget(selectedMonth, amount);
    toast({
      title: '预算已保存',
      description: `${format(parseISO(selectedMonth + '-01'), 'yyyy年MMMM', { locale: zhCN })} 的预算已更新为 ${new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)}。`,
    });
  };
  

  return (
    <div className="container mx-auto max-w-lg space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">设置月度预算</CardTitle>
          <CardDescription>为选定的月份设置总预算金额。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="month-select">选择月份</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month-select">
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
          <div className="space-y-2">
            <Label htmlFor="budget-amount">预算金额 (¥)</Label>
            <Input
              id="budget-amount"
              type="number"
              placeholder="例如 5000"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              min="0"
            />
          </div>
          <Button onClick={handleSaveBudget} className="w-full">
            保存预算
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
