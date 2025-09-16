import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-overlay" *ngIf="isLoading">
      <img src="/loader.png" alt="Loading..." class="loader-image">
      <p *ngIf="message" class="loader-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    .loader-image {
      width: 80px;
      height: 80px;
      animation: spin 1.5s linear infinite;
    }

    @keyframes spin {
      100% {
        transform: rotate(360deg);
      }
    }

    .loader-message {
      margin-top: 1rem;
      color: var(--text);
      font-size: 1rem;
      font-weight: 500;
    }
  `]
})
export class LoaderComponent implements OnInit, OnDestroy {
  isLoading = false;
  message = '';
  private subscriptions = new Subscription();

  constructor(private loaderService: LoaderService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.loaderService.isLoading$.subscribe(loading => {
        this.isLoading = loading;
      })
    );
    
    this.subscriptions.add(
      this.loaderService.message$.subscribe(msg => {
        this.message = msg;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}