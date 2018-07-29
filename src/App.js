import React from 'react'
import './App.css'
import Menu from './components/Menu'
import * as MapsApiUtilities from './MapsApiUtilities'

class App extends React.Component {
  /**
   * Constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      places: require("./places.json"),
      map: "",
      infowindow: "",
      currentMarker: ""
    };
    this.initMap = this.initMap.bind(this);
    this.openInfoWindow = this.openInfoWindow.bind(this);
    this.closeInfoWindow = this.closeInfoWindow.bind(this);
  }

  componentDidMount() {
    // Add the initMap in a global context so Google Maps can invoke it
    window.initMap = this.initMap;
    // Load the Google Maps Asynchronously
    MapsApiUtilities.loadMapScript();
  }

  /**
   * Initialize the map once the google map script is loaded
   */
  initMap() {
    var self = this;

    var mapview = document.getElementById("map");
    mapview.style.height = window.innerHeight + "px";
    var map = new window.google.maps.Map(mapview, {
      center: { lat:41.8922736, lng:12.4852753 },
      zoom: 13,
      mapTypeControl: false
    });

    var InfoWindow = new window.google.maps.InfoWindow({});

    window.google.maps.event.addListener(InfoWindow, "closeclick", function() {
      self.closeInfoWindow();
    });

    window.google.maps.event.addDomListener(window, "resize", function() {
      var center = map.getCenter();
      window.google.maps.event.trigger(map, "resize");
      self.state.map.setCenter(center);
    });

    window.google.maps.event.addListener(map, "click", function() {
      self.closeInfoWindow();
    });

    var places = [];
    this.state.places.forEach(function(location) {
      var longname = location.name + " - " + location.type;
      var marker = new window.google.maps.Marker({
        position: new window.google.maps.LatLng(
          location.latitude,
          location.longitude
        ),
        animation: window.google.maps.Animation.DROP,
        map: map
      });

      marker.addListener("click", function() {
        self.openInfoWindow(marker);
      });

      location.longname = longname;
      location.marker = marker;
      location.display = true;
      places.push(location);

    });

    this.setState({
      map: map,
      infowindow: InfoWindow,
      places: places
    });

  }

  /**
   * Open the infowindow for the marker
   * @param {object} location marker
   */
  openInfoWindow(marker) {
    this.closeInfoWindow();
    this.state.infowindow.open(this.state.map, marker);
    marker.setAnimation(window.google.maps.Animation.BOUNCE);
    this.setState({
      currentMarker: marker
    });
    this.state.infowindow.setContent("Loading Data...");
    this.state.map.setCenter(marker.getPosition());
    this.state.map.panBy(0, -200);
    //this.getMarkerInfo(marker);
    MapsApiUtilities.getMarkerFoursquareInfo(marker).then(
      (data) => {
        this.state.infowindow.setContent(data);
      }, (error) => {
        this.state.infowindow.setContent("Sorry data can't be loaded");
      }
    )
  }

  /**
   * Close the info window previously opened
   */
  closeInfoWindow() {
    if (this.state.currentMarker) {
      this.state.currentMarker.setAnimation(null);
    }
    this.setState({
      currentMarker: ""
    });
    this.state.infowindow.close();
  }

  /**
   * Render for react
   */
  render() {
    return (
        <div>
            <Menu menuStatus = { true }
                  title = { 'Best pastry shops in Rome'}
                  places = { this.state.places }/>
            <div id="map"></div>
        </div>
    );
  }
}

export default App;
