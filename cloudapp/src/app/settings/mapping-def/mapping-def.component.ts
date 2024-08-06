import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'eca-components';
import { ConfigService } from '../../services/config.service';
import { ConfTable } from '../../models/confTables';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-settings-mapping-def',
  templateUrl: './mapping-def.component.html',
  styleUrls: ['./mapping-def.component.scss'],
})
export class MappingDefComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() esploroActivityTypes: ConfTable.Code[];  
  @Input() esploroActivityRolesMapping: ConfTable.Mapping[];  
  @Input() activityRoles: ConfTable.Code[];
  @Input() processingUnitToOrgUnitMapping: ConfTable.Mapping[];
  @Input() courseTerms: ConfTable.Code[];
  @Output() onDelete = new EventEmitter();
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  anyRow: ConfTable.Code = {
    code: "any",
    description: "Any"
  };
  courseStatus: { id: string, name: string }[] = [{id: "ALL", name : "All"},
  {id: "ACTIVE", name : "Active"},{id: "INACTIVE", name : "Inactive"}];
  selectedcourseTerm= "";

  constructor(
    private translate: TranslateService,
    private dialog: DialogService,
    private configService: ConfigService
  ) { }

  ngOnInit() {  
    this.selectedcourseTerm = this.form.controls.courseTerm.value;
    console.log(this.courseTerms);
  }

  removeField(index: number) {
    this.dialog.confirm('Settings.ServiceDef.RemoveField')
    .subscribe( result => {
      if (!result) return;
      this.fields.removeAt(index);
      this.form.updateValueAndValidity();
      this.form.markAsDirty();
    });
  }

  addChip(event: MatChipInputEvent, field: FormControl) {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      field.value.push(value.trim());
      field.markAsDirty();
    }
    if (input) {
      input.value = '';
    }
  }

  removeChip(field: FormControl, val: string) {
    const index = field.value.indexOf(val);

    if (index >= 0) {
      field.value.splice(index, 1);
      field.markAsDirty();
    }
  }

  deleteService() {
    this.onDelete.emit();
  }

  /* Accessors */
  get fields() {
    return this.form.get('fields') as FormArray;
  }

  compareCourseTerm(a: String, b: String): boolean {
    return a === b;
  }

  onCourseTermSelected(event: MatSelectChange) {
    this.selectedcourseTerm = event.source.value;
  }

}