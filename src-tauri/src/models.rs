use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemStatus {
    pub os: String,
    pub os_version: String,
    pub computer_model: String,
    pub hostname: String,
    pub is_locked: bool,
    pub microphone_status: String,
    pub voice_recognition_status: String,
    pub security_score: u32,
    pub uptime: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivityLog {
    pub id: String,
    pub timestamp: String,
    pub raw_command: String,
    pub recognized_intent: String,
    pub language: String,
    pub confidence: f64,
    pub status: String,
    pub feedback: String,
    pub is_security_event: bool,
    pub execution_time_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionResponse {
    pub success: bool,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandPayload {
    pub raw_command: String,
    pub language: Option<String>,
}

