const db = require('./database');

class Service {
    static findByNameAndApp(name, applicationId) {
        const stmt = db.prepare(`
      SELECT * FROM services 
      WHERE name = ? AND application_id = ?
    `);
        return stmt.get(name, applicationId);
    }

    static create(name, applicationId) {
        const stmt = db.prepare(`
      INSERT INTO services (name, application_id) 
      VALUES (?, ?) 
      ON CONFLICT(name, application_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `);
        return stmt.get(name, applicationId);
    }

    static findOrCreate(name, applicationId) {
        let service = this.findByNameAndApp(name, applicationId);
        if (!service) {
            service = this.create(name, applicationId);
        }
        return service;
    }
}

module.exports = Service;