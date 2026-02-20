/* eslint-disable @typescript-eslint/no-unused-vars */
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

export const generateSalesLogPDF = (
  transactions: any[],
  month: string,
  business: any,
  branch: any
) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Sales Log Book", margin, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Month: ${month}`, margin, 28);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, 33);

    // Business Details
    if (business) {
      doc.setFont("helvetica", "bold");
      doc.text(business.name || "Business Name", pageWidth - margin, 20, {
        align: "right",
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      let busY = 25;
      if (branch?.name) {
        doc.text(`Branch: ${branch.name}`, pageWidth - margin, busY, {
          align: "right",
        });
        busY += 4;
      }
      if (business.phone) {
        doc.text(business.phone, pageWidth - margin, busY, { align: "right" });
        busY += 4;
      }
      if (business.address) {
        doc.text(business.address, pageWidth - margin, busY, {
          align: "right",
        });
      }
    }

    // Prepare table data
    const tableColumns = [
      "Date",
      "Item",
      "Qty",
      "Price",
      "Total",
      "Method",
      "Seller",
    ];
    const tableRows: any[] = [];
    let grandTotalQty = 0;
    let grandTotalRevenue = 0;

    transactions.forEach((tx) => {
      const date = new Date(tx.timestamp).toLocaleDateString();
      const seller =
        tx.user?.firstName ||
        tx.userName ||
        tx.seller_name ||
        tx.seller ||
        "N/A";
      const txAmount = Number(
        tx.amount ||
          tx.total ||
          tx.totalAmount ||
          tx.total_amount ||
          tx.grandTotal ||
          0
      );

      if (tx.items && tx.items.length > 0) {
        tx.items.forEach((item: any, index: number) => {
          const qty = Number(item.quantity || item.qty || 0);
          const price = Number(
            item.price ||
              item.sellingPrice ||
              item.unitPrice ||
              item.selling_price ||
              item.unit_price ||
              item.amount ||
              item.rate ||
              0
          );
          const total = qty * price;

          tableRows.push([
            index === 0 ? date : "",
            item.name || item.itemName || "Unnamed Item",
            qty,
            price.toLocaleString(),
            total > 0 ? total.toLocaleString() : price.toLocaleString(),
            index === 0
              ? tx.paymentMethod?.replace("_", " ").toUpperCase()
              : "",
            index === 0 ? seller : "",
          ]);

          grandTotalQty += qty;
        });
        grandTotalRevenue += txAmount;
      } else {
        // Handle custom amount or legacy transactions
        tableRows.push([
          date,
          tx.customItemName || tx.itemName || "General Sale",
          1,
          txAmount.toLocaleString(),
          txAmount.toLocaleString(),
          tx.paymentMethod?.replace("_", " ").toUpperCase(),
          seller,
        ]);
        grandTotalQty += 1;
        grandTotalRevenue += txAmount;
      }
    });

    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 45,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [65, 165, 165] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Check for page overflow
    const footerHeight = 30;
    if (finalY + footerHeight > doc.internal.pageSize.getHeight()) {
      doc.addPage();
    }

    // Footer Summary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const summaryY =
      finalY + footerHeight > doc.internal.pageSize.getHeight() ? 20 : finalY;
    doc.text(`Total Transactions: ${transactions.length}`, margin, summaryY);
    doc.text(`Total Quantity: ${grandTotalQty}`, margin, summaryY + 6);
    doc.text(
      `Total Revenue: UGX ${grandTotalRevenue.toLocaleString()}`,
      margin,
      summaryY + 12
    );

    // Bottom Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150);
      doc.text(
        "Printed from SimuPOS",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    doc.save(`Sales_Log_${month.replace(/\s+/g, "_")}.pdf`);
  } catch (error) {
    console.error("Error generating Sales Log PDF:", error);
  }
};

export const generateSalesPipelineReportPDF = (
  deals: any[],
  period: string,
  business: any
) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Logo (Top Right)
    if (business?.logo) {
      try {
        doc.addImage(business.logo, "PNG", pageWidth - 35, 15, 15, 15);
      } catch (e) {
        doc.setFillColor(65, 165, 165);
        doc.triangle(pageWidth - 30, 15, pageWidth - 20, 30, pageWidth - 40, 30, "F");
      }
    } else {
      doc.setFillColor(65, 165, 165);
      doc.triangle(pageWidth - 30, 15, pageWidth - 20, 30, pageWidth - 40, 30, "F");
    }

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Sales Pipeline Report", margin, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${period}`, margin, 35);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 40);

    // Business Details
    if (business) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(business.name || "Business Name", margin, 55);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      let busY = 60;
      if (business.address) {
        doc.text(business.address, margin, busY);
        busY += 5;
      }
      if (business.phone) {
        doc.text(business.phone, margin, busY);
        busY += 5;
      }
    }

    let currentY = 75;

    // Summary Statistics
    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    const weightedValue = deals.reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Pipeline Summary", margin, currentY);

    currentY += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Active Deals: ${totalDeals}`, margin, currentY);
    doc.text(`Total Pipeline Value: UGX ${totalValue.toLocaleString()}`, 100, currentY);

    currentY += 7;
    doc.text(`Weighted Pipeline Value: UGX ${weightedValue.toLocaleString()}`, margin, currentY);

    currentY += 15;

    // Table of Deals
    const tableColumns = ["Deal Title", "Customer", "Stage", "Probability", "Expected Close", "Value"];
    const tableRows = deals.map((deal: any) => [
      deal.title,
      deal.customerName,
      deal.stage.replace(/_/g, " "),
      `${deal.probability}%`,
      deal.expectedCloseDate,
      `UGX ${deal.value.toLocaleString()}`
    ]);

    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: currentY,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [65, 165, 165] }, // Brand teal
      columnStyles: {
        5: { halign: "right" }
      }
    });

    const filename = `Sales_Pipeline_Report_${getFormattedDate()}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error("Error generating sales pipeline PDF:", error);
  }
};

