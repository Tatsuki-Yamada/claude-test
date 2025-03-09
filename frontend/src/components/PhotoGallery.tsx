import React, { useState, useEffect } from 'react';
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

  // 環境変数を取得
  const bucketName = process.env.REACT_APP_S3_BUCKET_NAME || '';
  const region = process.env.REACT_APP_AWS_REGION || 'us-east-1';
  
  // デバッグ用にコンソールにログ出力
  useEffect(() => {
    console.log('Environment variables:');
    console.log('REACT_APP_S3_BUCKET_NAME:', process.env.REACT_APP_S3_BUCKET_NAME);
    console.log('REACT_APP_AWS_REGION:', process.env.REACT_APP_AWS_REGION);
  }, []);

  // 画像を直接フェッチする関数（SDKを使わない）
  const fetchPhotos = async () => {
    if (!bucketName || bucketName.trim() === '') {
      console.error('S3 bucket name is not configured. Environment variable REACT_APP_S3_BUCKET_NAME is missing or empty.');
      toast({
        title: 'Configuration Error',
        description: 'S3 bucket name is not configured. Please check application settings.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`Fetching photos from bucket: ${bucketName} in region: ${region}`);
      
      // S3 SDKを使わず、XMLリストを直接取得する方法
      const url = `https://${bucketName}.s3.${region}.amazonaws.com/`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlText = await response.text();
      console.log('Received XML response:', xmlText.substring(0, 200) + '...');
      
      // XML解析
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const contents = xmlDoc.getElementsByTagName('Contents');
      
      console.log(`Found ${contents.length} objects in the bucket`);
      
      // 画像のみをフィルタリング
      const photoObjects: Photo[] = [];
      
      for (let i = 0; i < contents.length; i++) {
        const key = contents[i].getElementsByTagName('Key')[0].textContent;
        if (key && 
          (key.toLowerCase().endsWith('.jpg') || 
          key.toLowerCase().endsWith('.jpeg') || 
          key.toLowerCase().endsWith('.png') || 
          key.toLowerCase().endsWith('.gif'))) {
          
          photoObjects.push({
            key: key,
            url: `https://${bucketName}.s3.${region}.amazonaws.com/${key}`
          });
        }
      }
      
      console.log(`Found ${photoObjects.length} photos after filtering`);
      console.log('Photo URLs:', photoObjects);
      setPhotos(photoObjects);
      
    } catch (error) {
      console.error('Error fetching photos:', error);
      
      // エラーに対処してサンプル画像を表示（確認用）
      const demoPhotos = [
        {key: 'sample1.jpg', url: `https://${bucketName}.s3.${region}.amazonaws.com/sample1.jpg`},
        {key: 'sample2.jpg', url: `https://${bucketName}.s3.${region}.amazonaws.com/sample2.jpg`},
        {key: 'sample3.jpg', url: `https://${bucketName}.s3.${region}.amazonaws.com/sample3.jpg`}
      ];
      
      console.log('Using demo photo URLs instead:', demoPhotos);
      setPhotos(demoPhotos);
      
      toast({
        title: 'Error',
        description: `Failed to fetch photos from S3: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // コンポーネントのマウント時に画像を取得
  useEffect(() => {
    fetchPhotos();
  }, [bucketName, region]);

  // 画像をS3にアップロードする機能用のプレースホルダー
  const handleUpload = () => {
    // ファイル選択ダイアログを開くためのhidden input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    
    fileInput.onchange = async (e) => {
      const input = e.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) return;
      
      toast({
        title: 'アップロード情報',
        description: 'S3へのアップロードは別の方法で行ってください。AWSコンソールからS3バケットにアップロードするか、AWS CLIを使用してください。',
      });
    };
    
    fileInput.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Photos</h2>
        <div className="space-x-2">
          <Button onClick={handleUpload} variant="outline">
            Upload Photos
          </Button>
          <Button onClick={fetchPhotos} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>
      
      {/* デバッグ情報と使用方法 */}
      <div className="text-sm text-muted-foreground mb-4 p-4 bg-muted rounded-md">
        <p className="font-medium">バケット情報:</p>
        <p>Bucket: {bucketName || 'Not configured'}</p>
        <p>Region: {region}</p>
        <p className="mt-2 font-medium">使用方法:</p>
        <p>1. AWSコンソールで上記のS3バケットに画像ファイルをアップロードします</p>
        <p>2. アップロードしたファイルを公開アクセス可能に設定します</p>
        <p>3. 「Refresh」ボタンをクリックして画像リストを更新します</p>
        <p className="mt-2 text-xs">デバッグ: 画像が表示されない場合、ブラウザのコンソールでエラーを確認してください</p>
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
                  onError={(e) => {
                    // 画像が存在しない場合のエラーハンドリング
                    const target = e.target as HTMLImageElement;
                    target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
                    target.classList.add('bg-gray-100', 'p-4');
                    target.alt = 'Image not available';
                  }}
                />
                <p className="mt-2 text-sm truncate">{photo.key}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No photos found in the S3 bucket.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            AWSコンソールからS3バケットに画像をアップロードしてください:
            <code className="ml-1 p-1 bg-muted rounded">{bucketName}</code>
          </p>
        </div>
      )}
    </div>
  );
}
