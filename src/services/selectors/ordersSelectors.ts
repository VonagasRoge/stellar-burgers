import type { RootState } from '../rootReducer';
import type { TOrder } from '@utils-types';

export const selectUserOrders = (state: RootState): TOrder[] => state.orders.userOrders;

export const selectUserOrdersLoading = (state: RootState): boolean =>
  state.orders.loading;

export const selectCurrentOrder = (state: RootState): TOrder | null =>
  state.orders.currentOrder;

export const selectCurrentOrderLoading = (state: RootState): boolean =>
  state.orders.currentOrderLoading;

export const selectOrdersError = (state: RootState): string | null => state.orders.error;
