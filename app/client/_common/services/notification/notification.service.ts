
import { Notification } from './notification.model';
import { MessageService } from '_common/services/message/message.service';
import { Injectable } from '@angular/core';
import { notify } from 'jquery';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    constructor(private messageService: MessageService) {
        this.messageService.getSubject<Notification>("Notification").subscribe(this.showNotify);
    }

    public showNotify(msg: Notification) {
        notify(msg.options, msg.settings);
    }
}
