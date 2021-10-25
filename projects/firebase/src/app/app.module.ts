import { BrowserModule } from '@angular/platform-browser';
import {
  NgModule,
  APP_INITIALIZER
} from '@angular/core';
import {
  APP_BASE_HREF,
  LocationStrategy,
  PathLocationStrategy
} from '@angular/common';

import { AppComponent } from './app.component';
import {
  ChatModule
} from '../../../../src/app/chat.module';

import {
  DatabaseService,
  initDatabase
} from './services/database.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ChatModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: () => initDatabase,
      multi: true,
      deps: [/* your dependencies */]
    },
    DatabaseService,
    { provide: APP_BASE_HREF, useValue: '/' },
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
