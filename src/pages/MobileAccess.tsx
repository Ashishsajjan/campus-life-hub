import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MobileAccess() {
  const appUrl = window.location.origin;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appUrl);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Access on Mobile</h1>
        <p className="text-muted-foreground">
          Scan the QR code below with your phone camera to open the app
        </p>
      </div>

      <Card className="glass-strong">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Smartphone className="w-5 h-5" />
            Scan QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="p-6 bg-white rounded-2xl">
            <QRCodeSVG 
              value={appUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="text-center space-y-3 w-full">
            <p className="text-sm text-muted-foreground">
              Or copy the link and open it on your mobile device
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={appUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-background/50 border border-border rounded-lg text-sm"
              />
              <Button onClick={copyToClipboard} variant="outline">
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              How to scan:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>iPhone: Open Camera app and point at QR code</li>
              <li>Android: Open Camera or use Google Lens</li>
              <li>Tap the notification to open the app</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-strong border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              Want to install as an app?
            </h3>
            <p className="text-sm text-muted-foreground">
              Once you open the app on your phone, you can add it to your home screen:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
              <li>iPhone: Tap Share → Add to Home Screen</li>
              <li>Android: Tap menu (⋮) → Add to Home Screen</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
