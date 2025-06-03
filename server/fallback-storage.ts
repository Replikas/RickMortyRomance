// Fallback storage for when database is not available
import type { IStorage, User, Character, GameState, Dialogue, SaveSlot, InsertUser, InsertCharacter, InsertGameState, InsertDialogue, InsertSaveSlot } from "./storage";

export class FallbackStorage implements IStorage {
  private characters: Character[] = [
    {
      id: 1,
      name: "Rick Sanchez (C-137)",
      description: "Genius scientist, interdimensional traveler, and definitely not someone you want to underestimate. Rick's cynical worldview masks a complex character capable of surprising depth.",
      personality: "Brilliant, cynical, sarcastic, unpredictable, secretly caring but hides it behind layers of nihilism and alcohol",
      sprite: "rick-c137",
      color: "#00ff88",
      traits: ["genius", "alcoholic", "inventor", "dimensional_traveler", "cynical"],
      emotionStates: ["neutral", "drunk", "angry", "surprised", "smug", "concerned"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Morty Smith",
      description: "Rick's grandson and reluctant adventure companion. Despite his nervousness and insecurity, Morty often shows unexpected courage and moral clarity.",
      personality: "Nervous, insecure, morally grounded, often overwhelmed but surprisingly resilient, seeks approval",
      sprite: "morty",
      color: "#ffeb3b",
      traits: ["anxious", "moral", "young", "inexperienced", "loyal"],
      emotionStates: ["nervous", "excited", "confused", "determined", "scared", "happy"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      name: "Evil Morty",
      description: "The smartest and most dangerous Morty in the multiverse. Cold, calculating, and tired of being underestimated by Ricks everywhere.",
      personality: "Calculating, intelligent, ruthless, ambitious, sees through Rick's manipulation, seeks independence",
      sprite: "evil-morty",
      color: "#ffd700",
      traits: ["intelligent", "manipulative", "ambitious", "calculating", "independent"],
      emotionStates: ["cold", "smug", "angry", "calculating", "satisfied", "contemplative"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      name: "Rick Prime",
      description: "The Rick who abandoned his family and killed other Ricks' wives. The most dangerous and nihilistic Rick in existence.",
      personality: "Completely nihilistic, sadistic, brilliant, emotionally detached, sees all life as meaningless",
      sprite: "rick-prime",
      color: "#ff0066",
      traits: ["nihilistic", "sadistic", "genius", "emotionless", "dangerous"],
      emotionStates: ["cold", "amused", "bored", "irritated", "maniacal", "indifferent"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  async getUser(id: number): Promise<User | undefined> {
    return {
      id,
      username: "guest",
      password: "",
      email: null,
      globalSettings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return {
      id: 1,
      username,
      password: "",
      email: null,
      globalSettings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async createUser(user: InsertUser): Promise<User> {
    return {
      id: 1,
      username: user.username,
      password: user.password,
      email: user.email || null,
      globalSettings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    return {
      id,
      username: "guest",
      password: "",
      email: null,
      globalSettings: updates.globalSettings || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async updateUserGlobalSettings(id: number, settings: any): Promise<User> {
    return this.updateUser(id, { globalSettings: settings });
  }

  async getAllCharacters(): Promise<Character[]> {
    return this.characters;
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.find(c => c.id === id);
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const newCharacter: Character = {
      id: this.characters.length + 1,
      ...character,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.characters.push(newCharacter);
    return newCharacter;
  }

  async getGameState(userId: number, characterId: number): Promise<GameState | undefined> {
    return undefined; // No persistent game state in fallback mode
  }

  async createGameState(gameState: InsertGameState): Promise<GameState> {
    return {
      id: 1,
      ...gameState,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async updateGameState(id: number, updates: Partial<GameState>): Promise<GameState> {
    return {
      id,
      userId: 1,
      characterId: 1,
      affectionLevel: 50,
      relationshipStatus: "stranger",
      conversationCount: 0,
      currentEmotion: "neutral",
      settings: {},
      unlockedBackstories: [],
      ...updates,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async getUserGameStates(userId: number): Promise<GameState[]> {
    return [];
  }

  async getDialogues(gameStateId: number, limit = 50): Promise<Dialogue[]> {
    return [];
  }

  async createDialogue(dialogue: InsertDialogue): Promise<Dialogue> {
    return {
      id: 1,
      ...dialogue,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async getSaveSlots(userId: number): Promise<SaveSlot[]> {
    return [];
  }

  async getSaveSlot(userId: number, slotNumber: number): Promise<SaveSlot | undefined> {
    return undefined;
  }

  async createSaveSlot(saveSlot: InsertSaveSlot): Promise<SaveSlot> {
    return {
      id: 1,
      ...saveSlot,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async deleteSaveSlot(userId: number, slotNumber: number): Promise<void> {
    // No-op in fallback mode
  }

  async unlockBackstory(gameStateId: number, backstoryId: string): Promise<GameState> {
    return this.updateGameState(gameStateId, {});
  }

  async getUnlockedBackstories(gameStateId: number): Promise<string[]> {
    return [];
  }
}