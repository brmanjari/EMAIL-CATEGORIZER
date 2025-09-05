import { storage } from "../storage";
import { analyzeSentiment, extractInformation, generateResponse } from "./openaiService";
import type { Email, ExtractedInfo } from "@shared/schema";

export class EmailProcessor {
  async processEmail(emailId: string): Promise<Email | undefined> {
    const email = await storage.getEmail(emailId);
    if (!email) return undefined;

    try {
      // Perform sentiment analysis
      const sentimentAnalysis = await analyzeSentiment(email.subject + '\n' + email.body);
      
      // Extract information
      const extractedInfo = await extractInformation({
        subject: email.subject,
        body: email.body,
        sender: email.sender,
      });

      // Generate AI response
      const aiResponse = await generateResponse(
        {
          subject: email.subject,
          body: email.body,
          sender: email.sender,
        },
        extractedInfo,
        sentimentAnalysis
      );

      // Update email with analysis results
      const updatedEmail = await storage.updateEmail(emailId, {
        sentiment: sentimentAnalysis.sentiment,
        sentimentScore: sentimentAnalysis.score,
        aiResponse,
        responseStatus: 'generated',
        extractedInfo: JSON.stringify(extractedInfo),
      });

      return updatedEmail;
    } catch (error) {
      console.error(`Failed to process email ${emailId}:`, error);
      
      // Update with error status
      await storage.updateEmail(emailId, {
        responseStatus: 'failed',
      });
      
      return email;
    }
  }

  async processAllPendingEmails(): Promise<void> {
    const emails = await storage.getEmails();
    const pendingEmails = emails
      .filter(email => email.responseStatus === 'pending')
      .sort((a, b) => {
        // Process urgent emails first
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
        return new Date(a.sentDate).getTime() - new Date(b.sentDate).getTime();
      });

    // Process emails in batches to avoid rate limits
    const batchSize = 3;
    for (let i = 0; i < pendingEmails.length; i += batchSize) {
      const batch = pendingEmails.slice(i, i + batchSize);
      await Promise.all(batch.map(email => this.processEmail(email.id)));
      
      // Small delay between batches
      if (i + batchSize < pendingEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  async markEmailAsSent(emailId: string): Promise<Email | undefined> {
    return await storage.updateEmail(emailId, {
      responseStatus: 'sent',
    });
  }
}

export const emailProcessor = new EmailProcessor();
