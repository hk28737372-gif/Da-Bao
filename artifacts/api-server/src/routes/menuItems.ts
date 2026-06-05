import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, menuItemsTable, categoriesTable } from "@workspace/db";
import {
  ListMenuItemsQueryParams,
  CreateMenuItemBody,
  GetMenuItemParams,
  GetMenuItemResponse,
  UpdateMenuItemParams,
  UpdateMenuItemBody,
  UpdateMenuItemResponse,
  DeleteMenuItemParams,
  ListMenuItemsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/menu-items", async (req, res): Promise<void> => {
  const query = ListMenuItemsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db
    .select({
      id: menuItemsTable.id,
      categoryId: menuItemsTable.categoryId,
      categoryName: categoriesTable.name,
      name: menuItemsTable.name,
      description: menuItemsTable.description,
      ingredients: menuItemsTable.ingredients,
      price: menuItemsTable.price,
      imageUrl: menuItemsTable.imageUrl,
      isAvailable: menuItemsTable.isAvailable,
      isFeatured: menuItemsTable.isFeatured,
      createdAt: menuItemsTable.createdAt,
    })
    .from(menuItemsTable)
    .leftJoin(categoriesTable, eq(menuItemsTable.categoryId, categoriesTable.id))
    .where(
      query.data.categoryId
        ? eq(menuItemsTable.categoryId, query.data.categoryId)
        : sql`1=1`
    )
    .orderBy(categoriesTable.sortOrder, menuItemsTable.name);

  res.json(ListMenuItemsResponse.parse(rows.map(formatItem)));
});

router.post("/menu-items", async (req, res): Promise<void> => {
  const parsed = CreateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(menuItemsTable).values(parsed.data).returning();
  const withCategory = await getItemWithCategory(item.id);
  res.status(201).json(GetMenuItemResponse.parse(withCategory));
});

router.get("/menu-items/:id", async (req, res): Promise<void> => {
  const params = GetMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const item = await getItemWithCategory(params.data.id);
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.json(GetMenuItemResponse.parse(item));
});

router.patch("/menu-items/:id", async (req, res): Promise<void> => {
  const params = UpdateMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .update(menuItemsTable)
    .set(parsed.data)
    .where(eq(menuItemsTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  const withCategory = await getItemWithCategory(item.id);
  res.json(UpdateMenuItemResponse.parse(withCategory));
});

router.delete("/menu-items/:id", async (req, res): Promise<void> => {
  const params = DeleteMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(menuItemsTable)
    .where(eq(menuItemsTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.sendStatus(204);
});

async function getItemWithCategory(id: number) {
  const rows = await db
    .select({
      id: menuItemsTable.id,
      categoryId: menuItemsTable.categoryId,
      categoryName: categoriesTable.name,
      name: menuItemsTable.name,
      description: menuItemsTable.description,
      ingredients: menuItemsTable.ingredients,
      price: menuItemsTable.price,
      imageUrl: menuItemsTable.imageUrl,
      isAvailable: menuItemsTable.isAvailable,
      isFeatured: menuItemsTable.isFeatured,
      createdAt: menuItemsTable.createdAt,
    })
    .from(menuItemsTable)
    .leftJoin(categoriesTable, eq(menuItemsTable.categoryId, categoriesTable.id))
    .where(eq(menuItemsTable.id, id));
  return rows[0] ? formatItem(rows[0]) : null;
}

function formatItem(item: {
  id: number;
  categoryId: number | null;
  categoryName: string | null;
  name: string;
  description: string | null;
  ingredients: string | null;
  price: unknown;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: Date;
}) {
  return {
    ...item,
    price: parseFloat(item.price as string),
    createdAt: item.createdAt.toISOString(),
  };
}

export default router;
