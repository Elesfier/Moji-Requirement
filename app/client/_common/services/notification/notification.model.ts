
import { Message } from '_common/services/message/Message.model';
import 'bootstrap-notify';

export class Notification extends Message {
    public options: NotifyOptions = { message: "" };
    public settings: NotifySettings = { type: "info", placement: { align: 'center' } };

    constructor(message: string, type: string = 'info') {
        super();
        this.options.message = message;
        this.settings.type = type;
    }

    public what(): string {
        return "This is notification with message: " + this.options.message;
    }

    public id(): string {
        return "Notification";
    }
}
