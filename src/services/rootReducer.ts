import { combineReducers } from '@reduxjs/toolkit';

import { constructorReducer } from './slices/constructorSlice';
import { feedReducer } from './slices/feedSlice';
import { ingredientsReducer } from './slices/ingredientsSlice';
import { ordersReducer } from './slices/ordersSlice';
import { userReducer } from './slices/userSlice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  feed: feedReducer,
  user: userReducer,
  burgerConstructor: constructorReducer,
  orders: ordersReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
