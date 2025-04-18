"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Calendar, TrendingUp, TrendingDown, BarChart4, Wallet, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { fetchStockPrice } from "@/lib/fetchPriceData";
import { Skeleton } from "@/components/ui/skeleton";

type Transaction = {
  id: string;
  type: string;
  date: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  productId: string;
};

type Dividend = {
  id: string;
  amount: number;
  date: string;
  productId: string;
  createdAt?: string;
  updatedAt?: string;
};

type Expense = {
  id: string;
  amount: number;
  description: string;
  date: string;
  productId: string;
  createdAt?: string;
  updatedAt?: string;
};

type RealizedProfitLoss = {
  id: string;
  amount: number;
  date: string;
  productId: string;
  createdAt?: string;
  updatedAt?: string;
};

type Product = {
  id: string;
  ticker: string;
  name: string;
  type: string;
  quantity: number;
  averagePrice: number;
  price: number;
  dividend: number;
  expenses: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  Transaction: Transaction[];
  Dividend: Dividend[];
  Expense: Expense[];
  RealizedProfitLoss: RealizedProfitLoss[];
};

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isTransactionAlertOpen, setIsTransactionAlertOpen] = useState(false);
  const [priceData, setPriceData] = useState<{ price: number; changePercent: number } | null>(null);
  const [isPriceFetching, setIsPriceFetching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product details
        const productRes = await fetch(`/api/product`);
        if (!productRes.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const productsData = await productRes.json();
        console.log("Products data:", productsData);
        
        const foundProduct = productsData.find((p: Product) => p.id === productId);
        console.log("Found product:", foundProduct);
        
        if (!foundProduct) {
          alert("Produto não encontrado");
          router.push("/account/wallet");
          return;
        }
        
        setProduct(foundProduct);
        fetchPriceData(foundProduct.ticker);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, router]);
  
  const fetchPriceData = async (ticker: string) => {
    setIsPriceFetching(true);
    try {
      const data = await fetchStockPrice(ticker);
      if (data) {
        setPriceData({
          price: data.price,
          changePercent: data.changePercent
        });
      }
    } catch (error) {
      console.error("Erro ao buscar preço atual:", error);
    } finally {
      setIsPriceFetching(false);
    }
  };
  
  const refreshPrice = () => {
    if (product) {
      fetchPriceData(product.ticker);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await fetch(`/api/product`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: productId }),
      });
      
      alert("Produto excluído com sucesso");
      router.push("/account/wallet");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir produto");
    }
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionAlertOpen(true);
  };

  const confirmDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    
    try {
      await fetch(`/api/transaction`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedTransaction.id }),
      });
      
      // Remove transaction from local state
      if (product) {
        const updatedTransactions = product.Transaction.filter(
          t => t.id !== selectedTransaction.id
        );
        setProduct({
          ...product,
          Transaction: updatedTransactions
        });
        
        alert("Transação excluída com sucesso");
        setIsTransactionAlertOpen(false);
        setSelectedTransaction(null);
        
        // Refresh product data to get updated values from server
        const productRes = await fetch(`/api/product`);
        const productsData = await productRes.json();
        const updatedProductData = productsData.find((p: Product) => p.id === productId);
        if (updatedProductData) {
          setProduct(updatedProductData);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir transação");
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    router.push(`/account/wallet/${productId}/transaction/${transaction.id}`);
  };

  const handleAddTransaction = () => {
    router.push(`/account/wallet/${productId}/transaction/new`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  if (!product) {
    return <div className="p-8 text-center">Produto não encontrado</div>;
  }

  // Use live price data if available, otherwise fall back to the stored price
  const currentPrice = priceData?.price || product.price;
  const changePercent = priceData?.changePercent || 0;
  
  // Calculate performance metrics
  const currentValue = product.quantity * currentPrice;
  const costBasis = product.quantity * product.averagePrice;
  const profitLoss = currentValue - costBasis;
  const profitLossPercent = (profitLoss / costBasis) * 100;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{product.ticker}</h1>
            <Badge variant={
              product.type === "STOCK" ? "default" : 
              product.type === "FII" ? "secondary" : 
              product.type === "ETF" ? "outline" : "destructive"
            }>
              {product.type}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{product.name}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={refreshPrice}
            disabled={isPriceFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isPriceFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push(`/account/wallet/${productId}/edit`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteProduct}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Quantidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{product.quantity}</div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Preço Atual</CardTitle>
          </CardHeader>
          <CardContent>
            {isPriceFetching ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(currentPrice)}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Preço Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(product.averagePrice)}</div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Variação do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {isPriceFetching ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className={`text-2xl font-bold flex items-center ${changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                {changePercent >= 0 ? <TrendingUp className="mr-1 h-5 w-5" /> : <TrendingDown className="mr-1 h-5 w-5" />}
                {changePercent.toFixed(2)}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart4 className="h-5 w-5 mr-2" />
              Resumo do Investimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <Label className="text-sm text-muted-foreground">Valor Investido</Label>
                <span className="text-lg font-semibold">{formatCurrency(costBasis)}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b">
                <Label className="text-sm text-muted-foreground">Valor Atual</Label>
                {isPriceFetching ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <span className="text-lg font-semibold">{formatCurrency(currentValue)}</span>
                )}
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b">
                <Label className="text-sm text-muted-foreground">Lucro/Prejuízo</Label>
                {isPriceFetching ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <span className={`text-lg font-semibold ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatCurrency(profitLoss)} ({profitLossPercent.toFixed(2)}%)
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b">
                <Label className="text-sm text-muted-foreground">Dividendos</Label>
                <span className="text-lg font-semibold text-blue-500">{formatCurrency(product.dividend)}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b">
                <Label className="text-sm text-muted-foreground">Despesas</Label>
                <span className="text-lg font-semibold text-orange-500">{formatCurrency(product.expenses)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <Label className="text-md font-bold">Resultado Total</Label>
                {isPriceFetching ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <span className={`text-xl font-bold ${(profitLoss + product.dividend - product.expenses) >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatCurrency(profitLoss + product.dividend - product.expenses)}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Wallet className="h-5 w-5 mr-2" />
              Transações
            </CardTitle>
            <Button onClick={handleAddTransaction}>Adicionar Transação</Button>
          </CardHeader>
          <CardContent>
            {!product.Transaction || product.Transaction.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <p>Nenhuma transação encontrada</p>
                <Button variant="outline" className="mt-2" onClick={handleAddTransaction}>
                  Adicionar primeira transação
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {product.Transaction.map((transaction) => (
                  <Card key={transaction.id} className="overflow-hidden border-l-4" 
                    style={{ borderLeftColor: transaction.type === 'BUY' ? '#22c55e' : '#ef4444' }}>
                    <CardHeader className="p-4 pb-0 flex flex-row justify-between">
                      <div className="flex flex-row gap-2 items-center justify-center">
                        <Badge variant={transaction.type === 'BUY' ? 'default' : 'destructive'}>
                          {transaction.type === 'BUY' ? 'Compra' : 'Venda'}
                        </Badge>
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{format(new Date(transaction.date), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8" 
                          onClick={() => handleEditTransaction(transaction)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8" 
                          onClick={() => handleDeleteTransaction(transaction)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Quantidade</Label>
                          <p className="text-sm font-medium">{transaction.quantity}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Preço</Label>
                          <p className="text-sm font-medium">{formatCurrency(transaction.price)}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Total</Label>
                          <p className="text-sm font-medium">{formatCurrency(transaction.quantity * transaction.price)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Delete Alert */}
      <AlertDialog open={isTransactionAlertOpen} onOpenChange={setIsTransactionAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão da transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita e afetará
              o preço médio e a quantidade do produto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedTransaction(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTransaction}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
