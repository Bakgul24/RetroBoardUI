import { Component, Input } from '@angular/core';
import { FeedbackService } from '../../services/feedbackService';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Feedback } from '../../models/feedback';
import { Comment } from '../../models/comment';
import { FormsModule } from '@angular/forms';
import { RetroService } from '../../services/retroService';


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

  constructor(public _feedbackService: FeedbackService,
    private _retroService: RetroService
  ) { }

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
  }

  addFeedback(): void {
    if (this.newFeedbackContent.trim() && this.currentCategoryId) {
      const addFeedback: Feedback = {
        retroId: this._retroService.currentRetro()?.id,
        categoryId: this.currentCategoryId,
        content: this.newFeedbackContent,
        isDeleted: false,
        score: '0'
      };
      this._feedbackService.addFeedback(addFeedback).subscribe(() => {
        this.newFeedbackContent = '';
        this.closeModal();
        this._feedbackService.getFeedbacksByRetroId(this._retroService.currentRetro()!.id!);
      });
    }
  }

  addComment(): void {
    const comment: Comment = {
      content: this.newMessageContent,
      feedbackId: this.feedbackIdForComment
    };
    this._feedbackService.addComment(comment).subscribe(() => {
      alert("Yorumunuz eklendi.")
      this._feedbackService.getCommentByFeedbackId(this.feedbackIdForComment);
      this.newMessageContent = '';
    });
  }

  voteFeedback(feedback: Feedback): void {
    console.log("girdi")
    this._feedbackService.voteFeedback(feedback).subscribe(() => {
      alert("Oy verildi.")
      this._feedbackService.getFeedbacksByRetroId(this._retroService.currentRetro()?.id!);
    })
  }

  deleteFeedback(feedbackId: string): void {
    this._feedbackService.deleteFeedback(feedbackId).subscribe(() => {
      alert("feedback silindi");
      this.closeCommentModal();
      this._feedbackService.getFeedbacksByRetroId(this._retroService.currentRetro()?.id!);
    });
  }
}