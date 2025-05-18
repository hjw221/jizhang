export interface Expense {
  id: string;
  date: string; // Store as ISO string e.g. "2023-10-27"
  amount: number;
  category: string;
  description?: string; // Made optional
}

export const DEFAULT_CATEGORIES = [
  "餐饮", // Food
  "交通", // Transport
  "购物", // Shopping
  "账单", // Bills
  "娱乐", // Entertainment
  "健康", // Healthcare
  "日用", // Groceries
  "其他", // Other
] as const;

export type ExpenseCategory = (typeof DEFAULT_CATEGORIES)[number];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  "餐饮": "hsl(var(--chart-1))",
  "交通": "hsl(var(--chart-2))",
  "购物": "hsl(var(--chart-3))",
  "账单": "hsl(var(--chart-4))",
  "娱乐": "hsl(var(--chart-5))",
  "健康": "hsl(var(--primary))",
  "日用": "hsl(var(--accent))",
  "其他": "hsl(var(--muted-foreground))",
};
