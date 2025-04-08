import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ParkingLocation } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrentParkingCardProps {
  currentParking: ParkingLocation | null | undefined;
  isLoading: boolean;
  onClearParking: () => void;
  onSetParking: () => void;
  onEditParking: () => void;
}

export default function CurrentParkingCard({
  currentParking,
  isLoading,
  onClearParking,
  onSetParking,
  onEditParking,
}: CurrentParkingCardProps) {

  // Format timestamp to relative time (e.g., "2 hours ago")
  const getRelativeTime = (timestamp: Date) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <Card className="bg-surface rounded-xl shadow-md p-5 mb-6">
      <CardContent className="p-0">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Current Parking</h2>
          
          {currentParking && (
            <div className="flex gap-2">
              <button
                onClick={onEditParking}
                className="text-primary hover:bg-primary/10 p-1 rounded"
              >
                <span className="material-icons">edit</span>
              </button>
              <button
                onClick={onClearParking}
                className="text-destructive hover:bg-destructive/10 p-1 rounded"
              >
                <span className="material-icons">delete</span>
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center gap-5 py-2">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ) : currentParking ? (
          <div className="flex items-center gap-5 py-2">
            <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-center">
              <span className="material-icons text-4xl text-primary">directions_car</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="material-icons text-gray-500">apartment</span>
                <p className="text-gray-700 font-medium">Floor {currentParking.floor}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="material-icons text-gray-500">pin_drop</span>
                <p className="text-gray-700 font-medium">Spot {currentParking.spot}</p>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <span className="material-icons text-sm">schedule</span>
                <p>Saved {getRelativeTime(new Date(currentParking.timestamp))}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="material-icons text-4xl text-gray-300 mb-2">not_listed_location</span>
            <p className="text-gray-500">No parking location saved</p>
            <Button
              onClick={onSetParking}
              className="mt-3 bg-primary text-white py-2 px-4 rounded-full flex items-center gap-1"
            >
              <span className="material-icons text-sm">add</span>
              Set Parking Location
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
