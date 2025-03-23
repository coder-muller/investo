import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
    const cookieStore = await cookies()
    cookieStore.delete("userToken")
    cookieStore.delete("userId")
    return NextResponse.json({ message: "Deslogado com sucesso" }, { status: 200 })
}   
