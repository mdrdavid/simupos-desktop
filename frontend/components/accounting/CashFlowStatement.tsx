"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const cashFlowData = {
  operatingActivities: {
    netCashFlow: 12000,
    items: [
      { description: "Cash from customers", amount: 20000 },
      { description: "Cash paid to suppliers", amount: -8000 },
    ],
  },
  investingActivities: {
    netCashFlow: -5000,
    items: [{ description: "Purchase of equipment", amount: -5000 }],
  },
  financingActivities: {
    netCashFlow: 2000,
    items: [{ description: "Loan from bank", amount: 2000 }],
  },
  netCashFlow: 9000,
  beginningCash: 10000,
  endingCash: 19000,
};

const chartData = [
  { month: "Jan", inflows: 10000, outflows: 5000 },
  { month: "Feb", inflows: 12000, outflows: 6000 },
  { month: "Mar", inflows: 15000, outflows: 8000 },
];

export function CashFlowStatement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="inflows" name="Cash Inflows" fill="#4ade80" />
              <Bar dataKey="outflows" name="Cash Outflows" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rest of your cards remain the same */}
      <Card>
        <CardHeader>
          <CardTitle>Operating Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {cashFlowData.operatingActivities.items.map((item, index) => (
            <div key={index} className="flex justify-between py-1">
              <span className="text-sm">{item.description}</span>
              <span
                className={`text-sm ${item.amount >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                ${Math.abs(item.amount).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-2 pt-2 border-t">
            <span>Net Cash from Operating Activities</span>
            <span className="text-green-600">
              ${cashFlowData.operatingActivities.netCashFlow.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investing Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {cashFlowData.investingActivities.items.map((item, index) => (
            <div key={index} className="flex justify-between py-1">
              <span className="text-sm">{item.description}</span>
              <span className="text-red-600">
                ${Math.abs(item.amount).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-2 pt-2 border-t">
            <span>Net Cash from Investing Activities</span>
            <span className="text-red-600">
              $
              {Math.abs(
                cashFlowData.investingActivities.netCashFlow
              ).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financing Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {cashFlowData.financingActivities.items.map((item, index) => (
            <div key={index} className="flex justify-between py-1">
              <span className="text-sm">{item.description}</span>
              <span className="text-green-600">
                ${Math.abs(item.amount).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-2 pt-2 border-t">
            <span>Net Cash from Financing Activities</span>
            <span className="text-green-600">
              ${cashFlowData.financingActivities.netCashFlow.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Beginning Cash Balance</span>
            <span>${cashFlowData.beginningCash.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Net Cash Flow</span>
            <span className="text-green-600">
              ${cashFlowData.netCashFlow.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Ending Cash Balance</span>
            <span className="text-blue-600">
              ${cashFlowData.endingCash.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
