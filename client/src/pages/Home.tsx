import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Market {
  marketId: number;
  question: string;
  status: string;
  marketType: string;
  category: string;
  closeTime: string;
  totalVolume: number;
  transactionCount: number;
  impliedProbability?: {
    yes: number;
    no: number;
  };
}

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/markets");
        const data = await response.json();
        if (data.success) {
          setMarkets(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch markets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  const filteredMarkets = markets.filter((market) => {
    const matchesSearch = market.question
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || market.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "trading":
        return "bg-blue-100 text-blue-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "finalized":
        return "bg-green-100 text-green-800";
      case "invalid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "trading":
        return "交易中";
      case "closed":
        return "已关闭";
      case "proposed":
        return "已提议";
      case "challenged":
        return "已挑战";
      case "finalized":
        return "已完成";
      case "invalid":
        return "无效";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            预测市场
          </h1>
          <p className="text-lg text-muted-foreground">
            参与全球事件预测，聚合集体智慧
          </p>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="搜索市场..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              className="flex-1"
            >
              全部
            </Button>
            <Button
              variant={filterStatus === "trading" ? "default" : "outline"}
              onClick={() => setFilterStatus("trading")}
              className="flex-1"
            >
              交易中
            </Button>
          </div>
        </div>

        {/* Markets Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMarkets.length === 0 ? (
          <Card>
            <CardContent className="pt-8 text-center">
              <p className="text-muted-foreground">未找到匹配的市场</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((market) => {
              const yesProb = market.impliedProbability?.yes || 0.5;
              const noProb = market.impliedProbability?.no || 0.5;

              return (
                <Link key={market.marketId} href={`/market/${market.marketId}`}>
                  <a className="block group">
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                            {market.question}
                          </CardTitle>
                          <Badge className={getStatusColor(market.status)}>
                            {getStatusLabel(market.status)}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          {new Date(market.closeTime).toLocaleDateString(
                            "zh-CN"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Probability Display */}
                        <div className="space-y-3 mb-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                YES
                              </div>
                              <span className="text-sm font-bold text-green-600">
                                {(yesProb * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${yesProb * 100}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <TrendingDown className="w-4 h-4 text-red-600" />
                                NO
                              </div>
                              <span className="text-sm font-bold text-red-600">
                                {(noProb * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-red-600 h-2 rounded-full transition-all"
                                style={{ width: `${noProb * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>交易量: ${market.totalVolume.toLocaleString()}</span>
                          <span>{market.transactionCount} 笔交易</span>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
