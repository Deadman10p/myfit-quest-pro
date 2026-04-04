import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Ban, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const mockUsers = Array.from({ length: 25 }, (_, i) => ({
  id: `u${i + 1}`,
  email: `user${i + 1}@example.com`,
  name: `User ${i + 1}`,
  subscription: i % 3 === 0 ? "Premium" : "Free",
  registered: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
  country: ["USA", "UK", "Uganda", "India", "Germany"][i % 5],
  goal: ["Bodybuilding", "Weight Loss", "Calisthenics", "General Fitness"][i % 4],
  lastActive: `${Math.floor(Math.random() * 24)}h ago`,
  status: "active" as "active" | "suspended",
}));

const AdminUsers: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = mockUsers.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">User Management</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="pl-10 bg-secondary" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-xs text-muted-foreground font-medium">User</th>
              <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">Plan</th>
              <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Country</th>
              <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden lg:table-cell">Goal</th>
              <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Last Active</th>
              <th className="text-right p-3 text-xs text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(u => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="p-3">
                  <p className="font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="p-3 hidden sm:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded ${u.subscription === "Premium" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {u.subscription}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{u.country}</td>
                <td className="p-3 text-muted-foreground hidden lg:table-cell">{u.goal}</td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{u.lastActive}</td>
                <td className="p-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="outline" size="sm" className="text-xs touch-target"><Ban className="w-3 h-3" /></Button>
                    <Button variant="outline" size="sm" className="text-xs text-destructive touch-target"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </td>
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
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="touch-target">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
