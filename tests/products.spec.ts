import { test, expect } from '@playwright/test';

test.describe('Gerenciamento de Produtos', () => {
    const timestamp = Date.now();
    const productName = `Produto Teste ${timestamp}`;
    const updatedName = `${productName} Editado`;

    test.beforeEach(async ({ page }) => {
        await page.goto('/products');
    });

    test('deve criar um novo produto', async ({ page }) => {
        await page.click('button:has-text("Novo Produto")');

        await page.fill('input[name="name"]', productName);
        await page.fill('input[name="salePrice"]', '100');
        await page.fill('input[name="costPrice"]', '50');
        await page.fill('input[name="stockQty"]', '10');

        const responsePromise = page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 201);
        await page.click('button:has-text("Cadastrar Produto")');
        await responsePromise;

        await expect(page.getByText('Produto criado!')).toBeVisible();

        await page.fill('input[placeholder*="Buscar"]', productName);
        await expect(page.getByText(productName)).toBeVisible();
    });

    test('deve editar um produto', async ({ page }) => {
        await page.click('button:has-text("Novo Produto")');
        const editName = `Prod Edit ${timestamp}`;
        await page.fill('input[name="name"]', editName);
        await page.fill('input[name="salePrice"]', '10');
        const createResponse = page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 201);
        await page.click('button:has-text("Cadastrar Produto")');
        await createResponse;
        await expect(page.getByText('Produto criado!')).toBeVisible();

        await page.fill('input[placeholder*="Buscar"]', editName);
        await expect(page.getByRole('cell', { name: editName })).toBeVisible();

        const row = page.getByRole('row', { name: editName });

        await row.locator('td').last().locator('button').first().click();

        await page.fill('input[name="name"]', updatedName);
        const updateResponse = page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 200 && resp.request().method() === 'PATCH');
        await page.click('button:has-text("Atualizar Produto")');
        await updateResponse;

        await expect(page.getByText('Produto atualizado!')).toBeVisible();

        await page.fill('input[placeholder*="Buscar"]', updatedName);
        await expect(page.getByText(updatedName)).toBeVisible();
    });

    test('deve excluir/inativar um produto', async ({ page }) => {
        await page.click('button:has-text("Novo Produto")');
        const deleteName = `Prod Delete ${timestamp}`;
        await page.fill('input[name="name"]', deleteName);
        await page.fill('input[name="salePrice"]', '10');
        const createResponse = page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 201);
        await page.click('button:has-text("Cadastrar Produto")');
        await createResponse;
        await expect(page.getByText('Produto criado!')).toBeVisible();

        await page.fill('input[placeholder*="Buscar"]', deleteName);
        await expect(page.getByRole('cell', { name: deleteName })).toBeVisible();

        const row = page.getByRole('row', { name: deleteName });

        page.on('dialog', dialog => dialog.accept());

        const deleteResponse = page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 200 && resp.request().method() === 'DELETE');
        await row.locator('td').last().locator('button').nth(1).click();
        await deleteResponse;

        await expect(page.getByText(deleteName)).not.toBeVisible();
        await expect(page.getByText('Produto excluído!')).toBeVisible();
    });
});
