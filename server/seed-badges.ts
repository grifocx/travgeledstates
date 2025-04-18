import { db } from "./db";
import { badges, BadgeCriteria } from "@shared/schema";
import { sql } from "drizzle-orm";

// Badge tiers
// 1 = Bronze, 2 = Silver, 3 = Gold

export async function seedBadges() {
  console.log("Checking if badges need to be seeded...");
  
  // Check if we already have badges
  const existingBadges = await db.select().from(badges);
  
  if (existingBadges.length > 0) {
    console.log(`Found ${existingBadges.length} existing badges. Skipping seeding.`);
    return;
  }
  
  console.log("No badges found. Seeding initial badges data...");
  
  // Milestone Badges
  const milestoneBadges = [
    {
      name: "First Step",
      description: "Visit your first state",
      imageUrl: "/badges/milestone.svg",
      category: "milestone",
      tier: 1,
      criteria: {
        type: "stateCount",
        count: 1
      } as BadgeCriteria
    },
    {
      name: "Adventurer",
      description: "Visit 10 states",
      imageUrl: "/badges/placeholder-bronze.svg",
      category: "milestone",
      tier: 1,
      criteria: {
        type: "stateCount",
        count: 10
      } as BadgeCriteria
    },
    {
      name: "Explorer",
      description: "Visit 25 states",
      imageUrl: "/badges/placeholder-silver.svg",
      category: "milestone",
      tier: 2,
      criteria: {
        type: "stateCount",
        count: 25
      } as BadgeCriteria
    },
    {
      name: "Voyager",
      description: "Visit 40 states",
      imageUrl: "/badges/placeholder-gold.svg",
      category: "milestone",
      tier: 3,
      criteria: {
        type: "stateCount",
        count: 40
      } as BadgeCriteria
    },
    {
      name: "Completionist",
      description: "Visit all 50 states",
      imageUrl: "/badges/placeholder-gold.svg",
      category: "milestone",
      tier: 3,
      criteria: {
        type: "stateCount",
        count: 50
      } as BadgeCriteria
    }
  ];
  
  // Regional Badges
  const regionalBadges = [
    {
      name: "Northeast Explorer",
      description: "Visit all states in the Northeast region",
      imageUrl: "/badges/regional.svg",
      category: "regional",
      tier: 2,
      criteria: {
        type: "regionComplete",
        region: "northeast",
        states: ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA"]
      } as BadgeCriteria
    },
    {
      name: "Southeast Adventurer",
      description: "Visit all states in the Southeast region",
      imageUrl: "/badges/regional.svg",
      category: "regional",
      tier: 2,
      criteria: {
        type: "regionComplete",
        region: "southeast",
        states: ["DE", "MD", "VA", "WV", "KY", "NC", "SC", "TN", "GA", "FL", "AL", "MS", "AR", "LA"]
      } as BadgeCriteria
    },
    {
      name: "Midwest Voyager",
      description: "Visit all states in the Midwest region",
      imageUrl: "/badges/regional.svg",
      category: "regional",
      tier: 2,
      criteria: {
        type: "regionComplete",
        region: "midwest",
        states: ["OH", "IN", "IL", "MI", "WI", "MN", "IA", "MO", "ND", "SD", "NE", "KS"]
      } as BadgeCriteria
    },
    {
      name: "Southwest Pioneer",
      description: "Visit all states in the Southwest region",
      imageUrl: "/badges/regional.svg",
      category: "regional",
      tier: 2,
      criteria: {
        type: "regionComplete",
        region: "southwest",
        states: ["TX", "OK", "NM", "AZ"]
      } as BadgeCriteria
    },
    {
      name: "West Coast Traveler",
      description: "Visit all states on the West Coast",
      imageUrl: "/badges/regional.svg",
      category: "regional",
      tier: 2,
      criteria: {
        type: "regionComplete",
        region: "westCoast",
        states: ["CA", "OR", "WA"]
      } as BadgeCriteria
    }
  ];
  
  // Special Badges
  const specialBadges = [
    {
      name: "Four Corners",
      description: "Visit all four states that meet at the Four Corners Monument",
      imageUrl: "/badges/special.svg",
      category: "special",
      tier: 2,
      criteria: {
        type: "specificStates",
        states: ["UT", "CO", "AZ", "NM"],
        requireAll: true
      } as BadgeCriteria
    },
    {
      name: "Coast to Coast",
      description: "Visit both the Atlantic and Pacific coasts",
      imageUrl: "/badges/special.svg", 
      category: "special",
      tier: 2,
      criteria: {
        type: "specificStates",
        states: ["ME", "NH", "MA", "RI", "CT", "NY", "NJ", "DE", "MD", "VA", "NC", "SC", "GA", "FL"],
        requireAtLeastOne: true,
        andStates: ["CA", "OR", "WA"],
        requireAtLeastOneFrom: true
      } as BadgeCriteria
    }
  ];
  
  // Combine all badges
  const allBadges = [...milestoneBadges, ...regionalBadges, ...specialBadges];
  
  // Insert badges into the database
  try {
    const insertedBadges = await db.insert(badges).values(allBadges).returning();
    console.log(`Successfully seeded ${insertedBadges.length} badges.`);
  } catch (error) {
    console.error("Error seeding badges:", error);
  }
}