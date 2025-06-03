import { 
  users, characters, gameStates, dialogues, saveSlots,
  type User, type Character, type GameState, type Dialogue, type SaveSlot,
  type InsertUser, type InsertCharacter, type InsertGameState, type InsertDialogue, type InsertSaveSlot
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserGlobalSettings(id: number, settings: any): Promise<User>;

  // Character operations
  getAllCharacters(): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;

  // Game state operations
  getGameState(userId: number, characterId: number): Promise<GameState | undefined>;
  createGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(id: number, updates: Partial<GameState>): Promise<GameState>;
  getUserGameStates(userId: number): Promise<GameState[]>;

  // Dialogue operations
  getDialogues(gameStateId: number, limit?: number): Promise<Dialogue[]>;
  createDialogue(dialogue: InsertDialogue): Promise<Dialogue>;

  // Save slot operations
  getSaveSlots(userId: number): Promise<SaveSlot[]>;
  getSaveSlot(userId: number, slotNumber: number): Promise<SaveSlot | undefined>;
  createSaveSlot(saveSlot: InsertSaveSlot): Promise<SaveSlot>;
  deleteSaveSlot(userId: number, slotNumber: number): Promise<void>;

  // Backstory operations
  unlockBackstory(gameStateId: number, backstoryId: string): Promise<GameState>;
  getUnlockedBackstories(gameStateId: number): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeCharacters().catch(err => {
      console.error('Failed to initialize characters:', err);
      // Don't crash the server if character initialization fails
    });
  }

  private async initializeCharacters() {
    try {
      // Check if characters already exist
      const existingCharacters = await db.select().from(characters);
      if (existingCharacters.length > 0) return;
    } catch (error) {
      console.error('Database connection error during character initialization:', error);
      return; // Skip initialization if database is not ready
    }

    // Create default characters
    const rickCharacter: InsertCharacter = {
      name: "Rick Sanchez (C-137)",
      description: "Genius scientist, interdimensional traveler, and definitely not someone you want to underestimate. Rick's cynical worldview masks a complex character capable of surprising depth.",
      personality: "Brilliant, cynical, sarcastic, unpredictable, secretly caring but hides it behind layers of nihilism and alcohol",
      sprite: "rick-c137",
      color: "#00ff88",
      traits: ["genius", "alcoholic", "inventor", "dimensional_traveler", "cynical"],
      emotionStates: ["neutral", "drunk", "angry", "surprised", "smug", "concerned"]
    };

    const mortyCharacter: InsertCharacter = {
      name: "Morty Smith",
      description: "Rick's grandson and reluctant adventure companion. Despite his nervousness and insecurity, Morty often shows unexpected courage and moral clarity.",
      personality: "Nervous, insecure, morally grounded, often overwhelmed but surprisingly resilient, seeks approval",
      sprite: "morty",
      color: "#ffeb3b",
      traits: ["anxious", "moral", "young", "inexperienced", "loyal"],
      emotionStates: ["nervous", "excited", "confused", "determined", "scared", "happy"]
    };

    const evilMortyCharacter: InsertCharacter = {
      name: "Evil Morty",
      description: "The smartest and most dangerous Morty in the multiverse. Cold, calculating, and tired of being underestimated by Ricks everywhere.",
      personality: "Calculating, intelligent, ruthless, ambitious, sees through Rick's manipulation, seeks independence",
      sprite: "evil-morty",
      color: "#ffd700",
      traits: ["intelligent", "manipulative", "ambitious", "calculating", "independent"],
      emotionStates: ["cold", "smug", "angry", "calculating", "satisfied", "contemplative"]
    };

    const rickPrimeCharacter: InsertCharacter = {
      name: "Rick Prime",
      description: "The Rick who abandoned his family and killed other Ricks' wives. The most dangerous and nihilistic Rick in existence.",
      personality: "Completely nihilistic, sadistic, brilliant, emotionally detached, sees all life as meaningless",
      sprite: "rick-prime",
      color: "#ff0066",
      traits: ["nihilistic", "sadistic", "genius", "emotionless", "dangerous"],
      emotionStates: ["cold", "amused", "bored", "irritated", "maniacal", "indifferent"]
    };

    await db.insert(characters).values([rickCharacter, mortyCharacter, evilMortyCharacter, rickPrimeCharacter]);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserGlobalSettings(id: number, settings: any): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ globalSettings: settings })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllCharacters(): Promise<Character[]> {
    return await db.select().from(characters);
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character || undefined;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const [newCharacter] = await db
      .insert(characters)
      .values(character)
      .returning();
    return newCharacter;
  }

  async getGameState(userId: number, characterId: number): Promise<GameState | undefined> {
    const [gameState] = await db
      .select()
      .from(gameStates)
      .where(and(eq(gameStates.userId, userId), eq(gameStates.characterId, characterId)));
    return gameState || undefined;
  }

  async createGameState(gameState: InsertGameState): Promise<GameState> {
    const [newGameState] = await db
      .insert(gameStates)
      .values(gameState)
      .returning();
    return newGameState;
  }

  async updateGameState(id: number, updates: Partial<GameState>): Promise<GameState> {
    const [gameState] = await db
      .update(gameStates)
      .set(updates)
      .where(eq(gameStates.id, id))
      .returning();
    return gameState;
  }

  async getUserGameStates(userId: number): Promise<GameState[]> {
    return await db
      .select()
      .from(gameStates)
      .where(eq(gameStates.userId, userId));
  }

  async getDialogues(gameStateId: number, limit = 50): Promise<Dialogue[]> {
    return await db
      .select()
      .from(dialogues)
      .where(eq(dialogues.gameStateId, gameStateId))
      .orderBy(dialogues.timestamp)
      .limit(limit);
  }

  async createDialogue(dialogue: InsertDialogue): Promise<Dialogue> {
    const [newDialogue] = await db
      .insert(dialogues)
      .values(dialogue)
      .returning();
    return newDialogue;
  }

  async getSaveSlots(userId: number): Promise<SaveSlot[]> {
    return await db
      .select()
      .from(saveSlots)
      .where(eq(saveSlots.userId, userId));
  }

  async getSaveSlot(userId: number, slotNumber: number): Promise<SaveSlot | undefined> {
    const [saveSlot] = await db
      .select()
      .from(saveSlots)
      .where(and(eq(saveSlots.userId, userId), eq(saveSlots.slotNumber, slotNumber)));
    return saveSlot || undefined;
  }

  async createSaveSlot(saveSlot: InsertSaveSlot): Promise<SaveSlot> {
    const [newSaveSlot] = await db
      .insert(saveSlots)
      .values(saveSlot)
      .returning();
    return newSaveSlot;
  }

  async deleteSaveSlot(userId: number, slotNumber: number): Promise<void> {
    await db
      .delete(saveSlots)
      .where(and(eq(saveSlots.userId, userId), eq(saveSlots.slotNumber, slotNumber)));
  }

  async unlockBackstory(gameStateId: number, backstoryId: string): Promise<GameState> {
    const [gameState] = await db.select().from(gameStates).where(eq(gameStates.id, gameStateId));
    if (!gameState) {
      throw new Error("Game state not found");
    }
    
    const currentBackstories = gameState.unlockedBackstories || [];
    if (!currentBackstories.includes(backstoryId)) {
      const [updatedGameState] = await db
        .update(gameStates)
        .set({
          unlockedBackstories: [...currentBackstories, backstoryId],
          updatedAt: new Date(),
        })
        .where(eq(gameStates.id, gameStateId))
        .returning();
      return updatedGameState;
    }
    return gameState;
  }

  async getUnlockedBackstories(gameStateId: number): Promise<string[]> {
    const [gameState] = await db.select().from(gameStates).where(eq(gameStates.id, gameStateId));
    return gameState?.unlockedBackstories || [];
  }
}

export const storage = new DatabaseStorage();