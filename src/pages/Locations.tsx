import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function Locations() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
      window.open(url, '_blank');
      setSearchQuery(''); // Clear after search
    }
  };

  const openMapsUrl = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            🚀 Smooth Location Finder
          </h1>
          <p className="text-muted-foreground text-lg">
            Quickly open nearby places in Google Maps.
          </p>
        </div>

        {/* Search Bar */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search anything on Google Maps (e.g. 'restaurants near me', 'hostels near VIT college')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-12 text-base glass-strong border-primary/20 focus:border-primary/40 transition-all"
            />
            <Button 
              type="submit" 
              size="lg"
              className="h-12 px-6 gap-2 hover-scale"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">Search Maps</span>
            </Button>
          </form>
        </div>

        {/* Quick Action Sections */}
        <div className="space-y-12">
          {/* Restaurants & Hotels */}
          <section className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-semibold">🍽 Restaurants & Hotels</h2>
              <p className="text-sm text-muted-foreground">Find dining and accommodation options</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="w-full h-14 text-base hover-scale"
                onClick={() => openMapsUrl('https://www.google.com/maps/search/restaurants+near+me')}
              >
                🍕 Find Restaurants
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full h-14 text-base hover-scale"
                onClick={() => openMapsUrl('https://www.google.com/maps/search/hotels+near+me')}
              >
                🏨 Find Hotels
              </Button>
            </div>
          </section>

          {/* Stationery & Printing */}
          <section className="space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-semibold">📝 Stationery & Printing</h2>
              <p className="text-sm text-muted-foreground">Find office supplies and printing services</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="w-full h-14 text-base hover-scale"
                onClick={() => openMapsUrl('https://www.google.com/maps/search/stationery+shops+near+me')}
              >
                📚 Find Stationery Shops
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full h-14 text-base hover-scale"
                onClick={() => openMapsUrl('https://www.google.com/maps/search/printing+xerox+shops+near+me')}
              >
                🖨 Find Printing Shops
              </Button>
            </div>
          </section>

          {/* Hostel & PG */}
          <section className="space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-semibold">🏠 Hostel & PG Accommodations</h2>
              <p className="text-sm text-muted-foreground">Find housing and rental options</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="w-full h-14 text-base hover-scale"
                onClick={() => openMapsUrl('https://www.google.com/maps/search/PG+hostel+accommodation+near+me')}
              >
                🏠 Find PG/Hostels
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full h-14 text-base hover-scale"
                onClick={() => openMapsUrl('https://www.google.com/maps/search/PG+hostel+near+college+university')}
              >
                🏫 Near Colleges
              </Button>
            </div>
          </section>

          {/* Travel & Transportation */}
          <section className="space-y-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-semibold">🚇 Travel & Transportation</h2>
              <p className="text-sm text-muted-foreground">Find travel and transport options</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="w-full h-14 text-base hover-scale"
                onClick={() => openMapsUrl('https://www.google.com/maps/search/tourist+places+attractions+near+me')}
              >
                🗺 Tourist Places
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full h-14 text-base hover-scale"
                onClick={() => openMapsUrl('https://www.google.com/maps/search/metro+stations+near+me')}
              >
                🚇 Metro Stations
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full h-14 text-base hover-scale"
                onClick={() => openMapsUrl('https://www.google.com/maps/search/bus+stops+stations+near+me')}
              >
                🚌 Bus Stops
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}