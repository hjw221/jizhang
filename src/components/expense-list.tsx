
'use client';

import type { Expense } from '@/types';
import { ExpenseListItem } from './expense-list-item';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">暂无费用记录。</p>
        <p className="text-sm text-muted-foreground">请使用上方表单添加费用。</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)] md:h-[calc(100vh-260px)] lg:h-[calc(100vh-240px)] w-full pr-4"> {/* Dynamic height */}
      {expenses.map((expense) => (
        <ExpenseListItem key={expense.id} expense={expense} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ScrollArea>
  );
}
