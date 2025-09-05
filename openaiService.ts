import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-test-key"
});

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // 1-5 scale
  confidence: number; // 0-1
}

export interface ExtractedInfo {
  issueType?: string;
  urgency?: string;
  duration?: string;
  impact?: string;
  contactDetails?: string[];
  keywords?: string[];
}

export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a sentiment analysis expert. Analyze the sentiment of the email text and provide:
          - sentiment: 'positive', 'negative', or 'neutral'
          - score: rating from 1-5 (1=very negative, 3=neutral, 5=very positive)
          - confidence: confidence score between 0 and 1
          
          Respond with JSON in this exact format: { "sentiment": "positive", "score": 4, "confidence": 0.85 }`
        },
        {
          role: "user",
          content: `Analyze the sentiment of this email:\n\nSubject: ${text.split('\n')[0]}\nBody: ${text}`
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content!);
    
    return {
      sentiment: result.sentiment,
      score: Math.max(1, Math.min(5, Math.round(result.score))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
    };
  } catch (error) {
    console.error("Failed to analyze sentiment:", error);
    // Fallback sentiment analysis
    return {
      sentiment: 'neutral',
      score: 3,
      confidence: 0.5,
    };
  }
}

export async function extractInformation(email: { subject: string; body: string; sender: string }): Promise<ExtractedInfo> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an information extraction expert. Extract key information from support emails and respond with JSON in this format:
          {
            "issueType": "Brief category of the issue",
            "urgency": "Critical/High/Medium/Low",
            "duration": "How long the issue has persisted (if mentioned)",
            "impact": "Business impact level (if mentioned)",
            "contactDetails": ["array of any phone numbers, alternative emails, etc."],
            "keywords": ["array of important technical terms, product names, etc."]
          }`
        },
        {
          role: "user",
          content: `Extract information from this support email:
          From: ${email.sender}
          Subject: ${email.subject}
          Body: ${email.body}`
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content!);
  } catch (error) {
    console.error("Failed to extract information:", error);
    return {
      keywords: [email.subject.toLowerCase().split(' ').filter(word => word.length > 3)].flat(),
    };
  }
}

export async function generateResponse(email: { subject: string; body: string; sender: string }, extractedInfo: ExtractedInfo, sentiment: SentimentAnalysis): Promise<string> {
  try {
    const empathyLevel = sentiment.sentiment === 'negative' ? 'high empathy and urgency acknowledgment' : 
                        sentiment.sentiment === 'positive' ? 'friendly and appreciative tone' : 
                        'professional and helpful tone';
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a professional customer support representative. Generate contextual email responses that:
          - Maintain a professional and ${empathyLevel}
          - Address the specific issue mentioned
          - Provide actionable next steps
          - Include appropriate contact information or ticket numbers
          - Are concise but thorough
          - Acknowledge any frustration or urgency appropriately
          
          Keep responses between 150-300 words.`
        },
        {
          role: "user",
          content: `Generate a response for this support email:
          
          From: ${email.sender}
          Subject: ${email.subject}
          Body: ${email.body}
          
          Extracted Information: ${JSON.stringify(extractedInfo)}
          Sentiment: ${sentiment.sentiment} (${sentiment.score}/5)
          
          Make the response contextual and empathetic based on the customer's tone and issue severity.`
        },
      ],
    });

    return response.choices[0].message.content!;
  } catch (error) {
    console.error("Failed to generate response:", error);
    return `Dear ${email.sender.split('@')[0]},

Thank you for contacting our support team regarding "${email.subject}".

We have received your request and our team is reviewing it. We will get back to you within 24 hours with a detailed response.

If this is urgent, please don't hesitate to contact us directly.

Best regards,
Support Team`;
  }
}
