"use client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  delay?: number;
  className?: string;
}

export function SearchInput({
  placeholder = "Search...",
  onSearch,
  value: controlledValue,
  onChange: controlledOnChange,
  delay = 300,
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const debouncedSearch = useCallback(debounce((v: string) => onSearch?.(v), delay), [onSearch, delay]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    if (controlledValue === undefined) {
      setInternalValue(nextVal);
    }
    controlledOnChange?.(nextVal);
    if (onSearch) {
      debouncedSearch(nextVal);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={handleChange} placeholder={placeholder} className="pl-9" />
    </div>
  );
}
