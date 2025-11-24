import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Fixing admin account...\n");

  const adminEmail = "admin@example.com";
  const adminPassword = "admin123";

  // Check if admin exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("📧 Admin account found. Resetting password...");

    // Hash new password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Update admin
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log("✅ Admin password reset successfully!\n");
  } else {
    console.log("❌ Admin account not found. Creating new admin...\n");

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin User",
        idNumber: "ADMIN001",
        phoneNumber: "+0000000000",
        role: "admin",
      },
    });

    console.log("✅ Admin account created successfully!\n");
  }

  console.log("📧 Email:", adminEmail);
  console.log("🔑 Password:", adminPassword);
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
