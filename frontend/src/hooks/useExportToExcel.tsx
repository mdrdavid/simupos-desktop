/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";

export const useExportToExcel = () => {
  const exportToExcel = (dataToExport: any, fileName: any) => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return { exportToExcel };
};
