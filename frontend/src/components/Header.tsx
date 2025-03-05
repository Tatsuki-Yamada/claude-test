import React from 'react';
import { ModeToggle } from './ui/mode-toggle';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">S3 Photo Gallery</h1>
        <ModeToggle />
      </div>
    </header>
  );
}
