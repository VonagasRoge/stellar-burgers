import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = 'http://localhost:4000';
const HARS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'hars');
const har = (file: string): string => path.join(HARS_DIR, file);

const MOCK_ORDER_NUMBER = 9753;

const FAKE_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.accessTokenForE2eTests';
const FAKE_REFRESH_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.refreshTokenForE2eTests';


const BUN = { id: '643d69a5c3f7100001d3fa1a', name: 'Краторная булка N-200i', price: 1255 };
const MAIN = {
  id: '643d69a5c3f7100001d3fa1c',
  name: 'Говяжий метеорит (отбивная)',
  price: 3000,
  calories: 2664,
  proteins: 800,
  fat: 959,
  carbohydrates: 341,
};
const SAUCE = {
  id: '643d69a5c3f7100001d3fa1e',
  name: 'Соус спайси',
  price: 200,
  calories: 170,
  proteins: 2,
  fat: 17,
  carbohydrates: 2,
};

type TMockIngredient = typeof MAIN;



const ingredientLink = (page: Page, id: string): ReturnType<Page['locator']> =>
  page.locator(`a[href="/ingredients/${id}"]`);

const ingredientCard = (page: Page, id: string): ReturnType<Page['locator']> =>
  page.locator(`li:has(a[href="/ingredients/${id}"])`);


const ingredientCards = (page: Page): ReturnType<Page['locator']> =>
  page.locator('li:has(a[href^="/ingredients/"])');

const constructorSection = (page: Page): ReturnType<Page['locator']> =>
  page.getByTestId('constructor');

const constructorIngredients = (page: Page): ReturnType<Page['locator']> =>
  page.getByTestId('constructor-ingredients');

const constructorItems = (page: Page): ReturnType<Page['locator']> =>
  constructorIngredients(page).locator('li');

const orderSummary = (page: Page): ReturnType<Page['locator']> =>
  page.getByTestId('order-summ');


const orderPrice = (page: Page): ReturnType<Page['locator']> =>
  orderSummary(page).locator('p');


const modalRoot = (page: Page): ReturnType<Page['locator']> => page.locator('#modals');

const modalOverlay = (page: Page): ReturnType<Page['locator']> =>
  page.getByTestId('modal-overlay');

const modalCloseButton = (page: Page): ReturnType<Page['locator']> =>
  page.getByRole('button', { name: 'Закрыть' });



const mockBackend = async (
  page: Page,
  options: { withOrders?: boolean } = {}
): Promise<void> => {
  await page.routeFromHAR(har('ingredients.har'), {
    url: /\/api\/ingredients/,
    notFound: 'abort',
  });
  await page.routeFromHAR(har('user.har'), { url: /\/api\/auth\/user/, notFound: 'abort' });

  if (options.withOrders) {
    await page.routeFromHAR(har('orders.har'), { url: /\/api\/orders/, notFound: 'abort' });
  }
};


const authorizeWithFakeTokens = async (page: Page): Promise<void> => {
  await page.addInitScript((token: string) => {
    window.localStorage.setItem('refreshToken', token);
  }, FAKE_REFRESH_TOKEN);

  await page.context().addCookies([
    { name: 'accessToken', value: FAKE_ACCESS_TOKEN, url: BASE_URL },
  ]);
};


const openConstructor = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(ingredientCards(page)).toHaveCount(6);
  await expect(constructorSection(page)).toBeVisible();
};

const addIngredientToConstructor = async (page: Page, id: string): Promise<void> => {
  await ingredientCard(page, id)
    .getByRole('button', { name: 'Добавить' })
    .click();
};

const openIngredientModal = async (page: Page, id: string): Promise<void> => {
  await ingredientLink(page, id).click();
  await expect(
    modalRoot(page).getByRole('heading', { name: 'Детали ингредиента' })
  ).toBeVisible();
};


