import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main-box',
  templateUrl: './main-box.component.html',
  styleUrls: ['./main-box.component.scss']
})

export class MainBoxComponent implements OnInit, AfterViewInit {
  vehicleId: number;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.vehicleId = +this.route.snapshot.paramMap.get('id');
  }

  ngAfterViewInit(): void {
  }
}
