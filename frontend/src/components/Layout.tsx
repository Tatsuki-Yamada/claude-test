import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from './theme-provider';
import { Sun, Moon, Menu, X, LogOut, User, Home, Grid, Plus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navigationItems = [
    { path: '/', label: 'ダッシュボード', icon: <Home className="mr-2 h-5 w-5" /> },
    { path: '/games', label: 'ゲーム一覧', icon: <Grid className="mr-2 h-5 w-5" /> },
    { path: '/games/new', label: '新規登録', icon: <Plus className="mr-2 h-5 w-5" /> },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl">
              <span>ゲームコレクション</span>
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-muted"
              aria-label="テーマ切り替え"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            {user && (
              <div className="flex items-center">
                <button
                  onClick={signOut}
                  className="hidden md:flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </button>
              </div>
            )}

            {/* モバイルメニューボタン */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md hover:bg-muted"
              aria-label="メニュー"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* モバイルナビゲーション */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-background pt-16">
          <nav className="container py-4 flex flex-col space-y-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={closeMenu}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  signOut();
                  closeMenu();
                }}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
              >
                <LogOut className="mr-2 h-4 w-4" />
                ログアウト
              </button>
            )}
          </nav>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="flex-1 container py-6">{children}</main>

      {/* フッター */}
      <footer className="border-t py-6 bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ゲームコレクション - 個人ゲームデータベース
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
