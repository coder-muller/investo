"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { sendGetRequest, sendPostRequest, sendPutRequest } from "@/lib/fetchFunctions";
import { fetchStockPrice } from "@/lib/fetchPriceData";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon, Info, Minus, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Pie, PieChart, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { z } from "zod";

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
    const [products, setProducts] = useState<Product[]>([]);
    const [productsWithPrices, setProductsWithPrices] = useState<Product[]>([]);
    const [isFetchingPrices, setIsFetchingPrices] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isNewProduct, setIsNewProduct] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Definindo o esquema do formulário dentro do componente para acessar isNewProduct
    const formSchema = z.object({
        productId: z.string().optional()
            .refine(val => !isNewProduct || (isNewProduct && val === ""), {
                message: "Campo não deve ser preenchido para novos produtos"
            })
            .refine(val => isNewProduct || (!isNewProduct && val && val !== ""), {
                message: "Selecione um produto existente"
            }),
        ticker: z.string()
            .refine(val => !isNewProduct || (isNewProduct && val.length > 0), {
                message: "Ticker é obrigatório para novos produtos"
            }),
        name: z.string()
            .refine(val => !isNewProduct || (isNewProduct && val.length > 0), {
                message: "Nome é obrigatório para novos produtos"
            }),
        type: z.enum(["STOCK", "FII", "ETF", "FUND", "OTHER"]),
        date: z.date(),
        quantity: z.number().positive("A quantidade deve ser positiva"),
        price: z.number().positive("O preço deve ser positivo"),
        transactionType: z.enum(["BUY", "SELL"]),
    });

    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productId: "",
            ticker: "",
            name: "",
            type: "STOCK",
            date: new Date(),
            quantity: 1,
            price: 0,
            transactionType: "BUY",
        },
    });

    // Reset form when isNewProduct changes
    useEffect(() => {
        form.reset({
            productId: "",
            ticker: "",
            name: "",
            type: "STOCK",
            date: new Date(),
            quantity: 1,
            price: 0,
            transactionType: "BUY",
        });
    }, [isNewProduct, form]);

    // Handle product selection change
    const handleProductChange = (productId: string) => {
        const selectedProduct = products.find(p => p.id === productId);
        if (selectedProduct) {
            form.setValue("productId", productId);
            form.setValue("ticker", selectedProduct.ticker);
            form.setValue("name", selectedProduct.name);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            form.setValue("type", selectedProduct.type as any);
        }
    };

    useEffect(() => {
        fetchProducts()
    }, []);

    // Quando products mudar, atualize productsWithPrices
    useEffect(() => {
        setProductsWithPrices(products);
        if (products.length > 0) {
            fetchPrices();
        }
    }, [products]);

    // Configurar o intervalo para atualização de preços
    useEffect(() => {
        const interval = setInterval(fetchPrices, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const chartData = [
        { classe: "Ações", valor: productsWithPrices.filter(product => product.type === "STOCK").reduce((acc, product) => acc + (product.price * product.quantity), 0), fill: "#22c55e" },
        { classe: "FIIs", valor: productsWithPrices.filter(product => product.type === "FII").reduce((acc, product) => acc + (product.price * product.quantity), 0), fill: "#3b82f6" },
        { classe: "ETFs", valor: productsWithPrices.filter(product => product.type === "ETF").reduce((acc, product) => acc + (product.price * product.quantity), 0), fill: "#f59e0b" },
    ];

    const fetchProducts = async () => {
        try {
            const data = await sendGetRequest<Product[]>("/product");
            setProducts(data);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Erro ao buscar produtos:", error);
                toast.error(error.message);
            } else {
                console.error("Erro ao buscar produtos:", error);
                toast.error("Erro ao buscar produtos");
            }
        }
    };

    const fetchPrices = async () => {
        if (products.length === 0) return;

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
            const updatedProducts = products.map(product => {
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

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            // Determinar se estamos criando um novo produto ou adicionando uma transação
            if (isNewProduct) {
                const newProduct: Product = await sendPostRequest("/product", {
                    ticker: data.ticker,
                    name: data.name,
                    type: data.type,
                    quantity: data.quantity,
                    price: data.price,
                });

                const newProductId = newProduct.id;

                await sendPostRequest("/transaction", {
                    productId: newProductId,
                    type: data.transactionType,
                    quantity: data.quantity,
                    price: data.price,
                    date: data.date,
                });

                console.log("Criando novo produto:", newProduct);
                toast.success("Produto adicionado com sucesso!");
            } else {
                await sendPostRequest("/transaction", {
                    productId: data.productId,
                    type: data.transactionType,
                    quantity: data.quantity,
                    price: data.price,
                    date: data.date,
                });

                const oldTotalInvested = (productsWithPrices.find(product => product.id === data.productId)?.averagePrice || 0) * (productsWithPrices.find(product => product.id === data.productId)?.quantity || 0);
                const newTotalInvested = oldTotalInvested + (data.price * data.quantity);
                const newAveragePrice = newTotalInvested / ( (productsWithPrices.find(product => product.id === data.productId)?.quantity || 0) + data.quantity );
                const newQuantity = (productsWithPrices.find(product => product.id === data.productId)?.quantity || 0) + data.quantity;

                const updatedProduct = await sendPutRequest("/product", {
                    id: data.productId,
                    averagePrice: newAveragePrice,
                    quantity: newQuantity,
                });

                console.log("Atualizando produto:", updatedProduct);
                toast.success("Transação adicionada com sucesso!");
            }

            // Recarregar produtos
            await fetchProducts();
            setIsDialogOpen(false);
            form.reset();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Erro ao processar a transação");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        <Button
                            variant="default"
                            onClick={() => {
                                form.reset({
                                    productId: "",
                                    ticker: "",
                                    name: "",
                                    type: "STOCK",
                                    date: new Date(),
                                    quantity: 1,
                                    price: 0,
                                    transactionType: "BUY",
                                });
                                setIsDialogOpen(true);
                                setIsNewProduct(false);
                            }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Transação
                        </Button>
                    </div>
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="h-max col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Classes</CardTitle>
                            <CardDescription>Sua carteira dividida por classes de produtos</CardDescription>
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
                                {productsWithPrices.length === 0 ? (
                                    <div className="w-full flex items-center justify-center p-4">
                                        <p className="text-muted-foreground">Nenhum produto encontrado</p>
                                    </div>
                                ) : (
                                    productsWithPrices.map((product) => (
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
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova Transação</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        {isNewProduct ? "Adicione um novo produto à sua carteira" : "Adicione uma nova transação à sua carteira"}
                    </DialogDescription>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                            <div className="grid grid-cols-6 gap-2 items-end">
                                <div className="col-span-5">
                                    {!isNewProduct && (
                                        <FormField
                                            control={form.control}
                                            name="productId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Produto</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                handleProductChange(value);
                                                            }}
                                                            value={field.value}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione um produto" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {products.map((product) => (
                                                                    <SelectItem key={product.id} value={product.id}>{product.ticker} - {product.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>
                                <div className="col-span-1">
                                    <Button type="button" className="w-full" onClick={() => setIsNewProduct(!isNewProduct)}>
                                        {isNewProduct ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                            {isNewProduct && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nome</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Nome do produto" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-2 items-end">
                                        <FormField
                                            control={form.control}
                                            name="ticker"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ticker</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Ticker do produto" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tipo</FormLabel>
                                                    <FormControl>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione um tipo" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="STOCK">Ação</SelectItem>
                                                                <SelectItem value="FII">FII</SelectItem>
                                                                <SelectItem value="ETF">ETF</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </>
                            )}
                            <div className="grid grid-cols-2 gap-2 items-end">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Data</FormLabel>
                                            <FormControl>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-start">
                                                            <CalendarIcon className="w-4 h-4 mr-2" />
                                                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent>
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="transactionType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de transação</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione um tipo" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="BUY">Compra</SelectItem>
                                                        <SelectItem value="SELL">Venda</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 items-end">
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field: { value, onChange, ...field } }) => (
                                        <FormItem>
                                            <FormLabel>Quantidade</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    value={value}
                                                    onChange={(e) => onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field: { value, onChange, ...field } }) => (
                                        <FormItem>
                                            <FormLabel>Preço</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    value={value}
                                                    onChange={(e) => onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter className="mt-4">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Enviando..." : isNewProduct ? "Adicionar Produto" : "Adicionar Transação"}
                                </Button>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">Cancelar</Button>
                                </DialogClose>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </ScrollArea>
    )
}
