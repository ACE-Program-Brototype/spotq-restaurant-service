import { Router } from "express";
import { container } from "@/config/di/container";
import { TYPES } from "@/config/di/types";
import { JWKS_ROUTES } from "@/shared/constants/route.constants";
import type { JwksController } from "../controllers/jwks.controller";

const jwksRouter = Router();

const jwksController = container.get<JwksController>(TYPES.JWKSController);

jwksRouter.get(JWKS_ROUTES.JWKS, jwksController.getJwks.bind(jwksController));

export default jwksRouter;

