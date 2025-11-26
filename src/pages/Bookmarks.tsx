import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'Portal'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setBookmarks(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('bookmarks').insert({
      ...formData,
      user_id: user.id
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Bookmark added successfully' });
      setIsDialogOpen(false);
      setFormData({ title: '', url: '', category: 'Portal' });
      loadBookmarks();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Bookmark deleted' });
      loadBookmarks();
    }
  };

  const categoryColors: Record<string, string> = {
    Portal: 'bg-primary/20 text-primary',
    Results: 'bg-secondary/20 text-secondary',
    Fees: 'bg-accent/20 text-accent',
    Classroom: 'bg-destructive/20 text-destructive',
    Other: 'bg-muted/50 text-foreground'
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bookmarks</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Bookmark
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Bookmark</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-background/50"
                  placeholder="College Portal"
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                  className="bg-background/50"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Portal">Portal</SelectItem>
                    <SelectItem value="Results">Results</SelectItem>
                    <SelectItem value="Fees">Fees</SelectItem>
                    <SelectItem value="Classroom">Classroom</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Add Bookmark</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookmarks.length === 0 ? (
          <Card className="glass-strong col-span-full">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No bookmarks yet. Add your important college links!
            </CardContent>
          </Card>
        ) : (
          bookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="glass-strong hover:border-primary/50 transition-colors group">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{bookmark.title}</h3>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {bookmark.url}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${categoryColors[bookmark.category]}`}>
                    {bookmark.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(bookmark.url, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(bookmark.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}