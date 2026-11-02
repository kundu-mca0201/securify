pub mod database;
pub mod intent_processor;
pub mod models;
pub mod os_controller;
pub mod security_manager;

use database::Database;
use models::{ActionResponse, ActivityLog, SystemStatus};
use os_controller::OSController;
use security_manager::SecurityManager;
use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub db: Mutex<Option<Database>>,
    pub security: Mutex<SecurityManager>,
}

#[tauri::command]
fn lock_system() -> Result<ActionResponse, String> {
    OSController::lock_screen()
}

#[tauri::command]
fn sleep_system() -> Result<ActionResponse, String> {
    OSController::sleep_system()
}

#[tauri::command]
fn restart_system(confirmed: bool, state: State<'_, AppState>) -> Result<ActionResponse, String> {
    let sec = state.security.lock().map_err(|e| e.to_string())?;
    sec.validate_destructive_action("RESTART_SYSTEM", confirmed)?;
    OSController::restart_system()
}

#[tauri::command]
fn shutdown_system(confirmed: bool, state: State<'_, AppState>) -> Result<ActionResponse, String> {
    let sec = state.security.lock().map_err(|e| e.to_string())?;
    sec.validate_destructive_action("SHUTDOWN_SYSTEM", confirmed)?;
    OSController::shutdown_system()
}

#[tauri::command]
fn open_app(app_name: String, state: State<'_, AppState>) -> Result<ActionResponse, String> {
    let sec = state.security.lock().map_err(|e| e.to_string())?;
    if !sec.is_app_allowed(&app_name) {
        return Err(format!("Application '{}' is not in system allowlist", app_name));
    }
    OSController::open_application(&app_name)
}

#[tauri::command]
fn get_system_status() -> SystemStatus {
    OSController::get_system_status()
}

#[tauri::command]
fn log_activity(log: ActivityLog, state: State<'_, AppState>) -> Result<bool, String> {
    let db_guard = state.db.lock().map_err(|e| e.to_string())?;
    if let Some(ref db) = *db_guard {
        db.insert_log(&log).map_err(|e| e.to_string())?;
        Ok(true)
    } else {
        Ok(false)
    }
}

#[tauri::command]
fn get_activity_logs(limit: usize, state: State<'_, AppState>) -> Result<Vec<ActivityLog>, String> {
    let db_guard = state.db.lock().map_err(|e| e.to_string())?;
    if let Some(ref db) = *db_guard {
        db.get_recent_logs(limit).map_err(|e| e.to_string())
    } else {
        Ok(vec![])
    }
}

#[tauri::command]
fn clear_activity_logs(state: State<'_, AppState>) -> Result<bool, String> {
    let db_guard = state.db.lock().map_err(|e| e.to_string())?;
    if let Some(ref db) = *db_guard {
        db.clear_logs().map_err(|e| e.to_string())?;
    }
    Ok(true)
}

pub fn run() {
    let db_instance = Database::init().ok();

    tauri::Builder::default()
        .manage(AppState {
            db: Mutex::new(db_instance),
            security: Mutex::new(SecurityManager::new()),
        })
        .invoke_handler(tauri::generate_handler![
            lock_system,
            sleep_system,
            restart_system,
            shutdown_system,
            open_app,
            get_system_status,
            log_activity,
            get_activity_logs,
            clear_activity_logs
        ])
        .run(tauri::generate_context!())
        .expect("error while running SecureMate AI application");
}
