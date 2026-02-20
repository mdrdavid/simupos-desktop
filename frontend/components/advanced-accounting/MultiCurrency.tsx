/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdvancedAccounting } from "@/context/AdvancedAccountingContext";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

const mockCurrencies = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "UGX", name: "Ugandan Shilling" },
];

const mockExchangeRates = [
  { currency: "USD", rate: 3750, asOf: new Date().toLocaleDateString() },
  { currency: "EUR", rate: 4100, asOf: new Date().toLocaleDateString() },
];

export default function MultiCurrency() {
  const { setBaseCurrency, updateExchangeRate, loading } = useAdvancedAccounting();
  const [currencyCode, setCurrencyCode] = useState("");
  const [rate, setRate] = useState("");

  const handleSetBase = async () => {
    if (!currencyCode) return;
    try {
        await setBaseCurrency(currencyCode);
        toast({ title: "Base Currency Set", description: `Base currency updated to ${currencyCode}` });
    } catch (error) {
        toast({ title: "Error", description: "Failed to set base currency", variant: "destructive" });
    }
  };

  const handleUpdateRate = async () => {
    if (!currencyCode || !rate) return;
    try {
        await updateExchangeRate({ currencyCode, rate: Number(rate) });
        toast({ title: "Exchange Rate Updated", description: `Rate for ${currencyCode} updated to ${rate}` });
    } catch (error) {
        toast({ title: "Error", description: "Failed to update exchange rate", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Currency Support</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Record Transaction with Currency</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
              <Input id="amount" type="number" placeholder="Enter amount" />
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {mockCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="self-end">
              <Button>Record Transaction</Button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Exchange Rates (vs. UGX)</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Exchange Rate</TableHead>
                <TableHead>As Of</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockExchangeRates.map((rate) => (
                <TableRow key={rate.currency}>
                  <TableCell>{rate.currency}</TableCell>
                  <TableCell>{rate.rate.toLocaleString()}</TableCell>
                  <TableCell>{rate.asOf}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}