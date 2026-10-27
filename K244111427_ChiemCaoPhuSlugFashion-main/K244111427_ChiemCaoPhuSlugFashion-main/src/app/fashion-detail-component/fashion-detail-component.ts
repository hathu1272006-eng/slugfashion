import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Fashion } from '../classes/Fashion';
import { FashionAPIService } from '../services/fashion-apiservice';

@Component({
  selector: 'app-fashion-detail-component',
  standalone: false,
  templateUrl: './fashion-detail-component.html',
  styleUrl: './fashion-detail-component.css',
})
export class FashionDetailComponent implements OnInit {
  fashion = signal<Fashion | null>(null);
  errMessage = signal('');
  isLoading = signal(false);
  slug = '';

  constructor(
    private _service: FashionAPIService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.slug = slug;
        this.loadFashion(slug);
      }
    });
  }

  searchFashion(slug: string): void {
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) {
      this.fashion.set(null);
      this.errMessage.set('Vui lòng nhập slug của Fashion.');
      return;
    }
    this.slug = normalizedSlug;
    this.loadFashion(normalizedSlug);
  }

  private loadFashion(slug: string): void {
    this.fashion.set(null);
    this.errMessage.set('');
    this.isLoading.set(true);
    this._service.getFashionBySlug(slug).subscribe({
      next: (data) => {
        this.fashion.set(Object.assign(new Fashion(), data));
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.errMessage.set(err instanceof Error ? err.message : String(err));
        this.isLoading.set(false);
      },
    });
  }
}
