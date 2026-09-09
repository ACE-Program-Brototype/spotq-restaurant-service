import { container } from "@config/di/container";
import { Router } from "express";
import { TYPES } from "@/config/di/types";
import type { JwksController } from "../controllers/jwks.controller";

const jwksRouter = Router();

const jwksController = container.get<JwksController>(TYPES.JWKSController);

jwksRouter.get("/jwks.json", jwksController.getJwks.bind(jwksController));

export default jwksRouter;
