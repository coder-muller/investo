"use client"

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
    email: z.string().email({ message: "Por favor, digite um email válido" }),
    password: z.string().min(1, { message: "Por favor, digite sua senha" }),
})

export default function Login() {

    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const { mutate } = usePostMutation<{ message: string }>('/auth/login');

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        
        try {
            const result = await mutate({ email: values.email.trim(), password: values.password.trim() });
            toast.success(result.message || "Login realizado com sucesso!");
            router.push("/account/dashboard")
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Ocorreu um erro ao fazer login";
            toast.error(errorMsg);
        } finally {
            setIsLoading(false)
        }
    }

    return (
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
                    <CardTitle>Faça login</CardTitle>
                    <CardDescription>Faça login para continuar</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Digite seu email" autoComplete="email" />
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
                                            <Input {...field} type="password" placeholder="Digite sua senha" autoComplete="current-password" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading} className="w-full mt-4">{isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Entrar"
                            )}</Button>
                            <p className="text-sm text-center font-thin">Não tem uma conta? <Link href="/auth/signup" className="text-blue-500 hover:text-blue-600 font-semibold hover:underline">Crie uma conta</Link></p>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
