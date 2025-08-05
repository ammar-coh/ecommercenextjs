// auth.ts
// auth.ts (at project root)
import NextAuth from "next-auth";
// import type { NextAuthConfig } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import {dbConnect} from "./lib/dbConnect";
import Author from "./models/author";
import mongoose from "mongoose";
// import the built-in NextAuth types:
import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

interface authUser{
  name: string,
  email: string,
  image: string
}
interface authProfile{
  id: string,
  login: string,
  bio: string
}
const authOptions: any  = {
  providers: [
    GitHubProvider({
      clientId:     process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    // 1️⃣ signIn: after GitHub OAuth, ensure an Author exists

    async signIn(context: any) {
      const { user, account, profile } = context;
      await dbConnect();
      const githubId = profile.id.toString();
      const existing = await Author.findOne({ githubId });
      if (!existing) {
        await Author.create({
          githubId,
          name:     user.name,
          username: (profile as any).login,
          email:    user.email,
          image:    user.image,
          bio:      (profile as any).bio || "",
        });
      }
      return true;
    },

    // 2️⃣ jwt: on first sign-in, attach the Mongo _id to the token
    async jwt(
      context: any
    //   {
    //   token,
    //   account,
    //   profile,
    // }: {
    //   token: import("next-auth/jwt").JWT;
    //   account: Record<string, any>;
    //   profile: Record<string, any>;
    // }
  ) {
      const { token, account, profile } = context;
      if (account && profile) {
        await dbConnect();
        const doc = await Author.findOne({ githubId: profile.id.toString() });
        if (doc) {
          // cast the unknown _id to Mongoose’s ObjectId
          const _id = (doc._id as mongoose.Types.ObjectId).toHexString();
          token.id = _id;
        }
      }
      return token;
    },

    // 3️⃣ session: expose that _id on session.user.id
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      session.user = session.user || {};
      session.user.id = token.id as string;
      return session;
    },
  },
};

export const {handlers, signIn, signOut, auth} = NextAuth(authOptions);




// import NextAuth from "next-auth"
// import GitHub from "next-auth/providers/github"
 
// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [GitHub],
// })