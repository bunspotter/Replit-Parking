import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NotificationPermissionProps {
  onAllow: () => void;
  onSkip: () => void;
}

export default function NotificationPermission({
  onAllow,
  onSkip,
}: NotificationPermissionProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <Card className="bg-white rounded-xl p-6 max-w-xs mx-4 shadow-xl">
        <CardContent className="p-0">
          <div className="flex justify-center mb-4">
            <span className="material-icons text-primary text-5xl">notifications_active</span>
          </div>
          <h3 className="text-xl font-semibold text-center mb-2">Enable Notifications</h3>
          <p className="text-gray-600 text-center mb-6">
            Allow ParkRemind to send you daily reminders about your parking location.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={onAllow}
              className="bg-primary text-white py-2 px-4 rounded-lg font-medium"
            >
              Allow
            </Button>
            <Button
              onClick={onSkip}
              variant="ghost"
              className="py-2 px-4 text-gray-500"
            >
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
