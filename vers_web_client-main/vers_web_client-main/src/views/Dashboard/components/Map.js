import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, LayersControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import locationImage from "../location.png";

const customIcon = L.icon({
  iconUrl: locationImage,
  iconSize: [40, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const MapInfo = (props) => {
  const { data = [] } = props;

  const locations = useMemo(() => {
    return data.map((item) => {
      return {
        ...item,
        position: [item.location?.latitude, item.location?.longitude],
      };
    });
  }, [data]);

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
    >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Standard">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="CyclOSM">
            <TileLayer
              url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.cyclosm.org">CyclOSM</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Cycle Map">
            <TileLayer
              url="https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=d9b3454960b544f4810c453a2c73c07e"
              attribution='&copy; <a href="https://www.thunderforest.com/maps/cycle-map/">Thunderforest</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Transport Map">
            <TileLayer
              url="https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=d9b3454960b544f4810c453a2c73c07e"
              attribution='&copy; <a href="https://www.thunderforest.com/maps/transport-map/">Thunderforest</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OpenTopoMap">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='Map data: &copy; <a href="https://www.opentopomap.org">OpenTopoMap</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Humanitarian">
            <TileLayer
              url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.hotosm.org">Humanitarian OSM Team</a> contributors'
            />
          </LayersControl.BaseLayer>
        </LayersControl>

      {locations?.map((location) => (
        <Marker
          key={location?._id}
          position={location?.position}
          icon={customIcon}
        >
          <Tooltip>
            <p>{location?.name}</p>
            <p>{location?.mobile}</p>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapInfo;
