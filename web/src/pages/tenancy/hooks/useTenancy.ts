import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ConnectionConfig, ConnectionStatus } from "../../../types";
import { TenancyService } from "../../../types";
import { useConfirm } from "../../../components/ConfirmDialog";
import { REFRESH_INTERVALS } from "../../../utils/constants";

type ConnectionTestResult = {
  healthy?: boolean;
  latency?: string | number;
  error?: string;
};

export interface UseTenancyReturn {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  editingConnection: ConnectionConfig | null;
  setEditingConnection: React.Dispatch<
    React.SetStateAction<ConnectionConfig | null>
  >;
  testingUrl: string;
  testResult: ConnectionTestResult | null;
  setTestResult: React.Dispatch<
    React.SetStateAction<ConnectionTestResult | null>
  >;
  connectionsLoading: boolean;
  statusesLoading: boolean;
  connectionsError: unknown;
  statusesError: unknown;
  connections: any;
  statuses: any;
  createMutation: any;
  updateMutation: any;
  deleteMutation: any;
  setDefaultMutation: any;
  testConnectionMutation: any;
  getErrorMessage: (error: unknown) => string;
  refetchConnections: () => void;
  getStatusForConnection: (id: string) => ConnectionStatus | undefined;
  handleTest: (url: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  formatDate: (dateString: string) => string;
  confirm: any;
}

export function useTenancy(): UseTenancyReturn {
  const [showModal, setShowModal] = useState(false);
  const [editingConnection, setEditingConnection] =
    useState<ConnectionConfig | null>(null);
  const [testingUrl, setTestingUrl] = useState("");
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(
    null,
  );
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();

  const getErrorMessage = useCallback((error: unknown) => {
    if (error instanceof Error) return error.message;
    return "Unable to load tenancy data";
  }, []);

  const {
    data: connections,
    isLoading: connectionsLoading,
    error: connectionsError,
    refetch: refetchConnections,
  } = useQuery({
    queryKey: ["tenancyConnections"],
    queryFn: () => TenancyService.getTenancyConnections(),
    refetchInterval: REFRESH_INTERVALS.SLOW,
  });

  const {
    data: statuses,
    isLoading: statusesLoading,
    error: statusesError,
  } = useQuery({
    queryKey: ["tenancyStatus"],
    queryFn: () =>
      TenancyService.getTenancyStatus() as unknown as Promise<{
        statuses: ConnectionStatus[];
      }>,
    refetchInterval: 15000,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<ConnectionConfig>) =>
      TenancyService.postTenancyConnections(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenancyConnections"] });
      setShowModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ConnectionConfig>;
    }) => TenancyService.putTenancyConnections(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenancyConnections"] });
      setEditingConnection(null);
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => TenancyService.deleteTenancyConnections(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenancyConnections"] });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => TenancyService.putTenancyConnectionsDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenancyConnections"] });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: (url: string) =>
      TenancyService.postTenancyConnectionsTest({ url }),
    onSuccess: (data) => {
      setTestResult(data as ConnectionTestResult);
    },
  });

  const getStatusForConnection = useCallback(
    (id: string) => {
      return (
        statuses as { statuses: ConnectionStatus[] } | undefined
      )?.statuses.find((s: ConnectionStatus) => s.id === id);
    },
    [statuses],
  );

  const handleTest = useCallback(
    (url: string) => {
      setTestingUrl(url);
      setTestResult(null);
      testConnectionMutation.mutate(url);
    },
    [testConnectionMutation],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        name: (formData.get("name") as string) || "",
        url: (formData.get("url") as string) || "",
        description: (formData.get("description") as string) || "",
      };
      if (editingConnection) {
        updateMutation.mutate({ id: editingConnection.id ?? "", data });
      } else {
        createMutation.mutate(data);
      }
    },
    [editingConnection, updateMutation, createMutation],
  );

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString();
  }, []);

  return {
    showModal,
    setShowModal,
    editingConnection,
    setEditingConnection,
    testingUrl,
    testResult,
    setTestResult,
    connectionsLoading,
    statusesLoading,
    connectionsError,
    statusesError,
    connections,
    statuses,
    createMutation,
    updateMutation,
    deleteMutation,
    setDefaultMutation,
    testConnectionMutation,
    getErrorMessage,
    refetchConnections,
    getStatusForConnection,
    handleTest,
    handleSubmit,
    formatDate,
    confirm,
  };
}
