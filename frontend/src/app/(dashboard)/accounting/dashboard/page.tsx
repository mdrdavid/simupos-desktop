"use client";

import React from "react";
import AccountingDashboard from "@/components/dashboard/AccountingDashboard";
import withAuthorization from "@/components/auth/withAuthorization";

const AccountingDashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Accounting Dashboard</h1>
      <AccountingDashboard />
    </div>
  );
};

export default withAuthorization(AccountingDashboardPage, ["admin", "owner", "manager"]);