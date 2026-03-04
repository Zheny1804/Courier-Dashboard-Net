import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "./use-toast";

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const savedUsername = localStorage.getItem("courier_username");
      const url = savedUsername 
        ? `${api.auth.me.path}?username=${encodeURIComponent(savedUsername)}`
        : api.auth.me.path;
        
      const res = await fetch(url);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return await res.json();
    },
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: typeof api.auth.login.input._type) => {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Неверные учетные данные");
        throw new Error("Ошибка входа");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("courier_username", data.username);
      queryClient.setQueryData([api.auth.me.path], data);
      toast({ title: "Успешный вход", description: `Добро пожаловать, ${data.username}!` });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Ошибка", description: error.message });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof api.auth.register.input._type) => {
      const res = await fetch(api.auth.register.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) throw new Error("Пользователь уже существует или неверные данные");
        throw new Error("Ошибка регистрации");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("courier_username", data.username);
      queryClient.setQueryData([api.auth.me.path], data);
      toast({ title: "Регистрация успешна", description: "Аккаунт создан." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Ошибка", description: error.message });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem("courier_username");
      const res = await fetch(api.auth.logout.path, { method: "POST" });
      if (!res.ok) throw new Error("Ошибка выхода");
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      queryClient.clear();
      toast({ title: "Выход выполнен" });
    }
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
  };
}
