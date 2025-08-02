"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { httpClient } from "@/src/data/api/httpClient";
import { useAuth } from "./AuthContext";
// import { Alert } from "react-native";
import { toast } from "@/components/ui/use-toast"; 
import { useBranch } from "./BranchContext";
import { useBusiness } from "./BusinessContext";

interface BusinessInfo {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
}

interface BranchInfo {
  id: string;
  name: string;
  isMain: boolean;
  business: BusinessInfo;
}

export enum UserRole {
  OWNER = "owner",
  ADMIN = "admin",
  MANAGER = "manager",
  CASHIER = "cashier",
  ARTISAN = "artisan",
  INVENTORY_MANAGER = "inventory_manager",
  SALES_REP = "sales_rep",
  ACCOUNTANT = "accountant",
}
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // role: string;
  role: UserRole;
  profileImage?: string;
  branch?: BranchInfo;
  createdAt: string;
  status?: string;
  address?: string;
  lastLoginAt?: string;
}

interface CreateUserData extends Partial<UserProfile> {
  branchId: string; // Make branchId required
  password: string;
  pin: string;
}

interface UserContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  // Profile methods
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateProfileImage: (imageUri: string) => Promise<void>;
  deleteProfileImage: () => Promise<void>;
  // Security methods
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  changePIN: (currentPIN: string, newPIN: string) => Promise<void>;
  verifyPIN: (pin: string) => Promise<boolean>;
  setupPIN: (pin: string) => Promise<void>;
  // User management methods (for owners/managers)
  users: UserProfile[];
  resetUserPIN: (userId: string) => Promise<void>;
  // createUser: (userData: Partial<UserProfile>) => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<void>;
  getUsers: (branchId: string) => Promise<UserProfile[]>;
  getUser: (userId: string) => Promise<UserProfile>;
  updateUser: (userId: string, userData: Partial<UserProfile>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  // Current context
  currentBusiness: BusinessInfo | null;
  currentBranch: BranchInfo | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const { currentBranch } = useBranch();
  const { currentBusiness } = useBusiness();
  const { user, currentBranchId } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Helper function for API calls
  const makeRequest = async (
    endpoint: string,
    method: string = "GET",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any,
    headers?: Record<string, string>
  ) => {
    try {
      setLoading(true);
      setError(null);
      return await httpClient(endpoint, { method, body, headers });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Request failed";
      setError(errorMessage);
      console.error(`${method} ${endpoint} error:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Profile methods
  const fetchUserProfile = async () => {
    if (!user?.id) throw new Error("User not authenticated");
    const response = await makeRequest(`/users/${user.id}`);
    setUserProfile(response);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user?.id) throw new Error("User not authenticated");
    const response = await makeRequest(
      `/users/${user.id}`,
      "PUT",
      JSON.stringify(data),
      {
        "Content-Type": "application/json",
      }
    );
    setUserProfile(response.user);
  };

  const updateProfileImage = async (imageUri: string) => {
    if (!user?.id) throw new Error("User not authenticated");
    const formData = new FormData();
    formData.append("profileImage", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    const response = await makeRequest(
      `/users/${user.id}/profile-image`,
      "PUT",
      formData,
      { "Content-Type": "multipart/form-data" }
    );
    setUserProfile(response.user);
  };

  const deleteProfileImage = async () => {
    if (!user?.id) throw new Error("User not authenticated");
    const response = await makeRequest(
      `/users/${user.id}/profile-image`,
      "DELETE"
    );
    setUserProfile(response.user);
  };

  // Security methods
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!user?.id) throw new Error("User not authenticated");
    await makeRequest(
      `/users/${user.id}/password`,
      "PUT",
      JSON.stringify({ currentPassword, newPassword }),
      {
        "Content-Type": "application/json",
      }
    );
  };

  const changePIN = async (currentPIN: string, newPIN: string) => {
    if (!user?.id) throw new Error("User not authenticated");
    await makeRequest(
      `/users/${user.id}/pin`,
      "PUT",
      JSON.stringify({ currentPIN, newPIN }),
      {
        "Content-Type": "application/json",
      }
    );
  };

const resetUserPIN = async (userId: string) => {
  try {
    setLoading(true);
    await makeRequest(`/users/${userId}/reset-pin`, "POST");
    toast({
      title: "Success",
      description: "PIN reset successfully",
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to reset PIN";
    setError(errorMessage);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    throw err;
  } finally {
    setLoading(false);
  }
};
  const verifyPIN = async (pin: string) => {
    if (!user?.id) throw new Error("User not authenticated");
    const response = await makeRequest(
      `/users/${user.id}/verify-pin`,
      "POST",
      JSON.stringify({ pin }),
      { "Content-Type": "application/json" }
    );
    return response.isValid;
  };

  const setupPIN = async (pin: string) => {
    if (!user?.id) throw new Error("User not authenticated");
    await makeRequest(
      `/users/${user.id}/setup-pin`,
      "POST",
      JSON.stringify({ pin }),
      { "Content-Type": "application/json" }
    );
  };

  // User management methods (for owners/managers)

  const createUser = async (userData: CreateUserData) => {
    try {
      setLoading(true);
      const response = await makeRequest(
        "/users",
        "POST",
        JSON.stringify(userData),
        {
          "Content-Type": "application/json",
        }
      );
      // Refresh users list after creation
      if (currentBranchId) {
        await getUsers(currentBranchId);
      }
      return response.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async (branchId: string) => {
    try {
      setLoading(true);
      const response = await makeRequest(`/users/branch/${branchId}`);
      setUsers(response.users);
      return response.users;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const getUser = async (userId: string) => {
    const response = await makeRequest(`/users/${userId}`);
    return response.user;
  };

  const updateUser = async (userId: string, userData: Partial<UserProfile>) => {
    const response = await makeRequest(
      `/users/${userId}`,
      "PUT",
      JSON.stringify(userData),
      {
        "Content-Type": "application/json",
      }
    );
    return response.user;
  };

  const deleteUser = async (userId: string) => {
    await makeRequest(`/users/${userId}`, "DELETE");
  };

  const value: UserContextType = {
    userProfile,
    loading,
    error,
    // Profile methods
    fetchUserProfile,
    updateUserProfile,
    updateProfileImage,
    deleteProfileImage,
    // Security methods
    changePassword,
    changePIN,
    verifyPIN,
    setupPIN,
    // User management
    users,
    resetUserPIN,
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    // Current context
    currentBusiness,
    currentBranch: currentBranch
      ? {
          id: currentBranch.id,
          name: currentBranch.name,
          isMain: currentBranch.isMain,
          business: currentBusiness as BusinessInfo,
        }
      : null,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
