import { Schema, InferSchemaType, model } from "mongoose";

export const projectSchema = new Schema(
  {
    Maintained_by: [
      {
        _id: { type: String },
        fullname: { type: String },
        email: { type: String, unique: false },
      },
    ],
    name: { type: String },
    api_list: [
      {
        route: { type: String, required: true },
        type: { type: String, required: true },
        response: { type: String, required: true },
        auth: { type: Boolean, required: true },
        response_status: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export type Project = InferSchemaType<typeof projectSchema>;
export const ProjectModel = model<Project>("project", projectSchema);
