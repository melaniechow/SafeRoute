import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http';
import { environment } from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MapService {
  start=environment.start;

  constructor(
    private http: HttpClient
  ) { }

  findPlaceFromText(text){
    var arrTxt = text.split(" ");
    var text=arrTxt.join("-");
    return this.http.get(this.start+`api/getPlaceFromText/${text}`);
  }

  /*
  getClusterData(){
    return this.http.get('https://data.cityofnewyork.us/resource/7x9x-zpz6.json');
  }
  */

  getCrimes(originObj,destObj){
    return this.http.post(this.start+`api/getCrimes`,{origin:originObj,destination:destObj});
  }

  getCrimesOnRoute(routeResults, ft, indoorInc){
    var onlypoly=routeResults.map(route=>{
      return {'overview_polyline': route['overview_polyline']}
    })
    return this.http.post(this.start+'api/getCrimesOnRoute',{routeResults:onlypoly, ft:ft, indoor: indoorInc});
  }


}
