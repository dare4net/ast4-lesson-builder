export default function DashboardRouteLoading() {
    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#58CC02]" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading...</p>
        </div>
    )
}
