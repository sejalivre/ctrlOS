// Verification: 2026-02-11 18:34:21
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
    const disableAuth = process.env.DISABLE_AUTH === "1";
    if (!disableAuth) {
        const user = await syncUserWithDatabase();
        if (!user) {
            redirect("/login");
        }
    }

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

