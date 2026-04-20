/**
 * data/sampleData.js — Backend event data
 * In production: fetch from Firebase/MongoDB instead.
 */

const ZONES = [
  { id: "main",       name: "Main Stage",       capacity: 500, current: 420, status: "crowded"  },
  { id: "workshop",   name: "Workshop Hall",     capacity: 200, current: 90,  status: "moderate" },
  { id: "startup",    name: "Startup Pavilion",  capacity: 300, current: 60,  status: "free"     },
  { id: "food",       name: "Food Court",        capacity: 400, current: 390, status: "crowded"  },
  { id: "networking", name: "Networking Lounge", capacity: 150, current: 80,  status: "moderate" },
  { id: "demo",       name: "Demo Zone",         capacity: 250, current: 50,  status: "free"     },
];

const SCHEDULE = [
  { id: 1,  time: "09:00", title: "Opening Keynote",          zone: "main",       tags: ["AI","Innovation"],      points: 100 },
  { id: 2,  time: "10:00", title: "Build with LLMs Workshop", zone: "workshop",   tags: ["AI","Hands-on"],        points: 150 },
  { id: 3,  time: "10:30", title: "Startup Pitch Battle",     zone: "startup",    tags: ["Startup","Networking"], points: 120 },
  { id: 4,  time: "11:30", title: "Web3 & Beyond",            zone: "main",       tags: ["Blockchain","Future"],  points: 80  },
  { id: 5,  time: "12:30", title: "Lunch & Networking",       zone: "food",       tags: ["Food","Networking"],    points: 50  },
  { id: 6,  time: "13:30", title: "AI Product Demo Showcase", zone: "demo",       tags: ["AI","Products"],        points: 130 },
  { id: 7,  time: "14:00", title: "Cloud Architecture Dive",  zone: "workshop",   tags: ["Cloud","Technical"],    points: 100 },
  { id: 8,  time: "15:30", title: "Fireside: Future of Work", zone: "networking", tags: ["Leadership","Careers"], points: 90  },
  { id: 9,  time: "16:30", title: "Hackathon Kickoff",        zone: "main",       tags: ["Hackathon","Fun"],      points: 200 },
  { id: 10, time: "17:00", title: "Closing Ceremony",         zone: "main",       tags: ["Awards","Networking"],  points: 150 },
];

const BADGES = [
  { id: "early",     name: "Early Bird",      threshold: 1 },
  { id: "explorer",  name: "Zone Explorer",   threshold: 3 },
  { id: "networker", name: "Super Networker", threshold: 5 },
  { id: "champion",  name: "Event Champion",  threshold: 8 },
];

module.exports = { ZONES, SCHEDULE, BADGES };
