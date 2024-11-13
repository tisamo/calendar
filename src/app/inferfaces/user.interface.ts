import {Time} from "@angular/common";


export interface User{
  name: string;
  months:Month[];
}

export interface Month{
  name: string;
  days: Day[];
}


export interface Day{
  dayOfTheMonth: number;
  work: TimeEntry[];
}
export interface TimeEntry {
  id?: string;
  title: string;
  startTime: string;
  endTime: string;
  description: string;
  tags?: string[];
  severity?: Severity;
}

export type Severity = 'low' | 'mid' | 'high';

export type CalendarEntry = Day | null;
