"use server";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginAction(_: unknown, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password";
    }
    throw error; // re-throw NEXT_REDIRECT so Next.js handles navigation
  }
}
