import { getOrderByNumberApi, getOrdersApi } from '@api';
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

export const fetchUserOrders = createAsyncThunk('orders/fetchUserOrders', getOrdersApi);

export const fetchOrderByNumber = createAsyncThunk(
  'orders/fetchOrderByNumber',
  async (number: number): Promise<TOrder> => {
    const data = await getOrderByNumberApi(number);

    if (!data.success || !data.orders.length) {
      return Promise.reject(new Error('Заказ не найден'));
    }

    return data.orders[0];
  }
);

type TOrdersState = {
  userOrders: TOrder[];
  currentOrder: TOrder | null;
  loading: boolean;
  currentOrderLoading: boolean;
  error: string | null;
};

const initialState: TOrdersState = {
  userOrders: [],
  currentOrder: null,
  loading: false,
  currentOrderLoading: false,
  error: null,
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setUserOrders: (state, action: PayloadAction<TOrder[]>) => {
      state.userOrders = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Не удалось загрузить заказы';
      })
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.currentOrderLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.currentOrderLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.currentOrderLoading = false;
        state.currentOrder = null;
        state.error = action.error.message ?? 'Не удалось загрузить заказ';
      });
  },
});

export const { clearCurrentOrder, setUserOrders } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
