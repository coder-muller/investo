import { useState, useEffect, useCallback } from "react";

interface StockData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
}

const API_URL = "https://brapi.dev/api/quote/";

export function useStockQuote(ticker: string) {
    const [data, setData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const token = 'vpZaARCJupnabbnfh2icp4'

    const fetchStockData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}${ticker}?token=${token}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Erro ao buscar os dados.");
            }

            if (!result.results || result.results.length === 0) {
                throw new Error("Ticker não encontrado.");
            }

            const stock = result.results[0];
            setData({
                symbol: stock.symbol,
                price: stock.regularMarketPrice,
                change: stock.regularMarketChange,
                changePercent: stock.regularMarketChangePercent,
            });
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocorreu um erro desconhecido");
            }
        } finally {
            setLoading(false);
        }
    }, [ticker, token]);

    useEffect(() => {
        fetchStockData();
    }, [fetchStockData]);

    return { data, loading, error, refetch: fetchStockData };
}
