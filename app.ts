import "dotenv/config";
import express, { RequestHandler, json } from "express";

import { db_connect } from "./helpers/db_connect";
import cors from "cors";
import morgan from "morgan";
import userRouter from "./users/users.router";
import { errorHandler, dynamicAndNoRouteHandler } from "./helpers/handlers";
import { projectRouter } from "./projects/project.router";
import { verifyToken } from "./users/users.middleware";

//Init
const app = express();

//Config
db_connect();
app.disable("x-powered-by");

//Middleware
app.use(morgan("dev"));
app.use(cors());

//Routers
const router = express.Router();
router.use("/users", userRouter);
router.use("/projects", verifyToken, projectRouter);
app.use(router);

//Dynamic And No Route handler
app.use(dynamicAndNoRouteHandler);

//Error Handlers
app.use(errorHandler);

//Bootstrap
app.listen(3000, () => {
  console.log("Server listening on 3000");
});
