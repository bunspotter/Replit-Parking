import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { floorConfigs, insertParkingLocationSchema, insertReminderSettingsSchema, updateParkingLocationSchema, updateReminderSettingsSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import schedule from 'node-schedule';

export async function registerRoutes(app: Express): Promise<Server> {
  // Get floor configurations
  app.get("/api/floors", (req, res) => {
    res.json(floorConfigs);
  });

  // Get current active parking location
  app.get("/api/parking/current", async (req, res) => {
    try {
      const currentLocation = await storage.getCurrentParkingLocation();
      res.json(currentLocation || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to get current parking location" });
    }
  });

  // Save a new parking location
  app.post("/api/parking", async (req, res) => {
    try {
      const validatedData = insertParkingLocationSchema.parse(req.body);
      // Deactivate previous active location if exists
      const currentLocation = await storage.getCurrentParkingLocation();
      if (currentLocation) {
        await storage.updateParkingLocation(currentLocation.id, { active: false });
      }
      
      const newLocation = await storage.createParkingLocation(validatedData);
      res.status(201).json(newLocation);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Failed to save parking location" });
      }
    }
  });

  // Clear current parking location
  app.post("/api/parking/clear", async (req, res) => {
    try {
      const currentLocation = await storage.getCurrentParkingLocation();
      if (currentLocation) {
        await storage.updateParkingLocation(currentLocation.id, { active: false });
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "No active parking location found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to clear parking location" });
    }
  });

  // Get parking history
  app.get("/api/parking/history", async (req, res) => {
    try {
      const history = await storage.getParkingHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to get parking history" });
    }
  });

  // Get reminder settings
  app.get("/api/reminder", async (req, res) => {
    try {
      const settings = await storage.getReminderSettings();
      res.json(settings || { enabled: true, time: "08:00" });
    } catch (error) {
      res.status(500).json({ message: "Failed to get reminder settings" });
    }
  });

  // Update reminder settings
  app.post("/api/reminder", async (req, res) => {
    try {
      const validatedData = updateReminderSettingsSchema.parse(req.body);
      const settings = await storage.getReminderSettings();
      
      let updatedSettings;
      if (settings) {
        updatedSettings = await storage.updateReminderSettings(settings.id, validatedData);
      } else {
        updatedSettings = await storage.createReminderSettings({
          ...validatedData,
          userId: null
        });
      }
      
      // Schedule or cancel reminder based on settings
      scheduleReminder(updatedSettings.enabled, updatedSettings.time);
      
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Failed to update reminder settings" });
      }
    }
  });

  // Endpoint to simulate push notification (for testing)
  app.get("/api/notification/test", (req, res) => {
    res.json({ 
      title: "Parking Reminder",
      body: "Don't forget where you parked!"
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Global job reference
let reminderJob: schedule.Job | null = null;

// Schedule reminder notification based on settings
function scheduleReminder(enabled: boolean, time: string) {
  // Cancel existing job if any
  if (reminderJob) {
    reminderJob.cancel();
    reminderJob = null;
  }
  
  // If reminders are disabled, don't schedule a new job
  if (!enabled) return;
  
  // Parse time string (HH:MM)
  const [hours, minutes] = time.split(':').map(Number);
  
  // Create cron expression for daily reminder
  const cronExpression = `0 ${minutes} ${hours} * * *`;
  
  // Schedule new job
  reminderJob = schedule.scheduleJob(cronExpression, async function() {
    console.log(`Executing daily reminder at ${time}`);
    // In a real app, we would push a notification to the user
    // For now, just log it
  });
  
  console.log(`Reminder scheduled for ${time} daily`);
}

// Initialize reminder on server start
async function initializeReminder() {
  try {
    const settings = await storage.getReminderSettings();
    if (settings) {
      scheduleReminder(settings.enabled, settings.time);
    } else {
      // Default reminder at 8:00 AM
      scheduleReminder(true, "08:00");
    }
  } catch (error) {
    console.error("Failed to initialize reminder:", error);
  }
}

// Run initialization
initializeReminder();
