'use client';
import { Switch } from '@heroui/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();
  const darkModeIcons = {
    on: Moon,
    off: Sun,
    selectedControlClass: 'bg-blue-500',
  };

  return (
    <div className="flex gap-3">
      <Switch
        value={theme}
        onChange={(isSelected) => setTheme(isSelected ? 'dark' : 'light')}
        defaultSelected
        size="lg">
        {({ isSelected }) => (
          <>
            <Switch.Control
              className={isSelected ? darkModeIcons.selectedControlClass : ''}>
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
