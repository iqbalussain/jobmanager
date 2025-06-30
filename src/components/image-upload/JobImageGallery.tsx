
import React, { useState } from 'react';
import { Trash2, Edit3, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useJobImages } from '@/hooks/useJobImages';

interface JobImageGalleryProps {
  jobOrderId: string;
  canEdit?: boolean;
}

export function JobImageGallery({ jobOrderId, canEdit = true }: JobImageGalleryProps) {
  const { images, isLoading, deleteImage, isDeletingImage, updateAltText, getImageUrl } = useJobImages(jobOrderId);
  const [editingAltText, setEditingAltText] = useState<{ id: string; text: string } | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No images uploaded yet</p>
      </div>
    );
  }

  const handleSaveAltText = () => {
    if (editingAltText) {
      updateAltText({ imageId: editingAltText.id, altText: editingAltText.text });
      setEditingAltText(null);
    }
  };

  const handleDownload = async (image: any) => {
    try {
      const imageUrl = getImageUrl(image.file_path);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="group relative">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={getImageUrl(image.file_path)}
                alt={image.alt_text || image.file_name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg">
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* View full size */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>{image.file_name}</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center">
                      <img
                        src={getImageUrl(image.file_path)}
                        alt={image.alt_text || image.file_name}
                        className="max-h-[70vh] object-contain"
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Download */}
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleDownload(image)}
                >
                  <Download className="h-4 w-4" />
                </Button>

                {canEdit && (
                  <>
                    {/* Edit alt text */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Image Description</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="altText">Description</Label>
                            <Input
                              id="altText"
                              value={editingAltText?.id === image.id ? editingAltText.text : (image.alt_text || '')}
                              onChange={(e) => setEditingAltText({ id: image.id, text: e.target.value })}
                              placeholder="Describe this image..."
                            />
                          </div>
                          <Button onClick={handleSaveAltText} className="w-full">
                            Save Description
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="h-8 w-8 p-0"
                          disabled={isDeletingImage}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Image</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this image? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteImage(image.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>

            {/* Image info */}
            <div className="mt-2">
              <p className="text-xs text-gray-600 truncate">{image.file_name}</p>
              <p className="text-xs text-gray-500">
                {Math.round(image.file_size / 1024)}KB
                {image.image_width && image.image_height && (
                  <span> • {image.image_width}×{image.image_height}</span>
                )}
              </p>
              {image.alt_text && (
                <p className="text-xs text-gray-600 mt-1 italic">{image.alt_text}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
