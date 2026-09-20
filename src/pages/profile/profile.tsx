import { selectUpdateUserError, selectUser } from '@selectors/userSelectors';
import { logoutUser, updateUser } from '@slices/userSlice';
import { ProfileUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

export const Profile = (): React.JSX.Element => {
  const user = useSelector(selectUser) ?? {
    name: '',
    email: '',
  };
  const updateUserError = useSelector(selectUpdateUserError);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formValue, setFormValue] = useState({
    name: user.name,
    email: user.email,
    password: '',
  });

  useEffect(() => {
    setFormValue((prevState) => ({
      ...prevState,
      name: user?.name || '',
      email: user?.email || '',
    }));
  }, [user]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    const isPasswordChanged = !!formValue.password;

    void dispatch(
      updateUser({
        name: formValue.name,
        email: formValue.email,
        ...(formValue.password ? { password: formValue.password } : {}),
      })
    )
      .unwrap()
      .then(() => {
        // После смены пароля пользователь должен заново войти:
        // выходим и перенаправляем на страницу входа. /login закрыт
        // ProtectedRoute для авторизованных, поэтому logout обязателен.
        if (isPasswordChanged) {
          void dispatch(logoutUser())
            .unwrap()
            .catch(() => undefined)
            .then(() => {
              void navigate('/login', { replace: true });
            });
          return;
        }

        setFormValue((prevState) => ({
          ...prevState,
          password: '',
        }));
      })
      .catch(() => undefined);
  };

  const handleCancel = (e: SyntheticEvent): void => {
    e.preventDefault();
    setFormValue({
      name: user.name,
      email: user.email,
      password: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      updateUserError={updateUserError ?? undefined}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
