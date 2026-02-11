import { test, expect } from '@playwright/test';

test.describe('Gerenciamento de Colaboradores', () => {
    const timestamp = Date.now();
    const userName = `Funcionario ${timestamp}`;
    const userEmail = `func${timestamp}@teste.com`;
    const updatedName = `${userName} Editado`;

    test.beforeEach(async ({ page }) => {
        await page.goto('/settings');
        await page.click('button:has-text("Colaboradores")'); // Switch to tab
    });

    test('deve criar um novo colaborador', async ({ page }) => {
        await page.click('button:has-text("Novo Colaborador")');

        await page.fill('input[name="name"]', userName);
        await page.fill('input[name="email"]', userEmail);

        // Select Role
        await page.click('button[role="combobox"]');
        await page.getByRole('option', { name: 'Técnico' }).click();

        const responsePromise = page.waitForResponse(resp => resp.url().includes('/api/users') && resp.status() === 201);
        await page.click('button:has-text("Salvar")');
        await responsePromise;

        await expect(page.getByText('Colaborador cadastrado com sucesso!')).toBeVisible().catch(() => expect(page.getByText('Usuário criado')).toBeVisible());
        await expect(page.getByText(userName)).toBeVisible();
    });

    test('deve editar um colaborador', async ({ page }) => {
        // Create
        await page.click('button:has-text("Novo Colaborador")');
        const editName = `Func Edit ${timestamp}`;
        const editEmail = `edit${timestamp}@teste.com`;
        await page.fill('input[name="name"]', editName);
        await page.fill('input[name="email"]', editEmail);
        await page.click('button[role="combobox"]');
        await page.getByRole('option', { name: 'Técnico' }).click();

        const createResponse = page.waitForResponse(resp => resp.url().includes('/api/users') && resp.status() === 201);
        await page.click('button:has-text("Salvar")');
        await createResponse;
        await expect(page.getByText(editName)).toBeVisible();

        const row = page.getByRole('row', { name: editName });
        await row.locator('button').first().click(); // Edit button

        await page.fill('input[name="name"]', updatedName);

        const updateResponse = page.waitForResponse(resp => resp.url().includes('/api/users') && resp.status() === 200);
        await page.click('button:has-text("Salvar")');
        await updateResponse;

        await expect(page.getByText('Colaborador atualizado')).toBeVisible().catch(() => expect(page.getByText('Usuário atualizado')).toBeVisible());
        await expect(page.getByText(updatedName)).toBeVisible();
    });
});
