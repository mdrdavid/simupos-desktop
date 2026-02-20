"use client";

import React from "react";
import ReportsClient from "@/components/accounting/ReportsClient";
import withAuthorization from "@/components/auth/withAuthorization";

const ReportsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Financial Reports</h1>
      <ReportsClient />
    </div>
  );
};

export default withAuthorization(ReportsPage, ["admin", "owner", "manager"]);