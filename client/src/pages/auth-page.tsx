import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Loader2 } from "lucide-react";

export default function AuthPage() {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    await login({ username, password });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    await register({ username, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="mb-8 flex items-center gap-3 z-10">
        <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/20">
          <Package className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-display font-bold tracking-tight">CourierDash</h1>
      </div>

      <Card className="w-full max-w-md card-shadow border-border/40 z-10 bg-card/60 backdrop-blur-xl">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="pb-0">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-secondary/60 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg">Вход</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg">Регистрация</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="pt-6">
            <TabsContent value="login" className="m-0 focus-visible:outline-none">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-user" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Логин</Label>
                  <Input 
                    id="login-user" 
                    placeholder="Введите имя пользователя"
                    className="h-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-primary/20"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-pass" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Пароль</Label>
                  <Input 
                    id="login-pass" 
                    type="password" 
                    placeholder="Введите пароль"
                    className="h-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-primary/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-semibold mt-6 shadow-lg shadow-primary/20" 
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Войти"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="m-0 focus-visible:outline-none">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-user" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Логин</Label>
                  <Input 
                    id="reg-user" 
                    placeholder="Придумайте имя пользователя"
                    className="h-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-primary/20"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-pass" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Пароль</Label>
                  <Input 
                    id="reg-pass" 
                    type="password" 
                    placeholder="Придумайте пароль"
                    className="h-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-primary/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-semibold mt-6 shadow-lg shadow-primary/20" 
                  disabled={isRegistering}
                >
                  {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : "Зарегистрироваться"}
                </Button>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
