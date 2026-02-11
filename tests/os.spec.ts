import { test, expect } from '@playwright/test';

test.describe('Fluxo de Ordens de Serviço', () => {
    const timestamp = Date.now();
    const customerName = `Cliente OS ${timestamp}`;

    test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        await page.goto('http://localhost:3000/customers');
        await page.click('button:has-text("Novo Cliente")');
        await page.fill('input[name="name"]', customerName);
        await page.fill('input[name="phone"]', '11999999999');
        const createResponse = page.waitForResponse(resp => resp.url().includes('/api/customers') && resp.status() === 201);
        await page.click('button:has-text("Cadastrar Cliente")');
        await createResponse;
        await expect(page.getByText('Cliente criado!')).toBeVisible();
        await page.close();
    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/os');
    });

    test('deve criar uma nova OS', async ({ page }) => {
        await page.getByText('Nova OS').click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.click('button[role="combobox"]');
        await page.fill('input[placeholder="Selecione um cliente"]', customerName);
        await page.getByRole('option', { name: customerName }).click();

        await page.fill('input[name="equipments.0.type"]', 'Notebook');
        await page.fill('input[name="equipments.0.reportedIssue"]', 'Computador não liga');

        const createResponse = page.waitForResponse(resp => resp.url().includes('/api/os') && resp.status() === 201);
        await page.click('button:has-text("Abrir Ordem de Serviço")');
        await createResponse;

        await expect(page.getByText('Ordem de Serviço aberta com sucesso!')).toBeVisible();
    });

    test('deve editar uma OS existente', async ({ page }) => {
        // Create one to edit
        await page.getByText('Nova OS').click();
        await page.click('button[role="combobox"]');
        await page.getByRole('option', { name: customerName }).click();
        await page.fill('input[name="equipments.0.type"]', 'PC');
        await page.fill('input[name="equipments.0.reportedIssue"]', 'Para Editar');

        const createResponse = page.waitForResponse(resp => resp.url().includes('/api/os') && resp.status() === 201);
        await page.click('button:has-text("Abrir Ordem de Serviço")');
        await createResponse;
        await expect(page.getByText('Ordem de Serviço aberta com sucesso!')).toBeVisible();

        // Find in list
        await page.reload();

        const searchInput = page.locator('input[placeholder*="Buscar"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill(customerName);
            await page.waitForTimeout(500);
        }

        const row = page.getByRole('row', { name: customerName }).first();

        await row.getByRole('button', { name: "Abrir menu" }).click();

        await page.getByRole('menuitem', { name: 'Editar' }).click();

        await page.fill('textarea[name="equipments.0.reportedIssue"]', 'Problema Atualizado');

        const updateResponse = page.waitForResponse(resp => resp.url().includes('/api/os') && resp.status() === 200);
        await page.locator('button[type="submit"]').click();
        await updateResponse;

        await expect(page.getByText('Ordem de Serviço atualizada com sucesso!')).toBeVisible();
    });
});
