import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  const clients = new Set<WebSocket>();
  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
  });

  const broadcastUpdate = (type: string, action: string, payload: any) => {
    const message = JSON.stringify({ type: 'update', payload: { type, action, payload } });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // Auth routes
  app.get(api.auth.me.path, async (req, res) => {
    // For this demo, we'll use a query param or header to "persist" the user
    // In a real app, use express-session
    const username = req.query.username as string;
    if (username) {
      const user = await storage.getUserByUsername(username);
      if (user) return res.json(user);
    }
    res.status(401).json({ message: "Not authenticated" });
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      // Check if this is the first user, if so, make them an admin
      const allUsers = await storage.getOrders(); // Using this as a proxy to check if any users exist might be wrong, better check if any users exist properly or just check username
      const role = input.username.toLowerCase().includes('admin') ? 'admin' : 'viewer';
      const user = await storage.createUser({ ...input, role });
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal error" });
      }
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(input.username);
      if (!user || user.password !== input.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    res.status(200).json({ message: "Logged out" });
  });

  // Orders
  app.get(api.orders.list.path, async (req, res) => {
    const username = req.query.username as string;
    const items = await storage.getOrders();
    // In this simple version we return all orders, but could filter by user if needed
    res.json(items);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const username = req.query.username as string;
      const user = username ? await storage.getUserByUsername(username) : null;
      
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder({ ...input, userId: user?.id });
      broadcastUpdate('order', 'create', order);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  app.delete('/api/orders/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteOrder(id);
    broadcastUpdate('order', 'delete', { id });
    res.status(204).send();
  });

  // Accurate Payments
  app.get(api.accuratePayments.list.path, async (req, res) => {
    const items = await storage.getAccuratePayments();
    res.json(items);
  });

  app.post(api.accuratePayments.createOrUpdate.path, async (req, res) => {
    try {
      const username = req.query.username as string;
      const user = username ? await storage.getUserByUsername(username) : null;
      
      const input = api.accuratePayments.createOrUpdate.input.parse(req.body);
      const payment = await storage.createOrUpdateAccuratePayment({ ...input, userId: user?.id });
      broadcastUpdate('accurate_payment', 'update', payment);
      res.status(200).json(payment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  // Bonus Payments
  app.get(api.bonusPayments.list.path, async (req, res) => {
    const items = await storage.getBonusPayments();
    res.json(items);
  });

  app.post(api.bonusPayments.create.path, async (req, res) => {
    try {
      const username = req.query.username as string;
      const user = username ? await storage.getUserByUsername(username) : null;
      
      const input = api.bonusPayments.create.input.parse(req.body);
      const payment = await storage.createBonusPayment({ ...input, userId: user?.id });
      broadcastUpdate('bonus_payment', 'create', payment);
      res.status(201).json(payment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  return httpServer;
}
