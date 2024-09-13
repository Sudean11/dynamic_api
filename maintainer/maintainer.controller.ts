import { RequestHandler, Request, Response, NextFunction } from "express";
import { ProjectModel } from "../projects/project.model";
import { ErrorWithStatus } from "../helpers/types";

// Define types for request parameters and body
interface AddMaintainerRequestBody {
  _id: string;
  fullname: string;
  email: string;
}

interface RemoveMaintainerRequestParams {
  project_id: string;
  maintainer_id: string;
}

// Add Maintainer Handler
export const addMaintainerHandler: RequestHandler<
  { project_id: string }, // Params
  { success: boolean; data: number }, // Response
  AddMaintainerRequestBody // Body
> = async (
  req: Request<
    { project_id: string },
    { success: boolean; data: number },
    AddMaintainerRequestBody
  >,
  res: Response<{ success: boolean; data: number }>,
  next: NextFunction
) => {
  try {
    const projectID = req.params.project_id;
    const result = await ProjectModel.updateOne(
      { _id: projectID },
      { $addToSet: { Maintained_by: req.body } }
    );
    res.status(201).json({ success: true, data: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

// Get Maintainers Handler
export const getMaintainerHandler: RequestHandler<
  { project_id: string }, // Params
  { success: boolean; data: any[] }, // Response
  unknown, // Body
  unknown // Query
> = async (req, res, next) => {
  try {
    const projectId = req.params.project_id;
    const project = await ProjectModel.findById(projectId, "Maintained_by");

    if (!project) {
      throw new ErrorWithStatus("Project not found", 404);
    }
    res.status(200).json({ success: true, data: project.Maintained_by });
  } catch (error) {
    next(error);
  }
};

// Remove Maintainer Handler
export const removeMaintainerHandler: RequestHandler<
  RemoveMaintainerRequestParams, // Params
  { success: boolean; data: any }, // Response
  unknown, // Body
  unknown // Query
> = async (req, res, next) => {
  const { project_id, maintainer_id } = req.params;

  try {
    const result = await ProjectModel.findByIdAndUpdate(
      project_id,
      { $pull: { Maintained_by: { _id: maintainer_id } } },
      { new: true }
    );
    if (!result) {
      throw new ErrorWithStatus("Project not found", 404);
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
