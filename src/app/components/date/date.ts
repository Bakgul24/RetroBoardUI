import { Component, DestroyRef, LOCALE_ID, inject, signal } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

registerLocaleData(localeTr);

@Component({
  selector: 'app-date',
  standalone: true,
  imports: [DatePipe,],
  templateUrl: './date.html',
  styleUrls: ['./date.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'tr-TR' }]
})
export class DateComponent {
  now = signal(new Date());

  private destroyRef = inject(DestroyRef);

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.now.set(new Date()));
  }
}
