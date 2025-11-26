import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, FileText, Upload, FolderOpen, Trash2, X } from 'lucide-react';

/**
 * Files & Subject Notes
 * - Organize study materials by subject
 * - Each subject gets a box/card
 * - Upload files and add text notes per subject
 * - Linked from Calendar for easy access
 */
export default function Files() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isAddSubjectDialogOpen, setIsAddSubjectDialogOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [noteText, setNoteText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load all files
    const { data: filesData } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filesData) {
      setFiles(filesData);
      
      // Extract unique subjects
      const uniqueSubjects = Array.from(
        new Set(
          filesData
            .map(f => f.subject)
            .filter(s => s && s.trim() !== '')
        )
      ) as string[];
      
      setSubjects(uniqueSubjects);
    }
  };

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedFile || !selectedSubject) {
      toast({ title: 'Error', description: 'Please select a file', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsUploading(false);
      return;
    }

    try {
      // Upload file to storage with user folder structure
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Save file path (we'll generate signed URLs when viewing)
      const { error: dbError } = await supabase.from('files').insert({
        user_id: user.id,
        file_name: selectedFile.name,
        file_url: filePath, // Store the path, not the URL
        subject: selectedSubject,
        description: fileDescription || null
      });

      if (dbError) throw dbError;

      toast({ title: 'Success', description: 'File uploaded successfully' });
      setIsDialogOpen(false);
      setSelectedFile(null);
      setFileDescription('');
      loadData();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to upload file', 
        variant: 'destructive' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (file: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // If it's a real file (not a note or placeholder), delete from storage
      if (!file.file_url.startsWith('note:') && !file.file_url.startsWith('placeholder:')) {
        const { error: storageError } = await supabase.storage
          .from('study-materials')
          .remove([file.file_url]);

        if (storageError) throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      toast({ title: 'Success', description: 'File deleted successfully' });
      loadData();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete file', 
        variant: 'destructive' 
      });
    }
  };

  const handleDeleteSubject = async (subject: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const subjectFiles = getFilesForSubject(subject);

    try {
      // Delete all files from storage (excluding notes and placeholders)
      const filesToDelete = subjectFiles
        .filter(f => !f.file_url.startsWith('note:') && !f.file_url.startsWith('placeholder:'))
        .map(f => f.file_url);

      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('study-materials')
          .remove(filesToDelete);

        if (storageError) throw storageError;
      }

      // Delete all file entries from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('user_id', user.id)
        .eq('subject', subject);

      if (dbError) throw dbError;

      toast({ title: 'Success', description: `Subject "${subject}" deleted` });
      loadData();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete subject', 
        variant: 'destructive' 
      });
    }
  };

  const handleAddNote = async () => {
    if (!selectedSubject || !noteText.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save note as a file entry with file_url as 'note:' prefix
    const { error } = await supabase.from('files').insert({
      user_id: user.id,
      file_name: `Note - ${new Date().toLocaleDateString()}`,
      file_url: `note:${noteText}`,
      subject: selectedSubject,
      description: 'Text note'
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Note added' });
      setIsNoteDialogOpen(false);
      setNoteText('');
      loadData();
    }
  };

  const getFilesForSubject = (subject: string) => {
    return files.filter(f => f.subject === subject);
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      toast({ title: 'Error', description: 'Please enter a subject name', variant: 'destructive' });
      return;
    }

    // Check if subject already exists
    if (subjects.some(s => s.toLowerCase() === newSubjectName.trim().toLowerCase())) {
      toast({ title: 'Error', description: 'This subject already exists', variant: 'destructive' });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create a placeholder file entry for the new subject so it appears in the list
    const { error } = await supabase.from('files').insert({
      user_id: user.id,
      file_name: '_subject_placeholder',
      file_url: 'placeholder:subject',
      subject: newSubjectName.trim(),
      description: 'Subject created'
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Subject "${newSubjectName}" added` });
      setIsAddSubjectDialogOpen(false);
      setNewSubjectName('');
      loadData();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Subject Notes & Files</h1>
        <Button
          onClick={() => setIsAddSubjectDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </Button>
      </div>

      <p className="text-muted-foreground">
        Organize your study materials by subject. Files and notes are linked to your calendar events.
      </p>

      {/* Subject Boxes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.length === 0 ? (
          <Card className="glass-strong md:col-span-2 lg:col-span-3">
            <CardContent className="pt-6 text-center text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No subjects yet. Create events or tasks with subjects to organize your materials.</p>
            </CardContent>
          </Card>
        ) : (
          subjects.map((subject) => {
            const subjectFiles = getFilesForSubject(subject);
            
            return (
              <Card
                key={subject}
                className="glass-strong hover:border-primary/50 transition-all"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      {subject}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${subject}" and all its files?`)) {
                          handleDeleteSubject(subject);
                        }
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Files/Notes List */}
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                     {subjectFiles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No files or notes yet</p>
                    ) : (
                      subjectFiles
                         .filter(file => file.file_name !== '_subject_placeholder') // Hide placeholder entries
                         .map((file) => {
                           const isNote = file.file_url.startsWith('note:');
                           const isPlaceholder = file.file_url.startsWith('placeholder:');
                           
                           if (isPlaceholder) return null;
                           
                           const handleFileClick = async () => {
                             if (isNote) return;
                             
                             // Generate signed URL for secure access
                             const { data, error } = await supabase.storage
                               .from('study-materials')
                               .createSignedUrl(file.file_url, 3600); // 1 hour expiry
                             
                             if (error) {
                               toast({ 
                                 title: 'Error', 
                                 description: 'Failed to open file', 
                                 variant: 'destructive' 
                               });
                               return;
                             }
                             
                             if (data?.signedUrl) {
                               window.open(data.signedUrl, '_blank');
                             }
                           };
                           
                           return (
                             <div
                               key={file.id}
                               className="p-2 glass rounded-lg border border-glass-border text-sm hover:border-primary/50 transition-all group"
                             >
                               <div className="flex items-start gap-2">
                                 <div 
                                   className="flex-1 flex items-start gap-2 cursor-pointer"
                                   onClick={handleFileClick}
                                 >
                                   {isNote ? (
                                     <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                   ) : (
                                     <Upload className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                                   )}
                                   <div className="flex-1 min-w-0">
                                     <p className="font-medium truncate">{file.file_name}</p>
                                     {isNote ? (
                                       <p className="text-xs text-muted-foreground line-clamp-2">
                                         {file.file_url.substring(5)}
                                       </p>
                                     ) : (
                                       file.description && (
                                         <p className="text-xs text-muted-foreground">{file.description}</p>
                                       )
                                     )}
                                   </div>
                                 </div>
                                 <Button
                                   variant="ghost"
                                   size="icon"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     if (confirm('Delete this file?')) {
                                       handleDeleteFile(file);
                                     }
                                   }}
                                   className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                 >
                                   <X className="w-3 h-3" />
                                 </Button>
                               </div>
                             </div>
                           );
                         })
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-glass-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedSubject(subject);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedSubject(subject);
                        setIsNoteDialogOpen(true);
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Upload File Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-strong max-w-md">
          <DialogHeader>
            <DialogTitle>Upload File for {selectedSubject}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <Label>File</Label>
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="bg-background/50"
                required
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                placeholder="What is this file about?"
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="glass-strong max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note for {selectedSubject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Note</Label>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your note here..."
                className="min-h-[150px] bg-background/50"
              />
            </div>
            <Button onClick={handleAddNote} className="w-full">
              Save Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Subject Dialog */}
      <Dialog open={isAddSubjectDialogOpen} onOpenChange={setIsAddSubjectDialogOpen}>
        <DialogContent className="glass-strong max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input
                id="subject-name"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="e.g., Data Structures, Physics, History"
                className="bg-background/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubject();
                  }
                }}
              />
            </div>
            <Button onClick={handleAddSubject} className="w-full">
              Add Subject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
