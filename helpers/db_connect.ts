import mongoose from "mongoose";

export function db_connect() {
  if (process.env.MONGDB_URL) {
    mongoose
      .connect(process.env.MONGDB_URL)
      .then(() => console.log("DB connected"))
      .catch(console.log);
  } else {
  }
}
