import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Day, Severity, TimeEntry} from "../../inferfaces/user.interface";
import {CommonModule} from "@angular/common";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_NATIVE_DATE_FORMATS,
  MatNativeDateModule,
  NativeDateAdapter
} from "@angular/material/core";
import {NgxMatTimepickerComponent, NgxMatTimepickerDirective} from "ngx-mat-timepicker";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatListOption} from "@angular/material/list";
import {MatIcon} from "@angular/material/icon";
import {SnackbarService} from "../../services/snackbar.service";

interface SeverityInput{
  value: Severity;
}


@Component({
  selector: 'app-calendar-edit',
  standalone: true,
  providers: [
    {provide: DateAdapter, useClass: NativeDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS}
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatDatepickerToggle,
    MatDatepicker,
    MatInput,
    MatButton,
    MatDatepickerInput,
    MatNativeDateModule,
    NgxMatTimepickerDirective,
    NgxMatTimepickerComponent,
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatDialogClose,
    MatListOption,
    MatIcon,
  ],
    templateUrl: './calendar-edit.component.html',
    styleUrl: './calendar-edit.component.scss'
})
export class CalendarEditComponent implements OnInit{
  severities: SeverityInput[] = [
    { value: 'low' },
    { value: 'mid'},
    { value: 'high'}
  ];
  taskForm: FormGroup =  new FormGroup({});

  constructor(private fb: FormBuilder,
              private snackBar: SnackbarService,
              @Inject(MAT_DIALOG_DATA) public data: TimeEntry,
  private matDialogRef: MatDialogRef<CalendarEditComponent>) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      id: [this.data?.id ?? ''],
      title:[this.data?.title ?? '', Validators.required],
      startTime: [this.data?.startTime ?? '', Validators.required],
      endTime: [this.data?.endTime ?? '', Validators.required],
      description: [this.data?.description ?? '', Validators.required],
      tags: [this.data?.tags ?? ['']],
      severity: [this.data?.severity ?? '', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const data: TimeEntry = this.taskForm.value;

      if(this.isStartTimeEarlier(data.startTime, data.endTime)){
        this.snackBar.showError('Start time has to be less than End time!');
        return;
      }
      if(!this.data){
        data['id'] =  Date.now().toString(36) + Math.random().toString(36).substr(2);
      }
      this.matDialogRef.close(data);
      return;
    } else {
      this.snackBar.showError('Please fill out the form!');
    }
  }

   isStartTimeEarlier(time1: string, time2: string): boolean {
    const today = new Date().toISOString().slice(0, 10);
    const date1 = new Date(`${today}T${time1}:00`);
    const date2 = new Date(`${today}T${time2}:00`);
    return date2 < date1;
  }


  onNoClick() {
    this.matDialogRef.close(null);
  }
}
