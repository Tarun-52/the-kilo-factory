/* eslint-disable @typescript-eslint/no-empty-object-type */
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      isAdmin: boolean;
    };
  }

  interface User {
    id?: string;
    name: string;
    email: string;
    image?: string | null;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    isAdmin?: boolean;
    image?: string | null;
  }
}