import { db } from "./db";
import {
  users, orders, accuratePayments, bonusPayments,
  type User, type InsertUser,
  type Order, type InsertOrder,
  type AccuratePayment, type InsertAccuratePayment,
  type BonusPayment, type InsertBonusPayment
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  deleteOrder(id: number): Promise<void>;
  closeShift(): Promise<void>;
  reopenShift(): Promise<void>;

  getAccuratePayments(): Promise<AccuratePayment[]>;
  createOrUpdateAccuratePayment(payment: InsertAccuratePayment): Promise<AccuratePayment>;

  getBonusPayments(): Promise<BonusPayment[]>;
  createBonusPayment(payment: InsertBonusPayment): Promise<BonusPayment>;
}

export class DatabaseStorage implements IStorage {
  async closeShift(): Promise<void> {
    // Обновляем все заказы текущего дня, устанавливая shiftClosed = true
    const today = new Date().toISOString().split('T')[0];
    await db.update(orders)
      .set({ shiftClosed: true })
      .where(
        eq(orders.shiftClosed, false)
      );
  }

  async reopenShift(): Promise<void> {
    // Снимаем флаг закрытой смены со всех заказов текущего дня
    await db.update(orders)
      .set({ shiftClosed: false })
      .where(
        eq(orders.shiftClosed, true)
      );
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser & { role?: string }): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      role: insertUser.role || "viewer"
    }).returning();
    return user;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(orders.createdAt);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async deleteOrder(id: number): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }

  async getAccuratePayments(): Promise<AccuratePayment[]> {
    return await db.select().from(accuratePayments).orderBy(accuratePayments.date);
  }

  async createOrUpdateAccuratePayment(payment: InsertAccuratePayment): Promise<AccuratePayment> {
    const [existing] = await db.select().from(accuratePayments).where(eq(accuratePayments.date, payment.date));
    
    if (existing) {
      const [updated] = await db.update(accuratePayments)
        .set({ amount: payment.amount })
        .where(eq(accuratePayments.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(accuratePayments).values(payment).returning();
      return created;
    }
  }

  async getBonusPayments(): Promise<BonusPayment[]> {
    return await db.select().from(bonusPayments).orderBy(bonusPayments.startDate);
  }

  async createBonusPayment(payment: InsertBonusPayment): Promise<BonusPayment> {
    const [created] = await db.insert(bonusPayments).values(payment).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
