const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkColumn() {
    try {
        const user = await prisma.user.findFirst();
        console.log('Schema is synced! Found user:', user);
        process.exit(0);
    } catch (error) {
        if (error.message.includes('authId')) {
            console.error('Column authId still missing!');
        } else {
            console.error('Database error:', error);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

checkColumn();
