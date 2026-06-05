import { pgTable, serial, text, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  restaurantName: text("restaurant_name").notNull().default("Da Bao"),
  phone: text("phone").notNull().default("+966 56 516 1760"),
  whatsappNumber: text("whatsapp_number").notNull().default("966565161760"),
  address: text("address").notNull().default("Prince Saud Al Faisal, Ar Rawdah, Rovan Tower, Jeddah, Saudi Arabia"),
  openingHours: text("opening_hours").notNull().default("Open daily until 3:00 AM"),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).notNull().default("15"),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("15"),
  taxEnabled: boolean("tax_enabled").notNull().default(true),
  instagramUrl: text("instagram_url"),
  logoBase64: text("logo_base64"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
