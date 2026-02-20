/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, type ReactNode } from "react";
import type { PaymentVoucher } from "@/src/types/payment";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { Separator } from "@/components/ui/separator";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface BusinessDetails {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
}

interface PaymentVoucherProps {
  voucher: PaymentVoucher;
  businessDetails?: BusinessDetails;
}

const VoucherRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between py-2">
    <dt className="text-sm font-medium text-gray-600">{label}</dt>
    <dd className="text-sm text-gray-900">{value}</dd>
  </div>
);

export function PaymentVoucher({
  voucher,
  businessDetails,
}: PaymentVoucherProps) {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    // content: () => componentRef.current,
    documentTitle: `Payment-Voucher-${voucher.voucherNumber}`,
  });

  const handleDownloadPdf = async () => {
    const input = componentRef.current;
    if (!input) return;

    try {
      // Create html2canvas options without the invalid 'scale' property
      const canvasOptions = {
        useCORS: true,
        // Use windowWidth and windowHeight to control resolution instead of scale
        windowWidth: 800,
        windowHeight: 1120, // Approximate A4 ratio
        // Alternative approach: set the desired width and let height be calculated
        width: 800,
        // You can also use the onclone callback to adjust styles before capturing
        onclone: (clonedDoc: Document, element: HTMLElement) => {
          // Ensure all elements are visible for printing
          element.style.width = "800px";
          element.style.boxSizing = "border-box";
        },
      };

      const canvas = await html2canvas(input, canvasOptions as any);
      const imgData = canvas.toDataURL("image/png", 1.0); // Use highest quality

      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate dimensions to maintain aspect ratio
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Center the image on the page
      const x = (pdfWidth - imgWidth) / 2;
      let y = (pdfHeight - imgHeight) / 2;

      // Ensure the image doesn't start above the page
      if (y < 0) y = 0;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(`Voucher-${voucher.voucherNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="p-2">
      <div
        ref={componentRef}
        className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-md mx-auto print:shadow-none"
        style={{ width: "800px", maxWidth: "100%", boxSizing: "border-box" }}
      >
        <header className="mb-8">
          {businessDetails && (
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 print:text-black">
                {businessDetails.name}
              </h2>
              {businessDetails.address && (
                <p className="text-sm text-gray-500 print:text-gray-700">
                  {businessDetails.address}
                </p>
              )}
              <div className="text-sm text-gray-500 print:text-gray-700">
                {businessDetails.email && <span>{businessDetails.email}</span>}
                {businessDetails.email && businessDetails.phone && (
                  <span className="mx-2">|</span>
                )}
                {businessDetails.phone && <span>{businessDetails.phone}</span>}
              </div>
            </div>
          )}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 print:text-black">
              Payment Voucher
            </h1>
            <p className="text-gray-500 print:text-gray-700">
              Voucher #{voucher.voucherNumber}
            </p>
          </div>
        </header>

        <main>
          <dl className="space-y-2">
            <VoucherRow
              label="Payment Date"
              value={new Date(voucher.paymentDate).toLocaleDateString()}
            />
            <Separator />
            <VoucherRow label="Artisan Name" value={voucher.artisanName} />
            <Separator />
            <VoucherRow
              label="Job"
              value={
                <span className="break-words">{voucher.jobDescription}</span>
              }
            />
            <Separator />
            <VoucherRow
              label="Agreed Wage"
              value={`UGX ${voucher.wageAmount.toLocaleString()}`}
            />
            <VoucherRow
              label="Amount Paid (This Voucher)"
              value={`UGX ${voucher.amountPaidThisVoucher.toLocaleString()}`}
            />
            <VoucherRow
              label="Total Paid (To Date)"
              value={`UGX ${voucher.totalAmountPaid.toLocaleString()}`}
            />
            <VoucherRow
              label="Balance Remaining"
              value={`UGX ${voucher.balanceRemaining.toLocaleString()}`}
            />
            <Separator />
            <VoucherRow label="Authorized By" value={voucher.authorizedBy} />
          </dl>
        </main>

        <footer className="text-center mt-8 text-xs text-gray-500 print:text-gray-700">
          <p>Thank you for your service.</p>
          <p>SimuPOS Professional Hub</p>
        </footer>
      </div>

      <div className="flex justify-center gap-4 mt-6 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          Print Voucher
        </Button>
        <Button onClick={handleDownloadPdf}>Download PDF</Button>
      </div>
    </div>
  );
}
// "use client";

// import React, { useRef, type ReactNode } from "react";
// import type { PaymentVoucher } from "@/src/types/payment";
// import { Button } from "@/components/ui/button";
// import { useReactToPrint } from "react-to-print";
// import { Separator } from "@/components/ui/separator";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

// interface BusinessDetails {
//   name?: string;
//   address?: string;
//   email?: string;
//   phone?: string;
// }

// interface PaymentVoucherProps {
//   voucher: PaymentVoucher;
//   businessDetails?: BusinessDetails;
// }

// const VoucherRow = ({ label, value }: { label: string; value: ReactNode }) => (
//   <div className="flex justify-between py-2">
//     <dt className="text-sm font-medium text-gray-600">{label}</dt>
//     <dd className="text-sm text-gray-900">{value}</dd>
//   </div>
// );

// export function PaymentVoucher({
//   voucher,
//   businessDetails,
// }: PaymentVoucherProps) {
//   const componentRef = useRef(null);

//   const handlePrint = useReactToPrint({
//     // contentRef: () => componentRef.current,
//     documentTitle: `Payment-Voucher-${voucher.voucherNumber}`,
//     // removeAfterPrint: true,
//   });

//   const handleDownloadPdf = async () => {
//     const input = componentRef.current;
//     if (!input) return;

//     try {
//       const canvas = await html2canvas(input, {
//         scale: 2, // Higher scale for better quality
//         useCORS: true,
//       });
//       const imgData = canvas.toDataURL("image/png");

//       // A4 dimensions in mm: 210 x 297
//       const pdf = new jsPDF({
//         orientation: "portrait",
//         unit: "mm",
//         format: "a4",
//       });

//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();
//       const canvasWidth = canvas.width;
//       const canvasHeight = canvas.height;
//       const ratio = canvasWidth / canvasHeight;

//       let imgWidth = pdfWidth - 20; // with some margin
//       let imgHeight = imgWidth / ratio;

//       // If image height is still too large, adjust based on height
//       if (imgHeight > pdfHeight - 20) {
//         imgHeight = pdfHeight - 20;
//         imgWidth = imgHeight * ratio;
//       }

//       const x = (pdfWidth - imgWidth) / 2;
//       const y = 10; // top margin

//       pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
//       pdf.save(`Voucher-${voucher.voucherNumber}.pdf`);
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//     }
//   };

//   return (
//     <div className="p-2">
//       <div
//         ref={componentRef}
//         className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-md mx-auto print:shadow-none"
//       >
//         <header className="mb-8">
//           {businessDetails && (
//             <div className="text-center mb-6">
//               <h2 className="text-xl font-bold text-gray-800 print:text-black">
//                 {businessDetails.name}
//               </h2>
//               {businessDetails.address && (
//                 <p className="text-sm text-gray-500 print:text-gray-700">
//                   {businessDetails.address}
//                 </p>
//               )}
//               <div className="text-sm text-gray-500 print:text-gray-700">
//                 {businessDetails.email && (
//                   <span>{businessDetails.email}</span>
//                 )}
//                 {businessDetails.email && businessDetails.phone && (
//                   <span className="mx-2">|</span>
//                 )}
//                 {businessDetails.phone && (
//                   <span>{businessDetails.phone}</span>
//                 )}
//               </div>
//             </div>
//           )}
//           <div className="text-center">
//             <h1 className="text-2xl font-bold text-gray-900 print:text-black">
//               Payment Voucher
//             </h1>
//             <p className="text-gray-500 print:text-gray-700">
//               Voucher #{voucher.voucherNumber}
//             </p>
//           </div>
//         </header>

//         <main>
//           <dl className="space-y-2">
//             <VoucherRow
//               label="Payment Date"
//               value={new Date(voucher.paymentDate).toLocaleDateString()}
//             />
//             <Separator />
//             <VoucherRow label="Artisan Name" value={voucher.artisanName} />
//             <Separator />
//             <VoucherRow
//               label="Job"
//               value={
//                 <span className="break-words">{voucher.jobDescription}</span>
//               }
//             />
//             <Separator />
//             <VoucherRow
//               label="Agreed Wage"
//               value={`UGX ${voucher.wageAmount.toLocaleString()}`}
//             />
//             <VoucherRow
//               label="Amount Paid (This Voucher)"
//               value={`UGX ${voucher.amountPaidThisVoucher.toLocaleString()}`}
//             />
//             <VoucherRow
//               label="Total Paid (To Date)"
//               value={`UGX ${voucher.totalAmountPaid.toLocaleString()}`}
//             />
//             <VoucherRow
//               label="Balance Remaining"
//               value={`UGX ${voucher.balanceRemaining.toLocaleString()}`}
//             />
//             <Separator />
//             <VoucherRow label="Authorized By" value={voucher.authorizedBy} />
//           </dl>
//         </main>

//         <footer className="text-center mt-8 text-xs text-gray-500 print:text-gray-700">
//           <p>Thank you for your service.</p>
//           <p>SimuPOS Professional Hub</p>
//         </footer>
//       </div>

//       <div className="flex justify-center gap-4 mt-6 print:hidden">
//         <Button variant="outline" onClick={handlePrint}>
//           Print Voucher
//         </Button>
//         <Button onClick={handleDownloadPdf}>Download PDF</Button>
//       </div>
//     </div>
//   );
// }
