import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, FormsModule, CodemirrorModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
