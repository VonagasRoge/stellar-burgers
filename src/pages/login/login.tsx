import { selectUserError } from '@selectors/userSelectors';
import { clearUserError, loginUser } from '@slices/userSlice';
import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { type Location, useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

type LoginLocationState = {
  from?: Location;
};

export const Login = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const errorText = useSelector(selectUserError);

  const from = (location.state as LoginLocationState | null)?.from?.pathname ?? '/';

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    void dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        void navigate(from, { replace: true });
      })
      .catch(() => undefined);
  };

  return (
    <LoginUI
      errorText={errorText ?? ''}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
