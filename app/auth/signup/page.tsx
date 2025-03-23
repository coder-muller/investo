'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePostMutation } from "@/lib/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
    name: z.string().min(1, { message: "Nome é obrigatório" }),
    email: z.string().email({ message: "Email inválido" }),
    password: z.string().min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
    confirmPassword: z.string().min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
})

export default function Signup() {

    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    // Importando o hook usePostMutation para fazer a chamada à API
    const { mutate, error } = usePostMutation<{ message: string }>('/auth/signup');

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            // Enviando apenas os dados necessários para a API (sem confirmPassword)
            const { name, email, password } = values;
            
            // Chamando a API usando o hook de mutação
            const result = await mutate({ name: name.trim(), email: email.trim(), password: password.trim() });
            
            // Exibindo mensagem de sucesso
            toast.success(result.message || "Conta criada com sucesso!");
            
            // Redirecionando para a página de login após o cadastro
            router.push('/auth/login');
        } catch {
            // Tratando o erro e exibindo mensagem apropriada
            const errorMessage = error?.message || "Ocorreu um erro ao criar sua conta";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className="flex flex-col items-center justify-center w-full h-screen">
                <div className="flex items-center">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={50}
                        height={50}
                        className="rounded-full"
                    />
                    <Label className="text-4xl">Investo</Label>
                </div>
                <Card className="w-full max-w-md mt-6">
                    <CardHeader>
                        <CardTitle>Crie sua conta</CardTitle>
                        <CardDescription>Crie sua conta gratuitamente para continuar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Digite seu nome" autoComplete="off" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Digite seu email" autoComplete="off" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="password" placeholder="Digite sua senha" autoComplete="off" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirmar senha</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="password" placeholder="Confirme sua senha" autoComplete="off" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isLoading} className="w-full mt-4">{isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Criar conta"
                                )}</Button>
                                <p className="text-sm text-center font-thin">Já tem uma conta? <Link href="/auth/login" className="text-blue-500 hover:text-blue-600 font-semibold hover:underline">Faça login</Link></p>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
