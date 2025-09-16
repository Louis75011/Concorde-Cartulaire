// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { jwtVerify } from "jose";

// const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// export async function GET() {
//   // cookies() est async, il faut await
//   const cookieStore = await cookies();
//   const token = cookieStore.get("sid")?.value;

//   if (!token) {
//     return NextResponse.json({ authenticated: false }, { status: 401 });
//   }

//   try {
//     const { payload } = await jwtVerify(token, secret);
//     return NextResponse.json({
//       authenticated: true,
//       uid: payload.uid,
//     });
//   } catch {
//     return NextResponse.json({ authenticated: false }, { status: 401 });
//   }
// }
