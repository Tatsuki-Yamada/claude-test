import React from 'react';
import { ThemeProvider } from './components/ui/theme-provider';
import { PhotoGallery } from './components/PhotoGallery';
import { Header } from './components/Header';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-6 px-4">
          <PhotoGallery />
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
