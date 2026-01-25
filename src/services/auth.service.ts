import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { TenantService } from './tenant.service';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  businessName: string;
  slug: string;
}

export class AuthService {
  /**
   * Register a new tenant and a primary user (OWNER)
   */
  static async register(input: RegisterUserInput) {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // 2. Create the Tenant
    const tenant = await TenantService.create({
      name: input.businessName,
      slug: input.slug,
      email: input.email,
    });

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(input.password, 12);

    // 4. Create the User (Owner)
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: 'OWNER',
        tenantId: tenant.id,
      },
    });

    return { user, tenant };
  }
}

export default AuthService;
