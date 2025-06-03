const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not found - skipping migrations (development mode)');
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('Running database migrations...');
    
    // Read and execute the SQL migration file
    const migrationSQL = fs.readFileSync(path.join(__dirname, 'database_setup.sql'), 'utf8');
    await pool.query(migrationSQL);
    
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();