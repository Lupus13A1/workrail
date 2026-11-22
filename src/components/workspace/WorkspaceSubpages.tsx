import { useState, type ReactNode } from "react";
import {
  AlignLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Download,
  Ellipsis,
  FileCode2,
  FileText,
  Filter,
  Layers3,
  LockKeyhole,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { getBillableHumanSeats, getBillableSeatDays } from "@/lib/seat-billing";
import { columns, people, peopleAvatars, statusClass, type Issue } from "@/lib/workspace-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/workspace/BoardViews";

export function BriefView({ onCopy }: { onCopy: (text: string) => void }) {
  const [markdown, setMarkdown] = useState(
    "# Storefront refresh\n\nA clear, reliable shopping experience for every customer.\n\n## Workflow rules\n| Status | Definition |\n| --- | --- |\n| To Do | Prioritized and ready to start |\n| In Progress | Actively being worked on |\n| In Review | Ready for teammate review |\n| Testing (UAT) | Awaiting customer acceptance |\n| Done | Verified and released |\n\n## QA hand-off\n- Share the PR and test notes before moving to Testing (UAT).\n- Mention the QA team when handing work off.\n- Keep customer information private.",
  );
  const insert = (text: string) => setMarkdown((previous) => `${previous}\n\n${text}`);

  return (
    <div className="subpage">
      <SectionHeading
        eyebrow="PROJECT DOCUMENTATION"
        title="Project brief"
        description="A shared source of truth for your team and connected AI agents."
        action={
          <Button size="sm" onClick={() => onCopy(markdown)}>
            <FileCode2 size={15} /> Copy .md
          </Button>
        }
      />
      <div className="brief-info">
        <Sparkles size={17} />
        <p>This Markdown brief sets the workflow rules that connected AI agents and teammates follow for this project.</p>
        <ShieldCheck size={17} />
      </div>
      <div className="brief-editor-top">
        <div className="segmented">
          <span className="segment-active">
            <AlignLeft size={14} /> Edit .md
          </span>
          <span>
            <FileText size={14} /> Preview
          </span>
        </div>
        <span className="saved-indicator">
          <span className="live-dot" /> Saved just now
        </span>
      </div>
      <div className="snippet-buttons">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            insert(
              "## Status definitions\n| Status | Definition |\n| --- | --- |\n| In Review | Ready for review |\n| Testing (UAT) | Ready for acceptance testing |",
            )
          }
        >
          + Insert status table
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            insert(
              "## QA hand-off rules\n- Include a merged pull request.\n- Add test notes and expected results.\n- Mention @QA before moving to Testing (UAT).",
            )
          }
        >
          + Insert QA hand-off rules
        </Button>
      </div>
      <Textarea
        className="markdown-editor"
        aria-label="Edit project brief Markdown"
        value={markdown}
        onChange={(event) => setMarkdown(event.target.value)}
        spellCheck={false}
      />
    </div>
  );
}

