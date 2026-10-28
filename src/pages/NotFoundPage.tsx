import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary text-accent mb-4">
        <Coffee className="h-8 w-8" />
      </div>
      <h2 className="font-display text-4xl font-bold text-foreground">404</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This café table or menu link doesn't seem to exist.
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-6 flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent/90 transition"
      >
        <Home className="h-4 w-4" />
        <span>Return to Home POS</span>
      </button>
    </div>
  );
};

