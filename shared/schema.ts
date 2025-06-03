import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  profilePicture: text("profile_picture"), // URL or base64 encoded image
  globalSettings: jsonb("global_settings").$type<{
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    animationSpeed: string;
    particleEffects: boolean;
    portalGlow: boolean;
    autosaveFrequency: number;
    typingSpeed: string;
    nsfwContent: boolean;
    openrouterApiKey: string;
    aiModel: string;
  }>().default({
    masterVolume: 75,
    sfxVolume: 50,
    musicVolume: 25,
    animationSpeed: "normal",
    particleEffects: true,
    portalGlow: true,
    autosaveFrequency: 5,
    typingSpeed: "normal",
    nsfwContent: false,
    openrouterApiKey: "",
    aiModel: "deepseek/deepseek-chat-v3-0324:free",
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  personality: text("personality").notNull(),
  sprite: text("sprite").notNull(),
  color: text("color").notNull(),
  traits: text("traits").array().notNull(),
  emotionStates: text("emotion_states").array().notNull(),
});

export const gameStates = pgTable("game_states", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  characterId: integer("character_id").notNull(),
  affectionLevel: integer("affection_level").default(0),
  relationshipStatus: text("relationship_status").default("stranger"),
  conversationCount: integer("conversation_count").default(0),
  currentEmotion: text("current_emotion").default("neutral"),
  unlockedBackstories: text("unlocked_backstories").array().default([]),
  lastSavedAt: timestamp("last_saved_at").defaultNow(),
  settings: jsonb("settings").$type<{
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    animationSpeed: string;
    particleEffects: boolean;
    portalGlow: boolean;
    autosaveFrequency: number;
    typingSpeed: string;
    nsfwContent: boolean;
    openrouterApiKey: string;
    aiModel: string;
  }>().default({
    masterVolume: 75,
    sfxVolume: 50,
    musicVolume: 25,
    animationSpeed: "normal",
    particleEffects: true,
    portalGlow: true,
    autosaveFrequency: 5,
    typingSpeed: "normal",
    nsfwContent: false,
    openrouterApiKey: "",
    aiModel: "deepseek/deepseek-chat-v3-0324:free",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dialogues = pgTable("dialogues", {
  id: serial("id").primaryKey(),
  gameStateId: integer("game_state_id").notNull(),
  speaker: text("speaker").notNull(), // "character" or "player"
  message: text("message").notNull(),
  messageType: text("message_type").notNull(), // "choice", "custom", "character", "backstory"
  affectionChange: integer("affection_change").default(0),
  emotionTriggered: text("emotion_triggered"),
  backstoryId: text("backstory_id"), // "origin", "worst_day", "rise_to_power", etc.
  timestamp: timestamp("timestamp").defaultNow(),
});

export const saveSlots = pgTable("save_slots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  slotNumber: integer("slot_number").notNull(),
  gameStateSnapshot: jsonb("game_state_snapshot").$type<GameState>().notNull(),
  dialogueCount: integer("dialogue_count").default(0),
  characterName: text("character_name").notNull(),
  affectionLevel: integer("affection_level").notNull(),
  relationshipStatus: text("relationship_status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const gameStatesRelations = relations(gameStates, ({ one, many }) => ({
  user: one(users, {
    fields: [gameStates.userId],
    references: [users.id],
  }),
  character: one(characters, {
    fields: [gameStates.characterId],
    references: [characters.id],
  }),
  dialogues: many(dialogues),
}));

export const dialoguesRelations = relations(dialogues, ({ one }) => ({
  gameState: one(gameStates, {
    fields: [dialogues.gameStateId],
    references: [gameStates.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  gameStates: many(gameStates),
}));

export const charactersRelations = relations(characters, ({ many }) => ({
  gameStates: many(gameStates),
}));

export const saveSlotsRelations = relations(saveSlots, ({ one }) => ({
  user: one(users, {
    fields: [saveSlots.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
});

export const insertGameStateSchema = createInsertSchema(gameStates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDialogueSchema = createInsertSchema(dialogues).omit({
  id: true,
  timestamp: true,
});

export const insertSaveSlotSchema = createInsertSchema(saveSlots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type GameState = typeof gameStates.$inferSelect;
export type Dialogue = typeof dialogues.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type InsertDialogue = z.infer<typeof insertDialogueSchema>;
export type SaveSlot = typeof saveSlots.$inferSelect;
export type InsertSaveSlot = z.infer<typeof insertSaveSlotSchema>;
