"use client";

import React from "react";
import ChartOfAccountsClient from "@/components/accounting/ChartOfAccountsClient";
import withAuthorization from "@/components/auth/withAuthorization";

const ChartOfAccountsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chart of Accounts</h1>
      <ChartOfAccountsClient />
    </div>
  );
};

export default withAuthorization(ChartOfAccountsPage, ["admin", "owner", "manager"]);