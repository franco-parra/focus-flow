import "server-only";
import { jwtVerify } from "jose";

if (!process.env.SIGNIN_KEY || !process.env.ALGORITHM) {
  throw new Error("SIGNIN_KEY and ALGORITHM must be set");
}

const secretKey = process.env.SIGNIN_KEY;
const encodedKey = new TextEncoder().encode(secretKey);

export async function verifyToken(token: string) {
  try {
    await jwtVerify(token, encodedKey, {
      algorithms: [process.env.ALGORITHM as string],
    });
    return true;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}
