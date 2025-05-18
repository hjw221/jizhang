import type { ExpenseCategory } from '@/types';
import { CATEGORY_COLORS } from '@/types';
import {
  Utensils,
  Car,
  ShoppingCart,
  FileText,
  Play,
  HeartPulse,
  ShoppingBasket,
  Package,
  type LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  category: ExpenseCategory | string;
}

export function CategoryIcon({ category, className, ...props }: CategoryIconProps) {
  const categoryTyped = category as ExpenseCategory;
  const color = CATEGORY_COLORS[categoryTyped] || CATEGORY_COLORS['其他']; // Fallback to '其他' color

  const iconProps: LucideProps = {
    size: props.size || 20, // Use passed size or default to 20
    style: { color, ...props.style }, // Apply color via style, merge with existing styles
    className, // Keep other classNames
    ...props,
  };

  switch (categoryTyped) {
    case '餐饮':
      return <Utensils {...iconProps} />;
    case '交通':
      return <Car {...iconProps} />;
    case '购物':
      return <ShoppingCart {...iconProps} />;
    case '账单':
      return <FileText {...iconProps} />;
    case '娱乐':
      return <Play {...iconProps} />;
    case '健康':
      return <HeartPulse {...iconProps} />;
    case '日用':
      return <ShoppingBasket {...iconProps} />;
    case '其他':
    default:
      return <Package {...iconProps} />;
  }
}
