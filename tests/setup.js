const fs = require('fs');
const path = require('path');

// Setup test environment directly in test file
process.env.DATABASE_PATH = './database/test.db';
process.env.STORAGE_PATH = './storage/test-schemas';
process.env.PORT = 3001;

let db;

// Clean up test database and storage before tests
beforeAll(() => {
  const dbPath = path.resolve(process.env.DATABASE_PATH);
  const dbDir = path.dirname(dbPath);
  const storagePath = path.resolve(process.env.STORAGE_PATH);

  // check if directories exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Remove old database if exists
  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
    } catch (err) {
      // If can't delete, that's okay - will be overwritten
      console.warn('Could not delete old test database');
    }
  }

  // Remove old storage if exists
  if (fs.existsSync(storagePath)) {
    try {
      fs.rmSync(storagePath, { recursive: true, force: true });
    } catch (err) {
      console.warn('Could not delete old test storage');
    }
  }

  db = require('../src/models/database');
});

// Clean up after all tests
afterAll((done) => {
  // Close the database connection
  if (db) {
    try {
      db.close();
    } catch (err) {
      console.warn('Error closing database:', err.message);
    }
  }


  setTimeout(() => {
    const dbPath = path.resolve(process.env.DATABASE_PATH);
    const storagePath = path.resolve(process.env.STORAGE_PATH);

    // Try to clean up
    if (fs.existsSync(dbPath)) {
      try {
        fs.unlinkSync(dbPath);
      } catch (err) {
        console.warn('Could not delete test database (will be overwritten next run)');
      }
    }

    if (fs.existsSync(storagePath)) {
      try {
        fs.rmSync(storagePath, { recursive: true, force: true });
      } catch (err) {
        console.warn('Could not delete test storage (will be overwritten next run)');
      }
    }

    done();
  }, 500);
});