export function SalesView({ onNotice }: { onNotice: (message: string) => void }) {
  const [documentType, setDocumentType] = useState("Quotation");
  const deals = [
    { company: "Fern & Field Co.", project: "Storefront refresh", value: "฿480,000", paid: "2 / 3", stage: "Contract active", color: "avatar-mint", progress: 67 },
    { company: "Morrow Studio", project: "Client portal", value: "฿265,000", paid: "1 / 3", stage: "Proposal sent", color: "avatar-coral", progress: 33 },
    { company: "Sunday Supply", project: "Mobile app v2", value: "฿720,000", paid: "0 / 4", stage: "Draft quotation", color: "avatar-sky", progress: 8 },
  ];

  return (
    <div className="subpage">
      <SectionHeading
        eyebrow="COMMERCIAL WORKSPACE"
        title="Sales & billing"
        description="Keep every client deal and delivery milestone in view."
        action={
          <Button size="sm" onClick={() => onNotice("New client deal started")}>
            <Plus size={15} /> New deal
          </Button>
        }
      />
      <div className="sales-summary">
        <div>
          <small>ACTIVE CONTRACT VALUE</small>
          <strong>฿1,465,000</strong>
          <span>
            <ArrowUpRight size={14} /> 12% this quarter
          </span>
        </div>
        <div>
          <small>OUTSTANDING PAYMENTS</small>
          <strong>฿460,000</strong>
          <span>Across 4 milestones</span>
        </div>
        <div>
          <small>ACTIVE CLIENTS</small>
          <strong>08</strong>
          <span>3 deals in progress</span>
        </div>
      </div>
      <div className="sales-content">
        <div className="deal-list">
          <div className="deal-list-heading">
            <h3>Active deals</h3>
            <Button variant="ghost" size="sm">
              <Filter size={14} /> Filter
            </Button>
          </div>
          {deals.map((deal) => (
            <article className="deal-row" key={deal.company}>
              <span className={`avatar deal-avatar ${deal.color}`}>
                {deal.company
                  .split(" ")
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="deal-main">
                <strong>{deal.company}</strong>
                <small>
                  <Layers3 size={12} /> {deal.project}
                </small>
                <div className="deal-progress">
                  <span style={{ width: `${deal.progress}%` }} />
                </div>
                <small>{deal.paid} milestones paid</small>
              </div>
              <div className="deal-value">
                <strong>{deal.value}</strong>
                <span>{deal.stage}</span>
              </div>
              <Button variant="ghost" size="icon" title={`Open ${deal.company}`} onClick={() => onNotice(`${deal.company} deal opened`)}>
                <ChevronRight size={17} />
              </Button>
            </article>
          ))}
        </div>
        <div className="document-preview">
          <div className="preview-header">
            <div>
              <span className="eyebrow">DOCUMENT PREVIEW</span>
              <h3>Fern & Field Co.</h3>
            </div>
            <Button size="icon" variant="ghost" title="More document actions" onClick={() => onNotice("Document options")}>
              <Ellipsis size={18} />
            </Button>
          </div>
          <div className="preview-options">
            <div className="segmented">
              {["Quotation", "Billing note", "Receipt"].map((kind) => (
                <button key={kind} className={documentType === kind ? "segment-active" : ""} onClick={() => setDocumentType(kind)}>
                  {kind}
                </button>
              ))}
            </div>
          </div>
          <div className="paper-preview">
            <div className="paper-top">
              <span className="brand-mark small-brand">
                <Layers3 size={15} />
              </span>
              <span>
                NORTHSTAR
                <br />
                STUDIO
              </span>
              <span className="paper-document-label">
                {documentType.toUpperCase()}
                <strong>NO. QT-2026-018</strong>
              </span>
            </div>
            <hr />
            <small>PREPARED FOR</small>
            <h4>Fern & Field Co.</h4>
            <p>Storefront refresh · 12 November 2026</p>
            <div className="paper-table">
              <span>DELIVERY MILESTONE</span>
              <span>AMOUNT</span>
              <p>Contract signing · 30%</p>
              <p>฿144,000</p>
              <p>UAT delivery · 40%</p>
              <p>฿192,000</p>
              <p>Production launch · 30%</p>
              <p>฿144,000</p>
            </div>
            <div className="paper-total">
              <span>TOTAL CONTRACT VALUE</span>
              <strong>฿480,000.00</strong>
            </div>
            <div className="paper-foot">Northstar Studio · Bangkok, Thailand</div>
          </div>
          <div className="preview-actions">
            <Button variant="outline" onClick={() => window.print()}>
              <Download size={14} /> Download PDF
            </Button>
            <Button onClick={() => onNotice(`${documentType} marked as sent`)}>
              <Send size={14} /> Mark as sent
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InsightsView({ issues, onOpen }: { issues: Issue[]; onOpen: (id: string) => void }) {
  const done = issues.filter((issue) => issue.status === "Done").length;

  return (
    <div className="subpage">
      <SectionHeading
        eyebrow="TEAM PERFORMANCE"
        title="Manager insights"
        description="A clear view of the work moving through your team this week."
        action={
          <Button variant="outline" size="sm">
            <CalendarDays size={14} /> This week <ChevronDown size={13} />
          </Button>
        }
      />
      <div className="insight-summary">
        <div className="summary-icon">
          <Sparkles size={18} />
        </div>
        <div>
          <span>WEEKLY SUMMARY · GENERATED TODAY</span>
          <p>
            Your team shipped {done} updates this week. Checkout improvements are moving steadily, while two reviews are ready for a QA hand-off.
          </p>
        </div>
        <Button size="icon" variant="ghost" title="Summary options">
          <Ellipsis size={18} />
        </Button>
      </div>
      <div className="metric-grid">
        <MetricCard label="AVERAGE CYCLE TIME" value="3.2" unit="days" trend="↓ 0.6 days" trendText="vs. last week" icon={<Clock3 size={18} />} />
        <MetricCard
          label="ISSUES COMPLETED"
          value={String(done).padStart(2, "0")}
          unit="this week"
          trend="↑ 18%"
          trendText="vs. last week"
          icon={<CheckCheck size={18} />}
        />
        <MetricCard label="ACTIVE IN REVIEW" value="02" unit="issues" trend="1 ready for QA" trendText="" icon={<Layers3 size={18} />} />
      </div>
      <div className="charts-grid">
        <div className="chart-panel">
          <div className="chart-heading">
            <div>
              <span className="eyebrow">THROUGHPUT</span>
              <h3>Work completed</h3>
            </div>
            <span className="chart-legend">
              <i /> Issues / week
            </span>
          </div>
          <div className="chart-plot">
            <div className="chart-axis">
              <span>8</span>
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>
            <div className="bar-chart">
              {([[3, 4], [5, 7], [3, 5], [6, 8], [4, 7], [5, 6], [7, 8]] as const).map((pair, index) => (
                <div key={index} className="bar-group">
                  <div style={{ height: `${pair[0] * 10}%` }} />
                  <div style={{ height: `${pair[1] * 10}%` }} />
                  <small>{["M", "T", "W", "T", "F", "S", "S"][index] ?? ""}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="chart-panel cycle-panel">
          <span className="eyebrow">WORK IN PROGRESS</span>
          <h3>Flow by status</h3>
          {columns.slice(0, 4).map((column) => (
            <div className="flow-line" key={column}>
              <span className={`status-dot ${statusClass(column)}`} />
              {column}
              <span className="flow-track">
                <i style={{ width: `${Math.max(18, issues.filter((issue) => issue.status === column).length * 18)}%` }} />
              </span>
              <strong>{issues.filter((issue) => issue.status === column).length}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="flagged-panel">
        <div className="deal-list-heading">
          <div>
            <span className="eyebrow">NEEDS ATTENTION</span>
            <h3>Review & QA hand-off</h3>
          </div>
          <span className="soft-pill warning-pill">2 flagged</span>
        </div>
        {issues
          .filter((issue) => issue.status === "In Review")
          .map((issue) => (
            <button className="flagged-row" key={issue.id} onClick={() => onOpen(issue.id)}>
              <span className="flag-indicator" />
              <span className="issue-key">{issue.key}</span>
              <span>{issue.title}</span>
              <span className="warning-label">Awaiting review</span>
              <ChevronRight size={16} />
            </button>
          ))}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  trend,
  trendText,
  icon,
}: {
  label: string;
  value: string;
  unit: string;
  trend: string;
  trendText: string;
  icon: ReactNode;
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <i>{icon}</i>
      </div>
      <div className="metric-value">
        {value}
        <small>{unit}</small>
      </div>
      <div className="metric-trend">
        <strong>{trend}</strong>
        {trendText}
      </div>
    </article>
  );
}

function AiClientLogo({ name, size = 16 }: { name: string; size?: number }) {
  if (name === "Claude Code") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          fill="#D97757"
          d="M12 2l2.1 6.4L20.5 6l-4.2 5.2L22 14l-6.4 1.6L18 21.5l-6-3.8-6 3.8 2.4-5.9L2 14l5.7-2.8L3.5 6l6.4 2.4L12 2z"
        />
      </svg>
    );
  }
  if (name === "Cursor") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path fill="currentColor" d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.3L18.5 8 12 11.7 5.5 8 12 4.3zm-7 5.2l6 3.4v6.7l-6-3.3V9.5zm8 10.1v-6.7l6-3.4v6.8l-6 3.3z" />
      </svg>
    );
  }
  if (name === "VS Code") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          fill="#007ACC"
          d="M17.5 2L8.7 10.1 4.4 6.8 2.5 7.8v8.4l1.9 1 4.3-3.3L17.5 22l4-1.9V3.9L17.5 2zm0 4.6v10.8L11.4 12l6.1-5.4z"
        />
      </svg>
    );
  }
  if (name === "ChatGPT") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          fill="#10A37F"
          d="M21.2 10.2a5.3 5.3 0 0 0-.45-4.35 5.4 5.4 0 0 0-5.81-2.58A5.36 5.36 0 0 0 10.9 1.5a5.4 5.4 0 0 0-5.14 3.74 5.35 5.35 0 0 0-3.58 2.6 5.4 5.4 0 0 0 .66 6.33 5.3 5.3 0 0 0 .45 4.35 5.4 5.4 0 0 0 5.81 2.58 5.36 5.36 0 0 0 4.04 1.77 5.4 5.4 0 0 0 5.14-3.74 5.35 5.35 0 0 0 3.58-2.6 5.4 5.4 0 0 0-.66-6.33zM13.14 21.3a4 4 0 0 1-2.57-.93l.13-.07 4.27-2.46a.7.7 0 0 0 .35-.61v-6l1.8 1.04a.06.06 0 0 1 .03.05v4.96a4.02 4.02 0 0 1-4.01 4.02zM4.52 17.6a4 4 0 0 1-.48-2.69l.13.08 4.27 2.46a.7.7 0 0 0 .7 0l5.2-3v2.08a.06.06 0 0 1-.02.05l-4.3 2.48a4.02 4.02 0 0 1-5.5-1.46zM3.4 8.32a4 4 0 0 1 2.1-1.76v5.09a.7.7 0 0 0 .35.6l5.2 3-1.8 1.04a.06.06 0 0 1-.06 0L4.9 13.81A4.02 4.02 0 0 1 3.4 8.32zm14.78 3.44l-5.2-3 1.8-1.04a.06.06 0 0 1 .06 0l4.3 2.48a4.01 4.01 0 0 1-.62 7.24v-5.08a.7.7 0 0 0-.34-.6zm1.8-2.7l-.13-.08-4.27-2.46a.7.7 0 0 0-.7 0l-5.2 3V7.44a.06.06 0 0 1 .03-.05l4.3-2.48a4.01 4.01 0 0 1 5.97 4.15zm-11.27 3.7l-1.8-1.03a.06.06 0 0 1-.03-.05V6.72a4.01 4.01 0 0 1 6.58-3.09l-.13.07L9.06 6.16a.7.7 0 0 0-.35.61v6zm.98-2.11l2.31-1.33 2.31 1.33v2.66L12 14.64l-2.31-1.33v-2.66z"
        />
      </svg>
    );
  }
  if (name === "Windsurf") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          fill="#09B6A2"
          d="M3 7c3.2 0 4.8 3.2 7.5 3.2S14.8 7 18 7c1.4 0 2.4.5 3 1.1v3.1c-.7-.7-1.7-1.2-3-1.2-3.2 0-4.8 3.2-7.5 3.2S6.2 10 3 10V7zm0 6c3.2 0 4.8 3.2 7.5 3.2s4.3-3.2 7.5-3.2c1.4 0 2.4.5 3 1.1v3.1c-.7-.7-1.7-1.2-3-1.2-3.2 0-4.8 3.2-7.5 3.2S6.2 16 3 16v-3z"
        />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path fill="#4285F4" d="M12 2c.6 5.2 4.8 9.4 10 10-5.2.6-9.4 4.8-10 10-.6-5.2-4.8-9.4-10-10 5.2-.6 9.4-4.8 10-10z" />
    </svg>
  );
}

