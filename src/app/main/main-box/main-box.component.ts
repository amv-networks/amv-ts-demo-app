import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatTabGroup } from '@angular/material';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-main-box',
  templateUrl: './main-box.component.html',
  styleUrls: ['./main-box.component.scss']
})

export class MainBoxComponent implements OnInit, AfterViewInit {

  static tabInfos = [{
    slug: 'location',
  }, {
    slug: 'xfcd',
  }, {
    slug: 'reservation',
  }];

  vehicleId: number;

  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  tabIndex = 0;

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

  constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

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
  }

  onSelectedIndexChange(newTabIndex) {
    if (this.tabIndex !== newTabIndex) {
      const tabInfo = MainBoxComponent.tabInfos[newTabIndex];
      this.router.navigate(['/box', this.vehicleId, '_tabs', tabInfo.slug]);
    }
  }

  ngAfterViewInit(): void {
  }
}
