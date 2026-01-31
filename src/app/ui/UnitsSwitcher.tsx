'use client';

import { Button, Dropdown, Label, Selection } from '@heroui/react';
import { useState } from 'react';

export function UnitsSwitcher() {
  const [selected, setSelected] = useState<Selection>(new Set(['m2']));
  const handleSelectionChange = (keys: Selection) => {
    setSelected(keys);
  };

  return (
    <Dropdown>
      <Button className="" aria-label="Menu" variant="secondary">
        {selected}
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          selectedKeys={selected}
          selectionMode="single"
          disallowEmptySelection
          onSelectionChange={handleSelectionChange}
          onAction={(key) => console.log(`Selected: ${key}`)}>
          {['m²', 'ft²'].map((unit) => (
            <Dropdown.Item key={unit} id={unit} textValue={unit}>
              <Label className="flex items-center gap-2">{unit}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
