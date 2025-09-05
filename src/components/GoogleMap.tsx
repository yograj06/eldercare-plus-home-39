/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Hospital } from '@/data/bhubaneswar/hospitals';
import { Pharmacy } from '@/data/bhubaneswar/pharmacies';
import { distanceInKm } from '@/lib/geo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Clock } from 'lucide-react';

interface GoogleMapProps {
  apiKey?: string;
  hospitals?: Hospital[];
  pharmacies?: Pharmacy[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  className?: string;
}

export default function GoogleMap({
  apiKey,
  hospitals = [],
  pharmacies = [],
  center = { lat: 20.296, lng: 85.824 },
  zoom = 12,
  onLocationSelect,
  className = "w-full h-96"
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [userApiKey, setUserApiKey] = useState(apiKey || '');
  const [showApiInput, setShowApiInput] = useState(!apiKey);
  const [mapError, setMapError] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!userApiKey || !mapRef.current) return;

    const loader = new Loader({
      apiKey: userApiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    loader.load().then(() => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(userPos);

            // Add user location marker
            new google.maps.Marker({
              position: userPos,
              map,
              title: 'Your Location',
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#ffffff" stroke-width="3"/>
                    <circle cx="12" cy="12" r="3" fill="#ffffff"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(24, 24)
              }
            });
          },
          () => {
            console.log('Geolocation denied, using default center');
          }
        );
      }

      // Add hospital markers
      hospitals.forEach((hospital) => {
        const marker = new google.maps.Marker({
          position: { lat: hospital.lat, lng: hospital.lng },
          map,
          title: hospital.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
                <path d="M12 6v12M6 12h12" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32)
          }
        });

        const distance = userLocation 
          ? distanceInKm(userLocation.lat, userLocation.lng, hospital.lat, hospital.lng)
          : distanceInKm(center.lat, center.lng, hospital.lat, hospital.lng);

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2 max-w-xs">
              <h3 class="font-semibold text-sm">${hospital.name}</h3>
              <p class="text-xs text-gray-600">${hospital.type}</p>
              <p class="text-xs mt-1">${hospital.address}</p>
              <p class="text-xs font-medium mt-1">Distance: ${distance.toFixed(1)} km</p>
              ${hospital.phone ? `<p class="text-xs mt-1">📞 ${hospital.phone}</p>` : ''}
              <div class="mt-2">
                <button onclick="window.open('tel:${hospital.phone}')" class="text-xs bg-red-500 text-white px-2 py-1 rounded mr-1">Call</button>
                <button onclick="window.open('https://maps.google.com/?q=${hospital.lat},${hospital.lng}')" class="text-xs bg-blue-500 text-white px-2 py-1 rounded">Directions</button>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });

      // Add pharmacy markers
      pharmacies.forEach((pharmacy) => {
        const marker = new google.maps.Marker({
          position: { lat: pharmacy.lat, lng: pharmacy.lng },
          map,
          title: pharmacy.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#16a34a" stroke="#ffffff" stroke-width="2"/>
                <path d="M12 6v12M6 12h12" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(28, 28)
          }
        });

        const distance = userLocation 
          ? distanceInKm(userLocation.lat, userLocation.lng, pharmacy.lat, pharmacy.lng)
          : distanceInKm(center.lat, center.lng, pharmacy.lat, pharmacy.lng);

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2 max-w-xs">
              <h3 class="font-semibold text-sm">${pharmacy.name}</h3>
              <p class="text-xs text-gray-600">${pharmacy.type}</p>
              <p class="text-xs mt-1">${pharmacy.address}</p>
              <p class="text-xs font-medium mt-1">Distance: ${distance.toFixed(1)} km</p>
              <p class="text-xs mt-1">🕒 ${pharmacy.hours}</p>
              ${pharmacy.phone ? `<p class="text-xs mt-1">📞 ${pharmacy.phone}</p>` : ''}
              <div class="mt-2">
                <button onclick="window.open('tel:${pharmacy.phone}')" class="text-xs bg-green-500 text-white px-2 py-1 rounded mr-1">Call</button>
                <button onclick="window.open('https://maps.google.com/?q=${pharmacy.lat},${pharmacy.lng}')" class="text-xs bg-blue-500 text-white px-2 py-1 rounded">Directions</button>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });

      // Handle map clicks
      if (onLocationSelect) {
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            onLocationSelect({
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            });
          }
        });
      }

      setMapError('');
    }).catch((error) => {
      setMapError('Failed to load Google Maps. Please check your API key.');
      console.error('Google Maps loading error:', error);
    });
  }, [userApiKey, hospitals, pharmacies, center, zoom, onLocationSelect, userLocation]);

  if (showApiInput && !apiKey) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Google Maps Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To display the map with nearby hospitals and pharmacies, please enter your Google Maps API key.
          </p>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter Google Maps API Key"
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
              type="password"
            />
            <Button 
              onClick={() => {
                if (userApiKey.trim()) {
                  setShowApiInput(false);
                }
              }}
              disabled={!userApiKey.trim()}
            >
              Load Map
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Get your API key at:{' '}
            <a 
              href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Google Cloud Console
            </a>
          </p>
          {mapError && (
            <p className="text-sm text-destructive">{mapError}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {mapError && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
          {mapError}
        </div>
      )}
    </div>
  );
}