import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FloorConfig } from "@shared/schema";
import { Button } from "@/components/UI/button";

export default function SelectLocation() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  const [currentFloorInfo, setCurrentFloorInfo] = useState<FloorConfig | null>(null);

  // Fetch floors data
  const { 
    data: floors, 
    isLoading: isLoadingFloors,
    isError: isFloorsError
  } = useQuery<FloorConfig[]>({
    queryKey: ["/api/floors"],
  });

  // Set default selected floor if floors are loaded
  useEffect(() => {
    if (floors && floors.length > 0 && !selectedFloor) {
      setSelectedFloor(floors[0].floor);
    }
  }, [floors, selectedFloor]);

  // Update current floor info when selected floor changes
  useEffect(() => {
    if (floors && selectedFloor) {
      const floorInfo = floors.find(f => f.floor === selectedFloor);
      if (floorInfo) {
        setCurrentFloorInfo(floorInfo);
      }
    }
  }, [floors, selectedFloor]);

  // Save parking location mutation
  const saveParkingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFloor || !selectedSpot) {
        throw new Error("Please select a floor and spot");
      }
      
      return apiRequest("POST", "/api/parking", {
        floor: selectedFloor,
        spot: selectedSpot,
        userId: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parking/current"] });
      toast({
        title: "Parking saved",
        description: `Your parking location (Floor ${selectedFloor}, Spot ${selectedSpot}) has been saved.`,
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save parking location. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSaveLocation = () => {
    saveParkingMutation.mutate();
  };

  // Generate spot buttons for the current floor
  const renderSpotButtons = () => {
    if (!currentFloorInfo) return null;
    
    const buttons = [];
    for (let spot = currentFloorInfo.minSpot; spot <= currentFloorInfo.maxSpot; spot++) {
      buttons.push(
        <button
          key={spot}
          className={`spot p-2 rounded-md text-center border ${
            selectedSpot === spot
              ? "border-primary bg-primary/10 text-primary font-medium"
              : "border-gray-200 hover:border-primary hover:bg-primary/5"
          }`}
          onClick={() => setSelectedSpot(spot)}
        >
          {spot}
        </button>
      );
    }
    return buttons;
  };

  if (isLoadingFloors) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (isFloorsError) {
    return <div className="p-4 text-center text-red-500">Failed to load floor data</div>;
  }

  return (
    <div className="fixed inset-0 bg-background z-20">
      <header className="bg-primary text-white p-4 flex items-center shadow-md">
        <button onClick={() => navigate("/")} className="mr-2">
          <span className="material-icons">arrow_back</span>
        </button>
        <h2 className="text-xl font-semibold">Select Parking Location</h2>
      </header>

      <div className="p-4">
        {/* Floor selector tabs */}
        <div className="flex overflow-x-auto mb-4 bg-gray-100 rounded-lg p-1 no-scrollbar" id="floorTabs">
          {floors?.map((floor) => (
            <button
              key={floor.floor}
              className={`min-w-[60px] py-2 px-3 rounded-md text-center mx-1 ${
                selectedFloor === floor.floor
                  ? "text-white bg-primary"
                  : "text-gray-700 bg-gray-100 hover:bg-white"
              }`}
              onClick={() => setSelectedFloor(floor.floor)}
            >
              Floor {floor.floor}
            </button>
          ))}
        </div>

        {/* Floor information */}
        {currentFloorInfo && (
          <div className="bg-surface rounded-xl p-4 mb-4 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800">Floor {currentFloorInfo.floor}</h3>
            <p className="text-gray-500">
              {currentFloorInfo.spotCount} spots ({currentFloorInfo.minSpot}-{currentFloorInfo.maxSpot})
            </p>
          </div>
        )}

        {/* Parking spot grid */}
        <div className="bg-surface rounded-xl p-4 shadow-sm">
          <h3 className="text-gray-800 font-medium mb-3">Select your spot</h3>
          
          <div className="grid grid-cols-5 gap-2">
            {renderSpotButtons()}
          </div>

          <div className="mt-6">
            <Button
              disabled={!selectedFloor || !selectedSpot || saveParkingMutation.isPending}
              onClick={handleSaveLocation}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium flex justify-center items-center gap-2"
            >
              <span className="material-icons">save</span>
              Save Parking Location
              {saveParkingMutation.isPending && "..."}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
