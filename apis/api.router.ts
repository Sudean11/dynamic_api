import express from "express";
import {
  createApiHandler,
  deleteApiHandler,
  getApiByIdHandler,
  getApiHandler,
  updateApiHandler,
} from "./api.controller";

export const apiRouter = express.Router({ mergeParams: true });

apiRouter.get("/", getApiHandler);
apiRouter.post("/", express.json(), createApiHandler);
apiRouter.get("/:api_id", getApiByIdHandler);
apiRouter.put("/:api_id", express.json(), updateApiHandler);
apiRouter.delete("/:api_id", deleteApiHandler);
