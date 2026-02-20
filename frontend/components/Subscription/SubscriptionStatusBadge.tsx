"use client";

import { useAuth } from "@/context/AuthContext";
import { getDaysRemaining } from "@/src/lib/date";
import { Badge } from "@/components/ui/badge";

export const SubscriptionStatusBadge = () => {
  const { user } = useAuth();

  if (!user?.currentSubscription) {
    return null;
  }

  const { status, endDate } = user.currentSubscription;

  if (status !== "active" || !endDate) {
    return <Badge variant="destructive">Inactive</Badge>;
  }

  const daysRemaining = getDaysRemaining(endDate);

  if (daysRemaining <= 0) {
    return <Badge variant="destructive">Expired</Badge>;
  }

  if (daysRemaining <= 7) {
    return (
      <Badge variant="destructive">{`Expires in ${daysRemaining} days`}</Badge>
    );
  }

  // return <Badge variant="default">{`${daysRemaining} days remaining`}</Badge>;
  return (
    <Badge variant="default" title="Days remaining on subscription">
      {`${daysRemaining} days remaining`}
    </Badge>
  );
};
