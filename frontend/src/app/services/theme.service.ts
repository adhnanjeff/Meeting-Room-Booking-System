import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    this.loadThemeFromStorage();
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkModeSubject.value;
    this.isDarkModeSubject.next(newTheme);
    this.applyTheme(newTheme);
    localStorage.setItem('darkMode', newTheme.toString());
  }

  private loadThemeFromStorage(): void {
    const savedTheme = localStorage.getItem('darkMode');
    const isDark = savedTheme === 'true';
    this.isDarkModeSubject.next(isDark);
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    const root = document.documentElement;
    
    if (isDark) {
      // Dark theme variables
      root.style.setProperty('--primary', '#3b82f6');
      root.style.setProperty('--secondary', '#10b981');
      root.style.setProperty('--accent', '#f59e0b');
      root.style.setProperty('--background', '#0f172a');
      root.style.setProperty('--surface', '#1e293b');
      root.style.setProperty('--text', '#f1f5f9');
      root.style.setProperty('--text-light', '#94a3b8');
      root.style.setProperty('--success', '#22c55e');
      root.style.setProperty('--warning', '#f59e0b');
      root.style.setProperty('--error', '#ef4444');
      root.style.setProperty('--border', '#334155');
      root.style.setProperty('--shadow', '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)');
      root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)');
      // Status badge colors for dark theme
      root.style.setProperty('--success-bg', '#064e3b');
      root.style.setProperty('--success-text', '#6ee7b7');
      root.style.setProperty('--warning-bg', '#451a03');
      root.style.setProperty('--warning-text', '#fbbf24');
      root.style.setProperty('--error-bg', '#7f1d1d');
      root.style.setProperty('--error-text', '#fca5a5');
    } else {
      // Light theme variables
      root.style.setProperty('--primary', '#2563eb');
      root.style.setProperty('--secondary', '#10b981');
      root.style.setProperty('--accent', '#f59e0b');
      root.style.setProperty('--background', '#f8fafc');
      root.style.setProperty('--surface', '#ffffff');
      root.style.setProperty('--text', '#1e293b');
      root.style.setProperty('--text-light', '#64748b');
      root.style.setProperty('--success', '#22c55e');
      root.style.setProperty('--warning', '#f59e0b');
      root.style.setProperty('--error', '#ef4444');
      root.style.setProperty('--border', '#e2e8f0');
      root.style.setProperty('--shadow', '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)');
      root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)');
      // Status badge colors for light theme
      root.style.setProperty('--success-bg', '#dcfce7');
      root.style.setProperty('--success-text', '#166534');
      root.style.setProperty('--warning-bg', '#fef3c7');
      root.style.setProperty('--warning-text', '#92400e');
      root.style.setProperty('--error-bg', '#fee2e2');
      root.style.setProperty('--error-text', '#991b1b');
    }
  }

  getCurrentTheme(): boolean {
    return this.isDarkModeSubject.value;
  }
}