import { Elysia } from "elysia";

export const indexController = new Elysia().get("/", () => {
  return { message: "Hello from Journal Up" };
});
