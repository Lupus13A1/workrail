import { useEffect, useRef, useState } from "react";
import {
  Ban,
  Bold,
  CheckSquare,
  ChevronDown,
  Code,
  FileCode,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Paperclip,
  Quote,
  SquareCode,
  Strikethrough,
  Table,
} from "lucide-react";

import { Textarea } from "@/components/ui/textarea";

const HEADING_OPTIONS = [
  { label: "Text", value: "p" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Heading 4", value: "h4" },
  { label: "Heading 5", value: "h5" },
  { label: "Heading 6", value: "h6" },
] as const;

const TEXT_COLORS = [
  { id: "none", label: "ค่าเริ่มต้น — ไม่มีสี", color: "" },
  { id: "amber", label: "น้ำตาลทอง — เน้นย้ำ", color: "#92400e" },
  { id: "green", label: "เขียว — สำเร็จ / ผ่าน", color: "#166534" },
  { id: "red", label: "แดง — สำคัญ / ด่วน", color: "#b91c1c" },
  { id: "blue", label: "น้ำเงิน — ข้อมูลอ้างอิง", color: "#1d4ed8" },
  { id: "purple", label: "ม่วง — หมายเหตุพิเศษ", color: "#6b21a8" },
] as const;

const HIGHLIGHT_COLORS = [
  { id: "none", label: "ไม่มีสีเน้น", bg: "" },
  { id: "yellow", label: "เหลือง — ทั่วไป", bg: "#fde68a" },
  { id: "green", label: "เขียว — สำเร็จ", bg: "#bbf7d0" },
  { id: "pink", label: "ชมพู — สำคัญ", bg: "#fecdd3" },
  { id: "blue", label: "ฟ้า — ข้อมูล", bg: "#bfdbfe" },
  { id: "purple", label: "ม่วง — โน้ต", bg: "#e9d5ff" },
] as const;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function detectCodeLang(rawCode: string, explicitLang = ""): string {
  const clean = explicitLang.trim().toUpperCase();
  if (clean) return clean;
  const trimmed = rawCode.trim();
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    return "JSON";
  }
  if (/^\s*(import|export|const|let|function|interface|type)\b/m.test(trimmed)) {
    return "TS";
  }
  return "CODE";
}

function highlightCodeHtml(rawCode: string): string {
  const escaped = escapeHtml(rawCode);
  return escaped.replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|\b(-?\d+(?:\.\d+)?)\b/g,
    (match, strLiteral: string | undefined, colon: string | undefined, boolLiteral: string | undefined, numLiteral: string | undefined) => {
      if (strLiteral !== undefined) {
        if (colon !== undefined) {
          return `<span class="rte-tok-key">${strLiteral}</span>${colon}`;
        }
        return `<span class="rte-tok-str">${strLiteral}</span>`;
      }
      if (boolLiteral !== undefined) {
        return `<span class="rte-tok-bool">${boolLiteral}</span>`;
      }
      if (numLiteral !== undefined) {
        return `<span class="rte-tok-num">${numLiteral}</span>`;
      }
      return match;
    },
  );
}

function formatInlineMarkdownToHtml(line: string): string {
  let out = escapeHtml(line);
  // Restore simple color/mark tags if already present in markdown
  out = out.replace(
    /&lt;span style=&quot;color:\s*([^&]+)&quot;&gt;([\s\S]*?)&lt;\/span&gt;/g,
    '<span style="color: $1">$2</span>',
  );
  out = out.replace(
    /&lt;mark style=&quot;background-color:\s*([^&]+)&quot;&gt;([\s\S]*?)&lt;\/mark&gt;/g,
    '<mark style="background-color: $1">$2</mark>',
  );
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rte-inline-img" />');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/~~([^~]+)~~/g, "<s>$1</s>");
  out = out.replace(/_([^_]+)_/g, "<em>$1</em>");
  return out;
}

