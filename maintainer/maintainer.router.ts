import express from "express";
import {
  addMaintainerHandler,
  getMainterHandler,
  removeMaintainerHandler,
} from "./maintainer.controller";

export const maintainerRouter = express.Router({ mergeParams: true });

maintainerRouter.post("/", express.json(), addMaintainerHandler);
maintainerRouter.get("/", express.json(), getMainterHandler);
maintainerRouter.delete(
  "/:maintainer_id",
  express.json(),
  removeMaintainerHandler
);
