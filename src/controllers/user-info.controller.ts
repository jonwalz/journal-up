import { Elysia, t } from "elysia";
import { UserInfoService } from "../services/user-info.service";
import { authMiddleware } from "../middleware/auth";
import { ValidationError } from "../utils/errors";

export const userInfoController = new Elysia({ prefix: "/user-info" })
  .use(authMiddleware)
  .get("/", async ({ user }) => {
    const userInfoService = new UserInfoService();
    return await userInfoService.getUserInfo(user.id);
  })
  .post(
    "/",
    async ({ body, user }) => {
      const userInfoService = new UserInfoService();
      return await userInfoService.createUserInfo({
        ...body,
        userId: user.id,
      });
    },
    {
      body: t.Object({
        firstName: t.String(),
        lastName: t.String(),
        bio: t.Optional(t.String()),
        timezone: t.Optional(t.String()),
        growthGoals: t.Optional(
          t.Object({
            shortTerm: t.Array(t.String()),
            longTerm: t.Array(t.String()),
          })
        ),
      }),
    }
  )
  .patch(
    "/",
    async ({ body, user }) => {
      const userInfoService = new UserInfoService();
      return await userInfoService.updateUserInfo(user.id, body);
    },
    {
      body: t.Object({
        firstName: t.Optional(t.String()),
        lastName: t.Optional(t.String()),
        bio: t.Optional(t.String()),
        timezone: t.Optional(t.String()),
        growthGoals: t.Optional(
          t.Object({
            shortTerm: t.Array(t.String()),
            longTerm: t.Array(t.String()),
          })
        ),
      }),
    }
  )
  .delete("/", async ({ user }) => {
    const userInfoService = new UserInfoService();
    await userInfoService.deleteUserInfo(user.id);
    return { success: true };
  })
  .onError(({ error }) => {
    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          code: "VALIDATION_ERROR",
        }),
        { status: 400 }
      );
    }
    throw error;
  });
