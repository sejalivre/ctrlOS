const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Criando dados de teste...');

    // Criar cliente
    const customer = await prisma.customer.create({
      data: {
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        phone: '(11) 99999-9999'
      }
    });

    // Criar produto
    const product = await prisma.product.create({
      data: {
        name: 'Memória RAM 8GB',
        salePrice: 150.00,
        stockQty: 10
      }
    });

    // Criar serviço
    const service = await prisma.service.create({
      data: {
        name: 'Formatação e Instalação',
        defaultPrice: 120.00
      }
    });

    // Criar OS
    const os = await prisma.serviceOrder.create({
      data: {
        orderNumber: 1001,
        customerId: customer.id,
        status: 'OPENED',
        priority: 'NORMAL',
        equipments: {
          create: {
            type: 'Notebook',
            brand: 'Dell',
            model: 'Inspiron 15',
            reportedIssue: 'Não liga'
          }
        }
      }
    });

    console.log('✅ Dados de teste criados com sucesso!');
    console.log('📋 OS ID:', os.id);
    console.log('👤 Cliente:', customer.name);
    console.log('🛒 Produto:', product.name);
    console.log('🔧 Serviço:', service.name);
  } catch (error) {
    console.error('❌ Erro ao criar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();