export const generateFinancialReportPDF = (
  type: "Income" | "Expense" | "Income Status",
  data: any[],
  period: string,
  summary: { totalIncome?: number; totalExpense?: number; balance?: number },
  business?: any
) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Logo/Triangle (consistent with other reports)
    doc.setFillColor(65, 165, 165); // Brand teal
    doc.triangle(pageWidth - 30, 15, pageWidth - 20, 30, pageWidth - 40, 30, "F");

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(`${type} Report`, margin, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${period}`, margin, 35);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 40);

    // Business Details
    if (business) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(business.name || "Business Name", margin, 55);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      let busY = 60;
      if (business.address) {
        doc.text(business.address, margin, busY);
        busY += 5;
      }
      if (business.phone) {
        doc.text(business.phone, margin, busY);
        busY += 5;
      }
    }

    let currentY = business ? 75 : 50;

    // Summary Section
    doc.setFont("helvetica", "bold");
    if (summary.totalIncome !== undefined) {
      doc.text(`Total Income: UGX ${summary.totalIncome.toLocaleString()}`, margin, currentY);
      currentY += 7;
    }
    if (summary.totalExpense !== undefined) {
      doc.text(`Total Expense: UGX ${summary.totalExpense.toLocaleString()}`, margin, currentY);
      currentY += 7;
    }
    if (summary.balance !== undefined) {
      doc.text(`Net Balance: UGX ${summary.balance.toLocaleString()}`, margin, currentY);
      currentY += 7;
    }

    currentY += 5;

    const tableColumns = type === "Income"
      ? ["Date", "Source", "Category", "Method", "Amount"]
      : type === "Expense"
      ? ["Date", "Recipient", "Category", "Method", "Amount"]
      : ["Date", "Type", "Category", "Description", "Amount"];

    const tableRows = data.map((item: any) => {
      if (type === "Income") {
        return [
          new Date(item.date).toLocaleDateString(),
          item.source,
          item.category,
          item.paymentMethod,
          `UGX ${item.amount.toLocaleString()}`
        ];
      } else if (type === "Expense") {
        return [
          new Date(item.date).toLocaleDateString(),
          item.recipient,
          item.category,
          item.paymentMethod,
          `UGX ${item.amount.toLocaleString()}`
        ];
      } else {
        const isIncome = 'source' in item;
        return [
          new Date(item.date).toLocaleDateString(),
          isIncome ? "Income" : "Expense",
          item.category,
          item.description,
          `${isIncome ? "+" : "-"} UGX ${item.amount.toLocaleString()}`
        ];
      }
    });

    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: currentY,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [65, 165, 165] }
    });

    doc.save(`${type.replace(/\s+/g, "_")}_Report_${getFormattedDate()}.pdf`);
  } catch (error) {
    console.error("Error generating financial PDF:", error);
  }
};

export const generateFinancialReportExcel = (
  type: "Income" | "Expense" | "Income Status",
  data: any[],
  period: string
) => {
  try {
    const wsData = data.map((item: any) => {
      if (type === "Income") {
        return {
          Date: new Date(item.date).toLocaleDateString(),
          Source: item.source,
          Category: item.category,
          "Payment Method": item.paymentMethod,
          Description: item.description,
          Amount: item.amount
        };
      } else if (type === "Expense") {
        return {
          Date: new Date(item.date).toLocaleDateString(),
          Recipient: item.recipient,
          Category: item.category,
          "Payment Method": item.paymentMethod,
          Description: item.description,
          Amount: item.amount
        };
      } else {
        const isIncome = 'source' in item;
        return {
          Date: new Date(item.date).toLocaleDateString(),
          Type: isIncome ? "Income" : "Expense",
          Category: item.category,
          Description: item.description,
          Amount: isIncome ? item.amount : -item.amount
        };
      }
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Report");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    saveAs(blob, `${type.replace(/\s+/g, "_")}_Report_${getFormattedDate()}.xlsx`);
  } catch (error) {
    console.error("Error generating financial Excel:", error);
  }
};

export const generateInvoicePDF = (invoice: any, business: any) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Logo (Top Right)
    if (business?.logo) {
      try {
        doc.addImage(business.logo, "PNG", pageWidth - 35, 15, 15, 15);
      } catch (e) {
        // Generic triangle logo like Vercel if logo fails
        doc.setFillColor(0, 0, 0);
        doc.triangle(pageWidth - 30, 15, pageWidth - 20, 30, pageWidth - 40, 30, "F");
      }
    } else {
      // Vercel-style Triangle
      doc.setFillColor(0, 0, 0);
      doc.triangle(pageWidth - 30, 15, pageWidth - 20, 30, pageWidth - 40, 30, "F");
    }

    // Title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice", margin, 25);

    // Metadata
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Invoice number", margin, 40);
    doc.text("Date of issue", margin, 48);
    doc.text("Date due", margin, 56);

    doc.setTextColor(0, 0, 0);
    doc.text(invoice.invoiceNumber, margin + 35, 40);
    doc.text(new Date(invoice.issueDate).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' }), margin + 35, 48);
    doc.text(new Date(invoice.dueDate).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' }), margin + 35, 56);

    // Business & Customer Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(business?.name || "Business Name", margin, 75);
    doc.text("Bill to", 100, 75);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);

    // Business address (handle multiple lines)
    const businessAddrLines = doc.splitTextToSize(business?.address || "", 70);
    doc.text(businessAddrLines, margin, 82);
    let nextY = 82 + (businessAddrLines.length * 5);
    if (business?.phone) {
      doc.text(business?.phone, margin, nextY);
      nextY += 5;
    }
    if (business?.email) {
      doc.text(business?.email, margin, nextY);
    }

    // Customer details
    doc.setTextColor(0, 0, 0);
    doc.text(invoice.customerDetails.name, 100, 82);
    doc.setTextColor(100, 100, 100);
    const customerAddrLines = doc.splitTextToSize(`${invoice.customerDetails.contact}${invoice.customerDetails.location ? '\n' + invoice.customerDetails.location : ''}`, 70);
    doc.text(customerAddrLines, 100, 88);

    // Summary Line
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const amountDueText = `UGX ${invoice.totalAmount.toLocaleString()} due ${new Date(invoice.dueDate).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}`;
    doc.text(amountDueText, margin, 125);

    // Table
    const tableColumns = ["Description", "Qty", "Unit price", "Amount"];
    const tableRows = invoice.lineItems.map((item: any) => [
      item.description,
      item.quantity.toString(),
      `UGX ${item.unitPrice.toLocaleString()}`,
      `UGX ${(item.quantity * item.unitPrice).toLocaleString()}`,
    ]);

    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 140,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: { top: 5, bottom: 5, left: 0, right: 0 } },
      headStyles: {
        fontStyle: "normal",
        textColor: [100, 100, 100],
        borderBottom: { lineWidth: 0.5, lineColor: [0, 0, 0] }
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      margin: { left: margin, right: margin },
    });

    // Totals
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);

    const totalsLabelX = 140;
    const totalsValueX = pageWidth - margin;

    doc.setTextColor(100, 100, 100);
    doc.text("Subtotal", totalsLabelX, finalY);
    doc.setTextColor(0, 0, 0);
    doc.text(`UGX ${invoice.subTotal.toLocaleString()}`, totalsValueX, finalY, { align: "right" });

    if (invoice.taxAmount > 0) {
      finalY += 8;
      doc.setTextColor(100, 100, 100);
      doc.text(`Tax (${invoice.taxRate * 100}%)`, totalsLabelX, finalY);
      doc.setTextColor(0, 0, 0);
      doc.text(`UGX ${invoice.taxAmount.toLocaleString()}`, totalsValueX, finalY, { align: "right" });
    }

    finalY += 8;
    doc.setTextColor(100, 100, 100);
    doc.text("Total", totalsLabelX, finalY);
    doc.setTextColor(0, 0, 0);
    doc.text(`UGX ${invoice.totalAmount.toLocaleString()}`, totalsValueX, finalY, { align: "right" });

    finalY += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Amount due", totalsLabelX, finalY);
    doc.text(`UGX ${invoice.balanceDue.toLocaleString()}`, totalsValueX, finalY, { align: "right" });

    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error("Error generating Invoice PDF:", error);
  }
};

export const generateStatementPDF = (
  client: any,
  transactions: any[],
  business: any,
  dateRange: { from: string; to: string },
) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Logo (Top Right)
    if (business?.logo) {
      try {
        doc.addImage(business.logo, "PNG", pageWidth - 35, 15, 15, 15);
      } catch (e) {
        doc.setFillColor(0, 0, 0);
        doc.triangle(pageWidth - 30, 15, pageWidth - 20, 30, pageWidth - 40, 30, "F");
      }
    } else {
      doc.setFillColor(0, 0, 0);
      doc.triangle(pageWidth - 30, 15, pageWidth - 20, 30, pageWidth - 40, 30, "F");
    }

    // Title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Statement of Account", margin, 25);

    // Metadata
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Period", margin, 40);
    doc.text("Date generated", margin, 48);

    doc.setTextColor(0, 0, 0);
    const periodText = `${dateRange.from || "All time"} - ${dateRange.to || "Present"}`;
    doc.text(periodText, margin + 35, 40);
    doc.text(new Date().toLocaleDateString(), margin + 35, 48);

    // Business & Client Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(business?.name || "Business Name", margin, 75);
    doc.text("Statement For", 100, 75);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);

    const businessAddrLines = doc.splitTextToSize(business?.address || "", 70);
    doc.text(businessAddrLines, margin, 82);
    let nextY = 82 + (businessAddrLines.length * 5);
    if (business?.phone) {
      doc.text(business?.phone, margin, nextY);
      nextY += 5;
    }
    if (business?.email) {
      doc.text(business?.email, margin, nextY);
    }

    doc.setTextColor(0, 0, 0);
    doc.text(client.name, 100, 82);
    doc.setTextColor(100, 100, 100);
    const clientDetails = `${client.contact}${client.location ? "\n" + client.location : ""}`;
    const clientAddrLines = doc.splitTextToSize(clientDetails, 70);
    doc.text(clientAddrLines, 100, 88);

    // Summary Line
    const totalCharges = transactions.reduce((sum, tx) => sum + tx.charge, 0);
    const totalPayments = transactions.reduce((sum, tx) => sum + tx.payment, 0);
    const balance = totalCharges - totalPayments;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const balanceText = `Closing Balance: UGX ${balance.toLocaleString()}`;
    doc.text(balanceText, margin, 125);

    // Table
    const tableColumns = ["Date", "Description", "Ref", "Charges", "Payments", "Balance"];
    const tableRows = transactions.map((tx: any) => [
      tx.date.toLocaleDateString(),
      tx.description,
      tx.reference,
      tx.charge > 0 ? `UGX ${tx.charge.toLocaleString()}` : "-",
      tx.payment > 0 ? `UGX ${tx.payment.toLocaleString()}` : "-",
      `UGX ${tx.balance.toLocaleString()}`,
    ]);

    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 140,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: { top: 5, bottom: 5, left: 0, right: 0 } },
      headStyles: {
        fontStyle: "normal",
        textColor: [100, 100, 100],
        borderBottom: { lineWidth: 0.5, lineColor: [0, 0, 0] }
      },
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
      margin: { left: margin, right: margin },
    });

    // Totals
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);

    const totalsLabelX = 130;
    const totalsValueX = pageWidth - margin;

    doc.setTextColor(100, 100, 100);
    doc.text("Total Charges", totalsLabelX, finalY);
    doc.setTextColor(0, 0, 0);
    doc.text(`UGX ${totalCharges.toLocaleString()}`, totalsValueX, finalY, { align: "right" });

    finalY += 8;
    doc.setTextColor(100, 100, 100);
    doc.text("Total Payments", totalsLabelX, finalY);
    doc.setTextColor(0, 0, 0);
    doc.text(`UGX ${totalPayments.toLocaleString()}`, totalsValueX, finalY, { align: "right" });

    finalY += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Closing Balance", totalsLabelX, finalY);
    doc.text(`UGX ${balance.toLocaleString()}`, totalsValueX, finalY, { align: "right" });

    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`Statement-${client.name.replace(/\s+/g, "_")}-${dateStr}.pdf`);
  } catch (error) {
    console.error("Error generating Statement PDF:", error);
  }
};

export const generateReceiptPDF = (
  invoice: any,
  payment: any,
  business: any,
  job: any = null
) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Logo (Top Right)
    if (business?.logo) {
      try {
        doc.addImage(business.logo, "PNG", pageWidth - 35, 15, 15, 15);
      } catch (e) {
        doc.setFillColor(0, 0, 0);
        doc.triangle(pageWidth - 30, 15, pageWidth - 20, 30, pageWidth - 40, 30, "F");
      }
    } else {
      doc.setFillColor(0, 0, 0);
      doc.triangle(pageWidth - 30, 15, pageWidth - 20, 30, pageWidth - 40, 30, "F");
    }

    // Title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Receipt", margin, 25);

    // Metadata
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Invoice number", margin, 40);
    doc.text("Receipt number", margin, 48);
    doc.text("Date paid", margin, 56);

    doc.setTextColor(0, 0, 0);
    doc.text(invoice.invoiceNumber, margin + 35, 40);
    doc.text(payment.id.substring(0, 8).toUpperCase(), margin + 35, 48);
    doc.text(new Date(payment.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' }), margin + 35, 56);

    // Business & Customer Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(business?.name || "Business Name", margin, 75);
    doc.text("Bill to", 100, 75);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);

    const businessAddrLines = doc.splitTextToSize(business?.address || "", 70);
    doc.text(businessAddrLines, margin, 82);
    let nextY = 82 + (businessAddrLines.length * 5);
    if (business?.phone) {
      doc.text(business?.phone, margin, nextY);
      nextY += 5;
    }
    if (business?.email) {
      doc.text(business?.email, margin, nextY);
    }

    doc.setTextColor(0, 0, 0);
    doc.text(invoice.customerDetails.name, 100, 82);
    doc.setTextColor(100, 100, 100);
    const customerAddrLines = doc.splitTextToSize(`${invoice.customerDetails.contact}${invoice.customerDetails.location ? '\n' + invoice.customerDetails.location : ''}`, 70);
    doc.text(customerAddrLines, 100, 88);

    // Summary Line
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const paidText = `UGX ${payment.amount.toLocaleString()} paid on ${new Date(payment.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}`;
    doc.text(paidText, margin, 125);

    // Table
    const tableColumns = ["Description", "Qty", "Unit price", "Amount"];
    const tableRows = invoice.lineItems.map((item: any) => [
      item.description,
      item.quantity.toString(),
      `UGX ${item.unitPrice.toLocaleString()}`,
      `UGX ${(item.quantity * item.unitPrice).toLocaleString()}`,
    ]);

    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 140,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: { top: 5, bottom: 5, left: 0, right: 0 } },
      headStyles: {
        fontStyle: "normal",
        textColor: [100, 100, 100],
        borderBottom: { lineWidth: 0.5, lineColor: [0, 0, 0] }
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      margin: { left: margin, right: margin },
    });

    // Totals
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);

    const totalsLabelX = 140;
    const totalsValueX = pageWidth - margin;

    doc.setTextColor(100, 100, 100);
    doc.text("Subtotal", totalsLabelX, finalY);
    doc.setTextColor(0, 0, 0);
    doc.text(`UGX ${invoice.subTotal.toLocaleString()}`, totalsValueX, finalY, { align: "right" });

    if (invoice.taxAmount > 0) {
      finalY += 8;
      doc.setTextColor(100, 100, 100);
      doc.text(`Tax (${invoice.taxRate * 100}%)`, totalsLabelX, finalY);
      doc.setTextColor(0, 0, 0);
      doc.text(`UGX ${invoice.taxAmount.toLocaleString()}`, totalsValueX, finalY, { align: "right" });
    }

    finalY += 8;
    doc.setTextColor(100, 100, 100);
    doc.text("Total", totalsLabelX, finalY);
    doc.setTextColor(0, 0, 0);
    doc.text(`UGX ${invoice.totalAmount.toLocaleString()}`, totalsValueX, finalY, { align: "right" });

    finalY += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Amount paid", totalsLabelX, finalY);
    doc.text(`UGX ${payment.amount.toLocaleString()}`, totalsValueX, finalY, { align: "right" });

    // Payment history section (mimic Vercel)
    finalY += 20;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Payment history", margin, finalY);

    const historyColumns = ["Payment method", "Date", "Amount paid", "Receipt number"];
    const historyRows = [[
      payment.method,
      new Date(payment.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' }),
      `UGX ${payment.amount.toLocaleString()}`,
      payment.id.substring(0, 8).toUpperCase()
    ]];

    (doc as any).autoTable({
      head: [historyColumns],
      body: historyRows,
      startY: finalY + 10,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: { top: 5, bottom: 5, left: 0, right: 0 } },
      headStyles: {
        fontStyle: "normal",
        textColor: [100, 100, 100],
        borderBottom: { lineWidth: 0.5, lineColor: [0, 0, 0] }
      },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right" },
      },
      margin: { left: margin, right: margin },
    });

    doc.save(`Receipt-${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error("Error generating Receipt PDF:", error);
  }
};

export const generateInventoryReportPDF = (
  reportData: any[],
  dateRange: { from: Date; to: Date },
  businessName?: string,
  branchName?: string
) => {
  try {
    const doc = new jsPDF();
    const title = "Inventory Movement Report";
    const startDate = new Date(dateRange.from).toLocaleDateString("en-GB");
    const endDate = new Date(dateRange.to).toLocaleDateString("en-GB");

    doc.text(title, 14, 16);
    doc.setFontSize(10);
    if (businessName) {
      doc.text(`Business: ${businessName}`, 14, 22);
    }
    if (branchName) {
      doc.text(`Branch: ${branchName}`, 14, 28);
    }
    doc.text(`Period: ${startDate} - ${endDate}`, 14, 34);

    let startY = 40;

    reportData.forEach((dailyReport) => {
      doc.setFontSize(12);
      doc.text(new Date(dailyReport.date).toLocaleDateString(), 14, startY);
      startY += 10;

      const tableColumns = [
        "Item Name",
        "Opening Stock",
        "Stock Added",
        "Stock Removed",
        "Closing Stock",
      ];
      const tableRows = dailyReport.items.map((item: any) => [
        item.itemName,
        item.openingStock,
        item.stockAdded,
        item.stockRemoved,
        item.closingStock,
      ]);

      (doc as any).autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: startY,
        theme: "grid",
      });

      startY = (doc as any).lastAutoTable.finalY + 10;
    });

    const filename = `inventory-movement-report-${getFormattedDate()}.pdf`;
    doc.save(filename);
    return filename;
  } catch (error) {
    console.error("Error generating Inventory Movement Report PDF:", error);
    throw error;
  }
};

