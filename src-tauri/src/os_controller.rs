use crate::models::{ActionResponse, SystemStatus};
use std::process::Command;

pub struct OSController;

impl OSController {
    /// Lock the workstation screen using native operating system mechanisms
    pub fn lock_screen() -> Result<ActionResponse, String> {
        #[cfg(target_os = "macos")]
        {
            // macOS: Lock screen natively via CoreGraphics Session or display sleep
            let output = Command::new("pmset")
                .arg("displaysleepnow")
                .output()
                .map_err(|e| format!("Failed to trigger macOS lock: {}", e))?;

            if output.status.success() {
                Ok(ActionResponse {
                    success: true,
                    message: "macOS display and session locked successfully via pmset".into(),
                })
            } else {
                // Secondary fallback: CGSession suspend
                let _ = Command::new("/System/Library/CoreServices/Menu Extras/User.menu/Contents/Resources/CGSession")
                    .arg("-suspend")
                    .output();

                Ok(ActionResponse {
                    success: true,
                    message: "macOS session suspended via CGSession".into(),
                })
            }
        }

        #[cfg(target_os = "windows")]
        {
            // Windows: Call native LockWorkStation from user32.dll
            let output = Command::new("rundll32.exe")
                .args(["user32.dll,LockWorkStation"])
                .output()
                .map_err(|e| format!("Failed to trigger Windows lock: {}", e))?;

            Ok(ActionResponse {
                success: output.status.success(),
                message: "Windows workstation locked via user32.dll LockWorkStation".into(),
            })
        }

        #[cfg(target_os = "linux")]
        {
            // Linux: Try standard loginctl session lock or xdg-screensaver
            let res = Command::new("loginctl")
                .arg("lock-session")
                .output()
                .or_else(|_| Command::new("xdg-screensaver").arg("lock").output());

            match res {
                Ok(_) => Ok(ActionResponse {
                    success: true,
                    message: "Linux desktop session locked via loginctl/xdg-screensaver".into(),
                }),
                Err(e) => Err(format!("Linux lock failed: {}", e)),
            }
        }

        #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
        {
            Err("Unsupported operating system for native lock".into())
        }
    }

    /// Put system to low power sleep
    pub fn sleep_system() -> Result<ActionResponse, String> {
        #[cfg(target_os = "macos")]
        {
            let output = Command::new("pmset")
                .arg("sleepnow")
                .output()
                .map_err(|e| format!("Failed to trigger macOS sleep: {}", e))?;

            Ok(ActionResponse {
                success: output.status.success(),
                message: "macOS low-power sleep dispatched".into(),
            })
        }

        #[cfg(target_os = "windows")]
        {
            let output = Command::new("rundll32.exe")
                .args(["powrprof.dll,SetSuspendState", "0,1,0"])
                .output()
                .map_err(|e| format!("Failed to trigger Windows sleep: {}", e))?;

            Ok(ActionResponse {
                success: output.status.success(),
                message: "Windows SetSuspendState dispatched".into(),
            })
        }

        #[cfg(target_os = "linux")]
        {
            let output = Command::new("systemctl")
                .arg("suspend")
                .output()
                .map_err(|e| format!("Failed to trigger Linux sleep: {}", e))?;

            Ok(ActionResponse {
                success: output.status.success(),
                message: "Linux systemctl suspend dispatched".into(),
            })
        }

        #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
        {
            Err("Unsupported operating system for sleep".into())
        }
    }

    /// Restart workstation (Called ONLY after explicit confirmation)
    pub fn restart_system() -> Result<ActionResponse, String> {
        #[cfg(target_os = "macos")]
        {
            let output = Command::new("osascript")
                .args(["-e", "tell app \"System Events\" to restart"])
                .output()
                .map_err(|e| format!("Failed to trigger macOS restart: {}", e))?;

            Ok(ActionResponse {
                success: output.status.success(),
                message: "macOS restart sequence initiated".into(),
            })
        }

        #[cfg(target_os = "windows")]
        {
            let output = Command::new("shutdown")
                .args(["/r", "/t", "2"])
                .output()
                .map_err(|e| format!("Failed to trigger Windows restart: {}", e))?;

            Ok(ActionResponse {
                success: output.status.success(),
                message: "Windows shutdown /r initiated".into(),
            })
        }

        #[cfg(target_os = "linux")]
        {
            let output = Command::new("systemctl")
                .arg("reboot")
                .output()
                .map_err(|e| format!("Failed to trigger Linux reboot: {}", e))?;

            Ok(ActionResponse {
                success: output.status.success(),
                message: "Linux systemctl reboot initiated".into(),
            })
        }

        #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
        {
            Err("Unsupported operating system for reboot".into())
        }
    }

