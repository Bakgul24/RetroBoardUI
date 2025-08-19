import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/categoryService';
import { FeedbackComponent } from "../feedback/feedback";
import { FeedbackService } from "../../services/feedbackService"

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FeedbackComponent],
  templateUrl: './category.html',
  styleUrl: './category.css'
})
export class CategoryComponent {

  constructor(public _categoryService: CategoryService,
    public _feedbackService: FeedbackService
  ) { }


}
