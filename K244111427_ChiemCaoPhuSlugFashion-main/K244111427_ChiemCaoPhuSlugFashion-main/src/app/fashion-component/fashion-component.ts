import { Component, signal } from '@angular/core';
import { FashionAPIService } from '../services/fashion-apiservice';
import { Fashion } from '../classes/Fashion';

@Component({
  selector: 'app-fashion-component',
  standalone: false,
  templateUrl: './fashion-component.html',
  styleUrl: './fashion-component.css',
})
export class FashionComponent {
  fashions = signal<Fashion[]>([]);
  errMessage = signal('');
  isLoading = signal(true);

  constructor(public _service: FashionAPIService) {
    this._service.getFashions().subscribe({
      next: (data) => {
        this.fashions.set(data.map((fashion) => Object.assign(new Fashion(), fashion)));
        this.isLoading.set(false);
      },
      error: (err: unknown) =>
        {
          this.errMessage.set(err instanceof Error ? err.message : String(err));
          this.isLoading.set(false);
        },
    });
  }
}
