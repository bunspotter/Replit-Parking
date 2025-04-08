import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import NotificationPermission from "@/components/NotificationPermission";
import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";

export default function Onboarding() {
  const [location, navigate] = useLocation();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const { setFirstVisit } = useAppContext();

  const handleGetStarted = () => {
    setShowNotificationPrompt(true);
  };

  const handleAllowNotifications = async () => {
    // Request notification permission
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
    
    completeOnboarding();
  };

  const handleSkipNotifications = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    // Mark first visit as completed
    setFirstVisit(false);
    
    // Navigate to home page
    navigate("/");
  };

  return (
    <div className="fixed inset-0 bg-background z-30">
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-8">
            <span className="material-icons text-primary text-6xl">directions_car</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to ParkRemind</h1>
          <p className="text-gray-600 mb-8">Never forget where you parked again. Save your parking location and get daily reminders.</p>
          
          <div className="w-full max-w-xs">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-4 mb-4">
              <span className="material-icons text-primary">map</span>
              <span className="text-left text-gray-700">Select your parking spot</span>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-4 mb-4">
              <span className="material-icons text-primary">notifications</span>
              <span className="text-left text-gray-700">Set daily reminders</span>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-4 mb-4">
              <span className="material-icons text-primary">history</span>
              <span className="text-left text-gray-700">Access parking history</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <Button 
            onClick={handleGetStarted}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium mb-4"
          >
            Get Started
          </Button>
        </div>
      </div>

      {showNotificationPrompt && (
        <NotificationPermission
          onAllow={handleAllowNotifications}
          onSkip={handleSkipNotifications}
        />
      )}
    </div>
  );
}
