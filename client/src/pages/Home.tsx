import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CurrentParkingCard from "@/components/CurrentParkingCard";
import ReminderCard from "@/components/ReminderCard";
import BottomNavigation from "@/components/BottomNavigation";
import NotificationPermission from "@/components/NotificationPermission";
import { useAppContext } from "@/contexts/AppContext";

export default function Home() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { isFirstVisit, setFirstVisit } = useAppContext();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Check if first visit to show onboarding
  useEffect(() => {
    if (isFirstVisit) {
      navigate("/onboarding");
    }
  }, [isFirstVisit, navigate]);

  // Fetch current parking location
  const { 
    data: currentParking, 
    isLoading: isLoadingParking,
    isError: isParkingError
  } = useQuery({
    queryKey: ["/api/parking/current"],
  });

  // Clear parking mutation
  const clearParkingMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/parking/clear");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parking/current"] });
      toast({
        title: "Parking location cleared",
        description: "Your parking location has been cleared successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear parking location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClearParking = () => {
    clearParkingMutation.mutate();
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen relative pb-20">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">ParkRemind</h1>
          <button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <span className="material-icons">settings</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <CurrentParkingCard
          currentParking={currentParking}
          isLoading={isLoadingParking}
          onClearParking={handleClearParking}
          onSetParking={() => navigate("/select-location")}
          onEditParking={() => navigate("/select-location")}
        />
        
        <ReminderCard />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activePage="home" />
      
      {/* Notification Permission Dialog */}
      {showNotificationPrompt && (
        <NotificationPermission
          onAllow={() => {
            setShowNotificationPrompt(false);
          }}
          onSkip={() => {
            setShowNotificationPrompt(false);
          }}
        />
      )}
    </div>
  );
}
