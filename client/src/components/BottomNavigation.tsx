import { useLocation } from "wouter";

interface BottomNavigationProps {
  activePage: "home" | "location" | "history";
}

export default function BottomNavigation({ activePage }: BottomNavigationProps) {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface shadow-lg border-t border-gray-200 p-2 z-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around">
          <button
            onClick={() => navigate("/")}
            className={`flex flex-col items-center p-2 ${
              activePage === "home" ? "text-primary" : "text-gray-500 hover:text-primary"
            }`}
          >
            <span className="material-icons">home</span>
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={() => navigate("/select-location")}
            className={`flex flex-col items-center p-2 ${
              activePage === "location" ? "text-primary" : "text-gray-500 hover:text-primary"
            }`}
          >
            <span className="material-icons">pin_drop</span>
            <span className="text-xs mt-1">Set Location</span>
          </button>
          <button
            onClick={() => navigate("/history")}
            className={`flex flex-col items-center p-2 ${
              activePage === "history" ? "text-primary" : "text-gray-500 hover:text-primary"
            }`}
          >
            <span className="material-icons">history</span>
            <span className="text-xs mt-1">History</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
