import type { RootState } from '../rootReducer';
import type { TFeedState, TOrder } from '@utils-types';

export const selectFeedOrders = (state: RootState): TOrder[] => state.feed.orders;

export const selectFeedLoading = (state: RootState): boolean => state.feed.loading;

export const selectFeedError = (state: RootState): string | null => state.feed.error;

export const selectFeedInfo = (state: RootState): TFeedState => ({
  orders: state.feed.orders,
  total: state.feed.total,
  totalToday: state.feed.totalToday,
  isLoading: state.feed.loading,
  error: state.feed.error,
});
