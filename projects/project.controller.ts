import { RequestHandler, Request, Response, NextFunction } from "express";
import { Project, ProjectModel } from "./project.model";
import {
  ErrorWithStatus,
  SingleProject,
  StandardResponse,
} from "../helpers/types";

export const getProjectHandler: RequestHandler<
  unknown,
  StandardResponse<{ projects: Project[]; totalCount: number }>,
  unknown,
  { page: number }
> = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const elementsPerPage: number = 5;
    let { page } = req.query;
    const projects: Project[] = await ProjectModel.find({
      "Maintained_by.email": req.token.email,
    })
      .skip((+page - 1) * elementsPerPage)
      .limit(elementsPerPage);

    const count = await ProjectModel.find({
      "Maintained_by.email": req.token.email,
    });
    const totalCount = count.length;

    if (!projects || projects.length === 0) {
      throw new ErrorWithStatus("Projects not found", 404);
    }
    res.status(200).json({
      success: true,
      data: { projects: projects, totalCount: totalCount },
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
> = async (req: Request, res: Response, next: NextFunction) => {
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
    console.log(savedProject);
    res.status(201).json({ success: true, data: savedProject });
  } catch (error) {
    next(error);
  }
};

// Get Project by ID Handler
export const getProjectByIdHandler: RequestHandler<
  { project_id: string },
  StandardResponse<Project>,
  unknown,
  unknown
> = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { project_id } = req.params;
    const project = await ProjectModel.findById({ _id: project_id });
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
  { project_id: string },
  StandardResponse<Project>,
  SingleProject,
  unknown
> = async (req: Request, res: Response, next: NextFunction) => {
  const { project_id } = req.params;
  const updateData = req.body;

  try {
    const updatedProject = await ProjectModel.updateOne(
      { _id: project_id },
      { $set: { name: updateData.name } }
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
  { project_id: string },
  StandardResponse<number>,
  unknown,
  unknown
> = async (req: Request, res: Response, next: NextFunction) => {
  const { project_id } = req.params;

  try {
    const deletedProject = await ProjectModel.deleteOne({ _id: project_id });
    if (!deletedProject) {
      throw new ErrorWithStatus("Project not found", 404);
    }

    res.status(200).json({ success: true, data: deletedProject.deletedCount });
  } catch (error) {
    next(error);
  }
};
