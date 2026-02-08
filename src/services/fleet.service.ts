import prisma from '@/lib/prisma';

/**
 * Fleet Management Service
 *
 * Manages vehicles, drivers, and delivery trips for businesses
 * with their own delivery fleet. Read-only analytics plus
 * trip management using Tenant.settings JSON for fleet data
 * (no new Prisma models).
 */

interface Vehicle {
  id: string;
  registrationNumber: string;
  type: 'BIKE' | 'VAN' | 'TRUCK' | 'TEMPO';
  capacity: number; // max weight kg
  status: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE';
  driverName?: string;
  driverPhone?: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  vehicleId?: string;
  status: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY';
  totalTrips: number;
  rating: number; // 1-5
}

interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  shipmentIds: string[];
  startedAt?: string;
  completedAt?: string;
  totalStops: number;
  totalDistance?: number;
  notes?: string;
  createdAt: string;
}

interface FleetData {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
}

interface FleetDashboard {
  summary: {
    totalVehicles: number;
    availableVehicles: number;
    onTripVehicles: number;
    maintenanceVehicles: number;
    totalDrivers: number;
    availableDrivers: number;
    totalTripsToday: number;
    completedTripsToday: number;
  };
  vehicles: Vehicle[];
  drivers: Driver[];
  recentTrips: Trip[];
  // Analytics from actual shipment data
  deliveryStats: {
    totalShipmentsThisMonth: number;
    avgDeliveryDays: number;
    onTimeDeliveryPct: number;
    pendingPickups: number;
  };
}

function getFleetData(settings: any): FleetData {
  const fleet = settings?.fleet || {};
  return {
    vehicles: fleet.vehicles || [],
    drivers: fleet.drivers || [],
    trips: fleet.trips || [],
  };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export class FleetService {
  static async getDashboard(tenantId: string): Promise<FleetDashboard> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const fleet = getFleetData(tenant?.settings);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const todayTrips = fleet.trips.filter((t) => t.createdAt?.startsWith(todayStr));

    // Get real shipment data
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [shipments, pendingPickups] = await Promise.all([
      prisma.shipment.findMany({
        where: {
          tenantId,
          createdAt: { gte: monthStart },
        },
        select: { status: true, createdAt: true, deliveredAt: true },
      }),
      prisma.shipment.count({
        where: {
          tenantId,
          status: { in: ['CREATED', 'PICKUP_SCHEDULED'] },
        },
      }),
    ]);

    const deliveredShipments = shipments.filter((s) => s.deliveredAt);
    const avgDeliveryDays = deliveredShipments.length > 0
      ? deliveredShipments.reduce((sum, s) => {
          const days = (s.deliveredAt!.getTime() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / deliveredShipments.length
      : 0;

    const onTimePct = deliveredShipments.length > 0
      ? Math.round(
          (deliveredShipments.filter((s) => {
            const days = (s.deliveredAt!.getTime() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return days <= 5;
          }).length / deliveredShipments.length) * 100
        )
      : 100;

    return {
      summary: {
        totalVehicles: fleet.vehicles.length,
        availableVehicles: fleet.vehicles.filter((v) => v.status === 'AVAILABLE').length,
        onTripVehicles: fleet.vehicles.filter((v) => v.status === 'ON_TRIP').length,
        maintenanceVehicles: fleet.vehicles.filter((v) => v.status === 'MAINTENANCE').length,
        totalDrivers: fleet.drivers.length,
        availableDrivers: fleet.drivers.filter((d) => d.status === 'AVAILABLE').length,
        totalTripsToday: todayTrips.length,
        completedTripsToday: todayTrips.filter((t) => t.status === 'COMPLETED').length,
      },
      vehicles: fleet.vehicles,
      drivers: fleet.drivers,
      recentTrips: fleet.trips.slice(-20).reverse(),
      deliveryStats: {
        totalShipmentsThisMonth: shipments.length,
        avgDeliveryDays: Math.round(avgDeliveryDays * 10) / 10,
        onTimeDeliveryPct: onTimePct,
        pendingPickups,
      },
    };
  }

  static async addVehicle(tenantId: string, vehicle: Omit<Vehicle, 'id' | 'status'>): Promise<Vehicle> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const settings = (tenant?.settings as any) || {};
    const fleet = getFleetData(settings);

    const newVehicle: Vehicle = {
      id: generateId(),
      ...vehicle,
      status: 'AVAILABLE',
    };
    fleet.vehicles.push(newVehicle);

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: { ...settings, fleet } },
    });

    return newVehicle;
  }

  static async addDriver(tenantId: string, driver: Omit<Driver, 'id' | 'status' | 'totalTrips' | 'rating'>): Promise<Driver> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const settings = (tenant?.settings as any) || {};
    const fleet = getFleetData(settings);

    const newDriver: Driver = {
      id: generateId(),
      ...driver,
      status: 'AVAILABLE',
      totalTrips: 0,
      rating: 5,
    };
    fleet.drivers.push(newDriver);

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: { ...settings, fleet } },
    });

    return newDriver;
  }

  static async createTrip(
    tenantId: string,
    input: { vehicleId: string; driverId: string; shipmentIds: string[]; notes?: string }
  ): Promise<Trip> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const settings = (tenant?.settings as any) || {};
    const fleet = getFleetData(settings);

    const vehicle = fleet.vehicles.find((v) => v.id === input.vehicleId);
    const driver = fleet.drivers.find((d) => d.id === input.driverId);
    if (!vehicle) throw new Error('Vehicle not found');
    if (!driver) throw new Error('Driver not found');

    const trip: Trip = {
      id: generateId(),
      vehicleId: input.vehicleId,
      driverId: input.driverId,
      status: 'PLANNED',
      shipmentIds: input.shipmentIds,
      totalStops: input.shipmentIds.length,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    fleet.trips.push(trip);
    vehicle.status = 'ON_TRIP';
    driver.status = 'ON_TRIP';

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: { ...settings, fleet } },
    });

    return trip;
  }

  static async completeTrip(tenantId: string, tripId: string): Promise<Trip> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const settings = (tenant?.settings as any) || {};
    const fleet = getFleetData(settings);

    const trip = fleet.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');

    trip.status = 'COMPLETED';
    trip.completedAt = new Date().toISOString();

    const vehicle = fleet.vehicles.find((v) => v.id === trip.vehicleId);
    const driver = fleet.drivers.find((d) => d.id === trip.driverId);
    if (vehicle) vehicle.status = 'AVAILABLE';
    if (driver) {
      driver.status = 'AVAILABLE';
      driver.totalTrips++;
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: { ...settings, fleet } },
    });

    return trip;
  }
}
