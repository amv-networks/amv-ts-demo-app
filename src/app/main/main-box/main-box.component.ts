import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatTabGroup, MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { TrafficsoftClientService } from '../shared/trafficsoft-clients.service';
import { ApplicationSettingsService } from '../shared/application_settings.service';
import { ApplicationSettings } from '../shared/application_settings.model';
import { AppConfig } from '../../config/app.config';

import { Observable } from 'rxjs';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { catchError, delay, tap, map, flatMap } from 'rxjs/operators';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-main-box',
  templateUrl: './main-box.component.html',
  styleUrls: ['./main-box.component.scss']
})

export class MainBoxComponent implements OnInit, AfterViewInit {

  static tabInfos = [ {
    slug: 'xfcd',
  }, {
    slug: 'reservation',
  },{
    slug: 'location',
  }];

  loading = true;
  debugMode = false;

  lastData: any[] = [];

  vehicleId: number;
  vehicle: any;

  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  tabIndex = 0;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    private trafficsoftClientService: TrafficsoftClientService,
    private applicationSettingsService: ApplicationSettingsService) {


  }
  
  reload() {
    this.lastData = [];

    this.load();
  }

  static getTabIndex(route: ActivatedRoute) {
    let r = route;
    while (r.firstChild) {
      r = r.firstChild;
    }
    const params = r.snapshot.params;
    if ('slug' in params) {
      const slug = params['slug'];
      return MainBoxComponent.getTabIndexBySlug(slug);
    }
    return 0;
  }

  static getTabIndexBySlug(slug: string) {
    if (slug) {
      return Math.max(0, MainBoxComponent.tabInfos.findIndex(tabInfo => tabInfo.slug === slug));
    }
    return 0;
  }

  ngOnInit() {
    this.vehicleId = +this.activatedRoute.snapshot.paramMap.get('id');

    const slug = this.activatedRoute.snapshot.paramMap.get('slug');
    this.tabIndex = MainBoxComponent.getTabIndexBySlug(slug);

    this.router.events
      .filter(event => {
        return event instanceof NavigationEnd;
      })
      .map(() => this.activatedRoute)
      .map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      })
      .filter(route => route.outlet === 'primary')
      .subscribe(route => {
        const newTabIndex = MainBoxComponent.getTabIndex(route);
        if (this.tabIndex !== newTabIndex) {
          this.tabIndex = newTabIndex;
        }
      });

    this.load();

    this.applicationSettingsService.get()
    .subscribe(settings => this.debugMode = settings.debugMode);
  }

  onSelectedIndexChange(newTabIndex) {
    if (this.tabIndex !== newTabIndex) {
      const tabInfo = MainBoxComponent.tabInfos[newTabIndex];
      this.router.navigate(['/box', this.vehicleId, '_tabs', tabInfo.slug]);
    }
  }

  ngAfterViewInit(): void {
  }

  private load() {
    this.loading = true;

    this.applicationSettingsService.get().pipe(
      flatMap(settings => this.fetchLastData(settings))
    ).subscribe(lastData => {
      this.lastData = lastData;

      if (lastData.length > 0) {
        this.vehicle = lastData[0];
      }
    }, err => {
      this.popupError('Loading latest data errored');
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  fetchLastData(settings: ApplicationSettings): Observable<any[]> {
    return this.trafficsoftClientService.xfcd(settings)
      .pipe(flatMap(client => {
        return fromPromise(client.getLastData(this.vehicleId)).pipe(
          map(response => response['data'] || []),
          map(array => array.filter(a => a.id === this.vehicleId))
        );
      }));
  }

  popupError(error): void {
    this.popupSnackBar(error, 'background-red');
  }

  popupMessage(message): void {
    this.popupSnackBar(message, '');
  }

  popupSnackBar(content: any, panelClass: string): void {
    const config: any = new MatSnackBarConfig();
    config.duration = AppConfig.snackBarDuration;
    config.panelClass = panelClass;
    this.snackBar.open(content, 'OK', config);
  }

}
