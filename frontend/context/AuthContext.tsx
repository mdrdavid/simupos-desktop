/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { httpClient } from "@/src/data/api/httpClient";
import { toast } from "@/components/ui/use-toast"; // Using shadcn/ui toast for notifications
import { SubscriptionPlan } from "@/src/types/subscription";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  currentSubscription?: {
    id: string;
    status: "active" | "expired" | "cancelled" | "pending";
    startDate: string;
    endDate: string;
    plan: SubscriptionPlan;
    // ... other subscription fields
  };
  branch?: {
    id: string;
    name: string;
    isMain: boolean;
    business?: {
      id: string;
      name: string;
    };
  };
  isVerified: boolean;
  createdAt: string;
  subscriptionId: string;
}

type SubscriptionStatus = "active" | "expired" | "pending" | "none";
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  subscriptionStatus: SubscriptionStatus;
  currentBranchId: string | null;
  currentBusinessId: string | null;
  businessData: any | null;
  setCurrentBranchId: (branchId: string | null) => void;
  register: (userData: {
    firstName:string;
    lastName: string;
    email: string;
    phone: string;
    pin: string;
    password: string;
    businessType?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  login: (
    credentials:
      | { phone: string; pin: string }
      | { email: string; password: string }
  ) => Promise<{ success: boolean; businessData?: any }>;
  verifyOTP: (phone: string, otp: string) => Promise<boolean>;
  resendOTP: (phone: string) => Promise<boolean>;
  setupPIN: (userId: string, pin: string) => Promise<boolean>;
  verifyPIN: (userId: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getAuthHeaders: () => Promise<Record<string, string>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper functions for localStorage
// const getLocalStorageItem = async (key: string) => {
//   if (typeof window !== "undefined") {
//     const item = localStorage.getItem(key);
//     return item ? JSON.parse(item) : null;
//   }
//   return null;
// };

// Update the localStorage helper functions
const getLocalStorageItem = (key: string) => {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key);
    try {
      return item ? JSON.parse(item) : null;
    } catch {
      return item; // Return raw string if not JSON
    }
  }
  return null;
};


const setLocalStorageItem = async (key: string, value: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
const removeLocalStorageItem = async (key: string) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};

const clearAuthData = async () => {
  const keysToRemove = [
    "authToken",
    "userData",
    "currentBranchId",
    "currentBusinessId",
    "businessData",
  ];

  keysToRemove.forEach((key) => {
    removeLocalStorageItem(key);
  });
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(
    null
  );
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>("none");
  const [businessData, setBusinessData] = useState<any | null>(null);
  const authCheckInProgress = useRef(false);

  // Check authentication status on initial load
  // useEffect(() => {
  //   checkAuth();
  // }, []);
  // In AuthProvider.tsx
  const getSubscriptionState = (user: User | null): SubscriptionStatus => {
    if (!user?.currentSubscription) return "none";

    const { status, endDate } = user.currentSubscription;
    if (status === "pending") return "pending";
    if (status === "active" && endDate && new Date(endDate) > new Date()) {
      return "active";
    }
    return "expired";
  };

  const checkAuth = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (authCheckInProgress.current) {
      return;
    }
    
    try {
      authCheckInProgress.current = true;
      setIsLoading(true);
      const token = await getLocalStorageItem("authToken");
      const userData = await getLocalStorageItem("userData");

      if (token && userData) {
        const branchId = await getLocalStorageItem("currentBranchId");
        const businessId = await getLocalStorageItem("currentBusinessId");
        const bizData = await getLocalStorageItem("businessData");

        setUser(userData);
        setIsAuthenticated(true);
        setCurrentBranchId(branchId || userData.branch?.id || null);
        setCurrentBusinessId(
          businessId || userData.branch?.business?.id || null
        );
        setBusinessData(bizData || userData.branch?.business || null);
        const subStatus = getSubscriptionState(userData);
        setSubscriptionStatus(subStatus);
      } else {
        await clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
        setSubscriptionStatus("none");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
      authCheckInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (
    credentials:
      | { phone: string; pin: string }
      | { email: string; password: string }
  ): Promise<{ success: boolean; businessData?: any }> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      // Format phone number
      if ("phone" in credentials) {
        credentials.phone = credentials.phone.replace(/[^\d+]/g, "");
        if (!credentials.phone.startsWith("+256")) {
          if (credentials.phone.startsWith("256")) {
            credentials.phone = `+${credentials.phone}`;
          } else {
            credentials.phone = `+256${credentials.phone.replace(/^\+?0?/, "")}`;
          }
        }
      }

      const endpoint =
        "phone" in credentials ? "/auth/login" : "/auth/login-email";
      const response = await httpClient(endpoint, {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.token && response.user) {
        const businessData = response.user.branch?.business;
        const branchId = response.user.branch?.id || "";
        const businessId = businessData?.id || "";

        await Promise.all([
          setLocalStorageItem("authToken", response.token),
          setLocalStorageItem("userData", response.user),
          setLocalStorageItem("currentBranchId", branchId),
          setLocalStorageItem("currentBusinessId", businessId),
          setLocalStorageItem("businessData", businessData || {}),
        ]);

        setUser(response.user);
        setCurrentBranchId(branchId);
        setCurrentBusinessId(businessId);
        setBusinessData(businessData || null);
        setIsAuthenticated(true);

        const subStatus = getSubscriptionState(response.user);
        setSubscriptionStatus(subStatus);

        toast({
          title: "Login Successful",
          description: "You have been logged in successfully",
        });

        return { success: true, businessData };
      } else {
        setAuthError(response.message || "Login failed");
        toast({
          title: "Login Failed",
          description: response.message || "Invalid credentials",
          variant: "destructive",
        });
        return { success: false };
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Login failed. Please try again.");
      toast({
        title: "Login Error",
        description: "Failed to login. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAuthHeaders = useCallback(async () => {
    const token = await getLocalStorageItem("authToken");
    if (!token) {
      // Redirect to login if no token exists
      // window.location.href = '/auth/login';
      throw new Error("No authentication token available");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Branch-Id": currentBranchId || "",
      "X-Business-Id": currentBusinessId || "",
    };
  }, [currentBranchId, currentBusinessId]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const refreshToken = async () => {
  try {
    const refreshToken = await getLocalStorageItem("refreshToken");
    const response = await httpClient('/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.token) {
      await setLocalStorageItem("authToken", response.token);
      return response.token;
    }
    throw new Error("Token refresh failed");
  } catch (error) {
    await clearAuthData();
    window.location.href = '/login';
    throw error;
  }
};
const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const headers = await getAuthHeaders();
      const response = await httpClient("/auth/refresh", {
        method: "POST",
        headers,
      });

      if (response.user) {
        await setLocalStorageItem("userData", response.user);
        setUser(response.user);
        const subStatus = getSubscriptionState(response.user);
        setSubscriptionStatus(subStatus);
        toast({
          title: "Success",
          description: "User data refreshed",
        });
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      toast({
        title: "Error",
        description: "Failed to refresh user data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);
  const register = useCallback(async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    pin: string;
    password: string;
    businessType?: string;
  }) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const response = await httpClient("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.success) {
        toast({
          title: "Registration Successful",
          description: response.message || "Account created successfully",
        });
        return { success: true, message: response.message };
      } else {
        setAuthError(response.message || "Registration failed");
        toast({
          title: "Registration Failed",
          description: response.message || "Failed to create account",
          variant: "destructive",
        });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error("Registration error:", error);
      setAuthError("Registration failed. Please try again.");
      toast({
        title: "Registration Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
      return { success: false, message: "Registration failed" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOTP = useCallback(async (phone: string, otp: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const response = await httpClient("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.token && response.user) {
        await setLocalStorageItem("authToken", response.token);
        await setLocalStorageItem("userData", response.user);
        setUser(response.user);
        setIsAuthenticated(true);
        toast({
          title: "Verification Successful",
          description: "Your phone number has been verified",
        });
        return true;
      } else {
        setAuthError(response.message || "OTP verification failed");
        toast({
          title: "Verification Failed",
          description: response.message || "Invalid OTP code",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setAuthError("OTP verification failed");
      toast({
        title: "Verification Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendOTP = useCallback(async (phone: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const response = await httpClient("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.success) {
        toast({
          title: "OTP Sent",
          description: "A new OTP has been sent to your phone",
        });
        return true;
      } else {
        setAuthError(response.message || "Failed to resend OTP");
        toast({
          title: "Error",
          description: response.message || "Failed to resend OTP",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setAuthError("Failed to resend OTP");
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setupPIN = useCallback(async (userId: string, pin: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const response = await httpClient("/auth/setup-pin", {
        method: "POST",
        body: JSON.stringify({ userId, pin }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.success) {
        if (user) {
          const updatedUser = { ...user, isVerified: true };
          await setLocalStorageItem("userData", updatedUser);
          setUser(updatedUser);
        }
        toast({
          title: "PIN Set",
          description: "Your PIN has been set successfully",
        });
        return true;
      } else {
        setAuthError(response.message || "Failed to setup PIN");
        toast({
          title: "Error",
          description: response.message || "Failed to setup PIN",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Setup PIN error:", error);
      setAuthError("Failed to setup PIN");
      toast({
        title: "Error",
        description: "Failed to setup PIN. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const verifyPIN = useCallback(async (userId: string, pin: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const response = await httpClient("/auth/verify-pin", {
        method: "POST",
        body: JSON.stringify({ userId, pin }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.success) {
        return true;
      } else {
        setAuthError(response.message || "Invalid PIN");
        toast({
          title: "Error",
          description: response.message || "Invalid PIN",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Verify PIN error:", error);
      setAuthError("PIN verification failed");
      toast({
        title: "Error",
        description: "PIN verification failed. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getLocalStorageItem("authToken");

      try {
        await httpClient("/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (apiError) {
        console.error("Logout API error (proceeding anyway):", apiError);
      }

      await clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      setCurrentBranchId(null);
      setCurrentBusinessId(null);
      setBusinessData(null);

      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout properly",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      authError,
      subscriptionStatus,
      currentBranchId,
      currentBusinessId,
      businessData,
      setCurrentBranchId,
      register,
      login,
      verifyOTP,
      resendOTP,
      setupPIN,
      verifyPIN,
      logout,
      refreshUser,
      checkAuth,
      getAuthHeaders,
    }),
    [
      user,
      isLoading,
      isAuthenticated,
      authError,
      subscriptionStatus,
      currentBranchId,
      currentBusinessId,
      businessData,
      register,
      login,
      verifyOTP,
      resendOTP,
      setupPIN,
      verifyPIN,
      logout,
      refreshUser,
      checkAuth,
      getAuthHeaders,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};