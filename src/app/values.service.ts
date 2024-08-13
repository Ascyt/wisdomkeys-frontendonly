import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export interface Collection {
    id: number;
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
        if (!this.loadCollections()) {
            this.changeSelectedCollection(this.addEmptyCollection());
            this.saveCollections();
        }
    }

    public onSelectedCollectionChange = this.onSelectedCollectionChangeSource.asObservable();

    public saveCollections(): void {
        localStorage.setItem("collections", JSON.stringify(this.collections));
    }
    public loadCollections(): boolean {
        const collectionsString = localStorage.getItem("collections");
        if (collectionsString !== null) {
            this.collections = JSON.parse(collectionsString);
        }

        return this.collections.length > 0;
    }

    public changeSelectedCollection(collection:Collection): void {
        if (collection.id === undefined) {
            throw new Error("Collection must have an id");
        }

        this.selectedCollectionId = collection.id;
        this.onSelectedCollectionChangeSource.next();
    }

    public addEmptyCollection():Collection {
        const newCollection:Collection = {
            name: `Collection ${this.collections.length + 1}`, 
            values: [this.getNewValue()],
            wordsCorrect: 0,
            avgWpm: undefined,
            bestWpm: undefined,
            id: this.collections.length
        };

        this.collections.push(newCollection);

        this.saveCollections();

        return newCollection;
    }

    public removeCollection(collection: Collection): void {
        this.collections = this.collections.filter(c => c !== collection);
        if (this.selectedCollectionId === collection.id) {
            this.selectedCollectionId = this.collections[0].id!;
        }

        this.saveCollections();
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
    
    public updateWpm(answerLength:number, elapsedTime:number):void {
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

        this.saveCollections();
    }
    
    public resetHistory():void {
        this.selectedCollection.wordsCorrect = 0;
        this.selectedCollection.avgWpm = 0;
        this.selectedCollection.bestWpm = 0;

        this.saveCollections();
    }
}