export function markdownToHtml(md: string): string {
  if (!md || !md.trim()) return "";
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    // Code block
    if (line.trim().startsWith("```")) {
      const explicitLang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? "").trim().startsWith("```")) {
        codeLines.push(lines[i] ?? "");
        i++;
      }
      i++; // skip closing ```
      const rawCode = codeLines.join("\n") || " ";
      const langBadge = detectCodeLang(rawCode, explicitLang);
      html.push(
        `<pre class="rte-code-block" data-lang="${escapeHtml(langBadge)}"><code>${highlightCodeHtml(rawCode)}</code></pre>`,
      );
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      html.push("<hr />");
      i++;
      continue;
    }

    // Headings 1-6
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = (headingMatch[1] ?? "#").length;
      html.push(`<h${level}>${formatInlineMarkdownToHtml(headingMatch[2] ?? "")}</h${level}>`);
      i++;
      continue;
    }

    // Table
    if (line.includes("|") && i + 1 < lines.length && /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(lines[i + 1] ?? "")) {
      const headers = line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => `<th>${formatInlineMarkdownToHtml(cell.trim())}</th>`)
        .join("");
      i += 2;
      const rows: string[] = [];
      while (i < lines.length && (lines[i] ?? "").includes("|") && (lines[i] ?? "").trim() !== "") {
        const rowLine = lines[i] ?? "";
        const cells = rowLine
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((cell) => `<td>${formatInlineMarkdownToHtml(cell.trim())}</td>`)
          .join("");
        rows.push(`<tr>${cells}</tr>`);
        i++;
      }
      html.push(`<table class="rte-table"><thead><tr>${headers}</tr></thead><tbody>${rows.join("")}</tbody></table>`);
      continue;
    }

    // Checklist
    if (/^\s*-\s*\[([ xX])\]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*-\s*\[([ xX])\]\s+/.test(lines[i] ?? "")) {
        const m = (lines[i] ?? "").match(/^\s*-\s*\[([ xX])\]\s+(.*)$/);
        const checked = m && (m[1] ?? "").toLowerCase() === "x";
        const content = m ? formatInlineMarkdownToHtml(m[2] ?? "") : "";
        items.push(
          `<li data-checked="${checked ? "true" : "false"}"><input type="checkbox" ${checked ? "checked" : ""} /><span>${content}</span></li>`,
        );
        i++;
      }
      html.push(`<ul class="rte-checklist">${items.join("")}</ul>`);
      continue;
    }

    // Bullet list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (
        i < lines.length &&
        /^\s*[-*]\s+/.test(lines[i] ?? "") &&
        !/^\s*-\s*\[([ xX])\]\s+/.test(lines[i] ?? "")
      ) {
        const content = (lines[i] ?? "").replace(/^\s*[-*]\s+/, "");
        items.push(`<li>${formatInlineMarkdownToHtml(content)}</li>`);
        i++;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i] ?? "")) {
        const content = (lines[i] ?? "").replace(/^\s*\d+\.\s+/, "");
        items.push(`<li>${formatInlineMarkdownToHtml(content)}</li>`);
        i++;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i] ?? "")) {
        quoteLines.push(formatInlineMarkdownToHtml((lines[i] ?? "").replace(/^\s*>\s?/, "")));
        i++;
      }
      html.push(`<blockquote>${quoteLines.join("<br />")}</blockquote>`);
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    html.push(`<p>${formatInlineMarkdownToHtml(line)}</p>`);
    i++;
  }

  return html.join("");
}

function serializeInlineNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  if (tag === "br") return "\n";
  if (tag === "input" && (el as HTMLInputElement).type === "checkbox") return "";

  const inner = Array.from(el.childNodes).map(serializeInlineNode).join("");

  if (tag === "strong" || tag === "b") return inner ? `**${inner}**` : "";
  if (tag === "em" || tag === "i") return inner ? `_${inner}_` : "";
  if (tag === "s" || tag === "strike" || tag === "del") return inner ? `~~${inner}~~` : "";
  if (tag === "code") return inner ? `\`${inner}\`` : "";
  if (tag === "a") {
    const href = el.getAttribute("href") || "https://";
    return `[${inner || href}](${href})`;
  }
  if (tag === "img") {
    const alt = el.getAttribute("alt") || "image";
    const src = el.getAttribute("src") || "";
    return `![${alt}](${src})`;
  }
  if (tag === "mark") {
    const bg = el.style.backgroundColor;
    return bg ? `<mark style="background-color: ${bg}">${inner}</mark>` : `==${inner}==`;
  }
  if (tag === "span" || tag === "font") {
    const color = el.style.color || el.getAttribute("color");
    const bg = el.style.backgroundColor;
    if (bg) return `<mark style="background-color: ${bg}">${inner}</mark>`;
    if (color) return `<span style="color: ${color}">${inner}</span>`;
    return inner;
  }

  return inner;
}

