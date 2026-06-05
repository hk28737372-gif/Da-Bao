import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import menuItemsRouter from "./menuItems";
import ordersRouter from "./orders";
import settingsRouter from "./settings";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(menuItemsRouter);
router.use(ordersRouter);
router.use(settingsRouter);
router.use(analyticsRouter);

export default router;
