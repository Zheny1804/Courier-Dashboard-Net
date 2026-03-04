import { useState, useMemo } from "react";
import { useAccuratePayments, useBonusPayments, useCreateAccuratePayment, useCreateBonusPayment } from "@/hooks/use-payments";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRuble, formatDate, formatShortDate } from "@/lib/format";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Plus, Wallet, FileText, CheckCircle2 } from "lucide-react";

export default function AccurateStatsPage() {
  const { data: accurateData, isLoading: isLoadingAccurate } = useAccuratePayments();
  const { data: bonusData, isLoading: isLoadingBonus } = useBonusPayments();
  const createAccurate = useCreateAccuratePayment();
  const createBonus = useCreateBonusPayment();

  // Form states
  const [accDate, setAccDate] = useState("");
  const [accAmount, setAccAmount] = useState("");
  
  const [bonusStart, setBonusStart] = useState("");
  const [bonusEnd, setBonusEnd] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");

  const handleAccurateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accDate || !accAmount) return;
    createAccurate.mutate({ date: accDate, amount: accAmount }, {
      onSuccess: () => {
        setAccDate("");
        setAccAmount("");
      }
    });
  };

  const handleBonusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusStart || !bonusEnd || !bonusAmount) return;
    createBonus.mutate({ startDate: bonusStart, endDate: bonusEnd, amount: bonusAmount }, {
      onSuccess: () => {
        setBonusStart("");
        setBonusEnd("");
        setBonusAmount("");
      }
    });
  };

  const combinedList = useMemo(() => {
    const list: Array<any> = [];
    if (accurateData) {
      list.push(...accurateData.map(d => ({ ...d, type: 'accurate', sortDate: d.date })));
    }
    if (bonusData) {
      list.push(...bonusData.map(d => ({ ...d, type: 'bonus', sortDate: d.endDate })));
    }
    return list.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
  }, [accurateData, bonusData]);

  const chartData = useMemo(() => {
    if (!accurateData) return [];
    return [...accurateData]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(d => ({
        date: d.date,
        displayDate: format(parseISO(d.date), 'd MMM', { locale: ru }),
        amount: Number(d.amount)
      }));
  }, [accurateData]);

  const totalAccurate = useMemo(() => accurateData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0, [accurateData]);
  const totalBonus = useMemo(() => bonusData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0, [bonusData]);

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
        <h1 className="text-3xl md:text-4xl font-display font-bold">Точная статистика</h1>
        <p className="text-muted-foreground text-lg">Фактические выплаты и бонусы от компании.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Forms */}
        <Card className="col-span-1 card-shadow rounded-3xl border-border/40 overflow-hidden bg-card/50">
          <Tabs defaultValue="accurate" className="w-full">
            <div className="p-2 bg-secondary/50">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="accurate" className="rounded-xl font-medium">За день</TabsTrigger>
                <TabsTrigger value="bonus" className="rounded-xl font-medium">За период</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="accurate" className="m-0 p-6 focus-visible:outline-none">
              <form onSubmit={handleAccurateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Дата</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      type="date" 
                      required
                      value={accDate}
                      onChange={(e) => setAccDate(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-background/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Сумма (₽)</Label>
                  <Input 
                    type="number" 
                    required 
                    placeholder="0"
                    value={accAmount}
                    onChange={(e) => setAccAmount(e.target.value)}
                    className="h-12 rounded-xl bg-background/50 font-display font-bold text-lg"
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/20 mt-2">
                  <Plus className="w-4 h-4 mr-2" /> Добавить
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="bonus" className="m-0 p-6 focus-visible:outline-none">
              <form onSubmit={handleBonusSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">С</Label>
                    <Input 
                      type="date" 
                      required
                      value={bonusStart}
                      onChange={(e) => setBonusStart(e.target.value)}
                      className="h-12 rounded-xl bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">По</Label>
                    <Input 
                      type="date" 
                      required
                      value={bonusEnd}
                      onChange={(e) => setBonusEnd(e.target.value)}
                      className="h-12 rounded-xl bg-background/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Сумма доплаты (₽)</Label>
                  <Input 
                    type="number" 
                    required 
                    placeholder="0"
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value)}
                    className="h-12 rounded-xl bg-background/50 font-display font-bold text-lg"
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/20 mt-2">
                  <Plus className="w-4 h-4 mr-2" /> Добавить
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Chart */}
        <Card className="col-span-1 lg:col-span-2 card-shadow p-6 rounded-3xl border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border/50 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider font-semibold text-muted-foreground">Всего получено</p>
                <p className="text-3xl font-display font-bold">{formatRuble(totalAccurate + totalBonus)}</p>
              </div>
            </div>
            <div className="bg-secondary/50 rounded-xl px-4 py-2 flex flex-col items-end">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Из них бонусы</p>
              <p className="font-display font-bold text-primary">{formatRuble(totalBonus)}</p>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAccurate" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#colorAccurate)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center border border-dashed border-border/50 rounded-2xl bg-secondary/20">
                <p className="text-muted-foreground">Нет данных о выплатах</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-display font-bold border-b border-border/50 pb-4">История начислений</h2>
        
        {isLoadingAccurate || isLoadingBonus ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : combinedList.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border/60 bg-secondary/20">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">История выплат пуста</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {combinedList.map((item, idx) => (
              <div 
                key={`${item.type}-${item.id}-${idx}`} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-card border border-border/40 card-shadow gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.type === 'bonus' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                    {item.type === 'bonus' ? <Plus className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg">
                      {item.type === 'bonus' ? 'Доплата за период' : 'Оплата за день'}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      {item.type === 'bonus' 
                        ? `${formatShortDate(item.startDate)} — ${formatShortDate(item.endDate)}`
                        : formatDate(item.date)}
                    </p>
                  </div>
                </div>
                <div className="sm:text-right bg-secondary/30 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Сумма</p>
                  <p className="font-display font-bold text-2xl text-primary">{formatRuble(item.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
