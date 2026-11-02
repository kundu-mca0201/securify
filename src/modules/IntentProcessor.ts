import { ActionIntent, ParsedCommand } from './models';

export class IntentProcessor {
  // Confidence threshold below which commands will not be executed directly
  private static CONFIDENCE_THRESHOLD = 0.65;

  public static parse(input: string): ParsedCommand {
    const raw = input.trim();
    // Normalize text: clean punctuation marks commonly appended by speech-to-text engines
    const cleanRaw = raw.replace(/[.,!?:;]+/g, ' ').replace(/\s+/g, ' ').trim();
    const text = cleanRaw.toLowerCase();

    // Check for Wake words
    const wakeWordPattern = /(hey|ok|hello|namaste|sun|suno)?\s*(secure\s*mate|securemate|mate)/i;
    const cleanedText = text.replace(wakeWordPattern, '').trim();
    const query = cleanedText.length > 0 ? cleanedText : text;

    // Detect language
    const isHindiScript = /[\u0900-\u097F]/.test(raw);
    let lang: 'en' | 'hi' | 'hinglish' = 'en';

    if (isHindiScript) {
      lang = 'hi';
    } else if (
      /\b(karo|kijiye|hatao|chup|khol|kholo|band|rakho|soja|sula|jao)\b/i.test(text)
    ) {
      lang = 'hinglish';
    }

    // 1. LOCK SYSTEM
    // English: "lock my laptop", "lock computer", "lock screen", "secure my pc"
    // Hindi / Hinglish: "computer lock karo", "laptop lock kijiye", "screen lock karo", "कंप्यूटर लॉक करो"
    if (
      /\b(lock|bandh|band\s*kar|सुरक्षित|लॉक)\b/i.test(query) &&
      /\b(laptop|pc|computer|system|screen|device|lap top|कम्प्यूटर|लैपटॉप)\b/i.test(query) ||
      /^lock(\s*(it|laptop|computer|screen|now))?$/i.test(query) ||
      /\b(computer\s*lock\s*karo|laptop\s*lock\s*karo|screen\s*lock\s*karo|lock\s*kardo)\b/i.test(query) ||
      /लॉक\s*(करो|कीजिए)/i.test(query)
    ) {
      return {
        intent: 'LOCK_SYSTEM',
        confidence: 0.96,
        language: lang,
        isDestructive: false,
        explanation: lang === 'hi' ? 'कंप्यूटर को सुरक्षित लॉक किया जा रहा है' :
                     lang === 'hinglish' ? 'Computer lock kiya ja raha hai' :
                     'Locking workstation display and session',
      };
    }

    // 2. SLEEP SYSTEM
    // English: "put my laptop to sleep", "sleep computer", "go to sleep"
    // Hindi / Hinglish: "laptop ko sleep mode me dalo", "computer ko sula do", "sleep karo"
    if (
      /\b(sleep|suspend|standby|soja|sula\s*do|स्लीप)\b/i.test(query) ||
      /\b(put.*(laptop|computer|pc).*sleep)\b/i.test(query) ||
      /\b(sleep\s*karo|sleep\s*mode)\b/i.test(query)
    ) {
      return {
        intent: 'SLEEP_SYSTEM',
        confidence: 0.94,
        language: lang,
        isDestructive: false,
        explanation: lang === 'hi' ? 'कंप्यूटर को स्लीप मोड में डाला जा रहा है' :
                     lang === 'hinglish' ? 'System ko sleep mode me daala ja raha hai' :
                     'Putting workstation into low-power sleep mode',
      };
    }

    // 3. RESTART SYSTEM (Destructive - requires confirmation!)
    // English: "restart my computer", "reboot system", "restart laptop"
    // Hindi / Hinglish: "computer restart karo", "reboot kijiye", "दोबारा चालू करो"
    if (
      /\b(restart|reboot|dobara\s*chalu|फिर\s*से\s*चालू|रीस्टार्ट)\b/i.test(query)
    ) {
      return {
        intent: 'RESTART_SYSTEM',
        confidence: 0.95,
        language: lang,
        isDestructive: true,
        explanation: lang === 'hi' ? 'कंप्यूटर रीस्टार्ट करने के लिए पुष्टि की आवश्यकता है' :
                     lang === 'hinglish' ? 'Computer restart karne ke liye confirmation chahiye' :
                     'System restart requested — explicit confirmation required',
      };
    }

    // 4. SHUTDOWN SYSTEM (Destructive - requires confirmation!)
    // English: "shutdown my laptop", "turn off computer", "power off"
    // Hindi / Hinglish: "computer band karo", "laptop shutdown karo", "power off karo", "बंद करो"
    if (
      /\b(shutdown|shut\s*down|power\s*off|turn\s*off|system\s*band|computer\s*band\s*karo|बंद\s*करो|शटडाउन)\b/i.test(query)
    ) {
      return {
        intent: 'SHUTDOWN_SYSTEM',
        confidence: 0.95,
        language: lang,
        isDestructive: true,
        explanation: lang === 'hi' ? 'कंप्यूटर बंद करने के लिए पुष्टि की आवश्यकता है' :
                     lang === 'hinglish' ? 'System shutdown karne ke liye confirmation chahiye' :
                     'System shutdown requested — explicit confirmation required',
      };
    }

    // 5. STOP LISTENING / MUTE
    // English: "stop listening", "go to sleep", "mute microphone", "quiet"
    // Hindi / Hinglish: "sunna band karo", "chup ho jao", "mute karo", "आवाज़ बंद करो"
    if (
      /\b(stop\s*listening|stop|quiet|mute|chup\s*ho\s*jao|sunna\s*band\s*karo|mute\s*karo|म्यूट|सुनना\s*बंद)\b/i.test(query)
    ) {
      return {
        intent: 'STOP_LISTENING',
        confidence: 0.98,
        language: lang,
        isDestructive: false,
        explanation: lang === 'hi' ? 'माइक्रोफ़ोन को म्यूट किया गया' :
                     lang === 'hinglish' ? 'Voice listening band kar di gayi hai' :
                     'Voice assistant listening deactivated',
      };
    }

    // 6. OPEN BROWSER / APPS
    // English: "open chrome", "open crome", "open browser", "launch safari", "open code", "open terminal"
    // Hindi / Hinglish: "chrome kholo", "crome kholo", "browser kholiye", "terminal open karo", "ब्राउज़र खोलो"
    const openAppMatch = query.match(/(?:open|launch|start|kholo|kholiye|खोलो)\s+([a-zA-Z0-9\s._-]+)/i) ||
                         query.match(/([a-zA-Z0-9._-]+)\s+(?:kholo|kholiye|open\s*karo)/i);

    if (openAppMatch && openAppMatch[1]) {
      const rawTarget = openAppMatch[1].trim().toLowerCase().replace(/[.,!?:;]+/g, '');
      const target = rawTarget === 'crome' || rawTarget === 'chrom' ? 'chrome' : rawTarget;
      
      // Filter out non-app keywords
      if (['listening', 'computer', 'laptop', 'system', 'pc'].includes(target)) {
        // Not an app
      } else {
        const isBrowser = ['chrome', 'crome', 'chrom', 'google chrome', 'browser', 'firefox', 'safari', 'edge', 'microsoft edge', 'brave', 'internet', 'google'].includes(target);
        return {
          intent: isBrowser ? 'OPEN_BROWSER' : 'OPEN_APP',
          confidence: 0.94,
          language: lang,
          targetApp: isBrowser ? 'chrome' : target,
          isDestructive: false,
          explanation: lang === 'hi' ? `${target} एप्लिकेशन खोला जा रहा है` :
                       lang === 'hinglish' ? `${target} open kiya ja raha hai` :
                       `Launching application: ${target}`,
        };
      }
    }

    // 7. SYSTEM STATUS / SECURITY CHECK
    if (
      /\b(status|security\s*check|health|specs|details|battery|सुरक्षा|हालत)\b/i.test(query)
    ) {
      return {
        intent: 'SYSTEM_STATUS',
        confidence: 0.88,
        language: lang,
        isDestructive: false,
        explanation: lang === 'hi' ? 'सिस्टम सुरक्षा स्थिति की जांच की जा रही है' :
                     lang === 'hinglish' ? 'System security status scan ho raha hai' :
                     'Scanning and updating device security metrics',
      };
    }

    // UNKNOWN or Low confidence
    return {
      intent: 'UNKNOWN',
      confidence: 0.3,
      language: lang,
      isDestructive: false,
      explanation: lang === 'hi' ? 'आदेश समझ में नहीं आया। कृपया दोबारा बोलें।' :
                   lang === 'hinglish' ? 'Command samajh nahi aaya, kripya dobara bolein' :
                   `Unrecognized voice command: "${raw}". Check supported commands.`,
    };
  }

  public static isConfidenceAcceptable(confidence: number): boolean {
    return confidence >= this.CONFIDENCE_THRESHOLD;
  }
}

