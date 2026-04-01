import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type AuthUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
};

const UsersTab = ({ currentUserId }: { currentUserId: string }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [editForm, setEditForm] = useState({ email: "", password: "" });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["auth-users"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users?action=list`,
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch users");
      return (await res.json()) as AuthUser[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users?action=create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: form.email, password: form.password }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-users"] });
      toast.success("User created");
      setForm({ email: "", password: "" });
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users?action=update`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: editing.id,
            email: editForm.email || undefined,
            password: editForm.password || undefined,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-users"] });
      toast.success("User updated");
      setEditing(null);
      setEditOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users?action=delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-users"] });
      toast.success("User deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (u: AuthUser) => {
    setEditing(u);
    setEditForm({ email: u.email, password: "" });
    setEditOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><UserPlus className="h-4 w-4 mr-1" /> Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Create User</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-3">
              <Input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input type="password" placeholder="Password * (min 6 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
              <Button type="submit" variant="hero" className="w-full" disabled={createMutation.isPending}>Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setEditing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Edit User</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }} className="space-y-3">
            <Input type="email" placeholder="New email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <Input type="password" placeholder="New password (leave blank to keep)" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} minLength={6} />
            <Button type="submit" variant="hero" className="w-full" disabled={updateMutation.isPending}>Update</Button>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No users found.</p>
      ) : (
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.email}
                    {u.id === currentUserId && <span className="ml-2 text-xs text-primary">(you)</span>}
                  </TableCell>
                  <TableCell>{format(new Date(u.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>{u.last_sign_in_at ? format(new Date(u.last_sign_in_at), "MMM d, yyyy h:mm a") : "Never"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                      {u.id !== currentUserId && (
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this user?")) deleteMutation.mutate(u.id); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
