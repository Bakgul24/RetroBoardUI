import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../services/teamService';
import { TeamResponseModel } from '../../models/teamResponseModel';
import { Team } from '../../models/team';
import { RetroService } from '../../services/retroService';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team.html',
  styleUrls: ['./team.css']
})
export class TeamComponent implements OnInit {

  @ViewChild('deleteTeamCloseBtn') deleteTeamCloseBtn!: ElementRef<HTMLButtonElement>;

  currentTeam: Team | null = null;
  newTeamName = '';
  teams = signal<Team[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  @ViewChild('newTeamModal') newTeamModal!: ElementRef;
  teamIdToDelete: string | null = null;
  teamNameToDelete: string | null = null;
  showModal: any;
  errorMessage = '';
  @ViewChild('addTeamCloseBtn') addTeamCloseBtn!: ElementRef<HTMLButtonElement>;


  constructor(
    private _teamService: TeamService,
    private _retroService: RetroService,
    private toast: ToastrService
  ) { }

  resetAddTeamModal() {
    this.errorMessage = '';
    this.newTeamName = '';
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this._teamService.getAll().subscribe({
      next: (res: TeamResponseModel) => {
        this.teams.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Veri alınamadı');
        this.loading.set(false);
      }
    });
  }

  showSucces(message: string) {
    this.toast.success(message, "Başarılı!")
  }

  showDanger(message: string) {
    this.toast.warning(message, "Başarısız!")
  }

  selectTeam(team: Team): void {
    this.currentTeam = team;
    this._teamService.setCurrentTeam(team);
    this._retroService.getRetrosByTeamId(team.id);
  }

  setTeamToDelete(team: Team, event: MouseEvent) {
    event.stopPropagation();
    this.teamIdToDelete = team.id;
    this.teamNameToDelete = (team as any).name ?? null;
  }

  confirmToDeleteTeam(): void {
    if (this.teamIdToDelete == null) return;

    this.loading.set(true);
    this._teamService.deleteTeam(this.teamIdToDelete).pipe(
      catchError((err) => {
        this.error.set(err?.message ?? 'Takım silinirken hata oluştu');
        this.showDanger("Takım Silinemedi.");
        this.loading.set(false);
        return of(null);
      })
    ).subscribe((res) => {
      if (res !== null) {
        if (this.currentTeam && this.currentTeam.id === this.teamIdToDelete) {
          this.currentTeam = null;
          this._teamService.setCurrentTeam(null as any);
        }
        this.showSucces("Takım Silindi.")
      }
      this.load();
      this.deleteTeamCloseBtn?.nativeElement.click();
      this.teamIdToDelete = null;
      this.teamNameToDelete = null;
    });
  }

  addNewTeam(): void {
    if (this.newTeamName.trim() == '') {
      this.errorMessage = 'Takım ismi girmek zorundasınız!'
      return;
    }
    if (!this.newTeamName.trim()) return;

    this._teamService.addTeam(this.newTeamName).pipe(
      catchError((err) => {
        this.error.set(err?.message ?? 'Takım eklenirken hata oluştu');
        this.showDanger("Takım Eklenemedi.")
        this.loading.set(false);
        return of(null);
      })
    ).subscribe((response) => {
      if (response) {
        this.showSucces("Takım Eklendi.")
        this.load();
        this.resetAddTeamModal();
        this.newTeamName = '';
        this.addTeamCloseBtn?.nativeElement.click();
      }
    });
  }
}
