import { getFeedsApi } from '@api';
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { TOrder, TOrdersData } from '@utils-types';

export const fetchFeeds = createAsyncThunk('feed/fetchFeeds', getFeedsApi);

type TFeedSliceState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  loading: boolean;
  error: string | null;
};

const initialState: TFeedSliceState = {
  orders: [],
  total: 0,
  totalToday: 0,
  loading: false,
  error: null,
};

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setFeedData: (state, action: PayloadAction<TOrdersData>) => {
      state.orders = action.payload.orders;
      state.total = action.payload.total;
      state.totalToday = action.payload.totalToday;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Не удалось загрузить ленту заказов';
      });
  },
});

export const { setFeedData } = feedSlice.actions;
export const feedReducer = feedSlice.reducer;
