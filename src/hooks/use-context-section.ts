"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getContextSection } from "@/services/data.service";

export function useContextSection<T>(section: string, initial: T) {
  const [state, setState] = useState<T>(initial);

  const { data, isLoading } = useQuery({
    queryKey: ["context", section],
    queryFn: () => getContextSection(section),
  });

  useEffect(() => {
    const payload = data?.data;
    if (payload !== undefined && payload !== null) {
      setState(payload as T);
    }
  }, [data]);

  return { state, setState, isLoading };
}
