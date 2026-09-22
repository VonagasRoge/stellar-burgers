import { BurgerIngredients, BurgerConstructor } from '@components';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading,
} from '@selectors/ingredientsSelectors';
import { Preloader } from '@ui';
import { clsx } from 'clsx';

import { useSelector } from '@services/store';

import styles from './constructor-page.module.css';

export const ConstructorPage = (): React.JSX.Element => {
  const isLoading = useSelector(selectIngredientsLoading);
  const error = useSelector(selectIngredientsError);
  const ingredients = useSelector(selectIngredients);

  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className={clsx(styles.message, 'text', 'text_type_main-medium')}>
        Не удалось загрузить ингредиенты: {error}
      </p>
    );
  }

  if (!ingredients.length) {
    return (
      <p className={clsx(styles.message, 'text', 'text_type_main-medium')}>
        Нет ингредиентов
      </p>
    );
  }

  return (
    <main className={styles.containerMain}>
      <h1
        className={clsx(
          styles.title,
          'text',
          'text_type_main-large',
          'mt-10',
          'mb-5',
          'pl-5'
        )}
      >
        Соберите бургер
      </h1>
      <div className={clsx(styles.main, 'pl-5', 'pr-5')}>
        <BurgerIngredients />
        <BurgerConstructor />
      </div>
    </main>
  );
};
