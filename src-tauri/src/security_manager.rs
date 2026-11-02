use std::collections::HashSet;

pub struct SecurityManager {
    allowed_apps: HashSet<&'static str>,
}

impl SecurityManager {
    pub fn new() -> Self {
        let mut apps = HashSet::new();
        apps.insert("chrome");
        apps.insert("google chrome");
        apps.insert("safari");
        apps.insert("firefox");
        apps.insert("edge");
        apps.insert("code");
        apps.insert("vscode");
        apps.insert("terminal");
        apps.insert("iterm");
        apps.insert("calculator");
        apps.insert("notes");
        apps.insert("spotify");
        Self { allowed_apps: apps }
    }

    pub fn is_app_allowed(&self, app_name: &str) -> bool {
        self.allowed_apps.contains(app_name.to_lowercase().trim())
    }

    pub fn validate_destructive_action(&self, intent: &str, confirmed: bool) -> Result<(), String> {
        if (intent == "RESTART_SYSTEM" || intent == "SHUTDOWN_SYSTEM") && !confirmed {
            return Err("Security Violation: Destructive action rejected without explicit user confirmation".into());
        }
        Ok(())
    }
}
