import React, { useState, useEffect } from 'react';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { useToast } from './ui/use-toast';

interface Photo {
  key: string;
  url: string;
}

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const bucketName = process.env.REACT_APP_S3_BUCKET_NAME || '';
  const region = process.env.REACT_APP_AWS_REGION || 'us-east-1';
  
  // Define the S3 client configuration
  const s3Client = new S3Client({
    region,
    // Credentials are handled by the AWS SDK automatically when deployed
    // For local development, configure your AWS credentials in your environment
  });

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    if (!bucketName) {
      toast({
        title: 'Configuration Error',
        description: 'S3 bucket name is not configured',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
      });

      const response = await s3Client.send(command);
      
      if (response.Contents) {
        const photoObjects = response.Contents
          .filter(item => item.Key && (
            item.Key.endsWith('.jpg') || 
            item.Key.endsWith('.jpeg') || 
            item.Key.endsWith('.png') || 
            item.Key.endsWith('.gif')
          ))
          .map(item => ({
            key: item.Key!,
            url: `https://${bucketName}.s3.${region}.amazonaws.com/${item.Key}`
          }));
        
        setPhotos(photoObjects);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch photos from S3',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Photos</h2>
        <Button onClick={fetchPhotos} disabled={loading}>
          Refresh
        </Button>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <Card key={photo.key} className="overflow-hidden">
              <CardContent className="p-4">
                <img 
                  src={photo.url} 
                  alt={photo.key}
                  className="h-48 w-full object-cover rounded-md"
                  loading="lazy"
                />
                <p className="mt-2 text-sm truncate">{photo.key}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No photos found in the S3 bucket.</p>
        </div>
      )}
    </div>
  );
}
