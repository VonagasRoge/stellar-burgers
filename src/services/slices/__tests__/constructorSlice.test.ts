import { orderBurgerApi } from '@api';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';

import {
  addIngredient,
  clearConstructor,
  clearOrderModal,
  constructorReducer,
  createOrder,
  moveIngredient,
  removeIngredient,
} from '../constructorSlice';

import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
  TOrder,
} from '@utils-types';

jest.mock('@api');

const mockedOrderBurgerApi = jest.mocked(orderBurgerApi);

type TConstructorSliceState = {
  constructorItems: TConstructorState;
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: string | null;
};

const ingredient = (overrides: Partial<TIngredient> = {}): TIngredient => ({
  _id: 'main-id',
  name: 'Говяжий метеорит (отбивная)',
  type: 'main',
  proteins: 800,
  fat: 959,
  carbohydrates: 341,
  calories: 2664,
  price: 3000,
  image: 'main.png',
  image_large: 'main-large.png',
  image_mobile: 'main-mobile.png',
  ...overrides,
});

const bun = ingredient({ _id: 'bun-id', name: 'Краторная булка N-200i', type: 'bun' });
const sauce = ingredient({ _id: 'sauce-id', name: 'Соус спайси', type: 'sauce' });

const constructorIngredient = (
  item: TIngredient,
  id: string
): TConstructorIngredient => ({ ...item, id });

const order: TOrder = {
  _id: 'order-id',
  status: 'pending',
  name: 'Хрустящий космический бургер',
  createdAt: '2026-09-23T09:00:00.000Z',
  updatedAt: '2026-09-23T09:00:00.000Z',
  number: 9753,
  ingredients: ['bun-id', 'main-id', 'bun-id'],
};

const initialState = {
  constructorItems: { bun: null, ingredients: [] },
  orderRequest: false,
  orderModalData: null,
  error: null,
};

