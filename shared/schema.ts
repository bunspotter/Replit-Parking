import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Existing users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Parking information table
export const parkingLocations = pgTable("parking_locations", {
  id: serial("id").primaryKey(),
  floor: integer("floor").notNull(),
  spot: integer("spot").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  active: boolean("active").notNull().default(true),
  userId: integer("user_id"),
});

export const insertParkingLocationSchema = createInsertSchema(parkingLocations).pick({
  floor: true,
  spot: true,
  userId: true,
});

export const updateParkingLocationSchema = createInsertSchema(parkingLocations).pick({
  active: true,
});

export type InsertParkingLocation = z.infer<typeof insertParkingLocationSchema>;
export type UpdateParkingLocation = z.infer<typeof updateParkingLocationSchema>;
export type ParkingLocation = typeof parkingLocations.$inferSelect;

// Reminder settings table
export const reminderSettings = pgTable("reminder_settings", {
  id: serial("id").primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  time: text("time").notNull().default("08:00"),
  userId: integer("user_id"),
});

export const insertReminderSettingsSchema = createInsertSchema(reminderSettings).pick({
  enabled: true,
  time: true,
  userId: true,
});

export const updateReminderSettingsSchema = createInsertSchema(reminderSettings).pick({
  enabled: true,
  time: true,
});

export type InsertReminderSettings = z.infer<typeof insertReminderSettingsSchema>;
export type UpdateReminderSettings = z.infer<typeof updateReminderSettingsSchema>;
export type ReminderSettings = typeof reminderSettings.$inferSelect;

// Floor configuration
export interface FloorConfig {
  floor: number;
  minSpot: number;
  maxSpot: number;
  spotCount: number;
}

export const floorConfigs: FloorConfig[] = [
  { floor: 3, minSpot: 70, maxSpot: 98, spotCount: 29 },
  { floor: 4, minSpot: 99, maxSpot: 163, spotCount: 65 },
  { floor: 5, minSpot: 164, maxSpot: 228, spotCount: 65 },
  { floor: 6, minSpot: 229, maxSpot: 283, spotCount: 55 },
  { floor: 7, minSpot: 284, maxSpot: 358, spotCount: 75 },
  { floor: 8, minSpot: 359, maxSpot: 420, spotCount: 62 },
];
