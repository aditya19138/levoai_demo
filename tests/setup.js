const fs = require('fs');
const path = require('path');

// Setup test environment
process.env.DATABASE_PATH = './database/test.db';
process.env.STORAGE_PATH = './storage/test-schemas';
process.env.PORT = 3001;

// Clean up test database and storage before tests
beforeAll(() => {
  const dbPath = path.resolve(process.env.DATABASE_PATH);
  const storagePath = path.resolve(process.env.STORAGE_PATH);
  
  // Remove test database if exists
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  
  // Remove test storage if exists
  if (fs.existsSync(storagePath)) {
    fs.rmSync(storagePath, { recursive: true, force: true });
  }
});

// Clean up after all tests
afterAll(() => {
  const dbPath = path.resolve(process.env.DATABASE_PATH);
  const storagePath = path.resolve(process.env.STORAGE_PATH);
  
  // Remove test database
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  
  // Remove test storage
  if (fs.existsSync(storagePath)) {
    fs.rmSync(storagePath, { recursive: true, force: true });
  }
});