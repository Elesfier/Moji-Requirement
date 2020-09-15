
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../_common/index';
import { NotificationService } from '_common/services/notification/notification.service';
import { Notification } from '_common/services/notification/notification.model';

@Component({
    templateUrl: 'register.component.html'
})

export class RegisterComponent {

    model: any = {
      username: '',
      email: '',
      firstname: '',
      lastname: '',
      password: ''
    };

    constructor(
      private router: Router,
      private notificationService: NotificationService,
      private httpService: HttpService) {}

    register() {
      if ((<any>this).rootParent) (<any>this).rootParent.setLoading(true);
      this.httpService.post('/service/register', this.model, false).subscribe(
        (data: any) => {
            switch (data.type)
            {
              case 'USER_CREATED':
                this.router.navigate(['/login']);
                this.notificationService.showNotify(new Notification("Account has been successfully created","danger"));
                break;
              case 'USER_EXIST_WITH_USERNAME':
                this.notificationService.showNotify(new Notification("A user with this username already exists","danger"));
                break;
              case 'USER_EXIST_WITH_EMAIL':
                this.notificationService.showNotify(new Notification("A user with this email already exists","danger"));
                break;
              case 'USER_EXIST_WITH_EMAIL_AND_USERNAME':
                this.notificationService.showNotify(new Notification("A user with this email and email already exists","danger"));
                break;
            }
            if ((<any>this).rootParent) (<any>this).rootParent.setLoading(false);
        },
        error => {
          this.notificationService.showNotify(new Notification(error.message,"danger"));
          if ((<any>this).rootParent) (<any>this).rootParent.setLoading(false);
        }
      );
    }
}
