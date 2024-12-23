import { Elysia, t } from "elysia";
import { aiService } from "../services/ai/ai.service";
import { verifyToken } from "../utils/jwt";

type MessageData = {
  type: string;
  payload: {
    id: string;
    message: string;
    timestamp: string;
    userId: string;
  };
};

export const aiController = new Elysia({ prefix: "/ai" })
  .ws("/chat", {
    // schema: {
    //   body: t.Object({
    //     message: t.String(),
    //   }),
    //   response: t.Object({
    //     message: t.String(),
    //     isPartial: t.Optional(t.Boolean()),
    //     isComplete: t.Optional(t.Boolean()),
    //   }),
    //   // Add headers if needed
    //   headers: t.Object({
    //     authorization: t.String(),
    //     "x-session-token": t.String(),
    //   }),
    // },
    // open: async ({ data, close }) => {
    //   const authHeader = data.headers.authorization;
    //   const sessionToken = data.headers["x-session-token"];

    //   if (!authHeader || !sessionToken) {
    //     close();
    //     return;
    //   }

    //   const [bearer, token] = authHeader.split(" ");
    //   if (bearer !== "Bearer" || !token) {
    //     close();
    //     return;
    //   }

    //   try {
    //     const user = await verifyToken(token);
    //     // Store user in the WebSocket instance's custom property
    //     (data as any).user = user;
    //   } catch (error) {
    //     close();
    //   }
    // },
    body: t.Object({
      type: t.String(),
      payload: t.Object({
        id: t.String(),
        message: t.String(),
        timestamp: t.String(),
      }),
    }),
    message: async (ws, data: unknown) => {
      const headers = ws.data.headers;
      console.log("Headers: ", headers);
      const message = data as MessageData;
      console.log("Received message:", message.payload.message);

      try {
        // Send chunks as they arrive
        const onProgress = (chunk: string) => {
          ws.send({ message: chunk, isPartial: true });
        };

        const response = await aiService.chat(
          message.payload.userId,
          message.payload.message,
          onProgress
        );

        console.log("AI Chat Response:", response);
        // Send final complete response
        ws.send({
          ...response,
          isComplete: true,
          id: message.payload.id,
        });
      } catch (error) {
        console.error("WebSocket error:", error);
        ws.send({
          message: "Failed to process message",
          context: {
            suggestedActions: ["Please try again later"],
          },
          error: true,
        });
      }
    },
  })
  .post(
    "/analyze",
    async ({ body }) => {
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
    async ({ body }) => {
      const result = await aiService.addToGraph(body.userId, body.data);
      return result;
    },
    {
      body: t.Object({
        userId: t.String(),
        data: t.Any(),
      }),
      response: t.Object({
        success: t.Boolean(),
        message: t.String(),
      }),
    }
  );
