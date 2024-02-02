import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

/**
 * COMPONENTES
 */
import { AppComponent } from './app.component';

/**
 * PIPES
 */

/* material */
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ChatModule } from './chat.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    ChatModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: []
})
export class AppModule { }
