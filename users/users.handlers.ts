import "dotenv/config";
import { RequestHandler } from "express";
import { ErrorWithStatus, StandardResponse } from "../helpers/types";
import { hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { User, UserModel } from "./user.model";

export const signin_handler: RequestHandler<
  unknown,
  StandardResponse<unknown>,
  { email: string; password: string },
  unknown
> = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) throw new ErrorWithStatus("User not found", 401);
    if (!user.password) throw new ErrorWithStatus("Please enter password", 401);

    const match = await compare(password, user.password);
    if (!match) throw new ErrorWithStatus("Wrong password", 401);

    const jwt = sign(
      {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
      process.env.PRIVATE_KEY as string
    );

    res.status(200).json({
      success: true,
      data: { fullname: user.fullname, email: user.email, token: jwt },
    });
  } catch (error) {
    next(error);
  }
};

export const signup_handler: RequestHandler<
  unknown,
  StandardResponse<boolean>,
  User
> = async (req, res, next) => {
  try {
    const new_user = req.body;
    if (!new_user.password)
      throw new ErrorWithStatus("Password not passed", 401);
    const hashed_password = await hash(new_user.password, 10);
    const results = await UserModel.create({
      ...new_user,
      password: hashed_password,
    });
    res.status(200).json({ success: true, data: true });
  } catch (error) {
    next(error);
  }
};

export const get_all_users: RequestHandler = async (req, res, next) => {
  const userList = await UserModel.find({});
  res.status(200).json({ success: true, data: userList });
};
