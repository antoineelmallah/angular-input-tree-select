import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { InputTreeSelectComponent } from './input-tree-select/input-tree-select.component';

@NgModule({
  imports:      [ 
    BrowserModule, 
    FormsModule,
    ReactiveFormsModule,
    MatButtonToggleModule
  ],
  declarations: [ AppComponent, HelloComponent, InputTreeSelectComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
