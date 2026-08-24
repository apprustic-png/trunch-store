'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

interface LeafletMapInnerProps {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
}

function MapClickHandler({ setPosition }: { setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function LeafletMapInner({ position, setPosition }: LeafletMapInnerProps) {
  const mapProps: any = {
    center: position,
    zoom: 13,
    scrollWheelZoom: false,
    style: { width: '100%', height: '100%' },
  };

  const tileProps: any = {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  const markerProps: any = {
    position,
  };

  return (
    <MapContainer {...mapProps}>
      <TileLayer {...tileProps} />
      <Marker {...markerProps} />
      <MapClickHandler setPosition={setPosition} />
    </MapContainer>
  );
}
