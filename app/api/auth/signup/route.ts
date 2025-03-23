import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { Plan } from "@prisma/client";
export async function POST(request: NextRequest) {
    const { name, email, password } = await request.json();
    const proEmail = process.env.PRO_EMAIL;

    if (!name || !email || !password) {
        return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: { name, email, password: hashedPassword, plan: proEmail === email ? Plan.PRO : Plan.FREE },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 });
    }

    return NextResponse.json({ message: "Usuário criado com sucesso" }, { status: 201 });
}
