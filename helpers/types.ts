export class ErrorWithStatus extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}

export interface StandardResponse<T = unknown> {
  success: boolean;
  data: T;
}

export interface Token {
  _id: string;
  fullname: string;
  email: string;
}

export interface SingleProject {
  _id: string;
  name: string;
  Maintained_by: MaintainedBy[];
  api_list: ApiList[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintainedBy {
  _id: string;
  fullname: string;
  email: string;
}

export interface ApiList {
  route: string;
  type: string;
  response: string;
  auth: boolean;
  response_status: number;
  _id: string;
}
