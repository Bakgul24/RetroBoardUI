import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamResponseModel } from '../models/teamResponseModel';
import { Team } from '../models/team';

@Injectable({ providedIn: 'root' })
export class TeamService {
    private http = inject(HttpClient);
    private apiUrl = 'https://retroapi20250819154156-dsfbade7bxh7fca7.uaenorth-01.azurewebsites.net/api/Teams/';

    private _currentTeam = signal<Team | null>(null);
    currentTeam = this._currentTeam;

    setCurrentTeam(team: Team | null) {
        this._currentTeam.set(team);
    }

    clearCurrentTeam() {
        this._currentTeam.set(null);
    }

    getAll(): Observable<TeamResponseModel> {
        const url = this.apiUrl + 'getAll';
        return this.http.get<TeamResponseModel>(url);
    }

    addTeam(teamName: string): Observable<any> {
        const url = this.apiUrl + 'add';
        const payload = { name: teamName };
        return this.http.post<any>(url, payload);
    }

    deleteTeam(teamId: string): Observable<any> {
        const url = `${this.apiUrl}delete/${teamId}`;

        return this.http.delete<any>(url);
    }
}
