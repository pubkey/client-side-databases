import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {
  ChatModule
} from '../../../../src/app/chat.module';

import {
  APP_BASE_HREF,
  LocationStrategy,
  PathLocationStrategy
} from '@angular/common';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ChatModule
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
