'use client';
import { Switch } from '@heroui/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const darkModeIcons = {
    on: Moon,
    off: Sun,
    selectClass: 'bg-blue-500',
  };

  const defaultSelected = theme === 'dark' || theme === 'system';

  return (
    <div className="flex gap-3">
      <Switch
        defaultSelected={defaultSelected}
        value={theme}
        onChange={(isSelected) => setTheme(isSelected ? 'dark' : 'light')}
        size="lg">
        {({ isSelected }) => (
          <>
            <Switch.Control
              className={isSelected ? darkModeIcons.selectClass : ''}>
              <Switch.Thumb>
                <Switch.Icon>
                  {isSelected ? (
                    <darkModeIcons.on className="size-3 text-inherit opacity-100" />
                  ) : (
                    <darkModeIcons.off className="size-3 text-inherit opacity-70" />
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
