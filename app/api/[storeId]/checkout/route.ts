import Stripe from "stripe";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { Product } from "@prisma/client";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const { productIds } = await req.json();
  let outOfStock = false;

  if (!productIds || productIds.length === 0) {
    return new NextResponse("Product ids are required", { status: 400 });
  }

  productIds.forEach((item: { amount: number }) => {
    if (!item.amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    if (item.amount < 1) {
      return new NextResponse("Amount must be greater than 0", { status: 400 });
    }
  });

  const products = await prismadb.product.findMany({
    where: { id: { in: productIds.map((item: { id: string }) => item.id) } },
  });

  const productsAmounts = products.map((product) => {
    const amount = productIds.find(
      (item: { id: string; amount: number }) => item.id === product.id
    )?.amount;

    if (amount > product.inventory) {
      outOfStock = true;
    }

    return { product, amount };
  });

  if (outOfStock) {
    return new NextResponse("Product is out of stock", { status: 400 });
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  productsAmounts.forEach((item) => {
    line_items.push({
      quantity: item.amount,
      price_data: {
        currency: "USD",
        product_data: { name: item.product.name },
        unit_amount: item.product.price.toNumber() * 100,
      },
    });
  });

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      orderItems: {
        create: productIds.map((item: { id: string; amount: number }) => ({
          product: { connect: { id: item.id } },
          amount: item.amount,
        })),
      },
    },
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: "payment",
    billing_address_collection: "required",
    phone_number_collection: { enabled: true },
    success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
    metadata: { orderId: order.id },
  });

  return NextResponse.json({ url: session.url }, { headers: corsHeaders });
}
