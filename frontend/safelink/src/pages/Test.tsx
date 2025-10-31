import React from 'react';

export default function Test() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center p-8 bg-card rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-foreground mb-4">Test Page</h1>
        <p className="text-muted-foreground">If you can see this, the frontend is working!</p>
      </div>
    </div>
  );
}