import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  console.log(`🔍 Looking for user with email: ${email}...`);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User with email "${email}" not found.`);
      console.log("\n💡 Available users:");
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true, role: true },
      });
      allUsers.forEach((u) => {
        console.log(`   - ${u.email} (${u.name}) - Role: ${u.role}`);
      });
      process.exit(1);
    }

    if (user.role === "admin") {
      console.log(`ℹ️  User "${user.name}" (${email}) is already an admin.`);
      process.exit(0);
    }

    // Update user to admin
    await prisma.user.update({
      where: { email },
      data: { role: "admin" },
    });

    console.log(`✅ Successfully made "${user.name}" (${email}) an admin!`);
    console.log("\n🎉 User can now access the admin panel at /admin");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address.");
  console.log("\nUsage:");
  console.log("  npx ts-node scripts/make-admin.ts <email>");
  console.log("\nExample:");
  console.log("  npx ts-node scripts/make-admin.ts user@example.com");
  process.exit(1);
}

// Run the script
makeAdmin(email)
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

