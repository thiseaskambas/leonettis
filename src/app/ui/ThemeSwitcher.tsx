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
    return <div className="flex size-10 items-center justify-center" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="self-center">
      <Switch
        isSelected={isDark}
        aria-label="Toggle dark mode"
        onChange={(isSelected) => setTheme(isSelected ? 'dark' : 'light')}
        size="lg">
        {({ isSelected }) => (
          <>
            <Switch.Control
              className={isSelected ? 'bg-leon-800' : 'bg-tiff-gray-400'}>
              <Switch.Thumb>
                <Switch.Icon>
                  {isSelected ? (
                    <Moon className="dark:text-brand-tertiary size-3 text-current opacity-100" />
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
