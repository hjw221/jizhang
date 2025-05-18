'use server';

import { suggestExpenseCategory as suggestExpenseCategoryFlow } from '@/ai/flows/suggest-expense-category';
import type { SuggestExpenseCategoryInput } from '@/ai/flows/suggest-expense-category';

export async function suggestCategoryAction(input: SuggestExpenseCategoryInput): Promise<string> {
  try {
    const result = await suggestExpenseCategoryFlow(input);
    return result.category;
  } catch (error) {
    console.error('Error suggesting category:', error);
    // Fallback or rethrow, depending on desired error handling
    // For now, return a generic suggestion or throw to be caught by the form
    return "其他"; 
  }
}
