import { TRPCError } from "@trpc/server";
import type Stripe from "stripe";
import { z } from "zod";
import { getPayloadClient } from "../getPayloadClient";
import { stripe } from "../lib/stripe";
import { privateProcedure, publicProcedure, router } from "./trpc";

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      let { productIds } = input;
      if (productIds.length === 0) throw new TRPCError({ code: "BAD_REQUEST" });

      const payload = await getPayloadClient();
      const { docs: products } = await payload.find({
        collection: "products",
        where: {
          id: {
            in: productIds
      }}});

      const filteredProducts = products.filter(product => Boolean(product.priceId));

      const order = await payload.create({
        collection: "orders",
        data: {
          _isPaid: false,
          products: filteredProducts.map(product => product.id),
          user: user.id
      }});

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      filteredProducts.forEach(product => {
        lineItems.push({
          price: product.priceId!,
          quantity: 1
        });
      });
      lineItems.push({
        price: "price_1PMjyyI7Ik3RuW8wcCBbBuUY",
        quantity: 1,
        adjustable_quantity: { enabled: false }
      });

      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
          payment_method_types: ["card"],
          mode: "payment",
          metadata: { userId: user.id, orderId: order.id },
          line_items: lineItems
        });

        return { url: stripeSession.url };
      } catch (error) {
        console.log(error);

        return { url: null };
      }
    }),

  pollOrderStatus: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const { orderId } = input;
      const payload = await getPayloadClient();

      const { docs: orders } = await payload.find({
        collection: "orders",
        where: {
          id: {
            equals: orderId
      }}});
      if (!orders.length) throw new TRPCError({ code: "NOT_FOUND" });

      const [order] = orders;

      return { isPaid: order._isPaid };
    })
});
