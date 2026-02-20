"use client";

import React from "react";
import LedgerClient from "@/components/accounting/LedgerClient";
import withAuthorization from "@/components/auth/withAuthorization";

const LedgerPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ledger & Journal Entries</h1>
      <LedgerClient />
    </div>
  );
};

export default withAuthorization(LedgerPage, ["admin", "owner", "manager"]);