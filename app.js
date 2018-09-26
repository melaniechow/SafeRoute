//Express JS
const express = require('express');
const fs=require('fs');
const csv=require('csv-parser');
const bodyParser=require('body-parser');
const cors=require('cors');
const app=express();
var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyCAOHpGqvNo0M1eRd58Hb2GGJLifR60a3A'
});
const decodePolyline = require('decode-google-map-polyline');


//Config Vars
const PORT = process.env.PORT;


//CORS
var corsOptions={
/*
      origin: 'localhost:4200',
      methods: ['GET','POST','PUT'],
      allowedHeaders: ['Origin','X-Requested-With','contentType','Content-Type','Accept','Authorization'],
      credentials: true,
      optionsSuccessStatus: 200
*/
};

app.use(cors(corsOptions));
  
//Setup Server on Port
app.listen(PORT || 8000,()=>{
    console.log("Server started listening");
});

app.use(bodyParser.json());

var distDir = __dirname + "/dist/SafeRouteApp/";
app.use(express.static(distDir));

//------- API -----------//


app.route('/api/getPlaceFromText/:text').get((req,res)=>{
  let text=req.params['text'];
  var arrTxt = text.split("-");
  var url=arrTxt.join(' ');
  googleMapsClient.geocode({
      address: text + " NY"
    }, function(err, response) {
      if (!err) {
          let googleRes=response.json.results[0];
          let address=googleRes['formatted_address'];
          let lat=googleRes['geometry']['location']['lat'];
          let lng=googleRes['geometry']['location']['lng'];
          res.send({status:200, retObj: {address:address, lat: lat, lng: lng}});
      }
    });
})

function distance(x1,y1,x2,y2){
  return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
}

function getCrimes(lat1, lng1, lat2, lng2, cb){
  var dist=distance(lat1,lng1, lat2,lng2);
  //get crimes that are within the box of the 2 lats and lng
  var crimes = [];
  fs.createReadStream('./data/NY/Crime_Map_.csv')
  .pipe(csv())
  .on('data', function (row) {
      var rowLat=row['Latitude'];
      var rowLng=row['Longitude'];
      if (distance(lat1,lng2,rowLat,rowLng) <= dist ||
          distance(lat2,lng2,rowLat,rowLng) <= dist){
              crimes.push(row);
          }
      }
  )
  .on('end', function () {
      console.log('Data loaded: Found '+ crimes.length + " Crimes")
      cb(null,crimes);
  })
}


app.route('/api/getCrimes').post((req,res)=>{
  var origin=req.body['origin'];
  var dest=req.body['destination'];
  getCrimes(origin['lat'],origin['lng'],dest['lat'],dest['lng'],(err,data)=>{
      res.send({status:200, crimes:data});
  })
})

function degToFeet(deg){
  //1. convert deg to minutes (60 min = 1 deg)
  //2. convert min to nautical miles (1 lat = 1 nm)
  //3. convert nautical mile to statute miles * 1.15 
  //4. mile to feet 1 mile = 5,280 ft
  return deg*60*1.15*5280
}

function feetToDeg(ft){
  return ft/(5280.00*1.15*60)
}

function getCrimesRoute(routeArr,ft,indoorInc,cb){
  //create an array of polyline coordinates
  var routeLen=routeArr.length;
  var latLngArr=[];
  for (var i =0; i< routeLen; i++){
      latLngArr.push(decodePolyline(routeArr[i]['overview_polyline']));
      routeArr[i]['crimes']=[];
      routeArr[i]['ss']=0;
  }

  var dist=feetToDeg(ft);
  console.log(dist);
  //get crimes that are within the box of the 2 lats and lng
  var crimes = [];
  fs.createReadStream('./data/NY/Crime_Map_.csv')
  .pipe(csv())
  .on('data', function (row) {
      var rowLat=parseFloat(row['Latitude']);
      var rowLng=parseFloat(row['Longitude']);
      for (var i =0 ; i< routeLen; i++){
          var polyLen=latLngArr[i].length;
          for (var j = 0; j < polyLen ; j++){
              var distanceCrime=distance (latLngArr[i][j]['lat'],latLngArr[i][j]['lng'],rowLat,rowLng);
              if (distanceCrime <= dist){
              
                  var pass=true;
                  //if not including indoors, do not pass in inside crimes
                  if (!indoorInc){
                      //if item has a location and has "inside" in it
                      if (row['LOC_OF_OCCUR_DESC']){
                          if (row['LOC_OF_OCCUR_DESC'].indexOf('INSIDE') != -1){
                              pass=false;
                          }
                      }
                  }
                  if (pass){
                      
                      row['Latitude']=rowLat;
                      row['Longitude']=rowLng;
                      //console.log(distanceCrime);
                      routeArr[i]['crimes'].push(row);
                      //create safety score
                      var ss=0;
                      if (row['LAW_CAT_CD'] == 'VIOLATION'){
                          ss=1;
                      }
                      if (row['LAW_CAT_CD'] == 'MISDEMEANOR'){
                          ss=2;
                      }
                      if (row['LAW_CAT_CD'] == 'FELONY'){
                          ss=3;
                      }
                      routeArr[i]['ss']+=ss;
                  }
              }
          }
      }
  })
  .on('end', function () {
      console.log("found crimes in routes");
      cb(null,{newRoute:routeArr});
  })
}


app.route('/api/getCrimesOnRoute').post((req,res)=>{
  console.log(req.body);
  getCrimesRoute(req.body['routeResults'],req.body['ft'], req.body['indoor'],(err,ret)=>{
      if (!err){
          var newRoute=ret['newRoute'];
          res.send({status:200, newRoute:ret['newRoute']})
      }
  })
})




/*
app.route('/api/directions').get((req,res)=>{
      //getDir(origin,dest){
      var request = {
          origin: 'Met',
          destination: 'MoMa',
      };
      googleMapsClient.directions(request, function (err, response){
         if (!err){
             res.send(response);
         }
      })
  //}
})
*/