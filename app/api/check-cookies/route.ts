import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const userToken = cookieStore.get("userToken");
    const userId = cookieStore.get("userId");

    return NextResponse.json({
        userTokenExists: !!userToken,
        userIdExists: !!userId,
    });
} 