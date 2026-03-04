import { Link, useLocation } from "wouter";
import { 
  PlusCircle, 
  BarChart3, 
  Wallet, 
  LogOut, 
  User,
  Package
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarFooter
} from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Ввод", href: "/", icon: PlusCircle },
    { name: "Приблизительная", href: "/approx", icon: BarChart3 },
    { name: "Точная статистика", href: "/accurate", icon: Wallet },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background/50">
        <Sidebar variant="inset" className="border-r border-border/50">
          <SidebarContent>
            <div className="p-6">
              <div className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-foreground">
                <Package className="w-6 h-6 text-primary" />
                CourierDash
              </div>
            </div>
            
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold mb-2">
                Меню
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-2">
                  {navigation.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          className={`
                            h-11 rounded-xl px-4 transition-all duration-200
                            ${isActive 
                              ? 'bg-primary text-primary-foreground font-medium shadow-md shadow-primary/10' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'}
                          `}
                        >
                          <Link href={item.href} className="flex items-center gap-3 w-full">
                            <item.icon className={`w-5 h-5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                            <span className="text-[15px]">{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="p-4 border-t border-border/50 bg-card/50">
            <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-secondary/50 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-foreground">{user?.username}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 h-11 rounded-xl border-border/50 text-muted-foreground hover:text-foreground"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
            <div className="max-w-5xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