type ToolItem = {
  id: string;
  title: string;
  desc: string;
  kb: number;
  essentialDefault: boolean;
};

const MCP_TOOLS: ToolItem[] = [
  {
    id: "working_on",
    title: "Working on",
    desc: "what each agent is doing on a card and which files it touches",
    kb: 7,
    essentialDefault: true,
  },
  {
    id: "inbox",
    title: "Inbox",
    desc: "your notifications (the bell)",
    kb: 4,
    essentialDefault: false,
  },
  {
    id: "releases",
    title: "Releases",
    desc: "plan releases and put issues in them",
    kb: 24,
    essentialDefault: false,
  },
  {
    id: "sprints",
    title: "Sprints",
    desc: "scrum sprints and burndown",
    kb: 11,
    essentialDefault: true,
  },
  {
    id: "sales",
    title: "Sales documents",
    desc: "quotations, billing notes, receipts",
    kb: 7,
    essentialDefault: false,
  },
  {
    id: "support",
    title: "Support cases",
    desc: "support cases with the Workrail team",
    kb: 16,
    essentialDefault: false,
  },
  {
    id: "insights",
    title: "Insights",
    desc: "manager numbers and automatic summaries",
    kb: 10,
    essentialDefault: false,
  },
  {
    id: "files",
    title: "Files and doc history",
    desc: "raw md files, doc history and restore, delete docs",
    kb: 18,
    essentialDefault: true,
  },
  {
    id: "attachments",
    title: "Attachments",
    desc: "files attached to issues",
    kb: 7,
    essentialDefault: false,
  },
  {
    id: "votes",
    title: "Votes and watchers",
    desc: "votes and watching issues",
    kb: 8,
    essentialDefault: false,
  },
];

