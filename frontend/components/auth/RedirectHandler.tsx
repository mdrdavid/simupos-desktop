"use client";

import { useAuth } from "@/context/AuthContext";
import { useBusiness } from "@/context/BusinessContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectHandler() {
  const { loading } = useBusiness();
  const { businessData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // First check if user is authenticated
      if (!businessData) {
        router.push("/landing");
        return;
      }

      // Then handle business-specific routing
      if (businessData.businessType) {
        router.push("/dashboard");
      } else {
        router.push("/select-business");
      }
    }
  }, [businessData, loading, router]);

  return null;
}
// "use client";

// import { useAuth } from "@/context/AuthContext";
// import { useBusiness } from "@/context/BusinessContext";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function RedirectHandler() {
//   const { currentBusiness, loading } = useBusiness();
//   const { businessData } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading) {
//       if (businessData && businessData.businessType) {
//         router.push("/dashboard");
//       } else if (businessData) {
//         router.push("/select-business");
//       } else {
//         router.push("/auth/login");
//       }
//     }
//   }, [businessData, loading, router]);

//   return null; // This component does not render anything
// }
