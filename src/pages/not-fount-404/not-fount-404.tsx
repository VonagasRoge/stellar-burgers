import { clsx } from 'clsx';

export const NotFound404 = (): React.JSX.Element => (
  <h3 className={clsx('pb-6', 'text', 'text_type_main-large')}>
    Страница не найдена. Ошибка 404.
  </h3>
);