const CORE_TOOLS_KB = 92; // Base core issues/projects tools so 92 + 112 = 204 KB full

export function IntegrationView({ onCopy }: { onCopy: (text: string, message?: string) => void }) {
  const [agents, setAgents] = useState<{ id: string; name: string; role: string; paused: boolean }[]>([]);
  const [tokens, setTokens] = useState<{ id: string; name: string; role: string; expiry: string; preview: string }[]>([]);
  const [tokenName, setTokenName] = useState("Claude Code");
  const [tokenRole, setTokenRole] = useState("");
  const [tokenExpiry, setTokenExpiry] = useState("90 days");
  const [signedInApps, setSignedInApps] = useState([
    {
      id: "chatgpt-oauth",
      name: "ChatGPT",
      via: "signed in via browser",
      lastUsed: "last used 6d ago",
      expires: "expires 16 Nov 2027",
      role: "Admin",
    },
  ]);

  const [aiClient, setAiClient] = useState("Claude Code");
  const [toolSetMode, setToolSetMode] = useState<"Full" | "Essential" | "Custom">("Full");
  const [enabledTools, setEnabledTools] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MCP_TOOLS.map((t) => [t.id, true])),
  );

  const selectToolPreset = (preset: "Full" | "Essential" | "Custom") => {
    setToolSetMode(preset);
    if (preset === "Full") {
      setEnabledTools(Object.fromEntries(MCP_TOOLS.map((t) => [t.id, true])));
    } else if (preset === "Essential") {
      setEnabledTools(Object.fromEntries(MCP_TOOLS.map((t) => [t.id, t.essentialDefault])));
    }
  };

  const toggleTool = (id: string) => {
    setEnabledTools((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const allOn = MCP_TOOLS.every((t) => next[t.id]);
      const allEssential = MCP_TOOLS.every((t) => Boolean(next[t.id]) === t.essentialDefault);
      setToolSetMode(allOn ? "Full" : allEssential ? "Essential" : "Custom");
      return next;
    });
  };

  const optionalKb = MCP_TOOLS.reduce((sum, t) => sum + (enabledTools[t.id] ? t.kb : 0), 0);
  const totalKb = CORE_TOOLS_KB + optionalKb;
  const maxKb = CORE_TOOLS_KB + MCP_TOOLS.reduce((sum, t) => sum + t.kb, 0); // 204 KB
  const approxTokensK = Math.round(totalKb / 4);
  const barPercent = Math.min(100, Math.round((totalKb / maxKb) * 100));

  const toolsQuery =
    toolSetMode === "Full"
      ? ""
      : toolSetMode === "Essential"
        ? "?tools=essential"
        : `?tools=${MCP_TOOLS.filter((t) => enabledTools[t.id])
            .map((t) => t.id)
            .join(",")}`;

  const mcpUrl = `https://mcp.workrail.ai/mcp${toolsQuery || "?tools=essential"}`;

  const clientCommands: Record<string, { title: string; command: string; steps: string[] }> = {
    "Claude Code": {
      title: "Shortcut for Claude Code",
      command: `claude mcp add --transport http workrail "${mcpUrl}"`,
      steps: ["1. Run the command in a terminal", "2. In Claude Code type /mcp and pick workrail to sign in"],
    },
    Cursor: {
      title: "Shortcut for Cursor",
      command: `cursor --add-mcp '{"name":"workrail","url":"${mcpUrl}"}'`,
      steps: ["1. Run the command or add the URL in Cursor → Settings → MCP", "2. Click Connect to sign in via browser"],
    },
    "VS Code": {
      title: "Shortcut for VS Code",
      command: `code --add-mcp '{"name":"workrail","type":"http","url":"${mcpUrl}"}'`,
      steps: ["1. Run the command in a terminal", "2. Open GitHub Copilot Chat in Agent mode and authorize Workrail"],
    },
    Windsurf: {
      title: "Shortcut for Windsurf",
      command: `windsurf mcp add workrail "${mcpUrl}"`,
      steps: ["1. Add the server URL to your Windsurf mcp_config.json", "2. Sign in when prompted in browser"],
    },
    "Gemini CLI": {
      title: "Shortcut for Gemini CLI",
      command: `gemini mcp add --http workrail "${mcpUrl}"`,
      steps: ["1. Run the command in your terminal", "2. Authenticate in your browser to link your workspace"],
    },
    ChatGPT: {
      title: "Shortcut for ChatGPT",
      command: mcpUrl,
      steps: ["1. Open ChatGPT Settings → Connectors → Add custom MCP", "2. Paste the URL above and sign in with OAuth"],
    },
  };

  const currentClient = clientCommands[aiClient] ?? clientCommands["Claude Code"]!;

  const handleCreateAgent = () => {
    if (agents.length >= 10) return;
    const nextNum = agents.length + 1;
    const created = {
      id: `agent-${Date.now()}`,
      name: `release-agent-${nextNum}`,
      role: "Developer",
      paused: false,
    };
    setAgents((prev) => [...prev, created]);
    onCopy(created.name, `Created agent ${created.name}`);
  };

  const handleCreateToken = () => {
    const cleanName = tokenName.trim() || "Claude Code";
    const secret = `bm_pat_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 8)}`;
    setTokens((prev) => [
      {
        id: `tok-${Date.now()}`,
        name: cleanName,
        role: tokenRole.trim() || "General",
        expiry: tokenExpiry,
        preview: `${secret.slice(0, 11)}…`,
      },
      ...prev,
    ]);
    onCopy(secret, `Token created and copied for ${cleanName}`);
  };

  const handleConvertAppToAgent = (appId: string, appName: string) => {
    setSignedInApps((prev) => prev.filter((a) => a.id !== appId));
    setAgents((prev) => [
      ...prev,
      {
        id: `agent-${Date.now()}`,
        name: `${appName.toLowerCase()}-agent`,
        role: "Admin",
        paused: false,
      },
    ]);
    onCopy(`${appName.toLowerCase()}-agent`, `Converted ${appName} to an agent account`);
  };

  return (
    <div className="agent-mcp-page">
      <div className="agent-mcp-container">
        <header className="agent-mcp-header">
          <h1>Agent &amp; MCP access</h1>
          <p>Tokens are tied to you and to THANET CHANKHUA — an agent can do what you can, no more.</p>
        </header>

        <div className="agent-mcp-grid">
          {/* LEFT COLUMN */}
          <div className="agent-mcp-col">
            {/* MY AGENTS CARD */}
            <section className="am-card">
              <span className="am-card-eyebrow">MY AGENTS</span>
              <p className="am-card-desc">
                An agent account is a named AI agent of your company that you own: it works with your rights, keeps a run log and has a pause button — on every plan, and it never takes a seat.
              </p>
              <p className="am-card-desc">
                Already use a personal token in an AI client? Use &ldquo;Convert to agent account&rdquo; on that token below to move it to one of these agents.
              </p>

              <div className="am-btn-row">
                <button type="button" className="am-lime-btn" onClick={handleCreateAgent}>
                  <Plus size={15} /> Create agent
                </button>
                <button
                  type="button"
                  className="am-outline-btn"
                  onClick={() => onCopy("Manage all company agents", "Opened company agents directory")}
                >
                  <Sparkles size={14} /> Manage all company agents
                </button>
              </div>

              <div className="am-limit-bar">
                <span className="am-limit-label">COMPANY AGENT LIMIT</span>
                <span className="am-beta-pill">Beta</span>
                <strong>{agents.length} of 10 used</strong>
              </div>

              {agents.length === 0 ? (
                <div className="am-dashed-empty">
                  You have no agents yet — create one to give an AI its own name, history and stop button.
                </div>
              ) : (
                <div className="am-item-list">
                  {agents.map((ag) => (
                    <div key={ag.id} className="am-list-row">
                      <div className="am-list-main">
                        <strong>{ag.name}</strong>
                        <span className="am-role-tag">{ag.role}</span>
                        <small>{ag.paused ? "Paused" : "Active · 0 runs today"}</small>
                      </div>
                      <div className="am-row-actions">
                        <button
                          type="button"
                          className="am-outline-btn am-btn-xs"
                          onClick={() =>
                            setAgents((prev) =>
                              prev.map((item) => (item.id === ag.id ? { ...item, paused: !item.paused } : item)),
                            )
                          }
                        >
                          {ag.paused ? "Resume" : "Pause"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* PERSONAL ACCESS TOKENS CARD */}
            <section className="am-card">
              <div className="am-card-head-row">
                <span className="am-card-eyebrow">PERSONAL ACCESS TOKENS</span>
                <span className="am-scope-pill">✓ scopes = same as you (user parity)</span>
              </div>

              <div className="am-token-form">
                <input
                  type="text"
                  className="am-input"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="Claude Code"
                  aria-label="Token name"
                />
                <input
                  type="text"
                  className="am-input"
                  value={tokenRole}
                  onChange={(e) => setTokenRole(e.target.value)}
                  placeholder="e.g. Developer, QA"
                  aria-label="Agent role"
                />
                <select
                  className="am-select"
                  value={tokenExpiry}
                  onChange={(e) => setTokenExpiry(e.target.value)}
                  aria-label="Token expiration"
                >
                  <option value="30 days">30 days</option>
                  <option value="90 days">90 days</option>
                  <option value="1 year">1 year</option>
                  <option value="No expiry">No expiry</option>
                </select>
                <button type="button" className="am-lime-btn" onClick={handleCreateToken}>
                  <Plus size={15} /> New token
                </button>
              </div>

              <p className="am-card-subhint">
                Your agent learns its role from this; Workrail warns it when it steps into another role&apos;s work.
              </p>

              {tokens.length === 0 ? (
                <div className="am-dashed-empty">No personal access tokens yet</div>
              ) : (
                <div className="am-item-list">
                  {tokens.map((tok) => (
                    <div key={tok.id} className="am-list-row">
                      <div className="am-list-main">
                        <strong>{tok.name}</strong>
                        <span className="am-role-tag">{tok.role}</span>
                        <code>{tok.preview}</code>
                        <small>Expires in {tok.expiry}</small>
                      </div>
                      <div className="am-row-actions">
                        <button
                          type="button"
                          className="am-outline-btn am-btn-xs"
                          onClick={() => {
                            setTokens((prev) => prev.filter((item) => item.id !== tok.id));
                            setAgents((prev) => [
                              ...prev,
                              { id: `agent-${Date.now()}`, name: tok.name.toLowerCase().replace(/\s+/g, "-"), role: tok.role, paused: false },
                            ]);
                          }}
                        >
                          ⇄ Convert to agent account
                        </button>
                        <button
                          type="button"
                          className="am-danger-btn am-btn-xs"
                          onClick={() => setTokens((prev) => prev.filter((item) => item.id !== tok.id))}
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SIGNED-IN APPS CARD */}
            <section className="am-card">
              <div className="am-card-head-row">
                <span className="am-card-eyebrow">SIGNED-IN APPS</span>
                <span className="am-neutral-pill">OAuth</span>
              </div>

              {signedInApps.length === 0 ? (
                <div className="am-dashed-empty">No OAuth apps currently signed in</div>
              ) : (
                <div className="am-item-list">
                  {signedInApps.map((app) => (
                    <div key={app.id} className="am-oauth-row">
                      <div className="am-oauth-left">
                        <span className="am-oauth-logo">
                          <AiClientLogo name={app.name} size={18} />
                        </span>
                        <div className="am-oauth-meta">
                          <strong>{app.name}</strong>
                          <div className="am-oauth-sub">
                            <span>{app.via}</span>
                            <span>·</span>
                            <span>{app.lastUsed}</span>
                          </div>
                          <div className="am-oauth-sub">
                            <span>{app.expires}</span>
                            <span className="am-role-tag">{app.role}</span>
                          </div>
                        </div>
                      </div>
                      <div className="am-oauth-actions">
                        <span className="am-cyan-badge">&lt;&gt; OAuth app</span>
                        <button
                          type="button"
                          className="am-outline-btn am-btn-xs"
                          onClick={() => handleConvertAppToAgent(app.id, app.name)}
                        >
                          ⇄ Convert to agent account
                        </button>
                        <button
                          type="button"
                          className="am-danger-btn am-btn-xs"
                          onClick={() => setSignedInApps((prev) => prev.filter((a) => a.id !== app.id))}
                        >
                          Sign out app
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* RECENT COMMITS BY YOUR AGENTS */}
            <section className="am-card">
              <span className="am-card-eyebrow">RECENT COMMITS BY YOUR AGENTS · MD TREE (GET_HISTORY)</span>
              <div className="am-commit-row">
                <div className="am-commit-left">
                  <code className="am-commit-hash">574c54e</code>
                  <span className="am-commit-msg">create TOPIA-1</span>
                </div>
                <div className="am-commit-right">
                  <span className="am-cyan-badge">&lt;&gt; MCP</span>
                  <small>6d</small>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="agent-mcp-col">
            {/* CONNECT AN AI AGENT CARD */}
            <section className="am-card">
              <div className="am-card-head-row">
                <h2 className="am-card-title">Connect an AI agent</h2>
                <span className="am-cyan-badge">&lt;&gt; Streamable HTTP</span>
              </div>
              <p className="am-card-desc">
                Add Workrail as an MCP server to any AI agent and it sees the same projects as you. Every write must send{" "}
                <code className="am-inline-code">version</code> and records <code className="am-inline-code">agent_token_id</code> in the commit.
              </p>

              {/* Sub-box 1: Any AI assistant */}
              <div className="am-tinted-box">
                <div className="am-tinted-head">
                  <strong>
                    <FileCode2 size={14} /> Any AI assistant — one link, no setup
                  </strong>
                  <button
                    type="button"
                    className="am-outline-btn am-btn-xs"
                    onClick={() =>
                      onCopy(
                        "Read https://www.workrail.ai/agents.md and help me use Workrail.",
                        "Copied assistant message",
                      )
                    }
                  >
                    Copy message
                  </button>
                </div>
                <p className="am-card-desc">
                  Send this to ChatGPT, Claude, Gemini, Copilot or any assistant: it reads the guide for AI agents and knows what Workrail is and how to use it, even without MCP.
                </p>
                <div className="am-mono-line">Read https://www.workrail.ai/agents.md and help me use Workrail.</div>
                <a
                  href="#agents-md"
                  className="am-green-link"
                  onClick={(e) => {
                    e.preventDefault();
                    onCopy("https://www.workrail.ai/agents.md", "Copied agents.md URL");
                  }}
                >
                  Open the guide for AI agents (agents.md) →
                </a>
              </div>

              {/* Sub-box 2: Let your agent set itself up */}
              <div className="am-tinted-box">
                <div className="am-tinted-head">
                  <strong>
                    <Sparkles size={14} /> Let your agent set itself up
                  </strong>
                  <button
                    type="button"
                    className="am-outline-btn am-btn-xs"
                    onClick={() =>
                      onCopy(
                        "Connect yourself to Workrail: read https://mcp.workrail.ai/connect.md and follow the steps for the client you are running in.",
                        "Copied setup prompt",
                      )
                    }
                  >
                    Copy prompt
                  </button>
                </div>
                <div className="am-mono-line">
                  Connect yourself to Workrail: read https://mcp.workrail.ai/connect.md and follow the steps for the client you are running in.
                </div>
                <a
                  href="#connect-md"
                  className="am-green-link"
                  onClick={(e) => {
                    e.preventDefault();
                    onCopy("https://mcp.workrail.ai/connect.md", "Copied connect.md URL");
                  }}
                >
                  All clients (connect.md) →
                </a>
              </div>

              {/* AI client selector */}
              <div className="am-client-picker-row">
                <label htmlFor="am-ai-client-select">AI client</label>
                <select
                  id="am-ai-client-select"
                  className="am-select am-client-select"
                  value={aiClient}
                  onChange={(e) => setAiClient(e.target.value)}
                >
                  {Object.keys(clientCommands).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shortcut box */}
              <div className="am-shortcut-box">
                <div className="am-shortcut-title">
                  <AiClientLogo name={aiClient} size={15} />
                  <strong>{currentClient.title}</strong>
                </div>
                <pre className="am-command-code">{currentClient.command}</pre>
                <div>
                  <button
                    type="button"
                    className="am-lime-btn am-btn-sm"
                    onClick={() => onCopy(currentClient.command, `Copied ${aiClient} command`)}
                  >
                    Copy command
                  </button>
                </div>
                <div className="am-shortcut-steps">
                  {currentClient.steps.map((step, i) => (
                    <span key={i}>{step}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* TOOL SET — SAVE TOKENS CARD */}
            <section className="am-card">
              <div className="am-card-head-row">
                <h2 className="am-card-title">Tool set — save tokens</h2>
                <span className="am-neutral-pill">?tools=</span>
              </div>
              <p className="am-card-desc">
                An agent that doesn&apos;t need every feature can load fewer tools. Choose what this connection gets — the URL in the config below changes with it.
              </p>

              {/* Segmented control: Full | Essential | Custom */}
              <div className="am-segmented" role="tablist" aria-label="Tool set preset">
                {(["Full", "Essential", "Custom"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={toolSetMode === tab}
                    className={toolSetMode === tab ? "is-active" : ""}
                    onClick={() => selectToolPreset(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* 2-column grid of 10 tool toggles */}
              <div className="am-tools-grid">
                {MCP_TOOLS.map((tool) => {
                  const isOn = Boolean(enabledTools[tool.id]);
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      className={`am-tool-card ${isOn ? "is-on" : "is-off"}`}
                      onClick={() => toggleTool(tool.id)}
                      aria-pressed={isOn}
                    >
                      <span className={`am-switch ${isOn ? "is-on" : ""}`}>
                        <i />
                      </span>
                      <div className="am-tool-copy">
                        <strong>{tool.title}</strong>
                        <small>{tool.desc}</small>
                      </div>
                      <span className="am-tool-kb">+{tool.kb} KB</span>
                    </button>
                  );
                })}
              </div>

              {/* Token usage bar */}
              <div className="am-usage-summary">
                <strong>
                  ≈ {totalKb} KB · ≈ {approxTokensK}k tokens per session (all tools ≈ {maxKb} KB)
                </strong>
                <div className="am-usage-bar">
                  <i style={{ width: `${barPercent}%` }} />
                </div>
                <p className="am-usage-foot">
                  The URL only changes this connection — sign-in with OAuth keeps working, and you can change the tool set later by editing the URL.{" "}
                  <button
                    type="button"
                    className="am-outline-btn am-btn-xs"
                    onClick={() => onCopy(mcpUrl, "Copied current tool set URL")}
                  >
                    About tool sets →
                  </button>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamView({ onNotice }: { onNotice: (message: string) => void }) {
  const [activePeople, setActivePeople] = useState([true, true, true, false]);
  const activeCount = activePeople.filter(Boolean).length;
  const seats = getBillableHumanSeats(activeCount);
  const days = getBillableSeatDays(activePeople.map((active, index) => (active ? [31, 31, 12, 0][index] ?? 0 : 0)));

  const toggle = (index: number) => {
    const person = people[index] ?? "Team member";
    const next = !activePeople[index];
    if (!next && !window.confirm(`Suspend ${person}? Daily billing stops tomorrow. Their issues, comments, and Markdown records remain preserved.`)) {
      return;
    }
    setActivePeople((current) => current.map((active, personIndex) => (personIndex === index ? next : active)));
    onNotice(next ? `${person} is active again` : `${person} suspended · billing stops tomorrow`);
  };

  return (
    <div className="subpage">
      <SectionHeading
        eyebrow="WORKSPACE ADMINISTRATION"
        title="Team & seat-day billing"
        description="Simple pricing, clear usage, no cost for your AI agents."
        action={
          <Button size="sm" variant="outline" onClick={() => onNotice("Invite link copied")}>
            <Plus size={15} /> Invite member
          </Button>
        }
      />
      <div className="billing-principle">
        <div className="principle-icon">
          <ShieldCheck size={21} />
        </div>
        <div>
          <strong>First 2 human seats free forever.</strong>
          <span>AI agents cost 0 seats. Pay only for active seat-days.</span>
        </div>
        <span className="principle-free">FAIR BY DESIGN</span>
      </div>
      <div className="billing-cards">
        <div className="billing-card">
          <span>ACTIVE HUMAN SEATS</span>
          <strong>
            {activeCount} <small>seats</small>
          </strong>
          <p>
            {Math.min(activeCount, 2)} free · {seats} billable
          </p>
          <div className="billing-meter">
            <i style={{ width: `${Math.min((activeCount / 6) * 100, 100)}%` }} />
          </div>
        </div>
        <div className="billing-card">
          <span>CONNECTED AI AGENTS</span>
          <strong>
            4 <small>agents</small>
          </strong>
          <p>
            <span className="free-badge">
              <Sparkles size={12} /> Free forever · 0 seat cost
            </span>
          </p>
          <div className="agent-icons">
            <span className="client-logo client-claude">
              <AiClientLogo name="Claude Code" size={13} />
            </span>
            <span className="client-logo client-cursor">
              <AiClientLogo name="Cursor" size={13} />
            </span>
            <span className="client-logo client-vscode">
              <AiClientLogo name="VS Code" size={13} />
            </span>
            <span className="client-logo client-gemini">
              <AiClientLogo name="Gemini CLI" size={13} />
            </span>
          </div>
        </div>
        <div className="billing-card accrued-card">
          <span>THIS MONTH · ACCRUED SEAT-DAYS</span>
          <strong>
            {days} <small>billable days</small>
          </strong>
          <p>Sum of each active seat’s billable days</p>
          <div className="seat-formula">Billable active seats × active days</div>
        </div>
      </div>
      <div className="member-table-wrap">
        <div className="deal-list-heading">
          <div>
            <h3>Team members</h3>
            <p>Manage active seats and view billing activity.</p>
          </div>
          <span className="soft-pill">{activeCount} active</span>
        </div>
        <div className="member-table">
          <div className="member-table-head">
            <span>TEAM MEMBER</span>
            <span>ROLE</span>
            <span>ACTIVE DAYS</span>
            <span>SEAT STATUS</span>
          </div>
          {people.map((person, index) => (
            <div className="member-table-row" key={person}>
              <span className="member-name">
                <span className={`avatar ${peopleAvatars[person]?.[1]}`}>{peopleAvatars[person]?.[0]}</span>
                <strong>{person}</strong>
                {index === 0 && <span className="you-badge">YOU</span>}
              </span>
              <span>{index === 0 ? "Company admin" : "Member"}</span>
              <span>{activePeople[index] ? [31, 31, 12, 0][index] ?? 0 : 0} days</span>
              <span className="seat-toggle-cell">
                <button
                  className={`seat-toggle ${activePeople[index] ? "is-on" : ""}`}
                  role="switch"
                  aria-checked={activePeople[index]}
                  aria-label={`${activePeople[index] ? "Suspend" : "Activate"} ${person}`}
                  onClick={() => toggle(index)}
                >
                  <i />
                </button>
                <span className={activePeople[index] ? "seat-active-label" : "seat-suspended-label"}>
                  {activePeople[index] ? "Active" : "Suspended"}
                </span>
              </span>
            </div>
          ))}
        </div>
        <p className="billing-footnote">
          <LockKeyhole size={13} /> Suspended seats stop accruing charges tomorrow. All existing work and records are preserved.
        </p>
      </div>
    </div>
  );
}
