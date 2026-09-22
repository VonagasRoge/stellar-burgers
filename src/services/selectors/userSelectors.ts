import type { RootState } from '../rootReducer';
import type { TUser } from '@utils-types';

export const selectUser = (state: RootState): TUser | null => state.user.user;

export const selectIsAuthChecked = (state: RootState): boolean =>
  state.user.isAuthChecked;

export const selectIsAuth = (state: RootState): boolean => state.user.user !== null;

export const selectUserLoading = (state: RootState): boolean => state.user.loading;

export const selectUserError = (state: RootState): string | null => state.user.error;

export const selectUserName = (state: RootState): string | undefined =>
  state.user.user?.name;

export const selectUpdateUserError = (state: RootState): string | null =>
  state.user.updateUserError;
