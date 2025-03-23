import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {

  // Verifica se o usuário está autenticado
  const cookieStore = await cookies()
  const token = cookieStore.get('token')

  // Se o usuário não está autenticado, redireciona para a página de login
  if (!token) {
    redirect('/auth/login')
  } else {
    // Se o usuário está autenticado, redireciona para a página de dashboard
    redirect('/account/dashboard')
  }
}