export function htmlToMarkdown(root: HTMLElement): string {
  const blocks: string[] = [];

  const processBlock = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? "").trim();
      if (text) blocks.push(text);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag[1]);
      const hashes = "#".repeat(level);
      const text = Array.from(el.childNodes).map(serializeInlineNode).join("").trim();
      blocks.push(`${hashes} ${text}`);
      return;
    }

    if (tag === "hr") {
      blocks.push("---");
      return;
    }

    if (tag === "pre") {
      const code = el.textContent ?? "";
      const langAttr = (el.getAttribute("data-lang") || "").toLowerCase();
      const fenceLang = langAttr && langAttr !== "code" ? langAttr : "";
      blocks.push(`\`\`\`${fenceLang}\n${code.replace(/\n$/, "")}\n\`\`\``);
      return;
    }

    if (tag === "blockquote") {
      const inner = Array.from(el.childNodes).map(serializeInlineNode).join("").trim();
      const quoted = inner
        .split("\n")
        .map((l) => `> ${l}`)
        .join("\n");
      blocks.push(quoted);
      return;
    }

    if (tag === "ul") {
      const isChecklist = el.classList.contains("rte-checklist");
      const items = Array.from(el.querySelectorAll(":scope > li")).map((li) => {
        if (isChecklist || li.querySelector('input[type="checkbox"]')) {
          const checkbox = li.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
          const checked = checkbox?.checked || li.getAttribute("data-checked") === "true";
          const text = Array.from(li.childNodes).map(serializeInlineNode).join("").trim();
          return `- [${checked ? "x" : " "}] ${text}`;
        }
        const text = Array.from(li.childNodes).map(serializeInlineNode).join("").trim();
        return `- ${text}`;
      });
      blocks.push(items.join("\n"));
      return;
    }

    if (tag === "ol") {
      const items = Array.from(el.querySelectorAll(":scope > li")).map((li, idx) => {
        const text = Array.from(li.childNodes).map(serializeInlineNode).join("").trim();
        return `${idx + 1}. ${text}`;
      });
      blocks.push(items.join("\n"));
      return;
    }

    if (tag === "table") {
      const rows = Array.from(el.querySelectorAll("tr"));
      if (rows.length === 0) return;
      const matrix = rows.map((tr) =>
        Array.from(tr.querySelectorAll("th, td")).map((cell) =>
          Array.from(cell.childNodes).map(serializeInlineNode).join("").trim() || " ",
        ),
      );
      const header = matrix[0];
      if (!header) return;
      const divider = header.map(() => "---");
      const body = matrix.slice(1);
      const tableLines = [
        `| ${header.join(" | ")} |`,
        `| ${divider.join(" | ")} |`,
        ...body.map((r) => `| ${r.join(" | ")} |`),
      ];
      blocks.push(tableLines.join("\n"));
      return;
    }

    if (tag === "div" || tag === "p") {
      // Check if it contains nested block elements
      const hasBlockChildren = Array.from(el.children).some((c) =>
        /^(H[1-6]|UL|OL|BLOCKQUOTE|PRE|TABLE|HR|DIV|P)$/.test(c.tagName),
      );
      if (hasBlockChildren) {
        Array.from(el.childNodes).forEach(processBlock);
        return;
      }
      const text = Array.from(el.childNodes).map(serializeInlineNode).join("").trim();
      if (text) blocks.push(text);
      return;
    }

    const fallback = Array.from(el.childNodes).map(serializeInlineNode).join("").trim();
    if (fallback) blocks.push(fallback);
  };

  Array.from(root.childNodes).forEach(processBlock);
  return blocks.join("\n\n");
}

