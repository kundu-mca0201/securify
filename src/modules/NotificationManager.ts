export interface CyberToast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  timestamp: string;
}

type ToastListener = (toasts: CyberToast[]) => void;

export class NotificationManager {
  private static toasts: CyberToast[] = [];
  private static listeners: Set<ToastListener> = new Set();

  public static subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => this.listeners.delete(listener);
  }

  private static notify() {
    this.listeners.forEach((l) => l([...this.toasts]));
  }

  public static show(title: string, message: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info') {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    const toast: CyberToast = {
      id,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.toasts.unshift(toast);
    if (this.toasts.length > 5) this.toasts.pop();
    this.notify();

    // Auto-dismiss after 4.5 seconds
    setTimeout(() => {
      this.dismiss(id);
    }, 4500);
  }

  public static dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}
