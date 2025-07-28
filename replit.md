# İstay Park Parking Subscription System

## Overview

This is a full-stack web application for a parking subscription service called "İstay Park" that serves Istanbul, Turkey. The application allows users to browse parking locations, subscribe to parking plans, and manage their subscriptions with SMS verification. It features a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React with TypeScript, Vite build tool, and shadcn/ui component library
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Shared**: Common schemas and types shared between frontend and backend
- **Styling**: Tailwind CSS with custom Turkish-themed color palette

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **API Layer**: RESTful Express.js endpoints under `/api` prefix
- **Data Layer**: Drizzle ORM with PostgreSQL database
- **Storage**: In-memory storage implementation with interface for easy migration to database
- **Validation**: Zod schemas shared between frontend and backend

### Database Schema
The application uses two main tables:
- **parking_locations**: Stores parking facility information (name, address, capacity, availability, district)
- **subscriptions**: Stores user subscription data including personal info, payment details, and verification status

### Authentication & Verification
- SMS verification system for subscription confirmation
- Verification codes stored temporarily for subscription validation
- No user authentication system currently implemented

## Data Flow

1. **Parking Location Discovery**: Users browse available parking locations with search and filtering capabilities
2. **Subscription Creation**: Multi-step form process for collecting user information, payment details, and plan selection
3. **SMS Verification**: After subscription creation, users receive SMS verification codes
4. **Subscription Confirmation**: Users verify their phone numbers to activate subscriptions

## External Dependencies

### Core Framework Dependencies
- React 18 with TypeScript support
- Express.js for backend API
- Vite for development and build tooling
- Drizzle ORM for database interactions

### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for icon library
- shadcn/ui component system

### Database and Validation
- @neondatabase/serverless for PostgreSQL connection
- Zod for runtime type validation and schema definition
- drizzle-zod for automatic schema generation

### Development Tools
- TypeScript for type safety
- ESBuild for server bundling
- PostCSS with Autoprefixer

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for running TypeScript server files
- Concurrent development setup with API proxy

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Static file serving from Express server
- Environment variable configuration for database connection

### Database Management
- Drizzle migrations stored in `./migrations` directory
- Database schema defined in `shared/schema.ts`
- `drizzle-kit push` for schema synchronization

The application is designed for deployment on platforms like Replit, with specific configurations for development banner injection and cartographer integration for the Replit environment.