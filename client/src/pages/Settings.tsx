import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { ReminderSettings } from "@shared/schema";

export default function Settings() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Fetch reminder settings
  const { 
    data: reminderSettings, 
    isLoading
  } = useQuery<ReminderSettings>({
    queryKey: ["/api/reminder"],
  });

  // Update reminder settings mutation
  const updateReminderMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!reminderSettings) return null;
      
      return apiRequest("POST", "/api/reminder", {
        enabled: enabled,
        time: reminderSettings.time
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminder"] });
      toast({
        title: "Settings updated",
        description: "Your notification settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleNotificationToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    
    // Request notification permission if enabling
    if (enabled && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
        setNotificationsEnabled(false);
        return;
      }
    }
    
    updateReminderMutation.mutate(enabled);
  };

  // Toggle dark mode
  const toggleDarkMode = (enabled: boolean) => {
    setDarkModeEnabled(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-20">
      <header className="bg-primary text-white p-4 flex items-center shadow-md">
        <button onClick={() => navigate("/")} className="mr-2">
          <span className="material-icons">arrow_back</span>
        </button>
        <h2 className="text-xl font-semibold">Settings</h2>
      </header>

      <div className="p-4">
        {/* Notification Settings */}
        <div className="bg-surface rounded-xl shadow-md p-4 mb-4">
          <h3 className="font-medium text-lg mb-3">Notifications</h3>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-icons text-gray-500">notifications</span>
              <span className="text-gray-700">Enable notifications</span>
            </div>
            <Switch 
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
              disabled={updateReminderMutation.isPending}
            />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-icons text-gray-500">vibration</span>
              <span className="text-gray-700">Vibration</span>
            </div>
            <Switch 
              checked={vibrationEnabled}
              onCheckedChange={setVibrationEnabled}
              disabled={!notificationsEnabled}
            />
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-surface rounded-xl shadow-md p-4 mb-4">
          <h3 className="font-medium text-lg mb-3">Display</h3>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-icons text-gray-500">dark_mode</span>
              <span className="text-gray-700">Dark mode</span>
            </div>
            <Switch 
              checked={darkModeEnabled}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </div>

        {/* App Info */}
        <div className="bg-surface rounded-xl shadow-md p-4 mb-4">
          <h3 className="font-medium text-lg mb-3">About</h3>
          
          <div className="mb-2">
            <p className="text-gray-500 text-sm">Version 1.0.0</p>
          </div>
          
          <button className="text-primary flex items-center gap-1">
            <span className="material-icons text-sm">help_outline</span>
            <span>Help & Support</span>
          </button>
        </div>
      </div>
    </div>
  );
}
