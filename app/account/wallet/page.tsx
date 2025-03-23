"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search } from "lucide-react";
import { Pie, PieChart, ResponsiveContainer } from "recharts";

const chartData = [
    { classe: "Ações", valor: 2458, fill: "#22c55e" },
    { classe: "FIIs", valor: 1200, fill: "#3b82f6" },
    { classe: "ETFs", valor: 1000, fill: "#f59e0b" },
    { classe: "Fundos", valor: 173, fill: "#ec4899" },
    { classe: "Outros", valor: 90, fill: "#8b5cf6" },
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
    return (
        <ScrollArea className="h-screen py-2">
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
                        <Button variant="default">
                            <Plus className="w-4 h-4" />
                            Nova Transação
                        </Button>
                    </div>
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Classes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={chartConfig}
                                className="max-h-[250px]"
                            >
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel formatter={(value, name, item, index, payload) => (
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
                        </CardContent>
                    </Card>
                    <Card className="col-span-1 md:col-span-3">
                        <CardHeader>
                            <CardTitle>Produtos</CardTitle>
                        </CardHeader>
                        <CardContent>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </ScrollArea>
    )
}