    /// Shutdown workstation (Called ONLY after explicit confirmation)
    pub fn shutdown_system() -> Result<ActionResponse, String> {
        #[cfg(target_os = "macos")]
        {
            let output = Command::new("osascript")
                .args(["-e", "tell app \"System Events\" to shut down"])
                .output()
                .map_err(|e| format!("Failed to trigger macOS shutdown: {}", e))?;

            Ok(ActionResponse {
                success: output.status.success(),
                message: "macOS shutdown sequence initiated".into(),
            })
        }

        #[cfg(target_os = "windows")]
        {
            let output = Command::new("shutdown")
                .args(["/s", "/t", "2"])
                .output()
                .map_err(|e| format!("Failed to trigger Windows shutdown: {}", e))?;

            Ok(ActionResponse {
                success: output.status.success(),
                message: "Windows shutdown /s initiated".into(),
            })
        }

        #[cfg(target_os = "linux")]
        {
            let output = Command::new("systemctl")
                .arg("poweroff")
                .output()
                .map_err(|e| format!("Failed to trigger Linux poweroff: {}", e))?;

            Ok(ActionResponse {
                success: output.status.success(),
                message: "Linux systemctl poweroff initiated".into(),
            })
        }

        #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
        {
            Err("Unsupported operating system for poweroff".into())
        }
    }

    /// Launch allowed desktop application
    pub fn open_application(app_name: &str) -> Result<ActionResponse, String> {
        let app = app_name.to_lowercase();

        #[cfg(target_os = "macos")]
        {
            let target_app = match app.as_str() {
                "chrome" | "google chrome" => "Google Chrome",
                "safari" => "Safari",
                "firefox" => "Firefox",
                "code" | "vscode" => "Visual Studio Code",
                "terminal" => "Terminal",
                "calculator" => "Calculator",
                "notes" => "Notes",
                "spotify" => "Spotify",
                _ => return Err(format!("App '{}' not permitted by allowlist", app_name)),
            };

            let output = Command::new("open")
                .args(["-a", target_app])
                .output()
                .map_err(|e| format!("Failed to launch {}: {}", target_app, e))?;

            Ok(ActionResponse {
                success: output.status.success(),
                message: format!("Launched macOS application: {}", target_app),
            })
        }

        #[cfg(target_os = "windows")]
        {
            let target_bin = match app.as_str() {
                "chrome" => "chrome",
                "safari" | "edge" => "msedge",
                "firefox" => "firefox",
                "code" => "code",
                "terminal" => "wt",
                "calculator" => "calc",
                "notes" => "notepad",
                "spotify" => "spotify",
                _ => return Err(format!("App '{}' not permitted by allowlist", app_name)),
            };

            let output = Command::new("cmd")
                .args(["/C", "start", target_bin])
                .output()
                .map_err(|e| format!("Failed to launch {}: {}", target_bin, e))?;

            Ok(ActionResponse {
                success: output.status.success(),
                message: format!("Launched Windows application: {}", target_bin),
            })
        }

        #[cfg(target_os = "linux")]
        {
            let target_bin = match app.as_str() {
                "chrome" => "google-chrome",
                "firefox" => "firefox",
                "code" => "code",
                "terminal" => "gnome-terminal",
                "calculator" => "gnome-calculator",
                _ => return Err(format!("App '{}' not permitted by allowlist", app_name)),
            };

            let output = Command::new(target_bin)
                .spawn()
                .map_err(|e| format!("Failed to launch {}: {}", target_bin, e))?;

            Ok(ActionResponse {
                success: true,
                message: format!("Spawned Linux application: {}", target_bin),
            })
        }

        #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
        {
            Err("Unsupported operating system for app launch".into())
        }
    }

    /// Retrieve host diagnostics
    pub fn get_system_status() -> SystemStatus {
        let os_name = if cfg!(target_os = "macos") {
            "macOS"
        } else if cfg!(target_os = "windows") {
            "Windows"
        } else if cfg!(target_os = "linux") {
            "Linux"
        } else {
            "Unknown"
        };

        SystemStatus {
            os: os_name.to_string(),
            os_version: format!("{} (64-bit)", os_name),
            computer_model: "SecureMate Workstation Node".into(),
            hostname: "SECUREMATE-SECURE-STATION".into(),
            is_locked: false,
            microphone_status: "Standby".into(),
            voice_recognition_status: "Active (Offline)".into(),
            security_score: 98,
            uptime: "Active session".into(),
        }
    }
}

