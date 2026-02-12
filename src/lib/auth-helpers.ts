import { prisma } from './prisma'
import { createServerSupabaseClient } from './supabase-server'

// Sincroniza usuário do Supabase Auth com nossa tabela User
export async function syncUserWithDatabase() {
  let supabase: any
  try {
    supabase = await createServerSupabaseClient()
  } catch {
    return null
  }
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  // Verifica se usuário já existe no banco
  const existingUser = await prisma.user.findUnique({
    where: { authId: user.id }
  })
  
  if (existingUser) {
    return existingUser
  }
  
  // Cria novo usuário no banco
  const newUser = await prisma.user.create({
    data: {
      authId: user.id,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      email: user.email!,
      role: 'TECHNICIAN', // Role padrão
      active: true
    }
  })
  
  return newUser
}

// Obtém usuário atual (do banco) baseado na sessão do Supabase
export async function getCurrentUserFromDatabase() {
  let supabase: any
  try {
    supabase = await createServerSupabaseClient()
  } catch {
    return null
  }
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id }
  })
  
  return dbUser
}

// Helper para verificar permissões
export async function checkUserPermission(requiredRole: string) {
  const user = await getCurrentUserFromDatabase()
  
  if (!user) {
    return false
  }
  
  // ADMIN tem acesso a tudo
  if (user.role === 'ADMIN') {
    return true
  }
  
  // Verifica role específica
  return user.role === requiredRole
}
