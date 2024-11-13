import {Component, Input, OnInit} from '@angular/core';
import {Day, TimeEntry} from "../../inferfaces/user.interface";
import {NgForOf, NgIf} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {CalendarDayViewComponent} from "../calendar-day-view/calendar-day-view.component";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-callendar-day',
  standalone: true,
  imports: [
    NgIf,
    NgForOf
  ],
  templateUrl: './callendar-day.component.html',
  styleUrl: './callendar-day.component.scss'
})
export class CallendarDayComponent {

  @Input() workDay: null | Day = null;


  constructor(private dialog: MatDialog,
              public authService: AuthService) {
    this.dialog = dialog;
  }

  openDialog(): void {
    if (!this.workDay) return;
     this.dialog.open(CalendarDayViewComponent, {
      minHeight: '400px',
      panelClass: 'dialog-responsive',
      data: this.workDay
    });
  }
}
