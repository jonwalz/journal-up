import { Elysia, t } from 'elysia';
import { aiService } from '../services/ai.service';
import { authMiddleware } from '../middleware/auth';

export const aiController = new Elysia({ prefix: '/ai' })
  .use(authMiddleware)
  .post(
    '/chat',
    async ({ body, user }) => {
      const response = await aiService.chat(user.id, body.message);
      return response;
    },
    {
      body: t.Object({
        message: t.String()
      }),
      response: t.Object({
        message: t.String(),
        context: t.Optional(
          t.Object({
            relatedEntries: t.Optional(t.Array(t.String())),
            growthIndicators: t.Optional(t.Array(t.String())),
            suggestedActions: t.Optional(t.Array(t.String()))
          })
        )
      })
    }
  )
  .post(
    '/analyze',
    async ({ body }) => {
      const analysis = await aiService.analyzeEntryContent(body.content);
      return analysis;
    },
    {
      body: t.Object({
        content: t.String()
      }),
      response: t.Object({
        sentiment: t.Object({
          score: t.Number(),
          label: t.Union([
            t.Literal('positive'),
            t.Literal('negative'),
            t.Literal('neutral')
          ]),
          confidence: t.Number()
        }),
        growthIndicators: t.Array(
          t.Object({
            type: t.Union([
              t.Literal('resilience'),
              t.Literal('effort'),
              t.Literal('challenge'),
              t.Literal('feedback'),
              t.Literal('learning')
            ]),
            confidence: t.Number(),
            evidence: t.String()
          })
        )
      })
    }
  );
