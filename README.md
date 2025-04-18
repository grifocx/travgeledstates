# USA State Tracker v1.0.0

An interactive web application to track and visualize which US states you have visited.

## Overview

The USA State Tracker allows users to:
- Mark states they've visited on an interactive US map
- Track progress with statistics and visualizations
- Create an account to save visited states
- Generate shareable links to show others their travel progress

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
- Zoom and pan controls
- Click on states to mark them as visited/unvisited

### User Authentication
- Create an account to save your visited states
- Login to access your saved data from any device
- Anonymous mode available for quick exploration

### Statistics Dashboard
- See percentage of states visited
- View recent activity
- Track progress over time

### Sharing
- Generate a sharable link to show others your traveled states
- View others' visited states through their shared links

## Usage

### Creating an Account
1. Click the "Login" button in the header
2. Select "Register" to create a new account
3. Enter your username and password
4. Submit the form to create your account

### Marking States as Visited
1. Click directly on a state in the map or find it in the list below
2. States marked as visited will appear in green

### Sharing Your Progress
1. Click the "Share" button in the dashboard
2. Copy the provided URL to share with others

## Technologies Used

- **Frontend**: React, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, Passport.js
- **Database**: PostgreSQL with Drizzle ORM
- **Visualization**: React Simple Maps

## Latest Release - v1.0.0

### Major Updates
- Fixed state tracking functionality for complete UI/database synchronization
- Improved state coloring persistence across sessions
- Enhanced error handling throughout the application
- Added robust state identification with name-to-code mapping
- Optimized data flow for better performance

For full details, see the [CHANGELOG.md](CHANGELOG.md) file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React Simple Maps](https://www.react-simple-maps.io/) for the map visualization
- [Shadcn/UI](https://ui.shadcn.com/) for the beautiful UI components
- [TanStack Query](https://tanstack.com/query) for data-fetching capabilities