import { db } from "./db";
import { badges } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

const initialBadges = [
  // Exploration milestone badges (bronze, silver, gold, platinum)
  {
    name: "Explorer",
    description: "Visit 10 different states",
    imageUrl: "/badges/explorer.svg",
    criteria: { type: "states_count", value: 10 },
    tier: 1,
    category: "milestone"
  },
  {
    name: "Adventurer",
    description: "Visit 25 different states",
    imageUrl: "/badges/adventurer.svg",
    criteria: { type: "states_count", value: 25 },
    tier: 2,
    category: "milestone"
  },
  {
    name: "Voyager",
    description: "Visit 40 different states",
    imageUrl: "/badges/voyager.svg", 
    criteria: { type: "states_count", value: 40 },
    tier: 3,
    category: "milestone"
  },
  {
    name: "Globetrotter",
    description: "Visit all 50 states - you've seen it all!",
    imageUrl: "/badges/globetrotter.svg",
    criteria: { type: "states_count", value: 50 },
    tier: 4,
    category: "milestone"
  },
  
  // Regional badges
  {
    name: "West Coast Explorer",
    description: "Visit all West Coast states (CA, OR, WA)",
    imageUrl: "/badges/west-coast.svg",
    criteria: { 
      type: "region_complete", 
      value: ["CA", "OR", "WA"] 
    },
    tier: 2,
    category: "regional"
  },
  {
    name: "East Coast Traveler",
    description: "Visit all East Coast states (ME, NH, MA, RI, CT, NY, NJ, DE, MD, VA, NC, SC, GA, FL)",
    imageUrl: "/badges/east-coast.svg",
    criteria: { 
      type: "region_complete", 
      value: ["ME", "NH", "MA", "RI", "CT", "NY", "NJ", "DE", "MD", "VA", "NC", "SC", "GA", "FL"] 
    },
    tier: 3,
    category: "regional"
  },
  {
    name: "Great Lakes Voyager",
    description: "Visit all Great Lakes states (MN, WI, MI, IL, IN, OH, PA, NY)",
    imageUrl: "/badges/great-lakes.svg",
    criteria: { 
      type: "region_complete", 
      value: ["MN", "WI", "MI", "IL", "IN", "OH", "PA", "NY"] 
    },
    tier: 2,
    category: "regional"
  },
  {
    name: "Southern Charm",
    description: "Visit all Southern states (TX, OK, AR, LA, MS, AL, TN, KY, WV, VA, NC, SC, GA, FL)",
    imageUrl: "/badges/southern.svg",
    criteria: { 
      type: "region_complete", 
      value: ["TX", "OK", "AR", "LA", "MS", "AL", "TN", "KY", "WV", "VA", "NC", "SC", "GA", "FL"] 
    },
    tier: 3,
    category: "regional"
  },
  
  // Special badges
  {
    name: "Four Corners",
    description: "Visit the Four Corners states (AZ, CO, NM, UT)",
    imageUrl: "/badges/four-corners.svg",
    criteria: { 
      type: "specific_states", 
      value: ["AZ", "CO", "NM", "UT"] 
    },
    tier: 2,
    category: "special"
  },
  {
    name: "Mountain Climber",
    description: "Visit all Rocky Mountain states (MT, ID, WY, UT, CO, NM, AZ)",
    imageUrl: "/badges/mountain.svg",
    criteria: { 
      type: "specific_states", 
      value: ["MT", "ID", "WY", "UT", "CO", "NM", "AZ"] 
    },
    tier: 2,
    category: "special"
  },
  {
    name: "Hawaiian Paradise",
    description: "Visit Hawaii",
    imageUrl: "/badges/hawaii.svg",
    criteria: { 
      type: "specific_states", 
      value: ["HI"] 
    },
    tier: 1,
    category: "special"
  },
  {
    name: "Alaskan Frontier",
    description: "Visit Alaska",
    imageUrl: "/badges/alaska.svg",
    criteria: { 
      type: "specific_states", 
      value: ["AK"] 
    },
    tier: 1,
    category: "special"
  }
];

export async function seedBadges() {
  console.log("Checking if badges need to be seeded...");
  
  // Check if badges already exist
  const existingBadges = await db.select({ count: sql`count(*)` }).from(badges);
  const badgeCount = Number(existingBadges[0]?.count || 0);
  
  if (badgeCount > 0) {
    console.log(`Found ${badgeCount} existing badges. Skipping seeding.`);
    return;
  }
  
  console.log("No badges found. Seeding initial badges data...");
  
  // Insert badges
  for (const badge of initialBadges) {
    await db.insert(badges).values({
      name: badge.name,
      description: badge.description,
      imageUrl: badge.imageUrl,
      criteria: badge.criteria,
      tier: badge.tier,
      category: badge.category
    });
  }
  
  console.log(`Successfully seeded ${initialBadges.length} badges.`);
}