export const generateSalesForecastReportPDF = (
  productSales: {
    productName: string;
    totalSales: number;
    forecasts: {
      "7-day": number;
      "14-day": number;
      "30-day": number;
    };
    currentStock: number;
    stockRecommendation: string;
  }[],
  dateRange: { from: Date; to: Date },
  businessName?: string,
  branchName?: string
) => {
  try {
    const doc = new jsPDF();
    const title = "Sales Forecast Report";
    const startDate = new Date(dateRange.from).toLocaleDateString("en-GB");
    const endDate = new Date(dateRange.to).toLocaleDateString("en-GB");

    doc.text(title, 14, 16);
    doc.setFontSize(10);
    if (businessName) {
      doc.text(`Business: ${businessName}`, 14, 22);
    }
    if (branchName) {
      doc.text(`Branch: ${branchName}`, 14, 28);
    }
    doc.text(`Period: ${startDate} - ${endDate}`, 14, 34);

    doc.setFontSize(12);

    const tableColumns = [
      "Product",
      "Total Sales",
      "7-Day Forecast",
      "14-Day Forecast",
      "30-Day Forecast",
      "Current Stock",
      "Recommendation",
    ];
    const tableRows = productSales.map((product) => [
      product.productName,
      `UGX ${product.totalSales.toLocaleString()}`,
      `UGX ${product.forecasts["7-day"].toLocaleString()}`,
      `UGX ${product.forecasts["14-day"].toLocaleString()}`,
      `UGX ${product.forecasts["30-day"].toLocaleString()}`,
      product.currentStock,
      product.stockRecommendation,
    ]);

    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 40,
      theme: "grid",
    });

    const filename = `sales-forecast-report-${getFormattedDate()}.pdf`;
    doc.save(filename);
    return filename;
  } catch (error) {
    console.error("Error generating Sales Forecast Report PDF:", error);
    throw error;
  }
};

