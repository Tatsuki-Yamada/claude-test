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

  // S3バケットからサンプル画像のリストを取得する（AWS SDKなしで）
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
      console.log(`Using bucket: ${bucketName} in region: ${region}`);
      
      // S3バケット内の一般的な画像ファイル名のサンプル
      // 実際のバケットに合わせて調整してください
      const sampleFiles = [
        'image1.jpg',
        'image2.jpg',
        'sample.png',
        'photo.jpeg',
        'thumbnail.png',
        'test.jpg',
        'demo.png',
        'landscape.jpg',
        'portrait.jpg',
        'cat.jpg',
        'dog.png',
        'nature.jpg',
        'city.jpeg',
        'sample1.jpg',
        'sample2.png',
        'example.jpg',
        'picture.jpeg',
        // 実際にバケットにアップロードしたファイル名を追加してください
      ];
      
      // S3バケットURLを使用して画像URLを生成
      const photoObjects = sampleFiles.map(filename => ({
        key: filename,
        url: `https://${bucketName}.s3.${region}.amazonaws.com/${filename}`
      }));
      
      console.log('Generated photo URLs:', photoObjects);
      setPhotos(photoObjects);
      
      // 注：このアプローチでは、実際にS3にアクセスせずにURLだけを生成
      // 存在しない画像ファイルはブラウザで読み込みエラーになるが、onErrorハンドラで非表示にできる
    } catch (error) {
      console.error('Error processing photos:', error);
      toast({
        title: 'Error',
        description: `Failed to process photos: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  // コンポーネントのマウント時に画像を取得
  useEffect(() => {
    fetchPhotos();
  }, [bucketName, region]);

  // 画像をアップロードするボタンのハンドラ
  const handleUpload = () => {
    toast({
      title: 'アップロード情報',
      description: 'S3へのアップロードは、AWSコンソールから直接行ってください。',
    });
  };

  // ファイル名のみを表示する関数（パスを含む場合はパスを除去）
  const getFileName = (path: string) => {
    const parts = path.split('/');
    return parts[parts.length - 1];
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
        <p>3. コードの「sampleFiles」配列に、アップロードしたファイル名を追加します</p>
        <p>4. 「Refresh」ボタンをクリックして画像リストを更新します</p>
        <p className="mt-2 text-xs">注: バケット内の実際のファイルに合わせて、コードを修正する必要があります</p>
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
                <div className="relative">
                  <img 
                    src={photo.url} 
                    alt={getFileName(photo.key)}
                    className="h-48 w-full object-cover rounded-md"
                    loading="lazy"
                    onError={(e) => {
                      // 画像が見つからない場合は要素を非表示に
                      const target = e.target as HTMLImageElement;
                      const parent = target.parentElement;
                      if (parent && parent.parentElement) {
                        parent.parentElement.style.display = 'none';
                      }
                    }}
                  />
                </div>
                <p className="mt-2 text-sm truncate">{getFileName(photo.key)}</p>
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
