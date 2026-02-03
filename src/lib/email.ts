import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Transporter (uses environment variables)
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email Templates as HTML strings
const welcomeEmailTemplate = (userName: string, tenantName: string, loginUrl: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#18c964 0%,#17c863 100%);padding:40px 20px;text-align:center;">
      <h1 style="color:white;margin:0;font-size:28px;">Welcome to EaseInventory! 🎉</h1>
    </div>
    <div style="padding:40px 30px;background-color:#ffffff;">
      <p style="font-size:16px;color:#333;">Hi <strong>${userName}</strong>,</p>
      <p style="font-size:16px;color:#555;line-height:1.6;">
        Your account for <strong>${tenantName}</strong> has been created successfully. 
        You now have access to India's most intuitive inventory management platform.
      </p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${loginUrl}" style="background-color:#18c964;color:white;padding:14px 32px;text-decoration:none;border-radius:30px;font-weight:bold;display:inline-block;">
          Get Started →
        </a>
      </div>
      <p style="font-size:14px;color:#888;">
        Need help? Visit our <a href="https://easeinventory.com/help" style="color:#18c964;">Help Center</a>.
      </p>
    </div>
    <div style="background-color:#f5f5f5;padding:20px;text-align:center;">
      <p style="font-size:12px;color:#888;margin:0;">© 2024 EaseInventory. Made with ❤️ in India</p>
    </div>
  </div>
</body>
</html>
`;

interface LowStockItem {
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
}

const lowStockAlertTemplate = (tenantName: string, items: LowStockItem[], dashboardUrl: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#f31260;padding:30px 20px;text-align:center;">
      <h1 style="color:white;margin:0;font-size:24px;">⚠️ Low Stock Alert</h1>
    </div>
    <div style="padding:30px;background-color:#ffffff;">
      <p style="font-size:16px;color:#333;">
        <strong>${tenantName}</strong> - ${items.length} products are running low on stock:
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:20px;">
        <thead>
          <tr style="background-color:#f5f5f5;">
            <th style="padding:12px;text-align:left;font-size:12px;font-weight:bold;">Product</th>
            <th style="padding:12px;text-align:center;font-size:12px;">Current</th>
            <th style="padding:12px;text-align:center;font-size:12px;">Min</th>
          </tr>
        </thead>
        <tbody>
          ${items.slice(0, 10).map(item => `
            <tr style="border-bottom:1px solid #eee;">
              <td style="padding:12px;">
                <strong style="color:#333;">${item.name}</strong><br/>
                <span style="font-size:12px;color:#888;">${item.sku}</span>
              </td>
              <td style="padding:12px;text-align:center;color:#f31260;font-weight:bold;">${item.currentStock}</td>
              <td style="padding:12px;text-align:center;color:#888;">${item.minStock}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="text-align:center;margin:30px 0;">
        <a href="${dashboardUrl}" style="background-color:#333;color:white;padding:12px 28px;text-decoration:none;border-radius:30px;font-weight:bold;">
          View Inventory →
        </a>
      </div>
    </div>
  </div>
</body>
</html>
`;

const releaseEmailTemplate = (userName: string, version: string, features: string[]) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#006fee 0%,#0050b3 100%);padding:40px 20px;text-align:center;">
      <h1 style="color:white;margin:0;font-size:28px;">🚀 New Release: v${version}</h1>
    </div>
    <div style="padding:40px 30px;background-color:#ffffff;">
      <p style="font-size:16px;color:#333;">Hi <strong>${userName}</strong>,</p>
      <p style="font-size:16px;color:#555;line-height:1.6;">
        We're excited to announce a new update to EaseInventory! Here's what's new:
      </p>
      <ul style="padding:0 0 0 20px;margin:20px 0;">
        ${features.map(feature => `
          <li style="font-size:15px;color:#444;margin-bottom:10px;line-height:1.5;">${feature}</li>
        `).join('')}
      </ul>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://easeinventory.com/changelog" style="background-color:#006fee;color:white;padding:14px 32px;text-decoration:none;border-radius:30px;font-weight:bold;display:inline-block;">
          See Full Changelog →
        </a>
      </div>
    </div>
    <div style="background-color:#f5f5f5;padding:20px;text-align:center;">
      <p style="font-size:12px;color:#888;margin:0;">
        You're receiving this because you opted in to release notifications.<br/>
        <a href="https://easeinventory.com/unsubscribe" style="color:#888;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// Email Sending Functions
export async function sendWelcomeEmail(to: string, userName: string, tenantName: string) {
  try {
    const transporter = getTransporter();
    const loginUrl = `https://${tenantName.toLowerCase().replace(/\s+/g, '-')}.easeinventory.com/login`;
    const html = welcomeEmailTemplate(userName, tenantName, loginUrl);

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'EaseInventory <noreply@easeinventory.com>',
      to,
      subject: `Welcome to EaseInventory, ${userName}! 🎉`,
      html,
    });

    console.log(`Welcome email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

export async function sendLowStockAlert(tenantId: string) {
  try {
    // Fetch tenant with users using include
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          where: { role: 'OWNER' },
          take: 1,
        },
      },
    });

    if (!tenant || !tenant.users[0]?.email) {
      console.error('No tenant or owner email found');
      return false;
    }

    // Fetch low stock items
    const products = await prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      select: {
        name: true,
        sku: true,
        quantity: true,
        minStock: true,
      },
    });

    const lowStockItems = products
      .filter((p) => p.quantity <= (p.minStock || 5))
      .map((p) => ({
        name: p.name,
        sku: p.sku || 'N/A',
        currentStock: p.quantity,
        minStock: p.minStock || 5,
      }));

    if (lowStockItems.length === 0) {
      console.log('No low stock items to report');
      return true;
    }

    const transporter = getTransporter();
    // Use slug as it exists in the Tenant model
    const subdomain = tenant.slug || tenant.id;
    const dashboardUrl = `https://${subdomain}.easeinventory.com/dashboard/inventory`;
    const html = lowStockAlertTemplate(tenant.name, lowStockItems, dashboardUrl);

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'EaseInventory <noreply@easeinventory.com>',
      to: tenant.users[0].email,
      subject: `⚠️ Low Stock Alert: ${lowStockItems.length} items need attention`,
      html,
    });

    console.log(`Low stock alert sent to ${tenant.users[0].email}`);
    return true;
  } catch (error) {
    console.error('Failed to send low stock alert:', error);
    return false;
  }
}

export async function sendReleaseNotification(emails: string[], version: string, features: string[]) {
  try {
    const transporter = getTransporter();

    for (const email of emails) {
      const userName = email.split('@')[0];
      const html = releaseEmailTemplate(userName, version, features);

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'EaseInventory <noreply@easeinventory.com>',
        to: email,
        subject: `🚀 EaseInventory v${version} is here!`,
        html,
      });
    }

    console.log(`Release notification sent to ${emails.length} users`);
    return true;
  } catch (error) {
    console.error('Failed to send release notification:', error);
    return false;
  }
}