export const generateDailySalesReportPDF = (
  dailySales: { date: string; total: number }[],
  total: number,
  dateRange: { from: Date; to: Date },
  businessName?: string,
  branchName?: string
) => {
  try {
    const doc = new jsPDF();
    const title = "Daily Sales Report";
    const startDate = new Date(dateRange.from).toLocaleDateString("en-GB");
    const endDate = new Date(dateRange.to).toLocaleDateString("en-GB");

    doc.text(title, 14, 16);
    doc.setFontSize(10);
    if (businessName) {
      doc.text(`Business: ${businessName}`, 14, 22);
    }
    if (branchName) {
      doc.text(`Branch: ${branchName}`, 14, 28);
    }
    doc.text(`Period: ${startDate} - ${endDate}`, 14, 34);

    doc.setFontSize(12);

    const tableColumns = ["Date", "Total Sales"];
    const tableRows = dailySales.map((sale) => [
      sale.date,
      `UGX ${sale.total.toLocaleString()}`,
    ]);

    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 40,
      theme: "grid",
      foot: [
        [
          { content: "Grand Total", colSpan: 1, styles: { fontStyle: "bold" } },
          {
            content: `UGX ${total.toLocaleString()}`,
            styles: { halign: "right", fontStyle: "bold" },
          },
        ],
      ],
    });

    const filename = `daily-sales-report-${getFormattedDate()}.pdf`;
    doc.save(filename);
    return filename;
  } catch (error) {
    console.error("Error generating Daily Sales Report PDF:", error);
    throw error;
  }
};

