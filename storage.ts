import { type User, type InsertUser, type Email, type InsertEmail, type UpdateEmail, type EmailStats, type ExtractedInfo } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Email methods
  getEmails(): Promise<Email[]>;
  getEmail(id: string): Promise<Email | undefined>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmail(id: string, updates: UpdateEmail): Promise<Email | undefined>;
  deleteEmail(id: string): Promise<boolean>;
  getEmailsByPriority(priority: 'urgent' | 'normal'): Promise<Email[]>;
  getEmailsBySentiment(sentiment: 'positive' | 'negative' | 'neutral'): Promise<Email[]>;
  searchEmails(query: string): Promise<Email[]>;
  getEmailStats(): Promise<EmailStats>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private emails: Map<string, Email>;

  constructor() {
    this.users = new Map();
    this.emails = new Map();
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    try {
      // Load CSV data from attached assets
      const csvPath = path.resolve(process.cwd(), 'attached_assets', '68b1acd44f393_Sample_Support_Emails_Dataset (1)_1756959800854.csv');
      
      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split('\n').slice(1); // Skip header
        
        for (const line of lines) {
          if (line.trim()) {
            const [sender, subject, body, sentDate] = line.split(',').map(field => 
              field.replace(/^"/, '').replace(/"$/, '')
            );
            
            if (sender && subject && body && sentDate) {
              const email: Email = {
                id: randomUUID(),
                sender,
                subject,
                body,
                sentDate: new Date(sentDate),
                priority: this.determinePriority(subject + ' ' + body),
                sentiment: 'neutral', // Will be analyzed by AI
                sentimentScore: null,
                aiResponse: null,
                responseStatus: 'pending',
                extractedInfo: null,
                processed: new Date(),
              };
              
              this.emails.set(email.id, email);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }

  private determinePriority(text: string): 'urgent' | 'normal' {
    const urgentKeywords = ['urgent', 'critical', 'immediately', 'emergency', 'down', 'cannot access', 'blocked', 'immediate', 'asap'];
    const lowercaseText = text.toLowerCase();
    
    return urgentKeywords.some(keyword => lowercaseText.includes(keyword)) ? 'urgent' : 'normal';
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Email methods
  async getEmails(): Promise<Email[]> {
    return Array.from(this.emails.values()).sort((a, b) => {
      // Sort by priority first (urgent first), then by date (newest first)
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
      return new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime();
    });
  }

  async getEmail(id: string): Promise<Email | undefined> {
    return this.emails.get(id);
  }

  async createEmail(insertEmail: InsertEmail): Promise<Email> {
    const id = randomUUID();
    const email: Email = {
      ...insertEmail,
      id,
      processed: new Date(),
    };
    this.emails.set(id, email);
    return email;
  }

  async updateEmail(id: string, updates: UpdateEmail): Promise<Email | undefined> {
    const email = this.emails.get(id);
    if (!email) return undefined;
    
    const updatedEmail = { ...email, ...updates };
    this.emails.set(id, updatedEmail);
    return updatedEmail;
  }

  async deleteEmail(id: string): Promise<boolean> {
    return this.emails.delete(id);
  }

  async getEmailsByPriority(priority: 'urgent' | 'normal'): Promise<Email[]> {
    return Array.from(this.emails.values())
      .filter(email => email.priority === priority)
      .sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());
  }

  async getEmailsBySentiment(sentiment: 'positive' | 'negative' | 'neutral'): Promise<Email[]> {
    return Array.from(this.emails.values())
      .filter(email => email.sentiment === sentiment)
      .sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());
  }

  async searchEmails(query: string): Promise<Email[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.emails.values())
      .filter(email => 
        email.sender.toLowerCase().includes(lowerQuery) ||
        email.subject.toLowerCase().includes(lowerQuery) ||
        email.body.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => {
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
        return new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime();
      });
  }

  async getEmailStats(): Promise<EmailStats> {
    const emails = Array.from(this.emails.values());
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEmails = emails.filter(email => new Date(email.sentDate) >= twentyFourHoursAgo);
    const urgentEmails = emails.filter(email => email.priority === 'urgent');
    const resolvedEmails = emails.filter(email => email.responseStatus === 'sent');
    const pendingEmails = emails.filter(email => email.responseStatus === 'pending' || email.responseStatus === 'generated');
    
    const sentimentBreakdown = {
      positive: emails.filter(e => e.sentiment === 'positive').length,
      negative: emails.filter(e => e.sentiment === 'negative').length,
      neutral: emails.filter(e => e.sentiment === 'neutral').length,
    };
    
    const priorityBreakdown = {
      urgent: emails.filter(e => e.priority === 'urgent').length,
      normal: emails.filter(e => e.priority === 'normal').length,
    };

    // Calculate average response time for resolved emails
    const resolvedEmailsWithResponse = resolvedEmails.filter(email => email.processed);
    let avgResponseTimeHours = 0;
    if (resolvedEmailsWithResponse.length > 0) {
      const totalResponseTime = resolvedEmailsWithResponse.reduce((sum, email) => {
        const responseTime = email.processed!.getTime() - new Date(email.sentDate).getTime();
        return sum + responseTime;
      }, 0);
      avgResponseTimeHours = totalResponseTime / resolvedEmailsWithResponse.length / (1000 * 60 * 60);
    }

    return {
      totalEmails: recentEmails.length,
      urgentEmails: urgentEmails.length,
      resolvedEmails: resolvedEmails.length,
      pendingEmails: pendingEmails.length,
      avgResponseTime: avgResponseTimeHours > 0 ? `${avgResponseTimeHours.toFixed(1)}h` : '0h',
      sentimentBreakdown,
      priorityBreakdown,
    };
  }
}

export const storage = new MemStorage();