export function RichTextEditor({
  name,
  value,
  onChange,
  placeholder = "Describe the work... paste or drop images and files",
  minHeight = 150,
  showFooterHint = true,
  onKeyDown,
  ariaLabel,
}: {
  name?: string;
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  minHeight?: number;
  showFooterHint?: boolean;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  ariaLabel?: string;
}) {
  const [mode, setMode] = useState<"rich" | "markdown">("rich");
  const [headingLabel, setHeadingLabel] = useState("Text");
  const [headingMenuOpen, setHeadingMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [selectedTextColor, setSelectedTextColor] = useState<string>("");
  const [selectedHighlight, setSelectedHighlight] = useState<string>("#fde68a");
  const [hoveredColorLabel, setHoveredColorLabel] = useState<string>("เหลือง — ทั่วไป");

  const editorRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const internalMarkdownRef = useRef<string>(value);

  // Sync incoming value when changed externally
  useEffect(() => {
    if (mode === "rich" && editorRef.current) {
      if (value !== internalMarkdownRef.current) {
        internalMarkdownRef.current = value;
        editorRef.current.innerHTML = markdownToHtml(value);
      } else if (!editorRef.current.innerHTML && value) {
        editorRef.current.innerHTML = markdownToHtml(value);
      }
    }
  }, [value, mode]);

  // Populate initial rich HTML on mount or when switching from markdown to rich
  useEffect(() => {
    if (mode === "rich" && editorRef.current) {
      editorRef.current.innerHTML = markdownToHtml(value);
      internalMarkdownRef.current = value;
    }
  }, [mode]);

  // Close popovers on Escape or outside click
  useEffect(() => {
    if (!headingMenuOpen && !colorMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHeadingMenuOpen(false);
        setColorMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".rte-dropdown-wrap")) {
        setHeadingMenuOpen(false);
        setColorMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [headingMenuOpen, colorMenuOpen]);

  const syncFromDom = () => {
    if (!editorRef.current) return;
    const md = htmlToMarkdown(editorRef.current);
    internalMarkdownRef.current = md;
    onChange(md);
  };

  const insertMarkdownSnippet = (before: string, after = "", defaultText = "") => {
    const next = value ? `${value}${before}${defaultText}${after}` : `${before}${defaultText}${after}`;
    internalMarkdownRef.current = next;
    onChange(next);
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const applyHeading = (option: (typeof HEADING_OPTIONS)[number]) => {
    setHeadingLabel(option.label);
    setHeadingMenuOpen(false);
    if (mode === "markdown") {
      if (option.value === "p") return;
      const level = Number(option.value[1]);
      insertMarkdownSnippet(`\n${"#".repeat(level)} `, "", option.label);
      return;
    }
    focusEditor();
    document.execCommand("formatBlock", false, option.value.toUpperCase());
    syncFromDom();
  };

  const execRichCommand = (cmd: string, arg?: string) => {
    focusEditor();
    document.execCommand(cmd, false, arg);
    syncFromDom();
  };

  const handleInlineCode = () => {
    if (mode === "markdown") {
      insertMarkdownSnippet("`", "`", "code");
      return;
    }
    focusEditor();
    const sel = window.getSelection();
    const selectedText = sel && sel.toString() ? sel.toString() : "code";
    document.execCommand("insertHTML", false, `<code>${escapeHtml(selectedText)}</code>&nbsp;`);
    syncFromDom();
  };

  const handleLink = () => {
    const url = window.prompt("ใส่ลิงก์ URL (Enter URL):", "https://");
    if (!url) return;
    if (mode === "markdown") {
      insertMarkdownSnippet("[ลิงก์](", ")", url);
      return;
    }
    focusEditor();
    const sel = window.getSelection();
    if (sel && sel.toString()) {
      document.execCommand("createLink", false, url);
    } else {
      document.execCommand("insertHTML", false, `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a>`);
    }
    syncFromDom();
  };

  const applyTextColor = (item: (typeof TEXT_COLORS)[number]) => {
    setSelectedTextColor(item.color);
    setHoveredColorLabel(item.label);
    if (mode === "markdown") {
      if (!item.color) return;
      insertMarkdownSnippet(`<span style="color: ${item.color}">`, "</span>", "ข้อความ");
      setColorMenuOpen(false);
      return;
    }
    focusEditor();
    if (!item.color) {
      document.execCommand("removeFormat", false);
    } else {
      document.execCommand("foreColor", false, item.color);
    }
    syncFromDom();
    setColorMenuOpen(false);
  };

  const applyHighlightColor = (item: (typeof HIGHLIGHT_COLORS)[number]) => {
    if (item.bg) setSelectedHighlight(item.bg);
    setHoveredColorLabel(item.label);
    if (mode === "markdown") {
      if (!item.bg) return;
      insertMarkdownSnippet(`<mark style="background-color: ${item.bg}">`, "</mark>", "ข้อความเน้น");
      setColorMenuOpen(false);
      return;
    }
    focusEditor();
    if (!item.bg) {
      document.execCommand("hiliteColor", false, "transparent");
    } else {
      const sel = window.getSelection();
      const text = sel && sel.toString() ? sel.toString() : "ข้อความเน้น";
      document.execCommand(
        "insertHTML",
        false,
        `<mark style="background-color: ${item.bg}">${escapeHtml(text)}</mark>&nbsp;`,
      );
    }
    syncFromDom();
    setColorMenuOpen(false);
  };

  const handleChecklist = () => {
    if (mode === "markdown") {
      insertMarkdownSnippet("\n- [ ] ", "", "รายการเช็กลิสต์");
      return;
    }
    focusEditor();
    document.execCommand(
      "insertHTML",
      false,
      `<ul class="rte-checklist"><li data-checked="false"><input type="checkbox" /><span>รายการเช็กลิสต์</span></li></ul><p><br/></p>`,
    );
    syncFromDom();
  };

  const handleQuote = () => {
    if (mode === "markdown") {
      insertMarkdownSnippet("\n> ", "", "ข้อความอ้างอิง");
      return;
    }
    focusEditor();
    const sel = window.getSelection();
    const text = sel && sel.toString() ? sel.toString() : "ข้อความอ้างอิง";
    document.execCommand("insertHTML", false, `<blockquote>${escapeHtml(text)}</blockquote><p><br/></p>`);
    syncFromDom();
  };

  const handleCodeBlock = () => {
    const sampleJson = `{\n  "message": "Email already exists",\n  "error": "Conflict",\n  "statusCode": 409\n}`;
    if (mode === "markdown") {
      insertMarkdownSnippet("\n```json\n", "\n```", sampleJson);
      return;
    }
    focusEditor();
    const sel = window.getSelection();
    const text = sel && sel.toString() ? sel.toString() : sampleJson;
    const lang = detectCodeLang(text);
    document.execCommand(
      "insertHTML",
      false,
      `<pre class="rte-code-block" data-lang="${escapeHtml(lang)}"><code>${highlightCodeHtml(text)}</code></pre><p><br/></p>`,
    );
    syncFromDom();
  };

  const handleTable = () => {
    if (mode === "markdown") {
      insertMarkdownSnippet(
        "\n| คอลัมน์ 1 | คอลัมน์ 2 | คอลัมน์ 3 |\n| --- | --- | --- |\n| ข้อมูล 1 | ข้อมูล 2 | ข้อมูล 3 |\n",
      );
      return;
    }
    focusEditor();
    document.execCommand(
      "insertHTML",
      false,
      `<table class="rte-table"><thead><tr><th>คอลัมน์ 1</th><th>คอลัมน์ 2</th><th>คอลัมน์ 3</th></tr></thead><tbody><tr><td>ข้อมูล 1</td><td>ข้อมูล 2</td><td>ข้อมูล 3</td></tr><tr><td>ข้อมูล 4</td><td>ข้อมูล 5</td><td>ข้อมูล 6</td></tr></tbody></table><p><br/></p>`,
    );
    syncFromDom();
  };

  const handleDivider = () => {
    if (mode === "markdown") {
      insertMarkdownSnippet("\n\n---\n\n");
      return;
    }
    focusEditor();
    document.execCommand("insertHTML", false, "<hr /><p><br/></p>");
    syncFromDom();
  };

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (mode === "markdown") {
        insertMarkdownSnippet(`\n![${file.name}](${dataUrl})\n`);
      } else {
        focusEditor();
        document.execCommand(
          "insertHTML",
          false,
          `<img src="${dataUrl}" alt="${escapeHtml(file.name)}" class="rte-inline-img" /><p><br/></p>`,
        );
        syncFromDom();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAttachmentFile = (file: File) => {
    if (mode === "markdown") {
      insertMarkdownSnippet(`\n[📎 ${file.name}](#attachment-${encodeURIComponent(file.name)})\n`);
    } else {
      focusEditor();
      document.execCommand(
        "insertHTML",
        false,
        `<a href="#attachment-${encodeURIComponent(file.name)}">📎 ${escapeHtml(file.name)}</a>&nbsp;`,
      );
      syncFromDom();
    }
  };

  const toggleMarkdownMode = () => {
    if (mode === "rich") {
      syncFromDom();
      setMode("markdown");
    } else {
      setMode("rich");
    }
  };

  return (
    <div className="rich-editor rte-shell">
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageFile(file);
          e.target.value = "";
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleAttachmentFile(file);
          e.target.value = "";
        }}
      />

      <div className="rich-toolbar rte-toolbar" role="toolbar" aria-label="Formatting options">
        {/* Heading dropdown (Text / Heading 1-6) */}
        <div className="rte-dropdown-wrap">
          <button
            type="button"
            className="rte-heading-trigger"
            title="รูปแบบข้อความ (Text / Heading 1–6)"
            onClick={() => {
              setHeadingMenuOpen((v) => !v);
              setColorMenuOpen(false);
            }}
          >
            <span>{headingLabel}</span>
            <ChevronDown size={13} />
          </button>
          {headingMenuOpen && (
            <div className="rte-heading-menu" role="listbox">
              {HEADING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={headingLabel === opt.label ? "is-active" : ""}
                  onClick={() => applyHeading(opt)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="drawer-divider" />

        {/* Bold, Italic, Strikethrough, Inline Code, Link */}
        <button
          type="button"
          className="rte-tool-btn"
          title="ตัวหนา (Bold · Ctrl+B)"
          onClick={() => (mode === "markdown" ? insertMarkdownSnippet("**", "**", "ตัวหนา") : execRichCommand("bold"))}
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          className="rte-tool-btn"
          title="ตัวเอียง (Italic · Ctrl+I)"
          onClick={() => (mode === "markdown" ? insertMarkdownSnippet("_", "_", "ตัวเอียง") : execRichCommand("italic"))}
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          className="rte-tool-btn"
          title="ขีดฆ่า (Strikethrough)"
          onClick={() =>
            mode === "markdown" ? insertMarkdownSnippet("~~", "~~", "ขีดฆ่า") : execRichCommand("strikeThrough")
          }
        >
          <Strikethrough size={14} />
        </button>
        <button type="button" className="rte-tool-btn" title="โค้ดในบรรทัด (Inline code)" onClick={handleInlineCode}>
          <Code size={14} />
        </button>
        <button type="button" className="rte-tool-btn" title="แทรกลิงก์ (Link)" onClick={handleLink}>
          <Link2 size={14} />
        </button>

        {/* Text color & Highlight popover */}
        <div className="rte-dropdown-wrap">
          <button
            type="button"
            className={`rte-tool-btn rte-color-trigger ${colorMenuOpen ? "is-open" : ""}`}
            title="สีตัวอักษรและปากกาเน้น (Ctrl+Shift+H = ปากกาสีล่าสุด)"
            onClick={() => {
              setColorMenuOpen((v) => !v);
              setHeadingMenuOpen(false);
            }}
          >
            <span className="rte-color-a" style={{ color: selectedTextColor || undefined }}>
              A
              <i className="rte-color-bar" style={{ background: selectedHighlight || "#fde68a" }} />
            </span>
            <ChevronDown size={11} />
          </button>

          {colorMenuOpen && (
            <div className="rte-color-popover" role="dialog" aria-label="สีตัวอักษรและปากกาเน้น">
              <div className="rte-color-group">
                <span className="rte-color-title">สีตัวอักษร</span>
                <div className="rte-swatch-row">
                  {TEXT_COLORS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`rte-swatch-btn ${selectedTextColor === item.color ? "is-selected" : ""}`}
                      onMouseEnter={() => setHoveredColorLabel(item.label)}
                      onClick={() => applyTextColor(item)}
                      title={item.label}
                    >
                      {item.id === "none" ? (
                        <Ban size={15} />
                      ) : (
                        <strong style={{ color: item.color }}>A</strong>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rte-color-group">
                <span className="rte-color-title">ปากกาเน้น</span>
                <div className="rte-swatch-row">
                  {HIGHLIGHT_COLORS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`rte-swatch-btn rte-highlight-swatch ${
                        (item.id === "none" && !selectedHighlight) || selectedHighlight === item.bg ? "is-selected" : ""
                      }`}
                      style={item.bg ? { backgroundColor: item.bg } : undefined}
                      onMouseEnter={() => setHoveredColorLabel(item.label)}
                      onClick={() => applyHighlightColor(item)}
                      title={item.label}
                    >
                      {item.id === "none" ? <Ban size={15} /> : null}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rte-color-caption">{hoveredColorLabel}</div>

              <div className="rte-color-footer">
                <span>
                  <kbd>Ctrl+Shift+H</kbd> ปากกาสีล่าสุด
                </span>
                <span>
                  <kbd>Esc</kbd> ปิด
                </span>
              </div>
            </div>
          )}
        </div>

        <span className="drawer-divider" />

        {/* Bullet list, Ordered list, Checklist */}
        <button
          type="button"
          className="rte-tool-btn"
          title="รายการหัวข้อย่อย (Bullet list)"
          onClick={() =>
            mode === "markdown"
              ? insertMarkdownSnippet("\n- ", "", "หัวข้อย่อย")
              : execRichCommand("insertUnorderedList")
          }
        >
          <List size={15} />
        </button>
        <button
          type="button"
          className="rte-tool-btn"
          title="ลำดับตัวเลข (Numbered list)"
          onClick={() =>
            mode === "markdown"
              ? insertMarkdownSnippet("\n1. ", "", "รายการลำดับ")
              : execRichCommand("insertOrderedList")
          }
        >
          <ListOrdered size={15} />
        </button>
        <button type="button" className="rte-tool-btn" title="เช็กลิสต์ (Checklist)" onClick={handleChecklist}>
          <CheckSquare size={14} />
        </button>

        <span className="drawer-divider" />

        {/* Quote, Code Block, Table, Divider */}
        <button type="button" className="rte-tool-btn" title="ข้อความอ้างอิง (Quote)" onClick={handleQuote}>
          <Quote size={14} />
        </button>
        <button type="button" className="rte-tool-btn" title="บล็อคโค้ด (Code block)" onClick={handleCodeBlock}>
          <SquareCode size={15} />
        </button>
        <button type="button" className="rte-tool-btn" title="ตาราง (Table)" onClick={handleTable}>
          <Table size={14} />
        </button>
        <button type="button" className="rte-tool-btn" title="เส้นคั่น (Divider)" onClick={handleDivider}>
          <Minus size={15} />
        </button>

        <span className="drawer-divider" />

        {/* Insert Image, Attach File */}
        <button
          type="button"
          className="rte-tool-btn"
          title="แทรกรูป (Insert image)"
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon size={14} />
        </button>
        <button
          type="button"
          className="rte-tool-btn"
          title="แนบไฟล์ (Attach file)"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={14} />
        </button>

        {/* Markdown toggle */}
        <button
          type="button"
          className={`rte-markdown-toggle ${mode === "markdown" ? "is-active" : ""}`}
          title="สลับโหมด Markdown (แปลงเป็น Markdown)"
          onClick={toggleMarkdownMode}
        >
          <FileCode size={13} />
          <span>Markdown</span>
        </button>
      </div>

      {mode === "rich" ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel || placeholder}
          data-placeholder={placeholder}
          className="rte-visual-canvas"
          style={{ minHeight }}
          onInput={syncFromDom}
          onBlur={syncFromDom}
          onClick={(event) => {
            const target = event.target as HTMLElement;
            if (target.tagName === "INPUT" && (target as HTMLInputElement).type === "checkbox") {
              const li = target.closest("li");
              if (li) {
                li.setAttribute("data-checked", (target as HTMLInputElement).checked ? "true" : "false");
              }
              setTimeout(syncFromDom, 0);
            }
          }}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "h") {
              event.preventDefault();
              const found = HIGHLIGHT_COLORS.find((c) => c.bg === selectedHighlight) ?? HIGHLIGHT_COLORS[1];
              applyHighlightColor(found);
              return;
            }
            onKeyDown?.(event);
          }}
        />
      ) : (
        <Textarea
          aria-label={ariaLabel || placeholder}
          className="rich-description rte-markdown-textarea"
          style={{ minHeight }}
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            internalMarkdownRef.current = event.target.value;
            onChange(event.target.value);
          }}
          onKeyDown={onKeyDown}
          spellCheck={false}
        />
      )}

      {showFooterHint && (
        <div className="editor-shortcut-foot">
          type @ to mention someone · paste or drop images and files · markdown shortcuts work: ## heading, - [ ] checklist, **bold**
        </div>
      )}
    </div>
  );
}
