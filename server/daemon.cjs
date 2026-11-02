/**
 * SecureMate AI - Desktop OS Native Daemon
 * Provides local bridge between UI and operating system kernel
 */

const http = require('http');
const { exec } = require('child_process');
const os = require('os');

const PORT = 1421;
const PLATFORM = os.platform(); // 'darwin' (macOS), 'win32' (Windows), 'linux'

// Strict Allowlist of permitted applications
const ALLOWED_APPS = {
  darwin: {
    chrome: 'Google Chrome',
    'google chrome': 'Google Chrome',
    safari: 'Safari',
    firefox: 'Firefox',
    code: 'Visual Studio Code',
    vscode: 'Visual Studio Code',
    terminal: 'Terminal',
    iterm: 'iTerm',
    calculator: 'Calculator',
    notes: 'Notes',
    spotify: 'Spotify',
  },
  win32: {
    chrome: 'chrome',
    safari: 'msedge',
    firefox: 'firefox',
    code: 'code',
    terminal: 'wt',
    calculator: 'calc',
    notes: 'notepad',
    spotify: 'spotify',
  },
  linux: {
    chrome: 'google-chrome',
    firefox: 'firefox',
    code: 'code',
    terminal: 'gnome-terminal',
    calculator: 'gnome-calculator',
    notes: 'gedit',
  },
};

function executeSystemCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command failed: ${command}`, error);
        return resolve({ success: false, error: error.message, stderr });
      }
      resolve({ success: true, stdout: stdout.trim() });
    });
  });
}

const server = http.createServer(async (req, res) => {
  // Set CORS headers for local Vite frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  let body = {};
  if (req.method === 'POST') {
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const raw = Buffer.concat(chunks).toString();
      if (raw) body = JSON.parse(raw);
    } catch {
      body = {};
    }
  }

  // API Endpoints
  if (pathname === '/api/os/status' && req.method === 'GET') {
    const cpus = os.cpus();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        os: PLATFORM === 'darwin' ? 'macOS' : PLATFORM === 'win32' ? 'Windows' : 'Linux',
        osVersion: `${os.type()} ${os.release()} (${os.arch()})`,
        computerModel: cpus.length > 0 ? cpus[0].model : 'Secure Workstation',
        hostname: os.hostname(),
        isLocked: false,
        uptimeSeconds: os.uptime(),
        freeMemory: os.freemem(),
        totalMemory: os.totalmem(),
      })
    );
    return;
  }

  if (pathname === '/api/os/lock' && req.method === 'POST') {
    let cmd = '';
    if (PLATFORM === 'darwin') {
      // macOS: put display to sleep or trigger loginwindow/CGSession
      cmd = 'pmset displaysleepnow || /System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend';
    } else if (PLATFORM === 'win32') {
      cmd = 'rundll32.exe user32.dll,LockWorkStation';
    } else {
      cmd = 'xdg-screensaver lock || loginctl lock-session';
    }

    const result = await executeSystemCommand(cmd);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: result.success,
        message: result.success
          ? `Workstation locked via native ${PLATFORM} system call`
          : `Lock operation notice: ${result.error}`,
      })
    );
    return;
  }

  if (pathname === '/api/os/sleep' && req.method === 'POST') {
    let cmd = '';
    if (PLATFORM === 'darwin') {
      cmd = 'pmset sleepnow';
    } else if (PLATFORM === 'win32') {
      cmd = 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0';
    } else {
      cmd = 'systemctl suspend';
    }

    const result = await executeSystemCommand(cmd);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: result.success,
        message: result.success ? 'Low-power sleep dispatched' : result.error,
      })
    );
    return;
  }

  if (pathname === '/api/os/restart' && req.method === 'POST') {
    // Requires explicit safety flag in body
    if (!body.confirmSafety) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Safety confirmation required' }));
      return;
    }

    let cmd = '';
    if (PLATFORM === 'darwin') {
      cmd = 'osascript -e \'tell app "System Events" to restart\'';
    } else if (PLATFORM === 'win32') {
      cmd = 'shutdown /r /t 2';
    } else {
      cmd = 'systemctl reboot';
    }

    const result = await executeSystemCommand(cmd);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: result.success, message: 'Restart sequence initiated' }));
    return;
  }

  if (pathname === '/api/os/shutdown' && req.method === 'POST') {
    if (!body.confirmSafety) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Safety confirmation required' }));
      return;
    }

    let cmd = '';
    if (PLATFORM === 'darwin') {
      cmd = 'osascript -e \'tell app "System Events" to shut down\'';
    } else if (PLATFORM === 'win32') {
      cmd = 'shutdown /s /t 2';
    } else {
      cmd = 'systemctl poweroff';
    }

    const result = await executeSystemCommand(cmd);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: result.success, message: 'Shutdown sequence initiated' }));
    return;
  }

  if (pathname === '/api/os/open_browser' && req.method === 'POST') {
    let cmd = '';
    if (PLATFORM === 'darwin') {
      cmd = 'open https://google.com';
    } else if (PLATFORM === 'win32') {
      cmd = 'start https://google.com';
    } else {
      cmd = 'xdg-open https://google.com';
    }

    const result = await executeSystemCommand(cmd);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: result.success, message: 'Browser session started' }));
    return;
  }

  if (pathname === '/api/os/open_app' && req.method === 'POST') {
    const rawTarget = (body.appName || '').toLowerCase().trim();
    const platMap = ALLOWED_APPS[PLATFORM] || ALLOWED_APPS.darwin;
    const resolvedName = platMap[rawTarget];

    if (!resolvedName) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: false,
          message: `Application "${rawTarget}" not permitted by system allowlist`,
        })
      );
      return;
    }

    let cmd = '';
    if (PLATFORM === 'darwin') {
      cmd = `open -a "${resolvedName}"`;
    } else if (PLATFORM === 'win32') {
      cmd = `start ${resolvedName}`;
    } else {
      cmd = `${resolvedName} &`;
    }

    const result = await executeSystemCommand(cmd);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: result.success,
        message: result.success ? `Spawned ${resolvedName}` : result.error,
      })
    );
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[SecureMate AI] OS Daemon listening on http://127.0.0.1:${PORT}`);
});
