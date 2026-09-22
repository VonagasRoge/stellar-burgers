import { allOrdersWsUrl } from '@api';
import {
  selectFeedError,
  selectFeedLoading,
  selectFeedOrders,
} from '@selectors/feedSelectors';
import { fetchFeeds, setFeedData } from '@slices/feedSlice';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useCallback, useEffect } from 'react';

import { useWebsocket } from '@hooks/use-websocket';
import { useDispatch, useSelector } from '@services/store';

import type { TOrdersData } from '@utils-types';

type TFeedWsMessage = { success: boolean } & TOrdersData;

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFeedOrders);
  const isLoading = useSelector(selectFeedLoading);
  const error = useSelector(selectFeedError);

  const handleGetFeeds = useCallback((): void => {
    void dispatch(fetchFeeds());
  }, [dispatch]);

  useEffect(() => {
    handleGetFeeds();
  }, [handleGetFeeds]);

  useWebsocket(allOrdersWsUrl() || null, (data: unknown) => {
    const message = data as TFeedWsMessage;
    if (message.success) {
      dispatch(setFeedData(message));
    }
  });

  if (isLoading && !orders.length) {
    return <Preloader />;
  }

  if (error && !orders.length) {
    return (
      <p className="text text_type_main-medium mt-10 pl-5">
        Не удалось загрузить ленту заказов: {error}
      </p>
    );
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
