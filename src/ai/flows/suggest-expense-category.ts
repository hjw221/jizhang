// use server'

/**
 * @fileOverview This file defines a Genkit flow for suggesting expense categories based on a user-provided description.
 *
 * - suggestExpenseCategory - An async function that takes a description and returns a suggested category.
 * - SuggestExpenseCategoryInput - The input type for suggestExpenseCategory, a description string.
 * - SuggestExpenseCategoryOutput - The output type, a string representing the suggested expense category.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { DEFAULT_CATEGORIES } from '@/types';

const SuggestExpenseCategoryInputSchema = z.object({
  description: z.string().describe('费用的描述。'),
});
export type SuggestExpenseCategoryInput = z.infer<typeof SuggestExpenseCategoryInputSchema>;

const SuggestExpenseCategoryOutputSchema = z.object({
  category: z.string().describe('建议的费用类别。'),
});
export type SuggestExpenseCategoryOutput = z.infer<typeof SuggestExpenseCategoryOutputSchema>;

export async function suggestExpenseCategory(input: SuggestExpenseCategoryInput): Promise<SuggestExpenseCategoryOutput> {
  return suggestExpenseCategoryFlow(input);
}

const categoriesString = DEFAULT_CATEGORIES.join('、');

const prompt = ai.definePrompt({
  name: 'suggestExpenseCategoryPrompt',
  input: {schema: SuggestExpenseCategoryInputSchema},
  output: {schema: SuggestExpenseCategoryOutputSchema},
  prompt: `请根据以下费用描述，从以下类别中选择一个最合适的费用类别：${categoriesString}。\n\n费用描述：{{{description}}}\n\n建议类别：`,
});

const suggestExpenseCategoryFlow = ai.defineFlow(
  {
    name: 'suggestExpenseCategoryFlow',
    inputSchema: SuggestExpenseCategoryInputSchema,
    outputSchema: SuggestExpenseCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
