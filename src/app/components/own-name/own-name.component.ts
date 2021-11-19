import {
  Component,
  Output,
  EventEmitter,
  HostBinding,
  ElementRef,
  ViewChild,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';

const LOCALSTORAGE_NAME = 'name';

@Component({
  selector: 'app-own-name',
  templateUrl: './own-name.component.html',
  styleUrls: ['./own-name.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnNameComponent implements OnInit {
  @Output() submit: EventEmitter<{
    name: string;
    save: boolean;
  }> = new EventEmitter();

  @HostBinding('class.hidden') public hidden = false;

  @ViewChild('nameInputRef', { static: true }) nameInputRef: ElementRef;

  public save = true;
  public submitDisabled = false;

  constructor() { }

  ngOnInit() {
    const name = localStorage.getItem(LOCALSTORAGE_NAME);
    // console.log('localstorage name: ' + name);
    this.save = true;
    if (name) {
      this.submitClick(name);
    }
  }

  private nameInputValue(): string {
    return this.nameInputRef.nativeElement.value.toLowerCase();
  }

  public submitClick(name?: string) {
    // console.log('OwnNameComponent.submitClick()');
    this.hidden = true;
    if (!name) {
      name = this.nameInputValue();
    }
    this.submit.emit({
      name,
      save: this.save
    });
    // console.log('name is ' + name + '; save: ' + this.save);
    if (this.save) {
      localStorage.setItem(LOCALSTORAGE_NAME, name);
      // console.log('saved name');
    }
  }

  public inputKeyup() {
    const name = this.nameInputValue();
    if (name && name.length >= 3) {
      this.submitDisabled = false;
    }
  }
}
