const db = require('./database');

class Application {
    static findByName(name) {
        const stmt = db.prepare('SELECT * FROM applications WHERE name = ?');
        return stmt.get(name);
    }

    static create(name) {
        const stmt = db.prepare(`
      INSERT INTO applications (name) 
      VALUES (?) 
      ON CONFLICT(name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `);
        return stmt.get(name);
    }

    static findOrCreate(name) {
        let app = this.findByName(name);
        if (!app) {
            app = this.create(name);
        }
        return app;
    }
}

module.exports = Application;