# 🔧 Troubleshooting - Problemas de Autenticação

Guia rápido para resolver problemas comuns de login/cadastro no Supabase Auth.

## 🚨 Problema: "Cadastra mas não consegue fazer login"

### 🔍 **Causas mais comuns:**

#### 1. **Confirmação de Email Habilitada**
**Sintoma:** Usuário é cadastrado, aparece no Supabase, mas login falha com "Invalid credentials" ou "Email not confirmed".

**Solução:**
1. **No Supabase Dashboard:**
   ```
   Authentication → Providers → Email
   ```
   - Desabilite **"Confirm email"** (para testes/desenvolvimento)
   - Ou mantenha habilitado e verifique a caixa de entrada do usuário

2. **Para desenvolvimento:** Desabilite a confirmação
3. **Para produção:** Configure templates de email ou use confirmação automática

#### 2. **Cookies/Sessão Não Persistem**
**Sintoma:** Login parece funcionar mas usuário é redirecionado para login novamente.

**Solução:**
1. **Verificar cookies no navegador:**
   - F12 → Application → Cookies
   - Deve ver cookies do Supabase (`sb-...`)

2. **Configurar cliente Supabase corretamente:**
```typescript
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
```

#### 3. **URLs de Redirecionamento Incorretas**
**Sintoma:** Redireciona para tela do Supabase ou falha silenciosamente.

**Solução:**
No Supabase Dashboard:
```
Authentication → URL Configuration
```
- **Site URL:** `https://os.hpinfo.com.br`
- **Redirect URLs:** `https://os.hpinfo.com.br/auth/callback`

#### 4. **Problema com Middleware**
**Sintoma:** Login funciona mas middleware bloqueia acesso.

**Solução:**
1. Verificar `src/middleware.ts`
2. Testar sem middleware (comentar temporariamente)
3. Verificar logs do middleware

## 🧪 **Testes Rápidos**

### Teste 1: Verificar Configuração Supabase
```bash
node test-auth.js
```

### Teste 2: Página de Debug
Acesse: `https://os.hpinfo.com.br/login-debug`

### Teste 3: Console do Navegador
1. F12 → Console
2. Procure erros
3. F12 → Network → Filtre por "supabase"

### Teste 4: Cookies
1. F12 → Application → Cookies
2. Deve ver:
   - `sb-access-token`
   - `sb-refresh-token`

## 🔧 **Soluções Passo a Passo**

### **Cenário 1: Email precisa de confirmação**
1. **No Supabase Dashboard:**
   - Authentication → Providers → Email
   - Desabilite "Confirm email"
   - Salve

2. **Cadastre novo usuário**
3. **Tente login**

### **Cenário 2: Cookies bloqueados**
1. **Teste em modo anônimo/incógnito**
2. **Limpe cookies do site**
3. **Verifique configurações do navegador**
4. **Teste em outro navegador**

### **Cenário 3: Problema com HTTPS**
1. **Verifique se todas as URLs usam HTTPS**
2. **Certifique-se que `NEXT_PUBLIC_SITE_URL` começa com `https://`**
3. **Verifique certificado SSL**

### **Cenário 4: Usuário já existe**
1. **No Supabase Dashboard:**
   - Authentication → Users
   - Verifique se email já está cadastrado
   - Delete usuário se necessário

2. **Use email diferente para teste**

## 📋 **Checklist de Verificação**

### ✅ **Supabase Dashboard:**
- [ ] Email Provider habilitado
- [ ] "Confirm email" desabilitado (para testes)
- [ ] Site URL: `https://os.hpinfo.com.br`
- [ ] Redirect URLs: `https://os.hpinfo.com.br/auth/callback`

### ✅ **Variáveis de Ambiente:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` correto
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` correto
- [ ] `NEXT_PUBLIC_SITE_URL`: `https://os.hpinfo.com.br`

### ✅ **Código:**
- [ ] Página `/auth/callback` existe
- [ ] Middleware configurado
- [ ] `signInWithPassword` (não `signInWithOAuth`)

### ✅ **Navegador:**
- [ ] Cookies não bloqueados
- [ ] JavaScript habilitado
- [ ] Não está em modo privado (para testes)
- [ ] Console sem erros

## 🐛 **Debug Avançado**

### 1. **Logs do Supabase:**
```
Supabase Dashboard → Authentication → Logs
```

### 2. **Network Requests:**
1. F12 → Network
2. Filtre por "supabase"
3. Verifique status das requests (200, 400, 500)
4. Clique em cada request → Preview/Response

### 3. **Console JavaScript:**
```javascript
// No console do navegador
const supabase = supabase.createClient('URL', 'KEY');
supabase.auth.getSession().then(console.log);
```

### 4. **Teste Direto com cURL:**
```bash
# Testar login via API
curl -X POST 'https://SEU_PROJETO.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: SUA_CHAVE_ANON" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@email.com","password":"senha123"}'
```

## 🚀 **Solução Rápida (Desenvolvimento)**

### **Passo 1: Resetar Configuração**
1. **Supabase Dashboard:**
   - Authentication → Providers → Email → Habilitar
   - Authentication → Providers → Email → "Confirm email" → Desabilitar
   - Authentication → URL Configuration:
     - Site URL: `https://os.hpinfo.com.br`
     - Redirect URLs: `https://os.hpinfo.com.br/auth/callback`

2. **Limpar tudo:**
   - Limpar cookies do navegador
   - Limpar localStorage
   - Fechar e reabrir navegador

### **Passo 2: Testar com Página de Debug**
1. Acesse: `https://os.hpinfo.com.br/login-debug`
2. Cadastre novo usuário
3. Tente login
4. Verifique logs

### **Passo 3: Verificar Resultado**
Se ainda falhar, verifique:
- Console do navegador (erros JavaScript)
- Network requests (erros HTTP)
- Cookies (se estão sendo salvos)

## 📞 **Suporte**

### **Se nada funcionar:**
1. **Execute diagnóstico completo:**
```bash
node diagnose-auth.js
```

2. **Compartilhe:**
- Erros do console
- Screenshot da página de debug
- Configuração do Supabase (sem chaves secretas)

3. **Links úteis:**
- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Troubleshooting Supabase](https://supabase.com/docs/guides/auth/troubleshooting)
- [Exemplos Next.js + Supabase](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)

---

**Nota:** Para desenvolvimento, recomendo **desabilitar "Confirm email"** até que o fluxo básico esteja funcionando. Depois, você pode habilitar e configurar os templates de email.