const expectConstructorIsEmpty = async (page: Page): Promise<void> => {
  await expect(page.getByTestId('constructor-bun-1')).toHaveCount(0);
  await expect(page.getByTestId('constructor-bun-2')).toHaveCount(0);
  await expect(constructorSection(page)).toContainText('Выберите булки');
  await expect(constructorIngredients(page)).toContainText('Выберите начинку');
  await expect(constructorItems(page)).toHaveCount(1);
  await expect(orderPrice(page)).toHaveText('0');
};

const expectIngredientDetails = async (
  page: Page,
  ingredient: TMockIngredient
): Promise<void> => {
  const modal = modalRoot(page);
  await expect(modal).toContainText(ingredient.name);
  await expect(modal).toContainText(String(ingredient.calories));
  await expect(modal).toContainText(String(ingredient.proteins));
  await expect(modal).toContainText(String(ingredient.fat));
  await expect(modal).toContainText(String(ingredient.carbohydrates));
};



test.describe('Конструктор бургера: добавление ингредиентов из списка', () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page);
    await openConstructor(page);
  });

  test('до добавления ингредиентов конструктор пуст, а его стоимость равна нулю', async ({
    page,
  }) => {
    await expectConstructorIsEmpty(page);
  });

  test('клик по кнопке «Добавить» переносит ингредиент в конструктор', async ({
    page,
  }) => {
    await addIngredientToConstructor(page, SAUCE.id);

    await expect(constructorItems(page)).toHaveCount(1);
    await expect(constructorIngredients(page)).toContainText(SAUCE.name);
    await expect(constructorIngredients(page)).not.toContainText('Выберите начинку');
    await expect(orderPrice(page)).toHaveText(String(SAUCE.price));
  });

  test('добавление булки отображает верхнюю и нижнюю часть булки', async ({ page }) => {
    await addIngredientToConstructor(page, BUN.id);

    await expect(page.getByTestId('constructor-bun-1')).toContainText(`${BUN.name} (верх)`);
    await expect(page.getByTestId('constructor-bun-2')).toContainText(`${BUN.name} (низ)`);

    await expect(orderPrice(page)).toHaveText(String(BUN.price * 2));
  });

  test('добавление нескольких начинок складывает их стоимость', async ({ page }) => {
    await addIngredientToConstructor(page, MAIN.id);
    await addIngredientToConstructor(page, SAUCE.id);
    await addIngredientToConstructor(page, MAIN.id);

    await expect(constructorItems(page)).toHaveCount(3);
    await expect(constructorIngredients(page)).toContainText(MAIN.name);
    await expect(constructorIngredients(page)).toContainText(SAUCE.name);
    await expect(orderPrice(page)).toHaveText(String(MAIN.price * 2 + SAUCE.price));
  });

  test('добавление булки не блокирует добавление начинок', async ({ page }) => {
    await addIngredientToConstructor(page, BUN.id);
    await addIngredientToConstructor(page, MAIN.id);

    await expect(page.getByTestId('constructor-bun-1')).toContainText(BUN.name);
    await expect(constructorItems(page)).toHaveCount(1);
    await expect(constructorIngredients(page)).toContainText(MAIN.name);
    await expect(orderPrice(page)).toHaveText(String(BUN.price * 2 + MAIN.price));
  });
});

