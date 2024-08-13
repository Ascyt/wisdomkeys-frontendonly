import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { BackendService } from "./backend.service";

export interface Collection {
    id?: number;
    name: string;
    values: Value[];
    wordsCorrect:number;
    avgWpm:number|undefined;
    bestWpm:number|undefined;
}

export interface Value { 
    question: string;
    answer: string;
}

@Injectable({
    providedIn: "root"
})

export class ValuesService {
    public collections: Collection[] = [];
    public selectedCollectionId: number = -1;

    public get selectedCollection():Collection {
        return this.collections.find(c => c.id === this.selectedCollectionId) || this.collections[0];
    }

    private onSelectedCollectionChangeSource = new Subject<void>();

    constructor() {
        this.changeSelectedCollection(this.addEmptyCollection(undefined));
    }

    public onSelectedCollectionChange = this.onSelectedCollectionChangeSource.asObservable();

    public changeSelectedCollection(collection:Collection): void {
        if (collection.id === undefined) {
            throw new Error("Collection must have an id");
        }

        this.selectedCollectionId = collection.id;
        this.onSelectedCollectionChangeSource.next();
    }

    public addEmptyCollection(backendService:BackendService|undefined):Collection {
        const newCollection:Collection = {
            name: `Collection ${this.collections.length + 1}`, 
            values: [this.getNewValue()],
            wordsCorrect: 0,
            avgWpm: undefined,
            bestWpm: undefined
        };

        if (backendService === undefined || !backendService.isLoggedIn) {
            newCollection.id = this.collections.length;
        }
        else {
            backendService.addCollection(newCollection);
        }

        this.collections.push(newCollection);
        return newCollection;
    }

    public removeCollection(collection: Collection, backendService:BackendService): void {
        this.collections = this.collections.filter(c => c !== collection);
        if (this.selectedCollectionId === collection.id) {
            this.selectedCollectionId = this.collections[0].id!;
        }

        backendService.removeCollection(collection);
    }

    public getNewValue(): Value {
        return {question: "", answer:""};
    }

    public getRandomValue(): Value {
        const value = this.selectedCollection.values[Math.floor(Math.random() * (this.selectedCollection.values.length - 1))];
        console.log(value);
        console.log(this.selectedCollection.values)
        return value;
    }

    public allowSpaceToSubmit(): boolean {
        // No answers can contain spaces
        for (const value of this.selectedCollection.values) {
            if (value.answer.includes(" ")) {
                return false;
            }
        }
        return true;
    }

    public getWpm(answerLength:number, elapsedTime:number):number {
        // Assuming 5 characters per word
        const words = answerLength / 5;
        const minutes = elapsedTime / 60000;
        return words / minutes;
      }
    
    public updateWpm(answerLength:number, elapsedTime:number, backendService:BackendService):void {
        let wpm:number = this.getWpm(answerLength, elapsedTime);

        if (this.selectedCollection.avgWpm === undefined) {
            this.selectedCollection.avgWpm = 0;
        }
        if (this.selectedCollection.bestWpm === undefined) {
            this.selectedCollection.bestWpm = 0;
        }
    
        this.selectedCollection.avgWpm = (this.selectedCollection.avgWpm * this.selectedCollection.wordsCorrect + wpm) / (this.selectedCollection.wordsCorrect + 1);
        this.selectedCollection.wordsCorrect++;
        if (wpm > this.selectedCollection.bestWpm) {
        this.selectedCollection.bestWpm = wpm;
        }

        backendService.updateCollection(this.selectedCollection);
    }
    
    public resetHistory(backendService:BackendService):void {
        this.selectedCollection.wordsCorrect = 0;
        this.selectedCollection.avgWpm = 0;
        this.selectedCollection.bestWpm = 0;

        backendService.updateCollection(this.selectedCollection);
    }
}