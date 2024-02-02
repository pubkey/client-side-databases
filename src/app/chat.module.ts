import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

/**
 * COMPONENTES
 */
import { SearchComponent } from './components/search/search.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { MessageInputComponent } from './components/message-input/message-input.component';
import { MessageBoxComponent } from './components/message-box/message-box.component';
import { MessageListComponent } from './components/message-list/message-list.component';
import { OwnNameComponent } from './components/own-name/own-name.component';
import { ChatLayoutComponent } from './components/chat-layout/chat-layout.component';
import { ChatComponent } from './components/chat/chat.component';

/**
 * PIPES
 */

/* material */
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

@NgModule({
  declarations: [
    SearchComponent,
    UserListComponent,
    MessageInputComponent,
    MessageBoxComponent,
    MessageListComponent,
    OwnNameComponent,
    ChatLayoutComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  providers: [],
  exports: [
    ChatLayoutComponent,
    ChatComponent
  ]
})
export class ChatModule { }
