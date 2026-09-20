import { orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
  TOrder,
} from '@utils-types';

const createConstructorIngredient = (
  ingredient: TIngredient
): TConstructorIngredient => ({
  ...ingredient,
  id: crypto.randomUUID(),
});

export const createOrder = createAsyncThunk(
  'constructor/createOrder',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { burgerConstructor: TConstructorSliceState };
    const { bun, ingredients } = state.burgerConstructor.constructorItems;

    if (!bun) {
      return rejectWithValue('Добавьте булку');
    }

    const orderIngredients = [bun._id, ...ingredients.map((item) => item._id), bun._id];

    const data = await orderBurgerApi(orderIngredients);
    return data.order;
  }
);

type TConstructorSliceState = {
  constructorItems: TConstructorState;
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: string | null;
};

const initialState: TConstructorSliceState = {
  constructorItems: {
    bun: null,
    ingredients: [],
  },
  orderRequest: false,
  orderModalData: null,
  error: null,
};

export const constructorSlice = createSlice({
  name: 'constructor',
  initialState,
  reducers: {
    addIngredient: (state, action: PayloadAction<TIngredient>) => {
      const ingredient = action.payload;

      if (ingredient.type === 'bun') {
        state.constructorItems.bun = createConstructorIngredient(ingredient);
        return;
      }

      state.constructorItems.ingredients.push(createConstructorIngredient(ingredient));
    },
    removeIngredient: (state, action: PayloadAction<number>) => {
      state.constructorItems.ingredients.splice(action.payload, 1);
    },
    moveIngredient: (state, action: PayloadAction<{ from: number; to: number }>) => {
      const { from, to } = action.payload;
      const items = state.constructorItems.ingredients;

      if (to < 0 || to >= items.length) {
        return;
      }

      const [movedItem] = items.splice(from, 1);
      items.splice(to, 0, movedItem);
    },
    clearConstructor: (state) => {
      state.constructorItems = {
        bun: null,
        ingredients: [],
      };
    },
    clearOrderModal: (state) => {
      state.orderModalData = null;
      state.orderRequest = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
        state.constructorItems = {
          bun: null,
          ingredients: [],
        };
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : (action.error.message ?? 'Не удалось оформить заказ');
      });
  },
});

export const {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  clearOrderModal,
} = constructorSlice.actions;

export const constructorReducer = constructorSlice.reducer;
