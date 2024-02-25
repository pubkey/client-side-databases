import {
  APP_BASE_HREF,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ChatModule } from '../../../../src/app/chat.module';
import { AppComponent } from './app.component';
import { ElectricService } from './services/electric.service';
import { Logic } from './app.logic';

export function initializeApp(electricService: ElectricService) {
  return (): Promise<any> => {
    return Promise.all([
      electricService.initElectricDB(),
      electricService.syncDb(),
    ]);
  };
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
      deps: [ElectricService], // Specifies that ElectricService is a dependency of Logic
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
