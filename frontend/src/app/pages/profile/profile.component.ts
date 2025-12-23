import {Component} from '@angular/core';import {FormsModule} from '@angular/forms';
@Component({standalone:true,imports:[FormsModule],selector:'app-profile',template:`<input [(ngModel)]='name'><button>Save</button>`})
export class ProfileComponent{ name=''; }