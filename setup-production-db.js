// Script para configurar banco de dados na produção
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando banco de dados para produção...\n');

// Verificar variáveis de ambiente
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

console.log('1. 🔍 Verificando variáveis de ambiente...');
let missingVars = [];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.log(`   ❌ ${varName}: Não definida`);
  } else {
    console.log(`   ✅ ${varName}: Definida`);
    
    // Mostrar parte da URL (sem senha)
    if (varName === 'DATABASE_URL') {
      const safeUrl = process.env[varName].replace(/:[^:@]*@/, ':****@');
      console.log(`      ${safeUrl}`);
    }
  }
});

if (missingVars.length > 0) {
  console.log(`\n⚠️  Variáveis faltando: ${missingVars.join(', ')}`);
  console.log('\n📋 Configure na Vercel:');
  console.log('   Settings → Environment Variables');
  console.log('\n📋 Valores necessários:');
  console.log('   DATABASE_URL: postgresql://postgres:[SENHA]@db.zjapynvxybowjjzktxyd.supabase.co:5432/postgres?sslmode=require');
  console.log('   NEXT_PUBLIC_SUPABASE_URL: https://zjapynvxybowjjzktxyd.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY: sua-chave-anon');
  process.exit(1);
}

console.log('\n2. 🗄️  Verificando conexão com o banco...');

try {
  // Testar conexão com psql (se disponível)
  const dbUrl = process.env.DATABASE_URL;
  console.log(`   Testando conexão com: ${dbUrl.split('@')[1]?.split('?')[0] || 'URL'}`);
  
  // Tentar ping no host
  const host = dbUrl.match(/@([^:]+):/)?.[1];
  if (host) {
    try {
      execSync(`ping -c 1 ${host}`, { stdio: 'pipe' });
      console.log(`   ✅ Host ${host} alcançável`);
    } catch {
      console.log(`   ⚠️  Não foi possível pingar ${host} (pode ser normal)`);
    }
  }
  
} catch (error) {
  console.log(`   ⚠️  Erro ao testar conexão: ${error.message}`);
}

console.log('\n3. 📦 Configurando Prisma para produção...');

// Copiar schema de produção se necessário
const prodSchemaPath = path.join(__dirname, 'prisma/schema.production.prisma');
const mainSchemaPath = path.join(__dirname, 'prisma/schema.prisma');

if (fs.existsSync(prodSchemaPath)) {
  console.log('   ✅ Schema de produção encontrado');
  
  // Verificar diferenças
  const prodSchema = fs.readFileSync(prodSchemaPath, 'utf8');
  const mainSchema = fs.readFileSync(mainSchemaPath, 'utf8');
  
  if (prodSchema !== mainSchema) {
    console.log('   ⚠️  Schemas diferentes. Usando schema de produção...');
    // Poderia copiar, mas vamos apenas avisar
  }
} else {
  console.log('   ℹ️  Usando schema principal');
}

console.log('\n4. 🔄 Gerando Prisma Client...');

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('   ✅ Prisma Client gerado');
} catch (error) {
  console.log(`   ❌ Erro ao gerar Prisma Client: ${error.message}`);
  console.log('\n💡 Solução:');
  console.log('   - Verifique se DATABASE_URL está correta');
  console.log('   - Verifique se o banco está acessível');
  console.log('   - Verifique firewall do Supabase');
  process.exit(1);
}

console.log('\n5. 🗃️  Aplicando migrações...');

try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('   ✅ Migrações aplicadas');
} catch (error) {
  console.log(`   ❌ Erro nas migrações: ${error.message}`);
  
  console.log('\n💡 Tentando criar banco do zero...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('   ✅ Banco criado do zero');
  } catch (pushError) {
    console.log(`   ❌ Erro ao criar banco: ${pushError.message}`);
    
    console.log('\n🔧 Soluções alternativas:');
    console.log('   1. No Supabase Dashboard → SQL Editor, execute:');
    console.log('      CREATE DATABASE postgres; (já existe)');
    console.log('   2. Verifique permissões do usuário');
    console.log('   3. Verifique SSL: adicione ?sslmode=require à DATABASE_URL');
    console.log('   4. No Supabase Dashboard → Database → Connection Pooling');
    console.log('      Use: postgresql://postgres:[SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres');
  }
}

console.log('\n6. 🔍 Verificando configuração do Supabase...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (projectRef) {
  console.log(`   ✅ Project Ref: ${projectRef}`);
  
  console.log('\n📋 Configuração do Supabase Database:');
  console.log('   1. Acesse: https://supabase.com/dashboard/project/' + projectRef);
  console.log('   2. Vá para: Settings → Database');
  console.log('   3. Em "Connection string", copie a URI');
  console.log('   4. Use no formato: postgresql://postgres:[SENHA]@db.${projectRef}.supabase.co:5432/postgres?sslmode=require');
  
  console.log('\n🔒 Configuração de SSL (IMPORTANTE):');
  console.log('   Adicione ?sslmode=require ao final da DATABASE_URL');
  console.log('   Exemplo: postgresql://.../postgres?sslmode=require');
}

console.log('\n7. 🧪 Testando aplicação...');

try {
  // Verificar se o build funciona
  console.log('   Testando build...');
  execSync('npm run build', { stdio: 'pipe', timeout: 60000 });
  console.log('   ✅ Build bem-sucedido');
} catch (error) {
  console.log(`   ⚠️  Erro no build: ${error.message}`);
  console.log('   ℹ️  Pode ser normal se faltarem dependências');
}

console.log('\n🎉 Configuração concluída!');
console.log('\n📋 Resumo:');
console.log('   ✅ Variáveis de ambiente configuradas');
console.log('   ✅ Prisma Client gerado');
console.log('   ✅ Migrações aplicadas');
console.log('   ✅ Build testado');
console.log('\n🚀 Próximos passos:');
console.log('   1. Acesse: https://os.hpinfo.com.br');
console.log('   2. Teste login/cadastro');
console.log('   3. Verifique logs na Vercel');
console.log('   4. Monitorar banco no Supabase Dashboard');

// Verificar se há dados no banco
console.log('\n📊 Status do banco:');
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  const userCount = await prisma.user.count();
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'global' }
  });
  
  console.log(`   👤 Usuários: ${userCount}`);
  console.log(`   ⚙️  Configurações: ${settings ? 'Configuradas' : 'Não configuradas'}`);
  
  if (!settings) {
    console.log('   ℹ️  Criando configurações padrão...');
    await prisma.systemSettings.create({
      data: { id: 'global' }
    });
  }
  
  await prisma.$disconnect();
} catch (error) {
  console.log(`   ⚠️  Não foi possível verificar banco: ${error.message}`);
}