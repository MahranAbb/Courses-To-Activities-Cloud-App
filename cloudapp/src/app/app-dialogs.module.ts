import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@exlibris/exl-cloudapp-angular-lib";
import { TranslateModule } from "@ngx-translate/core";
import { DialogModule } from 'eca-components';
import { AddMappingDialog } from "./settings/add-mapping-dialog.component";

@NgModule({
  imports: [
    DialogModule,
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  declarations: [ AddMappingDialog ],
  entryComponents: [ AddMappingDialog ],
})
export class AppDialogModule { }