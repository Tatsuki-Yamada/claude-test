import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from 'aws-amplify';
import { Game, ClearStatus } from '../types/game';
import GameCard from '../components/GameCard';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Award, List, Grid3X3, Plus, Search } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    completedGames: 0,
    inProgressGames: 0,
    totalPlayTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // APIが実装された後は実際のAPIコールに置き換え
      // 現在はモックデータを使用
      const mockGames: Game[] = [
        {
          userId: 'user123',
          gameId: 'game1',
          title: 'Final Fantasy XVI',
          platform: 'PS5',
          genre: 'RPG',
          clearStatus: 'Completed',
          rating: 5,
          playTime: 3600, // 60時間
          releaseDate: '2023-06-22',
          startDate: '2023-06-22',
          endDate: '2023-07-15',
          thumbnailUrl: 'https://via.placeholder.com/300x400?text=FF16',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          userId: 'user123',
          gameId: 'game2',
          title: 'The Legend of Zelda: Tears of the Kingdom',
          platform: 'Switch',
          genre: 'Adventure',
          clearStatus: 'InProgress',
          rating: 5,
          playTime: 1800, // 30時間
          releaseDate: '2023-05-12',
          startDate: '2023-05-12',
          thumbnailUrl: 'https://via.placeholder.com/300x400?text=Zelda',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          userId: 'user123',
          gameId: 'game3',
          title: 'Elden Ring',
          platform: 'PC',
          genre: 'RPG',
          clearStatus: 'Abandoned',
          rating: 4,
          playTime: 1200, // 20時間
          releaseDate: '2022-02-25',
          startDate: '2022-02-25',
          thumbnailUrl: 'https://via.placeholder.com/300x400?text=EldenRing',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          userId: 'user123',
          gameId: 'game4',
          title: 'Cyberpunk 2077',
          platform: 'PC',
          genre: 'RPG',
          clearStatus: 'Completed',
          rating: 4,
          playTime: 3000, // 50時間
          releaseDate: '2020-12-10',
          startDate: '2020-12-10',
          endDate: '2021-01-15',
          thumbnailUrl: 'https://via.placeholder.com/300x400?text=Cyberpunk',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      // 最近追加されたゲームを取得（ここでは最大4件）
      setRecentGames(mockGames.slice(0, 4));

      // 統計情報を計算
      const totalGames = mockGames.length;
      const completedGames = mockGames.filter(game => game.clearStatus === 'Completed').length;
      const inProgressGames = mockGames.filter(game => game.clearStatus === 'InProgress').length;
      const totalPlayTime = mockGames.reduce((sum, game) => sum + (game.playTime || 0), 0);

      setStats({
        totalGames,
        completedGames,
        inProgressGames,
        totalPlayTime,
      });

      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('データの取得中にエラーが発生しました。再度お試しください。');
      setIsLoading(false);
    }
  };

  // プレイ時間の表示形式を整える関数
  const formatTotalPlayTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    
    if (hours < 1) {
      return `${minutes}分`;
    } else {
      return `${hours}時間`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-300">
        <p>{error}</p>
        <button 
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 rounded-md hover:bg-red-200 dark:hover:bg-red-800"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ウェルカムセクション */}
      <section className="bg-muted rounded-lg p-6 dark:bg-muted/30">
        <h1 className="text-2xl font-bold">ようこそ、{user?.attributes?.name || 'ゲーマー'}さん！</h1>
        <p className="text-muted-foreground mt-2">
          あなたのゲームコレクションを管理して、プレイ履歴を記録しましょう。
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <Link
            to="/games/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            ゲームを追加
          </Link>
          <Link
            to="/games"
            className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
          >
            <List className="mr-2 h-4 w-4" />
            コレクションを見る
          </Link>
        </div>
      </section>

      {/* 統計情報 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">ゲーム統計</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card text-card-foreground p-4 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Grid3X3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">総ゲーム数</p>
                <p className="text-2xl font-bold">{stats.totalGames}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card text-card-foreground p-4 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">クリア済み</p>
                <p className="text-2xl font-bold">{stats.completedGames}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card text-card-foreground p-4 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <Search className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">プレイ中</p>
                <p className="text-2xl font-bold">{stats.inProgressGames}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card text-card-foreground p-4 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">総プレイ時間</p>
                <p className="text-2xl font-bold">{formatTotalPlayTime(stats.totalPlayTime)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 最近追加したゲーム */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">最近追加したゲーム</h2>
          <Link to="/games" className="text-primary hover:underline">
            すべて見る
          </Link>
        </div>
        
        {recentGames.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentGames.map((game) => (
              <GameCard key={game.gameId} game={game} />
            ))}
          </div>
        ) : (
          <div className="bg-muted p-6 rounded-lg text-center">
            <p className="text-muted-foreground">
              まだゲームが登録されていません。「ゲームを追加」ボタンから登録を始めましょう！
            </p>
            <Link
              to="/games/new"
              className="inline-flex items-center px-4 py-2 mt-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              ゲームを追加
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
