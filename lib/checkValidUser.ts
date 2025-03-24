import { cookies } from "next/headers"
import { jwtDecode } from "jwt-decode"

export async function checkValidUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get("userToken")

    if (!token) {
        throw new Error("Unauthorized")
    }

    const decodedToken = jwtDecode(token.value)
    const currentTime = Date.now() / 1000

    if (decodedToken.exp && decodedToken.exp < currentTime) {
        throw new Error("Unauthorized")
    }

    const userId = cookieStore.get('userId')

    if (!userId) {
        throw new Error("Unauthorized")
    }

    return userId.value
}