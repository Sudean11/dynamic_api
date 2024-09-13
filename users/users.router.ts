import express, { json } from "express";
import {
  get_all_users,
  signin_handler,
  signup_handler,
} from "./users.handlers";
import { verifyToken } from "./users.middleware";

const userRouter = express.Router();

userRouter.post("/signin", json(), signin_handler);
userRouter.post("/signup", json(), signup_handler);
userRouter.get("/", verifyToken, get_all_users);

export default userRouter;
