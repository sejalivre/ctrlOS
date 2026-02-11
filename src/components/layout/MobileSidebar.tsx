"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Package,
    Wrench,
    FileText,
    DollarSign,
    Receipt,
    ClipboardList,
    BarChart3,
    Settings,
} from "lucide-react";
import { useState } from "react";

const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/os/dashboard", icon: BarChart3, label: "Dashboard OS" },
    { href: "/os", icon: ClipboardList, label: "Ordens de Serviço" },
    { href: "/customers", icon: Users, label: "Clientes" },
    { href: "/products", icon: Package, label: "Produtos" },
    { href: "/services", icon: Wrench, label: "Serviços" },
    { href: "/budgets", icon: FileText, label: "Orçamentos" },
    { href: "/sales", icon: Receipt, label: "Vendas" },
    { href: "/financial", icon: DollarSign, label: "Financeiro" },
    { href: "/reports", icon: BarChart3, label: "Relatórios" },
    { href: "/settings", icon: Settings, label: "Configurações" },
];

export function MobileSidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-full flex-col bg-card">
                    {/* Logo */}
                    <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                            C
                        </div>
                        <span className="text-xl font-bold">ctrlOS</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-border p-4">
                        <p className="text-xs text-muted-foreground text-center">
                            ctrlOS v0.1.0 (Mobile)
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
