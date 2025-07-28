import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const parkingLocations = pgTable("parking_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  capacity: integer("capacity").notNull().default(150),
  availability: text("availability").notNull().default("available"), // "available", "limited", "full"
  district: text("district").notNull(),
  operatingHours: text("operating_hours").notNull().default("7/24"),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  licensePlate: text("license_plate").notNull(),
  plan: text("plan").notNull(), // "monthly", "quarterly", "yearly"
  planPrice: integer("plan_price").notNull(), // in Turkish Lira (kuruş)
  cardNumber: text("card_number").notNull(),
  cardHolder: text("card_holder").notNull(),
  expiryDate: text("expiry_date").notNull(),
  cvv: text("cvv").notNull(),
  parkingLocationId: text("parking_location_id").references(() => parkingLocations.id),
  acceptTerms: boolean("accept_terms").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationCode: text("verification_code"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertParkingLocationSchema = createInsertSchema(parkingLocations).omit({
  id: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
}).extend({
  licensePlate: z.string().regex(/^\d{2}\s[A-Z]{1,3}\s\d{2,4}$/, "Geçerli bir Türk plaka formatı giriniz (örn: 34 ABC 123)"),
  phone: z.string().regex(/^\+90\s5\d{2}\s\d{3}\s\d{2}\s\d{2}$/, "Geçerli bir telefon numarası giriniz (+90 5XX XXX XX XX)"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  cardNumber: z.string().regex(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, "Geçerli bir kart numarası giriniz"),
  cvv: z.string().length(3, "CVV 3 haneli olmalıdır"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Geçerli bir son kullanma tarihi giriniz (MM/YY)"),
});

export type InsertParkingLocation = z.infer<typeof insertParkingLocationSchema>;
export type ParkingLocation = typeof parkingLocations.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
