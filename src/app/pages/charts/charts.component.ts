import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {AuthService} from "../../services/auth.service";
import {Month, User} from "../../inferfaces/user.interface";
import { NgxChartsModule} from "@swimlane/ngx-charts";
import {RouterLink} from "@angular/router";
import {MatButton} from "@angular/material/button";

interface ChartRecord{
  name: string;
  value: number;
}
interface ChartData {
  mostUsedTags: ChartRecord[];
  mostUsedSeverity: ChartRecord[];
  averageTaskTimeInMinutes: number;
  workDayLengths: ChartRecord[];
}

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, RouterLink, MatButton


  ],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.scss'
})
export class ChartsComponent implements  OnInit {
  chartData!: ChartData;
  currentMonth = '';

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    const user = this.authService.currentUser;
    this.currentMonth = this.authService.selectedMonth;
    if(user){
      this.chartData = this.processDataForCharts(user.months[0]);
    }
  }



  processDataForCharts(data: Month) {
    const tagFrequency: Record<string, number> = {};
    const severityFrequency: Record<string, number> = {};
    let totalTaskDuration = 0;
    let taskCount = 0;
    const workDayLengths: Record<number, number> = {};

    data.days.forEach((day) => {
      let dayTotalMinutes = 0;

      day.work.forEach((task) => {
        task.tags?.forEach((tag) => {
          tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        });

        if (task.severity) {
          severityFrequency[task.severity] = (severityFrequency[task.severity] || 0) + 1;
        }

        const [startHour, startMinute] = task.startTime.split(':').map(Number);
        const [endHour, endMinute] = task.endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        const taskDuration = endMinutes - startMinutes;

        totalTaskDuration += taskDuration;
        dayTotalMinutes += taskDuration;
        taskCount++;
      });

      workDayLengths[day.dayOfTheMonth] = dayTotalMinutes;
    });

    const averageTaskTime = taskCount > 0 ? totalTaskDuration / taskCount : 0;

    const mostUsedTags: ChartRecord[] = Object.entries(tagFrequency).map(([name, value]) => ({
      name,
      value,
    }));
    const mostUsedSeverity: ChartRecord[] = Object.entries(severityFrequency).map(([name, value]) => ({
      name,
      value,
    }));
    const workDayTimes: ChartRecord[] = Object.entries(workDayLengths).map(([name, value]) => ({
      name,
      value: value / 60,
    }));

    return {
      mostUsedTags,
      mostUsedSeverity,
      averageTaskTimeInMinutes: averageTaskTime,
      workDayLengths: workDayTimes,
    };
  }



}
