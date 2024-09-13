import express, { json } from "express";
import {
  createProjectHandler,
  deleteProjectHandler,
  getProjectByIdHandler,
  getProjectHandler,
  updateProjectHandler,
} from "./project.controller";
import { apiRouter } from "../apis/api.router";
import { maintainerRouter } from "../maintainer/maintainer.router";

export const projectRouter = express.Router({ mergeParams: true });

projectRouter.get("/", getProjectHandler);
projectRouter.post("/", json(), createProjectHandler);
projectRouter.get("/:project_id", getProjectByIdHandler);
projectRouter.put("/:project_id", express.json(), updateProjectHandler);
projectRouter.delete("/:project_id", deleteProjectHandler);

projectRouter.use("/:project_id/api", apiRouter);
projectRouter.use("/:project_id/maintainer", maintainerRouter);
