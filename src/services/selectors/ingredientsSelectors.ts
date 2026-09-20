import type { RootState } from '../rootReducer';
import type { TIngredient } from '@utils-types';

export const selectIngredients = (state: RootState): TIngredient[] =>
  state.ingredients.items;

export const selectIngredientsLoading = (state: RootState): boolean =>
  state.ingredients.loading;

export const selectIngredientsError = (state: RootState): string | null =>
  state.ingredients.error;

export const selectIngredientById = (
  state: RootState,
  id?: string
): TIngredient | undefined => state.ingredients.items.find((item) => item._id === id);
