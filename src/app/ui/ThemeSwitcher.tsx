'use client';
import { Switch } from '@heroui/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ThemeSwitch = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="size-10 flex items-center justify-center" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="flex gap-3">
      <Switch
        isSelected={isDark}
        aria-label="Toggle dark mode"
        onChange={(isSelected) => setTheme(isSelected ? 'dark' : 'light')}
        size="lg">
        {({ isSelected }) => (
          <>
            <Switch.Control className={isSelected ? 'bg-blue-500' : ''}>
              <Switch.Thumb>
                <Switch.Icon>
                  {isSelected ? (
                    <Moon className="size-3 text-current opacity-100" />
                  ) : (
                    <Sun className="size-3 text-current opacity-70" />
                  )}
                </Switch.Icon>
              </Switch.Thumb>
            </Switch.Control>
          </>
        )}
      </Switch>
    </div>
  );
};

export default ThemeSwitch;
