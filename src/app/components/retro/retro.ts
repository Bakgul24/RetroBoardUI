import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RetroService } from '../../services/retroService';
import { CategoryService } from '../../services/categoryService';
import { FeedbackService } from '../../services/feedbackService';
import { TeamService } from '../../services/teamService';
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
    newCategories: string[] = [
        "İyi Gidenler",
        "Geliştirmemiz Gerekenler",
        "Kötü Gidenler"
    ];
    errorMessage: string = '';
    errorRetroMessage: string = '';
    errorCategoryMessage: string = '';

    newRetroName = '';

    maxVoteCountStr = '';
    maxCommentCountStr = '';

    errors = { maxVote: false, maxComment: false };

    showSucces(message: string) {
        this.toast.success(message, 'Başarılı');
    }

    showDanger() {
        this.toast.warning('Takım Seçilmedi', 'Başarısız');
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
        this.maxVoteCountStr = '';
        this.maxCommentCountStr = '';
        this.newCategory = '';

        this.newCategories = [
            "İyi Gidenler",
            "Geliştirmemiz Gerekenler",
            "Kötü Gidenler"
        ];

        this.errorMessage = '';
        this.errorRetroMessage = '';
        this.errorCategoryMessage = '';
        this.errors = { maxVote: false, maxComment: false };
    }

    closeModal() {
        const modal = document.getElementById('retroModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.resetModalData();
    }

    addCategory() {
        // Maksimum 3
        if (this.newCategories.length >= 3) {
            this.errorMessage = 'En fazla 3 kategori ekleyebilirsiniz!';
            return;
        }

        const trimmed = this.newCategory.trim();
        if (!trimmed) return;

        const exists = this.newCategories.some(
            c => c.toLocaleLowerCase('tr-TR') === trimmed.toLocaleLowerCase('tr-TR')
        );
        if (exists) {
            this.errorMessage = 'Bu kategori zaten mevcut!';
            return;
        }

        this.newCategories.push(trimmed);
        this.newCategory = '';
        this.errorMessage = '';
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
                this._retroService.retros.update((retros) =>
                    retros.filter((r) => r.id !== this.retroIdToDelete)
                );

                const closeButton = document.querySelector<HTMLButtonElement>(
                    '#deleteRetroModal [data-bs-dismiss="modal"]'
                );
                closeButton?.click();

                this.retroIdToDelete = null;
                this.retroNameToDelete = null;
                this.showSucces('Retro Silindi');
                this._retroService.setCurrentRetro(null);
            },
            error: (err) => {
                console.error('Retro silinirken hata oluştu:', err);
            }
        });
    }

    private isIntString(v: string): boolean {
        return /^\d+$/.test(v);
    }

    onMaxVoteChange(v: string) {
        this.errors.maxVote = v !== '' && !this.isIntString(v);
    }

    onMaxCommentChange(v: string) {
        this.errors.maxComment = v !== '' && !this.isIntString(v);
    }

    addRetro(): void {
        if (!this.newCategories || this.newCategories.length === 0) {
            this.errorCategoryMessage = 'Kategori eklemek zorundasınız!';
            return;
        }

        if (this.newRetroName.trim().length === 0) {
            this.errorRetroMessage = 'Retro adı girmek zorundasınız!';
            return;
        }

        const selectedTeam = this._teamService.currentTeam();
        if (!selectedTeam) {
            this.showDanger();
            return;
        }
        const teamId = selectedTeam.id;

        const settings: { key: string; value: string; description: string }[] = [];

        const voteStr = this.maxVoteCountStr.trim();
        const commentStr = this.maxCommentCountStr.trim();

        if (voteStr !== '') {
            if (!this.isIntString(voteStr)) {
                this.errorRetroMessage = 'Lütfen sadece tam sayı girin.';
                return;
            }
            settings.push({ key: 'VoteCount', value: voteStr, description: '' });
        }

        if (commentStr !== '') {
            if (!this.isIntString(commentStr)) {
                this.errorRetroMessage = 'Lütfen sadece tam sayı girin.';
                return;
            }
            settings.push({ key: 'CommentCount', value: commentStr, description: '' });
        }

        const retroWithSetting: RetroWithSettingDto = {
            name: this.newRetroName,
            teamId: teamId,
            settings,
            categories: this.newCategories
        };

        this._retroService.addNewRetro(retroWithSetting).subscribe({
            next: () => {
                this.showSucces('Retro Eklendi.');
                this._retroService.getRetrosByTeamId(teamId);

                const closeButton = document.querySelector<HTMLButtonElement>(
                    '#retroModal [data-bs-dismiss="modal"]'
                );
                closeButton?.click();
            },
            error: (err) => {
                console.error('Retro eklenirken hata oluştu:', err);
            }
        });
    }

}
