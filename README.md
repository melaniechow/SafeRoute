# SafeRouteApp
SafeRoute uses public, open source crime data from NY to calculate the safest route to and from any destination in NYC. 

## Comments : 
Feel free to view the demo video.

## Updates:
Update: This project began at a hackathon (ByteHacks2018), and I decided to continue this project by furthering its functionality, and completing tasks we wish we had done during the hackathon. 

## Features:

### Safety Score Calculation
The application determines a safety score for each route based on the number and type of crime (violation, misdemeanor, felony) along the path. It does this by decoding Google Map polyline routes into a series of latitude and longitude points and then checking if there is are any reported crimes within a user-specified radius. (100ft, 200ft, 350ft, 500ft). 

Violation  - worth 1 point
Misdemeanor - worth 2 points
Felony - worth 3 points

** The lower the safety score, the safer the route appears **

### Marker Maps
The application generates markers based on crime information. Simply click on a marker to view more information, such as the official crime description and id, as well as the date, time, and location (inside/outside) the crime took place.

Violation  - yellow marker with 'V' label to indicate mild danger
Misdemeanor - orange marker with 'M' label to indicate intermediate danger
Felony - red marker with 'F' label to indicate more pertinent danger

### Heat Map
Generates a heat map based on the start and end points, as well as the distance between them, to find and display nearby crime and locate crime "hotspots." Scales to the distance between the start and end points.
(Eg. if start and end point are 10 degrees apart, heat map finds crime that is within 10 degrees of the start and end coordinates, as well as crime within the start and end latitude and longitude bounds.)

### Cluster Map
Generates a‘cluster map’ that groups nearby crime and displays themwith markers using the Google Maps API at a separate tab. The main site offers information about a crime with each marker, while the marker cluster map is meant for grouping and displaying crime in "big picture."

## Next Steps:
### UI :
Add a Loading screen. Markers could have better icons
### Error Handling:
Since data is not sensitive, error handling was not a priority when completing features. However, this would be a nice fix.
### Customization:
+ Different map types (satellite, street, etc)
+ Favorite routes
+ Customize weightings
+ Wider radius range for Crime Within
