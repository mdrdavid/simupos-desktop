// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      phoneNumber: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      department?: {
        id: string | null;
        name: string | null;
        status: string | null;
      };
      tokens?: {
        accessToken: string;
        refreshToken: string;
      } | null;
    };
  }
}
