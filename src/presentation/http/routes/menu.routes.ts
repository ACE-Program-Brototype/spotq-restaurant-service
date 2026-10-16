import { Router } from "express";
import {
	menuCategoryController,
	menuItemController,
} from "@/config/di/controllers.resolutions";
import { RESTAURANT_ROUTES } from "@/shared/constants/route.constants";
import { restaurantOrStaffAuthMiddleware } from "../middleware/restaurant-or-staff.auth.middleware";
import { restaurantOwnerAuthMiddleware } from "../middleware/restaurant-owner.auth.middleware";
import { staffAuthMiddleware } from "../middleware/staff.auth.middleware";
import {
	validateRequestBody,
	validateRequestParams,
	validateRequestQuery,
} from "../middleware/validation.middleware";
import {
	createMenuCategoryBodySchema,
	createMenuCategoryParamsSchema,
} from "../validators/create-menu-category.validator";
import {
	createMenuItemBodySchema,
	createMenuItemParamsSchema,
} from "../validators/create-menu-item.validator";
import { deleteMenuCategoryParamsSchema } from "../validators/delete-menu-category.validator";
import { deleteMenuItemParamsSchema } from "../validators/delete-menu-item.validator";
import { getMenuItemDetailsParamsSchema } from "../validators/get-menu-item-details.validator";
import { listMenuCategoriesParamSchema } from "../validators/list-menu-categories.validator";
import {
	listMenuItemsParamsSchema,
	listMenuItemsQuerySchema,
} from "../validators/list-menu-items.validator";
import {
	listStaffMenuItemsParamsSchema,
	listStaffMenuItemsQuerySchema,
} from "../validators/list-staff-menu-items.validator";
import { updateMenuItemVariantStatusParamsSchema } from "../validators/menu-item/update-menu-item-variant-status.validator";
import {
	updateMenuCategoryBodySchema,
	updateMenuCategoryParamsSchema,
} from "../validators/update-menu-category.validator";
import {
	updateMenuCategoryStatusBodySchema,
	updateMenuCategoryStatusParamsSchema,
} from "../validators/update-menu-category-status.validator";
import {
	updateMenuItemBodySchema,
	updateMenuItemParamsSchema,
} from "../validators/update-menu-item.validator";
import {
	updateMenuItemStatusBodySchema,
	updateMenuItemStatusParamsSchema,
} from "../validators/update-menu-item-status.validator";

export const menuRouter = Router();

menuRouter.post(
	RESTAURANT_ROUTES.MENU_ITEMS,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(createMenuItemParamsSchema),
	validateRequestBody(createMenuItemBodySchema),
	menuItemController.createMenuItem.bind(menuItemController),
);

menuRouter.post(
	RESTAURANT_ROUTES.MENU_CATEGORIES,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(createMenuCategoryParamsSchema),
	validateRequestBody(createMenuCategoryBodySchema),
	menuCategoryController.createCategory,
);

menuRouter.patch(
	RESTAURANT_ROUTES.MENU_CATEGORY_UPDATE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(updateMenuCategoryParamsSchema),
	validateRequestBody(updateMenuCategoryBodySchema),
	menuCategoryController.updateCategory,
);

menuRouter.patch(
	RESTAURANT_ROUTES.MENU_CATEGORY_STATUS_UPDATE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(updateMenuCategoryStatusParamsSchema),
	validateRequestBody(updateMenuCategoryStatusBodySchema),
	menuCategoryController.updateCategoryStatus,
);

menuRouter.delete(
	RESTAURANT_ROUTES.MENU_CATEGORY_DELETE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(deleteMenuCategoryParamsSchema),
	menuCategoryController.deleteCategory,
);

menuRouter.get(
	RESTAURANT_ROUTES.MENU_ITEMS,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(listMenuItemsParamsSchema),
	validateRequestQuery(listMenuItemsQuerySchema),
	menuItemController.listMenuItems,
);

menuRouter.get(
	[
		RESTAURANT_ROUTES.STAFF_MENU_ITEMS,
		RESTAURANT_ROUTES.STAFF_MENU_ITEMS_PREFIX,
	],
	staffAuthMiddleware,
	validateRequestParams(listStaffMenuItemsParamsSchema),
	validateRequestQuery(listStaffMenuItemsQuerySchema),
	menuItemController.listStaffMenuItems,
);

menuRouter.get(
	RESTAURANT_ROUTES.MENU_CATEGORIES,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(listMenuCategoriesParamSchema),
	menuCategoryController.listRestaurantCategories,
);

menuRouter.get(
	[
		RESTAURANT_ROUTES.STAFF_MENU_CATEGORIES,
		RESTAURANT_ROUTES.STAFF_MENU_CATEGORIES_PREFIX,
	],
	staffAuthMiddleware,
	validateRequestParams(listMenuCategoriesParamSchema),
	menuCategoryController.listStaffCategories,
);

menuRouter.get(
	RESTAURANT_ROUTES.MENU_ITEM_DETAIL,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(getMenuItemDetailsParamsSchema),
	menuItemController.getMenuItemDetails,
);

menuRouter.put(
	RESTAURANT_ROUTES.MENU_ITEM_UPDATE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(updateMenuItemParamsSchema),
	validateRequestBody(updateMenuItemBodySchema),
	menuItemController.updateMenuItem,
);

menuRouter.patch(
	RESTAURANT_ROUTES.MENU_ITEM_UPDATE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(updateMenuItemParamsSchema),
	validateRequestBody(updateMenuItemBodySchema),
	menuItemController.updateMenuItem,
);

menuRouter.patch(
	RESTAURANT_ROUTES.MENU_ITEM_STATUS_UPDATE,
	restaurantOrStaffAuthMiddleware,
	validateRequestParams(updateMenuItemStatusParamsSchema),
	validateRequestBody(updateMenuItemStatusBodySchema),
	menuItemController.updateMenuItemStatus,
);

menuRouter.patch(
	RESTAURANT_ROUTES.MENU_ITEM_VARIANT_STATUS_UPDATE,
	restaurantOrStaffAuthMiddleware,
	validateRequestParams(updateMenuItemVariantStatusParamsSchema),
	menuItemController.updateMenuItemVariantStatus,
);

menuRouter.get(
	RESTAURANT_ROUTES.CUSTOMER_MENU_ITEM_DETAIL,
	validateRequestParams(getMenuItemDetailsParamsSchema),
	menuItemController.getCustomerMenuItemDetails,
);

menuRouter.delete(
	RESTAURANT_ROUTES.MENU_ITEM_DELETE,
	restaurantOwnerAuthMiddleware,
	validateRequestParams(deleteMenuItemParamsSchema),
	menuItemController.deleteMenuItem,
);