test.describe('Модальное окно с описанием ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page);
    await openConstructor(page);
  });

  test('клик по ингредиенту в списке открывает модальное окно', async ({ page }) => {
    await ingredientLink(page, SAUCE.id).click();

    await expect(
      modalRoot(page).getByRole('heading', { name: 'Детали ингредиента' })
    ).toBeVisible();
    await expect(modalOverlay(page)).toBeVisible();
    await expect(page).toHaveURL(/\/ingredients\/643d69a5c3f7100001d3fa1e$/);

    await expect(constructorSection(page)).toBeVisible();
  });

  test('в модальном окне показываются данные ингредиента, по которому был клик', async ({
    page,
  }) => {
    await openIngredientModal(page, SAUCE.id);
    await expectIngredientDetails(page, SAUCE);
    await expect(modalRoot(page)).not.toContainText(MAIN.name);

    await modalCloseButton(page).click();
    await expect(modalRoot(page)).toBeEmpty();

    await openIngredientModal(page, MAIN.id);
    await expectIngredientDetails(page, MAIN);
    await expect(modalRoot(page)).not.toContainText(SAUCE.name);
  });

  test('клик по крестику закрывает модальное окно', async ({ page }) => {
    await openIngredientModal(page, SAUCE.id);

    await modalCloseButton(page).click();

    await expect(modalOverlay(page)).toHaveCount(0);
    await expect(modalRoot(page)).toBeEmpty();
    await expect(
      modalRoot(page).getByRole('heading', { name: 'Детали ингредиента' })
    ).toHaveCount(0);
  });

  test('клик по оверлею закрывает модальное окно', async ({ page }) => {
    await openIngredientModal(page, MAIN.id);


    await modalOverlay(page).click({ position: { x: 20, y: 690 } });

    await expect(modalOverlay(page)).toHaveCount(0);
    await expect(modalRoot(page)).toBeEmpty();
  });

  test('закрытие модалки возвращает пользователя на страницу конструктора', async ({
    page,
  }) => {
    await openIngredientModal(page, SAUCE.id);
    await modalCloseButton(page).click();

    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(
      page.getByRole('heading', { name: 'Соберите бургер' })
    ).toBeVisible();
    await expect(constructorSection(page)).toBeVisible();
  });
});

test.describe('Конструктор бургера: оформление заказа', () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page, { withOrders: true });
    await authorizeWithFakeTokens(page);
    await openConstructor(page);
  });


  const buildBurger = async (page: Page): Promise<void> => {
    await addIngredientToConstructor(page, BUN.id);
    await addIngredientToConstructor(page, MAIN.id);
    await addIngredientToConstructor(page, SAUCE.id);

    await expect(page.getByTestId('constructor-bun-1')).toContainText(BUN.name);
    await expect(constructorItems(page)).toHaveCount(2);
  };

  test('клик по кнопке «Оформить заказ» открывает модалку с номером заказа', async ({
    page,
  }) => {
    await buildBurger(page);
    const expectedPrice = BUN.price * 2 + MAIN.price + SAUCE.price;
    await expect(orderPrice(page)).toHaveText(String(expectedPrice));

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    await expect(page.getByTestId('order-number')).toBeVisible();
    await expect(page.getByTestId('order-number')).toHaveText(String(MOCK_ORDER_NUMBER));
    await expect(modalRoot(page)).toContainText('Ваш заказ начали готовить');
  });

  test('после оформления заказа конструктор очищается', async ({ page }) => {
    await buildBurger(page);

    await page.getByRole('button', { name: 'Оформить заказ' }).click();
    await expect(page.getByTestId('order-number')).toHaveText(String(MOCK_ORDER_NUMBER));

    await expectConstructorIsEmpty(page);
  });

  test('модальное окно заказа закрывается по клику на крестик', async ({ page }) => {
    await buildBurger(page);
    await page.getByRole('button', { name: 'Оформить заказ' }).click();
    await expect(page.getByTestId('order-number')).toHaveText(String(MOCK_ORDER_NUMBER));

    await modalCloseButton(page).click();

    await expect(modalRoot(page)).toBeEmpty();
    await expect(page.getByTestId('order-number')).toHaveCount(0);
    await expect(modalOverlay(page)).toHaveCount(0);
  });

  test('заказ формируется только с добавленными в конструктор ингредиентами', async ({
    page,
  }) => {
    await buildBurger(page);

    const orderRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/api/orders')
    );
    await page.getByRole('button', { name: 'Оформить заказ' }).click();
    const request = await orderRequest;


    expect(request.headers().authorization).toBe(FAKE_ACCESS_TOKEN);

    const requestPayload = request.postDataJSON() as { ingredients: string[] };


    expect(requestPayload.ingredients).toEqual([
      BUN.id,
      MAIN.id,
      SAUCE.id,
      BUN.id,
    ]);

    await expect(page.getByTestId('order-number')).toHaveText(String(MOCK_ORDER_NUMBER));
  });
});

