// ゲームのプラットフォーム
export type Platform = 
  | 'PC'
  | 'PS5'
  | 'PS4'
  | 'PS3'
  | 'Xbox Series X'
  | 'Xbox One'
  | 'Xbox 360'
  | 'Switch'
  | '3DS'
  | 'Mobile'
  | 'Other';

// ゲームのジャンル
export type Genre = 
  | 'Action'
  | 'Adventure'
  | 'RPG'
  | 'Strategy'
  | 'Simulation'
  | 'Sports'
  | 'Racing'
  | 'Puzzle'
  | 'FPS'
  | 'TPS'
  | 'Fighting'
  | 'Horror'
  | 'Platformer'
  | 'MMORPG'
  | 'Visual Novel'
  | 'Rhythm'
  | 'Sandbox'
  | 'Other';

// クリア状況
export type ClearStatus = 
  | 'NotStarted'  // まだ始めていない
  | 'InProgress'  // プレイ中
  | 'Completed'   // クリア済み
  | 'Abandoned'   // 断念
  | 'Backlog';    // 積みゲー

// ゲーム情報のインターフェース
export interface Game {
  userId: string;       // ユーザーID
  gameId: string;       // ゲームID (UUID)
  title: string;        // タイトル
  platform: Platform;   // プラットフォーム
  genre: Genre;         // ジャンル
  releaseDate?: string; // 発売日 (ISO形式の日付文字列)
  playTime?: number;    // プレイ時間（分）
  startDate?: string;   // プレイ開始日 (ISO形式の日付文字列)
  endDate?: string;     // プレイ終了日 (ISO形式の日付文字列)
  clearStatus: ClearStatus; // クリア状況
  rating?: number;      // 評価 (1-5)
  notes?: string;       // メモ・感想
  thumbnailUrl?: string; // サムネイル画像のURL
  createdAt: number;    // 作成日時 (Unix timestamp)
  updatedAt: number;    // 更新日時 (Unix timestamp)
}

// 新規ゲーム作成時のインターフェース（必須項目のみ）
export type GameInput = Omit<Game, 'userId' | 'gameId' | 'createdAt' | 'updatedAt'>;

// 検索フィルターのインターフェース
export interface GameFilter {
  platform?: Platform;
  genre?: Genre;
  clearStatus?: ClearStatus;
  searchText?: string;
  sortBy?: 'title' | 'releaseDate' | 'rating' | 'playTime' | 'startDate' | 'endDate' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
