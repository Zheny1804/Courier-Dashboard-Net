import { pgTable, text, serial, timestamp, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("viewer"), // 'admin' or 'viewer'
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  amount: numeric("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: serial("user_id").references(() => users.id),
});

export const accuratePayments = pgTable("accurate_payments", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(), // YYYY-MM-DD
  amount: numeric("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: serial("user_id").references(() => users.id),
});

export const bonusPayments = pgTable("bonus_payments", {
  id: serial("id").primaryKey(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  amount: numeric("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: serial("user_id").references(() => users.id),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, userId: true });
export const insertAccuratePaymentSchema = createInsertSchema(accuratePayments).omit({ id: true, createdAt: true, userId: true });
export const insertBonusPaymentSchema = createInsertSchema(bonusPayments).omit({ id: true, createdAt: true, userId: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type AccuratePayment = typeof accuratePayments.$inferSelect;
export type InsertAccuratePayment = z.infer<typeof insertAccuratePaymentSchema>;

export type BonusPayment = typeof bonusPayments.$inferSelect;
export type InsertBonusPayment = z.infer<typeof insertBonusPaymentSchema>;
