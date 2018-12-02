
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatTabGroup } from '@angular/material';
import { TrafficsoftClientService } from '../shared/trafficsoft-clients.service';
import { ApplicationSettingsService } from '../shared/application_settings.service';
import { ApplicationSettings } from '../shared/application_settings.model';

import { Observable, from as fromPromise } from 'rxjs';
import { filter, map, flatMap } from 'rxjs/operators';

import { ProgressBarService } from '../../core/shared/progress-bar.service';
import { SnackBarService } from '../../core/shared/snack-bar.service';

@Component({
  selector: 'app-main-box',
  templateUrl: './main-box.component.html',
  styleUrls: ['./main-box.component.scss']
})

export class MainBoxComponent implements OnInit, AfterViewInit {

  static tabInfos = [{
    slug: 'xfcd',
  }, {
    slug: 'reservation',
  }, {
    slug: 'location',
  }];

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

  loading = true;
  debugMode = false;

  lastData: any[] = [];

  vehicleId: number;
  vehicle: any;

  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  tabIndex = 0;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private snackBar: SnackBarService,
    private progressBar: ProgressBarService,
    private trafficsoftClientService: TrafficsoftClientService,
    private applicationSettingsService: ApplicationSettingsService) {
  }

  ngOnInit() {
    this.vehicleId = +this.activatedRoute.snapshot.paramMap.get('id');

    const slug = this.activatedRoute.snapshot.paramMap.get('slug');
    this.tabIndex = MainBoxComponent.getTabIndexBySlug(slug);

    this.router.events.pipe(
      filter(event => {
        return event instanceof NavigationEnd;
      }),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === 'primary'), )
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

  ngAfterViewInit(): void {
  }

  onSelectedIndexChange(newTabIndex) {
    if (this.tabIndex !== newTabIndex) {
      const tabInfo = MainBoxComponent.tabInfos[newTabIndex];
      this.router.navigate(['/box', this.vehicleId, '_tabs', tabInfo.slug]);
    }
  }


  reload() {
    this.loading = true;

    this.fetchLastData()
      .subscribe(foo => {
      }, err => {
        this.snackBar.popupError('Loading latest data errored');
        this.loading = false;
      }, () => {
        this.loading = false;
      });
  }

  private load() {
    this.loading = true;
    this.progressBar.buffer();

    this.fetchLastData()
      .subscribe(foo => {
      }, err => {
        this.snackBar.popupError('Loading latest data errored');
        this.loading = false;
        this.progressBar.decrease();
      }, () => {
        this.loading = false;
        this.progressBar.decrease();
      });
  }

  private fetchLastData() {
    return this.applicationSettingsService.get()
      .pipe(flatMap(settings => this.fetchLastDataWithSettings(settings))).pipe(
        map(lastData => {
          this.lastData = lastData;

          if (lastData.length > 0) {
            this.vehicle = lastData[0];
          }

          return lastData;
        }));
  }

  private fetchLastDataWithSettings(settings: ApplicationSettings): Observable<any[]> {
    return this.trafficsoftClientService.xfcd(settings)
      .pipe(flatMap(client => {
        return fromPromise(client.getLastData(this.vehicleId)).pipe(
          map(response => response['data'] || []),
          map(array => array.filter(a => a.id === this.vehicleId))
        );
      }));
  }
}
