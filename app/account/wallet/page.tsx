"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { fetchStockPrice } from "@/lib/fetchPriceData";
import { Info, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Pie, PieChart, ResponsiveContainer } from "recharts";

const products = [
    {
        id: 1,
        ticker: "PETR4",
        name: "Petrobras S.A.",
        type: "Ação",
        quantity: 100,
        averagePrice: 42.50,
        price: 25.00,
        createdAt: "2024-01-01T05:00:00.000Z",
        updatedAt: "2024-01-01T05:00:00.000Z",
        transactions: [
            {
                id: 1,
                type: "buy",
                price: 20.00,
                quantity: 100,
                date: "2024-01-01T05:00:00.000Z",
                createdAt: "2024-01-01T05:00:00.000Z",
            }
        ]
    },
    {
        id: 2,
        ticker: "HASH11",
        name: "Hashdex Nasdaq Crypto Index",
        type: "ETF",
        quantity: 50,
        averagePrice: 72.94,
        price: 35.00,
        createdAt: "2024-01-01T05:00:00.000Z",
        updatedAt: "2024-01-01T05:00:00.000Z",
        transactions: [
            {
                id: 2,
                type: "buy",
                price: 30.00,
                quantity: 50,
                date: "2024-01-01T05:00:00.000Z",
                createdAt: "2024-01-01T05:00:00.000Z",
            }
        ]
    },
    {
        id: 3,
        ticker: "GARE11",
        name: "Gare Investimentos",
        type: "FII",
        quantity: 875,
        averagePrice: 9.75,
        price: 45.00,
        createdAt: "2024-01-01T05:00:00.000Z",
        updatedAt: "2024-01-01T05:00:00.000Z",
        transactions: [
            {
                id: 3,
                type: "buy",
                price: 40.00,
                quantity: 875,
                date: "2024-01-01T05:00:00.000Z",
                createdAt: "2024-01-01T05:00:00.000Z",
            }
        ]
    },
    {
        id: 4,
        ticker: "ITUB4",
        name: "Itaú Unibanco Holding S.A.",
        type: "Ação",
        quantity: 200,
        averagePrice: 30.00,
        price: 28.00,
        createdAt: "2024-01-01T05:00:00.000Z",
        updatedAt: "2024-01-01T05:00:00.000Z",
        transactions: [
            {
                id: 4,
                type: "buy",
                price: 25.00,
                quantity: 200,
                date: "2024-01-01T05:00:00.000Z",
                createdAt: "2024-01-01T05:00:00.000Z",
            }
        ]
    },
    {
        id: 5,
        ticker: "VALE3",
        name: "Vale S.A.",
        type: "Ação",
        quantity: 150,
        averagePrice: 90.00,
        price: 85.00,
        createdAt: "2024-01-01T05:00:00.000Z",
        updatedAt: "2024-01-01T05:00:00.000Z",
        transactions: [
            {
                id: 5,
                type: "buy",
                price: 80.00,
                quantity: 150,
                date: "2024-01-01T05:00:00.000Z",
                createdAt: "2024-01-01T05:00:00.000Z",
            }
        ]
    },
    {
        id: 6,
        ticker: "B3SA3",
        name: "B3 S.A.",
        type: "Ação",
        quantity: 300,
        averagePrice: 15.00,
        price: 14.50,
        createdAt: "2024-01-01T05:00:00.000Z",
        updatedAt: "2024-01-01T05:00:00.000Z",
        transactions: [
            {
                id: 6,
                type: "buy",
                price: 14.00,
                quantity: 300,
                date: "2024-01-01T05:00:00.000Z",
                createdAt: "2024-01-01T05:00:00.000Z",
            }
        ]
    },
    {
        id: 7,
        ticker: "IVVB11",
        name: "SP500 Index",
        type: "ETF",
        quantity: 100,
        averagePrice: 286.78,
        price: 290.00,
        createdAt: "2024-01-01T05:00:00.000Z",
        updatedAt: "2024-01-01T05:00:00.000Z",
        transactions: [
            {
                id: 7,
                type: "buy",
                price: 286.78,
                quantity: 100,
                date: "2024-01-01T05:00:00.000Z",
                createdAt: "2024-01-01T05:00:00.000Z",
            }
        ]
    },
    {
        id: 8,
        ticker: "ABEV3",
        name: "Ambev S.A.",
        type: "Ação",
        quantity: 250,
        averagePrice: 18.00,
        price: 17.50,
        createdAt: "2024-01-01T05:00:00.000Z",
        updatedAt: "2024-01-01T05:00:00.000Z",
        transactions: [
            {
                id: 8,
                type: "buy",
                price: 17.00,
                quantity: 250,
                date: "2024-01-01T05:00:00.000Z",
                createdAt: "2024-01-01T05:00:00.000Z",
            }
        ]
    },
    {
        id: 9,
        ticker: "BBAS3",
        name: "Banco do Brasil S.A.",
        type: "Ação",
        quantity: 180,
        averagePrice: 50.00,
        price: 48.00,
        createdAt: "2024-01-01T05:00:00.000Z",
        updatedAt: "2024-01-01T05:00:00.000Z",
        transactions: [
            {
                id: 9,
                type: "buy",
                price: 45.00,
                quantity: 180,
                date: "2024-01-01T05:00:00.000Z",
                createdAt: "2024-01-01T05:00:00.000Z",
            }
        ]
    },
    {
        id: 10,
        ticker: "LREN3",
        name: "Lojas Renner S.A.",
        type: "Ação",
        quantity: 90,
        averagePrice: 35.00,
        price: 34.00,
        createdAt: "2024-01-01T05:00:00.000Z",
        updatedAt: "2024-01-01T05:00:00.000Z",
        transactions: [
            {
                id: 10,
                type: "buy",
                price: 33.00,
                quantity: 90,
                date: "2024-01-01T05:00:00.000Z",
                createdAt: "2024-01-01T05:00:00.000Z",
            }
        ]
    }
]

