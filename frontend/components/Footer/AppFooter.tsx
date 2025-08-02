'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function AppFooter() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // This ensures the year stays current even if the app runs for a long time
  useEffect(() => {
    const interval = setInterval(
      () => {
        const newYear = new Date().getFullYear();
        if (newYear !== currentYear) {
          setCurrentYear(newYear);
        }
      },
      60 * 60 * 1000
    ); // Check hourly.

    return () => clearInterval(interval);
  }, [currentYear]);

  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row md:py-4">
        <div className="text-center md:text-left">
          <p className="p-1 text-sm text-muted-foreground">
            © {currentYear} SimuPOS - 0702629261. All rights reserved.
          </p>
        </div>
        <div className="text-center md:text-right">
          <p className="text-sm text-muted-foreground">
            Powered by{' '}
            <Link
              href="https://www.eduprotechnologies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              EduPro Technologies
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
