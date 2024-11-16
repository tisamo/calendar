import {Component, Input} from '@angular/core';
import {TimeEntry} from '../../inferfaces/user.interface';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {MatChip, MatChipListbox} from '@angular/material/chips';
import {MatIcon} from '@angular/material/icon';
import {CalendarEditComponent} from '../calendar-edit/calendar-edit.component';
import {MatDialog} from '@angular/material/dialog';
import {AuthService} from '../../services/auth.service';
import {MatIconButton} from '@angular/material/button';
import {SnackbarService} from '../../services/snackbar.service';
import {YesNoDialogComponent} from '../yes-no-dialog/yes-no-dialog.component';

@Component({
  selector: 'app-calendar-card',
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    NgIf,
    MatCardContent,
    MatChipListbox,
    MatCardTitle,
    MatChip,
    NgForOf,
    MatIcon,
    DatePipe,
    MatIconButton
  ],
  templateUrl: './calendar-card.component.html',
  styleUrl: './calendar-card.component.scss'
})
export class CalendarCardComponent {
  @Input() task!: TimeEntry;
  @Input() day!: number;

  constructor(private matDialog: MatDialog,
              private authService: AuthService,
              private snackBar: SnackbarService) {
  }

  deleteTask(id: string) {
    const dialogRef = this.matDialog.open(YesNoDialogComponent, {
      panelClass: 'dialog-responsive',
      minHeight: '200px',
      data: 'Are you sure you want to delete this task?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const user = this.authService.currentUser;
      if (!user) return;

      const month = user.months.find(m => m.name === this.authService.selectedMonth);
      if (!month) return;

      const day = month.days.find(d => d.dayOfTheMonth === +this.day);
      if (!day) {
        console.log('Day not found');
        return;
      }

      const taskIndex = day.work.findIndex(t => t.id === id);
      if (taskIndex > -1) {
        day.work.splice(taskIndex, 1);
      }

      this.authService.updateDb(this.authService.getDbValue());
    });
  }


  editTask() {
    const dialogRef = this.matDialog.open(CalendarEditComponent, {
      panelClass: 'dialog-responsive',
      minHeight: '400px',
      data: this.task
    });

    dialogRef.afterClosed().subscribe(result => {
      const user = this.authService.currentUser;
      if (!user) return;

      const month = user.months.find(m => m.name === this.authService.selectedMonth);
      if (!month) return;

      let day = month.days.find(d => d.dayOfTheMonth === +this.day);
      if (!day) {
        this.snackBar.showError('Day not found');
        return;
      } else {
        const index = day.work.findIndex(work => work.id === result.id);
        if (index > -1) {
          day.work[index] = result;
          this.task = result;
        } else {
          this.snackBar.showError('Task with specified id not found');
          return;
        }
      }

      this.authService.updateDb(this.authService.getDbValue());
      this.snackBar.showSuccess('Tasks successfully added!');
    });
  }
}
