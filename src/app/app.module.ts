import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { CountCriteriaForm } from './components/count-criteria-form.component';
import { ListCriteriaForm } from './components/list-criteria-form.component';
import { ResultsTable } from './components/results-table.component';

import { EmitterService } from './services/emitter.service';
import { CriteriaService } from './services/criteria.service';
import { HarnessApiService } from './services/harness-api.service';

@NgModule({
  declarations: [
    AppComponent,
    CountCriteriaForm,
    ListCriteriaForm,
    ResultsTable,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    EmitterService,
    CriteriaService,
    HarnessApiService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
