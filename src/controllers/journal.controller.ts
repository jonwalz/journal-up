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

      const userInfoService = new UserInfoService();
      // TODO: Move to middleware
      let userInfo = await userInfoService.getUserInfo(user.id).catch(() => {
        return null;
      });

      if (!userInfo) {
        userInfo = await userInfoService.createUserInfo({
          userId: user.id,
          firstName: user.email.split("@")[0], // Use email username as default name
          lastName: "",
          timezone: "UTC", // Default timezone
        });
      }

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
