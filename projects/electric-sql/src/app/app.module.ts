import {
  APP_BASE_HREF,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ChatModule } from '../../../../src/app/chat.module';
import { AppComponent } from './app.component';
import { Logic } from './app.logic';
import { ElectricService } from './services/electric.service';

export function initializeApp(electricService: ElectricService) {
  return () => electricService.initElectricDB();
}

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, ChatModule],
  providers: [
    ElectricService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ElectricService],
      multi: true,
    },
    {
      provide: Logic,
      useFactory: (electricService: ElectricService) =>
        new Logic(electricService),
      deps: [ElectricService],
    },
    { provide: APP_BASE_HREF, useValue: '/' },
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
