// categoryService.ts
import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CategoryResponseModel } from '../models/categoryResponseModel';
import { Category } from '../models/category';
import { RetroService } from './retroService';

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private http = inject(HttpClient);
    private retroSvc = inject(RetroService);

    public categories = signal<Category[]>([]);
    public loading = signal(true);
    public error = signal<string | null>(null);

    constructor() {
        effect(() => {
            const current = this.retroSvc.currentRetro();
            if (!current) {
                this.clearCategories();
            }
        });
    }

    clearCategories() {
        this.categories.set([]);
        this.error.set(null);
        this.loading.set(false);
    }

    getCategoriesByRetroId(retroId: string): void {
        this.loading.set(true);
        this.error.set(null);
        const url = `https://localhost:7221/api/RetroCategories/retro/${retroId}/categories`;
        this.http.get<CategoryResponseModel>(url).subscribe({
            next: (res) => {
                this.categories.set(res.data ?? []);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.message ?? 'Category verileri alınamadı');
                this.loading.set(false);
            }
        });
    }
}
