import type { RootState } from '../rootReducer';
import type { TConstructorState, TOrder } from '@utils-types';

export const selectConstructorItems = (state: RootState): TConstructorState =>
  state.burgerConstructor.constructorItems;

export const selectOrderRequest = (state: RootState): boolean =>
  state.burgerConstructor.orderRequest;

export const selectOrderModalData = (state: RootState): TOrder | null =>
  state.burgerConstructor.orderModalData;

export const selectConstructorError = (state: RootState): string | null =>
  state.burgerConstructor.error;
