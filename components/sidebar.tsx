"use client"

import { useStockQuote } from "@/lib/fetchPriceData"
import { cn } from "@/lib/utils"
import {
    Briefcase,
    Home,
    LogOut,
    Settings,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { redirect, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { Label } from "./ui/label"
import { Skeleton } from "./ui/skeleton"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/account/dashboard",
        icon: Home,
    },
    {
        title: "Carteira",
        href: "/account/wallet",
        icon: Briefcase,
    },
    {
        title: "Configurações",
        href: "/account/settings",
        icon: Settings,
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const [currentTickerIndex, setCurrentTickerIndex] = useState(0)
    const [isVisible, setIsVisible] = useState(true)

    const tickers = [
        "^BVSP",
    ]
    
    const currentTicker = tickers[currentTickerIndex]
    const { data, loading } = useStockQuote(currentTicker)

    useEffect(() => {
        const interval = setInterval(() => {
            // Inicia o fade out
            setIsVisible(false)
            
            // Aguarda a animação de fade out completar antes de mudar o ticker
            setTimeout(() => {
                setCurrentTickerIndex((prevIndex) => (prevIndex + 1) % tickers.length)
                // Inicia o fade in
                setIsVisible(true)
            }, 300) // Tempo igual à duração da transição
        }, 10000000000)
        
        return () => clearInterval(interval)
    }, [tickers.length])

    const signOut = async () => {
        const response = await fetch("/api/auth/signout", {
            method: "POST",
        })
        if (response.ok) {
            redirect("/auth/login")
        } else {
            console.error("Erro ao deslogar")
        }
    }

    return (
        <div className="hidden border-r bg-muted/40 lg:block lg:w-64">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4">
                    <Link href="/" className="flex items-center gap-1 font-semibold">
                        <Image src="/logo.png" alt="logo" width={32} height={32} />
                        <Label className="text-xl">Investo</Label>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-2 text-sm font-medium">
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    pathname === item.href && "bg-muted text-primary",
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        ))}
                        <AlertDialog>
                            <AlertDialogTrigger>
                                <div
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer",
                                        pathname === "/logout" && "bg-muted text-primary",
                                    )}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sair
                                </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Você tem certeza que deseja sair da Investo?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={signOut}>Sair</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </nav>
                </div>
                <div className="mt-auto p-4 w-full">
                    <div className="flex items-center gap-2 rounded-lg bg-muted p-4 w-full">
                        <div className={cn(
                            "grid gap-1 w-full transition-opacity duration-300 ease-in-out",
                            isVisible ? "opacity-100" : "opacity-0"
                        )}>
                            <p className="text-sm font-medium leading-none w-full">
                                {currentTicker === "^BVSP" ? "Ibovespa" : currentTicker}
                            </p>
                            {loading || !data ? (
                                <Skeleton className="h-4 w-24 bg-muted-foreground/20" />
                            ) : (
                                <div className="w-full flex items-center justify-between">
                                    <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1 w-full">
                                        {data.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                    <span className={`${data.changePercent > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {data.changePercent.toFixed(2)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

