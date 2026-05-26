const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ล้างข้อมูลเก่า
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // สร้าง demo user
  const hashedPassword = await bcrypt.hash('password123', 12);

  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
      role: 'USER',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // สร้าง demo tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'ออกแบบ UI หน้า Dashboard',
        description: 'ทำ wireframe และ mockup สำหรับหน้า dashboard หลัก',
        status: 'DONE',
        priority: 'HIGH',
        userId: user.id,
      },
      {
        title: 'เขียน API Authentication',
        description: 'สร้าง endpoint สำหรับ login, register, refresh token',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        userId: user.id,
      },
      {
        title: 'ตั้งค่า CI/CD Pipeline',
        description: 'ตั้งค่า GitHub Actions สำหรับ auto deploy ไปยัง AWS',
        status: 'TODO',
        priority: 'MEDIUM',
        userId: user.id,
      },
      {
        title: 'เขียน Unit Tests',
        description: 'เขียน test ครอบคลุม controllers และ middleware หลัก',
        status: 'TODO',
        priority: 'LOW',
        userId: user.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // อีก 7 วัน
      },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('');
  console.log('Demo accounts:');
  console.log('  Email: demo@example.com  | Password: password123');
  console.log('  Email: admin@example.com | Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
