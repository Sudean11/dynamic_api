import { Schema, InferSchemaType, model } from "mongoose";

export const apiPackageSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    package_name: { type: String, require: true },
    total_project: { type: Number, require: true },
  },
  { timestamps: true, versionKey: false }
);

export type ApiPackage = InferSchemaType<typeof apiPackageSchema>;
export const ApiPackageModel = model<ApiPackage>(
  "api_package",
  apiPackageSchema
);
