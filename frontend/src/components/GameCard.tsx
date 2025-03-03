import React from 'react';
import { Link } from 'react-router-dom';
import { Game, ClearStatus, Platform } from '../types/game';
import { Star, Clock } from 'lucide-react';

// プラットフォームバッジの色を取得する関数
const getPlatformBadgeClass = (platform: Platform): string => {
  switch (platform) {
    case 'PC':
      return 'platform-badge platform-pc';
    case 'PS5':
    case 'PS4':
    case 'PS3':
      return 'platform-badge platform-playstation';
    case 'Xbox Series X':
    case 'Xbox One':
    case 'Xbox 360':
      return 'platform-badge platform-xbox';
    case 'Switch':
    case '3DS':
      return 'platform-badge platform-switch';
    default:
      return 'platform-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
};

// クリア状況バッジの色を取得する関数
const getStatusBadgeClass = (status: ClearStatus): string => {
  switch (status) {
    case 'NotStarted':
      return 'status-badge status-not-started';
    case 'InProgress':
      return 'status-badge status-in-progress';
    case 'Completed':
      return 'status-badge status-completed';
    case 'Abandoned':
      return 'status-badge status-abandoned';
    case 'Backlog':
      return 'status-badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
    default:
      return 'status-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
};

// クリア状況のラベルを取得する関数
const getStatusLabel = (status: ClearStatus): string => {
  switch (status) {
    case 'NotStarted':
      return '未プレイ';
    case 'InProgress':
      return 'プレイ中';
    case 'Completed':
      return 'クリア済';
    case 'Abandoned':
      return '断念';
    case 'Backlog':
      return '積みゲー';
    default:
      return '不明';
  }
};

// プレイ時間の表示形式を整える関数
const formatPlayTime = (minutes?: number): string => {
  if (!minutes) return '未記録';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}分`;
  } else if (remainingMinutes === 0) {
    return `${hours}時間`;
  } else {
    return `${hours}時間${remainingMinutes}分`;
  }
};

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const defaultThumbnail = '/placeholder-game.jpg'; // デフォルトサムネイル画像

  // 評価を星で表示
  const renderRating = () => {
    if (!game.rating) return null;
    
    return (
      <div className="flex items-center">
        <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
        <span>{game.rating}</span>
      </div>
    );
  };

  return (
    <div className="game-card">
      <Link to={`/games/${game.gameId}`}>
        <div className="relative">
          <img
            src={game.thumbnailUrl || defaultThumbnail}
            alt={game.title}
            className="game-thumbnail"
          />
          <div className="absolute top-2 right-2 z-10">
            <span className={getStatusBadgeClass(game.clearStatus)}>
              {getStatusLabel(game.clearStatus)}
            </span>
          </div>
        </div>
        <div className="game-info">
          <h3 className="game-title">{game.title}</h3>
          <div className="flex justify-between items-center mt-1">
            <span className={getPlatformBadgeClass(game.platform)}>
              {game.platform}
            </span>
            {renderRating()}
          </div>
          {game.playTime && (
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatPlayTime(game.playTime)}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default GameCard;
