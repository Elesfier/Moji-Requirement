
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  enableProdMode
} from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RootComponent } from './root.component';
import { RootRouting } from './root.routing';

import { LocalStorageService, HttpService } from '../_common/index';

import { LoginComponent, LoginGuard } from './login/index';
import { RegisterComponent } from './register/index';
import { MessageService } from '_common/services/message/message.service';
import { NotificationService } from '_common/services/notification/notification.service';

//[TODO]: when it is ready
//enableProdMode();

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        RootRouting
    ],
    declarations: [
        RootComponent,
        LoginComponent,
        RegisterComponent
    ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    providers: [
        LoginGuard,
        MessageService,
        NotificationService,
        LocalStorageService,
        HttpService
    ],
    bootstrap: [RootComponent]
})

export class RootModule { }
