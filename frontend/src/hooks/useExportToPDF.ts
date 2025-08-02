/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const useExportToPDF = () => {
  const exportToPDF = (dataToExport: any, fileName: string) => {
    const pdf = new jsPDF();
    const headers = Object.keys(dataToExport[0]);
    const rows = dataToExport.map((obj: any) =>
      headers.map((header) => obj[header]),
    );

    autoTable(pdf, {
      head: [headers],
      body: rows,
      headStyles: { fillColor: "#ccc" },
    });

    pdf.save(`${fileName}.pdf`);
  };

  return { exportToPDF };
};
