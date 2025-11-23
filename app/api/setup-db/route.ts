import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Try to create tables using db push
    const { execSync } = require('child_process');
    
    try {
      execSync('npx prisma db push --skip-generate --accept-data-loss', {
        stdio: 'inherit',
        env: { ...process.env }
      });
      
      return NextResponse.json({
        success: true,
        message: "Database tables created successfully!"
      });
    } catch (pushError) {
      return NextResponse.json({
        success: false,
        error: "Failed to push schema",
        details: pushError instanceof Error ? pushError.message : String(pushError)
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Database connection failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

