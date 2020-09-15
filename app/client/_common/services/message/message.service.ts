
import { Message } from './message.model';
import { OnDestroy, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MessageService implements OnDestroy {
    private subject: Record<string, Subject<any>>;

    constructor() {
        this.subject = {};
    }

    ngOnDestroy() {
        for (let key in this.subject) {
            this.subject[key].unsubscribe();
        }
    }

    public sendMessage<T extends Message>(message: T): boolean {
        if (this.subject[ message.id() ]) {
            this.subject[ message.id() ].next(message);
            return true;
        }
        return false;
    }

    public getSubject<T extends Message>(id: string): Subject<T> {
        if (!this.subject[id]) {
            this.subject[id] = new Subject<T>();
        }
        return this.subject[ id ];
    }
}
