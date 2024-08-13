import { Component, HostListener, EventEmitter, Output, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValuesService, Value } from '../values.service';
import { NgbAlert, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CollectionDropdownService } from '../collection-dropdown/collection-dropdown-service';
import { ValueInputComponent } from './value-input/value-input.component';

@Component({
  selector: 'app-initialize',
  standalone: true,
  imports: [CommonModule, NgbModule, ValueInputComponent],
  templateUrl: './initialize.component.html',
  styleUrl: './initialize.component.scss'
})
export class InitializeComponent {
  @Output() public startSorter = new EventEmitter();  
  @ViewChildren(ValueInputComponent) valueInputs: QueryList<ValueInputComponent> = new QueryList();

  public showNotEnoughValuesAlert = false;

  public get values(): Value[] {
    // exclude last
    return this.valuesService.selectedCollection.values.slice(0, -1);
  }

  constructor(public valuesService: ValuesService, public collectionDropdownService: CollectionDropdownService) {
  }

  public addValue(event:KeyboardEvent|undefined = undefined): void {
    if (event !== undefined) {
      event.preventDefault();
    }

    this.focusElement(this.valuesService.selectedCollection.values.length - 1);
    this.valuesService.selectedCollection.values.push(this.valuesService.getNewValue());
  }
  @HostListener('document:keydown.enter', ['$event']) 
  public addValueEnter(event:KeyboardEvent|undefined = undefined): void {
    if (this.collectionDropdownService.isEditingCollectionName) {
      return;
    }

    const input = this.valueInputs.toArray()[this.valuesService.selectedCollection.values.length - 1];
    if (input !== undefined) {
      input.disableGreyedOut();
    }
  }
  @HostListener('document:keydown.shift.enter', ['$event'])
  public removeLastValue(event:KeyboardEvent|undefined = undefined): void {
    if (event !== undefined) {
      event.preventDefault();
    }

    if (this.valuesService.selectedCollection.values.length <= 1) 
      return;
    
    this.valuesService.selectedCollection.values.splice(this.valuesService.selectedCollection.values.length - 2, 1);

    this.focusLastElement();
  }

  @HostListener('document:keydown.home', ['$event'])
  public focusFirstElement(event:KeyboardEvent|undefined = undefined): void {
    this.focusElement(0);
  }

  @HostListener('document:keydown.end', ['$event'])
  public focusLastElement(event:KeyboardEvent|undefined = undefined): void {
    this.focusElement(this.valuesService.selectedCollection.values.length - 2);
  }

  public focusElement(index: number): void {
    const input = this.valueInputs.toArray()[index];
    if (input !== undefined) {
      input.focus();
    }
  }
  

  public removeValue(index: number): void {
    this.values.splice(index, 1);
  }

  @HostListener('document:keydown.control.s', ['$event'])
  downloadJson(event:KeyboardEvent|undefined = undefined):void {
    if (event !== undefined) {
      event.preventDefault();
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.values));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "wisdomkeys-items.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'o') {
      event.preventDefault(); // Prevent the default browser behavior (e.g., open file dialog)
      const fileInput = document.getElementById('json-upload') as HTMLInputElement;
      fileInput.click();
    }
  }
  uploadJson(event: Event):void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file === undefined) 
    {
      console.error('No file selected');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      try {
        const values = JSON.parse(text);
        if (Array.isArray(values)) {
          this.valuesService.selectedCollection.values = values;
          this.valuesService.selectedCollection.values.push(this.valuesService.getNewValue());

          this.valuesService.saveCollections();
        }
        else {
          console.error('Invalid JSON file');
        }
      } catch (e) {
        console.error(e);
      }
    };
    reader.readAsText(file);
  }
}
