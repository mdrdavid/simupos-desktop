/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useBookkeeping } from '@/context/BookkeepingContext';

export function ExpenseCategoryList() {
  const { getExpenseCategories, initializeDefaultCategories, loading } = useBookkeeping();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getExpenseCategories();
        setCategories(data.data || data);
      } catch (error) {
        console.error("Failed to fetch expense categories", error);
      }
    };
    fetchCategories();
  }, [getExpenseCategories]);

  const handleInitialize = async () => {
      await initializeDefaultCategories();
      const data = await getExpenseCategories();
      setCategories(data.data || data);
  };

  if (loading && categories.length === 0) return <div>Loading categories...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleInitialize}>
          Initialize Default Categories
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(categories) && categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>{category.description}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">Edit</Button>
              </TableCell>
            </TableRow>
          ))}
          {(!categories || categories.length === 0) && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                No expense categories found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}