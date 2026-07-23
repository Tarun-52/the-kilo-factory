import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

export const authOptions = {
  providers: [
    // ── Admin email/password login ──────────────────────────────────
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@dawatexpress.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin@123";

        const inputEmail = (credentials?.email ?? "").trim().toLowerCase();
        const inputPassword = credentials?.password ?? "";

        if (inputEmail === adminEmail.toLowerCase() && inputPassword === adminPassword) {
          const dbUser = await db.user.upsert({
            where: { email: adminEmail },
            create: { email: adminEmail, name: "Admin", mobile: null, image: null },
            update: { name: "Admin" },
          });

          const existingAdmin = await db.adminUser.findUnique({ where: { email: adminEmail } });
          if (!existingAdmin) {
            await db.adminUser.create({
              data: { name: "Admin", email: adminEmail, password: "env-credentials", role: "super_admin" },
            });
          }

          return { id: dbUser.id, email: adminEmail, name: "Admin", image: null, isAdmin: true };
        }
        return null;
      },
    }),



        // --- Kitchen Staff Login ---
    CredentialsProvider({
      id: "kitchen-credentials",
      name: "Kitchen Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await db.adminUser.findUnique({
          where: { email: credentials.email }
        });

        if (!user || user.password !== credentials.password || user.role !== "kitchen") {
          return null;
        }

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),


    // ── Google OAuth for users ──────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/" },
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        try {
          const dbUser = await db.user.upsert({
            where: { email: user.email },
            create: { email: user.email, name: user.name ?? user.email?.split("@")[0] ?? "User", mobile: null, image: user.image ?? null },
            update: { name: user.name, image: user.image },
          });
          const adminRecord = await db.adminUser.findUnique({ where: { email: user.email } });
          user.id = dbUser.id;
          user.isAdmin = !!adminRecord;
        } catch (error) {
          console.error("[signIn] Error upserting Google user:", error);
          return false;
        }
      }
      return true;
    },
        async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.isAdmin = token.isAdmin === true;
        session.user.image = token.image ?? null;
        // Pass role to frontend
        if (token.role) {
          session.user.role = token.role;
        }
      }
      return session;
    },
        async jwt({ token, user, account }: any) {
      if (user) {
        token.isAdmin = user.isAdmin === true;
        token.image = user.image ?? null;
        // Save role if coming from credentials login
        if (user.role) {
          token.role = user.role;
        }
      }
      return token;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
};