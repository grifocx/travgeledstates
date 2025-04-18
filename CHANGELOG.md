# USA State Tracker - Version 1.3.0

## Overview
The USA State Tracker is an interactive web application that allows users to visually track which states they have visited across the United States. This project provides a rich, interactive experience with a map-based visualization, user profiles, achievement badges, and data persistence.

## Features

### Core Functionality
- **Interactive Map:** Visual representation of all 50 US states with color-coded indicators for visited/unvisited states
- **State List:** Scrollable, searchable list of all states with toggle functionality
- **User Profiles:** User authentication with secure registration and login
- **Achievement Badges:** Gamified experience with badges for exploration milestones and achievements
- **Data Persistence:** PostgreSQL database storing user data, visited states, activities, and earned badges
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
  - Custom app logo and favicon for better branding
  - Clean, simplified interface for intuitive navigation

- **Visited States Management**
  - One-click toggle between visited/unvisited status
  - Optimistic UI updates for seamless user experience
  - Server-side validation and persistence
  - Activity logging for state status changes

- **Achievement System**
  - Interactive, dynamically-rendered badges with animations
  - Multiple badge categories (Milestone, Regional, Special)
  - Tiered badge system (Bronze, Silver, Gold, Platinum)
  - Automatic badge evaluation based on exploration patterns
  - Detailed badge information with earned dates
  - Real-time badge unlocking notifications

- **Statistics Dashboard**
  - Visual representation of visited states percentage
  - Recent activity timeline
  - Progress tracking indicators
  - Share functionality with database-backed image storage
  - Dedicated shareable URLs for cross-browser compatibility

- **Database Integration**
  - PostgreSQL database using Drizzle ORM
  - Schema with relations between users, states, visited states, activities, and badges
  - JSON-based badge criteria for flexible achievement evaluation
  - Efficient caching and query management
  - Transaction support for data integrity

## Technical Architecture

### Frontend
- **React.js** framework for component-based UI
- **TanStack Query** for data fetching, caching, and state management
- **Tailwind CSS** with shadcn/ui components for styling
- **React Hook Form** for form management and validation
- **React Simple Maps** for interactive map visualization
- **Framer Motion** for smooth animations and transitions
- **React SVG** for dynamic SVG rendering and manipulation
- **Zod** for data validation and type safety

### Backend
- **Node.js** with Express server
- **Passport.js** for authentication
- **Drizzle ORM** for database interactions
- **PostgreSQL** for data persistence
- **Express Session** with connect-pg-simple for session management
- **Image Optimization** for efficient JPEG storage and sharing

### Data Model
- **Users:** User accounts with authentication information
- **States:** All 50 US states with metadata
- **Visited States:** Junction table tracking which users have visited which states
- **Activities:** Log of user actions for timeline and auditing
- **SharedMaps:** Database storage for map image data with unique share codes for URLs
- **Badges:** Achievement badges with name, description, tier, category, and criteria
- **UserBadges:** Junction table tracking which users have earned which badges and when

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

### Sharing System
- Server-side image storage with base64 encoding
- Randomized share codes for secure URL generation
- Image optimization with JPEG format and quality reduction
- Responsive modal for sharing interaction
- Cross-browser compatibility with database-backed approach

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
- BLOB storage for map image data with share code generation
- User-to-shared-map relation for ownership tracking
- JSON fields for flexible badge criteria storage

### Achievement System
- Tiered badges with visual differentiation (Bronze, Silver, Gold, Platinum)
- Dynamic badge evaluation based on user's exploration patterns
- JSON-based criteria evaluation for flexible achievement rules
- Multiple achievement categories (Exploration, Regional, Special)
- Real-time badge unlocking with animated visual feedback
- Interactive badge grid with detailed tooltips and information
- Automatic badge checking on state visitation changes
- Progressive reveal of higher-tier badges as lower tiers are earned

## Release Notes

### Version 1.3.0 (2025-04-18)
- Enhanced visual identity with custom branding:
  - Added custom USA map logo in the header 
  - Implemented dynamic favicon generation using the map logo
  - Added subtle animations to the logo for improved user engagement
  - Improved overall visual consistency throughout the application
- Upgraded badge system visualization:
  - Replaced static badge images with dynamic SVG rendering
  - Added smooth animations for newly earned badges
  - Implemented tier-specific visual styling (bronze, silver, gold, platinum)
  - Created interactive badge tooltips with enhanced information display
  - Optimized badge rendering performance for mobile devices
  - Added subtle hover animations for improved interactivity
  
### Version 1.2.0 (2025-04-18)
- Implemented comprehensive achievement badge system:
  - Added database schema for badges and user-badge relationships
  - Created 12 unique achievement badges across multiple categories
  - Implemented JSON-based flexible badge criteria evaluation
  - Added automatic badge awarding based on state exploration patterns
  - Created badge display UI with earned vs. unearned states
  - Implemented badge details modal with criteria and earned date
  - Added notifications for newly earned badges
  - Designed badge seeding system for initial application setup
  - Created regional badges for completing specific groups of states
  - Implemented milestone badges for overall exploration progress
  
### Version 1.1.0 (2025-04-18)
- Improved map sharing functionality:
  - Replaced client-side clipboard-based sharing with server-side image storage
  - Implemented database storage for map images with unique shareable URLs
  - Added enhanced UI for viewing shared maps including "View in new tab" option
  - Fixed cross-browser compatibility issues, especially in Safari
  - Increased server request size limit to 50MB to handle image payloads
- Optimized image sharing performance:
  - Reduced image quality to 50% to minimize payload size
  - Decreased image dimensions to 600x450 pixels
  - Changed format from PNG to JPEG for more efficient compression
  - Updated download file extension to match JPEG format
- Simplified map interface:
  - Removed unused zoom controls for a cleaner UI
  - Cleaned up related code for better maintainability

### Version 1.0.0 (2025-04-18)
- Fixed map color persistence issues with the following improvements:
  - Added robust state ID handling with name-to-code mapping
  - Enhanced state toggling in the UI with immediate visual feedback
  - Addressed required parameters in API calls (visitedAt field)
  - Improved error handling with descriptive user feedback
  - Added consistent type checking and validation throughout the application
- Enhanced UI with toast notifications for better user feedback
- Optimized state data flow between components for improved performance
- Added comprehensive error logging for easier debugging

## Roadmap for Future Versions
- Add user profile customization options
- Implement goal setting for state visits
- Enhance sharing capabilities with social media integration
- Add additional statistics and visualizations
- Implement offline support with service workers
- Add travel journal feature for recording memories at each location
- Create badge progression paths and achievement series

## Technical Debt & Future Improvements
- Consolidate conditional logic for state coloring
- Enhance error handling with more descriptive user feedback
- Improve mobile UI for better touch interactions
- Implement proper unit and integration testing
- Optimize database queries for larger user bases
- Add data export functionality