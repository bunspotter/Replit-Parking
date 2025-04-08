import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ReminderSettings } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReminderCard() {
  const { toast } = useToast();
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("08:00");

  // Fetch reminder settings
  const { 
    data: settings, 
    isLoading, 
    isError 
  } = useQuery<ReminderSettings>({
    queryKey: ["/api/reminder"],
  });

  // Update state when settings are loaded
  useEffect(() => {
    if (settings) {
      setReminderEnabled(settings.enabled);
      setReminderTime(settings.time);
    }
  }, [settings]);

  // Update reminder settings mutation
  const updateReminderMutation = useMutation({
    mutationFn: async (data: { enabled?: boolean; time?: string }) => {
      const updatedSettings = {
        ...(settings || { enabled: true, time: "08:00" }),
        ...data
      };
      
      return apiRequest("POST", "/api/reminder", updatedSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminder"] });
      toast({
        title: "Reminder updated",
        description: "Your reminder settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update reminder settings. Please try again.",
        variant: "destructive",
      });
      // Revert to previous state on error
      if (settings) {
        setReminderEnabled(settings.enabled);
        setReminderTime(settings.time);
      }
    }
  });

  // Handle toggle change
  const handleToggleChange = (checked: boolean) => {
    setReminderEnabled(checked);
    updateReminderMutation.mutate({ enabled: checked });
  };

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setReminderTime(newTime);
    updateReminderMutation.mutate({ time: newTime });
  };

  if (isLoading) {
    return (
      <Card className="bg-surface rounded-xl shadow-md p-5 mb-6">
        <CardContent className="p-0">
          <Skeleton className="h-6 w-1/3 mb-6" />
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface rounded-xl shadow-md p-5 mb-6">
      <CardContent className="p-0">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Daily Reminder</h2>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-icons text-gray-500">notifications</span>
            <span className="text-gray-700">Reminder notifications</span>
          </div>
          <Switch 
            checked={reminderEnabled}
            onCheckedChange={handleToggleChange}
            disabled={updateReminderMutation.isPending}
          />
        </div>
        
        <div 
          className={`flex items-center gap-2 mt-4 ${!reminderEnabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <span className="material-icons text-gray-500">schedule</span>
          <span className="text-gray-700">Reminder time</span>
          <div className="ml-auto flex items-center bg-gray-100 rounded-md px-3 py-2">
            <input
              type="time"
              value={reminderTime}
              onChange={handleTimeChange}
              disabled={!reminderEnabled || updateReminderMutation.isPending}
              className="time-picker text-right text-gray-700 bg-transparent"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
