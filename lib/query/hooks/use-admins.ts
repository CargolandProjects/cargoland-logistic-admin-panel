import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qk } from "@/lib/query/keys";
import {
  listAdmins,
  createAdmin,
  updateAdminStatus,
  listAdminLogs,
  type LogListParams,
} from "@/lib/api/services/admin-users";
import { toastApiError } from "@/lib/api/form-errors";
import type { CreateAdminInput, UpdateAdminStatusInput } from "@/types/auth";

export function useAdmins() {
  return useQuery({
    queryKey: qk.admins.list(),
    queryFn: () => listAdmins(),
  });
}

export function useAdminLogs(params: LogListParams) {
  return useQuery({
    queryKey: qk.admins.logs(params),
    queryFn: () => listAdminLogs(params),
  });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAdminInput) => createAdmin(body),
    onSuccess: () => {
      toast.success("Admin invited");
      qc.invalidateQueries({ queryKey: qk.admins.all });
    },
    onError: (err) => toastApiError(err, "Could not create admin."),
  });
}

export function useUpdateAdminStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateAdminStatusInput) => updateAdminStatus(body),
    onSuccess: () => {
      toast.success("Admin status updated");
      qc.invalidateQueries({ queryKey: qk.admins.all });
    },
    onError: (err) => toastApiError(err, "Could not update status."),
  });
}
