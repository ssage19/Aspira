import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for game data
  
  // User routes
  app.post('/api/users', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create new user
      const newUser = await storage.createUser({ username, password });
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Game data sync routes
  app.post('/api/sync', async (req, res) => {
    try {
      const { userId, gameData } = req.body;
      
      // In a real implementation, we would save this data to a database
      // For now, we just return success
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error syncing game data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Market data route - simulates getting real-time market data
  app.get('/api/market', async (req, res) => {
    try {
      // In a real implementation, this could come from an external API
      // For now, we generate random market data
      
      const marketData = {
        stockMarket: {
          health: Math.floor(Math.random() * 30) + 50, // 50-80%
          trend: ['bull', 'bear', 'stable'][Math.floor(Math.random() * 3)]
        },
        realEstate: {
          health: Math.floor(Math.random() * 20) + 60, // 60-80%
        },
        economy: {
          inflation: (Math.random() * 5 + 1).toFixed(1), // 1.0-6.0%
          interestRate: (Math.random() * 3 + 2).toFixed(1) // 2.0-5.0%
        }
      };
      
      res.status(200).json(marketData);
    } catch (error) {
      console.error("Error getting market data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
