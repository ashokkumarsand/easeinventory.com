import prisma from '@/lib/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PlanType, normalizePlanType } from '@/lib/plan-features';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        workspace: { label: 'Workspace', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        // --- MASTER ADMIN CHECK ---
        const MASTER_ADMIN_USER = process.env.ADMIN_USERNAME || 'easeinventoryadmin';
        const MASTER_ADMIN_PASS = process.env.ADMIN_PASSWORD || '123456789';

        if (credentials.email === MASTER_ADMIN_USER && credentials.password === MASTER_ADMIN_PASS) {
          return {
            id: 'master-admin',
            email: 'admin@easeinventory.com',
            name: 'Master Admin',
            tenantId: 'system',
            tenantSlug: 'admin',
            role: 'SUPER_ADMIN',
            onboardingStatus: 'COMPLETED',
            registrationStatus: 'APPROVED',
            setupComplete: true,
            plan: 'ENTERPRISE' as PlanType,
            planExpiresAt: null,
          };
        }
        // --------------------------

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            tenant: true,
          },
        });

        if (!user || !user.password) {
          throw new Error('User not found');
        }

        // Validate workspace if provided, otherwise default to user's first tenant
        if (credentials.workspace) {
          if (user.tenant?.slug !== credentials.workspace) {
            throw new Error('Invalid workspace for this user');
          }
        } else if (!user.tenantId) {
          throw new Error('This user is not associated with any workspace');
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId || null,
          tenantSlug: user.tenant?.slug || null,
          role: user.role,
          onboardingStatus: (user.tenant?.settings as any)?.onboardingStatus || 'PENDING',
          registrationStatus: user.tenant?.registrationStatus || 'PENDING',
          setupComplete: (user.tenant?.settings as any)?.setupComplete ?? true,
          customDomain: user.tenant?.customDomain || null,
          plan: normalizePlanType((user.tenant?.plan as string) || 'TRIAL'),
          planExpiresAt: user.tenant?.planExpiresAt || null,
          trialEndsAt: (user.tenant as any)?.trialEndsAt || null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // You can add logic here to check if user exists or needs onboarding
        return true;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.tenantId = (user as any).tenantId;
        token.tenantSlug = (user as any).tenantSlug;
        token.role = (user as any).role;
        token.onboardingStatus = (user as any).onboardingStatus;
        token.registrationStatus = (user as any).registrationStatus;
        token.customDomain = (user as any).customDomain;
        token.plan = normalizePlanType((user as any).plan || 'TRIAL');
        token.planExpiresAt = (user as any).planExpiresAt;
        token.trialEndsAt = (user as any).trialEndsAt;
        token.setupComplete = (user as any).setupComplete;

        // Check if internal staff
        const isInternalDomain = user.email?.endsWith('@easeinventory.com');
        const isMasterAdmin = (user as any).role === 'SUPER_ADMIN';

        if (isInternalDomain || isMasterAdmin) {
          const staffRecord = await prisma.backofficeStaff.findUnique({
            where: { userId: user.id }
          });
          token.isInternalStaff = true;
          token.backofficePermissions = staffRecord?.permissions || (isMasterAdmin ? { "ALL": "FULL" } : {});
        } else {
          token.isInternalStaff = false;
        }
      }
      // If we update the session (e.g. after onboarding)
      if (trigger === "update" && session) {
        token.tenantId = session.tenantId;
        token.tenantSlug = session.tenantSlug;
        token.onboardingStatus = session.onboardingStatus;
        token.registrationStatus = session.registrationStatus;
        if (session.plan) token.plan = normalizePlanType(session.plan);
        if (session.planExpiresAt) token.planExpiresAt = session.planExpiresAt;
        if (session.trialEndsAt) token.trialEndsAt = session.trialEndsAt;
        if (session.setupComplete !== undefined) token.setupComplete = session.setupComplete;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).tenantSlug = token.tenantSlug;
        (session.user as any).role = token.role;
        (session.user as any).onboardingStatus = token.onboardingStatus;
        (session.user as any).registrationStatus = token.registrationStatus;
        (session.user as any).customDomain = token.customDomain;
        (session.user as any).isInternalStaff = token.isInternalStaff;
        (session.user as any).backofficePermissions = token.backofficePermissions;
        (session.user as any).plan = token.plan;
        (session.user as any).planExpiresAt = token.planExpiresAt;
        (session.user as any).trialEndsAt = token.trialEndsAt;
        (session.user as any).setupComplete = token.setupComplete;
      }
      return session;
    },
  },
};
