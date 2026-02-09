import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
    OPENED: { label: "Aberta", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
    IN_QUEUE: { label: "Na Fila", className: "bg-slate-100 text-slate-700 hover:bg-slate-100" },
    IN_PROGRESS: { label: "Em Manutenção", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
    AWAITING_PARTS: { label: "Aguardando Peça", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
    READY: { label: "Pronta", className: "bg-green-100 text-green-700 hover:bg-green-100" },
    DELIVERED: { label: "Entregue", className: "bg-slate-900 text-white hover:bg-slate-900" },
    CANCELLED: { label: "Cancelada", className: "bg-red-100 text-red-700 hover:bg-red-100" },
    WARRANTY_RETURN: { label: "Garantia", className: "bg-orange-100 text-orange-700 hover:bg-orange-100" },
};

export function OSStatusBadge({ status, className }: { status: string; className?: string }) {
    const config = statusConfig[status] || { label: status, className: "" };

    return (
        <Badge className={cn("font-medium", config.className, className)}>
            {config.label}
        </Badge>
    );
}
