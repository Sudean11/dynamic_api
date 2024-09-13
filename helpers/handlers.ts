import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  ErrorRequestHandler,
} from "express";
import { ErrorWithStatus, StandardResponse } from "./types";
import { Project, ProjectModel } from "../projects/project.model";
import {
  manualTokenVerification,
  verifyToken,
} from "../users/users.middleware";

export const config = async () => {
  try {
    const projects: Project[] = await ProjectModel.find({});
    return projects;
  } catch (error) {}
};

// Dynamic and No Route Handler
export const dynamicAndNoRouteHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  config().then(async (response) => {
    try {
      const allRoutes = response?.flatMap(
        (singleProject) => singleProject.api_list
      );
      const route_object = allRoutes?.filter(
        (route) => route.route === req.url.slice(1) && route.type === req.method
      )[0];

      if (!route_object) {
        next(new ErrorWithStatus("Route not found", 404));
      } else {
        const verified = route_object.auth
          ? await manualTokenVerification(req, res, next)
          : true;

        if (verified) {
          res.status(route_object?.response_status).json({
            success: true,
            data: JSON.parse(route_object?.response),
          });
        }
      }
    } catch (error) {
      next(error);
    }
  });
};

// RouteHandler class with No Route Handler
export class RouteHandler {
  noRouteHandler: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    next(new ErrorWithStatus("Page not found", 404));
  };
}

// Function to create a No Route Handler
export function createNoRouteHandler() {
  const noRouteHandler: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    // Code specific to this instance (if needed)
    console.log("New instance of noRouteHandler created");
    res.status(404).send("Not Found");
  };
  return noRouteHandler;
}

// Error Handler
export const errorHandler: ErrorRequestHandler = (
  err: Error | ErrorWithStatus,
  req: Request<any, StandardResponse<string>, any, any>,
  res: Response<StandardResponse<string>>,
  next: NextFunction
) => {
  if (err instanceof ErrorWithStatus) {
    res.status(err.statusCode).json({ success: false, data: err.message });
  } else if (err instanceof Error) {
    res.status(500).json({ success: false, data: err.message });
  } else {
    res.status(500).json({ success: false, data: "Something went wrong!" });
  }
};

// Dynamic Route Handler
export const dynamicRouteHandler: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const newStr = req.url.slice(1);

  try {
    const projects = await ProjectModel.aggregate([
      { $unwind: "$api_list" },
      {
        $match: {
          "api_list.route": newStr,
        },
      },
    ]);

    if (projects[0].api_list.auth) {
      await verifyToken(req, res, next);

      if (!req.token) {
        res.status(400).json({ success: false, data: "API Key doesn't match" });
        return;
      }
    }

    res
      .status(projects[0].api_list.response_status)
      .json({ success: true, data: JSON.parse(projects[0].api_list.response) });
  } catch (error) {
    console.log("catch error");
    next(error);
  }
};
