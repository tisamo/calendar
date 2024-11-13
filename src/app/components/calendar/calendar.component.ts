import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {NgForOf} from "@angular/common";
import {CalendarEntry, Day} from "../../inferfaces/user.interface";
import {CallendarDayComponent} from "../callendar-day/callendar-day.component";

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    NgForOf,
    CallendarDayComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent{
 @Input() calendarEntries: CalendarEntry[] = [];

  constructor() {

  }


}
