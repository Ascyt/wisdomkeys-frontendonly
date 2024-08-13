import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, NgbModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  getCurrentAge():number {
    const today = new Date();
    const birthDate = new Date('2007-04-25');

    const timeDiff = Math.abs(today.getTime() - birthDate.getTime());

    return Math.floor(timeDiff / (1000 * 3600 * 24) / 365);
  }
}
