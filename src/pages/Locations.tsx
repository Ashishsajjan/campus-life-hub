import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

export default function Locations() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
      window.open(url, '_blank');
    }
  };

  const openMapsUrl = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Find Locations</h1>
        <p className="text-muted-foreground">
          Discover restaurants, shops, accommodations, and travel options near you.
        </p>
      </div>

      {/* Search Form */}
      <Card className="glass-strong">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-location">Search Location</Label>
              <Input
                id="search-location"
                type="text"
                placeholder="e.g. restaurants near me, hostels near Delhi University"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                maxLength={255}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter what you're looking for and where
              </p>
            </div>
            <Button type="submit" className="w-full gap-2">
              <Search className="w-4 h-4" />
              Search on Google Maps
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Restaurants & Hotels */}
      <div className="space-y-4">
        <div className="text-center border-t pt-4">
          <h2 className="text-xl font-semibold">🍽 Restaurants & Hotels</h2>
          <p className="text-sm text-muted-foreground">Find dining and accommodation options</p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => openMapsUrl('https://www.google.com/maps/search/restaurants+near+me')}
          >
            🍕 Find Restaurants
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => openMapsUrl('https://www.google.com/maps/search/hotels+near+me')}
          >
            🏨 Find Hotels
          </Button>
        </div>
      </div>

      {/* Stationery & Printing */}
      <div className="space-y-4">
        <div className="text-center border-t pt-4">
          <h2 className="text-xl font-semibold">📝 Stationery & Printing</h2>
          <p className="text-sm text-muted-foreground">Find office supplies and printing services</p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => openMapsUrl('https://www.google.com/maps/search/stationery+shops+near+me')}
          >
            📚 Find Stationery Shops
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => openMapsUrl('https://www.google.com/maps/search/printing+xerox+shops+near+me')}
          >
            🖨 Find Printing Shops
          </Button>
        </div>
      </div>

      {/* Hostel & PG */}
      <div className="space-y-4">
        <div className="text-center border-t pt-4">
          <h2 className="text-xl font-semibold">🏠 Hostel & PG Accommodations</h2>
          <p className="text-sm text-muted-foreground">Find housing and rental options</p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => openMapsUrl('https://www.google.com/maps/search/PG+hostel+accommodation+near+me')}
          >
            🏠 Find PG/Hostels
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => openMapsUrl('https://www.google.com/maps/search/PG+hostel+near+college+university')}
          >
            🏫 Near Colleges
          </Button>
        </div>
      </div>

      {/* Travel & Transportation */}
      <div className="space-y-4">
        <div className="text-center border-t pt-4">
          <h2 className="text-xl font-semibold">🚇 Travel & Transportation</h2>
          <p className="text-sm text-muted-foreground">Find travel and transport options</p>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => openMapsUrl('https://www.google.com/maps/search/tourist+places+attractions+near+me')}
          >
            🗺 Tourist Places
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => openMapsUrl('https://www.google.com/maps/search/metro+stations+near+me')}
          >
            🚇 Metro Stations
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => openMapsUrl('https://www.google.com/maps/search/bus+stops+stations+near+me')}
          >
            🚌 Bus Stops
          </Button>
        </div>
      </div>
    </div>
  );
}