import { describe, expect, it } from '@jest/globals';

import { fetchIngredients, ingredientsReducer } from '../ingredientsSlice';

import type { TIngredient } from '@utils-types';

const bun: TIngredient = {
  _id: 'bun-id',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 40,
  fat: 10,
  carbohydrates: 300,
  calories: 80,
  price: 1255,
  image: 'bun.png',
  image_large: 'bun-large.png',
  image_mobile: 'bun-mobile.png',
};

const sauce: TIngredient = {
  ...bun,
  _id: 'sauce-id',
  name: 'Соус спайси',
  type: 'sauce',
  proteins: 2,
  fat: 17,
  carbohydrates: 2,
  calories: 170,
  price: 200,
};

const initialState = {
  items: [],
  loading: true,
  error: null,
};

describe('ingredients reducer: вызов редьюсера как функции', () => {
  it('редьюсер является функцией', () => {
    expect(typeof ingredientsReducer).toBe('function');
  });

  it('с начальным состоянием undefined и неизвестным экшеном возвращает начальное состояние', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(initialState);
    expect(state.items).toEqual([]);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('с неизвестным экшеном возвращает состояние без изменений', () => {
    const currentState = { items: [bun], loading: false, error: null };

    const state = ingredientsReducer(currentState, { type: 'UNKNOWN' });

    expect(state).toEqual(currentState);
  });

  it('по экшену fetchIngredients.pending включает загрузку и сбрасывает ошибку', () => {
    const state = ingredientsReducer(
      { items: [], loading: false, error: 'Предыдущая ошибка' },
      { type: fetchIngredients.pending.type }
    );

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.items).toEqual([]);
  });

  it('по экшену fetchIngredients.fulfilled записывает ингредиенты и выключает загрузку', () => {
    const state = ingredientsReducer(initialState, {
      type: fetchIngredients.fulfilled.type,
      payload: [bun, sauce],
    });

    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.items).toEqual([bun, sauce]);
    expect(state.items).toHaveLength(2);
  });

  it('по экшену fetchIngredients.fulfilled с пустым ответом очищает список', () => {
    const state = ingredientsReducer(
      { items: [bun], loading: true, error: null },
      { type: fetchIngredients.fulfilled.type, payload: [] }
    );

    expect(state.items).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it('по экшену fetchIngredients.rejected записывает текст ошибки и выключает загрузку', () => {
    const state = ingredientsReducer(initialState, {
      type: fetchIngredients.rejected.type,
      error: { message: 'Не удалось загрузить ингредиенты' },
    });

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Не удалось загрузить ингредиенты');
    expect(state.items).toEqual([]);
  });

  it('по экшену fetchIngredients.rejected без текста ошибки использует сообщение по умолчанию', () => {
    const state = ingredientsReducer(
      { items: [bun], loading: true, error: 'Старая ошибка' },
      { type: fetchIngredients.rejected.type, error: {} }
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Не удалось загрузить ингредиенты');
  });

  it('редьюсер не мутирует предыдущее состояние', () => {
    const currentState = { items: [bun], loading: false, error: null };

    const state = ingredientsReducer(currentState, {
      type: fetchIngredients.fulfilled.type,
      payload: [sauce],
    });

    expect(currentState.items).toEqual([bun]);
    expect(state).not.toBe(currentState);
  });
});
