/**
 * eventData.js — Static sample data for TechFusion 2026
 * In production, this comes from Firebase/MongoDB via the backend API.
 */

export const EVENT_META = {
  name: "TechFusion 2026",
  venue: "Mumbai Convention Center",
  date: "April 20, 2026",
};

// Zones with capacity and live crowd simulation
export const ZONES = [
  { id: "main",        name: "Main Stage",          color: "#6366f1", emoji: "🎤", capacity: 500, current: 420, status: "crowded"  },
  { id: "workshop",    name: "Workshop Hall",        color: "#10b981", emoji: "🛠️", capacity: 200, current: 90,  status: "moderate" },
  { id: "startup",     name: "Startup Pavilion",     color: "#f59e0b", emoji: "🚀", capacity: 300, current: 60,  status: "free"     },
  { id: "food",        name: "Food Court",           color: "#ef4444", emoji: "🍱", capacity: 400, current: 390, status: "crowded"  },
  { id: "networking",  name: "Networking Lounge",    color: "#8b5cf6", emoji: "🤝", capacity: 150, current: 80,  status: "moderate" },
  { id: "demo",        name: "Demo Zone",            color: "#06b6d4", emoji: "💻", capacity: 250, current: 50,  status: "free"     },
];

// Full event schedule with gamification points
export const SCHEDULE = [
  { id: 1,  time: "09:00", title: "Opening Keynote",           speaker: "Priya Sharma",      zone: "main",       tags: ["AI","Innovation"],      duration: 60,  points: 100 },
  { id: 2,  time: "10:00", title: "Build with LLMs Workshop",  speaker: "Rahul Mehta",       zone: "workshop",   tags: ["AI","Hands-on"],        duration: 90,  points: 150 },
  { id: 3,  time: "10:30", title: "Startup Pitch Battle",      speaker: "Multiple Founders", zone: "startup",    tags: ["Startup","Networking"], duration: 120, points: 120 },
  { id: 4,  time: "11:30", title: "Web3 & Beyond",             speaker: "Anika Patel",       zone: "main",       tags: ["Blockchain","Future"],  duration: 45,  points: 80  },
  { id: 5,  time: "12:30", title: "Lunch & Networking",        speaker: null,                zone: "food",       tags: ["Food","Networking"],    duration: 60,  points: 50  },
  { id: 6,  time: "13:30", title: "AI Product Demo Showcase",  speaker: "Various Teams",     zone: "demo",       tags: ["AI","Products"],        duration: 90,  points: 130 },
  { id: 7,  time: "14:00", title: "Cloud Architecture Dive",   speaker: "Vikram Singh",      zone: "workshop",   tags: ["Cloud","Technical"],    duration: 60,  points: 100 },
  { id: 8,  time: "15:30", title: "Fireside: Future of Work",  speaker: "CEO Panel",         zone: "networking", tags: ["Leadership","Careers"], duration: 60,  points: 90  },
  { id: 9,  time: "16:30", title: "Hackathon Kickoff",         speaker: "Organizing Team",   zone: "main",       tags: ["Hackathon","Fun"],      duration: 30,  points: 200 },
  { id: 10, time: "17:00", title: "Closing Ceremony & Awards", speaker: "All Speakers",      zone: "main",       tags: ["Awards","Networking"],  duration: 60,  points: 150 },
];

// Gamification badge definitions
export const BADGES = [
  { id: "early",     name: "Early Bird",       icon: "🌅", threshold: 1, description: "Attended your first session"   },
  { id: "explorer",  name: "Zone Explorer",    icon: "🗺️", threshold: 3, description: "Visited 3 or more zones"       },
  { id: "networker", name: "Super Networker",  icon: "🤝", threshold: 5, description: "Checked into 5+ sessions"      },
  { id: "champion",  name: "Event Champion",   icon: "🏆", threshold: 8, description: "Attended 8 or more sessions"   },
];
