import { Component, OnInit,ViewChild, Input } from '@angular/core';
import {} from '@types/googlemaps';
import {NgForm} from '@angular/forms'
import { MapService } from '../../map.service';

declare var MarkerClusterer;


@Component({
  selector: 'app-show-map',
  templateUrl: './show-map.component.html',
  styleUrls: ['./show-map.component.css']
})
export class ShowMapComponent implements OnInit {
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  directionsService;
  directionsDisplay;
  heatMap;
  
  routeResults:object={};
  routeArr:object[]=[];


  displayRoutes:boolean=false;
  displayDirections:boolean=false;
  chosenRoute:object;

  @Input() origin : object;
  @Input() destination : object;
  @Input() travelType : string;
  @Input() crimeDist : number;
  @Input() indoor: boolean;

  constructor(
    private mapService: MapService
  ) { }

  ngOnInit() {
    //this.initMap();

    this.routeResults=null;
    this.routeArr=[];
    
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    let lat=this.origin['lat'];
    let lng=this.origin['lng'];
    var mapProp = {

      center: new google.maps.LatLng(lat, lng),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

    //LOAD CRIMES
    this.mapService.getCrimes(this.origin,this.destination).subscribe((ret)=>{
      var heatmapData=ret['crimes'].map(x=>{
        var weight=1;
        if (x['LAW_CAT_CD'] == 'VIOLATION'){
          weight=1;
        }
        if (x['LAW_CAT_CD'] == 'MISDEMEANOR'){
          weight=3;
        }
        if (x['LAW_CAT_CD'] == 'FELONY'){
          weight=5;
        }
        return {location: new google.maps.LatLng(x['Latitude'], x['Longitude']), weight: weight};
      });
      this.heatMap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData
      });
      this.heatMap.setMap(this.map);
    })

    //let layer=new google.maps.BicyclingLayer();
    //this.onChangeLayer(this.travelType);
    this.directionsDisplay.setMap(this.map);
    var request = {
      origin: this.origin['address'],
      destination: this.destination['address'],
      travelMode: this.travelType,
      provideRouteAlternatives: true,
      region:'NY'
    };
    this.onChangeLayer(this.travelType);
    let res;
    //get routes
    this.directionsService.route(request, (result, status) => {
      console.log(status);
      if (status == google.maps.DirectionsStatus.OK) {
        console.log(result);
        this.routeArr=result['routes'];
        this.mapService.getCrimesOnRoute(this.routeArr,this.crimeDist,this.indoor).subscribe((ret)=>{
          if (ret['status']==200){
            //create marker maps
            var crimeRouteArr=this.processRouteArr(ret['newRoute'],this.map);
            
            //attach crimes & marker maps to each route in route arr
            var routeLen=this.routeArr.length;
            for (var i = 0; i< routeLen; i++){
              if (this.routeArr[i]['overview_polyline'] == crimeRouteArr[i]['overview_polyline']){
                this.routeArr[i]['crimes']=crimeRouteArr[i]['crimes'];
                this.routeArr[i]['ss']=crimeRouteArr[i]['ss'];
                this.routeArr[i]['markers']=crimeRouteArr[i]['markers'];
              }
            }
            //sort routes by ss
            this.routeArr.sort(this.compareSS);

            //set result routes to new processed routeArr
            result['routes']=this.routeArr;

            //set markerts
            this.routeArr[0]['markers'].map(marker=>{
              marker.setMap(this.map);
            })
          }
          this.routeResults=result;
          //chosen route to display is the first route
          this.chosenRoute=this.routeArr[0];
          this.directionsDisplay.setDirections(this.routeResults) 
        })
      }
    })
  }

  compareSS(a,b) {
    if (a.ss < b.ss)
      return -1;
    if (a.ss > b.ss)
      return 1;
    return 0;
}
    //traffic/
    //var trafficLayer = new google.maps.TrafficLayer();
    //trafficLayer.setMap(this.map);
    //this.getRoutes(this.origin,this.destination)

  //add marker maps to each route in a routeArr
  processRouteArr(routeArr,mapG){
    var len=routeArr.length;
    for (var i = 0; i < len ; i++){
        //create markers
        routeArr[i]['markers'] = routeArr[i]['crimes'].map(crime=>{
          var label = '';
          var icon=null;
          if (crime['LAW_CAT_CD']=='VIOLATION'){
            label = 'V'
            icon='../../../assets/markers/yellow_MarkerV.png'
          }
          if (crime['LAW_CAT_CD']=='MISDEMEANOR'){
            label = 'M'
            icon='../../../assets/markers/orange_MarkerM.png'
          }
          if (crime['LAW_CAT_CD']=='FELONY'){
            label = 'F'
            icon='../../../assets/markers/red_MarkerF.png'
          }
          //var myLatlng = new google.maps.LatLng(parseInt(crime['Latitude']),parseInt(crime['Longitude']));
          //marker
          var pos={lat: crime['Latitude'], lng: crime['Longitude']};
          var marker = new google.maps.Marker({
            position: pos,
            title: crime['OFNS_DESC'],
            icon:icon
          });
          //infowindow
          var infoWin = new google.maps.InfoWindow();
          google.maps.event.addListener(marker, 'click', function(evt) {
            infoWin.setContent(`<html> <b>${crime['OFNS_DESC']}</b> <i>${crime['LOC_OF_OCCUR_DESC']}</i><br>Date: ${crime['CMPLNT_FR_DT']}<br>Time: ${crime['CMPLNT_FR_TM']}<br>#: ${crime['CMPLNT_NUM']}</html>`);
            infoWin.open(mapG, marker);
          })
          return marker;
        });
    }
    return routeArr;
  }

  onChangeLayer(type){
    let layer;
    if (type == 'DRIVING'){
      let layer=new google.maps.TrafficLayer();
      layer.setMap(this.map);
    }
    if (type == 'TRANSIT'){
      let layer=new google.maps.TransitLayer();
      layer.setMap(this.map);
    }
    if (type == 'BICYCLING'){
      let layer=new google.maps.BicyclingLayer();
      layer.setMap(this.map);
    }
  }

  //for some reason this displays route lol
  changeTo(str){
    let len=this.routeArr.length;
    for (let i =0; i< len; i++){
      if (this.routeArr[i]['summary'] == str){
        //remove markers
        this.chosenRoute['markers'].map(marker=>{
          marker.setMap(null);
        })
        //display markers
        this.routeArr[i]['markers'].map(marker=>{
          marker.setMap(this.map);
        })
        //display route
        this.routeResults['routes']=[this.routeArr[i]];
        this.chosenRoute=this.routeArr[i];
        this.directionsDisplay.setDirections(this.routeResults);
      }
    }

    console.log(this.routeArr);
    console.log(this.routeResults);
    
  }

  onDisplayDirections(){
    this.displayDirections=true;
    console.log(this.displayDirections);
  }

  onDisplayRoute(){
    this.displayRoutes=!this.displayRoutes;
    console.log(this.displayRoutes);
  }

}
