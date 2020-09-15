
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService, LocalStorageService } from '../../_common/index';
import { NotificationService } from '_common/services/notification/notification.service';
import { Notification } from '_common/services/notification/notification.model';

@Component({
    templateUrl: 'login.component.html'
})

export class LoginComponent
{
    model: any = { username: '', password: '' };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private httpService: HttpService,
        private notificationService: NotificationService,
        private localStorageService: LocalStorageService) {}

    login ()
    {
      if ((<any>this).rootParent) (<any>this).rootParent.setLoading(true);

      this.httpService.post('/service/login',{
          login: this.model.username,
          password: this.model.password
      }, false).subscribe(
          (data: any) => {
              if (data.type)
              {
                if (data.data.isAdmin) {
                  this.localStorageService.set('IS_ADMIN', data.data.isAdmin);
                }
                this.localStorageService.set('MOJI_TOKEN', data.data.token);
                this.router.navigate(['/moji']);
              }
              else
              {
                this.notificationService.showNotify(new Notification("Wrong username/email or password", "danger"));
              }
              if ((<any>this).rootParent) (<any>this).rootParent.setLoading(false);
          },
          error => {
              this.notificationService.showNotify(new Notification(error.message, "danger"));

              if ((<any>this).rootParent) (<any>this).rootParent.setLoading(false);
          }
      );
    }
}
