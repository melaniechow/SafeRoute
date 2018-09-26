import { NgModule, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputDirectionComponent } from './input-direction/input-direction.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {AgmCoreModule} from '@agm/core';
import { environment } from '../../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { ShowMapComponent } from './show-map/show-map.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  declarations: [InputDirectionComponent,ShowMapComponent],
  exports:[InputDirectionComponent,ShowMapComponent]
})
export class SearchRouteModule { }
