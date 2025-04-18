# USA State Tracker v1.3.0

An interactive web application to track, visualize, and gamify your journey across the United States.

## Overview

The USA State Tracker allows users to:
- Mark states they've visited on an interactive US map
- Track progress with statistics and visualizations
- Earn achievement badges as they explore more states
- Create an account to save visited states and earned badges
- Generate shareable links to show others their travel progress
- View a personalized travel achievement dashboard

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/usa-state-tracker.git
cd usa-state-tracker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with the following variables:
```
DATABASE_URL=postgres://username:password@localhost:5432/statetracker
SESSION_SECRET=your_secure_random_string
```

4. Initialize the database
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

6. Open your browser to `http://localhost:5000`

## Features

### Interactive Map
- Color-coded visualization of visited and unvisited states
- Simple and clean interface with custom USA map logo
- Click on states to mark them as visited/unvisited
- Animated visual elements for better user engagement

### User Authentication
- Create an account to save your visited states
- Login to access your saved data from any device
- Anonymous mode available for quick exploration
- Secure session management with persistent login

### Achievement Badges
- Earn badges for exploration milestones and regional completions
- Dynamic SVG-based badges with tier-specific styling
- Smooth animations when unlocking new achievements
- Interactive badge display with detailed information
- Multiple badge categories rewarding different travel patterns
- Automated badge evaluation based on visited states

### Statistics Dashboard
- See percentage of states visited with visual indicators
- View recent activity in a chronological timeline
- Track progress over time with detailed metrics
- Monitor achievement progress across different categories

### Sharing
- Generate a shareable link with database-stored map images
- View and download others' visited states through their shared links
- Open shared maps in new tabs with dedicated URLs
- Optimized image quality for efficient sharing

## Usage

### Creating an Account
1. Click the "Login" button in the header
2. Select "Register" to create a new account
3. Enter your username and password
4. Submit the form to create your account

### Marking States as Visited
1. Click directly on a state in the map or find it in the list below
2. States marked as visited will appear in green
3. Your achievements will automatically update as you mark states

### Earning Achievements
1. Mark states as visited to automatically earn badges
2. View your earned badges in the Achievements section
3. Click on any badge to see detailed information about criteria and earned date
4. Unlock higher-tier badges by completing specific regional collections or visiting milestone numbers of states

### Sharing Your Progress
1. Click the "Share" button in the dashboard
2. Copy the provided URL to share with others
3. View your map with achievements in a shareable format

## Technologies Used

- **Frontend**: 
  - React and TypeScript for robust component architecture
  - TanStack Query for efficient data fetching and caching
  - Tailwind CSS with shadcn/ui for modern UI design
  - Framer Motion for smooth animations and transitions
  - React SVG for dynamic badge and logo rendering
  - React Simple Maps for interactive map visualization
  
- **Backend**: 
  - Node.js with Express for API endpoints
  - Passport.js for secure authentication
  - Drizzle ORM for type-safe database operations
  - Zod for comprehensive data validation
  
- **Database**: 
  - PostgreSQL for reliable data persistence
  - JSON fields for flexible achievement criteria storage
  - Efficient relation modeling for badges and user achievements

## Latest Release - v1.3.0

### Major Updates
- Enhanced visual branding with custom USA map logo:
  - Added dynamic SVG-based logo in the application header
  - Implemented automatic favicon generation using the logo design
  - Added subtle animations for improved user engagement
- Upgraded badge system visualization:
  - Replaced static badge images with dynamic SVG rendering
  - Added smooth animations for newly earned badges
  - Created tier-specific visual styling (bronze, silver, gold, platinum)
  - Improved badge display with interactive tooltips

### Previous Release - v1.2.0
- Implemented comprehensive achievement badge system:
  - Added database schema for badges and user achievements
  - Created multiple badge categories (Exploration, Regional, Special)
  - Designed JSON-based criteria evaluation system
  - Added automatic badge awarding based on state visitation
  - Built badge display UI with earned vs. unearned states
  - Implemented badge details with criteria and earned dates

### Earlier Releases
- **v1.1.0**: Enhanced map sharing with database-stored images
- **v1.0.0**: Initial release with core map and state tracking functionality

For full details, see the [CHANGELOG.md](CHANGELOG.md) file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React Simple Maps](https://www.react-simple-maps.io/) for the map visualization
- [Shadcn/UI](https://ui.shadcn.com/) for the beautiful UI components
- [TanStack Query](https://tanstack.com/query) for data-fetching capabilities
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [React SVG](https://github.com/tanem/react-svg) for dynamic SVG rendering
- [Drizzle ORM](https://orm.drizzle.team/) for PostgreSQL integration
- [Zod](https://zod.dev/) for robust data validation