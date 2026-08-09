import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SecurityService, User } from "../../../types";
import { useConfirm } from "../../../components/ConfirmDialog";
import { formatBytes } from "../../../utils/formatters";
import { REFRESH_INTERVALS } from "../../../utils/constants";

export interface UseSecurityReturn {
  activeTab: "overview" | "users";
  setActiveTab: React.Dispatch<
    React.SetStateAction<"overview" | "users">
  >;
  showUserModal: boolean;
  setShowUserModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  securityInfo: any;
  users: User[] | undefined;
  infoLoading: boolean;
  usersLoading: boolean;
  infoError: unknown;
  usersError: unknown;
  getErrorMessage: (error: unknown) => string;
  refetchInfo: () => void;
  createUserMutation: any;
  updateUserMutation: any;
  deleteUserMutation: any;
  formatBytes: (bytes: number) => string;
  confirm: any;
}

export function useSecurity(): UseSecurityReturn {
  const [activeTab, setActiveTab] = useState<"overview" | "users">(
    "overview",
  );
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { confirm } = useConfirm();

  const getErrorMessage = useCallback((error: unknown) => {
    if (error instanceof Error) return error.message;
    return "Unable to load security data";
  }, []);

  const {
    data: securityInfo,
    isLoading: infoLoading,
    error: infoError,
    refetch: refetchInfo,
  } = useQuery({
    queryKey: ["securityInfo"],
    queryFn: () => SecurityService.getSecurityInfo(),
    refetchInterval: REFRESH_INTERVALS.SLOW,
  });

  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["securityUsers"],
    queryFn: () => SecurityService.getSecurityUsers(),
    enabled: activeTab === "users",
  });

  const createUserMutation = useMutation({
    mutationFn: (data: Partial<User>) => {
      const payload = {
        name: data.name,
        account: data.account || "default",
        permissions: data.permissions || {
          publish: { ">": "allow" },
          subscribe: { ">": "allow" },
        },
        enabled: data.enabled !== false,
      };
      return SecurityService.postSecurityUsers(payload as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["securityUsers"] });
      setShowUserModal(false);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ name, data }: { name: string; data: Partial<User> }) =>
      SecurityService.putSecurityUsers(name, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["securityUsers"] });
      setShowUserModal(false);
      setSelectedUser(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (name: string) => SecurityService.deleteSecurityUsers(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["securityUsers"] });
    },
  });

  return {
    activeTab,
    setActiveTab,
    showUserModal,
    setShowUserModal,
    selectedUser,
    setSelectedUser,
    securityInfo,
    users,
    infoLoading,
    usersLoading,
    infoError,
    usersError,
    getErrorMessage,
    refetchInfo,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
    formatBytes,
    confirm,
  };
}
