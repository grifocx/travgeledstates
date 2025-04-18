# USA State Tracker - Version 0.9.0

## Overview
The USA State Tracker is an interactive web application that allows users to visually track which states they have visited across the United States. This project provides a rich, interactive experience with a map-based visualization, user profiles, and data persistence.

## Features

### Core Functionality
- **Interactive Map:** Visual representation of all 50 US states with color-coded indicators for visited/unvisited states
- **State List:** Scrollable, searchable list of all states with toggle functionality
- **User Profiles:** User authentication with secure registration and login
- **Data Persistence:** PostgreSQL database storing user data, visited states, and activity history
- **Responsive Design:** Full support for mobile, tablet, and desktop devices

### Detailed Features
- **User Authentication**
  - Secure registration with username and password
  - Login system with session management
  - Anonymous user support for non-logged-in visitors
  - Persistent sessions with secure cookie management

- **Map Visualization**
  - Interactive SVG-based map using react-simple-maps
  - Color-coded states (green for visited, gray for unvisited)
  - Hover effects for better user interaction
  - State selection with detailed information display
  - Zoom and pan controls for map navigation

- **Visited States Management**
  - One-click toggle between visited/unvisited status
  - Optimistic UI updates for seamless user experience
  - Server-side validation and persistence
  - Activity logging for state status changes

- **Statistics Dashboard**
  - Visual representation of visited states percentage
  - Recent activity timeline
  - Progress tracking indicators
  - Share functionality to generate sharable links

- **Database Integration**
  - PostgreSQL database using Drizzle ORM
  - Schema with relations between users, states, visited states, and activities
  - Efficient caching and query management
  - Transaction support for data integrity

## Technical Architecture

### Frontend
- **React.js** framework for component-based UI
- **TanStack Query** for data fetching, caching, and state management
- **Tailwind CSS** with shadcn/ui components for styling
- **React Hook Form** for form management and validation
- **React Simple Maps** for interactive map visualization
- **Zod** for data validation and type safety

### Backend
- **Node.js** with Express server
- **Passport.js** for authentication
- **Drizzle ORM** for database interactions
- **PostgreSQL** for data persistence
- **Express Session** with connect-pg-simple for session management

### Data Model
- **Users:** User accounts with authentication information
- **States:** All 50 US states with metadata
- **Visited States:** Junction table tracking which users have visited which states
- **Activities:** Log of user actions for timeline and auditing

## Implementation Details

### Authentication System
- Password hashing with scrypt and random salt generation
- Session-based authentication with secure cookie storage
- User ID normalization for consistent database operations
- Anonymous user support with local storage-based identity

### Map Visualization
- SVG-based US map with state boundaries
- React component hierarchy for interactive elements
- State management for visited state coloring
- Local caching for performance optimization

### State Management
- React Query for server state management
- Optimistic UI updates for a responsive feel
- Local state synchronization with server state
- Normalized state IDs for consistent data handling

### Database Structure
- Relational schema with foreign key constraints
- Junction table approach for many-to-many relationships
- Timestamps for activity tracking and sorting
- Indexing for query performance

## Known Issues

### Map Color Persistence
- Map state colors occasionally fail to update visually despite backend data being correctly saved
- Multiple approaches implemented including:
  - User ID normalization between client and server
  - Force rendering with key-based component updates
  - Local state management with react-query integration
  - Improved error handling and validation

## Roadmap for Version 1.0
- Fix map color persistence issues
- Add user profile customization options
- Implement goal setting for state visits
- Enhance sharing capabilities with social media integration
- Add additional statistics and visualizations
- Implement offline support with service workers
- Add user achievements system

## Technical Debt & Future Improvements
- Consolidate conditional logic for state coloring
- Enhance error handling with more descriptive user feedback
- Improve mobile UI for better touch interactions
- Implement proper unit and integration testing
- Optimize database queries for larger user bases
- Add data export functionality