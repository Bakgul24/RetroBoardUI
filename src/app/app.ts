import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CategoryComponent } from "./components/category/category";
import { TeamComponent } from "./components/team/team";
import { RetroComponent } from "./components/retro/retro";
import { CommonModule } from '@angular/common';

declare var google: any;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CategoryComponent, TeamComponent, RetroComponent, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {

  googleUserId: string | undefined;
  userLoggedIn: boolean = false;

  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: '361502908695-rmd9hma5fa8g99moik7pb7utdhqcgdce.apps.googleusercontent.com',
      callback: (response: any) => {
        console.log(response);
        this.handleLoginSuccess(response);
      }
    });
  }

  ngAfterViewChecked(): void {
    const button = document.getElementById("google-button");
    if (button && !this.userLoggedIn) {
      google.accounts.id.renderButton(button, {
        theme: 'filled_blue',
        size: 'large',
        shape: 'rectangle',
        width: 150,
      });
    } else if (this.userLoggedIn) {
      this.closeModal();
    }
  }

  handleLoginSuccess(response: any): void {
    const idToken = response.credential;
    const payload = idToken.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));

    this.googleUserId = decodedPayload.sub;
    const email = decodedPayload.email;
    const name = decodedPayload.name;

    console.log('Google User ID (sub):', this.googleUserId);
    console.log('Email:', email);
    console.log('Name:', name);

    this.userLoggedIn = true;
    this.closeModal();
  }

  handleLogout(): void {
    google.accounts.id.revoke(this.googleUserId, () => {
      console.log("User logged out");
      this.userLoggedIn = false;
      this.googleUserId = undefined;
    });
  }

  closeModal(): void {
    const modal = document.getElementById('googleLoginModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
}