export const generateAnnualSummaryReportPDF = (
  monthlyData: {
    month: string;
    revenue: number;
    grossProfit: number;
    expenses: number;
    netProfit: number;
  }[],
  totals: {
    revenue: number;
    grossProfit: number;
    expenses: number;
    netProfit: number;
  },
  year: string,
  businessName?: string,
  branchName?: string
) => {
  try {
    const doc = new jsPDF();
    const title = `Annual Summary Report - ${year}`;

    doc.text(title, 14, 16);
    doc.setFontSize(10);
    if (businessName) {
      doc.text(`Business: ${businessName}`, 14, 22);
    }
    if (branchName) {
      doc.text(`Branch: ${branchName}`, 14, 28);
    }

    doc.setFontSize(12);

    const tableColumns = [
      "Month",
      "Total Sales",
      "Gross Profit",
      "Expenses",
      "Net Profit",
    ];
    const tableRows = monthlyData.map((data) => [
      data.month,
      `UGX ${data.revenue.toLocaleString()}`,
      `UGX ${data.grossProfit.toLocaleString()}`,
      `UGX ${data.expenses.toLocaleString()}`,
      `UGX ${data.netProfit.toLocaleString()}`,
    ]);

    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 35,
      theme: "grid",
      foot: [
        [
          { content: "Totals", styles: { fontStyle: "bold" } },
          {
            content: `UGX ${totals.revenue.toLocaleString()}`,
            styles: { halign: "right", fontStyle: "bold" },
          },
          {
            content: `UGX ${totals.grossProfit.toLocaleString()}`,
            styles: { halign: "right", fontStyle: "bold" },
          },
          {
            content: `UGX ${totals.expenses.toLocaleString()}`,
            styles: { halign: "right", fontStyle: "bold" },
          },
          {
            content: `UGX ${totals.netProfit.toLocaleString()}`,
            styles: { halign: "right", fontStyle: "bold" },
          },
        ],
      ],
    });

    const filename = `annual-summary-report-${year}-${getFormattedDate()}.pdf`;
    doc.save(filename);
    return filename;
  } catch (error) {
    console.error("Error generating Annual Summary Report PDF:", error);
    throw error;
  }
};

