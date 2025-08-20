import { Component, Input } from '@angular/core';
import { FeedbackService } from '../../services/feedbackService';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Feedback } from '../../models/feedback';
import { Comment } from '../../models/comment';
import { FormsModule } from '@angular/forms';
import { RetroService } from '../../services/retroService';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-feedback',
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.html',
  styleUrls: ['./feedback.css']
})
export class FeedbackComponent {
  @Input() categoryId: string | null = null;
  feedbackIdForComment = '';
  newFeedbackContent = '';
  newMessageContent = '';
  feedbackContent = '';
  currentCategoryId: string | null = null;

  errorMessage = '';

  constructor(public _feedbackService: FeedbackService,
    private _retroService: RetroService,
    private toast: ToastrService
  ) { }

  showSucces(message: string) {
    this.toast.success(message, "Başarılı")
  }

  showDanger(message: string) {
    this.toast.warning(message, "Başarısız")
  }

  openModal(categoryId: string | null) {
    if (!categoryId) return;
    const modal = document.getElementById(`addFeedbackModal-${categoryId}`);
    if (modal) modal.style.display = 'block';
    this.currentCategoryId = categoryId;
  }

  closeModal() {
    if (!this.currentCategoryId) return;
    const modal = document.getElementById(`addFeedbackModal-${this.currentCategoryId}`);
    if (modal) modal.style.display = 'none';
    this.errorMessage = '';
  }

  openCommentModal(feedback: Feedback) {
    const modal = document.getElementById(`commentModal-${this.categoryId}`);
    if (modal) modal.style.display = 'block';
    this.feedbackIdForComment = feedback.id!;
    this.feedbackContent = feedback.content;
    this._feedbackService.getCommentByFeedbackId(feedback.id!);
  }

  closeCommentModal() {
    const modal = document.getElementById(`commentModal-${this.categoryId}`);
    if (modal) modal.style.display = 'none';
    this.feedbackIdForComment = '';
    this.feedbackContent = '';
    this.errorMessage = '';
  }

  addFeedback(): void {
    if (this.newFeedbackContent == '') {
      this.errorMessage = "Boş görüş ekleyemezsiniz!"
      return;
    }
    if (this.newFeedbackContent.trim() && this.currentCategoryId) {
      const addFeedback: Feedback = {
        retroId: this._retroService.currentRetro()?.id,
        categoryId: this.currentCategoryId,
        content: this.newFeedbackContent,
        isDeleted: false,
        score: '0'
      };
      this._feedbackService.addFeedback(addFeedback).subscribe(() => {
        this.showSucces("Feedback eklendi.");
        this.newFeedbackContent = '';
        this.closeModal();
        this._feedbackService.getFeedbacksByRetroId(this._retroService.currentRetro()!.id!);
      });
    }
  }

  addComment(): void {
    if (this.newMessageContent == '') {
      this.errorMessage = 'Boş Yorum Ekleyemezsiniz!'
      return;
    }
    const comment: Comment = {
      content: this.newMessageContent,
      feedbackId: this.feedbackIdForComment
    };
    this._feedbackService.addComment(comment).subscribe(() => {
      this.showSucces("Yorumunuz Eklendi.");
      this._feedbackService.getCommentByFeedbackId(this.feedbackIdForComment);
      this.newMessageContent = '';
    });
  }

  voteFeedback(feedback: Feedback): void {
    this._feedbackService.voteFeedback(feedback).subscribe(() => {
      this.showSucces("Oy Verildi.")
      this._feedbackService.getFeedbacksByRetroId(this._retroService.currentRetro()?.id!);
    })
  }

  deleteFeedback(feedbackId: string): void {
    this._feedbackService.deleteFeedback(feedbackId).subscribe(() => {
      this.showSucces("Feedback Silindi.")
      this.closeCommentModal();
      this._feedbackService.getFeedbacksByRetroId(this._retroService.currentRetro()?.id!);
    });
  }
}