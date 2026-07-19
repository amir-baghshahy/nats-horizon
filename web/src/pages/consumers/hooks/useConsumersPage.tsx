import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ConsumerResponse as Consumer,
  StreamResponse as Stream,
} from "../../../types";
import { ConsumersService, StreamsService } from "../../../types";
import { useSSE } from "../../../hooks/useSSE";
import { useExpansion, useSelection, usePersistedState } from "../../../hooks";
import { useConfirm } from "../../../components/ConfirmDialog";
import { useToast } from "../../../components/Toast";
import {
  deleteConsumer,
  resetConsumerLag,
  setConsumerState,
} from "../../../utils/natsOperations";
import { getLagColor } from "../../../constants/thresholds";
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";

export type ConsumerFilterStatus = "all" | "active" | "stuck" | "idle";

export interface ConsumerStats {
  total: number;
  active: number;
  stuck: number;
  idle: number;
  totalLag: number;
  avgAckRate: number;
}

// Helper: Check if consumer matches filter criteria
function matchesConsumerFilters(
  consumer: Consumer,
  searchQuery: string,
  selectedStream: string,
  filterStatus: ConsumerFilterStatus,
): boolean {
  const matchesSearch =
    (consumer.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    (consumer.stream || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

  const matchesStream =
    selectedStream === "all" || consumer.stream === selectedStream;

  let matchesStatus = true;
  if (filterStatus === "active") {
    matchesStatus = consumer.status === "active";
  } else if (filterStatus === "stuck") {
    matchesStatus = consumer.status === "stuck";
  } else if (filterStatus === "idle") {
    matchesStatus = consumer.status === "idle";
  }

  return matchesSearch && matchesStream && matchesStatus;
}

// Helper: Calculate consumer statistics
function calculateConsumerStats(consumers: Consumer[]): ConsumerStats {
  return {
    total: consumers.length,
    active: consumers.filter((c) => c.status === "active").length,
    stuck: consumers.filter((c) => c.status === "stuck").length,
    idle: consumers.filter((c) => c.status === "idle").length,
    totalLag: consumers.reduce((acc, c) => acc + (c.lag || 0), 0),
    avgAckRate:
      consumers.length > 0
        ? consumers.reduce(
            (acc, c) =>
              acc +
              parseFloat(String(c.ack_rate || "0").replace(/[^0-9.]/g, "")) ||
              0,
            0,
          ) / consumers.length
        : 0,
  };
}

// Helper: Execute bulk operation with confirmation
async function executeBulkOperation<T, R = void>(
  items: T[],
  selectedItems: Set<string>,
  operation: (item: T) => Promise<R>,
  predicate: (item: T) => boolean,
): Promise<number> {
  const itemsToProcess = items.filter(
    (item) =>
      (item as any).name &&
      selectedItems.has((item as any).name) &&
      predicate(item),
  );

  if (itemsToProcess.length === 0) {
    return 0;
  }

  await Promise.allSettled(
    itemsToProcess.map((item) => operation(item)),
  );

  return itemsToProcess.length;
}

export interface UseConsumersPageReturn {
  searchQuery: string;
  selectedStream: string;
  filterStatus: ConsumerFilterStatus;
  showMoreFilters: boolean;
  selectedConsumers: Set<string>;
  filteredConsumers: Consumer[];
  totalConsumers: number;
  stats: ConsumerStats;
  streamOptions: string[];
  activeFilterCount: number;
  isLoading: boolean;
  sseConnected: boolean;
  pauseResumePending: boolean;
  resetLagPending: boolean;
  deletePending: boolean;
  setSearchQuery: (value: string) => void;
  setSelectedStream: (value: string) => void;
  setFilterStatus: (value: ConsumerFilterStatus) => void;
  setShowMoreFilters: (value: boolean) => void;
  toggleConsumerSelection: (item: string) => void;
  clearConsumerSelection: () => void;
  selectAllConsumers: (items: string[]) => void;
  toggleExpand: (item: string) => void;
  isConsumerExpanded: (item: string) => boolean;
  refetch: () => void;
  handleBulkResume: () => Promise<void>;
  handleBulkPause: () => Promise<void>;
  handleBulkDelete: () => Promise<void>;
  handleTogglePauseResume: (consumer: Consumer) => void;
  handleResetLag: (consumer: Consumer) => void;
  handleDeleteConsumer: (consumer: Consumer) => Promise<void>;
  getStatusIcon: (consumer: Consumer) => JSX.Element;
  getStatusLabel: (status: string) => string;
  getLagColor: (lag: number) => string;
  clearFilters: () => void;
  toggleAll: () => void;
}

export function useConsumersPage(): UseConsumersPageReturn {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = usePersistedState(
    "consumers:search",
    "",
  );
  const [selectedStream, setSelectedStream] = usePersistedState(
    "consumers:stream",
    "all",
  );

  const [filterStatus, setFilterStatus] =
    usePersistedState<ConsumerFilterStatus>("consumers:status", "all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const {
    selected: selectedConsumers,
    toggleSelection: toggleConsumerSelection,
    clearSelection: clearConsumerSelection,
    selectAll: selectAllConsumers,
  } = useSelection<string>();

  const { toggleExpansion: toggleExpand, isExpanded: isConsumerExpanded } =
    useExpansion<string>();

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { connected: sseConnected } = useSSE("consumers");

  const {
    data: consumers,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["consumers"],
    queryFn: () => ConsumersService.getConsumers(),
  });

  const { data: streams } = useQuery({
    queryKey: ["streams"],
    queryFn: () => StreamsService.getStreams(),
  });

  const filteredConsumers = useMemo(
    () =>
      (consumers ?? []).filter((consumer) =>
        matchesConsumerFilters(consumer, searchQuery, selectedStream, filterStatus),
      ),
    [consumers, filterStatus, searchQuery, selectedStream],
  );

  const stats = useMemo<ConsumerStats>(
    () => calculateConsumerStats(filteredConsumers),
    [filteredConsumers],
  );

  const deleteMutation = useMutation({
    mutationFn: ({ stream, name }: { stream: string; name: string }) =>
      deleteConsumer(stream, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumers"] });
      clearConsumerSelection();
      toast("success", t("consumers.consumerDeleted"));
    },
    onError: () => toast("error", t("consumers.consumerDeleteFailed")),
  });

  const pauseResumeMutation = useMutation({
    mutationFn: ({
      stream,
      name,
      paused,
    }: {
      stream: string;
      name: string;
      paused: boolean;
    }) => setConsumerState(stream, name, paused),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumers"] });
    },
    onError: () => toast("error", t("consumers.consumerUpdateFailed")),
  });

  const resetLagMutation = useMutation({
    mutationFn: ({ stream, name }: { stream: string; name: string }) =>
      resetConsumerLag(stream, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumers"] });
      toast("success", t("consumers.lagReset"));
    },
    onError: () => toast("error", t("consumers.lagResetFailed")),
  });

  const handleBulkResume = useCallback(async () => {
    const ok = await confirm({
      title: t("consumers.resumeConsumers"),
      message: t("consumers.resumeConsumersConfirm", {
        count: selectedConsumers.size,
      }),
      confirmLabel: t("consumers.resumeConsumers").split(" ")[0],
      variant: "info",
    });
    if (!ok) return;

    const count = await executeBulkOperation(
      filteredConsumers,
      selectedConsumers,
      (consumer) =>
        pauseResumeMutation.mutateAsync({
          stream: consumer.stream!,
          name: consumer.name!,
          paused: false,
        }),
      (consumer) => consumer.paused === true,
    );

    if (count === 0) {
      toast("info", t("consumers.noConsumersToResume"));
      return;
    }

    toast("success", t("consumers.bulkResumeSuccess", { count }));
    clearConsumerSelection();
  }, [confirm, t, filteredConsumers, selectedConsumers, pauseResumeMutation, toast, clearConsumerSelection]);

  const handleBulkPause = useCallback(async () => {
    const ok = await confirm({
      title: t("consumers.pauseConsumers"),
      message: t("consumers.pauseConsumersConfirm", {
        count: selectedConsumers.size,
      }),
      confirmLabel: t("consumers.pauseConsumers").split(" ")[0],
      variant: "warning",
    });
    if (!ok) return;

    const count = await executeBulkOperation(
      filteredConsumers,
      selectedConsumers,
      (consumer) =>
        pauseResumeMutation.mutateAsync({
          stream: consumer.stream!,
          name: consumer.name!,
          paused: true,
        }),
      (consumer) => consumer.paused !== true,
    );

    if (count === 0) {
      toast("info", t("consumers.noConsumersToPause"));
      return;
    }

    toast("success", t("consumers.bulkPauseSuccess", { count }));
    clearConsumerSelection();
  }, [confirm, t, filteredConsumers, selectedConsumers, pauseResumeMutation, toast, clearConsumerSelection]);

  const handleBulkDelete = useCallback(async () => {
    const ok = await confirm({
      title: t("consumers.deleteConsumers"),
      message: t("consumers.deleteConsumersConfirm", {
        count: selectedConsumers.size,
      }),
      confirmLabel: t("common.delete"),
      variant: "danger",
    });
    if (!ok) return;

    const results = await Promise.allSettled(
      filteredConsumers
        .filter(
          (consumer) =>
            consumer.name &&
            consumer.stream &&
            selectedConsumers.has(consumer.name),
        )
        .map((consumer) =>
          deleteMutation.mutateAsync({
            stream: consumer.stream!,
            name: consumer.name!,
          }),
        ),
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed > 0) {
      toast("warning", t("consumers.partialDeleteSuccess", { succeeded, failed }));
    } else {
      toast("success", t("consumers.bulkDeleteSuccess", { count: succeeded }));
    }
    clearConsumerSelection();
  }, [confirm, t, filteredConsumers, selectedConsumers, deleteMutation, toast, clearConsumerSelection]);

  const handleTogglePauseResume = useCallback((consumer: Consumer) => {
    if (!consumer.name || !consumer.stream) return;
    const isPaused = consumer.paused;
    pauseResumeMutation.mutate({
      stream: consumer.stream,
      name: consumer.name,
      paused: !isPaused,
    });
  }, [pauseResumeMutation]);

  const handleResetLag = useCallback((consumer: Consumer) => {
    if (!consumer.name || !consumer.stream) return;
    resetLagMutation.mutate({
      stream: consumer.stream,
      name: consumer.name,
    });
  }, [resetLagMutation]);

  const handleDeleteConsumer = useCallback(async (consumer: Consumer) => {
    const ok = await confirm({
      title: t("consumers.deleteConsumer"),
      message: t("consumers.deleteConsumerConfirm", { name: consumer.name }),
      confirmLabel: t("common.delete"),
      variant: "danger",
    });
    if (ok && consumer.name && consumer.stream) {
      deleteMutation.mutate({ stream: consumer.stream, name: consumer.name });
    }
  }, [confirm, t, deleteMutation]);

  const getStatusIcon = useCallback((consumer: Consumer) => {
    switch (consumer.status) {
      case "active":
        return <CheckCircle className="icon-base status-success" />;
      case "stuck":
        return <AlertCircle className="icon-base status-error" />;
      case "idle":
        return <Clock className="icon-base status-warning" />;
      default:
        return <Activity className="icon-base status-info" />;
    }
  }, []);

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case "active":
        return t("consumers.active");
      case "stuck":
        return t("consumers.stuck");
      case "idle":
        return t("consumers.idle");
      default:
        return t("consumers.unknown");
    }
  }, [t]);

  const streamOptions = useMemo(
    () =>
      streams
        ?.map((stream: Stream) => stream.config?.name)
        .filter((name): name is string => Boolean(name)) ?? [],
    [streams],
  );

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (selectedStream !== "all" ? 1 : 0) +
    (filterStatus !== "all" ? 1 : 0);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedStream("all");
    setFilterStatus("all");
    setShowMoreFilters(false);
  }, [setSearchQuery, setSelectedStream, setFilterStatus, setShowMoreFilters]);

  const toggleAll = useCallback(() => {
    if (selectedConsumers.size === filteredConsumers.length) {
      clearConsumerSelection();
    } else {
      selectAllConsumers(
        filteredConsumers
          .map((consumer) => consumer.name)
          .filter((name): name is string => Boolean(name)),
      );
    }
  }, [selectedConsumers, filteredConsumers, clearConsumerSelection, selectAllConsumers]);

  return {
    searchQuery,
    selectedStream,
    filterStatus,
    showMoreFilters,
    selectedConsumers,
    filteredConsumers,
    totalConsumers: consumers?.length ?? 0,
    stats,
    streamOptions,
    activeFilterCount,
    isLoading,
    sseConnected,
    pauseResumePending: pauseResumeMutation.isPending,
    resetLagPending: resetLagMutation.isPending,
    deletePending: deleteMutation.isPending,
    setSearchQuery,
    setSelectedStream,
    setFilterStatus,
    setShowMoreFilters,
    toggleConsumerSelection,
    clearConsumerSelection,
    selectAllConsumers,
    toggleExpand,
    isConsumerExpanded,
    refetch,
    handleBulkResume,
    handleBulkPause,
    handleBulkDelete,
    handleTogglePauseResume,
    handleResetLag,
    handleDeleteConsumer,
    getStatusIcon,
    getStatusLabel,
    getLagColor,
    clearFilters,
    toggleAll,
  };
}
