import { Component, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RetroService } from '../../services/retroService';
import { CategoryService } from '../../services/categoryService';
import { FeedbackService } from '../../services/feedbackService';
import { TeamService } from '../../services/teamService';
import { FormsModule } from '@angular/forms';
import { RetroWithSettingDto } from '../../models/retroWithSettingDto';
import { Team } from '../../models/team';
import { Retro } from '../../models/retro';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-retro',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './retro.html',
    styleUrls: ['./retro.css']
})
export class RetroComponent implements AfterViewInit {
    constructor(
        public _retroService: RetroService,
        public _categoryService: CategoryService,
        public _feedbackService: FeedbackService,
        public _teamService: TeamService,
        private toast: ToastrService
    ) { }

    currentTeam: Team | null = null;
    retroIdToDelete: string | null = null;
    retroNameToDelete: string | null = null;

    newCategory: string = '';
    newCategories: string[] = [];
    errorMessage: string = '';

    newRetroName = '';
    maxVoteCount = '';
    maxCommentCount = '';

    showSucces(message: string) {
        this.toast.success(message, "Başarılı")
    }

    showDanger() {
        this.toast.warning("Takım Seçilmedi", "Başarısız")
    }

    ngAfterViewInit() {
        const retroModal = document.getElementById('retroModal');
        if (retroModal) {
            retroModal.addEventListener('show.bs.modal', () => {
                this.resetModalData();
            });
        }
    }

    resetModalData() {
        this.newRetroName = '';
        this.maxVoteCount = '';
        this.maxCommentCount = '';
        this.newCategory = '';
        this.newCategories = [];
        this.errorMessage = '';
    }

    closeModal() {
        const modal = document.getElementById('retroModal');
        if (modal) {
            modal.style.display = 'none';  // Hide the modal manually
        }
        this.resetModalData();
    }

    addCategory() {
        if (this.newCategories.length >= 3) {
            this.errorMessage = 'En fazla 3 kategori ekleyebilirsiniz!';
            return;
        }

        if (this.newCategory.trim()) {
            if (this.newCategories.includes(this.newCategory.trim())) {
                this.errorMessage = 'Bu kategori zaten mevcut!';
            } else {
                this.newCategories.push(this.newCategory.trim());
                this.newCategory = '';
                this.errorMessage = '';
            }
        }
    }


    removeCategory(index: number) {
        this.newCategories.splice(index, 1);
        this.errorMessage = '';
    }

    get isDisabled(): boolean {
        return !this._teamService.currentTeam() || this._retroService.loading();
    }

    setRetroToDelete(retro: Retro, event: MouseEvent) {
        event.stopPropagation();
        this.retroIdToDelete = retro.id!;
        this.retroNameToDelete = retro.name ?? null;
    }

    selectRetro(retro: Retro): void {
        if (this.isDisabled) return;
        this._retroService.setCurrentRetro(retro);
        this._categoryService.getCategoriesByRetroId(retro.id!);
        this._feedbackService.getFeedbacksByRetroId(retro.id!);
    }

    confirmToDeleteRetro(): void {
        if (!this.retroIdToDelete) return;

        this._retroService.deleteRetroById(this.retroIdToDelete).subscribe({
            next: () => {
                this._retroService.retros.update(retros =>
                    retros.filter(r => r.id !== this.retroIdToDelete)
                );

                const closeButton = document.querySelector<HTMLButtonElement>(
                    '#deleteRetroModal [data-bs-dismiss="modal"]'
                );
                closeButton?.click();

                this.retroIdToDelete = null;
                this.retroNameToDelete = null;
                this.showSucces("Retro Silindi");
                this._retroService.setCurrentRetro(null);
            },
            error: (err) => {
                console.error('Retro silinirken hata oluştu:', err);
            }
        });
    }

    addRetro(): void {
        const selectedTeam = this._teamService.currentTeam();
        if (!selectedTeam) {
            this.showDanger();
            return;
        }
        const teamId = selectedTeam.id;

        const retroWithSetting: RetroWithSettingDto = {
            name: this.newRetroName,
            teamId: teamId,
            settings: [
                {
                    key: "CommentCount",
                    value: this.maxCommentCount,
                    description: ""
                },
                {
                    key: "VoteCount",
                    value: this.maxVoteCount,
                    description: ""
                },
            ],
            categories: this.newCategories,
        };

        this._retroService.addNewRetro(retroWithSetting).subscribe({
            next: () => {
                this.showSucces("Retro Eklendi.");
                this._retroService.getRetrosByTeamId(teamId);

                const closeButton = document.querySelector<HTMLButtonElement>(
                    '#retroModal [data-bs-dismiss="modal"]'
                );
                if (closeButton) {
                    closeButton.click();
                }
            },
            error: (err) => {
                console.error('Retro eklenirken hata oluştu:', err);
            }
        });
    }
}
