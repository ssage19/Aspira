import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Game profile table
export const gameProfiles = pgTable("game_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  characterName: text("character_name").notNull(),
  wealth: decimal("wealth", { precision: 15, scale: 2 }).notNull().default("0"),
  netWorth: decimal("net_worth", { precision: 15, scale: 2 }).notNull().default("0"),
  happiness: integer("happiness").notNull().default(50),
  prestige: integer("prestige").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Assets table
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => gameProfiles.id).notNull(),
  assetId: text("asset_id").notNull(),
  assetName: text("asset_name").notNull(),
  assetType: text("asset_type").notNull(), // stock, crypto, bond, startup
  quantity: decimal("quantity", { precision: 15, scale: 5 }).notNull(),
  purchasePrice: decimal("purchase_price", { precision: 15, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
});

// Properties table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => gameProfiles.id).notNull(),
  propertyId: text("property_id").notNull(),
  propertyName: text("property_name").notNull(),
  propertyType: text("property_type").notNull(), // residential, commercial, industrial, mansion
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  income: decimal("income", { precision: 15, scale: 2 }).notNull(),
  expenses: decimal("expenses", { precision: 15, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
});

// Lifestyle items table
export const lifestyleItems = pgTable("lifestyle_items", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => gameProfiles.id).notNull(),
  itemId: text("item_id").notNull(),
  itemName: text("item_name").notNull(),
  itemType: text("item_type").notNull(), // luxury, vehicles, vacations, experiences
  purchasePrice: decimal("purchase_price", { precision: 15, scale: 2 }).notNull(),
  maintenanceCost: decimal("maintenance_cost", { precision: 15, scale: 2 }).notNull(),
  happiness: integer("happiness").notNull(),
  prestige: integer("prestige").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
});

// Game economy state table
export const economyStates = pgTable("economy_states", {
  id: serial("id").primaryKey(),
  inflation: decimal("inflation", { precision: 5, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  economyState: text("economy_state").notNull(), // boom, recession, stable
  marketTrend: text("market_trend").notNull(), // bull, bear, stable
  stockMarketHealth: integer("stock_market_health").notNull(),
  realEstateMarketHealth: integer("real_estate_market_health").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Game time table
export const gameTimes = pgTable("game_times", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => gameProfiles.id).notNull(),
  currentDay: integer("current_day").notNull(),
  currentMonth: integer("current_month").notNull(),
  currentYear: integer("current_year").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Schema validation for inserting users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Game profile insert schema
export const insertGameProfileSchema = createInsertSchema(gameProfiles).pick({
  userId: true,
  characterName: true,
  wealth: true,
});

// Game profile with user schema
export const gameProfileWithUserSchema = z.object({
  id: z.number(),
  userId: z.number(),
  characterName: z.string(),
  wealth: z.number(),
  netWorth: z.number(),
  happiness: z.number(),
  prestige: z.number(),
  username: z.string(),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameProfile = typeof gameProfiles.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type LifestyleItem = typeof lifestyleItems.$inferSelect;
export type EconomyState = typeof economyStates.$inferSelect;
export type GameTime = typeof gameTimes.$inferSelect;
