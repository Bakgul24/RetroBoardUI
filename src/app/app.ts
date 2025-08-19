import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CategoryComponent } from "./components/category/category";
import { TeamComponent } from "./components/team/team";
import { RetroComponent } from "./components/retro/retro";
import { DateComponent } from "./components/date/date";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CategoryComponent, TeamComponent, RetroComponent, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('retrospektif');

}
