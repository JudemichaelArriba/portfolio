import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBar } from '../../components/top-bar/top-bar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, TopBar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

}
