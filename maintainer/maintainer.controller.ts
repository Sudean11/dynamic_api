import { RequestHandler } from "express";
import { ProjectModel } from "../projects/project.model";
import { ErrorWithStatus } from "../helpers/types";

export const addMaintainerHandler: RequestHandler = async (req, res, next) => {
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

export const getMainterHandler: RequestHandler = async (req, res, next) => {
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

export const removeMaintainerHandler: RequestHandler = async (
  req,
  res,
  next
) => {
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
