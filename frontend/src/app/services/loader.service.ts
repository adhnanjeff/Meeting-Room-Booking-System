import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private messageSubject = new BehaviorSubject<string>('');

  isLoading$ = this.isLoadingSubject.asObservable();
  message$ = this.messageSubject.asObservable();

  show(message: string = 'Loading...'): void {
    this.messageSubject.next(message);
    this.isLoadingSubject.next(true);
  }

  hide(): void {
    this.isLoadingSubject.next(false);
    this.messageSubject.next('');
  }
}