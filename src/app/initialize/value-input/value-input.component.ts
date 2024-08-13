import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ValuesService, Value } from '../../values.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-value-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './value-input.component.html',
  styleUrl: './value-input.component.scss'
})
export class ValueInputComponent {
  @Input() value: Value = this.valuesService.getNewValue();
  @Input() isGreyedOut: boolean = true;
  @Output() public focusPrevious = new EventEmitter();
  @Output() public focusNext = new EventEmitter();
  @Output() public greyedOutDisabled = new EventEmitter();
  @ViewChild('valueInput', { static: false }) valueInput!: ElementRef;

  constructor(private valuesService: ValuesService) { }

  public onDelete(): void {
    this.valuesService.selectedCollection.values.splice(this.valuesService.selectedCollection.values.indexOf(this.value), 1);

    this.valuesService.saveCollections();
  }

  public focus(): void {
    this.valueInput.nativeElement.focus();
  }

  public focusPreviousElement(): void {
    this.focusPrevious.emit();
  }
  public focusNextElement(): void {
    this.focusNext.emit();
  }

  public deleteIfEmpty(event:Event): void {
    if (this.value.question === '' && this.isGreyedOut === false) {
      event.preventDefault();
      
      this.onDelete();
      this.focusPreviousElement();
    }
  }

  public disableGreyedOut(): void {
    if (!this.isGreyedOut) {
      return;
    }

    this.isGreyedOut = false;

    this.greyedOutDisabled.emit();
  }

  public onOutOfFocus(): void {
    this.valuesService.saveCollections();
  }
}
