import {Component, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {CalendarComponent} from '../../components/calendar/calendar.component';
import {add, endOfMonth, format, getDay, isSameMonth, startOfMonth, startOfWeek} from 'date-fns';
import {Router, RouterLink} from '@angular/router';
import {CalendarEntry, Month, TimeEntry, User} from '../../inferfaces/user.interface';
import {CalendarEditComponent} from '../../components/calendar-edit/calendar-edit.component';
import {MatDialog} from '@angular/material/dialog';
import {CalendarDayViewComponent} from '../../components/calendar-day-view/calendar-day-view.component';
import {AuthService} from '../../services/auth.service';
import {SnackbarService} from '../../services/snackbar.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButton,
    CalendarComponent,
    CalendarEditComponent,
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  userWorkDays: Month = {name: '', days: []};
  calendarEntries: CalendarEntry[] = [];
  workHours = '';

  constructor(private router: Router,
              private authService: AuthService,
              private snackBar: SnackbarService,
              private matDialog: MatDialog) {
  }

  ngOnInit(): void {
    this.getDataFromUser();
    this.constructMonthView();
    this.authService.users.subscribe(()=>{
      if(!this.calendarEntries.length) return;
      const minutes = this.calculateWorkingHoursForEntries(this.calendarEntries);
      this.workHours = this.calendarEntries.length > 7 ? `You have worked ${Math.round(minutes / 60)} hours this month`
      : `You have worked ${Math.round(minutes / 60)} hours this week`;
    })
  }

  getDataFromUser() {
    const userData = this.authService.currentUser;
    if (userData) {
      const currentMonthName = format(new Date(), 'MMMM');
      this.authService.selectedMonth = currentMonthName;

      const monthData = userData.months.find(m => m.name === currentMonthName);
      if (!monthData) {
        const newMonth = {name: currentMonthName, days: []};
        userData.months.push(newMonth);
        const updatedDb = this.authService.getDbValue();
        this.authService.updateDb(updatedDb);
        this.userWorkDays = newMonth;
      } else {
        this.userWorkDays = monthData;
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  getWeek() {
    const firstDayOfWeek = startOfWeek(new Date(), {weekStartsOn: 0});
    let currentDate = firstDayOfWeek;
    this.calendarEntries = [];

    for (let i = 0; i < 7; i++) {
      const entry = isSameMonth(currentDate, new Date()) ? format(currentDate, 'd') : null;

      if (!entry) {
        this.calendarEntries.push(null);
      } else {
        const userWorkDay = this.userWorkDays.days.find(d => d.dayOfTheMonth == +entry);
        if (userWorkDay) {
          this.calendarEntries.push(userWorkDay);
        } else {
          this.calendarEntries.push({dayOfTheMonth: +entry, work: []});
        }
      }

      currentDate = add(currentDate, {days: 1});
    }

    const minutes = this.calculateWorkingHoursForEntries(this.calendarEntries);
    this.workHours = `You have worked ${Math.round(minutes / 60)} hours this week`;
  }

  constructMonthView() {
    this.calendarEntries = this.createCalendarEntriesForCurrentMonth();
    const minutes = this.calculateWorkingHoursForEntries(this.calendarEntries);
    this.workHours = `You have worked ${Math.round(minutes / 60)} hours this month`;
  }

  private createCalendarEntriesForCurrentMonth(): CalendarEntry[] {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    let currentDate = start;
    const entries = [];

    while (currentDate <= end) {
      const day = +format(currentDate, 'd');
      const userWorkDay = this.userWorkDays.days.find(d => d.dayOfTheMonth == day);
      if (userWorkDay) {
        entries.push(userWorkDay);
      } else {
        entries.push({dayOfTheMonth: day, work: []});
      }

      currentDate = add(currentDate, {days: 1});
    }

    const firstDay = startOfMonth(new Date());
    this.padMonthFirstWeek(firstDay, entries);
    return entries;
  }

  private padMonthFirstWeek(firstDayOfMonth: Date, entries: CalendarEntry[]) {
    let firstDayNumber = getDay(firstDayOfMonth);

    for (let i = 0; i < firstDayNumber; i++) {
      entries.unshift(null);
    }
  }

  private calculateWorkingHoursForEntries(entries: CalendarEntry[]): number {
    let minutes = 0;

    for (const entry of entries) {
      if (entry?.work == null) continue;

      minutes += entry.work.reduce((total: number, w: TimeEntry) => {
        return total + this.calculateTimeDifferenceInMinutes(w.startTime, w.endTime);
      }, 0);
    }

    return minutes;
  }

  getToday() {
    const today = new Date();
    const dayOfMonth = format(today, 'd');
    const userWorkDay = this.userWorkDays.days.find(d => d.dayOfTheMonth == +dayOfMonth);
    let workDay = userWorkDay ?? {dayOfTheMonth: +dayOfMonth, work: []};
    const dialogRef = this.matDialog.open(CalendarDayViewComponent, {
      minHeight: '400px',
      panelClass: 'dialog-responsive',
      data: workDay
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const user = this.authService.getDbValue().find(u => u.name === localStorage.getItem('currentUser'));
      if (!user) {
        this.authService.logout();
        return;
      }

      const month = user.months.find(m => m.name === this.authService.selectedMonth);
      if (!month) return;

      let day = month.days.find(d => d.dayOfTheMonth === workDay.dayOfTheMonth);
      if (!day) {
        day = workDay;
        day.work.push(result);
        day.work.sort((w, e) => {
          const wTime = new Date(`2000-01-01T${w.startTime}:00`).getTime();
          const eTime = new Date(`2000-01-01T${e.startTime}:00`).getTime();
          return wTime - eTime;
        });
        month.days.push(day);
      } else {
        const index = day.work.findIndex(work => work.id === result.id);
        if (index > -1) {
          day.work[index] = result;
          workDay.work = [...result];
        } else {
          day.work.push(result);
        }
        workDay = day;
      }

      const updatedDb = this.authService.getDbValue();
      const userIndex = updatedDb.findIndex(u => u.name === user.name);

      if (userIndex > -1) {
        updatedDb[userIndex] = user;
      } else {
        updatedDb.push(user);
      }

      this.authService.updateDb(updatedDb);
      this.snackBar.showSuccess('Tasks successfully added!');
    });
  }

  calculateTimeDifferenceInMinutes(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;

    return endInMinutes - startInMinutes;
  }
}
