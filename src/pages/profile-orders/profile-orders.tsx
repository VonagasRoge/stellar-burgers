import { userOrdersWsUrl } from '@api';
import {
  selectOrdersError,
  selectUserOrders,
  selectUserOrdersLoading,
} from '@selectors/ordersSelectors';
import { fetchUserOrders, setUserOrders } from '@slices/ordersSlice';
import { Preloader } from '@ui';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import { useWebsocket } from '@hooks/use-websocket';
import { useDispatch, useSelector } from '@services/store';
import { getCookie } from '@utils/cookie';

import type { TOrder } from '@utils-types';

type TUserOrdersWsMessage = { success: boolean } & { orders: TOrder[] };

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const orders = useSelector(selectUserOrders);
  const isLoading = useSelector(selectUserOrdersLoading);
  const error = useSelector(selectOrdersError);

  useEffect(() => {
    void dispatch(fetchUserOrders());
  }, [dispatch]);

  const token = getCookie('accessToken')?.replace('Bearer ', '');
  const wsUrl = token ? userOrdersWsUrl(token) : null;

  useWebsocket(wsUrl, (data: unknown) => {
    const message = data as TUserOrdersWsMessage;
    if (message.success) {
      dispatch(setUserOrders(message.orders));
    }
  });

  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className="text text_type_main-medium mt-10 pl-5">
        Не удалось загрузить историю заказов: {error}
      </p>
    );
  }

  return <ProfileOrdersUI orders={orders} />;
};
