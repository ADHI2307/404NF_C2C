import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MapPin, Navigation, ExternalLink, Search } from 'lucide-react';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom hospital icon
const hospitalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#dc2626">
      <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6H2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2H4V6z"/>
      <path d="M12 2l-8 4v4h16V6l-8-4z"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

// Mock function to fetch nearby hospitals using Overpass API
// Replace with real API call in production
async function fetchNearbyHospitals(lat, lon, radius = 5000) {
  try {
    // Overpass API query for hospitals
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
        relation["amenity"="hospital"](around:${radius},${lat},${lon});
      );
      out geom;
    `;
    
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hospitals');
    }

    const data = await response.json();
    
    return data.elements
      .filter(element => element.lat && element.lon)
      .map(element => ({
        id: element.id,
        name: element.tags?.name || 'Unnamed Hospital',
        lat: element.lat,
        lon: element.lon,
        address: element.tags?.['addr:full'] || element.tags?.['addr:street'] || 'Address not available',
        phone: element.tags?.phone || 'Phone not available'
      }))
      .slice(0, 10); // Limit to 10 hospitals
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    // Return mock data for demo
    return [
      {
        id: 1,
        name: 'City General Hospital',
        lat: lat + 0.01,
        lon: lon + 0.01,
        address: '123 Medical Center Drive',
        phone: '(555) 123-4567'
      },
      {
        id: 2,
        name: 'Emergency Medical Center',
        lat: lat - 0.015,
        lon: lon + 0.008,
        address: '456 Healthcare Blvd',
        phone: '(555) 987-6543'
      },
      {
        id: 3,
        name: 'Regional Medical Hospital',
        lat: lat + 0.008,
        lon: lon - 0.012,
        address: '789 Wellness Way',
        phone: '(555) 555-0123'
      }
    ];
  }
}

// Geocoding function using Nominatim
async function geocodeLocation(query) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
    );
    const data = await response.json();
    
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export default function MapView({ userLocation, onLocationUpdate, openInGoogleMaps }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [mapCenter, setMapCenter] = useState(userLocation || { lat: 40.7128, lon: -74.0060 }); // Default to NYC
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      fetchHospitals(userLocation.lat, userLocation.lon);
    }
  }, [userLocation]);

  const fetchHospitals = async (lat, lon) => {
    setLoading(true);
    try {
      const hospitalData = await fetchNearbyHospitals(lat, lon);
      setHospitals(hospitalData);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;

    setLoading(true);
    try {
      const location = await geocodeLocation(locationInput);
      if (location) {
        const newLocation = { lat: location.lat, lon: location.lon };
        setMapCenter(newLocation);
        setLocationName(location.display_name);
        onLocationUpdate(newLocation);
        await fetchHospitals(location.lat, location.lon);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Location search error:', error);
      alert('Error searching for location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Location search form */}
      {!userLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Enter Your Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLocationSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">City, State, or ZIP Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder="e.g., New York, NY or 10001"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    disabled={loading}
                  />
                  <Button type="submit" disabled={loading || !locationInput.trim()}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Current location display */}
      {locationName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {locationName}
        </div>
      )}

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div style={{ height: '400px', width: '100%' }}>
            <MapContainer
              center={[mapCenter.lat, mapCenter.lon]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater center={[mapCenter.lat, mapCenter.lon]} />
              
              {/* User location marker */}
              <Marker position={[mapCenter.lat, mapCenter.lon]}>
                <Popup>Your Location</Popup>
              </Marker>

              {/* Hospital markers */}
              {hospitals.map((hospital) => (
                <Marker
                  key={hospital.id}
                  position={[hospital.lat, hospital.lon]}
                  icon={hospitalIcon}
                >
                  <Popup>
                    <div className="space-y-2">
                      <h3 className="font-semibold">{hospital.name}</h3>
                      <p className="text-sm text-gray-600">{hospital.address}</p>
                      <p className="text-sm text-gray-600">{hospital.phone}</p>
                      <Button
                        size="sm"
                        onClick={() => openInGoogleMaps(hospital.lat, hospital.lon)}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Directions
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Hospital list */}
      <Card>
        <CardHeader>
          <CardTitle>
            Nearby Hospitals ({hospitals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Finding nearby hospitals...</p>
          ) : hospitals.length > 0 ? (
            <div className="space-y-3">
              {hospitals.map((hospital) => (
                <div key={hospital.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">{hospital.name}</h3>
                    <p className="text-sm text-muted-foreground">{hospital.address}</p>
                    <p className="text-sm text-muted-foreground">{hospital.phone}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInGoogleMaps(hospital.lat, hospital.lon)}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Directions
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No hospitals found in this area. Try searching for a different location.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}