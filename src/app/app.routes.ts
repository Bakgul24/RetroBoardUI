import { Routes } from '@angular/router';
import { TeamComponent } from './components/team/team';
import { RetroComponent } from './components/retro/retro';

export const routes: Routes = [
    { path: "retro/team/:teamId", component: RetroComponent },
];
