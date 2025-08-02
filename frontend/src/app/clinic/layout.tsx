"use client";

import type React from "react";
import { ClinicProvider } from "@/context/ClinicContext";
import { ClinicBottomNav } from "@/components/clinic/ClinicBottomNav";
import { ClinicHeader } from "@/components/clinic/ClinicHeader";

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, you would get these values from your context or props
  const clinicData = {
    businessName: "City Medical Clinic",
    branchName: "Downtown Branch",
    userName: "Dr. Sarah Johnson",
    isOnline: true,
    supportPhone: "0702629361"
  };

  return (
    <ClinicProvider>
      <div className="min-h-screen bg-gray-50">
        <ClinicHeader 
          businessName={clinicData.businessName}
          branchName={clinicData.branchName}
          userName={clinicData.userName}
          isOnline={clinicData.isOnline}
          supportPhone={clinicData.supportPhone}
        />
        <div className="pb-20 pt-16">{children}</div>
        <ClinicBottomNav />
      </div>
    </ClinicProvider>
  );
}
// "use client";

// import type React from "react";

// import { ClinicProvider } from "@/context/ClinicContext";
// import { ClinicBottomNav } from "@/components/clinic/ClinicBottomNav";

// export default function ClinicLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ClinicProvider>
//       <div className="min-h-screen bg-gray-50">
//         <div className="pb-20">{children}</div>
//         <ClinicBottomNav />
//       </div>
//     </ClinicProvider>
//   );
// }
