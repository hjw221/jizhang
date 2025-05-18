
'use client';

import type { Expense, ExpenseCategory } from '@/types';
import { CATEGORY_COLORS } from '@/types'; // Import CATEGORY_COLORS
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Budget {
  [monthYear: string]: number; // Key: "YYYY-MM", Value: budget amount
}

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expenseData: Omit<Expense, 'id'>) => void;
  editExpense: (id: string, updatedData: Omit<Expense, 'id' | 'date'> & { date: string }) => void;
  deleteExpense: (id: string) => void;
  getMonthlyExpenses: (year: number, month: number) => Expense[];
  getCategoryTotals: (expensesToConsider?: Expense[]) => { name: ExpenseCategory; value: number; fill: string }[];
  budgets: Budget;
  setBudget: (monthYear: string, amount: number) => void;
  getBudget: (monthYear: string) => number | undefined;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load Expenses
      const savedExpenses = localStorage.getItem('expenses');
      if (savedExpenses) {
        try {
          const parsedExpenses = JSON.parse(savedExpenses);
          if (Array.isArray(parsedExpenses)) {
            setExpenses(parsedExpenses);
          } else {
            console.error("Failed to parse expenses from localStorage: not an array");
            setExpenses([]);
          }
        } catch (error) {
          console.error("Failed to parse expenses from localStorage:", error);
          setExpenses([]);
        }
      }

      // Load Budgets
      const savedBudgets = localStorage.getItem('budgets');
      if (savedBudgets) {
        try {
          const parsedBudgets = JSON.parse(savedBudgets);
          if (typeof parsedBudgets === 'object' && parsedBudgets !== null) {
            setBudgets(parsedBudgets);
          } else {
             console.error("Failed to parse budgets from localStorage: not an object");
            setBudgets({});
          }
        } catch (error) {
          console.error("Failed to parse budgets from localStorage:", error);
          setBudgets({});
        }
      }
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [expenses, isLoaded]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem('budgets', JSON.stringify(budgets));
    }
  }, [budgets, isLoaded]);


  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: new Date().toISOString() + Math.random().toString(36).substring(2, 9),
    };
    setExpenses(prevExpenses => [newExpense, ...prevExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const editExpense = (id: string, updatedData: Omit<Expense, 'id' | 'date'> & { date: string }) => {
    setExpenses(prevExpenses =>
      prevExpenses.map(expense =>
        expense.id === id ? { ...expense, ...updatedData } : expense
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
  };

  const getMonthlyExpenses = (year: number, month: number): Expense[] => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
    });
  };

  const getCategoryTotals = (expensesToConsider: Expense[] = expenses): { name: ExpenseCategory; value: number; fill: string }[] => {
    const totals = expensesToConsider.reduce((acc, expense) => {
      const category = expense.category as ExpenseCategory; // Ensure category is one of the defined types
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    return Object.entries(totals).map(([name, value]) => ({
      name: name as ExpenseCategory,
      value,
      fill: CATEGORY_COLORS[name as ExpenseCategory] || CATEGORY_COLORS["其他"], // Use imported CATEGORY_COLORS
    }));
  };

  const setBudget = (monthYear: string, amount: number) => {
    setBudgets(prevBudgets => ({
      ...prevBudgets,
      [monthYear]: amount,
    }));
  };

  const getBudget = (monthYear: string): number | undefined => {
    return budgets[monthYear];
  };


  return (
    <ExpenseContext.Provider value={{ 
        expenses, addExpense, editExpense, deleteExpense, getMonthlyExpenses, getCategoryTotals,
        budgets, setBudget, getBudget
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
