import prisma from "@/lib/prisma";

export async function checkLicenseExpiries() {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const tenants = await prisma.tenant.findMany({
        where: {
            planExpiresAt: {
                lte: threeDaysFromNow,
                gt: new Date()
            },
            isActive: true
        }
    });

    for (const tenant of tenants) {
        // Mock notification logic
        console.log(`[License Notification] Tenant ${tenant.name} (${tenant.id}) expires in 3 days. Sending alert...`);
        
        // Here you would integrate with an email service or internal notification system
        // e.g., await sendEmail(tenant.email, "Your license expires in 3 days");
        
        // Log the notification in the database if needed
    }

    return tenants.length;
}

export async function getNotificationConfig() {
    // This could be fetched from a global settings model later
    return {
        renewalAlertDays: 3,
        autoNotify: true
    };
}
