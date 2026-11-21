"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "./ui";

type Option<T extends number | string> = { value: T; label: string };

export function ArcadeSelect<T extends number | string>({ id, label, options, value, disabled, onChange }: {
  id: string;
  label: string;
  options: Option<T>[];
  value: T;
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const selected = options.findIndex(option => option.value === value);
  const open = active !== null && !disabled;

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setActive(null);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  function select(index: number) {
    onChange(options[index].value);
    setActive(null);
  }

  function handleKey(event: KeyboardEvent<HTMLButtonElement>) {
    const current = active ?? selected;
    switch (event.key) {
      case "ArrowDown": setActive(open ? Math.min(current + 1, options.length - 1) : selected); break;
      case "ArrowUp": setActive(open ? Math.max(current - 1, 0) : selected); break;
      case "Home": setActive(0); break;
      case "End": setActive(options.length - 1); break;
      case "Enter":
      case " ": if (open) select(current); else setActive(selected); break;
      case "Escape": if (!open) return; setActive(null); break;
      case "Tab": if (open) select(current); return;
      default: {
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
        const match = options.findIndex(option => option.label.toLowerCase().startsWith(event.key.toLowerCase()));
        if (match < 0) return;
        if (open) setActive(match); else select(match);
      }
    }
    event.preventDefault();
  }

  return <div className="arcade-select" ref={root}>
    <label id={id + "-label"} htmlFor={id}>{label}</label>
    <button id={id} type="button" role="combobox" aria-labelledby={id + "-label"} aria-expanded={open}
      aria-controls={id + "-menu"} aria-activedescendant={open ? id + "-option-" + active : undefined}
      className="select-trigger" disabled={disabled} onKeyDown={handleKey} onBlur={() => setActive(null)}
      onClick={() => setActive(open ? null : selected)}>
      {options[selected].label}<span className="select-arrow" aria-hidden="true" />
    </button>
    <ul id={id + "-menu"} role="listbox" aria-labelledby={id + "-label"} hidden={!open} className="select-menu">
      {options.map((option, index) => <li key={option.value} id={id + "-option-" + index}
        role="option" aria-selected={index === selected} data-active={index === active}
        onMouseDown={event => event.preventDefault()} onPointerMove={() => setActive(index)}
        onClick={() => select(index)}>
        {option.label}{index === selected && <Icon name="check" />}
      </li>)}
    </ul>
  </div>;
}
