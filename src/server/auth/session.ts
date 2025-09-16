import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export async function createSession(uid: number) {
  const token = await new SignJWT({ uid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  (await cookies()).set("sid", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  (await cookies()).set("sid", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<{ uid: number } | null> {
  const c = (await cookies()).get("sid")?.value;
  if (!c) return null;
  try {
    const { payload } = await jwtVerify(c, secret);
    return { uid: Number(payload.uid) };
  } catch {
    return null;
  }
}

// import { SignJWT, jwtVerify } from "jose";
// import { cookies } from "next/headers";

// const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

// export async function createSession(uid: number) {
//   const token = await new SignJWT({ uid })
//     .setProtectedHeader({ alg: "HS256" })
//     .setIssuedAt()
//     .setExpirationTime("7d")
//     .sign(secret);

//   (await cookies()).set("sid", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     path: "/",
//     maxAge: 60 * 60 * 24 * 7,
//   });
// }

// export async function clearSession() {
//   (await cookies()).set("sid", "", {
//     httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 0,
//   });
// }

// export async function getSession(): Promise<{ uid: number } | null> {
//   const c = (await cookies()).get("sid")?.value;
//   if (!c) return null;
//   try {
//     const { payload } = await jwtVerify(c, secret);
//     return { uid: Number(payload.uid) };
//   } catch {
//     return null;
//   }
// }
