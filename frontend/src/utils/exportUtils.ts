/* eslint-disable @typescript-eslint/no-explicit-any */

import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { Item, StockMovement } from "@/context/DataContext";
import { Branch } from "@/context/BranchContext";

// Helper function to format date for filenames
export const getFormattedDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(
    2,
    "0"
  )}_${String(date.getHours()).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}`;
};

// Generate Excel file from stock movements with profit analysis
export const generateExcelFile = async (
  stockMovements: StockMovement[],
  items: Item[],
  period: string,
  selectedItemId?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  branchInfo?: Branch
) => {
  try {
    // Create worksheet for stock movements
    const movementsData = stockMovements.map((movement) => ({
      "Item Name": movement.item?.name || "",
      "Movement Type":
        movement.type.charAt(0).toUpperCase() + movement.type.slice(1),
      "Quantity Change": movement.quantityChange,
      "Previous Quantity": movement.previousStock,
      "New Quantity": movement.newStock,
      Date: new Date(movement.createdAt).toLocaleDateString(),
      Time: new Date(movement.createdAt).toLocaleTimeString(),
      Notes: movement.reason || "",
    }));

    // Create worksheet for current stock levels with profit analysis
    const stockData = items.map((item) => ({
      "Item Name": item.name,
      Category: item.category || "Uncategorized",
      "Selling Price": item.sellingPrice,
      "Purchase Price": item.purchasePrice || "Not set",
      "Profit per Unit": item.profitPerUnit || 0,
      "Profit Margin %": item.profitMargin
        ? `${item.profitMargin.toFixed(2)}%`
        : "N/A",
      "Current Stock":
        item.stockQuantity !== undefined ? item.stockQuantity : "Not tracked",
      "Stock Value (Selling)":
        item.stockQuantity !== undefined
          ? item.sellingPrice * item.stockQuantity
          : 0,
      "Stock Value (Purchase)":
        item.stockQuantity !== undefined && item.purchasePrice
          ? item.purchasePrice * item.stockQuantity
          : 0,
      "Total Potential Profit":
        item.stockQuantity !== undefined && item.profitPerUnit
          ? item.profitPerUnit * item.stockQuantity
          : 0,
    }));

    // Create profit summary
    const totalStockValue = items.reduce((sum, item) => {
      if (item.stockQuantity !== undefined) {
        return sum + item.sellingPrice * item.stockQuantity;
      }
      return sum;
    }, 0);

    const totalPurchaseValue = items.reduce((sum, item) => {
      if (item.stockQuantity !== undefined && item.purchasePrice) {
        return sum + item.purchasePrice * item.stockQuantity;
      }
      return sum;
    }, 0);

    const totalPotentialProfit = totalStockValue - totalPurchaseValue;

    const summaryData = [
      { Metric: "Total Stock Value (Selling Price)", Value: totalStockValue },
      { Metric: "Total Purchase Value", Value: totalPurchaseValue },
      { Metric: "Total Potential Profit", Value: totalPotentialProfit },
      {
        Metric: "Average Profit Margin",
        Value:
          totalStockValue > 0
            ? `${((totalPotentialProfit / totalStockValue) * 100).toFixed(2)}%`
            : "0%",
      },
      { Metric: "Total Items", Value: items.length },
      {
        Metric: "Items with Profit Data",
        Value: items.filter((item) => item.purchasePrice).length,
      },
    ];

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    const movementsWs = XLSX.utils.json_to_sheet(movementsData);
    const stockWs = XLSX.utils.json_to_sheet(stockData);
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, summaryWs, "Profit Summary");
    XLSX.utils.book_append_sheet(wb, stockWs, "Current Stock");
    XLSX.utils.book_append_sheet(wb, movementsWs, "Stock Movements");

    // Generate buffer from workbook
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Create Blob from buffer
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    // Create filename
    const itemFilter = selectedItemId
      ? `-${items.find((i) => i.id === selectedItemId)?.name || "filtered"}`
      : "";
    const filename = `inventory-${period}${itemFilter}-${getFormattedDate()}.xlsx`;

    // Save the file
    saveAs(blob, filename);

    return filename;
  } catch (error) {
    console.error("Error generating Excel file:", error);
    throw error;
  }
};

// Generate PDF file from stock movements with profit analysis
export const generatePdfFile = async (
  stockMovements: StockMovement[],
  items: Item[],
  period: string,
  selectedItemId?: string,
  branchInfo?: Branch
) => {
  try {
    const doc = new jsPDF();
    const selectedItem = selectedItemId
      ? items.find((item) => item.id === selectedItemId)
      : null;
    const title = selectedItem
      ? `Inventory Report - ${selectedItem.name}`
      : "Inventory Report";

    doc.text(title, 14, 16);
    if (branchInfo) {
      doc.setFontSize(10);
      doc.text(`Branch: ${branchInfo.name} - ${branchInfo.address}`, 14, 22);
    }

    doc.setFontSize(12);
    doc.text("Current Stock with Profit Analysis", 14, 30);

    const stockTableColumn = [
      "Item",
      "Category",
      "Selling Price",
      "Purchase Price",
      "Profit/Unit",
      "Margin %",
      "Stock",
      "Total Profit",
    ];
    const stockTableRows = items.map((item) => [
      item.name,
      item.category || "N/A",
      `UGX ${item.sellingPrice.toLocaleString()}`,
      `UGX ${
        item.purchasePrice ? item.purchasePrice.toLocaleString() : "Not set"
      }`,
      `UGX ${(item.profitPerUnit || 0).toLocaleString()}`,
      item.profitMargin ? `${item.profitMargin.toFixed(1)}%` : "N/A",
      item.stockQuantity !== undefined ? item.stockQuantity : "Not tracked",
      `UGX ${
        item.stockQuantity !== undefined && item.profitPerUnit
          ? (item.profitPerUnit * item.stockQuantity).toLocaleString()
          : "0"
      }`,
    ]);

    (doc as any).autoTable({
      head: [stockTableColumn],
      body: stockTableRows,
      startY: 35,
    });

    doc.addPage();
    doc.text(`Stock Movements (${stockMovements.length})`, 14, 16);

    const movementTableColumn = [
      "Item",
      "Type",
      "Change",
      "Previous",
      "New",
      "Date & Time",
      "Notes",
    ];
    const movementTableRows = stockMovements.map((movement) => [
      movement.item?.name || "",
      movement.type.charAt(0).toUpperCase() + movement.type.slice(1),
      movement.quantityChange >= 0
        ? `+${movement.quantityChange}`
        : movement.quantityChange,
      movement.previousStock,
      movement.newStock,
      `${new Date(movement.createdAt).toLocaleDateString()} ${new Date(
        movement.createdAt
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      movement.reason || "",
    ]);

    (doc as any).autoTable({
      head: [movementTableColumn],
      body: movementTableRows,
      startY: 25,
    });

    const branchName = branchInfo
      ? `-${branchInfo.name.replace(/\s+/g, "_")}`
      : "";
    const itemFilter = selectedItemId
      ? `-${
          items.find((i) => i.id === selectedItemId)?.name.replace(/\s+/g, "_") ||
          "filtered"
        }`
      : "";
    const filename = `inventory${branchName}-${period}${itemFilter}-${getFormattedDate()}.pdf`;

    doc.save(filename);
    return filename;
  } catch (error) {
    console.error("Error generating PDF file:", error);
    throw error;
  }
};

