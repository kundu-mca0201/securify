# SECUREMATE AI
> *"Your Voice. Your Laptop. Your Security."*

**SECUREMATE AI** is a production-quality, cross-platform AI voice-controlled desktop security assistant built for **macOS**, **Windows 10/11**, and **Linux** (Ubuntu and major distributions).

---

## 🚀 Key Highlights & Architecture

### 1. Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Framer Motion
- **Visuals & 3D Audio**: Canvas 2D/3D Shader Orb, Web Audio API Analyser & Oscillators, Lucide React
- **Desktop Framework**: Tauri 2 (with Rust core)
- **Backend & System Integration**: Rust (`src-tauri`) & local OS daemon (`server/daemon.cjs`)
- **Database**: SQLite (`rusqlite` / persistent Local Storage schema)
- **Voice Recognition**: Real-time Web Speech API + Multi-Lingual Intent Parsing Engine + Vosk/Whisper compatibility

---

## 🛡️ Modular System Architecture

The application is structured into 10 decoupled, high-performance modules:

1. **`VoiceEngine`** (`src/modules/VoiceEngine.ts`):
   Coordinates speech recognition, multi-lingual intent parsing, validation, synthesized speech feedback, and acoustic cues.
2. **`SpeechRecognition`** (`src/modules/SpeechRecognition.ts`):
   Captures live microphone stream with Web Audio API `AnalyserNode`, tracks interim and final transcripts, and provides real-time audio volume levels.
3. **`IntentProcessor`** (`src/modules/IntentProcessor.ts` & `src-tauri/src/intent_processor.rs`):
   Multi-lingual natural language intent classifier supporting **English**, **Hindi** (Devanagari), and **Hinglish** transliteration.
4. **`CommandValidator`** (`src/modules/CommandValidator.ts`):
   Enforces a strict allowlist of permissible system commands and applications. Prevents arbitrary terminal execution and rejects low-confidence predictions (<65%).
5. **`OSController`** (`src/modules/OSController.ts` & `src-tauri/src/os_controller.rs`):
   Native bindings for:
   - **macOS**: `pmset displaysleepnow` & `CGSession -suspend`
   - **Windows**: `rundll32.exe user32.dll,LockWorkStation`
   - **Linux**: `loginctl lock-session` & `xdg-screensaver lock`
   - Safe low-power sleep, reboot, and power-off mechanisms.
6. **`SecurityManager`** (`src/modules/SecurityManager.ts` & `src-tauri/src/security_manager.rs`):
   Assesses real-time security posture, enforces privacy mode, and executes emergency panic stop.
7. **`AuthenticationManager`** (`src/modules/AuthenticationManager.ts`):
   Provides secure handoff to platform authenticators (Apple Touch ID, Windows Hello, Linux PAM). **Voice alone is strictly never treated as sufficient authentication to unlock a machine.**
8. **`NotificationManager`** (`src/modules/NotificationManager.ts`):
   Pub-sub notification dispatcher rendering cybernetic futuristic alerts.
9. **`ActivityLogger`** (`src/modules/ActivityLogger.ts` & `src-tauri/src/database.rs`):
   Persistent SQLite-backed audit trail of all recognized commands, execution latencies, status outcomes, and security tags with JSON export capability.
10. **`SettingsManager`** (`src/modules/SettingsManager.ts`):
    Persistent preference manager for startup preferences, microphone devices, wake word customization, sensitivity sliders, and privacy profiles.

---

## 🎙️ Supported Voice Commands

| Action | English | Hinglish | Hindi |
| :--- | :--- | :--- | :--- |
| **Lock Workstation** | *"Hey SecureMate, lock my laptop"* | *"Computer lock karo"* | *"कंप्यूटर लॉक करो"* |
| **Low-Power Sleep** | *"Put my laptop to sleep"* | *"Laptop ko sleep mode me dalo"* | *"सिस्टम को स्लीप करो"* |
| **Restart (Guarded)** | *"Restart my computer"* | *"Computer restart karo"* | *"दोबारा चालू करो"* |
| **Shutdown (Guarded)** | *"Shutdown my laptop"* | *"Laptop band karo"* | *"कंप्यूटर बंद करो"* |
| **Open Browser** | *"Open Chrome"* / *"Open browser"* | *"Chrome kholo"* | *"ब्राउज़र खोलो"* |
| **Open App (Allowlisted)** | *"Open VS Code"* / *"Open terminal"* | *"Terminal open karo"* | *"कोड खोलो"* |
| **Mute / Stop Listening** | *"Stop listening"* / *"Quiet"* | *"Chup ho jao"* / *"Sunna band karo"* | *"सुनना बंद करो"* |
| **Security Audit** | *"Run security check"* | *"Security scan karo"* | *"सुरक्षा जांच करो"* |

---

## 🔐 Operating System Lock & Unlock Guarantees

1. **Native OS Lock Integrity**:
   - **macOS**: Triggers native `pmset displaysleepnow` or calls `CGSession -suspend`.
   - **Windows**: Calls `LockWorkStation` directly in `user32.dll`.
   - **Linux**: Interacts with systemd logind (`loginctl lock-session`) or `xdg-screensaver`.
2. **Strict Unlock Safeguards**:
   - **No Password Storage**: SecureMate AI **never** asks for, stores, or simulates OS passwords or PINs.
   - **No Authentication Simulation**: We do not simulate keystrokes to bypass OS locks.
   - **Biometric Enclave Handoff**: Hands off verification to **Apple Touch ID** / **Windows Hello** platform authenticators.
   - **Native Login Restoration**: Voice-based unlock is intentionally unsupported; the system directs the user to native OS authentication.

---

## 💻 Running & Building

### Development Mode (Browser & Local OS Companion)
```bash
# 1. Install dependencies
npm install

# 2. Start frontend dev server
npm run dev

# 3. (Optional) Run the local OS daemon companion
npm run daemon
```

### Tauri 2 Production Desktop Build
When Rust and the Tauri CLI are installed on your machine (`cargo install tauri-cli`):
```bash
# Build desktop release binaries
npm run build
cargo tauri build
```
This produces native installable packages:
- **macOS**: `.dmg` / `.app`
- **Windows**: `.msi` / `.exe`
- **Linux**: `.deb` / `.AppImage`
