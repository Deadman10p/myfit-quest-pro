import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminStats";

const ago = (iso: string | null) => {
  if (!iso) return "never";
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const AdminUsers: React.FC = () => {
  const { stats, loading, error } = useAdminStats();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (stats?.users ?? []).filter(u =>
      (u.name ?? "").toLowerCase().includes(q) ||
      (u.country ?? "").toLowerCase().includes(q) ||
      (u.goal ?? "").toLowerCase().includes(q)
    );
  }, [stats, search]);

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading users…</div>;
  if (error || !stats) return <p className="text-sm text-destructive">Could not load users: {error}</p>;

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">User Management</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, country or goal..." className="pl-10 bg-secondary" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-xs text-muted-foreground font-medium">User</th>
              <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">Plan</th>
              <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Country</th>
              <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden lg:table-cell">Goal</th>
              <th className="text-left p-3 text-xs text-muted-foreground font-medium">XP</th>
              <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Sessions</th>
              <th className="text-right p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center text-muted-foreground text-sm">No users found.</td></tr>
            ) : paged.map(u => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="p-3">
                  <p className="font-medium text-foreground">{u.name ?? "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">
                    joined {new Date(u.created_at).toLocaleDateString()} {u.onboarded ? "" : "• not onboarded"}
                  </p>
                </td>
                <td className="p-3 hidden sm:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded ${u.is_premium ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {u.is_premium ? "Premium" : "Free"}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{u.country ?? "—"}</td>
                <td className="p-3 text-muted-foreground hidden lg:table-cell">{u.goal ?? "—"}</td>
                <td className="p-3 text-foreground">{u.xp}</td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{u.sessions}</td>
                <td className="p-3 text-muted-foreground text-right hidden md:table-cell">{ago(u.last_active)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{filtered.length} users</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="touch-target">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-foreground flex items-center">{page}/{totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="touch-target">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
