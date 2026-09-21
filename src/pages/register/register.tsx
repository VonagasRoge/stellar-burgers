import { selectUserError } from '@selectors/userSelectors';
import { clearUserError, registerUser } from '@slices/userSlice';
import { RegisterUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { type Location, useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

type RegisterLocationState = {
  from?: Location;
};

export const Register = (): React.JSX.Element => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const errorText = useSelector(selectUserError);

  const from = (location.state as RegisterLocationState | null)?.from?.pathname ?? '/';

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    void dispatch(registerUser({ name: userName, email, password }))
      .unwrap()
      .then(() => {


        void navigate(from, { replace: true });
      })
      .catch(() => undefined);
  };

  return (
    <RegisterUI
      errorText={errorText ?? ''}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
