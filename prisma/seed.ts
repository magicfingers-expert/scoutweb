import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ScoutWeb database...');

  const demoEmail = 'demo@scoutweb.io';
  const existingUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  let user;
  if (!existingUser) {
    user = await prisma.user.create({
      data: {
        name: 'ScoutWeb Admin',
        email: demoEmail,
        passwordHash,
        role: 'admin',
        plan: 'agency',
        searchesLimit: 1000,
        searchesUsed: 0,
      },
    });
    console.log(`Created default user: ${demoEmail} (Password: Password123!)`);
  } else {
    user = existingUser;
    console.log(`Default user ${demoEmail} already exists.`);
  }

  // Create an initial welcome activity log
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'SYSTEM_INITIALIZED',
      details: 'ScoutWeb Enterprise Backend & Database Initialized',
    },
  });

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

