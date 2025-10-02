const db = require('./database');

class SchemaVersion {
  static getNextVersion(applicationId, serviceId = null) {
    const stmt = db.prepare(`
      SELECT MAX(version) as max_version 
      FROM schema_versions 
      WHERE application_id = ? AND service_id = ?
    `);
    const result = stmt.get(applicationId, serviceId);
    console.log('Max version result:', result);
    return (result.max_version || 0) + 1;
  }

  static findByChecksum(applicationId, serviceId, checksum) {
    const stmt = db.prepare(`
      SELECT * FROM schema_versions 
      WHERE application_id = ? AND service_id IS ? AND checksum = ?
    `);
    return stmt.get(applicationId, serviceId, checksum);
  }

  static markPreviousAsNotLatest(applicationId, serviceId = null) {
    const stmt = db.prepare(`
      UPDATE schema_versions 
      SET is_latest = false 
      WHERE application_id = ? AND service_id IS ? AND is_latest = true
    `);
    return stmt.run(applicationId, serviceId);
  }

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO schema_versions 
      (application_id, service_id, version, file_path, file_format, is_latest) 
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `);
    return stmt.get(
      data.application_id,
      data.service_id,
      data.version,
      data.file_path,
      data.file_format,
      data.is_latest
    );
  }

  static getLatest(applicationId, serviceId = null) {
    const stmt = db.prepare(`
      SELECT * FROM schema_versions 
      WHERE application_id = ? AND service_id IS ? AND is_latest = 1
    `);
    return stmt.get(applicationId, serviceId);
  }

  static getByVersion(applicationId, serviceId = null, version) {
    const stmt = db.prepare(`
      SELECT * FROM schema_versions 
      WHERE application_id = ? AND service_id IS ? AND version = ?
    `);
    return stmt.get(applicationId, serviceId, version);
  }

  static getAllVersions(applicationId, serviceId = null) {
    const stmt = db.prepare(`
      SELECT * FROM schema_versions 
      WHERE application_id = ? AND service_id IS ? 
      ORDER BY version DESC
    `);
    return stmt.all(applicationId, serviceId);
  }
}

module.exports = SchemaVersion;