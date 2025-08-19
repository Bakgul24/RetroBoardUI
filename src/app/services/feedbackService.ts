import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FeedbackResponseModel } from '../models/feedbackResponseModel';
import { Feedback } from '../models/feedback';
import { RetroService } from './retroService';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment';
import { UserCommentResponseModel } from '../models/userCommentResponseModel';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
    private http = inject(HttpClient);
    private retroSvc = inject(RetroService);

    public feedbacks = signal<Feedback[]>([]);
    public comments = signal<Comment[]>([]);
    public loading = signal(false);
    public error = signal<string | null>(null);

    constructor() {
        effect(() => {
            const current = this.retroSvc.currentRetro();
            if (!current) {
                this.clear();
            }
        });
    }

    clear() {
        this.feedbacks.set([]);
        this.error.set(null);
        this.loading.set(false);
    }

    getFeedbacksByRetroId(retroId: string): void {
        const url = `https://localhost:7221/api/Feedbacks/retro/${retroId}/feedbacks`;
        this.loading.set(true);
        this.error.set(null);

        this.http.get<FeedbackResponseModel>(url).subscribe({
            next: (res) => {
                this.feedbacks.set(res.data ?? []);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.message ?? 'Feedback verileri alınamadı');
                this.feedbacks.set([]);
                this.loading.set(false);
            }
        });
    }

    addFeedback(feedback: Feedback): Observable<any> {
        const url = `https://localhost:7221/api/Feedbacks/add`;
        return this.http.post<any>(url, feedback);
    }

    addComment(comment: Comment): Observable<any> {
        const url = `https://localhost:7221/api/Comments/add`;
        return this.http.post<any>(url, comment);
    }

    getCommentByFeedbackId(feedbackId: string): void {
        const url = `https://localhost:7221/api/Comments/feedback/${feedbackId}/comments`
        this.http.get<UserCommentResponseModel>(url).subscribe({
            next: (res) => {
                this.comments.set(res.data ?? []);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.message ?? 'Feedback verileri alınamadı');
                this.loading.set(false);
            }
        });
    }

    voteFeedback(feedback: Feedback): Observable<any> {
        const url = `https://localhost:7221/api/Feedbacks/vote`
        return this.http.patch<any>(url, feedback)
    }

    deleteFeedback(feedbackId: string): Observable<any> {
        const url = `https://localhost:7221/api/Feedbacks/delete/${feedbackId}`
        return this.http.delete<any>(url);
    }
}
