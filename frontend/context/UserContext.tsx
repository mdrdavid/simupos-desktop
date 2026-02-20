"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { httpClient } from "@/src/data/api/httpClient";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useBranch } from "./BranchContext";
import { useBusiness } from "./BusinessContext";

interface BusinessInfo {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string | null;
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
  resetUserPIN: (userId: string, pin: string) => Promise<void>;
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
  const { user, currentBranchId, getAuthHeaders } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  // Deduping and caching for branch users fetches
  const inFlightUsersFetchRef = useRef<Map<string, Promise<UserProfile[]>>>(
    new Map()
  );
  const usersCacheRef = useRef<
    Map<string, { data: UserProfile[]; ts: number }>
  >(new Map());
  const USERS_CACHE_TTL_MS = 3000; // 3 seconds cooldown to avoid rate limits

  // Helper function for API calls
  const makeRequest = useCallback(
    async (
      endpoint: string,
      method: string = "GET",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body?: any,
      headers?: Record<string, string>
    ) => {
      try {
        setLoading(true);
        setError(null);
        let mergedHeaders: Record<string, string> = headers || {};
        try {
          const authHeaders = await getAuthHeaders();
          mergedHeaders = { ...authHeaders, ...mergedHeaders };
        } catch {
          // getAuthHeaders may redirect if token missing; proceed to let httpClient handle
        }
        return await httpClient(endpoint, {
          method,
          body,
          headers: mergedHeaders,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Request failed";
        setError(errorMessage);
        console.error(`${method} ${endpoint} error:`, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Profile methods
  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) throw new Error("User not authenticated");
    const response = await makeRequest(`/users/${user.id}`);
    setUserProfile(response);
  }, [makeRequest, user?.id]);

  const updateUserProfile = useCallback(
    async (data: Partial<UserProfile>) => {
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
    },
    [makeRequest, user?.id]
  );

  const updateProfileImage = useCallback(
    async (imageUri: string) => {
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
    },
    [makeRequest, user?.id]
  );

  const deleteProfileImage = useCallback(async () => {
    if (!user?.id) throw new Error("User not authenticated");
    const response = await makeRequest(
      `/users/${user.id}/profile-image`,
      "DELETE"
    );
    setUserProfile(response.user);
  }, [makeRequest, user?.id]);

  // Security methods
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      await makeRequest(
        `/users/${user.id}/password`,
        "PUT",
        JSON.stringify({ currentPassword, newPassword }),
        {
          "Content-Type": "application/json",
        }
      );
    },
    [makeRequest, user?.id]
  );

  const changePIN = useCallback(
    async (currentPIN: string, newPIN: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      await makeRequest(
        `/users/${user.id}/pin`,
        "PUT",
        JSON.stringify({ currentPIN, newPIN }),
        {
          "Content-Type": "application/json",
        }
      );
    },
    [makeRequest, user?.id]
  );

  const resetUserPIN = useCallback(
    async (userId: string, pin: string) => {
      try {
        setLoading(true);
        await makeRequest(
          `/users/${userId}/reset-pin`,
          "POST",
          JSON.stringify({ pin }),
          { "Content-Type": "application/json" }
        );
        toast({
          title: "Success",
          description: "PIN reset successfully",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to reset PIN";
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
    },
    [makeRequest]
  );
  const verifyPIN = useCallback(
    async (pin: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      const response = await makeRequest(
        `/users/${user.id}/verify-pin`,
        "POST",
        JSON.stringify({ pin }),
        { "Content-Type": "application/json" }
      );
      return response.isValid;
    },
    [makeRequest, user?.id]
  );

  const setupPIN = useCallback(
    async (pin: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      await makeRequest(
        `/users/${user.id}/setup-pin`,
        "POST",
        JSON.stringify({ pin }),
        { "Content-Type": "application/json" }
      );
    },
    [makeRequest, user?.id]
  );

  // User management methods (for owners/managers)

  const getUsers = useCallback(
    async (branchId: string) => {
      // Return cached data if fresh
      const cached = usersCacheRef.current.get(branchId);
      const now = Date.now();
      if (cached && now - cached.ts < USERS_CACHE_TTL_MS) {
        setUsers(cached.data);
        return cached.data;
      }

      // Deduplicate in-flight requests
      const existing = inFlightUsersFetchRef.current.get(branchId);
      if (existing) {
        return existing;
      }

      const promise = (async () => {
        try {
          setLoading(true);
          const response = await makeRequest(`/users/branch/${branchId}`);
          setUsers(response.users);
          usersCacheRef.current.set(branchId, {
            data: response.users,
            ts: Date.now(),
          });
          return response.users;
        } finally {
          inFlightUsersFetchRef.current.delete(branchId);
          setLoading(false);
        }
      })();

      inFlightUsersFetchRef.current.set(branchId, promise);
      return promise;
    },
    [makeRequest]
  );

  const createUser = useCallback(
    async (userData: CreateUserData) => {
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
    },
    [makeRequest, currentBranchId, getUsers]
  );

  const getUser = useCallback(
    async (userId: string) => {
      const response = await makeRequest(`/users/${userId}`);
      return response.user;
    },
    [makeRequest]
  );

  const updateUser = useCallback(
    async (userId: string, userData: Partial<UserProfile>) => {
      const response = await makeRequest(
        `/users/${userId}`,
        "PUT",
        JSON.stringify(userData),
        {
          "Content-Type": "application/json",
        }
      );
      return response.user;
    },
    [makeRequest]
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      await makeRequest(`/users/${userId}`, "DELETE");
    },
    [makeRequest]
  );

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
