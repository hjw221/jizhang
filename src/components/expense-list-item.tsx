
'use client';

import type { Expense, ExpenseCategory } from '@/types';
import { CATEGORY_COLORS } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from './category-icon';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Pencil, Trash2 } from 'lucide-react';

interface ExpenseListItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  showActions?: boolean; // New prop to control visibility of action buttons
}

export function ExpenseListItem({ expense, onEdit, onDelete, showActions = true }: ExpenseListItemProps) {
  const formattedDate = format(parseISO(expense.date), 'PPP', { locale: zhCN });
  const formattedAmount = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(expense.amount);

  const categoryColor = CATEGORY_COLORS[expense.category as ExpenseCategory] || CATEGORY_COLORS['其他'];

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 items-center gap-3 overflow-hidden">
            <CategoryIcon category={expense.category as ExpenseCategory} className="h-8 w-8 flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
              <p 
                className="font-semibold" 
                style={{ color: categoryColor }}
              >
                {expense.category}
              </p>
              {expense.description && expense.description.trim() !== '' ? (
                <p className="text-sm text-muted-foreground truncate" title={expense.description}>
                  {expense.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/70 italic">
                  无描述
                </p>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0 mx-2">
            <p className="font-semibold text-lg text-foreground">{formattedAmount}</p>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
          {showActions && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(expense)}>
                <Pencil size={16} />
                <span className="sr-only">编辑</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(expense.id)}>
                <Trash2 size={16} />
                <span className="sr-only">删除</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
