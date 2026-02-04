"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";

export async function loginAction(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/portal/dashboard",
    });
  } catch (error: any) {
    if (error?.type === "CredentialsSignin") {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
}

export async function registerAction(
  name: string,
  email: string,
  password: string,
  token?: string
) {
  // Verify invitation token
  if (token) {
    const verification = await db.verificationToken.findFirst({
      where: { token, expires: { gt: new Date() } },
    });
    if (!verification) {
      return { error: "Invalid or expired invitation link" };
    }
    // Delete the used token
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verification.identifier,
          token,
        },
      },
    });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "CLIENT",
    },
  });

  return { success: true };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
