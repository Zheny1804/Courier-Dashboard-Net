import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "./use-toast";

export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    }
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { amount: number | string }) => {
      const savedUsername = localStorage.getItem("courier_username");
      const url = savedUsername 
        ? `${api.orders.create.path}?username=${encodeURIComponent(savedUsername)}`
        : api.orders.create.path;

      const payload = { amount: Number(data.amount) };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Ошибка создания заказа");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({ title: "Заказ добавлен", description: "Сумма успешно учтена" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось добавить заказ" });
    }
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.orders.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Ошибка удаления заказа");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({ title: "Заказ удален" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось удалить заказ" });
    }
  });
}
