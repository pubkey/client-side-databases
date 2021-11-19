import {
  Component,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageInputComponent {

  @Output() change: EventEmitter<string> = new EventEmitter();
  @Output() submit: EventEmitter<string> = new EventEmitter();
  @ViewChild('inputElementRef', { static: true }) inputElementRef: ElementRef;

  public buttonDisabled = true;

  constructor() { }

  onSubmit() {
    const value = this.getValue();
    this.submit.emit(value);
    this.resetValue();
    this.focus();
  }

  public focus() {
    this.inputElementRef.nativeElement.focus();
  }

  onChange(event: KeyboardEvent) {
    const value = this.getValue();
    if (value === '') {
      this.buttonDisabled = true;
    } else {
      this.buttonDisabled = false;
      if (event.key === 'Enter') {
        this.onSubmit();
      }
    }
  }

  getValue() {
    return this.inputElementRef.nativeElement.value;
  }

  setValue(value: string) {
    this.inputElementRef.nativeElement.value = value;
  }

  resetValue() {
    this.inputElementRef.nativeElement.value = '';
    this.buttonDisabled = true;
  }
}
