import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return NextResponse.json({ error: "Senha inválida" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return NextResponse.json({ error: "JWT_SECRET não definido" }, { status: 500 });
    }

    // JWT expira em 15 minutos
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: 60 * 15 });

    // Criar resposta com cookies
    const response = NextResponse.json(
        { message: "Login realizado com sucesso" }, 
        { status: 200 }
    );
    
    // Definir cookie userToken
    response.cookies.set("userToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60, // 1 hora em segundos
        path: "/",
    });

    // Definir cookie userId
    response.cookies.set("userId", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60, // 1 hora em segundos
        path: "/",
    });

    return response;
}