describe('burgerConstructor reducer: вызов редьюсера как функции', () => {
  it('редьюсер является функцией', () => {
    expect(typeof constructorReducer).toBe('function');
  });

  it('с начальным состоянием undefined и неизвестным экшеном возвращает начальное состояние', () => {
    const state = constructorReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(initialState);
    expect(state.constructorItems).toEqual({ bun: null, ingredients: [] });
    expect(state.orderRequest).toBe(false);
    expect(state.orderModalData).toBeNull();
    expect(state.error).toBeNull();
  });

  it('с неизвестным экшеном возвращает состояние без изменений', () => {
    const currentState = {
      constructorItems: {
        bun: null,
        ingredients: [constructorIngredient(sauce, 'id-1')],
      },
      orderRequest: false,
      orderModalData: null,
      error: null,
    };

    const state = constructorReducer(currentState, { type: 'UNKNOWN' });

    expect(state).toEqual(currentState);
  });

  describe('addIngredient', () => {
    it('экшен содержит payload ингредиента с уникальным id', () => {
      const action = addIngredient(bun);

      expect(action.type).toBe('constructor/addIngredient');
      expect(action.payload._id).toBe(bun._id);
      expect(typeof action.payload.id).toBe('string');
      expect(action.payload.id).not.toBe(bun._id);
    });

    it('добавление булки кладёт её в bun и не трогает начинки и остальные поля', () => {
      const state = constructorReducer(initialState, addIngredient(bun));

      expect(state).toEqual({
        ...initialState,
        constructorItems: {
          bun: expect.objectContaining({ _id: bun._id, type: 'bun' }),
          ingredients: [],
        },
      });
    });

    it('повторное добавление булки заменяет предыдущую', () => {
      const anotherBun = ingredient({ _id: 'bun-2', type: 'bun', name: 'Другая булка' });

      const first = constructorReducer(initialState, addIngredient(bun));
      const state = constructorReducer(first, addIngredient(anotherBun));

      expect(state.constructorItems.bun?._id).toBe('bun-2');
    });

    it('добавление начинки добавляет её в конец списка начинок, не трогая остальное состояние', () => {
      const main = ingredient({ _id: 'main-2', name: 'Люба-Любянский котлет' });

      const first = constructorReducer(initialState, addIngredient(sauce));
      const state = constructorReducer(first, addIngredient(main));

      expect(state).toEqual({
        ...initialState,
        constructorItems: {
          bun: null,
          ingredients: [
            expect.objectContaining({ _id: sauce._id }),
            expect.objectContaining({ _id: main._id }),
          ],
        },
      });
    });

    it('каждый добавленный ингредиент получает собственный id', () => {
      const first = constructorReducer(initialState, addIngredient(sauce));
      const state = constructorReducer(first, addIngredient(sauce));

      const [firstItem, secondItem] = state.constructorItems.ingredients;
      expect(firstItem?.id).not.toBe(secondItem?.id);
    });
  });

  it('removeIngredient удаляет начинку по индексу', () => {
    const filled = {
      ...initialState,
      constructorItems: {
        bun: constructorIngredient(bun, 'bun-1'),
        ingredients: [
          constructorIngredient(sauce, 'id-1'),
          constructorIngredient(ingredient(), 'id-2'),
        ],
      },
    };

    const state = constructorReducer(filled, removeIngredient(0));

    expect(state.constructorItems.ingredients).toHaveLength(1);
    expect(state.constructorItems.ingredients[0]?.id).toBe('id-2');
    expect(state.constructorItems.bun?._id).toBe('bun-id');
  });

  describe('moveIngredient', () => {
    const filled = (): TConstructorSliceState => ({
      ...initialState,
      constructorItems: {
        bun: null,
        ingredients: [
          constructorIngredient(sauce, 'id-1'),
          constructorIngredient(ingredient(), 'id-2'),
          constructorIngredient(bun, 'id-3'),
        ],
      },
    });

    it('перемещает начинку на новый индекс', () => {
      const state = constructorReducer(filled(), moveIngredient({ from: 0, to: 2 }));

      expect(state.constructorItems.ingredients.map((item) => item.id)).toEqual([
        'id-2',
        'id-3',
        'id-1',
      ]);
    });

    it('не меняет список при перемещении за его пределы', () => {
      const state = constructorReducer(filled(), moveIngredient({ from: 0, to: 5 }));

      expect(state.constructorItems.ingredients.map((item) => item.id)).toEqual([
        'id-1',
        'id-2',
        'id-3',
      ]);
    });
  });

  it('clearConstructor очищает булку и начинки', () => {
    const filled = {
      ...initialState,
      constructorItems: {
        bun: constructorIngredient(bun, 'bun-1'),
        ingredients: [constructorIngredient(sauce, 'id-1')],
      },
    };

    const state = constructorReducer(filled, clearConstructor());

    expect(state.constructorItems).toEqual({ bun: null, ingredients: [] });
  });

  it('clearOrderModal закрывает модалку заказа и сбрасывает флаг заказа', () => {
    const state = constructorReducer(
      { ...initialState, orderRequest: false, orderModalData: order },
      clearOrderModal()
    );

    expect(state.orderModalData).toBeNull();
    expect(state.orderRequest).toBe(false);
  });

  describe('обработка асинхронного экшена createOrder', () => {
    it('по pending включает заказ и сбрасывает ошибку', () => {
      const state = constructorReducer(
        { ...initialState, orderRequest: false, error: 'Старая ошибка' },
        { type: createOrder.pending.type }
      );

      expect(state.orderRequest).toBe(true);
      expect(state.error).toBeNull();
    });

    it('по fulfilled открывает модалку с заказом и очищает конструктор', () => {
      const filled = {
        ...initialState,
        orderRequest: true,
        constructorItems: {
          bun: constructorIngredient(bun, 'bun-1'),
          ingredients: [constructorIngredient(sauce, 'id-1')],
        },
      };

      const state = constructorReducer(filled, {
        type: createOrder.fulfilled.type,
        payload: order,
      });

      expect(state.orderRequest).toBe(false);
      expect(state.orderModalData).toEqual(order);
      expect(state.constructorItems).toEqual({ bun: null, ingredients: [] });
    });

    it('по rejected с текстом ошибки записывает его и выключает заказ', () => {
      const state = constructorReducer(
        { ...initialState, orderRequest: true },
        { type: createOrder.rejected.type, payload: 'Добавьте булку' }
      );

      expect(state.orderRequest).toBe(false);
      expect(state.error).toBe('Добавьте булку');
      expect(state.orderModalData).toBeNull();
    });

    it('по rejected с текстом ошибки в error.message использует его', () => {
      const state = constructorReducer(
        { ...initialState, orderRequest: true },
        {
          type: createOrder.rejected.type,
          payload: undefined,
          error: { message: 'Ошибка сети' },
        }
      );

      expect(state.orderRequest).toBe(false);
      expect(state.error).toBe('Ошибка сети');
    });

    it('по rejected без текста ошибки использует сообщение по умолчанию', () => {
      const state = constructorReducer(
        { ...initialState, orderRequest: true },
        { type: createOrder.rejected.type, payload: undefined, error: {} }
      );

      expect(state.orderRequest).toBe(false);
      expect(state.error).toBe('Не удалось оформить заказ');
    });
  });

  it('редьюсер не мутирует предыдущее состояние', () => {
    const currentState = {
      ...initialState,
      constructorItems: { bun: null, ingredients: [] },
    };

    const state = constructorReducer(currentState, addIngredient(sauce));

    expect(currentState.constructorItems.ingredients).toEqual([]);
    expect(state.constructorItems.ingredients).toHaveLength(1);
  });
});

