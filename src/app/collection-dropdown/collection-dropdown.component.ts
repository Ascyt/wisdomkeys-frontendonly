import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Collection, ValuesService } from '../values.service';
import { FormsModule } from '@angular/forms';
import { CollectionDropdownService } from './collection-dropdown-service';
import { PracticeComponent } from '../practice/practice.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-collection-dropdown',
  standalone: true,
  imports: [NgbModule, CommonModule, FormsModule],
  templateUrl: './collection-dropdown.component.html',
  styleUrl: './collection-dropdown.component.scss'
})
export class CollectionDropdownComponent {
  @ViewChild('valueInputAnswer') valueInputAnswer: ElementRef | undefined;
  
  public get deleteDisabled(): boolean {
    return this.valuesService.collections.length <= 1;
  }

  public currentCollectionName:string = "";

  public constructor(public valuesService: ValuesService, public service: CollectionDropdownService, private router:Router) { }

  onEditCollectionName() {
    this.service.isEditingCollectionName = true;
    this.currentCollectionName = this.valuesService.selectedCollection.name;

    // run in next frame
    setTimeout(() => {
      this.valueInputAnswer?.nativeElement.focus();
    });
  }

  onEditCollectionNameSave() {
    this.service.isEditingCollectionName = false;
    this.valuesService.selectedCollection.name = this.currentCollectionName;

    this.valuesService.saveCollections();
  }
  
  onEditCollectionNameCancel() {
    this.service.isEditingCollectionName = false;
  }

  onEnterKeydown() {
    // run in next frame
    setTimeout(() => {
      this.onEditCollectionNameSave();
    });
  }
  onEscapeKeydown() {
    // run in next frame
    setTimeout(() => {
      this.onEditCollectionNameCancel();
    });
  }

  onSelect(item:Collection) {
    this.onEditCollectionNameCancel();

    this.valuesService.changeSelectedCollection(item);
  }

  onDeleteCurrent() {
    this.onEditCollectionNameCancel();

    this.valuesService.removeCollection(this.valuesService.selectedCollection);
  }

  addCollection() {
    this.onEditCollectionNameCancel();

    const collection:Collection = this.valuesService.addEmptyCollection();

    this.onSelect(collection);
  }
}
