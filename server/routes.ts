import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriptionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all parking locations
  app.get("/api/parking-locations", async (req, res) => {
    try {
      const locations = await storage.getAllParkingLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Otopark lokasyonları alınırken hata oluştu" });
    }
  });

  // Get single parking location
  app.get("/api/parking-locations/:id", async (req, res) => {
    try {
      const location = await storage.getParkingLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ message: "Otopark lokasyonu bulunamadı" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Otopark lokasyonu alınırken hata oluştu" });
    }
  });

  // Create subscription
  app.post("/api/subscriptions", async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(validatedData);
      
      // Generate verification code
      const verificationCode = await storage.generateVerificationCode(subscription.id);
      
      res.status(201).json({ 
        id: subscription.id,
        message: "Abonelik oluşturuldu. SMS doğrulama kodu gönderildi.",
        verificationSent: true
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Form bilgilerinde hata var",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Abonelik oluşturulurken hata oluştu" });
    }
  });

  // Verify SMS code
  app.post("/api/subscriptions/:id/verify", async (req, res) => {
    try {
      const { code } = req.body;
      const subscriptionId = req.params.id;

      if (!code) {
        return res.status(400).json({ message: "Doğrulama kodu gerekli" });
      }

      const isValid = await storage.verifyCode(subscriptionId, code);
      
      if (!isValid) {
        return res.status(400).json({ message: "Geçersiz doğrulama kodu" });
      }

      const subscription = await storage.updateSubscriptionVerification(subscriptionId, true);
      
      if (!subscription) {
        return res.status(404).json({ message: "Abonelik bulunamadı" });
      }

      res.json({ 
        message: "Doğrulama başarılı. Aboneliğiniz aktif edildi.",
        subscription: {
          id: subscription.id,
          plan: subscription.plan,
          licensePlate: subscription.licensePlate
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Doğrulama işlemi sırasında hata oluştu" });
    }
  });

  // Resend verification code
  app.post("/api/subscriptions/:id/resend-code", async (req, res) => {
    try {
      const subscriptionId = req.params.id;
      const subscription = await storage.getSubscription(subscriptionId);
      
      if (!subscription) {
        return res.status(404).json({ message: "Abonelik bulunamadı" });
      }

      if (subscription.isVerified) {
        return res.status(400).json({ message: "Bu abonelik zaten doğrulanmış" });
      }

      const verificationCode = await storage.generateVerificationCode(subscriptionId);
      
      res.json({ 
        message: "Yeni doğrulama kodu gönderildi",
        codeSent: true
      });
    } catch (error) {
      res.status(500).json({ message: "Kod gönderilirken hata oluştu" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
