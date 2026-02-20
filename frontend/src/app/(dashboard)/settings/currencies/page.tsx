/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Globe,
  Plus,
  Edit,
  Star,
  RefreshCw,
  Calculator,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type Currency,
  type ConversionResult,
  createCurrencyApi,
} from "@/src/data/api/currencyApi";
import { useAuth } from "@/context/AuthContext";

export default function CurrencySettingsPage() {
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "currencies" | "converter" | "reports"
  >("currencies");

  // Currency form state
  const [currencyForm, setCurrencyForm] = useState({
    code: "",
    name: "",
    symbol: "",
    exchangeRate: "",
    decimalPlaces: "2",
    country: "",
  });

  // Conversion form state
  const [conversionForm, setConversionForm] = useState({
    amount: "",
    fromCurrency: "",
    toCurrency: "",
  });
  const [conversionResult, setConversionResult] =
    useState<ConversionResult | null>(null);

  // Bulk update state
  const [bulkRates, setBulkRates] = useState<
    Array<{ code: string; rate: string }>
  >([]);

  // Create the API instance with getAuthHeaders
  const currencyApi = createCurrencyApi(getAuthHeaders);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const data = await currencyApi.getActiveCurrencies();
      setCurrencies(data);

      // Initialize bulk rates
      setBulkRates(
        data.map((currency: Currency) => ({
          code: currency.code,
          rate: currency.exchangeRate.toString(),
        }))
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load currencies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setBaseCurrency = async (currencyCode: string) => {
    try {
      await currencyApi.setBaseCurrency(currencyCode);
      toast({
        title: "Success",
        description: "Base currency updated successfully",
      });
      loadCurrencies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set base currency",
        variant: "destructive",
      });
    }
  };

  const updateExchangeRate = async (currencyCode: string, rate: number) => {
    try {
      await currencyApi.updateExchangeRate(
        currencyCode,
        rate,
        undefined,
        "manual"
      );
      toast({
        title: "Success",
        description: "Exchange rate updated successfully",
      });
      loadCurrencies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update exchange rate",
        variant: "destructive",
      });
    }
  };

  const bulkUpdateRates = async () => {
    try {
      const rates = bulkRates
        .filter((rate) => rate.rate && parseFloat(rate.rate) > 0)
        .map((rate) => ({
          currencyCode: rate.code,
          rate: parseFloat(rate.rate),
        }));

      if (rates.length === 0) {
        toast({
          title: "Warning",
          description: "No valid rates to update",
          variant: "destructive",
        });
        return;
      }

      await currencyApi.bulkUpdateRates(rates);
      toast({
        title: "Success",
        description: "Exchange rates updated successfully",
      });
      loadCurrencies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update exchange rates",
        variant: "destructive",
      });
    }
  };

  const convertAmount = async () => {
    if (
      !conversionForm.amount ||
      !conversionForm.fromCurrency ||
      !conversionForm.toCurrency
    ) {
      toast({
        title: "Error",
        description: "Please fill all conversion fields",
        variant: "destructive",
      });
      return;
    }

    setConverting(true);
    try {
      const result = await currencyApi.convertAmount({
        amount: parseFloat(conversionForm.amount),
        fromCurrency: conversionForm.fromCurrency,
        toCurrency: conversionForm.toCurrency,
      });
      setConversionResult(result);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to convert amount",
        variant: "destructive",
      });
    } finally {
      setConverting(false);
    }
  };

  const addNewCurrency = async () => {
    if (
      !currencyForm.code ||
      !currencyForm.name ||
      !currencyForm.symbol ||
      !currencyForm.exchangeRate
    ) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await currencyApi.addCurrency({
        code: currencyForm.code,
        name: currencyForm.name,
        symbol: currencyForm.symbol,
        exchangeRate: parseFloat(currencyForm.exchangeRate),
        decimalPlaces: parseInt(currencyForm.decimalPlaces),
        country: currencyForm.country || undefined,
        status: "active",
        isBaseCurrency: false,
      });

      toast({
        title: "Success",
        description: "Currency added successfully",
      });

      setCurrencyForm({
        code: "",
        name: "",
        symbol: "",
        exchangeRate: "",
        decimalPlaces: "2",
        country: "",
      });
      loadCurrencies();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add currency",
        variant: "destructive",
      });
    }
  };

  const handleBulkRateChange = (currencyCode: string, newRate: string) => {
    const newRates = bulkRates.map((rate) =>
      rate.code === currencyCode ? { ...rate, rate: newRate } : rate
    );
    setBulkRates(newRates);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const baseCurrency = currencies.find((c) => c.isBaseCurrency);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/settings")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Globe className="h-8 w-8 text-teal-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Currency Settings
          </h1>
          <p className="text-gray-600">
            Manage currencies, exchange rates, and conversions
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === "currencies" ? "default" : "ghost"}
          onClick={() => setActiveTab("currencies")}
          className="flex-1"
        >
          <Globe className="h-4 w-4 mr-2" />
          Currencies
        </Button>
        <Button
          variant={activeTab === "converter" ? "default" : "ghost"}
          onClick={() => setActiveTab("converter")}
          className="flex-1"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Converter
        </Button>
        <Button
          variant={activeTab === "reports" ? "default" : "ghost"}
          onClick={() => setActiveTab("reports")}
          className="flex-1"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Reports
        </Button>
      </div>

      {/* Currencies Tab */}
      {activeTab === "currencies" && (
        <div className="space-y-6">
          {/* Base Currency Info */}
          {baseCurrency && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Base Currency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      {baseCurrency.name} ({baseCurrency.code})
                    </p>
                    <p className="text-gray-600">
                      All conversions are calculated relative to this currency
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    Exchange Rate: 1.00
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add New Currency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Currency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currencyCode">Currency Code *</Label>
                  <Input
                    id="currencyCode"
                    value={currencyForm.code}
                    onChange={(e) =>
                      setCurrencyForm((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="USD, EUR, etc."
                    maxLength={3}
                  />
                </div>
                <div>
                  <Label htmlFor="currencyName">Currency Name *</Label>
                  <Input
                    id="currencyName"
                    value={currencyForm.name}
                    onChange={(e) =>
                      setCurrencyForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="US Dollar, Euro, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="currencySymbol">Symbol *</Label>
                  <Input
                    id="currencySymbol"
                    value={currencyForm.symbol}
                    onChange={(e) =>
                      setCurrencyForm((prev) => ({
                        ...prev,
                        symbol: e.target.value,
                      }))
                    }
                    placeholder="$, €, £, etc."
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="exchangeRate">Exchange Rate *</Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    step="0.000001"
                    value={currencyForm.exchangeRate}
                    onChange={(e) =>
                      setCurrencyForm((prev) => ({
                        ...prev,
                        exchangeRate: e.target.value,
                      }))
                    }
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <Label htmlFor="decimalPlaces">Decimal Places</Label>
                  <Input
                    id="decimalPlaces"
                    type="number"
                    value={currencyForm.decimalPlaces}
                    onChange={(e) =>
                      setCurrencyForm((prev) => ({
                        ...prev,
                        decimalPlaces: e.target.value,
                      }))
                    }
                    placeholder="2"
                    min="0"
                    max="6"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country (Optional)</Label>
                  <Input
                    id="country"
                    value={currencyForm.country}
                    onChange={(e) =>
                      setCurrencyForm((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    placeholder="United States, etc."
                  />
                </div>
              </div>
              <Button onClick={addNewCurrency} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Currency
              </Button>
            </CardContent>
          </Card>

          {/* Currencies Table */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Currencies</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Exchange Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.map((currency) => (
                    <TableRow key={currency.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{currency.name}</span>
                          {currency.isBaseCurrency && (
                            <Badge variant="secondary" className="text-xs">
                              Base
                            </Badge>
                          )}
                        </div>
                        {currency.country && (
                          <p className="text-sm text-gray-600">
                            {currency.country}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="font-mono">
                        {currency.code}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.000001"
                            value={currency.exchangeRate}
                            onChange={(e) =>
                              handleBulkRateChange(
                                currency.code,
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              updateExchangeRate(
                                currency.code,
                                currency.exchangeRate
                              )
                            }
                          >
                            Update
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            currency.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {currency.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!currency.isBaseCurrency && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setBaseCurrency(currency.code)}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Set Base
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Bulk Update */}
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Bulk Update Exchange Rates</h3>
                  <Button onClick={bulkUpdateRates}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update All Rates
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Update multiple exchange rates at once. Changes will be
                  applied to all selected currencies.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Currency Converter Tab */}
      {activeTab === "converter" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Currency Converter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={conversionForm.amount}
                    onChange={(e) =>
                      setConversionForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="fromCurrency">From Currency</Label>
                  <Select
                    value={conversionForm.fromCurrency}
                    onValueChange={(value) =>
                      setConversionForm((prev) => ({
                        ...prev,
                        fromCurrency: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="toCurrency">To Currency</Label>
                  <Select
                    value={conversionForm.toCurrency}
                    onValueChange={(value) =>
                      setConversionForm((prev) => ({
                        ...prev,
                        toCurrency: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={convertAmount}
                disabled={converting}
                className="w-full md:w-auto"
              >
                {converting ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Calculator className="h-4 w-4 mr-2" />
                )}
                Convert
              </Button>

              {conversionResult && (
                <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <h3 className="font-semibold text-teal-900 mb-2">
                    Conversion Result
                  </h3>
                  <div className="text-2xl font-bold text-teal-800">
                    {conversionForm.amount} {conversionForm.fromCurrency} ={" "}
                    {conversionResult.amount.toFixed(2)}{" "}
                    {conversionForm.toCurrency}
                  </div>
                  <p className="text-sm text-teal-700 mt-2">
                    Exchange Rate: 1 {conversionForm.fromCurrency} ={" "}
                    {conversionResult.rate.toFixed(6)}{" "}
                    {conversionForm.toCurrency}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Conversion Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Common Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currencies.slice(0, 6).map(
                  (currency) =>
                    currency.code !== baseCurrency?.code && (
                      <Button
                        key={currency.code}
                        variant="outline"
                        onClick={() => {
                          setConversionForm({
                            amount: "100",
                            fromCurrency: baseCurrency?.code || "",
                            toCurrency: currency.code,
                          });
                          setActiveTab("converter");
                        }}
                        className="h-auto p-4"
                      >
                        <div className="text-left">
                          <div className="font-semibold">
                            100 {baseCurrency?.code}
                          </div>
                          <div className="text-2xl font-bold text-teal-600">
                            {(100 * currency.exchangeRate).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {currency.code}
                          </div>
                        </div>
                      </Button>
                    )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Exchange Rate History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currencies.map((currency) => (
                  <div key={currency.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">
                        {currency.name} ({currency.code})
                      </h3>
                      <Badge variant="secondary">
                        Current: {currency.exchangeRate}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Last updated: {new Date().toLocaleDateString()}
                    </p>
                    {/* You can add a chart here for historical rates */}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
