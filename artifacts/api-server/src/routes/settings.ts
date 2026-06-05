import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import {
  UpdateSettingsBody,
  GetSettingsResponse,
  UpdateSettingsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  const rows = await db.select().from(settingsTable).limit(1);
  if (rows.length === 0) {
    // Auto-create default settings if none exist
    const [settings] = await db.insert(settingsTable).values({}).returning();
    res.json(GetSettingsResponse.parse(formatSettings(settings)));
    return;
  }
  res.json(GetSettingsResponse.parse(formatSettings(rows[0])));
});

router.patch("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = await db.select().from(settingsTable).limit(1);

  let result;
  if (rows.length === 0) {
    [result] = await db
      .insert(settingsTable)
      .values({ ...parsed.data, updatedAt: new Date() })
      .returning();
  } else {
    [result] = await db
      .update(settingsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .returning();
  }

  res.json(UpdateSettingsResponse.parse(formatSettings(result)));
});

function formatSettings(s: typeof settingsTable.$inferSelect) {
  return {
    ...s,
    deliveryFee: parseFloat(s.deliveryFee as unknown as string),
    taxRate: parseFloat(s.taxRate as unknown as string),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export default router;
