import {
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  updateUserApi,
  type TLoginData,
  type TRegisterData,
} from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import type { TUser } from '@utils-types';

export const checkUserAuth = createAsyncThunk(
  'user/checkUserAuth',
  async (): Promise<TUser | null> => {
    if (!getCookie('accessToken')) {
      return null;
    }

    const data = await getUserApi();

    if (!data.success) {
      return Promise.reject(new Error('Не удалось получить данные пользователя'));
    }

    return data.user;
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: TLoginData): Promise<TUser> => {
    const data = await loginUserApi(credentials);

    localStorage.setItem('refreshToken', data.refreshToken);
    setCookie('accessToken', data.accessToken);

    return data.user;
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (formData: TRegisterData): Promise<TUser> => {
    const data = await registerUserApi(formData);

    localStorage.setItem('refreshToken', data.refreshToken);
    setCookie('accessToken', data.accessToken);

    return data.user;
  }
);

export const logoutUser = createAsyncThunk('user/logout', async (): Promise<void> => {
  await logoutApi();
  localStorage.removeItem('refreshToken');
  deleteCookie('accessToken');
});

export const updateUser = createAsyncThunk(
  'user/update',
  async (userData: Partial<TRegisterData>): Promise<TUser> => {
    const data = await updateUserApi(userData);

    if (!data.success) {
      return Promise.reject(new Error('Не удалось обновить данные пользователя'));
    }

    return data.user;
  }
);

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  loading: boolean;
  error: string | null;
  updateUserError: string | null;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  loading: false,
  error: null,
  updateUserError: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
      state.updateUserError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUserAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthChecked = true;
        state.user = action.payload;
      })
      .addCase(checkUserAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthChecked = true;
        state.user = null;
        state.error = action.error.message ?? null;
        localStorage.removeItem('refreshToken');
        deleteCookie('accessToken');
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Ошибка входа';
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Ошибка регистрации';
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.error.message ?? 'Ошибка выхода';
        localStorage.removeItem('refreshToken');
        deleteCookie('accessToken');
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.updateUserError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.updateUserError = action.error.message ?? 'Не удалось сохранить изменения';
      });
  },
});

export const { clearUserError } = userSlice.actions;
export const userReducer = userSlice.reducer;
