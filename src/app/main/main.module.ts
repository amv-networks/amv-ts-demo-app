import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MainRoutingModule } from './main-routing.module';
import { SharedModule } from '../shared/modules/shared.module';

import { MainFrontComponent } from './main-front/main-front.component';
import { MainFaqComponent } from './main-faq/main-faq.component';
import { MainSettingsComponent } from './main-settings/main-settings.component';
import { MainBoxComponent } from './main-box/main-box.component';
import { MainBoxReservationsComponent, CancelReservationDialogComponent } from './main-box/main-box-reservation.component';
import { MainBoxXfcdComponent } from './main-box/main-box-xfcd.component';
import { MainBoxMapComponent } from './main-box/main-box-map.component';

import { MainComponent } from './main.component';
import { ApplicationSettingsService } from './shared/application_settings.service';
import { TrafficsoftClientService } from './shared/trafficsoft-clients.service';
import { EnterPassphraseDialogComponent } from './shared/enter_passphrase.dialog';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';


@NgModule({
  imports: [
    LeafletModule,
    CommonModule,
    FormsModule,
    SharedModule,
    MainRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [
    MainComponent,
    MainFrontComponent,
    MainFaqComponent,
    MainBoxComponent,
    MainSettingsComponent,
    MainBoxReservationsComponent,
    MainBoxXfcdComponent,
    MainBoxMapComponent,
    CancelReservationDialogComponent,
    EnterPassphraseDialogComponent
    // RemoveHeroDialogComponent,
    // HeroDetailComponent
  ],
  entryComponents: [
    CancelReservationDialogComponent,
    EnterPassphraseDialogComponent
    // RemoveHeroDialogComponent
  ],
  providers: [
    ApplicationSettingsService,
    TrafficsoftClientService
    // HeroService
  ]
})

export class MainModule {
}
