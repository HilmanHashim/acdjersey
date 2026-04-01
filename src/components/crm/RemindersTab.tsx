import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const RemindersTab = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ contact_id: "", title: "", description: "", due_date: "" });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contacts").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("follow_up_reminders").select("*, contacts(name)").order("due_date");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("follow_up_reminders").insert({
        contact_id: form.contact_id,
        title: form.title,
        description: form.description || null,
        due_date: new Date(form.due_date).toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder created");
      setForm({ contact_id: "", title: "", description: "", due_date: "" });
      setOpen(false);
    },
    onError: () => toast.error("Failed to create reminder"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from("follow_up_reminders").update({ is_completed: completed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("follow_up_reminders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder deleted");
    },
  });

  const now = new Date();
  const pending = reminders.filter((r: any) => !r.is_completed);
  const completed = reminders.filter((r: any) => r.is_completed);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><Plus className="h-4 w-4 mr-1" /> New Reminder</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">New Reminder</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-3">
              <Select value={form.contact_id} onValueChange={(v) => setForm({ ...form, contact_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select customer *" /></SelectTrigger>
                <SelectContent>{contacts.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Reminder title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
              <Button type="submit" variant="hero" className="w-full" disabled={saveMutation.isPending || !form.contact_id}>Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : reminders.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No reminders yet.</p>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-display text-sm text-muted-foreground flex items-center gap-2"><Bell className="h-4 w-4" /> Upcoming ({pending.length})</h3>
              {pending.map((r: any) => {
                const overdue = new Date(r.due_date) < now;
                return (
                  <div key={r.id} className={`flex items-start gap-3 p-3 rounded-lg border ${overdue ? "border-destructive/40 bg-destructive/5" : "border-border bg-card"}`}>
                    <Checkbox checked={false} onCheckedChange={() => toggleMutation.mutate({ id: r.id, completed: true })} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{r.title}</p>
                      <p className="text-sm text-muted-foreground">{r.contacts?.name} · {format(new Date(r.due_date), "MMM d, yyyy h:mm a")}</p>
                      {r.description && <p className="text-sm text-muted-foreground mt-1">{r.description}</p>}
                      {overdue && <p className="text-xs text-destructive font-medium mt-1">Overdue</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                );
              })}
            </div>
          )}
          {completed.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-display text-sm text-muted-foreground flex items-center gap-2"><BellOff className="h-4 w-4" /> Completed ({completed.length})</h3>
              {completed.map((r: any) => (
                <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card opacity-60">
                  <Checkbox checked onCheckedChange={() => toggleMutation.mutate({ id: r.id, completed: false })} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-through">{r.title}</p>
                    <p className="text-sm text-muted-foreground">{r.contacts?.name}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RemindersTab;
