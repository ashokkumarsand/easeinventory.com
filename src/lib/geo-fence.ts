import { prisma } from './prisma';

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if a location is within any active geo-fence for the tenant
 */
export async function isWithinGeoFence(
  tenantId: string,
  latitude: number,
  longitude: number
): Promise<{
  isValid: boolean;
  geoFence?: {
    id: string;
    name: string;
    distance: number;
  };
  nearestFence?: {
    id: string;
    name: string;
    distance: number;
    radius: number;
  };
}> {
  // Get all active geo-fences for the tenant
  const geoFences = await prisma.geoFence.findMany({
    where: {
      tenantId,
      isActive: true,
    },
  });

  // If no geo-fences are defined, allow attendance from anywhere
  if (geoFences.length === 0) {
    return { isValid: true };
  }

  let nearestFence: { id: string; name: string; distance: number; radius: number } | undefined = undefined;
  let minDistance = Infinity;

  for (const fence of geoFences) {
    const distance = calculateDistance(
      latitude,
      longitude,
      fence.latitude,
      fence.longitude
    );

    // Track nearest fence for error message
    if (distance < minDistance) {
      minDistance = distance;
      nearestFence = {
        id: fence.id,
        name: fence.name,
        distance: Math.round(distance),
        radius: fence.radius,
      };
    }

    // Check if within radius
    if (distance <= fence.radius) {
      return {
        isValid: true,
        geoFence: {
          id: fence.id,
          name: fence.name,
          distance: Math.round(distance),
        },
      };
    }
  }

  // Not within any geo-fence
  return {
    isValid: false,
    nearestFence,
  };
}

/**
 * Get default geo-fence for a tenant
 */
export async function getDefaultGeoFence(tenantId: string) {
  return prisma.geoFence.findFirst({
    where: {
      tenantId,
      isDefault: true,
      isActive: true,
    },
  });
}
