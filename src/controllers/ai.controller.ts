import { Elysia, t } from "elysia";
import { aiService } from "../services/ai/ai.service";
import { authMiddleware } from "../middleware/auth";
import { type AuthUser } from "../utils/jwt";

type WSContext = {
  user: AuthUser;
};

type MessageData = {
  message: string;
};

const chatSchema = {
  body: t.Object({
    message: t.String(),
  }),
  response: t.Object({
    message: t.String(),
    context: t.Optional(
      t.Object({
        relatedEntries: t.Optional(t.Array(t.String())),
        growthIndicators: t.Optional(t.Array(t.String())),
        suggestedActions: t.Optional(t.Array(t.String())),
      })
    ),
  }),
};

export const aiController = new Elysia()
  .ws("/chat", {
    body: t.Object({
      message: t.String(),
    }),
    message: async (ws, data: unknown) => {
      const message = data as MessageData;
      console.log("Received message:", message.message);

      ws.send({
        message: message.message,
      });

      // try {
      //   const user = ws.data.user;

      //   // Send chunks as they arrive
      //   const onProgress = (chunk: string) => {
      //     ws.send({ message: chunk, isPartial: true });
      //   };

      //   const response = await aiService.chat(
      //     user.id,
      //     message.message,
      //     onProgress
      //   );

      //   // Send final complete response
      //   ws.send({ ...response, isComplete: true });
      // } catch (error) {
      //   console.error("WebSocket error:", error);
      //   ws.send({
      //     message: "Failed to process message",
      //     context: {
      //       suggestedActions: ["Please try again later"],
      //     },
      //     error: true,
      //   });
      // }
    },
  })
  .post(
    "/analyze",
    async ({ body, user }) => {
      const analysis = await aiService.analyzeEntryContent(body.content);
      return analysis;
    },
    {
      body: t.Object({
        content: t.String(),
      }),
      response: t.Object({
        sentiment: t.Object({
          score: t.Number(),
          label: t.Union([
            t.Literal("positive"),
            t.Literal("negative"),
            t.Literal("neutral"),
          ]),
          confidence: t.Number(),
        }),
        growthIndicators: t.Array(
          t.Object({
            type: t.Union([
              t.Literal("resilience"),
              t.Literal("effort"),
              t.Literal("challenge"),
              t.Literal("feedback"),
              t.Literal("learning"),
            ]),
            confidence: t.Number(),
            evidence: t.String(),
          })
        ),
      }),
    }
  )
  .post(
    "/graph",
    async ({ body, user }) => {
      const result = await aiService.addToGraph(user.id, body.data);
      return result;
    },
    {
      body: t.Object({
        data: t.Any(),
      }),
      response: t.Object({
        success: t.Boolean(),
        message: t.String(),
      }),
    }
  );
