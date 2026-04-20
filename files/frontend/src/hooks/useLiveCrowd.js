import { useState, useEffect } from "react";
import { ZONES } from "../data/eventData";

export default function useLiveCrowd() {
  const [liveZones, setLiveZones] = useState(ZONES);

  useEffect(() => {
    // Simulate real-time crowd fluctuations every 3.5 seconds
    const interval = setInterval(() => {
      setLiveZones(prevZones => prevZones.map(zone => {
        // Fluctuate by -2 to +2 people
        const change = Math.floor(Math.random() * 5) - 2;
        let newCurrent = zone.current + change;
        
        // Keep within bounds
        if (newCurrent < 0) newCurrent = 0;
        if (newCurrent > zone.capacity) newCurrent = zone.capacity;
        
        // Update status based on new percentage
        const pct = newCurrent / zone.capacity;
        let newStatus = "free";
        if (pct >= 0.85) newStatus = "crowded";
        else if (pct >= 0.5) newStatus = "moderate";

        return { ...zone, current: newCurrent, status: newStatus };
      }));
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return liveZones;
}
