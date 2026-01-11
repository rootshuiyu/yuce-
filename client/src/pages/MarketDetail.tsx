import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Market {
  marketId: number;
  question: string;
  status: string;
  options: Array<{
    id: number;
    name: string;
    totalShares: number;
    totalCost: number;
  }>;
  closeTime: string;
  totalVolume: number;
  transactionCount: number;
  impliedProbability?: {
    yes: number;
    no: number;
  };
}

export default function MarketDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/markets/${id}`);
        const data = await response.json();
        if (data.success) {
          setMarket(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch market:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();
  }, [id]);

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回市场列表
        </Button>
        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-muted-foreground">市场不存在</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const yesProb = market.impliedProbability?.yes || 0.5;
  const noProb = market.impliedProbability?.no || 0.5;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回市场列表
      </Button>

      {/* Market Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{market.question}</CardTitle>
              <CardDescription>
                市场 ID: {market.marketId} • 状态: {market.status}
              </CardDescription>
            </div>
            <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
              {market.status}
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Probability Display */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              YES
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600 mb-2">
              {(yesProb * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${yesProb * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              NO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600 mb-2">
              {(noProb * 100).toFixed(1)}%
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all"
                style={{ width: `${noProb * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Stats */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>市场统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">交易量</p>
              <p className="text-2xl font-bold">${market.totalVolume.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">交易次数</p>
              <p className="text-2xl font-bold">{market.transactionCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">关闭时间</p>
              <p className="text-sm font-mono">
                {new Date(market.closeTime).toLocaleDateString("zh-CN")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Section */}
      <Card>
        <CardHeader>
          <CardTitle>交易</CardTitle>
          <CardDescription>选择你的预测</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              买入 YES
            </Button>
            <Button size="lg" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
              买入 NO
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
