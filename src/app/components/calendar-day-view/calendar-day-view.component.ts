import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {MatFormField} from '@angular/material/form-field';
import {MatButton} from '@angular/material/button';
import {Day} from '../../inferfaces/user.interface';
import {CalendarCardComponent} from '../calendar-card/calendar-card.component';
import {CalendarEditComponent} from '../calendar-edit/calendar-edit.component';
import {AuthService} from '../../services/auth.service';
import {SnackbarService} from '../../services/snackbar.service';

@Component({
  selector: 'app-calendar-day-view',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogContent,
    MatFormField,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    CalendarCardComponent,
    MatDialogTitle,
  ],
  templateUrl: './calendar-day-view.component.html',
  styleUrl: './calendar-day-view.component.scss'
})
export class CalendarDayViewComponent {
  constructor(
    public dialogRef: MatDialogRef<CalendarDayViewComponent>,
    private matDialog: MatDialog,
    private snackBar: SnackbarService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: Day
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  openDialog(): void {
    const dialogRef = this.matDialog.open(CalendarEditComponent, {
      width: '800px',
      minHeight: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const user = this.authService.currentUser;
      if (!user) return;

      const month = user.months.find(m => m.name === this.authService.selectedMonth);
      if (!month) return;

      let day = month.days.find(d => d.dayOfTheMonth === this.data.dayOfTheMonth);
      if (!day) {
        day = this.data;
        day.work.push(result);
        day.work.sort((w, e) => {
          const wTime = new Date(`2000-01-01T${w.startTime}:00`).getTime();
          const eTime = new Date(`2000-01-01T${e.startTime}:00`).getTime();
          return wTime - eTime;
        });
        month.days.push(day);
      } else {
        day.work.push(result);
        this.data = day;
      }

      this.authService.updateDb(this.authService.getDbValue());
      this.snackBar.showSuccess('Tasks successfully added!');
    });
  }


}
