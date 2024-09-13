import { RequestHandler, response } from "express";
import { ApiPackageModel } from "../package/apipackage.model";
import { Project, ProjectModel } from "../projects/project.model";
import mongoose from "mongoose";
import {
  ApiList,
  ErrorWithStatus,
  SingleProject,
  StandardResponse,
} from "../helpers/types";
// import { setupRoutes } from "../app";

export const getApiHandler: RequestHandler<
  { project_id: string },
  StandardResponse<{ api_list: any; totalCount: number | undefined }>,
  unknown,
  { page: number }
> = async (req, res, next) => {
  try {
    const projectId = req.params.project_id;
    const project: Project | null = await ProjectModel.findOne({
      _id: projectId,
    });
    let { page } = req.query;
    if (page == undefined) {
      page = 1;
    }
    const total_count: number | undefined = project?.api_list.length;

    const api_list = await ProjectModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(projectId) } },
      { $unwind: "$api_list" },
      { $project: { api_list: 1, _id: 0 } },
      { $skip: (page - 1) * 5 },
      { $limit: 5 },
    ]);

    if (!project) {
      throw new ErrorWithStatus("Project not found", 404);
    }

    res.status(200).json({
      success: true,
      data: { api_list: api_list, totalCount: total_count },
    });
  } catch (error) {
    next(error);
  }
};

export const createApiHandler: RequestHandler<
  { project_id: string },
  StandardResponse<Number>,
  ApiList,
  unknown
> = async (req, res, next) => {
  try {
    const projectID = req.params.project_id;
    const { route, type, response, auth } = req.body;
    const existingAPI = await ProjectModel.findOne({
      $and: [
        { "api_list.route": route },
        {
          "api_list.type": type,
        },
      ],
    });
    if (existingAPI) throw new ErrorWithStatus("Route already exists", 400);

    const result = await ProjectModel.updateOne(
      { _id: projectID },
      { $push: { api_list: req.body } }
    );
    res.status(201).json({ success: true, data: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

export const getApiByIdHandler: RequestHandler<
  { project_id: string; api_id: string },
  StandardResponse<Number>,
  ApiList,
  unknown
> = async (req, res, next) => {
  const { project_id, api_id } = req.params;

  try {
    const project = await ProjectModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(project_id) } },
      { $unwind: "$api_list" },
      { $match: { "api_list._id": new mongoose.Types.ObjectId(api_id) } },
      { $project: { api_list: 1 } },
    ]);

    if (project.length === 0) {
      throw new ErrorWithStatus("API item not found", 404);
    }

    res.status(200).json({ success: true, data: project[0].api_list });
  } catch (error) {
    next(error);
  }
};

export const updateApiHandler: RequestHandler<
  { project_id: string; api_id: string },
  StandardResponse<Number>,
  ApiList,
  unknown
> = async (req, res, next) => {
  const { project_id, api_id } = req.params;
  const updateData = req.body;

  try {
    const result = await ProjectModel.updateOne(
      { _id: project_id, "api_list._id": api_id },
      { $set: { "api_list.$": updateData } }
    );

    if (result.modifiedCount === 0) {
      throw new ErrorWithStatus("Api item not found or update not needed", 404);
    }
    res.status(200).json({ success: true, data: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

export const deleteApiHandler: RequestHandler<
  { project_id: string; api_id: string },
  StandardResponse<number>,
  unknown,
  unknown
> = async (req, res, next) => {
  const { project_id, api_id } = req.params;

  try {
    const result = await ProjectModel.updateOne(
      { _id: project_id },
      { $pull: { api_list: { _id: api_id } } }
    );
    if (!result) {
      throw new ErrorWithStatus("Project not found or update not needed", 404);
    }
    res.status(200).json({ success: true, data: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};
