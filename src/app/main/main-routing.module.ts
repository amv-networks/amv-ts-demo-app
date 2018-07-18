import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainFrontComponent } from './main-front/main-front.component';
import { MainFaqComponent } from './main-faq/main-faq.component';
import { MainSettingsComponent } from './main-settings/main-settings.component';
import { MainBoxComponent } from './main-box/main-box.component';
import { MainBoxReservationsComponent } from './main-box/main-box-reservations.component';
import { MainBoxReservationCreateComponent } from './main-box/main-box-reservation-create/main-box-reservation-create.component';
import { MainComponent } from './main.component';

const mainRoutes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', component: MainFrontComponent },
      { path: 'faq', component: MainFaqComponent },
      { path: 'settings', component: MainSettingsComponent },
      { path: 'box/:id/reservation', component: MainBoxReservationsComponent },
      { path: 'box/:id/reservation/create', component: MainBoxReservationCreateComponent },
      { path: 'box/:id/_tabs/:slug', component: MainBoxComponent },
      {
        path: 'box/:id',
        redirectTo: '/box/:id/_tabs/location',
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(mainRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class MainRoutingModule {
}
