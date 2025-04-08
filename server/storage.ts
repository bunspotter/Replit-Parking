import { type User, type InsertUser, type ParkingLocation, type InsertParkingLocation, type ReminderSettings, type InsertReminderSettings, type UpdateReminderSettings, type UpdateParkingLocation } from "@shared/schema";

// Storage interface with all required CRUD methods
export interface IStorage {
  // User methods (from existing code)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Parking location methods
  createParkingLocation(parkingLocation: InsertParkingLocation): Promise<ParkingLocation>;
  getParkingLocation(id: number): Promise<ParkingLocation | undefined>;
  getCurrentParkingLocation(): Promise<ParkingLocation | undefined>;
  updateParkingLocation(id: number, update: UpdateParkingLocation): Promise<ParkingLocation>;
  getParkingHistory(limit?: number): Promise<ParkingLocation[]>;
  
  // Reminder settings methods
  getReminderSettings(): Promise<ReminderSettings | undefined>;
  createReminderSettings(settings: InsertReminderSettings): Promise<ReminderSettings>;
  updateReminderSettings(id: number, update: UpdateReminderSettings): Promise<ReminderSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private parkingLocations: Map<number, ParkingLocation>;
  private reminderSettings: Map<number, ReminderSettings>;
  private userIdCounter: number;
  private parkingIdCounter: number;
  private reminderIdCounter: number;

  constructor() {
    this.users = new Map();
    this.parkingLocations = new Map();
    this.reminderSettings = new Map();
    this.userIdCounter = 1;
    this.parkingIdCounter = 1;
    this.reminderIdCounter = 1;
    
    // Initialize default reminder settings
    this.createReminderSettings({
      enabled: true,
      time: "08:00",
      userId: null
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Parking location methods
  async createParkingLocation(insertParkingLocation: InsertParkingLocation): Promise<ParkingLocation> {
    const id = this.parkingIdCounter++;
    const timestamp = new Date();
    const parkingLocation: ParkingLocation = { 
      ...insertParkingLocation, 
      id, 
      timestamp, 
      active: true 
    };
    this.parkingLocations.set(id, parkingLocation);
    return parkingLocation;
  }

  async getParkingLocation(id: number): Promise<ParkingLocation | undefined> {
    return this.parkingLocations.get(id);
  }

  async getCurrentParkingLocation(): Promise<ParkingLocation | undefined> {
    return Array.from(this.parkingLocations.values()).find(
      (location) => location.active
    );
  }

  async updateParkingLocation(id: number, update: UpdateParkingLocation): Promise<ParkingLocation> {
    const existingLocation = this.parkingLocations.get(id);
    if (!existingLocation) {
      throw new Error(`Parking location with ID ${id} not found`);
    }
    
    const updatedLocation = { ...existingLocation, ...update };
    this.parkingLocations.set(id, updatedLocation);
    return updatedLocation;
  }

  async getParkingHistory(limit: number = 10): Promise<ParkingLocation[]> {
    return Array.from(this.parkingLocations.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Reminder settings methods
  async getReminderSettings(): Promise<ReminderSettings | undefined> {
    if (this.reminderSettings.size === 0) return undefined;
    return Array.from(this.reminderSettings.values())[0];
  }

  async createReminderSettings(settings: InsertReminderSettings): Promise<ReminderSettings> {
    const id = this.reminderIdCounter++;
    const reminderSettings: ReminderSettings = { ...settings, id };
    this.reminderSettings.set(id, reminderSettings);
    return reminderSettings;
  }

  async updateReminderSettings(id: number, update: UpdateReminderSettings): Promise<ReminderSettings> {
    const existingSettings = this.reminderSettings.get(id);
    if (!existingSettings) {
      throw new Error(`Reminder settings with ID ${id} not found`);
    }
    
    const updatedSettings = { ...existingSettings, ...update };
    this.reminderSettings.set(id, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
