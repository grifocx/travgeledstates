import { 
  State, InsertState, 
  VisitedState, InsertVisitedState,
  Activity, InsertActivity,
} from "@shared/schema";

export interface IStorage {
  // State methods
  getStates(): Promise<State[]>;
  getStateById(stateId: string): Promise<State | undefined>;
  
  // Visited states methods
  getVisitedStates(userId: string): Promise<VisitedState[]>;
  toggleStateVisited(stateId: string, userId: string, visited: boolean): Promise<VisitedState>;
  resetVisitedStates(userId: string): Promise<void>;
  
  // Activity methods
  getActivities(userId: string, limit?: number): Promise<Activity[]>;
  addActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private states: Map<string, State>;
  private visitedStates: Map<string, VisitedState>;
  private activities: Activity[];
  private currentStateId: number;
  private currentVisitedStateId: number;
  private currentActivityId: number;

  constructor() {
    this.states = new Map();
    this.visitedStates = new Map();
    this.activities = [];
    this.currentStateId = 1;
    this.currentVisitedStateId = 1;
    this.currentActivityId = 1;
    
    // Initialize with all US states
    this.initializeStates();
  }

  // Initialize all US states in memory
  private initializeStates() {
    const usStates = [
      { stateId: 'AL', name: 'Alabama' },
      { stateId: 'AK', name: 'Alaska' },
      { stateId: 'AZ', name: 'Arizona' },
      { stateId: 'AR', name: 'Arkansas' },
      { stateId: 'CA', name: 'California' },
      { stateId: 'CO', name: 'Colorado' },
      { stateId: 'CT', name: 'Connecticut' },
      { stateId: 'DE', name: 'Delaware' },
      { stateId: 'FL', name: 'Florida' },
      { stateId: 'GA', name: 'Georgia' },
      { stateId: 'HI', name: 'Hawaii' },
      { stateId: 'ID', name: 'Idaho' },
      { stateId: 'IL', name: 'Illinois' },
      { stateId: 'IN', name: 'Indiana' },
      { stateId: 'IA', name: 'Iowa' },
      { stateId: 'KS', name: 'Kansas' },
      { stateId: 'KY', name: 'Kentucky' },
      { stateId: 'LA', name: 'Louisiana' },
      { stateId: 'ME', name: 'Maine' },
      { stateId: 'MD', name: 'Maryland' },
      { stateId: 'MA', name: 'Massachusetts' },
      { stateId: 'MI', name: 'Michigan' },
      { stateId: 'MN', name: 'Minnesota' },
      { stateId: 'MS', name: 'Mississippi' },
      { stateId: 'MO', name: 'Missouri' },
      { stateId: 'MT', name: 'Montana' },
      { stateId: 'NE', name: 'Nebraska' },
      { stateId: 'NV', name: 'Nevada' },
      { stateId: 'NH', name: 'New Hampshire' },
      { stateId: 'NJ', name: 'New Jersey' },
      { stateId: 'NM', name: 'New Mexico' },
      { stateId: 'NY', name: 'New York' },
      { stateId: 'NC', name: 'North Carolina' },
      { stateId: 'ND', name: 'North Dakota' },
      { stateId: 'OH', name: 'Ohio' },
      { stateId: 'OK', name: 'Oklahoma' },
      { stateId: 'OR', name: 'Oregon' },
      { stateId: 'PA', name: 'Pennsylvania' },
      { stateId: 'RI', name: 'Rhode Island' },
      { stateId: 'SC', name: 'South Carolina' },
      { stateId: 'SD', name: 'South Dakota' },
      { stateId: 'TN', name: 'Tennessee' },
      { stateId: 'TX', name: 'Texas' },
      { stateId: 'UT', name: 'Utah' },
      { stateId: 'VT', name: 'Vermont' },
      { stateId: 'VA', name: 'Virginia' },
      { stateId: 'WA', name: 'Washington' },
      { stateId: 'WV', name: 'West Virginia' },
      { stateId: 'WI', name: 'Wisconsin' },
      { stateId: 'WY', name: 'Wyoming' },
      { stateId: 'DC', name: 'District of Columbia' }
    ];
    
    usStates.forEach((state, index) => {
      const newState: State = {
        id: index + 1,
        stateId: state.stateId,
        name: state.name
      };
      this.states.set(state.stateId, newState);
    });
  }

  // Get all states
  async getStates(): Promise<State[]> {
    return Array.from(this.states.values());
  }

  // Get state by ID
  async getStateById(stateId: string): Promise<State | undefined> {
    return this.states.get(stateId);
  }

  // Get visited states for a user
  async getVisitedStates(userId: string): Promise<VisitedState[]> {
    return Array.from(this.visitedStates.values()).filter(
      (vs) => vs.userId === userId
    );
  }

  // Toggle state visited status
  async toggleStateVisited(stateId: string, userId: string, visited: boolean): Promise<VisitedState> {
    const key = `${userId}-${stateId}`;
    let visitedState = this.visitedStates.get(key);
    const timestamp = new Date().toISOString();
    
    if (visitedState) {
      // Update existing visited state
      visitedState = {
        ...visitedState,
        visited: visited,
        visitedAt: timestamp
      };
    } else {
      // Create new visited state
      visitedState = {
        id: this.currentVisitedStateId++,
        stateId,
        userId,
        visited,
        visitedAt: timestamp
      };
    }
    
    this.visitedStates.set(key, visitedState);
    return visitedState;
  }

  // Reset all visited states for a user
  async resetVisitedStates(userId: string): Promise<void> {
    const keysToDelete: string[] = [];
    
    this.visitedStates.forEach((vs, key) => {
      if (vs.userId === userId) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.visitedStates.delete(key);
    });
  }

  // Get activities for a user
  async getActivities(userId: string, limit: number = 10): Promise<Activity[]> {
    return this.activities
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Add a new activity
  async addActivity(activity: InsertActivity): Promise<Activity> {
    const newActivity: Activity = {
      id: this.currentActivityId++,
      ...activity
    };
    
    this.activities.push(newActivity);
    
    // Keep only last 50 activities per user to prevent memory issues
    const userActivities = this.activities.filter(a => a.userId === activity.userId);
    if (userActivities.length > 50) {
      // Find oldest activities for this user and remove them
      const oldestIds = userActivities
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .slice(0, userActivities.length - 50)
        .map(a => a.id);
      
      this.activities = this.activities.filter(a => !oldestIds.includes(a.id));
    }
    
    return newActivity;
  }
}

export const storage = new MemStorage();
