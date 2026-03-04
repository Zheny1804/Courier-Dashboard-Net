import { useMemo } from "react";
import { useOrders, useDeleteOrder } from "@/hooks/use-orders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRuble, formatShortDate } from "@/lib/format";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Trash2, TrendingUp, Inbox } from "lucide-react";

export default function ApproxStatsPage() {
  const { data: orders, isLoading } = useOrders();
  const deleteOrder = useDeleteOrder();

  const chartData = useMemo(() => {
    if (!orders) return [];
    
    // Group by day
    const grouped = orders.reduce((acc, order) => {
      if (!order.createdAt) return acc;
      const dateStr = format(parseISO(order.createdAt), 'yyyy-MM-dd');
      if (!acc[dateStr]) acc[dateStr] = 0;
      acc[dateStr] += Number(order.amount);
      return acc;
    }, {} as Record<string, number>);

    // Sort by date ascending for chart
    return Object.entries(grouped)
      .map(([date, amount]) => ({
        date,
        displayDate: format(parseISO(date), 'd MMM', { locale: ru }),
        amount
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [orders]);

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }, [orders]);

  const totalAmount = useMemo(() => orders?.reduce((s, o) => s + Number(o.amount), 0) || 0, [orders]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 p-4 rounded-xl shadow-xl">
          <p className="text-sm font-semibold text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-display font-bold text-primary">
            {formatRuble(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold">Приблизительная статистика</h1>
        <p className="text-muted-foreground text-lg">Аналитика по всем добавленным заказам.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-3 card-shadow p-6 rounded-3xl border-border/40">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider font-semibold text-muted-foreground">Сумма всех заказов</p>
              <p className="text-3xl font-display font-bold">{formatRuble(totalAmount)}</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full mt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(val) => `${val} ₽`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center border border-dashed border-border/50 rounded-2xl bg-secondary/20">
                <p className="text-muted-foreground">Недостаточно данных для графика</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-display font-bold border-b border-border/50 pb-4">Детализация заказов</h2>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-16 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border/60 bg-secondary/20">
            <Inbox className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">Нет истории заказов</p>
          </div>
        ) : (
          <div className="bg-card border border-border/40 rounded-2xl overflow-hidden card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-semibold tracking-wider">Дата и время</th>
                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Сумма</th>
                    <th className="px-6 py-4 font-semibold tracking-wider text-center w-20">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {sortedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        {order.createdAt ? format(parseISO(order.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-display font-bold text-base">
                        {formatRuble(order.amount)}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteOrder.mutate(order.id)}
                          disabled={deleteOrder.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
