import type { Database } from "@/types/supabase";
import { AgentCard } from "./AgentCard";

type AgentRow = Database["public"]["Tables"]["agents"]["Row"];

export function AgentGrid({ agents }: { agents: AgentRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
