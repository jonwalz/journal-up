import { Elysia, t } from "elysia";
import { JournalService } from "../services/journal.service";
import { authMiddleware } from "../middleware/auth";
import { ValidationError } from "../utils/errors";
import { UserInfoService } from "../services/user-info.service";

export const journalController = new Elysia({ prefix: "/journals" })
  .use(authMiddleware)
  .post(
    "/",
    async ({ body, user }) => {
      const journalService = new JournalService();
      return await journalService.createJournal(user.id, body.title);
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 255 }),
      }),
      error: ({ error }) => {
        if (error.message === "Validation Failed") {
          throw new ValidationError(error.message);
        }
        throw error;
      },
    }
  )
  .get(
    "/",
    async ({ user }) => {
      const journalService = new JournalService();
      return await journalService.getJournals(user.id);
    },
    {
      error: ({ error }) => {
        if (error.message === "Validation Failed") {
          throw new ValidationError(error.message);
        }
        throw error;
      },
    }
  )
  .post(
    "/:journalId/entries",
    async ({ params: { journalId }, body, user }) => {
      const journalService = new JournalService();

      console.log("User id:", user.id);
      const userInfoService = new UserInfoService();
      const userInfo = await userInfoService.getUserInfo(user.id);

      return await journalService.createEntry({
        userId: user.id,
        journalId,
        content: body.content,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: user.email,
      });
    },
    {
      body: t.Object({
        content: t.String({ minLength: 1 }),
      }),
      error: ({ error }) => {
        if (error.message === "Validation Failed") {
          throw new ValidationError(error.message);
        }
        throw error;
      },
    }
  )
  .get("/:journalId/entries", async ({ params: { journalId }, user }) => {
    const journalService = new JournalService();
    return await journalService.getEntries(user.id, journalId);
  });
