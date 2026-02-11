import { test, expect } from '@playwright/test';

test.describe('Gerenciamento de Clientes', () => {
    const timestamp = Date.now();
    const customerName = `Cliente Teste ${timestamp}`;
    const customerEmail = `cliente${timestamp}@teste.com`;
    const updatedName = `${customerName} Editado`;

    test.beforeEach(async ({ page }) => {
        await page.goto('/customers');
    });

    test('deve criar um novo cliente', async ({ page }) => {
        await page.click('button:has-text("Novo Cliente")');

        await page.fill('input[name="name"]', customerName);
        await page.fill('input[name="email"]', customerEmail);
        await page.fill('input[name="phone"]', '11999999999');

        const responsePromise = page.waitForResponse(resp => resp.url().includes('/api/customers') && resp.status() === 201);
        await page.click('button:has-text("Cadastrar Cliente")');
        await responsePromise;

        await expect(page.getByText('Cliente criado!')).toBeVisible();

        await page.fill('input[placeholder*="Buscar"]', customerName);
        await expect(page.getByText(customerName)).toBeVisible();
    });

    test('deve editar um cliente existente', async ({ page }) => {
        // Create
        await page.click('button:has-text("Novo Cliente")');
        const editName = `Cliente Edit ${timestamp}`;
        await page.fill('input[name="name"]', editName);
        await page.fill('input[name="phone"]', '11888888888');

        const createResponse = page.waitForResponse(resp => resp.url().includes('/api/customers') && resp.status() === 201);
        await page.click('button:has-text("Cadastrar Cliente")');
        await createResponse;
        await expect(page.getByText('Cliente criado!')).toBeVisible();

        // Search
        await page.fill('input[placeholder*="Buscar"]', editName);
        await expect(page.getByRole('cell', { name: editName })).toBeVisible();

        const row = page.getByRole('row', { name: editName });

        await row.locator('td').last().locator('button').first().click();

        await page.fill('input[name="name"]', updatedName);

        const updateResponse = page.waitForResponse(resp => resp.url().includes('/api/customers') && resp.status() === 200 && resp.request().method() === 'PATCH');
        await page.click('button:has-text("Atualizar Cliente")');
        await updateResponse;

        await expect(page.getByText('Cliente atualizado!')).toBeVisible();

        await page.fill('input[placeholder*="Buscar"]', updatedName);
        await expect(page.getByText(updatedName)).toBeVisible();
    });

    test('deve inativar um cliente', async ({ page }) => {
        // Create
        await page.click('button:has-text("Novo Cliente")');
        const deleteName = `Cliente Delete ${timestamp}`;
        await page.fill('input[name="name"]', deleteName);
        await page.fill('input[name="phone"]', '11777777777');

        const createResponse = page.waitForResponse(resp => resp.url().includes('/api/customers') && resp.status() === 201);
        await page.click('button:has-text("Cadastrar Cliente")');
        await createResponse;
        await expect(page.getByText('Cliente criado!')).toBeVisible();

        await page.fill('input[placeholder*="Buscar"]', deleteName);
        await expect(page.getByRole('cell', { name: deleteName })).toBeVisible();

        const row = page.getByRole('row', { name: deleteName });

        page.on('dialog', dialog => dialog.accept());

        const deleteResponse = page.waitForResponse(resp => resp.url().includes('/api/customers') && resp.status() === 200 && resp.request().method() === 'DELETE');
        await row.locator('td').last().locator('button').nth(1).click();
        await deleteResponse;

        await expect(page.getByText(deleteName)).not.toBeVisible();
        await expect(page.getByText('Cliente excluído!')).toBeVisible();
    });
});
