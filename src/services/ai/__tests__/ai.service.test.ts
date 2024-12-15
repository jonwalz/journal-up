import { AIService } from "../ai.service";
import { ZepClient } from "@getzep/zep-cloud";
import { AppError } from "../../../utils/errors";
import type { IEntry } from "../../../types";
import { env } from "../../../config/environment";

// Mock the ZepClient
jest.mock("@getzep/zep-cloud");

describe("AIService", () => {
  let aiService: AIService;
  let mockZepClient: jest.Mocked<ZepClient>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a mock implementation of ZepClient
    mockZepClient = {
      memory: {
        search: jest.fn(),
      },
      graph: {
        add: jest.fn(),
      },
    } as unknown as jest.Mocked<ZepClient>;

    // Mock the ZepClient constructor
    (ZepClient as jest.MockedClass<typeof ZepClient>).mockImplementation(
      () => mockZepClient
    );

    // Create a new instance of AIService for each test
    aiService = new AIService();
  });

  describe("initializeUserMemory", () => {
    it("should successfully initialize user memory", async () => {
      // Arrange
      const userId = "test-user-id";
      mockZepClient.memory.search.mockResolvedValueOnce([]);

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
      mockZepClient.memory.search.mockRejectedValueOnce(error);

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
