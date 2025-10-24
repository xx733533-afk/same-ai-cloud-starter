const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  // Connect to PostgreSQL (assuming it's running locally)
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
  });

  try {
    // Create database if it doesn't exist
    await pool.query('CREATE DATABASE codeguide_ai_assistant');
    console.log('✅ Database created successfully');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('ℹ️  Database already exists');
    } else {
      console.error('❌ Error creating database:', error.message);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }

  // Now connect to the new database and run migrations
  const dbPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/codeguide_ai_assistant',
  });

  try {
    // Read and execute the migration file
    const migrationPath = path.join(__dirname, '../drizzle/0001_real_demogoblin.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await dbPool.query(statement);
      }
    }
    
    console.log('✅ Database migrations applied successfully');
  } catch (error) {
    console.error('❌ Error applying migrations:', error.message);
    process.exit(1);
  } finally {
    await dbPool.end();
  }
}

setupDatabase();