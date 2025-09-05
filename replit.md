# Overview

This is an AI-Powered Communication Assistant designed to intelligently manage support-related emails end-to-end. The application automatically processes incoming emails, categorizes them by sentiment and priority, and generates context-aware AI responses to improve efficiency and customer satisfaction while reducing manual effort.

The system provides a comprehensive dashboard for viewing filtered emails, analytics, and managing AI-generated responses with features like email prioritization, sentiment analysis, and automated response generation using OpenAI's GPT models.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, using Vite for build tooling
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Modular component architecture with reusable UI components

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling
- **Data Processing**: Email processor service for AI analysis pipeline
- **Storage**: In-memory storage implementation with file-based data loading

## Data Storage Solutions
- **Database**: PostgreSQL configured with Drizzle ORM
- **Schema**: Type-safe database schema with Zod validation
- **Migration Strategy**: Drizzle Kit for database migrations
- **Development Storage**: In-memory storage for development/testing

## AI Integration Architecture
- **LLM Provider**: OpenAI GPT-5 for natural language processing
- **AI Services**: 
  - Sentiment analysis with confidence scoring
  - Information extraction from email content
  - Context-aware response generation
- **Processing Pipeline**: Automated email processing with AI analysis results

## Email Processing Workflow
- **Categorization**: Automatic sentiment analysis (positive/negative/neutral)
- **Prioritization**: Urgency classification (urgent/normal) based on keywords
- **Response Generation**: AI-powered draft responses with professional tone
- **Information Extraction**: Automated extraction of contact details, requirements, and metadata

## Authentication & Authorization
- **User Management**: Basic user schema with username/password authentication
- **Session Handling**: Express sessions with PostgreSQL session store
- **Security**: Environment-based configuration for sensitive data

# External Dependencies

## Core Dependencies
- **Neon Database**: Serverless PostgreSQL database (@neondatabase/serverless)
- **OpenAI API**: GPT model integration for AI services
- **Drizzle ORM**: Type-safe database operations and schema management

## UI Framework Dependencies
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form state management with validation

## Development Tools
- **Vite**: Frontend build tool with HMR support
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimizations

## Data Processing Libraries
- **Date-fns**: Date manipulation and formatting
- **Zod**: Runtime type validation and schema definition
- **Class Variance Authority**: Component variant management

## Email Integration (Planned)
- Support for Gmail/Outlook APIs for email retrieval
- IMAP integration for custom email servers
- Email filtering based on subject line keywords

## Analytics & Visualization
- Chart.js integration for email trend visualization
- Real-time statistics dashboard
- Priority queue management for urgent emails