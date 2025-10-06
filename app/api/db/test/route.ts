import { NextResponse } from 'next/server';
import db from '@/lib/db/database';

export async function GET() {
  try {
    // Test database connection by getting the list of tables
    const tables = db
      .getDatabase()
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
      )
      .all();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tables,
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
