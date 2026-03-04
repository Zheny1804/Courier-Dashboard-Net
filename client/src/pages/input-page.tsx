import { useState, useRef, useEffect } from "react";
import { useOrders, useCreateOrder, useDeleteOrder } from "@/hooks/use-orders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRuble, formatShortDate } from "@/lib/format";
import { Plus, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { isToday, parseISO } from "date-fns";

export default function InputPage() {
  const [amount, setAmount] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: orders, isLoading } = useOrders();
  const createOrder = useCreateOrder();
  const deleteOrder = useDeleteOrder();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    createOrder.mutate({ amount }, {
      onSuccess: () => {
        setAmount("");
        inputRef.current?.focus();
      }
    });
  };

  // Filter only today's orders for the quick list
  const todaysOrders = orders?.filter(o => {
    if (!o.createdAt) return false;
    return isToday(parseISO(o.createdAt));
  }).sort((a, b) => {
    return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
  }) || [];

  const todayTotal = todaysOrders.reduce((sum, order) => sum + Number(order.amount), 0);

  // Autofocus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold">Ввод заказов</h1>
        <p className="text-muted-foreground text-lg">Быстрое добавление выполненных доставок за сегодня.</p>
      </div>

      <Card className="card-shadow p-6 md:p-10 border-border/40 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Plus className="w-64 h-64" />
        </div>
        
        <form onSubmit={handleSubmit} className="relative z-10 max-w-md">
          <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
            Сумма заказа (₽)
          </label>
          <div className="flex items-center gap-4">
            <Input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-20 text-4xl md:text-5xl font-display font-bold rounded-2xl bg-secondary/50 border-border/50 focus-visible:ring-primary/20 px-6 w-full"
              autoFocus
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-20 w-20 rounded-2xl shrink-0 shadow-xl shadow-primary/20"
              disabled={createOrder.isPending || !amount}
              data-testid="button-submit-order"
            >
              <Plus className="w-8 h-8" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Нажмите Enter для быстрого сохранения
          </p>
        </form>
      </Card>

      <div className="space-y-4 mt-4">
        <div className="flex items-end justify-between mb-6 border-b border-border/50 pb-4">
          <h2 className="text-xl font-display font-bold">За сегодня</h2>
          <div className="text-right">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Итого</p>
            <p className="text-2xl font-display font-bold text-primary">{formatRuble(todayTotal)}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : todaysOrders.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border/60 bg-secondary/20">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">Сегодня заказов еще нет</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {todaysOrders.map((order) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 card-shadow hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg">{formatRuble(order.amount)}</p>
                    <p className="text-xs text-muted-foreground">{formatShortDate(order.createdAt)}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => deleteOrder.mutate(order.id)}
                  disabled={deleteOrder.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
