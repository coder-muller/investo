import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkValidUser } from "@/lib/checkValidUser";

export async function GET() {
    try {
        const userId = await checkValidUser()

        const products = await prisma.product.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                Transaction: true,
                Dividend: true,
                Expense: true,
                RealizedProfitLoss: true
            }
        })

        return NextResponse.json(products)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {

    const { ticker, name, type, quantity, price } = await request.json()

    try {
        const userId = await checkValidUser()

        const product = await prisma.product.create({
            data: {
                ticker,
                name,
                type,
                quantity: Number(quantity),
                averagePrice: Number(price),
                price: Number(price),
                dividend: 0,
                expenses: 0,
                userId
            }
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    const { id, ticker, name, type, quantity, averagePrice, price, dividend, expenses } = await request.json()

    try {
        const userId = await checkValidUser()

        const product = await prisma.product.update({
            where: { id, userId },
            data: { ticker, name, type, quantity, averagePrice, price, dividend, expenses }
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    const { id } = await request.json()

    try {
        const userId = await checkValidUser()

        await prisma.product.delete({
            where: { id, userId }
        })

        return NextResponse.json({ message: "Product deleted successfully" })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}




