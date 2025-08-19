// retroService.ts
import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RetroResponseModel } from '../models/retroResponseModel';
import { Retro } from '../models/retro';
import { TeamService } from './teamService';
import { FeedbackService } from './feedbackService';
import { Observable } from 'rxjs';
import { RetroWithSettingDto } from '../models/retroWithSettingDto';

@Injectable({ providedIn: 'root' })
export class RetroService {
    private http = inject(HttpClient);
    private _teamService = inject(TeamService);
    private apiUrl = 'https://retroapi20250819154156-dsfbade7bxh7fca7.uaenorth-01.azurewebsites.net/api/';

    retros = signal<Retro[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);

    private _currentRetro = signal<Retro | null>(null);
    currentRetro = this._currentRetro;
    setCurrentRetro(retro: Retro | null) {
        this._currentRetro.set(retro);
    }

    constructor() {

        effect(() => {
            const team = this._teamService.currentTeam();

            this.clearRetros();
            if (team) {

                this.loading.set(true);
            }
        });
    }

    clearRetros() {
        this.retros.set([]);
        this.setCurrentRetro(null);
        this.error.set(null);
        this.loading.set(false);
    }

    getRetrosByTeamId(teamId: number | string): void {
        this.loading.set(true);
        this.error.set(null);
        const url = `${this.apiUrl}Retros/team/${teamId}/retros`;
        this.http.get<RetroResponseModel>(url).subscribe({
            next: (res) => {
                this.retros.set(res.data ?? []);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.message ?? 'Retro verileri alınamadı');
                this.loading.set(false);
            }
        });
    }

    deleteRetroById(retroId: string): Observable<any> {
        const url = `${this.apiUrl}Retros/delete/${retroId}`;
        return this.http.delete<any>(url);
    }

    addNewRetro(retroWithSetting: RetroWithSettingDto): Observable<any> {
        const url = 'https://retroapi20250819154156-dsfbade7bxh7fca7.uaenorth-01.azurewebsites.net/api/Retros/add/retroWithSetting';
        return this.http.post<any>(url, retroWithSetting);
    }
}
