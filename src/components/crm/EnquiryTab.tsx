import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Enquiry = {
  id: string;
  name: string;
  phone: string;
  organisation: string | null;
  estimated_quantity: number | null;
  jersey_type: string | null;
  status: "new" | "contacted" | "converted" | "closed";
  followed_up_by: string | null;
  notes: string | null;
  created_at: string;
};

const statusBadge: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  contacted: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  converted: "bg-green-500/10 text-green-600 border-green-500/30",
  closed: "bg-muted text-muted-foreground border-border",
};

const statusLabel: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted",
  closed: "Closed",
};

const malaysiaTimestampFormatter = new Intl.DateTimeFormat("en-MY", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kuala_Lumpur",
});

const EnquiryTab = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ["enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Enquiry[];
    },
  });

  // Fetch CRM users for follow-up dropdown
  const { data: authUsers = [] } = useQuery({
    queryKey: ["auth-users-list"],
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
      if (!res.ok) return [];
      const json = await res.json();
      return (json.users ?? []) as { id: string; email: string }[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Enquiry> }) => {
      const { error } = await supabase.from("enquiries").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
    },
    onError: () => toast.error("Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("enquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      toast.success("Enquiry deleted");
    },
  });

  const handleWhatsApp = (phone: string, name: string) => {
    const cleaned = phone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(`Hi ${name}, thank you for your enquiry with ACD Jersey! We'd like to follow up regarding your custom jersey request.`);
    window.open(`https://wa.me/${cleaned}?text=${msg}`, "_blank");
  };

  const filtered = enquiries.filter((e) => {
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const matchesSearch = !search || [e.name, e.phone, e.organisation, e.jersey_type]
      .some((v) => v?.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safeCurrentPage - 1) * rowsPerPage, safeCurrentPage * rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const statusCounts = {
    all: enquiries.length,
    new: enquiries.filter((e) => e.status === "new").length,
    contacted: enquiries.filter((e) => e.status === "contacted").length,
    converted: enquiries.filter((e) => e.status === "converted").length,
    closed: enquiries.filter((e) => e.status === "closed").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search enquiries..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "new", "contacted", "converted", "closed"] as const).map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s === "all" ? "All" : statusLabel[s]} ({statusCounts[s]})
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No enquiries found</p>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Followed Up By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((enq) => (
                <TableRow key={enq.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {malaysiaTimestampFormatter.format(new Date(enq.created_at))}
                  </TableCell>
                  <TableCell className="font-medium">{enq.name}</TableCell>
                  <TableCell>{enq.phone}</TableCell>
                  <TableCell>{enq.organisation || "—"}</TableCell>
                  <TableCell>{enq.estimated_quantity ?? "—"}</TableCell>
                  <TableCell>{enq.jersey_type || "—"}</TableCell>
                  <TableCell>
                    <Select
                      value={enq.status}
                      onValueChange={(v) => updateMutation.mutate({ id: enq.id, updates: { status: v as Enquiry["status"] } })}
                    >
                      <SelectTrigger className="h-7 w-[110px] text-xs">
                        <Badge variant="outline" className={statusBadge[enq.status]}>
                          {statusLabel[enq.status]}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabel).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={enq.followed_up_by || "none"}
                      onValueChange={(v) => updateMutation.mutate({ id: enq.id, updates: { followed_up_by: v === "none" ? null : v } })}
                    >
                      <SelectTrigger className="h-7 w-[140px] text-xs">
                        <SelectValue placeholder="Assign..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {authUsers.map((u) => (
                          <SelectItem key={u.id} value={u.email}>
                            {u.email.split("@")[0]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-green-600"
                        onClick={() => handleWhatsApp(enq.phone, enq.name)}
                        title="WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => { if (confirm("Delete this enquiry?")) deleteMutation.mutate(enq.id); }}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length > rowsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
              <span>
                Showing {(safeCurrentPage - 1) * rowsPerPage + 1}-{Math.min(safeCurrentPage * rowsPerPage, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                >
                  Previous
                </Button>
                <span className="min-w-20 text-center">
                  Page {safeCurrentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnquiryTab;
