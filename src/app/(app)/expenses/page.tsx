
'use client';

import React, { useState, useMemo } from 'react';
import { ExpenseForm } from '@/components/expense-form';
import { ExpenseList } from '@/components/expense-list';
import { useExpenses } from '@/context/expense-context';
import type { Expense, ExpenseCategory } from '@/types';
import { DEFAULT_CATEGORIES } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type SortOrder = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export default function ExpensesPage() {
  const { expenses, deleteExpense } = useExpenses();
  const { toast } = useToast();

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleDeleteInitiate = (id: string) => {
    setDeletingExpenseId(id);
  };

  const handleDeleteConfirm = () => {
    if (deletingExpenseId) {
      const expenseToDelete = expenses.find(exp => exp.id === deletingExpenseId);
      deleteExpense(deletingExpenseId);
      toast({
        title: '费用已删除',
        description: `${expenseToDelete?.description || '该费用'} 已成功删除。`,
      });
      setDeletingExpenseId(null);
    }
  };

  const handleFormSubmitOrCancel = () => {
    setEditingExpense(null);
  };

  const displayedExpenses = useMemo(() => {
    let processedExpenses = [...expenses];

    // Filter by category
    if (filterCategory && filterCategory !== 'all') {
      processedExpenses = processedExpenses.filter(expense => expense.category === filterCategory);
    }

    // Sort
    switch (sortOrder) {
      case 'date-asc':
        processedExpenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'amount-desc':
        processedExpenses.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        processedExpenses.sort((a, b) => a.amount - b.amount);
        break;
      case 'date-desc':
      default:
        processedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }
    return processedExpenses;
  }, [expenses, sortOrder, filterCategory]);

  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <ExpenseForm isEditMode={false} />
      
      <Separator className="my-8" />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">所有费用记录</CardTitle>
           <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="filter-category">筛选类别</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger id="filter-category">
                  <SelectValue placeholder="所有类别" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">所有类别</SelectItem>
                  {DEFAULT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="sort-order">排序方式</Label>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                <SelectTrigger id="sort-order">
                  <SelectValue placeholder="选择排序方式" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="date-desc">日期最新</SelectItem>
                  <SelectItem value="date-asc">日期最旧</SelectItem>
                  <SelectItem value="amount-desc">金额最高</SelectItem>
                  <SelectItem value="amount-asc">金额最低</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ExpenseList expenses={displayedExpenses} onEdit={handleEdit} onDelete={handleDeleteInitiate} />
        </CardContent>
      </Card>

      {/* Edit Expense Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={(isOpen) => !isOpen && setEditingExpense(null)}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle>编辑费用</DialogTitle>
          </DialogHeader>
          {editingExpense && ( 
            <ExpenseForm
              key={editingExpense.id} // Ensures form remounts with new initial values
              isEditMode={true}
              expenseToEdit={editingExpense}
              onFormSubmit={handleFormSubmitOrCancel}
              onCancel={handleFormSubmitOrCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingExpenseId} onOpenChange={(isOpen) => !isOpen && setDeletingExpenseId(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除费用吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久删除该费用记录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingExpenseId(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