describe('burgerConstructor thunk: createOrder', () => {
  const reducer = { burgerConstructor: constructorReducer };

  beforeEach(() => {
    mockedOrderBurgerApi.mockReset();
  });

  it('без булки отклоняется с сообщением и не обращается к API', async () => {
    const store = configureStore({ reducer });
    store.dispatch(addIngredient(sauce));

    await expect(store.dispatch(createOrder()).unwrap()).rejects.toBe('Добавьте булку');

    expect(mockedOrderBurgerApi).not.toHaveBeenCalled();
    const state = store.getState().burgerConstructor;
    expect(state.orderRequest).toBe(false);
    expect(state.error).toBe('Добавьте булку');
    expect(state.orderModalData).toBeNull();
    /* Заказ не состоялся — добавленные начинки остаются в конструкторе */
    expect(state.constructorItems).toEqual({
      bun: null,
      ingredients: [expect.objectContaining({ _id: 'sauce-id' })],
    });
  });

  it('отправляет булку дважды — в начале и в конце списка ингредиентов', async () => {
    mockedOrderBurgerApi.mockResolvedValue({ success: true, name: order.name, order });
    const store = configureStore({ reducer });
    store.dispatch(addIngredient(bun));
    store.dispatch(addIngredient(sauce));
    store.dispatch(addIngredient(ingredient({ _id: 'main-2' })));

    await store.dispatch(createOrder()).unwrap();

    expect(mockedOrderBurgerApi).toHaveBeenCalledTimes(1);
    expect(mockedOrderBurgerApi).toHaveBeenCalledWith([
      'bun-id',
      'sauce-id',
      'main-2',
      'bun-id',
    ]);
  });

  it('по успешном ответе открывает модалку с заказом и очищает конструктор', async () => {
    mockedOrderBurgerApi.mockResolvedValue({ success: true, name: order.name, order });
    const store = configureStore({ reducer });
    store.dispatch(addIngredient(bun));
    store.dispatch(addIngredient(sauce));

    const state = store.getState().burgerConstructor;
    expect(state.constructorItems.bun).not.toBeNull();
    expect(state.constructorItems.ingredients).toHaveLength(1);

    await store.dispatch(createOrder()).unwrap();

    expect(store.getState().burgerConstructor).toEqual({
      ...initialState,
      orderRequest: false,
      orderModalData: order,
    });
  });

  it('по ошибке запроса записывает message ошибки и оставляет конструктор', async () => {
    mockedOrderBurgerApi.mockRejectedValue(new Error('Ошибка сети'));
    const store = configureStore({ reducer });
    store.dispatch(addIngredient(bun));
    store.dispatch(addIngredient(sauce));

    const result = await store.dispatch(createOrder());

    expect(result.type).toBe('constructor/createOrder/rejected');

    const state = store.getState().burgerConstructor;
    expect(state.orderRequest).toBe(false);
    expect(state.error).toBe('Ошибка сети');
    expect(state.orderModalData).toBeNull();
    expect(state.constructorItems.ingredients).toHaveLength(1);
  });
});
