import { Component, HostListener, Injectable, Renderer2 } from '@angular/core';
import { Value, ValuesService } from '../values.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-practice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './practice.component.html',
  styleUrl: './practice.component.scss'
})

export class PracticeComponent {
  public currentValue:Value|undefined = undefined;
  public currentValueAnswer:string = '';

  public isViewingAnswer:boolean = false;

  public spaceToSubmit:boolean = false;

  public stopwatchRunning:boolean = false;
  private elapsedTime: number = 0;
  private startTime: number = 0;
  private animationFrameId: any;

  private onSelectedCollectionChangeSubscription:Subscription|undefined = undefined;

  constructor(public valuesService: ValuesService, private renderer: Renderer2, private backendService:BackendService) {
    if (valuesService.selectedCollection.values.length > 0) {
      this.nextValue();
    }

    //this.startStopwatch();
  }

  ngOnInit() {
    this.onSelectedCollectionChangeSubscription = this.valuesService.onSelectedCollectionChange.subscribe(() => {
      this.nextValue();
    });
  }
  ngOnDestroy() {
    this.onSelectedCollectionChangeSubscription?.unsubscribe();
  }

  public get actualSpaceToSubmit():boolean {
    return this.spaceToSubmit && this.valuesService.allowSpaceToSubmit();
  }

  public nextValue():void {
    this.currentValue = this.valuesService.getRandomValue();
    
    this.reset();
  }
  
  @HostListener('document:keydown.control.r', ['$event'])
  nextValueKey($event:KeyboardEvent):void {
    $event.preventDefault();

    this.nextValue();
  }

  public submitAnswer():void {
    if (this.currentValueAnswer === '') {
      return;
    }

    if (this.currentValueAnswer === this.currentValue?.answer) {
      this.correctAnswer();
    } else {
      this.incorrectAnswer();
    }
  }

  public correctAnswer():void {
    this.valuesService.updateWpm(this.currentValueAnswer.length, this.getTime(), this.backendService);

    this.nextValue();
  }

  public incorrectAnswer():void {
    this.reset(false);

    this.renderer.addClass(document.body, 'shake');
    setTimeout(() => {
      this.renderer.removeClass(document.body, 'shake');
    }, 500);
  }

  public reset(resetIsViewingAnswer=true):void {
    this.stopStopwatch();
    this.currentValueAnswer = '';
    if (resetIsViewingAnswer)
      this.isViewingAnswer = false;
  }

  @HostListener('document:keydown.enter') 
  public onEnterKeydown():void {
    this.submitAnswer();
  }

  public onInputChange():void {
    if (!this.stopwatchRunning) {
      this.startStopwatch();
    }

    if (this.currentValueAnswer === '') {
      this.reset(false);
      return;
    }

    if (this.currentValueAnswer.endsWith(' ') && this.actualSpaceToSubmit) {
      this.currentValueAnswer = this.currentValueAnswer.trimEnd();
      this.submitAnswer();
    }
  }

  startStopwatch(): void {
    if (!this.stopwatchRunning) {
      this.stopwatchRunning = true;
      this.startTime = performance.now() - this.elapsedTime;
      this.updateStopwatch();
    }
  }

  stopStopwatch(): void {
    if (this.stopwatchRunning) {
      this.stopwatchRunning = false;
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.elapsedTime = 0;
  }

  private updateStopwatch(): void {
    this.elapsedTime = performance.now() - this.startTime;
    if (this.stopwatchRunning) {
      this.animationFrameId = requestAnimationFrame(() => this.updateStopwatch());
    }
  }

  getTime():number {
    return performance.now() - this.startTime;
  }

  getDynamicWpm():string {
    const wpm:number = this.valuesService.getWpm(this.currentValueAnswer.length, this.getTime());
    return wpm.toFixed(0);
  }
  getAvgWpm():string|undefined {
    return this.valuesService.selectedCollection.avgWpm?.toFixed(0);
  }
  getBestWpm():string|undefined {
    return this.valuesService.selectedCollection.bestWpm?.toFixed(0);
  }
  getWordsCorrect():string|undefined {
    return this.valuesService.selectedCollection.wordsCorrect?.toString();
  }

  resetHistory():void {
    this.valuesService.resetHistory(this.backendService);
  }

  @HostListener('document:keydown.control.h', ['$event'])
  toggleViewAnswerKey($event:KeyboardEvent):void {
    $event.preventDefault();

    this.toggleViewAnswer();
  }

  toggleViewAnswer():void {
    this.isViewingAnswer = !this.isViewingAnswer;
  }

  @HostListener('document:keydown.control.space', ['$event'])
  toggleSpaceToSubmitKey($event:KeyboardEvent):void {
    $event.preventDefault();

    this.spaceToSubmit = !this.spaceToSubmit;
  }
}
