import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule, CloudAppTranslateModule, AlertModule } from '@exlibris/exl-cloudapp-angular-lib';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './main/main.component';
import { SelectSetComponent } from './select-set/select-set.component';
import { SettingsComponent } from './settings/settings.component';
import { MappingDefComponent } from './settings/mapping-def/mapping-def.component';
import { AppDialogModule } from './app-dialogs.module';
import { LoaderResultComponent } from './loader-result/loader-result.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    SelectSetComponent,
    SettingsComponent,
    MappingDefComponent,
    LoaderResultComponent
  ],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    AlertModule,
    FormsModule,
    ReactiveFormsModule,     
    CloudAppTranslateModule.forRoot(),
    AppDialogModule,
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'standard' } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
