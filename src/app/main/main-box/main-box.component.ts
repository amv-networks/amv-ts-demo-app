import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { zip } from 'rxjs/observable/zip';
import { catchError, delay, tap, map, flatMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { TrafficsoftClientService, Reservation } from '../shared/trafficsoft-clients.service';
import { AppConfig } from '../../config/app.config';

@Component({
  selector: 'app-main-box',
  templateUrl: './main-box.component.html',
  styleUrls: ['./main-box.component.scss']
})

export class MainBoxComponent implements OnInit, AfterViewInit {
  loading = true;

  vehicleId: number;

  private lastData: any[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private trafficsoftClientService: TrafficsoftClientService,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.vehicleId = +this.route.snapshot.paramMap.get('id');

    this.loading = false;
  }

  ngAfterViewInit(): void {
  }
}
