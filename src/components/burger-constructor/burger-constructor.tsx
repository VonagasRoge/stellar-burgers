import {
  selectConstructorItems,
  selectOrderModalData,
  selectOrderRequest,
} from '@selectors/constructorSelectors';
import { selectIsAuth } from '@selectors/userSelectors';
import { clearOrderModal, createOrder } from '@slices/constructorSlice';
import { fetchUserOrders } from '@slices/ordersSlice';
import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor = (): React.JSX.Element | null => {
  const constructorItems = useSelector(selectConstructorItems);
  const orderRequest = useSelector(selectOrderRequest);
  const orderModalData = useSelector(selectOrderModalData);
  const isAuth = useSelector(selectIsAuth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const onOrderClick = (): void => {
    if (!constructorItems.bun || orderRequest) return;

    if (!isAuth) {
      void navigate('/login', { state: { from: location } });
      return;
    }

    void dispatch(createOrder())
      .unwrap()
      .then(() => {
        void dispatch(fetchUserOrders());
      })
      .catch(() => undefined);
  };

  const closeOrderModal = (): void => {
    dispatch(clearOrderModal());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
