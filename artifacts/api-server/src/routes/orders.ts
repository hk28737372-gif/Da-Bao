import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, settingsTable } from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusResponse,
  ListOrdersResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/orders", async (_req, res): Promise<void> => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(ordersTable.createdAt);
  res.json(ListOrdersResponse.parse(orders.map(formatOrder)));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Fetch settings for fee/tax calculation
  const settingsRows = await db.select().from(settingsTable).limit(1);
  const settings = settingsRows[0] ?? {
    deliveryFee: "15",
    taxRate: "15",
    taxEnabled: true,
  };

  const deliveryFee =
    parsed.data.orderType === "delivery"
      ? parseFloat(settings.deliveryFee as unknown as string)
      : 0;

  const subtotal = parsed.data.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const taxRate = settings.taxEnabled
    ? parseFloat(settings.taxRate as unknown as string) / 100
    : 0;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

  const [order] = await db
    .insert(ordersTable)
    .values({
      ...parsed.data,
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    })
    .returning();

  res.status(201).json(GetOrderResponse.parse(formatOrder(order)));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(GetOrderResponse.parse(formatOrder(order)));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(UpdateOrderStatusResponse.parse(formatOrder(order)));
});

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    ...o,
    items: o.items as Array<{ menuItemId: number; name: string; price: number; quantity: number }>,
    subtotal: parseFloat(o.subtotal as unknown as string),
    deliveryFee: parseFloat(o.deliveryFee as unknown as string),
    tax: parseFloat(o.tax as unknown as string),
    total: parseFloat(o.total as unknown as string),
    createdAt: o.createdAt.toISOString(),
  };
}

export default router;
