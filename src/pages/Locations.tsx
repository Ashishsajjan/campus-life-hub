import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Building2, Utensils, Hospital, Bus, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Locations() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const COLLEGE_LOCATION = "https://www.google.com/maps/place/Your+College+Name/@lat,lng,15z";

  const getLocation = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
          toast({
            title: 'Location Found!',
            description: 'You can now search for nearby places',
          });
        },
        (error) => {
          setLoading(false);
          toast({
            title: 'Error',
            description: 'Unable to get your location. Please enable location services.',
            variant: 'destructive',
          });
        }
      );
    } else {
      setLoading(false);
      toast({
        title: 'Not Supported',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive',
      });
    }
  };

  const searchNearby = (query: string) => {
    if (!coords) {
      toast({
        title: 'Location Required',
        description: 'Please get your location first',
        variant: 'destructive',
      });
      return;
    }
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${coords.lat},${coords.lng},15z`;
    window.open(url, '_blank');
  };

  const locations = [
    {
      icon: Building2,
      title: 'Nearby PG/Hostel',
      color: 'primary',
      query: 'pg hostel'
    },
    {
      icon: Utensils,
      title: 'Nearby Mess / Food Mess',
      color: 'secondary',
      query: 'food mess'
    },
    {
      icon: Hospital,
      title: 'Nearby Hospitals',
      color: 'destructive',
      query: 'hospital'
    },
    {
      icon: Bus,
      title: 'Nearby Bus Stops',
      color: 'accent',
      query: 'bus stop'
    },
    {
      icon: Coffee,
      title: 'Nearby Restaurants & Cafes',
      color: 'primary',
      query: 'restaurant cafe'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Locations</h1>

      <Card className="glass-strong">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Your Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={getLocation}
            disabled={loading}
            className="w-full md:w-auto gap-2"
          >
            <MapPin className="w-4 h-4" />
            {loading ? 'Getting Location...' : 'Get My Location'}
          </Button>

          {coords && (
            <div className="p-4 glass rounded-xl">
              <p className="text-sm text-muted-foreground">Latitude: {coords.lat.toFixed(6)}</p>
              <p className="text-sm text-muted-foreground">Longitude: {coords.lng.toFixed(6)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location, index) => (
          <Card
            key={index}
            className="glass-strong hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => searchNearby(location.query)}
          >
            <CardContent className="p-6 space-y-4">
              <div className={`w-12 h-12 rounded-xl bg-${location.color}/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <location.icon className={`w-6 h-6 text-${location.color}`} />
              </div>
              <div>
                <h3 className="font-semibold">{location.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click to search on Google Maps
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-strong border-primary/20">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">College Location</h3>
              <p className="text-sm text-muted-foreground">View your college on the map</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(COLLEGE_LOCATION, '_blank')}
          >
            Open College Location
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}