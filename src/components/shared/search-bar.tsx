"use client";

import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDataTableParams } from "@/hooks/use-data-table";
import { useDebounce } from "@/hooks/use-debounce";

export function SearchBar({
  placeholder = "Search…",
}: {
  placeholder?: string;
}) {
  const { search, setSearch } = useDataTableParams();
  const [value, setValue] = useState(search);
  const debounced = useDebounce(value, 350);

  useEffect(() => {
    if (debounced !== search) setSearch(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <IconSearch className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-8"
      />
    </div>
  );
}
