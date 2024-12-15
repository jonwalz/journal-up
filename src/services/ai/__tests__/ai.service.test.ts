import { AIService } from "../ai.service";
import { ZepClient } from "@getzep/zep-cloud";
import { AppError } from "../../../utils/errors";
import { describe, beforeEach, expect, mock, it, type Mock } from "bun:test";

// Mock the ZepClient
mock.module("@getzep/zep-cloud", () => {
  return {
    // Mock the ZepClient class
    ZepClient: class MockZepClient {
      constructor() {}

      // Mock memory store methods
      async memory() {
        return {
          searchMemory: async () => ({
            memories: [
              {
                content: "Mocked memory content",
                summary: "Mocked summary",
                timestamp: new Date().toISOString(),
              },
            ],
          }),
          addMemory: async () => ({ success: true }),
          deleteMemory: async () => ({ success: true }),
        };
      }

      // Mock session methods
      async session() {
        return {
          create: async () => ({ sessionId: "mock-session-123" }),
          get: async () => ({
            sessionId: "mock-session-123",
            metadata: { userId: "user-123" },
          }),
          update: async () => ({ success: true }),
          delete: async () => ({ success: true }),
        };
      }
    },
  };
});

describe("AIService", () => {
  let aiService: AIService;
  let mockZepClient: {
    memory: {
      search: Mock<any>;
    };
    graph: {
      add: Mock<any>;
    };
  };

  beforeEach(() => {
    // Clear all mocks before each test
    mock.restore();

    // Create a mock implementation of ZepClient with proper typing
    mockZepClient = {
      memory: {
        search: mock(() => Promise.resolve([])),
      },
      graph: {
        add: mock(() => Promise.resolve()),
      },
    };

    // Mock the ZepClient constructor
    mock.module("@getzep/zep-cloud", () => ({
      ZepClient: mock(() => mockZepClient),
    }));

    // Create a new instance of AIService for each test
    aiService = new AIService();
  });

  describe("initializeUserMemory", () => {
    it("should successfully initialize user memory", async () => {
      // Arrange
      const userId = "test-user-id";
      mockZepClient.memory.search.mockResolvedValue([]);

      // Act
      await aiService.initializeUserMemory(userId);

      // Assert
      expect(mockZepClient.memory.search).toHaveBeenCalledWith(
        "journal_entries",
        {
          text: `Initializing memory for user ${userId}`,
          metadata: {
            type: "initialization",
            userId,
          },
        }
      );
    });

    it("should throw AppError when initialization fails", async () => {
      // Arrange
      const userId = "test-user-id";
      const error = new Error("ZepClient error");
      mockZepClient.memory.search.mockRejectedValue(error);

      // Act & Assert
      await expect(aiService.initializeUserMemory(userId)).rejects.toThrow(
        new AppError(
          500,
          "AI_SERVICE_ERROR",
          "Failed to initialize user memory"
        )
      );
    });
  });

  describe("searchMemory", () => {
    it("should successfully search memory and return results", async () => {
      // Arrange
      const query = "test query";
      const mockMemories = [
        {
          message: { content: "memory 1" },
          score: 0.8,
        },
        {
          message: { content: "memory 2" },
          score: 0.6,
        },
      ];
      mockZepClient.memory.search.mockResolvedValueOnce(mockMemories);

      // Act
      const result = await aiService.searchMemory(query);

      // Assert
      expect(result).toEqual({
        relevantMemories: ["memory 1", "memory 2"],
        score: 0.8,
      });
      expect(mockZepClient.memory.search).toHaveBeenCalledWith(
        "journal_entries",
        {
          text: query,
          metadata: {
            type: "search",
          },
        }
      );
    });

    it("should throw AppError when search fails", async () => {
      // Arrange
      const query = "test query";
      mockZepClient.memory.search.mockRejectedValueOnce(
        new Error("Search failed")
      );

      // Act & Assert
      await expect(aiService.searchMemory(query)).rejects.toThrow(
        new AppError(500, "AI_SERVICE_ERROR", "Failed to search memory")
      );
    });
  });
});
