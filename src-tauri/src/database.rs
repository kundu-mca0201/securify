use crate::models::ActivityLog;
use rusqlite::{params, Connection, Result};
use std::sync::Mutex;

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn init() -> Result<Self> {
        let conn = Connection::open("securemate_activity.db")?;

        // Initialize schema
        conn.execute(
            "CREATE TABLE IF NOT EXISTS activity_logs (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                raw_command TEXT NOT NULL,
                recognized_intent TEXT NOT NULL,
                language TEXT NOT NULL,
                confidence REAL NOT NULL,
                status TEXT NOT NULL,
                feedback TEXT NOT NULL,
                is_security_event INTEGER NOT NULL,
                execution_time_ms INTEGER
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS security_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )",
            [],
        )?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    pub fn insert_log(&self, log: &ActivityLog) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO activity_logs (
                id, timestamp, raw_command, recognized_intent, language,
                confidence, status, feedback, is_security_event, execution_time_ms
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                log.id,
                log.timestamp,
                log.raw_command,
                log.recognized_intent,
                log.language,
                log.confidence,
                log.status,
                log.feedback,
                if log.is_security_event { 1 } else { 0 },
                log.execution_time_ms
            ],
        )?;
        Ok(())
    }

    pub fn get_recent_logs(&self, limit: usize) -> Result<Vec<ActivityLog>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, timestamp, raw_command, recognized_intent, language,
                    confidence, status, feedback, is_security_event, execution_time_ms
             FROM activity_logs ORDER BY rowid DESC LIMIT ?1",
        )?;

        let rows = stmt.query_map(params![limit as i64], |row| {
            let is_sec: i32 = row.get(8)?;
            Ok(ActivityLog {
                id: row.get(0)?,
                timestamp: row.get(1)?,
                raw_command: row.get(2)?,
                recognized_intent: row.get(3)?,
                language: row.get(4)?,
                confidence: row.get(5)?,
                status: row.get(6)?,
                feedback: row.get(7)?,
                is_security_event: is_sec != 0,
                execution_time_ms: row.get(9)?,
            })
        })?;

        let mut results = Vec::new();
        for r in rows {
            if let Ok(item) = r {
                results.push(item);
            }
        }
        Ok(results)
    }

    pub fn clear_logs(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM activity_logs", [])?;
        Ok(())
    }
}

