import { 
  users, 
  characters, 
  gameStates, 
  dialogues, 
  saveSlots,
  type User, 
  type Character, 
  type GameState, 
  type Dialogue, 
  type SaveSlot,
  type InsertUser, 
  type InsertCharacter, 
  type InsertGameState, 
  type InsertDialogue, 
  type InsertSaveSlot 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;

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

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private characters: Map<number, Character> = new Map();
  private gameStates: Map<number, GameState> = new Map();
  private dialogues: Map<number, Dialogue[]> = new Map();
  private saveSlots: Map<string, SaveSlot> = new Map();
  private nextId = 1;

  constructor() {
    this.initializeCharacters();
  }

  private initializeCharacters() {
    const rickCharacter: Character = {
      id: this.nextId++,
      name: "Rick Sanchez (C-137)",
      description: "Genius scientist and interdimensional traveler with a cynical worldview and god complex.",
      personality: "Rick is brilliant but arrogant, nihilistic yet protective of his family. He uses science and sarcasm as shields against emotional vulnerability. Despite his claims of not caring, he deeply loves his family but struggles to express it healthily.",
      sprite: "/characters/rick.jpg",
      color: "#00D4AA",
      traits: ["genius", "cynical", "alcoholic", "protective", "emotionally_distant"],
      emotionStates: ["neutral", "annoyed", "drunk", "excited", "angry", "vulnerable", "smug"],
      createdAt: new Date(),
    };

    const mortyCharacter: Character = {
      id: this.nextId++,
      name: "Morty Smith",
      description: "Rick's grandson, a nervous but good-hearted teenager who gets dragged into interdimensional adventures.",
      personality: "Morty is anxious and insecure but has a strong moral compass. He's often overwhelmed by Rick's adventures but is growing more confident and assertive. He seeks approval while trying to do the right thing.",
      sprite: "/characters/morty.jpg",
      color: "#FFB800",
      traits: ["anxious", "moral", "growing", "loyal", "insecure", "brave_when_needed"],
      emotionStates: ["nervous", "excited", "scared", "determined", "happy", "confused", "angry"],
      createdAt: new Date(),
    };

    const evilMortyCharacter: Character = {
      id: this.nextId++,
      name: "Evil Morty",
      description: "A cold, calculating version of Morty who has transcended his naive nature through dark experiences.",
      personality: "Evil Morty is manipulative, intelligent, and ruthlessly pragmatic. He's tired of being underestimated and has developed a cynical worldview that rivals Rick's. He values control and independence above all else.",
      sprite: "/characters/evil-morty.png",
      color: "#8B0000",
      traits: ["manipulative", "intelligent", "cold", "calculating", "independent", "ruthless"],
      emotionStates: ["cold", "calculating", "angry", "satisfied", "contemplative", "sinister", "disappointed"],
      createdAt: new Date(),
    };

    const rickPrimeCharacter: Character = {
      id: this.nextId++,
      name: "Rick Prime",
      description: "The most dangerous Rick in the multiverse, who killed C-137 Rick's family and represents pure chaos.",
      personality: "Rick Prime is the darkest version of Rick - completely without empathy or attachment. He's a force of pure destruction who finds joy in causing pain. He represents what Rick could become without any emotional connections.",
      sprite: "/characters/RICKPRIME.webp",
      color: "#FF0000",
      traits: ["psychopathic", "destructive", "chaotic", "brilliant", "remorseless", "unpredictable"],
      emotionStates: ["maniacal", "cold", "amused", "violent", "bored", "excited", "contemptuous"],
      createdAt: new Date(),
    };

    this.characters.set(rickCharacter.id, rickCharacter);
    this.characters.set(mortyCharacter.id, mortyCharacter);
    this.characters.set(evilMortyCharacter.id, evilMortyCharacter);
    this.characters.set(rickPrimeCharacter.id, rickPrimeCharacter);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextId++,
      username: insertUser.username,
      password: "",
      email: null,
      profilePicture: null,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllCharacters(): Promise<Character[]> {
    return Array.from(this.characters.values());
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const newCharacter: Character = {
      id: this.nextId++,
      ...character,
      createdAt: new Date(),
    };
    this.characters.set(newCharacter.id, newCharacter);
    return newCharacter;
  }

  async getGameState(userId: number, characterId: number): Promise<GameState | undefined> {
    for (const gameState of Array.from(this.gameStates.values())) {
      if (gameState.userId === userId && gameState.characterId === characterId) {
        return gameState;
      }
    }
    return undefined;
  }

  async createGameState(gameState: InsertGameState): Promise<GameState> {
    const newGameState: GameState = {
      id: this.nextId++,
      userId: gameState.userId,
      characterId: gameState.characterId,
      affectionLevel: gameState.affectionLevel ?? 0,
      relationshipStatus: gameState.relationshipStatus ?? "stranger",
      conversationCount: gameState.conversationCount ?? 0,
      currentEmotion: gameState.currentEmotion ?? "neutral",
      unlockedBackstories: gameState.unlockedBackstories ?? [],
      lastSavedAt: gameState.lastSavedAt ?? null,
      settings: gameState.settings ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.gameStates.set(newGameState.id, newGameState);
    return newGameState;
  }

  async updateGameState(id: number, updates: Partial<GameState>): Promise<GameState> {
    const gameState = this.gameStates.get(id);
    if (!gameState) {
      throw new Error("Game state not found");
    }
    const updatedGameState = { 
      ...gameState, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.gameStates.set(id, updatedGameState);
    return updatedGameState;
  }

  async getUserGameStates(userId: number): Promise<GameState[]> {
    const userGameStates = Array.from(this.gameStates.values())
      .filter(gs => gs.userId === userId)
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      });
    return userGameStates;
  }

  async getDialogues(gameStateId: number, limit = 50): Promise<Dialogue[]> {
    const dialogueList = this.dialogues.get(gameStateId) || [];
    return dialogueList
      .sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  async createDialogue(dialogue: InsertDialogue): Promise<Dialogue> {
    const newDialogue: Dialogue = {
      id: this.nextId++,
      message: dialogue.message,
      gameStateId: dialogue.gameStateId,
      speaker: dialogue.speaker,
      messageType: dialogue.messageType,
      affectionChange: dialogue.affectionChange ?? null,
      emotionTriggered: dialogue.emotionTriggered ?? null,
      backstoryId: dialogue.backstoryId ?? null,
      timestamp: new Date(),
    };
    
    const existingDialogues = this.dialogues.get(dialogue.gameStateId) || [];
    existingDialogues.push(newDialogue);
    this.dialogues.set(dialogue.gameStateId, existingDialogues);
    
    return newDialogue;
  }

  async getSaveSlots(userId: number): Promise<SaveSlot[]> {
    const userSaveSlots = Array.from(this.saveSlots.values())
      .filter(slot => slot.userId === userId)
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      });
    return userSaveSlots;
  }

  async getSaveSlot(userId: number, slotNumber: number): Promise<SaveSlot | undefined> {
    const key = `${userId}-${slotNumber}`;
    return this.saveSlots.get(key);
  }

  async createSaveSlot(saveSlot: InsertSaveSlot): Promise<SaveSlot> {
    const newSaveSlot: SaveSlot = {
      id: this.nextId++,
      userId: saveSlot.userId,
      slotNumber: saveSlot.slotNumber,
      gameStateSnapshot: saveSlot.gameStateSnapshot,
      dialogueCount: saveSlot.dialogueCount,
      characterName: saveSlot.characterName,
      affectionLevel: saveSlot.affectionLevel,
      relationshipStatus: saveSlot.relationshipStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const key = `${newSaveSlot.userId}-${newSaveSlot.slotNumber}`;
    this.saveSlots.set(key, newSaveSlot);
    return newSaveSlot;
  }

  async deleteSaveSlot(userId: number, slotNumber: number): Promise<void> {
    const key = `${userId}-${slotNumber}`;
    this.saveSlots.delete(key);
  }

  async unlockBackstory(gameStateId: number, backstoryId: string): Promise<GameState> {
    const gameState = this.gameStates.get(gameStateId);
    if (!gameState) {
      throw new Error("Game state not found");
    }
    
    const currentBackstories = gameState.unlockedBackstories || [];
    if (!currentBackstories.includes(backstoryId)) {
      const updatedGameState = {
        ...gameState,
        unlockedBackstories: [...currentBackstories, backstoryId],
        updatedAt: new Date(),
      };
      this.gameStates.set(gameStateId, updatedGameState);
      return updatedGameState;
    }
    
    return gameState;
  }

  async getUnlockedBackstories(gameStateId: number): Promise<string[]> {
    const gameState = this.gameStates.get(gameStateId);
    return gameState?.unlockedBackstories || [];
  }
}

export const storage = new MemStorage();