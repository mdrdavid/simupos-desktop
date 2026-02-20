"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import {
  useTransactionAnalysis,
  Period,
  UserAnalysis,
} from "@/context/TransactionAnalysisContext";
import { useMemo } from "react";
import { useBranch } from "@/context/BranchContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const TransactionAnalysisScreen = () => {
  const { currentBranch } = useBranch();
  const { analysis, loading, error, getAnalysis } = useTransactionAnalysis();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("daily");
  const [selectedUser, setSelectedUser] = useState<UserAnalysis | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const periods: { key: Period; label: string; icon: string }[] = [
    { key: "daily", label: "Daily", icon: "today-outline" },
    { key: "weekly", label: "Weekly", icon: "calendar-outline" },
    { key: "monthly", label: "Monthly", icon: "calendar" },
    { key: "quarterly", label: "Quarterly", icon: "stats-chart-outline" },
    { key: "yearly", label: "Yearly", icon: "analytics-outline" },
  ];

  useEffect(() => {
    if (currentBranch) {
      getAnalysis(currentBranch.id, selectedPeriod);
    }
    setSelectedUser(null);
  }, [currentBranch, selectedPeriod, getAnalysis]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (currentBranch) {
      await getAnalysis(currentBranch.id, selectedPeriod);
    }
    setSelectedUser(null);
    setRefreshing(false);
  };

  const getPieChartData = (data: Record<string, number> | undefined) => {
    if (!data) return [];
    const colors = ["#41A5A5", "#FF6B6B", "#FFD166", "#06D6A0", "#118AB2"];
    let colorIndex = 0;
    return Object.entries(data).map(([method, count]) => ({
      name: method,
      value: count,
      fill: colors[colorIndex++ % colors.length],
    }));
  };

  const renderItemSold = (item: {
    name: string;
    quantity: number;
    amount: number;
  }) => (
    <Card key={item.name} className="mb-2">
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <p className="font-semibold">{item.name}</p>
          <p className="text-sm text-gray-500">
            Quantity Sold: {item.quantity}
          </p>
        </div>
        <p className="font-bold text-primary">{formatCurrency(item.amount)}</p>
      </CardContent>
    </Card>
  );

  const UserAnalysisCard = ({ item }: { item: UserAnalysis }) => (
    <Card
      className="mb-2 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => setSelectedUser(item)}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-3 bg-gray-100 rounded-full mr-4">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-bold text-lg">{item.userName}</p>
            <p className="text-sm text-gray-500">
              {item.totalTransactions} Transactions •{" "}
              {formatCurrency(item.totalRevenue)}
            </p>
          </div>
        </div>
        <ChevronRight className="h-6 w-6 text-gray-400" />
      </CardContent>
    </Card>
  );

  const handleBackPress = () => {
    if (selectedUser) {
      setSelectedUser(null);
    }
  };

  const aggregatedTopItems = useMemo(() => {
    if (!analysis?.userAnalysis) return [];
    const itemMap: Record<string, { name: string; quantity: number; amount: number }> = {};

    Object.values(analysis.userAnalysis).forEach(user => {
      user.itemsSold.forEach(item => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, quantity: 0, amount: 0 };
        }
        itemMap[item.name].quantity += item.quantity;
        itemMap[item.name].amount += item.amount;
      });
    });

    return Object.values(itemMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [analysis]);

  const renderUserListView = () => {
    const userAnalysisData = analysis?.userAnalysis
      ? Object.values(analysis.userAnalysis)
      : [];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {periods.map((period) => (
              <Button
                key={period.key}
                variant={selectedPeriod === period.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.key)}
              >
                {period.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Global Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-brand-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analysis?.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground">All users combined</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-brand-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysis?.totalTransactions || 0}</div>
              <p className="text-xs text-muted-foreground">Volume for {selectedPeriod} period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Trans. Value</CardTitle>
              <CreditCard className="h-4 w-4 text-brand-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency((analysis?.totalRevenue || 0) / (analysis?.totalTransactions || 1))}
              </div>
              <p className="text-xs text-muted-foreground">Revenue per ticket</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-brand-primary" />
                Payment Method Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {analysis?.paymentMethodAnalysis && Object.keys(analysis.paymentMethodAnalysis).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPieChartData(analysis.paymentMethodAnalysis)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {getPieChartData(analysis.paymentMethodAnalysis).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No payment data</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand-primary" />
                Overall Top Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aggregatedTopItems.length > 0 ? aggregatedTopItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} units sold</p>
                    </div>
                    <p className="font-bold text-brand-primary">{formatCurrency(item.amount)}</p>
                  </div>
                )) : (
                  <div className="text-center py-12 text-muted-foreground">No items sold</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-primary" />
                Revenue by User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                {userAnalysisData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userAnalysisData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="userName" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toString()} />
                      <Tooltip formatter={(val: number) => [formatCurrency(val), "Revenue"]} />
                      <Bar dataKey="totalRevenue" fill="#41A5A5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No user data</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-primary" />
                Transactions by User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                {userAnalysisData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userAnalysisData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="userName" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip label="userName" />
                      <Bar dataKey="totalTransactions" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No user data</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-primary" />
              Detailed User Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userAnalysisData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No User Activity</h3>
                <p className="text-gray-600 text-center">There is no transaction data for any user in this period.</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {userAnalysisData.map((user) => (
                  <UserAnalysisCard key={user.userId} item={user} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDetailView = () => {
    if (!selectedUser) return null;

    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={handleBackPress}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(selectedUser.totalRevenue)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {selectedUser.totalTransactions}
              </p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getPieChartData(selectedUser.paymentMethodAnalysis)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {getPieChartData(selectedUser.paymentMethodAnalysis).map(
                    (entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    )
                  )}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUser.itemsSold.length > 0 ? (
              selectedUser.itemsSold.map((item) => renderItemSold(item))
            ) : (
              <p>No items sold by this user.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {selectedUser ? selectedUser.userName : "Transaction Analysis"}
      </h1>

      {loading && !refreshing && !analysis && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-lg">Fetching Analysis...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg text-red-600">{error}</p>
          <Button onClick={handleRefresh} className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      {!loading &&
        !error &&
        analysis &&
        (selectedUser ? renderDetailView() : renderUserListView())}
    </div>
  );
};

export default TransactionAnalysisScreen;
