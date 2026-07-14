import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { KVBucketInfo, KVKeyEntry, KVKeyHistoryEntry } from "../../../types";
import { KvService } from "../../../types";
import { useConfirm } from "../../../components/ConfirmDialog";
import { useToast } from "../../../components/Toast";
import { REFRESH_INTERVALS } from "../../../utils/constants";

export interface UseKVStoreReturn {
  selectedBucket: string | null;
  searchQuery: string;
  showCreateModal: boolean;
  showKeyModal: boolean;
  showHistoryModal: boolean;
  selectedKey: string | null;
  modalMode: "create" | "edit";
  selectedKeyResult: KVKeyEntry | null;
  buckets: KVBucketInfo[] | undefined;
  bucketsLoading: boolean;
  bucketsError: unknown;
  keys: KVKeyEntry[] | undefined;
  keysLoading: boolean;
  keysError: unknown;
  history: KVKeyHistoryEntry[] | undefined;
  historyError: unknown;
  createBucketPending: boolean;
  deleteBucketPending: boolean;
  purgeBucketPending: boolean;
  putKeyPending: boolean;
  getKeyPending: boolean;
  deleteKeyPending: boolean;
  filteredKeys: KVKeyEntry[];
  setSelectedBucket: (value: string | null) => void;
  setSearchQuery: (value: string) => void;
  setShowCreateModal: (value: boolean) => void;
  setShowKeyModal: (value: boolean) => void;
  setShowHistoryModal: (value: boolean) => void;
  setSelectedKey: (value: string | null) => void;
  setModalMode: (value: "create" | "edit") => void;
  setSelectedKeyResult: (value: KVKeyEntry | null) => void;
  refetchBuckets: () => void;
  handleCreateBucket: (data: Record<string, any>) => void;
  handleDeleteBucket: (name: string) => Promise<void>;
  handlePurgeBucket: () => Promise<void>;
  handlePutKey: (data: { key: string; value: string }) => void;
  handleGetKey: (key: string) => void;
  handleDeleteKey: (key: string) => Promise<void>;
}

