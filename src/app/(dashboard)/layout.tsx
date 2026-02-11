import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { syncUserWithDatabase } from "@/lib/auth-helpers";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Temporariamente desativado para testes
    // const user = await syncUserWithDatabase();
    // if (!user) {
    //     redirect("/login");
    // }

    return (
        <Providers>
            <div className="flex h-screen bg-background">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">{children}</main>
                </div>
            </div>
        </Providers>
    );
}
