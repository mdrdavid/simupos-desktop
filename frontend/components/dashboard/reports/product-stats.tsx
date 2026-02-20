import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Item } from '@/context/DataContext';

interface TopPerformingProduct {
  name: string;
  sales: number;
  profit: number;
}

interface ProductStatsProps {
  totalProducts: number;
  lowStockItems: Item[];
  topPerformingProducts: TopPerformingProduct[];
}

const ProductStats: React.FC<ProductStatsProps> = ({ totalProducts, lowStockItems, topPerformingProducts }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <h3 className="text-lg font-semibold">Total Products</h3>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Low Stock Items</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Top 5 Performing Products</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerformingProducts.map((product) => (
                <TableRow key={product.name}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>UGX {product.sales.toLocaleString()}</TableCell>
                  <TableCell>UGX {product.profit.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductStats;
