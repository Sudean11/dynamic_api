import { Schema, InferSchemaType, model } from "mongoose";
import { apiPackageSchema } from "../package/apipackage.model";

export const userSchema = new Schema({
  fullname: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  package: apiPackageSchema,
});

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model<User>("user", userSchema);
