import { RequestHandler, Request, Response, NextFunction } from "express";
import { Project, ProjectModel } from "./project.model";
import {
  ErrorWithStatus,
  SingleProject,
  StandardResponse,
} from "../helpers/types";

// Define types for request params and query parameters
interface GetProjectQuery {
  page?: string;
}

interface GetProjectParams {
  project_id?: string;
}

export const getProjectHandler: RequestHandler<
  unknown,
  StandardResponse<{ projects: Project[]; totalCount: number }>,
  unknown,
  GetProjectQuery
> = async (
  req: Request<
    unknown,
    StandardResponse<{ projects: Project[]; totalCount: number }>,
    unknown,
    GetProjectQuery
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const elementsPerPage: number = 5;
    const page = parseInt(req.query.page || "1", 10); // Ensure page is a number
    const projects: Project[] = await ProjectModel.find({
      "Maintained_by.email": req.token.email,
    })
      .skip((page - 1) * elementsPerPage)
      .limit(elementsPerPage);

    const count = await ProjectModel.countDocuments({
      "Maintained_by.email": req.token.email,
    });
    const totalCount = count;

    if (!projects || projects.length === 0) {
      throw new ErrorWithStatus("Projects not found", 404);
    }
    res.status(200).json({
      success: true,
      data: { projects, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

// Create Project Handler
export const createProjectHandler: RequestHandler<
  unknown,
  StandardResponse<Project>,
  SingleProject,
  unknown
> = async (
  req: Request<unknown, StandardResponse<Project>, SingleProject, unknown>,
  res: Response,
  next: NextFunction
) => {
  try {
    const savedProject = await ProjectModel.create({
      ...req.body,
      Maintained_by: [
        {
          _id: req.token._id,
          fullname: req.token.fullname,
          email: req.token.email,
        },
      ],
    });
    res.status(201).json({ success: true, data: savedProject });
  } catch (error) {
    next(error);
  }
};

// Get Project by ID Handler
export const getProjectByIdHandler: RequestHandler<
  GetProjectParams,
  StandardResponse<Project>,
  unknown,
  unknown
> = async (
  req: Request<GetProjectParams, StandardResponse<Project>, unknown, unknown>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { project_id } = req.params;
    const project = await ProjectModel.findById(project_id);
    if (!project) {
      throw new ErrorWithStatus("Project not found", 404);
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// Update Project Handler
export const updateProjectHandler: RequestHandler<
  GetProjectParams,
  StandardResponse<Project | null>,
  SingleProject,
  unknown
> = async (
  req: Request<
    GetProjectParams,
    StandardResponse<Project | null>,
    SingleProject,
    unknown
  >,
  res: Response,
  next: NextFunction
) => {
  const { project_id } = req.params;
  const updateData = req.body;

  try {
    const updatedProject = await ProjectModel.findByIdAndUpdate(
      project_id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedProject) {
      throw new ErrorWithStatus("Project not found", 404);
    }
    res.status(200).json({ success: true, data: updatedProject });
  } catch (error) {
    next(error);
  }
};

// Delete Project Handler
export const deleteProjectHandler: RequestHandler<
  GetProjectParams,
  StandardResponse<number>,
  unknown,
  unknown
> = async (
  req: Request<GetProjectParams, StandardResponse<number>, unknown, unknown>,
  res: Response,
  next: NextFunction
) => {
  const { project_id } = req.params;

  try {
    const deletedProject = await ProjectModel.deleteOne({ _id: project_id });
    if (deletedProject.deletedCount === 0) {
      throw new ErrorWithStatus("Project not found", 404);
    }

    res.status(200).json({ success: true, data: deletedProject.deletedCount });
  } catch (error) {
    next(error);
  }
};
