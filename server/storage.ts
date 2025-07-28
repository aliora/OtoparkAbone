import { type User, type InsertUser, type ParkingLocation, type InsertParkingLocation, type Subscription, type InsertSubscription } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Parking locations
  getAllParkingLocations(): Promise<ParkingLocation[]>;
  getParkingLocation(id: string): Promise<ParkingLocation | undefined>;
  createParkingLocation(location: InsertParkingLocation): Promise<ParkingLocation>;
  
  // Subscriptions
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscription(id: string): Promise<Subscription | undefined>;
  updateSubscriptionVerification(id: string, isVerified: boolean): Promise<Subscription | undefined>;
  generateVerificationCode(subscriptionId: string): Promise<string>;
  verifyCode(subscriptionId: string, code: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private parkingLocations: Map<string, ParkingLocation>;
  private subscriptions: Map<string, Subscription>;
  private verificationCodes: Map<string, string>; // subscriptionId -> code

  constructor() {
    this.users = new Map();
    this.parkingLocations = new Map();
    this.subscriptions = new Map();
    this.verificationCodes = new Map();
    this.initializeParkingLocations();
  }

  private initializeParkingLocations() {
    const locations: InsertParkingLocation[] = [
      { name: "Şile Borsa İstanbul Spor Salonu", address: "Üsküdar Cd. No:123, Çavuş, 34980 Şile/İstanbul", capacity: 150, availability: "available", district: "Şile" },
      { name: "Ayazağa Anadolu İHL", address: "Ayazağa Anadolu İmam Hatip Lisesi, Maslak, 34485 Sarıyer/İstanbul", capacity: 150, availability: "limited", district: "Sarıyer" },
      { name: "Bakırköy Adliye", address: "İsmail Erez Blv, Osmaniye, 34146 Bakırköy/İstanbul", capacity: 150, availability: "available", district: "Bakırköy" },
      { name: "Beşiktaş İsmail Tarman", address: "Muhtar Oya Çolpan Akyüz Sk. No:2, Konaklar, 34330 Beşiktaş/İstanbul", capacity: 150, availability: "available", district: "Beşiktaş" },
      { name: "Darülaceze Açık", address: "Avrupa Yakası, Halil Rıfat Paşa, 34384 Şişli/İstanbul", capacity: 150, availability: "available", district: "Şişli" },
      { name: "Darülaceze Kapalı Otopark", address: "İlhanlı Sk. 2-14, Halil Rıfat Paşa, 34384 Şişli/İstanbul", capacity: 150, availability: "available", district: "Şişli" },
      { name: "Darülaceze Personel Otoparkı", address: "Top Oyun Havuzu, Perpa Ticaret Merkezi A-Blok No: 2105/D, 34384 Şişli/İstanbul", capacity: 150, availability: "available", district: "Şişli" },
      { name: "Gülbağ Selim Sırrı Tarcan", address: "Kır Düğün Organizasyonu, Mecidiyeköy, İsmail Tartan Sk., 34381 Şişli/İstanbul", capacity: 150, availability: "available", district: "Şişli" },
      { name: "Halit Derviş İbrahim İÖO", address: "Avrupa Yakası, İslambey, 34050 Eyüpsultan/İstanbul", capacity: 150, availability: "available", district: "Eyüpsultan" },
      { name: "Harbiye", address: "Büyükdere Cd. No:13, Merkez, 34381 Şişli/İstanbul", capacity: 150, availability: "full", district: "Şişli" },
      { name: "İSOV MTL (Zincirlikuyu)", address: "Büyükdere Cd. No:167, Esentepe, 34394 Şişli/İstanbul", capacity: 150, availability: "available", district: "Şişli" },
      { name: "Kadıköy Moda", address: "Demirdöküm Yetkili Servisi Kadıköy İletişim, Caferağa, Şevki Bey Sk. No:28, 34710 Kadıköy/İstanbul", capacity: 150, availability: "available", district: "Kadıköy" },
      { name: "Oğuzhan İÖO", address: "Kültür Sokagi, Kartaltepe, 34040 Bayrampaşa/İstanbul", capacity: 150, availability: "available", district: "Bayrampaşa" },
      { name: "Sarayburnu", address: "Hoca Paşa, Sarayburnu İskelesi Avşa - Marmara Adası, 34110 Fatih/İstanbul", capacity: 150, availability: "available", district: "Fatih" },
      { name: "Şehit murat demirci - Fulya", address: "Atatürk Cd. No:79, Mehmet Akif Ersoy, 34283 Arnavutköy/İstanbul", capacity: 150, availability: "available", district: "Arnavutköy" },
      { name: "Selçuk Kız Meslek Lisesi (Fatih)", address: "Halide Edip Adıvar Cd. No:21, Soğanlı, 34183 Bahçelievler/İstanbul", capacity: 150, availability: "available", district: "Bahçelievler" },
      { name: "Şemsettin Sami İlkokulu", address: "103. Çk., Beştelsiz, 34020 Zeytinburnu/İstanbul", capacity: 150, availability: "available", district: "Zeytinburnu" },
      { name: "Şile Borsa İstanbul 50. Yıl", address: "Üsküdar Cd., Çavuş, 34980 Şile/İstanbul", capacity: 150, availability: "available", district: "Şile" },
      { name: "Silivri Kaymakamlık", address: "Hacı Pervaneçeşme Sk. 13-5, Piri Mehmet Paşa, 34570 Silivri/İstanbul", capacity: 150, availability: "available", district: "Silivri" },
      { name: "Silivri Merkez", address: "Silivri, Alibey, 34570 Silivri/İstanbul", capacity: 150, availability: "available", district: "Silivri" },
      { name: "Uluğbey İÖO", address: "Esenler Cd. No:117, Terazidere, 34035 Bayrampaşa/İstanbul", capacity: 150, availability: "available", district: "Bayrampaşa" },
      { name: "Ümraniye Hükümet Konağı", address: "Paksoy Sokak 3, Tantavi, 34764 Ümraniye/İstanbul", capacity: 150, availability: "available", district: "Ümraniye" },
      { name: "Ümraniye MTAL", address: "Alemdağ Cd, Yamanevler, 34768 Ümraniye/İstanbul", capacity: 150, availability: "available", district: "Ümraniye" },
      { name: "Yenibosna", address: "Yıldırım Beyazıt Cd. 46-50, Zafer, 34194 Bahçelievler/İstanbul", capacity: 150, availability: "available", district: "Bahçelievler" },
    ];

    locations.forEach(location => {
      const id = randomUUID();
      const parkingLocation: ParkingLocation = { ...location, id };
      this.parkingLocations.set(id, parkingLocation);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllParkingLocations(): Promise<ParkingLocation[]> {
    return Array.from(this.parkingLocations.values());
  }

  async getParkingLocation(id: string): Promise<ParkingLocation | undefined> {
    return this.parkingLocations.get(id);
  }

  async createParkingLocation(insertLocation: InsertParkingLocation): Promise<ParkingLocation> {
    const id = randomUUID();
    const location: ParkingLocation = { ...insertLocation, id };
    this.parkingLocations.set(id, location);
    return location;
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = { 
      ...insertSubscription, 
      id, 
      createdAt: new Date(),
      isVerified: false,
      verificationCode: null 
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async updateSubscriptionVerification(id: string, isVerified: boolean): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (subscription) {
      subscription.isVerified = isVerified;
      this.subscriptions.set(id, subscription);
      return subscription;
    }
    return undefined;
  }

  async generateVerificationCode(subscriptionId: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.verificationCodes.set(subscriptionId, code);
    return code;
  }

  async verifyCode(subscriptionId: string, code: string): Promise<boolean> {
    const storedCode = this.verificationCodes.get(subscriptionId);
    return storedCode === code;
  }
}

export const storage = new MemStorage();
