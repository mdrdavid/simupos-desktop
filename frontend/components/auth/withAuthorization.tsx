"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const withAuthorization = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: string[]
) => {
  const WithAuthorization: React.FC<P> = (props) => {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/auth/login");
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) {
      return <div>Loading...</div>; // Or a spinner component
    }

    const hasPermission = user && allowedRoles.includes(user.role);

    if (!hasPermission) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthorization;
};

export default withAuthorization;