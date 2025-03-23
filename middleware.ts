import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtDecode } from "jwt-decode"

const pretectedRoutes = {
    '/account/dashboard': true,
}

// Função middleware que verifica se o usuário está autenticado
export default async function middleware(request: NextRequest) {
    // Obtém o caminho da URL da requisição
    const { pathname } = request.nextUrl

    // Acessa os cookies da requisição
    const cookieStore = await cookies()
    const isLoggedIn = cookieStore.get('userToken')

    if (isLoggedIn) {
        // Decodifica o token JWT para verificar suas informações
        const decodedToken = jwtDecode(isLoggedIn.value)
        // Obtém o tempo atual em segundos
        const currentTime = Date.now() / 1000
        // Verifica se o token expirou
        if (decodedToken.exp && decodedToken.exp < currentTime) {
            // Se o token expirou, remove os cookies de autenticação
            cookieStore.delete('userToken')
            cookieStore.delete('userId')
            // Redireciona o usuário para a página de login
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }
    }

    // Verifica se a rota acessada é protegida e se o usuário não está logado
    if (pretectedRoutes[pathname as keyof typeof pretectedRoutes] && !isLoggedIn) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/account/:path*',
}
