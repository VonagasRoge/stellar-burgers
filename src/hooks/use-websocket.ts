import { useEffect, useRef } from 'react';

/**
 * Открывает WebSocket-соединение на время жизни компонента и вызывает
 * `onMessage` с распарсенным JSON-содержимым каждого сообщения сервера.
 * При размонтировании (или смене `url`) соединение закрывается.
 *
 * `url === null` — соединение не открывается (например, нет токена).
 */
export const useWebsocket = (
  url: string | null,
  onMessage: (data: unknown) => void
): void => {
  const handlerRef = useRef(onMessage);

  useEffect(() => {
    handlerRef.current = onMessage;
  });

  useEffect(() => {
    if (!url) return;

    const socket = new WebSocket(url);

    socket.onmessage = (event: MessageEvent<string>): void => {
      try {
        handlerRef.current(JSON.parse(event.data));
      } catch {
        // Некорректный JSON в сообщении — игнорируем
      }
    };

    return (): void => {
      socket.close();
    };
  }, [url]);
};