export function useKVStore(): UseKVStoreReturn {
  const { confirm } = useConfirm();
  const { t } = useTranslation();
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedKeyResult, setSelectedKeyResult] = useState<KVKeyEntry | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getMutationErrorMessage = (error: any) =>
    error?.response?.data?.error || error?.message || "Operation failed";

  const { data: buckets, refetch: refetchBuckets, isLoading: bucketsLoading, error: bucketsError } = useQuery({
    queryKey: ["kvBuckets"],
    queryFn: () => KvService.getKvBuckets(),
    refetchInterval: REFRESH_INTERVALS.NORMAL,
  });

  const { data: keys, isLoading: keysLoading, error: keysError } = useQuery<KVKeyEntry[]>({
    queryKey: ["kvKeys", selectedBucket ?? ""],
    queryFn: () => selectedBucket ? KvService.getKvBucketsKeys(selectedBucket) : Promise.resolve([]),
    enabled: !!selectedBucket,
  });

  const { data: history, error: historyError } = useQuery<KVKeyHistoryEntry[]>({
    queryKey: ["kvHistory", selectedBucket ?? "", selectedKey ?? ""],
    queryFn: () => selectedBucket && selectedKey ? KvService.getKvBucketsHistory(selectedBucket, selectedKey) : Promise.resolve([]),
    enabled: !!selectedBucket && !!selectedKey && showHistoryModal,
  });

  const createBucketMutation = useMutation({
    mutationFn: (data: Record<string, any>) => KvService.postKvBuckets(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kvBuckets"] });
      setShowCreateModal(false);
      toast("success", "Bucket created successfully!");
    },
    onError: (error: any) => toast("error", `Failed to create bucket: ${error?.response?.data?.error || error?.message}`),
  });

  const deleteBucketMutation = useMutation({
    mutationFn: (name: string) => KvService.deleteKvBuckets(name),
    onSuccess: (_: unknown, bucketName: string) => {
      if (selectedBucket === bucketName) setSelectedBucket(null);
      queryClient.invalidateQueries({ queryKey: ["kvBuckets"] });
      toast("success", `Bucket "${name}" deleted successfully!`);
    },
    onError: (error: any) => toast("error", `Failed to delete bucket: ${getMutationErrorMessage(error)}`),
  });

  const purgeBucketMutation = useMutation({
    mutationFn: (name: string) => KvService.postKvBucketsPurge(name),
    onSuccess: () => {
      if (selectedBucket) queryClient.invalidateQueries({ queryKey: ["kvKeys", selectedBucket] });
      toast("success", "Bucket purge completed successfully!");
    },
    onError: (error: any) => toast("error", `Failed to purge bucket: ${getMutationErrorMessage(error)}`),
  });

  const putKeyMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => {
      if (!selectedBucket) throw new Error("No bucket selected");
      return KvService.putKvBucketsKey(selectedBucket, { key, value });
    },
    onSuccess: () => {
      if (selectedBucket) queryClient.invalidateQueries({ queryKey: ["kvKeys", selectedBucket] });
      setShowKeyModal(false);
    },
  });

  const getKeyMutation = useMutation({
    mutationFn: (key: string) => {
      if (!selectedBucket) throw new Error("No bucket selected");
      return KvService.getKvBucketsKey(selectedBucket, key) as Promise<KVKeyEntry>;
    },
    onSuccess: (data) => {
      setSelectedKeyResult(data);
      setSelectedKey(data.key || selectedKey || "");
    },
    onError: (error: any) => toast("error", `Failed to get key: ${getMutationErrorMessage(error)}`),
  });

  const deleteKeyMutation = useMutation({
    mutationFn: (key: string) => {
      if (!selectedBucket) throw new Error("No bucket selected");
      return KvService.deleteKvBucketsKey(selectedBucket, key);
    },
    onSuccess: () => {
      if (selectedBucket) queryClient.invalidateQueries({ queryKey: ["kvKeys", selectedBucket] });
    },
  });

  const filteredKeys = keys?.filter((k: KVKeyEntry) => {
    const key = k.key ?? "";
    const value = k.value ?? "";
    return key.toLowerCase().includes(searchQuery.toLowerCase()) || value.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const handleCreateBucket = (data: Record<string, any>) => createBucketMutation.mutate(data);

  const handleDeleteBucket = async (name: string) => {
    const ok = await confirm({ title: t('kvStore.deleteBucket'), message: t('kvStore.deleteBucketConfirm', { name }), confirmLabel: t('common.delete'), variant: "danger" });
    if (ok) deleteBucketMutation.mutate(name);
  };

  const handlePurgeBucket = async () => {
    if (!selectedBucket) return;
    const ok = await confirm({ title: t('kvStore.purgeBucket'), message: t('kvStore.purgeBucketConfirm', { name: selectedBucket }), confirmLabel: t('common.purge'), variant: "warning" });
    if (ok) purgeBucketMutation.mutate(selectedBucket);
  };

  const handlePutKey = (data: { key: string; value: string }) => putKeyMutation.mutate(data);
  const handleGetKey = (key: string) => getKeyMutation.mutate(key);

  const handleDeleteKey = async (key: string) => {
    const ok = await confirm({ title: t('kvStore.deleteKey'), message: t('kvStore.deleteKeyConfirm', { key }), confirmLabel: t('common.delete'), variant: "danger" });
    if (ok) deleteKeyMutation.mutate(key);
  };

  return {
    selectedBucket, searchQuery, showCreateModal, showKeyModal, showHistoryModal,
    selectedKey, modalMode, selectedKeyResult,
    buckets, bucketsLoading, bucketsError, keys, keysLoading, keysError,
    history, historyError,
    createBucketPending: createBucketMutation.isPending,
    deleteBucketPending: deleteBucketMutation.isPending,
    purgeBucketPending: purgeBucketMutation.isPending,
    putKeyPending: putKeyMutation.isPending,
    getKeyPending: getKeyMutation.isPending,
    deleteKeyPending: deleteKeyMutation.isPending,
    filteredKeys,
    setSelectedBucket, setSearchQuery, setShowCreateModal, setShowKeyModal,
    setShowHistoryModal, setSelectedKey, setModalMode, setSelectedKeyResult,
    refetchBuckets, handleCreateBucket, handleDeleteBucket, handlePurgeBucket,
    handlePutKey, handleGetKey, handleDeleteKey,
  };
}
