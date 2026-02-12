
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Manually load .env
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
            process.env[key] = value;
        }
    });
} else {
    console.log(".env file not found");
}

const prisma = new PrismaClient();

async function main() {
    console.log("Testing OS and Sales connection...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Loaded" : "Missing");

    try {
        console.log("Fetching Service Orders...");
        const osCount = await prisma.serviceOrder.count();
        console.log(`Service Orders count: ${osCount}`);
        const os = await prisma.serviceOrder.findMany({ take: 1 });
        console.log("First OS:", os.length > 0 ? os[0].id : "None");
    } catch (e) {
        console.error("Error fetching Service Orders:", e.message);
    }

    try {
        console.log("Fetching Sales...");
        const salesCount = await prisma.sale.count();
        console.log(`Sales count: ${salesCount}`);
        const sales = await prisma.sale.findMany({ take: 1 });
        console.log("First Sale:", sales.length > 0 ? sales[0].id : "None");
    } catch (e) {
        console.error("Error fetching Sales:", e.message);
    }

    try {
        console.log("Fetching Users...");
        const userCount = await prisma.user.count();
        console.log(`Users count: ${userCount}`);
    } catch (e) {
        console.error("Error fetching Users:", e.message);
    }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
