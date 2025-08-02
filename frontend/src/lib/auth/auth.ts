import jwt from "jsonwebtoken";
import { getSession, signOut } from "next-auth/react";
import { httpClient } from "@/src/data/api/httpClient";

interface User {
  name: string | null;
  email: string | null;
  image?: string | null;
  department: {
    id: string | null;
    name: string | null;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
  } | null;
}
interface DecodedToken {
  exp: number;
}

const refreshUserToken = async (
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const response = await httpClient("/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    return response; // Assumes API returns { accessToken, refreshToken }
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const setHeaders = async () => {
  const session = await getSession();
  const user: User | null = (session?.user as User) || null;

  if (!user || !user.email) {
    throw new Error("User is not authenticated.");
  }

  const tokens = user.tokens;

  if (!tokens?.accessToken || !tokens.refreshToken) {
    throw new Error("Missing tokens. Please sign in again.");
  }

  let { accessToken, refreshToken } = tokens;

  try {
    // Decode the token to check expiry
    const decodedToken: DecodedToken | null = jwt.decode(
      accessToken,
    ) as DecodedToken | null;

    if (!decodedToken || !decodedToken.exp) {
      throw new Error("Invalid access token format.");
    }

    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (decodedToken.exp < currentTime) {
      console.log("Access token expired. Refreshing...");
      const newTokens = await refreshUserToken(refreshToken);

      // Update tokens
      accessToken = newTokens.accessToken;
      refreshToken = newTokens.refreshToken;
    }
  } catch (error) {
    console.error("Error handling tokens:", error);

    await signOut();
    throw new Error("Authentication error. Please sign in again.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };
};
