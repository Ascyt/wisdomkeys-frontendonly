import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Collection, Value, ValuesService } from "./values.service";

interface FormattedCollection {
    collectionname: string;
    avgspeed: number|undefined;
    bestspeed: number|undefined;
    wordamount: number;
    userid: number;
    entries?: FormattedValue[];
}
interface FormattedValue {
    word: string;
    answer: string;
}

@Injectable({
    providedIn: "root"
})

export class BackendService {
    private apiUrl = 'http://localhost:3000/api/';

    public username:string|null;
    private password:string|null;
    public userId:number|null;
    public isLoggedIn:boolean = false;

    constructor(private httpClient:HttpClient, private valuesService:ValuesService) {
        this.username = localStorage.getItem('username');
        this.password = localStorage.getItem('password');
        this.userId = Number(localStorage.getItem('userId'));

        if (this.username !== null && this.password !== null) {
            this.login(this.username, this.password);
        }
    }

    signup(username: string, password: string): Promise<any> {
        const body = { username, password };
    
        return new Promise<any>((resolve, reject) => {
            this.httpClient.post<any>(this.apiUrl + "users/register", body).subscribe({
                next: (response) => {
                    console.log('Signup successful', response);

                    this.username = username;
                    this.password = password;
                    this.isLoggedIn = true;

                    localStorage.setItem('username', username);
                    localStorage.setItem('password', password);

                    for (let collection of this.valuesService.collections) {
                        this.addCollection(collection);
                    }

                    resolve(response);
                },
                error: (error) => {
                    console.error('Signup failed', error);
                    reject(error);
                }
            });
        });
    }

    login(username: string, password: string): Promise<any> {
        const body = { username, password };
    
        return new Promise<any>((resolve, reject) => {
            this.httpClient.post<any>(this.apiUrl + "auth/login", body).subscribe({
                next: (response) => {
                    console.log('Login successful', response);

                    this.username = response._username;
                    this.password = response._password;
                    this.userId = response._userId;
                    this.isLoggedIn = true;

                    localStorage.setItem('username', username);
                    localStorage.setItem('password', password);

                    this.loadCollections()!.then(() => {
                        this.valuesService.changeSelectedCollection(this.valuesService.collections[0]);
                    });

                    resolve(response);
                },
                error: (error) => {
                    console.error('Login failed', error);
                    reject(error);
                }
            });
        });
    }

    loadCollections(): Promise<any>|void {
        if (!this.isLoggedIn) {
            return;
        }

        return new Promise<any>((resolve, reject) => {
            this.httpClient.get<any>(this.apiUrl + "collections/getAll/" + this.userId).subscribe({
                next: (response) => {
                    this.valuesService.collections = [];

                    const collections:any[] = response;
                    
                    for (let i = 0; i < collections.length; i++) {
                        const frontendFormattedCollection:Collection = {
                            id: collections[i]._collectionId,
                            name: collections[i]._collectionName,
                            values: this.formatValuesFrontend(collections[i]._entries),
                            wordsCorrect: collections[i]._wordamount,
                            avgWpm: collections[i]._avgSpeed,
                            bestWpm: collections[i]._bestSpeed
                        };

                        frontendFormattedCollection.values.push(this.valuesService.getNewValue());

                        this.valuesService.collections.push(frontendFormattedCollection);
                        this.valuesService.changeSelectedCollection(frontendFormattedCollection);
                    }
                    console.log('Collections loaded', this.valuesService.collections);
                    resolve(response);
                },
                error: (error) => {
                    console.error('Values loading failed', error);
                    reject(error);
                }
            });
        });
    }
    formatValuesFrontend(values:any[]): Value[] {
        const formattedValues:Value[] = [];

        for (let i = 0; i < values.length; i++) {
            const formattedValue:Value = {
                question: values[i]._word,
                answer: values[i]._answer
            };
            formattedValues.push(formattedValue);
        }

        return formattedValues;
    }
    formatValues(values:Value[]):FormattedValue[] {
        const formattedValues:FormattedValue[] = [];

        for (let i = 0; i < values.length; i++) {
            const formattedValue:FormattedValue = {
                word: values[i].question,
                answer: values[i].answer
            };
            formattedValues.push(formattedValue);
        }

        return formattedValues;
    }

    formatCollection(collection:Collection):FormattedCollection {
        // Remove the last value, which is always empty, to a new array to not modify the original.
        const values = collection.values.slice(0, collection.values.length - 1);

        if (this.userId === null) {
            throw new Error('User ID not set');
        }

        return {
            "collectionname": collection.name,
            "entries": this.formatValues(values),
            "avgspeed": collection.avgWpm,
            "bestspeed": collection.bestWpm,
            "wordamount": collection.wordsCorrect,
            "userid": this.userId
        }
    }

    addCollection(collection:Collection): Promise<any>|void {
        if (!this.isLoggedIn)
            return;

        const formattedCollection = this.formatCollection(collection);

        return new Promise<any>((resolve, reject) => {
            this.httpClient.post<any>(this.apiUrl + "collections", formattedCollection).subscribe({
                next: (response) => {
                    console.log('Collection added', response);

                    this.loadCollections();

                    resolve(response);
                },
                error: (error) => {
                    console.error('Collection adding failed', error);
                    reject(error);
                }
            });
        });
    }
    updateCollection(collection:Collection): Promise<any>|void {
        if (!this.isLoggedIn)
            return;

        const formattedCollection = this.formatCollection(collection);

        if (collection.id === undefined) {
            throw new Error('Collection ID not set');
        }

        return new Promise<any>((resolve, reject) => {
            this.httpClient.put<any>(this.apiUrl + "collections/" + collection.id, formattedCollection).subscribe({
                next: (response) => {
                    console.log('Collection updated', response);
                    resolve(response);
                },
                error: (error) => {
                    console.error('Collection updating failed', error);
                    reject(error);
                }
            });
        });
    }
    removeCollection(collection:Collection): Promise<any>|void {
        if (!this.isLoggedIn)
            return;

        if (collection.id === undefined) {
            throw new Error('Collection ID not set');
        }

        return new Promise<any>((resolve, reject) => {
            this.httpClient.delete<any>(this.apiUrl + "collections/" + collection.id).subscribe({
                next: (response) => {
                    console.log('Collection removed', response);
                    resolve(response);
                },
                error: (error) => {
                    console.error('Collection removing failed', error);
                    reject(error);
                }
            });
        });
    }

    logout(): void {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
    }

    deleteAccount(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.httpClient.delete<any>(this.apiUrl + "users/" + this.userId).subscribe({
                next: (response) => {
                    console.log('Account deleted', response);
                    this.logout();
                    resolve(response);
                },
                error: (error) => {
                    console.error('Account deletion failed', error);
                    reject(error);
                }
            });
        });
    }
}