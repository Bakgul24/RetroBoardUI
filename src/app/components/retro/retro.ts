// retro.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RetroService } from '../../services/retroService';
import { Retro } from '../../models/retro';
import { RetroWithSettingDto } from '../../models/retroWithSettingDto';
import { CategoryService } from '../../services/categoryService';
import { FeedbackService } from '../../services/feedbackService';
import { TeamService } from '../../services/teamService';
import { FormsModule } from '@angular/forms';
import { RetroSettingDto } from '../../models/retroSettingDto';
import { Team } from '../../models/team';

@Component({
    selector: 'app-retro',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './retro.html',
    styleUrl: './retro.css'
})
export class RetroComponent {
    constructor(
        public _retroService: RetroService,
        public _categoryService: CategoryService,
        public _feedbackService: FeedbackService,
        public _teamService: TeamService
    ) { }
    currentTeam: Team | null = null;
    retroIdToDelete: string | null = null;
    retroNameToDelete: string | null = null;

    newRetroName = '';
    maxVoteCount = '';
    maxCommentCount = '';


    get isDisabled(): boolean {
        return !this._teamService.currentTeam() || this._retroService.loading();
    }

    setRetroToDelete(retro: Retro, event: MouseEvent) {
        event.stopPropagation();
        this.retroIdToDelete = retro.id!;
        this.retroNameToDelete = (retro as any).name ?? null;
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
                alert('Retro silindi.');
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
            alert('Bir takım seçilmedi!');
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
                }
            ]
        };

        this._retroService.addNewRetro(retroWithSetting).subscribe({
            next: () => {
                alert('Retro başarıyla eklendi!');
                this._retroService.getRetrosByTeamId(teamId);
            },
            error: (err) => {
                console.error('Retro eklenirken hata oluştu:', err);
            }
        });
    }

}
