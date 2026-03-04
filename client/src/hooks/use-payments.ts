import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "./use-toast";

export function useAccuratePayments() {
  return useQuery({
    queryKey: [api.accuratePayments.list.path],
    queryFn: async () => {
      const res = await fetch(api.accuratePayments.list.path);
      if (!res.ok) throw new Error("Failed to fetch accurate payments");
      return api.accuratePayments.list.responses[200].parse(await res.json());
    }
  });
}

export function useBonusPayments() {
  return useQuery({
    queryKey: [api.bonusPayments.list.path],
    queryFn: async () => {
      const res = await fetch(api.bonusPayments.list.path);
      if (!res.ok) throw new Error("Failed to fetch bonus payments");
      return api.bonusPayments.list.responses[200].parse(await res.json());
    }
  });
}

export function useCreateAccuratePayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { date: string; amount: number | string }) => {
      const savedUsername = localStorage.getItem("courier_username");
      const url = savedUsername 
        ? `${api.accuratePayments.createOrUpdate.path}?username=${encodeURIComponent(savedUsername)}`
        : api.accuratePayments.createOrUpdate.path;

      const payload = { date: data.date, amount: Number(data.amount) };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Ошибка сохранения оплаты");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.accuratePayments.list.path] });
      toast({ title: "Оплата сохранена" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось сохранить оплату" });
    }
  });
}

export function useCreateBonusPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { startDate: string; endDate: string; amount: number | string }) => {
      const savedUsername = localStorage.getItem("courier_username");
      const url = savedUsername 
        ? `${api.bonusPayments.create.path}?username=${encodeURIComponent(savedUsername)}`
        : api.bonusPayments.create.path;

      const payload = { startDate: data.startDate, endDate: data.endDate, amount: Number(data.amount) };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Ошибка сохранения доплаты");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bonusPayments.list.path] });
      toast({ title: "Доплата сохранена" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось сохранить доплату" });
    }
  });
}
