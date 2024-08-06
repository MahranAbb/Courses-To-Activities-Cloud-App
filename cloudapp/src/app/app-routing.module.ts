import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { SettingsComponent, SettingsGuard } from './settings/settings.component';
import { LoaderResultComponent, LoaderResultGuard } from './loader-result/loader-result.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'loaderResult', component: LoaderResultComponent, canActivate: [LoaderResultGuard] },
  { path: 'settings', component: SettingsComponent, canDeactivate: [SettingsGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
