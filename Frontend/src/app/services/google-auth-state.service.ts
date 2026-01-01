import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GoogleAuthStateService {
    private googleDataSubject = new BehaviorSubject<{ googleUser: any; googleToken: string } | null>(null);

    // Observable that components can subscribe to
    googleData$ = this.googleDataSubject.asObservable();

    setGoogleData(data: { googleUser: any; googleToken: string }) {
        this.googleDataSubject.next(data);
    }

    getGoogleData() {
        return this.googleDataSubject.getValue();
    }

    clearGoogleData() {
        this.googleDataSubject.next(null);
    }

    hasGoogleData(): boolean {
        return this.googleDataSubject.getValue() !== null;
    }
}
