import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailProcessor } from "./services/emailProcessor";
import { insertEmailSchema, updateEmailSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all emails
  app.get("/api/emails", async (req, res) => {
    try {
      const { priority, sentiment, search } = req.query;
      
      let emails = await storage.getEmails();
      
      // Apply filters
      if (priority && priority !== 'all') {
        emails = emails.filter(email => email.priority === priority);
      }
      
      if (sentiment && sentiment !== 'all') {
        emails = emails.filter(email => email.sentiment === sentiment);
      }
      
      if (search && typeof search === 'string') {
        const searchQuery = search.toLowerCase();
        emails = emails.filter(email => 
          email.sender.toLowerCase().includes(searchQuery) ||
          email.subject.toLowerCase().includes(searchQuery) ||
          email.body.toLowerCase().includes(searchQuery)
        );
      }
      
      res.json(emails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emails" });
    }
  });

  // Get single email
  app.get("/api/emails/:id", async (req, res) => {
    try {
      const email = await storage.getEmail(req.params.id);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      res.json(email);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email" });
    }
  });

  // Create new email
  app.post("/api/emails", async (req, res) => {
    try {
      const validatedData = insertEmailSchema.parse(req.body);
      const email = await storage.createEmail(validatedData);
      
      // Process email asynchronously
      emailProcessor.processEmail(email.id).catch(error => 
        console.error(`Failed to process email ${email.id}:`, error)
      );
      
      res.status(201).json(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create email" });
    }
  });

  // Update email (for editing responses, marking as sent, etc.)
  app.patch("/api/emails/:id", async (req, res) => {
    try {
      const validatedData = updateEmailSchema.parse(req.body);
      const email = await storage.updateEmail(req.params.id, validatedData);
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      
      res.json(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update email" });
    }
  });

  // Process single email (trigger AI analysis)
  app.post("/api/emails/:id/process", async (req, res) => {
    try {
      const email = await emailProcessor.processEmail(req.params.id);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      res.json(email);
    } catch (error) {
      res.status(500).json({ message: "Failed to process email" });
    }
  });

  // Process all pending emails
  app.post("/api/emails/process-all", async (req, res) => {
    try {
      // Start processing asynchronously
      emailProcessor.processAllPendingEmails().catch(error => 
        console.error("Failed to process pending emails:", error)
      );
      
      res.json({ message: "Processing started" });
    } catch (error) {
      res.status(500).json({ message: "Failed to start processing" });
    }
  });

  // Mark email as sent
  app.post("/api/emails/:id/send", async (req, res) => {
    try {
      const email = await emailProcessor.markEmailAsSent(req.params.id);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      res.json(email);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark email as sent" });
    }
  });

  // Get email statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getEmailStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Regenerate AI response
  app.post("/api/emails/:id/regenerate", async (req, res) => {
    try {
      const email = await storage.getEmail(req.params.id);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }

      // Re-process the email to generate new response
      const updatedEmail = await emailProcessor.processEmail(req.params.id);
      res.json(updatedEmail);
    } catch (error) {
      res.status(500).json({ message: "Failed to regenerate response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
