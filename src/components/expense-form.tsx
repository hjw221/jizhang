
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useExpenses } from '@/context/expense-context';
import { DEFAULT_CATEGORIES, type ExpenseCategory, type Expense } from '@/types';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const expenseFormSchema = z.object({
  date: z.date({
    required_error: '日期是必填项。',
  }),
  amount: z.coerce.number().positive({ message: '金额必须为正数。' }),
  category: z.string().min(1, { message: '类别是必填项。' }),
  description: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  expenseToEdit?: Expense | null;
  onFormSubmit?: () => void;
  onCancel?: () => void;
  isEditMode?: boolean;
}

export function ExpenseForm({ expenseToEdit, onFormSubmit, onCancel, isEditMode = false }: ExpenseFormProps) {
  const { addExpense, editExpense } = useExpenses();
  const { toast } = useToast();

  const memoizedDefaultValues = useMemo(() => {
    if (isEditMode && expenseToEdit) {
      return {
        date: parseISO(expenseToEdit.date),
        amount: expenseToEdit.amount,
        category: expenseToEdit.category,
        description: expenseToEdit.description || '',
      };
    }
    // Default values for "add" mode
    return {
      date: new Date(),
      amount: undefined as any, // Important for number input to be clearable
      category: '', // Empty string for Select to show placeholder
      description: '',
    };
  }, [isEditMode, expenseToEdit]);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: memoizedDefaultValues,
  });

  // Effect to reset the form if the determined default values change (e.g., switching between add/edit, or new expenseToEdit)
  useEffect(() => {
    form.reset(memoizedDefaultValues);
  }, [memoizedDefaultValues, form.reset]);

  const onSubmit = (data: ExpenseFormValues) => {
    const formattedDate = format(data.date, 'yyyy-MM-dd');
    const submissionData = {
        ...data,
        description: data.description || '',
        date: formattedDate,
    };

    if (isEditMode && expenseToEdit) {
      editExpense(expenseToEdit.id, submissionData);
      toast({
        title: '费用已更新',
        description: `${data.description || '该费用'} 已成功更新。`,
      });
    } else {
      addExpense(submissionData);
      toast({
        title: '费用已添加',
        description: `${data.description || '该费用'} 已成功记录。`,
      });
      // Reset to "add new" state after successful submission
      form.reset({
        date: new Date(),
        amount: undefined as any,
        category: '',
        description: '',
      });
    }
    if (onFormSubmit) {
      onFormSubmit();
    }
  };

  const FormContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="date">日期</Label>
        <Controller
          name="date"
          control={form.control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, 'PPP', { locale: zhCN }) : <span>选择日期</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                  locale={zhCN}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {form.formState.errors.date && (
          <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">金额</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="例如 15.99"
          {...form.register('amount')}
          className={form.formState.errors.amount ? 'border-destructive' : ''}
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">描述 <span className="text-xs text-muted-foreground">(可选)</span></Label>
        <Textarea
          id="description"
          placeholder="例如 与同事共进午餐"
          {...form.register('description')}
          className={form.formState.errors.description ? 'border-destructive' : ''}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">类别</Label>
        <Controller
          name="category"
          control={form.control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className={cn(form.formState.errors.category ? 'border-destructive' : '')}>
                <SelectValue placeholder="选择一个类别" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {DEFAULT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.category && (
          <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
        )}
      </div>
      <div className={cn("flex gap-2", isEditMode ? "justify-end" : "p-0 pt-4")}>
        {isEditMode && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="submit" className={cn(!isEditMode && "w-full")} disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (isEditMode ? '更新中...' : '添加中...') : (isEditMode ? '更新费用' : '添加费用')}
        </Button>
      </div>
    </form>
  );

  if (isEditMode) {
    return FormContent;
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">记录新费用</CardTitle>
      </CardHeader>
      <CardContent>
        {FormContent}
      </CardContent>
    </Card>
  );
}
