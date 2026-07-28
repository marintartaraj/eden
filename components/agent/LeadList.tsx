"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateLeadStatus, updateFollowUpDate, addLeadNote } from "@/lib/actions/agent-leads";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { AgentLead } from "@/lib/data/agent-leads";
import type { Database } from "@/types/supabase";

type InquiryStatus = Database["public"]["Enums"]["inquiry_status"];
type LeadNote = Database["public"]["Tables"]["lead_notes"]["Row"];

const STATUSES: InquiryStatus[] = ["new", "contacted", "qualified", "closed"];

type AgentOption = { id: string; full_name: string };

function LeadRow({
  lead,
  agents,
  onAssign,
}: {
  lead: AgentLead;
  agents?: AgentOption[];
  onAssign?: (leadId: string, agentId: string) => Promise<unknown>;
}) {
  const t = useTranslations("agentLeads");
  const adminT = useTranslations("adminLeads");
  const [status, setStatus] = useState<InquiryStatus>(lead.status);
  const [followUpDate, setFollowUpDate] = useState(lead.follow_up_date ?? "");
  const [assignedAgentId, setAssignedAgentId] = useState(lead.assigned_agent_id ?? "");
  const [assigning, setAssigning] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState<LeadNote[] | null>(null);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  async function handleAssignChange(nextAgentId: string) {
    if (!onAssign) return;
    setAssignedAgentId(nextAgentId);
    setAssigning(true);
    await onAssign(lead.id, nextAgentId);
    setAssigning(false);
  }

  async function handleStatusChange(next: InquiryStatus) {
    setStatus(next);
    await updateLeadStatus(lead.id, next);
  }

  async function handleFollowUpChange(next: string) {
    setFollowUpDate(next);
    await updateFollowUpDate(lead.id, next || null);
  }

  async function toggleNotes() {
    const opening = !notesOpen;
    setNotesOpen(opening);
    if (opening && notes === null) {
      const supabase = createClient();
      const { data } = await supabase
        .from("lead_notes")
        .select("*")
        .eq("inquiry_id", lead.id)
        .order("created_at", { ascending: false });
      setNotes(data ?? []);
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;
    setSavingNote(true);
    const result = await addLeadNote(lead.id, newNote.trim());
    if (result.success) {
      const supabase = createClient();
      const { data } = await supabase
        .from("lead_notes")
        .select("*")
        .eq("inquiry_id", lead.id)
        .order("created_at", { ascending: false });
      setNotes(data ?? []);
      setNewNote("");
    }
    setSavingNote(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-medium text-foreground">{lead.name}</p>
          <p className="text-sm text-muted">
            {lead.email}
            {lead.phone ? ` · ${lead.phone}` : ""}
          </p>
          {lead.property && (
            <Link
              href={`/properties/${lead.property.slug}`}
              className="mt-1 inline-block text-sm text-accent hover:underline"
            >
              {lead.property.title_sq}
            </Link>
          )}
        </div>
        <Select
          value={status}
          onChange={(event) => handleStatusChange(event.target.value as InquiryStatus)}
          className="w-auto"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </Select>
      </div>

      {lead.message && <p className="mt-3 text-sm text-foreground">{lead.message}</p>}

      {lead.preferred_date && (
        <p className="mt-2 text-sm text-muted">
          {t("preferred", { date: lead.preferred_date, time: lead.preferred_time ?? "" })}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted">
          {t("followUpDate")}
          <Input
            type="date"
            value={followUpDate}
            onChange={(event) => handleFollowUpChange(event.target.value)}
            className="h-9 w-auto"
          />
        </label>
        {agents && (
          <label className="flex items-center gap-2 text-sm text-muted">
            {adminT("assignLabel")}
            <Select
              value={assignedAgentId}
              onChange={(event) => handleAssignChange(event.target.value)}
              disabled={assigning}
              className="h-9 w-auto"
            >
              <option value="">{adminT("unassigned")}</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name}
                </option>
              ))}
            </Select>
          </label>
        )}
        <button
          type="button"
          onClick={toggleNotes}
          className="text-sm font-medium text-accent hover:underline"
        >
          {notesOpen ? t("hideNotes") : t("showNotes")}
        </button>
      </div>

      {notesOpen && (
        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
          {notes === null ? (
            <p className="text-sm text-muted">{t("loadingNotes")}</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-muted">{t("noNotes")}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {notes.map((note) => (
                <div key={note.id} className="rounded-xl bg-background p-3 text-sm text-foreground">
                  {note.note}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              value={newNote}
              onChange={(event) => setNewNote(event.target.value)}
              placeholder={t("addNotePlaceholder")}
            />
            <Button type="button" size="sm" onClick={handleAddNote} disabled={savingNote}>
              {t("addNote")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function LeadList({
  leads,
  agents,
  onAssign,
}: {
  leads: AgentLead[];
  agents?: AgentOption[];
  onAssign?: (leadId: string, agentId: string) => Promise<unknown>;
}) {
  const t = useTranslations("agentLeads");

  if (leads.length === 0) {
    return <p className="text-sm text-muted">{t("empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {leads.map((lead) => (
        <LeadRow key={lead.id} lead={lead} agents={agents} onAssign={onAssign} />
      ))}
    </div>
  );
}
