
import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app',
    templateUrl: 'root.component.html'
})

export class RootComponent
{
  private loading: boolean = true;
  private platformName: string = 'Copyright';
  private copyrightYear: string = '2020';
  private author: string = 'Artur Szajdecki';
  private authorEmail: string = 'artur.szajdecki@gmail.com';

  onActivate ($event)
  {
    $event.rootParent = this;
    this.loading = false;
  }

  setLoading(value: boolean)
  {
    this.loading = value;
  }
}
