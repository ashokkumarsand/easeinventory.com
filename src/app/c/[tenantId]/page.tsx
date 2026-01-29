import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function TenantPortalPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const session = await getServerSession(authOptions);

  // Find the tenant to verify it exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    redirect('/'); // Or 404
  }

  // If user is already logged in and belongs to this tenant, go to dashboard
  if (session && (session.user as any).tenantId === tenantId) {
    redirect('/dashboard');
  }

  // Otherwise, redirect to login with workspace context if slug exists, 
  // or just to login if it's a "free" tenant without a slug
  const loginUrl = tenant.slug 
    ? `/login?workspace=${tenant.slug}` 
    : `/login?tenantId=${tenantId}`;
  
  redirect(loginUrl);
}