export const generateSalesReportPDF = (
  profitData: any,
  period: string,
  branchInfo?: Branch
) => {
  try {
    const doc = new jsPDF();
    const title = `Sales Report - ${period}`;

    doc.text(title, 14, 16);
    if (branchInfo) {
      doc.setFontSize(10);
      doc.text(`Branch: ${branchInfo.name} - ${branchInfo.address}`, 14, 22);
    }
    doc.setFontSize(12);

    // Summary
    const summaryData = [
      [
        "Total Revenue",
        `UGX ${(profitData.revenue.totalRevenue || 0).toLocaleString()}`,
      ],
      ["Total Sales", profitData.revenue.totalSales || 0],
      [
        "Total Expenses",
        `UGX ${(profitData.costs.totalExpenses || 0).toLocaleString()}`,
      ],
      [
        "Net Profit",
        `UGX ${(profitData.profit.netProfit || 0).toLocaleString()}`,
      ],
      [
        "Profit Margin",
        `${(profitData.profit.netProfitMargin || 0).toFixed(1)}%`,
      ],
    ];

    (doc as any).autoTable({
      body: summaryData,
      startY: 30,
      theme: "grid",
    });

    // Top Profitable Items
    if (profitData.breakdown.topProfitableItems.length > 0) {
      doc.text(
        "Top Profitable Items",
        14,
        (doc as any).lastAutoTable.finalY + 10
      );
      const topItemsColumns = [
        "Item",
        "Quantity Sold",
        "Revenue",
        "Profit",
        "Margin",
      ];
      const topItemsRows = profitData.breakdown.topProfitableItems.map(
        (item: any) => [
          item.item.name,
          item.quantitySold,
          `UGX ${(item.revenue || 0).toLocaleString()}`,
          `UGX ${(item.profit || 0).toLocaleString()}`,
          `${(item.margin || 0).toFixed(1)}%`,
        ]
      );

      (doc as any).autoTable({
        head: [topItemsColumns],
        body: topItemsRows,
        startY: (doc as any).lastAutoTable.finalY + 15,
      });
    }

    const filename = `sales-report-${period}-${getFormattedDate()}.pdf`;
    doc.save(filename);
    return filename;
  } catch (error) {
    console.error("Error generating Sales Report PDF:", error);
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

    // Summary
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
      ["Total Items", items.length],
      [
        "Total Stock Value (Selling)",
        `UGX ${totalStockValue.toLocaleString()}`,
      ],
      [
        "Total Potential Profit",
        `UGX ${totalPotentialProfit.toLocaleString()}`,
      ],
    ];

    (doc as any).autoTable({
      body: summaryData,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.text(
      "Current Stock with Profit Analysis",
      14,
      (doc as any).lastAutoTable.finalY + 10
    );

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
      startY: (doc as any).lastAutoTable.finalY + 15,
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
          items
            .find((i) => i.id === selectedItemId)
            ?.name.replace(/\s+/g, "_") || "filtered"
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
