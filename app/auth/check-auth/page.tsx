'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetQuery } from "@/lib/useQuery"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function CheckAuth() {
    const [isClient, setIsClient] = useState(false)
    const { data, loading, error, refetch } = useGetQuery<{userTokenExists: boolean, userIdExists: boolean}>('/check-cookies')

    useEffect(() => {
        setIsClient(true)
    }, [])

    const checkRedirectStatus = async () => {
        try {
            const res = await fetch('/account/dashboard', { method: 'HEAD' })
            if (res.redirected) {
                toast.error('Redirecionamento detectado: você não está autenticado')
            } else if (res.ok) {
                toast.success('Rota protegida acessível: você está autenticado')
            } else {
                toast.error(`Erro ao verificar: ${res.status}`)
            }
        } catch (err) {
            toast.error('Erro ao verificar redirecionamento')
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Verificação de Autenticação</CardTitle>
                    <CardDescription>Verifique se o processo de login salvou os cookies corretamente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Verificação de Cookies</h3>
                        {loading ? (
                            <p>Carregando...</p>
                        ) : error ? (
                            <p className="text-red-500">Erro: {error.message}</p>
                        ) : data ? (
                            <div className="space-y-2">
                                <p>Cookie userToken: {data.userTokenExists ? "✅ Presente" : "❌ Ausente"}</p>
                                <p>Cookie userId: {data.userIdExists ? "✅ Presente" : "❌ Ausente"}</p>
                            </div>
                        ) : (
                            <p>Nenhum dado disponível</p>
                        )}
                        <Button onClick={() => refetch()} className="mt-2">Atualizar</Button>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                        <h3 className="text-lg font-medium">Verificação de Redirecionamento</h3>
                        <p>Testa se você será redirecionado ao acessar uma rota protegida:</p>
                        <Button onClick={checkRedirectStatus}>Verificar Acesso</Button>
                    </div>

                    {isClient && (
                        <div className="space-y-2 pt-4 border-t">
                            <h3 className="text-lg font-medium">Cookies no Navegador</h3>
                            <p>Cookies visíveis via JavaScript (httpOnly não aparecerão):</p>
                            <code className="block p-2 bg-gray-100 rounded overflow-x-auto">
                                {document.cookie || "Nenhum cookie disponível"}
                            </code>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 