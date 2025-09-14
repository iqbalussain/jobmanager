import { useState } from "react";
import { Upload, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BRANCH_CONFIGS } from "@/utils/branchConfig";

interface BranchLogoUploaderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BranchLogoUploader({ isOpen, onClose }: BranchLogoUploaderProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedBranch) {
      toast({
        title: "Missing information",
        description: "Please select both a branch and an image file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Create file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${selectedBranch.toLowerCase().replace(/\s+/g, '-')}-logo.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('branch-logos')
        .upload(filePath, selectedFile, {
          upsert: true // Replace existing file
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('branch-logos')
        .getPublicUrl(filePath);

      toast({
        title: "Logo uploaded successfully",
        description: `Logo for ${selectedBranch} has been uploaded and will appear in quotations`
      });

      // Reset form
      setSelectedFile(null);
      setPreviewUrl("");
      setSelectedBranch("");
      onClose();

    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Branch Logo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="branch">Select Branch</Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a branch" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(BRANCH_CONFIGS).map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {BRANCH_CONFIGS[branch].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Logo Image</Label>
            <Card className="border-dashed border-2 border-muted hover:border-muted-foreground/50 transition-colors">
              <CardContent className="p-6">
                {!selectedFile ? (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Logo preview"
                        className="mx-auto max-h-32 rounded border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={clearFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      {selectedFile.name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || !selectedBranch || uploading}
            >
              {uploading ? "Uploading..." : "Upload Logo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}