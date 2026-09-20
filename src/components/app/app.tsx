import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import { ProtectedRoute } from '@hocs';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { fetchIngredients } from '@slices/ingredientsSlice';
import { checkUserAuth } from '@slices/userSlice';
import { clsx } from 'clsx';
import { useCallback, useEffect, type ReactNode } from 'react';
import {
  type Location,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { useDispatch } from '@services/store';

type LocationState = {
  background?: Location;
};

import '../../index.css';

import styles from './app.module.css';

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();

  useEffect(() => {
    void dispatch(fetchIngredients());
    void dispatch(checkUserAuth());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppRoutes />
    </div>
  );
};

export default App;

const AppRoutes = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const background = (location.state as LocationState | null)?.background;

  const handleModalClose = useCallback((): void => {
    void navigate(-1);
  }, [navigate]);

  return (
    <>
      <Routes location={background ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route
          path="/login"
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route path="/feed/:number" element={<OrderInfo />} />
        <Route
          path="/ingredients/:id"
          element={
            <div className={styles.detailPageWrap}>
              <h3 className={clsx(styles.detailHeader, 'text', 'text_type_main-large')}>
                Детали ингредиента
              </h3>
              <IngredientDetails />
            </div>
          }
        />
        <Route
          path="/profile/orders/:number"
          element={
            <ProtectedRoute>
              <OrderInfo />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {background && (
        <Routes>
          <Route
            path="/feed/:number"
            element={
              <OrderModal onClose={handleModalClose}>
                <OrderInfo />
              </OrderModal>
            }
          />
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детали ингредиента" onClose={handleModalClose}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <OrderModal onClose={handleModalClose}>
                  <OrderInfo />
                </OrderModal>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};

type OrderModalProps = {
  onClose: () => void;
  children: ReactNode;
};

const OrderModal = ({ onClose, children }: OrderModalProps): React.JSX.Element => {
  const { number } = useParams();

  return (
    <Modal title={`#${String(number).padStart(6, '0')}`} onClose={onClose}>
      {children}
    </Modal>
  );
};