const chartData = [
    { classe: "Ações", valor: products.filter(product => product.type === "Ação").reduce((acc, product) => acc + (product.price * product.quantity), 0), fill: "#22c55e" },
    { classe: "FIIs", valor: products.filter(product => product.type === "FII").reduce((acc, product) => acc + (product.price * product.quantity), 0), fill: "#3b82f6" },
    { classe: "ETFs", valor: products.filter(product => product.type === "ETF").reduce((acc, product) => acc + (product.price * product.quantity), 0), fill: "#f59e0b" },
]

const chartConfig = {
    classes: {
        label: "Classes",
    },
    acoes: {
        label: "Ações",
        color: "#22c55e",
    },
    fiis: {
        label: "FIIs",
        color: "#3b82f6",
    },
    etfs: {
        label: "ETFs",
        color: "#f59e0b",
    },
    fundos: {
        label: "Fundos",
        color: "#ec4899",
    },
    outros: {
        label: "Outros",
        color: "#8b5cf6",
    },
} satisfies ChartConfig

export default function Wallet() {
    const [productsWithPrices, setProductsWithPrices] = useState(products);
    const [isFetchingPrices, setIsFetchingPrices] = useState(true);

    const fetchPrices = async () => {
        setIsFetchingPrices(true);

        try {
            // Extrai todos os tickers únicos para buscar
            const tickers = [...new Set(products.map(product => product.ticker))];

            // Busca os preços para todos os tickers em paralelo
            const priceResults = await Promise.all(
                tickers.map(async (ticker) => {
                    const data = await fetchStockPrice(ticker);
                    return { ticker, data };
                })
            );

            // Cria um mapa de ticker para preço
            const priceMap = new Map();
            priceResults.forEach(result => {
                if (result.data) {
                    priceMap.set(result.ticker, result.data.price);
                }
            });

            // Atualiza os produtos com os novos preços
            const updatedProducts = productsWithPrices.map(product => {
                const newPrice = priceMap.get(product.ticker);
                return newPrice ? { ...product, price: newPrice } : product;
            });

            setProductsWithPrices(updatedProducts);
        } catch (error) {
            console.error("Erro ao buscar preços:", error);
        } finally {
            setTimeout(() => {
                setIsFetchingPrices(false);
            }, 1000);
        }
    };

    useEffect(() => {
        fetchPrices();

        // Atualiza os preços a cada 15 minutos
        const interval = setInterval(fetchPrices, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ScrollArea className="h-screen py-2 px-4">
            <div className="w-full flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start justify-center">
                        <Label className="text-xl font-bold">Carteira</Label>
                        <Label className="text-sm text-muted-foreground">Adicione e gerencie seus ativos e investimentos</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input type="text" placeholder="Pesquisar" className="pl-10" />
                        </div>
                        <Button variant="default" onClick={fetchPrices} disabled={isFetchingPrices}>
                            <Plus className="w-4 h-4" />
                            Nova Transação
                        </Button>
                    </div>
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="h-max col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Classes</CardTitle>
                            <CardDescription>Sua carteira dividida por classes de investimentos</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <ChartContainer
                                config={chartConfig}
                                className="max-h-[350px]"
                            >
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel formatter={(value, name) => (
                                                <>
                                                    <div className="flex flex-col items-start justify-start">
                                                        <span className="text-xs font-normal text-muted-foreground">{name}</span>
                                                        <span className="text-sm font-bold">{value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                                                    </div>
                                                </>
                                            )} />}
                                        />
                                        <Pie
                                            data={chartData}
                                            dataKey="valor"
                                            nameKey="classe"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={2}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                            <div className="flex flex-col gap-1">
                                {chartData.map((item) => (
                                    <div key={item.classe} className="w-full flex items-center justify-between border-b border-border pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-10" style={{ backgroundColor: item.fill }} />
                                            <span className="text-md font-medium">{item.classe}</span>
                                        </div>
                                        {isFetchingPrices ? (
                                            <Skeleton className="w-24 h-4" />
                                        ) : (
                                            <span className="text-md font-bold">{item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-1 md:col-span-3">
                        <CardHeader>
                            <CardTitle>Produtos</CardTitle>
                            <CardDescription>Todos os produtos e ativos da sua carteira</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full flex flex-col gap-2">
                                {productsWithPrices.map((product) => (
                                    <div key={product.id} className="w-full flex flex-col items-start justify-start gap-2 border px-5 py-3 rounded-md">
                                        <div className="w-full flex items-center justify-between">
                                            <Label className="text-md font-semibold">{product.ticker} - {product.name}</Label>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default" className="text-sm font-bold">{product.type}</Badge>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Button variant="ghost" size="icon">
                                                            <Info className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Informações sobre o produto</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <div className="w-full grid grid-cols-3 gap-2 border-t border-border pt-2 my-2">
                                            <div className="text-sm font-bold w-full flex flex-col items-center justify-center">
                                                <span className="text-xs font-normal text-muted-foreground">Quantidade</span>
                                                <span className="text-sm font-bold">{product.quantity}</span>
                                            </div>
                                            <div className="text-sm font-bold w-full flex flex-col items-center justify-center">
                                                <span className="text-xs font-normal text-muted-foreground">Preço Médio</span>
                                                <span className="text-sm font-bold">{product.averagePrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                                            </div>
                                            <div className="text-sm font-bold w-full flex flex-col items-center justify-center">
                                                <span className="text-xs font-normal text-muted-foreground">Lucro/Prejuízo</span>
                                                {isFetchingPrices ? (
                                                    <Skeleton className="w-24 h-4" />
                                                ) : (
                                                    <span className={`text-sm font-bold ${((product.price * product.quantity) - (product.averagePrice * product.quantity)) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {((product.price * product.quantity) - (product.averagePrice * product.quantity)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ScrollArea>
    )
}
