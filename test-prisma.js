
const { PrismaClient } = require('@prisma/client');

try {
    const prisma = new PrismaClient({});
    console.log('Prisma Client initialized successfully');
    process.exit(0);
} catch (e) {
    console.error('Error initializing Prisma Client:', e);
    process.exit(1);
}
