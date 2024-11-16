import { app } from "./app";
import { authController } from "./controllers/auth.controller";
import { journalController } from "./controllers/journal.controller";
import { metricsController } from "./controllers/metrics.controller";
import { aiController } from "./controllers/ai.controller";
import { settingsController } from "./controllers/settings.controller";

app
  // .use(testController)
  .use(authController)
  .use(journalController)
  .use(metricsController)
  .use(aiController)
  .use(settingsController)
  .onError(({ error, set }) => {
    console.error("Error:", error);

    if (error.name === "ValidationError") {
      set.status = 400;
      return { error: error.message };
    }

    if (error.name === "AuthenticationError") {
      set.status = 401;
      return { error: error.message };
    }

    if (error.name === "AuthorizationError") {
      set.status = 403;
      return { error: error.message };
    }

    if (error.name === "NotFoundError") {
      set.status = 404;
      return { error: error.message };
    }

    if (error.name === "ConflictError") {
      set.status = 409;
      return { error: error.message };
    }

    set.status = 500;
    return { error: "Internal Server Error" };
  })
  .listen(process.env.PORT);

console.log(
  `🚀 Journal-Up API is running at ${app.server?.hostname}:${app.server?.port}`
);
