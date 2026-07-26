import type { StreamResponse, StreamFilters } from "../types";
import { getStreamHealthStatus as getStreamHealthStatusByLag } from "../constants/thresholds";

export function streamFilterFn(stream: StreamResponse, filters: StreamFilters): boolean {
  const streamName = stream.config?.name || "";
  const matchesSearch =
    streamName.toLowerCase().includes(filters.search.toLowerCase()) ||
    (stream.config?.subjects || []).some((subject: string) =>
      subject.toLowerCase().includes(filters.search.toLowerCase()),
    );

  const matchesStorage =
    filters.storage === "all" || stream.config?.storage === filters.storage;

  const lag = stream.state?.num_pending || 0;
  const matchesStatus =
    filters.status === "all" ||
    getStreamHealthStatusByLag(lag) === filters.status;

  const messages = stream.state?.messages || 0;
  const matchesMinMessages = messages >= filters.minMessages;
  const matchesMaxMessages =
    filters.maxMessages === 0 || messages <= filters.maxMessages;
  const matchesMinConsumers =
    (stream.state?.consumers || 0) >= filters.minConsumers;
  const matchesSubjectPattern =
    filters.subjectPattern === "" ||
    (stream.config?.subjects || []).some((subject: string) =>
      subject.includes(filters.subjectPattern),
    );

  return (
    matchesSearch &&
    matchesStorage &&
    matchesStatus &&
    matchesMinMessages &&
    matchesMaxMessages &&
    matchesMinConsumers &&
    matchesSubjectPattern
  );
}

export const defaultFilters: StreamFilters = {
  search: "",
  storage: "all",
  status: "all",
  minMessages: 0,
  maxMessages: 0,
  minConsumers: 0,
  subjectPattern: "",
};