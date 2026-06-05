import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { sql, gte, and } from "drizzle-orm";
import {
  GetAnalyticsSummaryResponse,
  GetOrdersByDayResponse,
  GetTopItemsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics/summary", async (_req, res): Promise<void> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalsRow] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      totalRevenue: sql<number>`coalesce(sum(total::numeric), 0)::float`,
      pendingOrders: sql<number>`count(*) filter (where status = 'pending')::int`,
    })
    .from(ordersTable);

  const [todayRow] = await db
    .select({
      todayOrders: sql<number>`count(*)::int`,
      todayRevenue: sql<number>`coalesce(sum(total::numeric), 0)::float`,
    })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, todayStart));

  const totalOrders = totalsRow?.totalOrders ?? 0;
  const totalRevenue = totalsRow?.totalRevenue ?? 0;

  const summary = {
    totalOrders,
    totalRevenue,
    todayOrders: todayRow?.todayOrders ?? 0,
    todayRevenue: todayRow?.todayRevenue ?? 0,
    pendingOrders: totalsRow?.pendingOrders ?? 0,
    avgOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
  };

  res.json(GetAnalyticsSummaryResponse.parse(summary));
});

router.get("/analytics/orders-by-day", async (_req, res): Promise<void> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', created_at), 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(total::numeric), 0)::float`,
    })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, thirtyDaysAgo))
    .groupBy(sql`date_trunc('day', created_at)`)
    .orderBy(sql`date_trunc('day', created_at)`);

  res.json(GetOrdersByDayResponse.parse(rows));
});

router.get("/analytics/top-items", async (_req, res): Promise<void> => {
  // Unnest the JSONB items array and aggregate per menu item
  const rows = await db.execute(sql`
    SELECT
      (item->>'menuItemId')::int AS "menuItemId",
      item->>'name' AS name,
      sum((item->>'quantity')::int)::int AS "totalOrdered",
      sum((item->>'price')::numeric * (item->>'quantity')::int)::float AS "totalRevenue"
    FROM orders,
    jsonb_array_elements(items) AS item
    GROUP BY (item->>'menuItemId')::int, item->>'name'
    ORDER BY "totalOrdered" DESC
    LIMIT 10
  `);

  res.json(GetTopItemsResponse.parse(rows.rows));
});

export default router;
