import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🎓 Creating test student account...\n");

  const email = "student@test.com";
  const password = "student123";
  const name = "Test Student";
  const idNumber = "TEST123456";
  const phoneNumber = "+1234567890";

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`⚠️  User ${email} already exists!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      idNumber,
      phoneNumber,
      role: "student",
    },
  });

  console.log("✅ Test student created successfully!\n");
  console.log("📧 Email:", email);
  console.log("🔑 Password:", password);
  console.log("👤 Name:", name);
  console.log("\n🌐 Login at: http://localhost:3000/en/login");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
