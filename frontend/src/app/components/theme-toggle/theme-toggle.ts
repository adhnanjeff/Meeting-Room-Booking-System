import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="theme-toggle"
      (click)="toggleTheme()"
      [title]="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    >
      <div class="toggle-container">
        <div class="toggle-track" [class.dark]="isDarkMode">
          <div class="toggle-thumb" [class.dark]="isDarkMode">
            <span class="toggle-icon">{{ isDarkMode ? '🌙' : '☀️' }}</span>
          </div>
        </div>
      </div>
      <span class="toggle-label">{{ isDarkMode ? 'Dark' : 'Light' }}</span>
    </button>
  `,
  styles: [`
    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s ease;
      color: var(--text-light);
    }

    .theme-toggle:hover {
      background: var(--background);
      color: var(--text);
    }

    .toggle-container {
      position: relative;
    }

    .toggle-track {
      width: 48px;
      height: 24px;
      background: #e2e8f0;
      border-radius: 12px;
      transition: all 0.3s ease;
      position: relative;
    }

    .toggle-track.dark {
      background: #3b82f6;
    }

    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .toggle-thumb.dark {
      transform: translateX(24px);
      background: #1e293b;
    }

    .toggle-icon {
      font-size: 0.75rem;
      transition: all 0.3s ease;
    }

    .toggle-label {
      font-size: 0.875rem;
      font-weight: 500;
      min-width: 40px;
      text-align: left;
    }

    @media (max-width: 768px) {
      .toggle-label {
        display: none;
      }
    }
  `]
})
export class ThemeToggle {
  isDarkMode = false;

  constructor(private themeService: ThemeService) {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}