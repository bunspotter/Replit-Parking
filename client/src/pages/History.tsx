import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ParkingLocation } from "@shared/schema";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export default function History() {
  const [location, navigate] = useLocation();

  // Fetch parking history
  const { 
    data: parkingHistory, 
    isLoading, 
    isError 
  } = useQuery<ParkingLocation[]>({
    queryKey: ["/api/parking/history"],
  });

  // Handle "use again" click
  const handleUseAgain = async (parking: ParkingLocation) => {
    try {
      await apiRequest("POST", "/api/parking", {
        floor: parking.floor,
        spot: parking.spot,
        userId: null
      });
      navigate("/");
    } catch (error) {
      console.error("Failed to set parking location:", error);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-20">
      <header className="bg-primary text-white p-4 flex items-center shadow-md">
        <button onClick={() => navigate("/")} className="mr-2">
          <span className="material-icons">arrow_back</span>
        </button>
        <h2 className="text-xl font-semibold">Parking History</h2>
      </header>

      <div className="p-4">
        {isLoading && (
          <div className="text-center py-8">Loading history...</div>
        )}

        {isError && (
          <div className="text-center py-8 text-red-500">
            Failed to load parking history
          </div>
        )}

        {parkingHistory && parkingHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No parking history found
          </div>
        )}

        {parkingHistory && parkingHistory.map((parking) => (
          <div key={parking.id} className="bg-surface rounded-xl shadow-md p-4 mb-4">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">Floor {parking.floor}, Spot {parking.spot}</h3>
              <span className="text-sm text-gray-500">
                {formatDate(new Date(parking.timestamp))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">
                {format(new Date(parking.timestamp), "h:mm a")} - 
                {parking.active ? " Present" : " Past"}
              </span>
              {!parking.active && (
                <button 
                  onClick={() => handleUseAgain(parking)}
                  className="text-primary text-sm"
                >
                  Use Again
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
