use regex::Regex;

pub struct IntentProcessor;

impl IntentProcessor {
    pub fn parse_intent(input: &str) -> (String, f64, String) {
        let text = input.trim().to_lowercase();

        // 1. Lock command
        if text.contains("lock") || text.contains("computer lock karo") || text.contains("screen lock") {
            return ("LOCK_SYSTEM".into(), 0.96, "en".into());
        }

        // 2. Sleep command
        if text.contains("sleep") || text.contains("sula do") || text.contains("standby") {
            return ("SLEEP_SYSTEM".into(), 0.94, "en".into());
        }

        // 3. Restart command
        if text.contains("restart") || text.contains("reboot") || text.contains("dobara chalu") {
            return ("RESTART_SYSTEM".into(), 0.95, "en".into());
        }

        // 4. Shutdown command
        if text.contains("shutdown") || text.contains("shut down") || text.contains("power off") || text.contains("band karo") {
            return ("SHUTDOWN_SYSTEM".into(), 0.95, "en".into());
        }

        // 5. Open app
        let re = Regex::new(r"(?:open|launch|kholo)\s+([a-zA-Z0-9\s]+)").unwrap();
        if let Some(caps) = re.captures(&text) {
            if let Some(target) = caps.get(1) {
                let app = target.as_str().trim();
                if app == "browser" || app == "chrome" {
                    return ("OPEN_BROWSER".into(), 0.92, "en".into());
                }
                return (format!("OPEN_APP:{}", app), 0.90, "en".into());
            }
        }

        // 6. Stop listening
        if text.contains("stop listening") || text.contains("chup ho jao") || text.contains("mute") {
            return ("STOP_LISTENING".into(), 0.98, "en".into());
        }

        ("UNKNOWN".into(), 0.3, "en".into())
    }
}

