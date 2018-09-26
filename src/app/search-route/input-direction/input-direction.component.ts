import { Component, OnInit, ViewChild } from '@angular/core';
import {NgForm} from '@angular/forms';
import { MapService } from '../../map.service';
//import { } from "@types/googlemaps";

@Component({
  selector: 'app-input-direction',
  templateUrl: './input-direction.component.html',
  styleUrls: ['./input-direction.component.css']
})
export class InputDirectionComponent implements OnInit {
  startLoc:string
  endLoc:string;
  travelType:string;
  crimeDist:number;
  indoor:boolean;

  origin={address:'',lat:null,lng:null}
  destination={address:'',lat:null,lng:null}

  constructor(
    private service: MapService
  ) { }

  ngOnInit() {
  }

  onSubmit(form:NgForm){
    this.resetEndLoc();
    this.resetStartLoc();
    this.travelType=form.value['travelType'];
    this.crimeDist=parseInt(form.value['crimeDist']);
    var indoorInclude = form.value['crimeLocIn'];
    if (indoorInclude == 't'){
      this.indoor=true;
    }
    else {
      this.indoor=false;
    }
    console.log(form.value);

    let start=form.value['startLoc'];
    let end=form.value['endLoc'];
    
    //find origin lat long
    this.service.findPlaceFromText(start).subscribe((start)=>{
      if (start['status']==200){
        this.origin=start['retObj'];
        //find dest lat long
        this.service.findPlaceFromText(end).subscribe((end)=>{
          if (end['status']==200){
            this.destination=end['retObj'];
          }
        });
      }
    });
  }

  resetStartLoc(){
    this.origin={address:'',lat:null,lng:null}
  }

  resetEndLoc(){
    this.destination={address:'',lat:null,lng:null}
  }

}
