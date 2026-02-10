// Script de diagnóstico para problemas de autenticação
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Diagnóstico de Problemas de Autenticação\n');

// Configuração
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseAuth() {
  console.log('1. ✅ Testando conexão com Supabase...');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.log('   ❌ Erro:', sessionError.message);
    return;
  }
  
  console.log('   ✅ Conexão OK');
  
  console.log('\n2. 🔍 Verificando configuração de Email Provider...');
  
  // Tentar criar um usuário de teste
  const testEmail = `test-diagnose-${Date.now()}@test.com`;
  const testPassword = 'Test123456';
  
  console.log(`   Criando usuário de teste: ${testEmail}`);
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });
  
  if (signUpError) {
    console.log('   ❌ Erro no cadastro:', signUpError.message);
    
    if (signUpError.message.includes('email provider is disabled')) {
      console.log('\n   ⚠️  SOLUÇÃO: Habilitar Email Provider no Supabase Dashboard');
      console.log('   Authentication → Providers → Email → Habilitar');
    }
    
    if (signUpError.message.includes('User already registered')) {
      console.log('\n   ⚠️  SOLUÇÃO: Email já cadastrado');
      console.log('   Verifique se o usuário já existe');
    }
    
    return;
  }
  
  console.log('   ✅ Usuário criado com sucesso');
  console.log('   User ID:', signUpData.user?.id);
  console.log('   Email confirmado?', signUpData.user?.email_confirmed_at ? 'Sim' : 'Não');
  
  // Verificar se precisa de confirmação de email
  if (!signUpData.user?.email_confirmed_at) {
    console.log('\n   ⚠️  ATENÇÃO: Email não confirmado!');
    console.log('   Isso pode impedir o login.');
    console.log('   Verifique no Supabase Dashboard:');
    console.log('   Authentication → Providers → Email → "Confirm email"');
    console.log('   Se estiver habilitado, o usuário precisa confirmar o email.');
    console.log('   Se não quiser confirmação, desabilite esta opção.');
  }
  
  console.log('\n3. 🔐 Testando login com o usuário criado...');
  
  // Tentar fazer login imediatamente
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  
  if (loginError) {
    console.log('   ❌ Erro no login:', loginError.message);
    
    if (loginError.message.includes('Invalid login credentials')) {
      console.log('\n   ⚠️  SOLUÇÃO: Credenciais inválidas');
      console.log('   Possíveis causas:');
      console.log('   1. Senha incorreta');
      console.log('   2. Email não confirmado (se confirmação habilitada)');
      console.log('   3. Usuário desativado');
    }
    
    if (loginError.message.includes('Email not confirmed')) {
      console.log('\n   ⚠️  SOLUÇÃO: Email não confirmado');
      console.log('   No Supabase Dashboard:');
      console.log('   Authentication → Providers → Email → Desabilitar "Confirm email"');
      console.log('   OU enviar email de confirmação');
    }
    
  } else {
    console.log('   ✅ Login bem-sucedido!');
    console.log('   Session:', loginData.session ? 'Criada' : 'Não criada');
    console.log('   User:', loginData.user?.email);
  }
  
  console.log('\n4. 🍪 Verificando cookies/sessão...');
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.log('   ❌ Erro ao obter usuário:', userError.message);
  } else if (user) {
    console.log('   ✅ Usuário obtido da sessão:', user.email);
  } else {
    console.log('   ⚠️  Nenhum usuário na sessão');
    console.log('   Possíveis causas:');
    console.log('   1. Cookies não estão sendo salvos');
    console.log('   2. Sessão não está sendo persistida');
    console.log('   3. Problema com middleware');
  }
  
  console.log('\n5. 🔗 Verificando URLs de redirecionamento...');
  console.log('   Site URL configurado:', process.env.NEXT_PUBLIC_SITE_URL || 'Não configurado');
  console.log('   Supabase URL:', supabaseUrl);
  
  // Verificar se as URLs são compatíveis
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl && !siteUrl.startsWith('http')) {
    console.log('   ⚠️  Site URL deve começar com http:// ou https://');
  }
  
  console.log('\n6. 📋 Checklist de problemas comuns:');
  console.log('   [ ] Email Provider habilitado no Supabase');
  console.log('   [ ] "Confirm email" desabilitado (para testes)');
  console.log('   [ ] URLs de redirecionamento configuradas');
  console.log('   [ ] Site URL: https://os.hpinfo.com.br');
  console.log('   [ ] Redirect URL: https://os.hpinfo.com.br/auth/callback');
  console.log('   [ ] Cookies não bloqueados pelo navegador');
  console.log('   [ ] Não está em modo privado/incógnito');
  
  console.log('\n7. 🧪 Teste manual rápido:');
  console.log('   A. Acesse: https://os.hpinfo.com.br/login');
  console.log('   B. Cadastre um novo usuário');
  console.log('   C. Verifique console do navegador (F12 → Console)');
  console.log('   D. Verifique aba Network → verifique requests para Supabase');
  console.log('   E. Verifique cookies (F12 → Application → Cookies)');
  
  // Limpar usuário de teste
  console.log('\n🧹 Limpando usuário de teste...');
  console.log('   Email:', testEmail);
  console.log('   Nota: Para deletar, use o Supabase Dashboard ou Service Role Key');
}

// Executar diagnóstico
diagnoseAuth().catch(error => {
  console.error('❌ Erro no diagnóstico:', error);
});