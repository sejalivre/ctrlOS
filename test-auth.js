// Script para testar configuração do Supabase Auth
const { createClient } = require('@supabase/supabase-js');

// Configuração de teste
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example-key';

console.log('🔧 Testando configuração do Supabase Auth...');
console.log('URL:', supabaseUrl);
console.log('Key (primeiros 10 chars):', supabaseKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('\n🧪 Testando conexão com Supabase...');
  
  try {
    // Testar conexão básica
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Erro na conexão:', error.message);
      
      if (error.message.includes('Invalid API key')) {
        console.log('\n⚠️  Problema: Chave API inválida');
        console.log('Solução: Verifique NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local');
      } else if (error.message.includes('project not found')) {
        console.log('\n⚠️  Problema: URL do projeto inválida');
        console.log('Solução: Verifique NEXT_PUBLIC_SUPABASE_URL no .env.local');
      }
      
      return false;
    }
    
    console.log('✅ Conexão com Supabase OK');
    
    // Verificar configuração de auth
    console.log('\n🔐 Verificando configuração de autenticação...');
    
    // Tentar criar um usuário de teste (será deletado)
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.log('❌ Erro no cadastro de teste:', signUpError.message);
      
      if (signUpError.message.includes('email provider is disabled')) {
        console.log('\n⚠️  Problema: Email provider não habilitado');
        console.log('Solução: No Supabase Dashboard → Authentication → Providers → Habilitar "Email"');
      } else if (signUpError.message.includes('redirect_to')) {
        console.log('\n⚠️  Problema: URLs de redirecionamento não configuradas');
        console.log('Solução: No Supabase Dashboard → Authentication → URL Configuration');
        console.log('Adicionar:');
        console.log('  - Site URL: https://os.hpinfo.com.br');
        console.log('  - Redirect URLs: https://os.hpinfo.com.br/auth/callback');
      }
      
      return false;
    }
    
    console.log('✅ Autenticação configurada corretamente');
    console.log('✅ Email provider habilitado');
    
    // Limpar usuário de teste
    if (signUpData.user) {
      console.log('\n🧹 Limpando usuário de teste...');
      // Nota: Para deletar usuários, você precisa da Service Role Key
      console.log('ℹ️  Usuário de teste criado:', testEmail);
      console.log('ℹ️  Você pode deletar manualmente no Supabase Dashboard');
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Erro inesperado:', error.message);
    return false;
  }
}

// Executar teste
testAuth().then(success => {
  if (success) {
    console.log('\n🎉 Todos os testes passaram!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Substitua as credenciais no .env.local pelas reais do seu projeto Supabase');
    console.log('2. No Supabase Dashboard → Authentication → URL Configuration:');
    console.log('   - Site URL: https://os.hpinfo.com.br');
    console.log('   - Redirect URLs: https://os.hpinfo.com.br/auth/callback');
    console.log('3. No Supabase Dashboard → Authentication → Providers → Habilitar "Email"');
    console.log('4. Execute: npm run dev');
    console.log('5. Acesse: https://os.hpinfo.com.br/login');
  } else {
    console.log('\n🔧 Alguns testes falharam. Verifique as configurações acima.');
    process.exit(1);
  }
});