import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  onAuthUIStateChange,
  CognitoUserInterface,
  AuthState
} from '@aws-amplify/ui-components';

import {
  LogicInterface
} from '../../../../src/app/logic-interface.interface';

import {
  Logic
} from './app.logic';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  map
} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'aws';
  public logic: LogicInterface = new Logic();

  constructor(
    private ref: ChangeDetectorRef
  ) { }
}
