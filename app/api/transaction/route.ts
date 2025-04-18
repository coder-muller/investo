import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkValidUser } from "@/lib/checkValidUser";

export async function GET() {
    try {
        const userId = await checkValidUser()

        const transactions = await prisma.transaction.findMany({
            where: {
                product: {
                    userId: userId
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                product: true
            }
        })

        return NextResponse.json(transactions)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const { productId, type, quantity, price, date } = await request.json()

    try {
        const userId = await checkValidUser()

        // Verify the product belongs to the user
        const product = await prisma.product.findUnique({
            where: { 
                id: productId,
                userId: userId
            }
        })

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        const transaction = await prisma.transaction.create({
            data: {
                type,
                quantity: Number(quantity),
                price: Number(price),
                date: new Date(date),
                productId
            }
        })

        return NextResponse.json(transaction)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    const { id, productId, type, quantity, price, date } = await request.json()

    try {
        const userId = await checkValidUser()

        // Verify the transaction belongs to a product owned by the user
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                product: true
            }
        })

        if (!transaction || transaction.product.userId !== userId) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
        }

        const updatedTransaction = await prisma.transaction.update({
            where: { id },
            data: { 
                type, 
                quantity: Number(quantity), 
                price: Number(price), 
                date: new Date(date),
                productId
            }
        })

        return NextResponse.json(updatedTransaction)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    const { id } = await request.json()

    try {
        const userId = await checkValidUser()

        // Verify the transaction belongs to a product owned by the user
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                product: true
            }
        })

        if (!transaction || transaction.product.userId !== userId) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
        }

        await prisma.transaction.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Transaction deleted successfully" })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
} 