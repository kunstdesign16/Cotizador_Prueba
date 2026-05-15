import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    return NextResponse.json({ 
      success: false, 
      error: 'No connection string provided in environment variables (DATABASE_URL is missing)' 
    }, { status: 500 });
  }

  // Hide password for safety in output
  const safeConnectionString = connectionString.replace(/:([^:@]+)@/, ':***@');

  try {
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000 // 10 seconds timeout
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, version() as version');
    client.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'Connection to database was SUCCESSFUL!',
      urlUsed: safeConnectionString,
      dbTime: result.rows[0].time,
      dbVersion: result.rows[0].version
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to the database',
      urlUsed: safeConnectionString,
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code,
      errorStack: error.stack
    }, { status: 500 });
  }
}
