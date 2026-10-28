import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bookmark, BookmarkCheck,
  BookOpen, Check, CheckCircle2, ChevronRight, CircleHelp, Code2,
  ExternalLink, Filter, Github, GitPullRequest, Lightbulb, LoaderCircle,
  Search, Sparkles, Terminal, X, Zap
} from "lucide-react";

const SAMPLE_ISSUES = [
  {
    id: 1001,
    title: "Add clearer validation messages to the sign-up form",
    html_url: "https://github.com/",
    number: 42,
    state: "open",
    user: { login: "sample-maintainer" },
    repository_url: "https://api.github.com/repos/sample/form-helper",
    labels: [{ name: "good first issue", color: "2da44e" }, { name: "javascript", color: "f1e05a" }],
    body: "The sign-up form currently displays a generic error when a user enters an invalid email address. Please add a clear message next to the email field and make sure the message disappears when the input is corrected.",
    repo: "sample/form-helper",
    language: "JavaScript",
    isSample: true
  },
  {
    id: 1002,
    title: "Document how to run the project locally",
    html_url: "https://github.com/",
    number: 18,
    state: "open",
    user: { login: "sample-docs-team" },
    repository_url: "https://api.github.com/repos/sample/learn-kit",
    labels: [{ name: "good first issue", color: "2da44e" }, { name: "documentation", color: "0075ca" }],
    body: "New contributors have reported difficulty starting the project. Add a short section to the README listing prerequisites, installation commands, and how to run the development server.",
    repo: "sample/learn-kit",
    language: "Documentation",
    isSample: true
  },
  {
    id: 1003,
    title: "Add empty-state message when there are no search results",
    html_url: "https://github.com/",
    number: 73,
    state: "open",
    user: { login: "sample-ui-team" },
    repository_url: "https://api.github.com/repos/sample/search-panel",
    labels: [{ name: "good first issue", color: "2da44e" }, { name: "ui", color: "d4c5f9" }],
    body: "When a search returns no matches, the results area is blank. Display a helpful empty-state message that explains there are no results and suggests changing the search terms.",
    repo: "sample/search-panel",
    language: "React",
    isSample: true
  },
  {
    id: 1004,
    title: "Add tests for the date formatting helper",
    html_url: "https://github.com/",
    number: 29,
    state: "open",
    user: { login: "sample-test-team" },
    repository_url: "https://api.github.com/repos/sample/date-tools",
    labels: [{ name: "good first issue", color: "2da44e" }, { name: "tests", color: "8250df" }],
    body: "The formatDate helper does not currently have automated tests. Add tests for a valid date, an invalid input, and a date near midnight. Follow the existing test conventions in the repository.",
    repo: "sample/date-tools",
    language: "JavaScript",
    isSample: true
  }
];

const ROADMAP = [
  "Read the repository README and contribution guidelines",
  "Reproduce the issue and understand expected behaviour",
  "Fork the repository and create a focused branch",
  "Make a small change and add or update tests",
  "Run checks and review your own diff",
  "Open a pull request explaining what changed"
];

function inferLanguage(issue) {
  const text = `${issue.title} ${issue.body || ""} ${(issue.labels || []).map(x => x.name).join(" ")}`.toLowerCase();
  if (text.includes("react")) return "React";
  if (text.includes("python") || text.includes("django")) return "Python";
  if (text.includes("typescript")) return "TypeScript";
  if (text.includes("javascript") || text.includes(" js ")) return "JavaScript";
  if (text.includes("css") || text.includes("style") || text.includes("ui")) return "CSS / UI";
  if (text.includes("readme") || text.includes("documentation") || text.includes("docs")) return "Documentation";
  return "General";
}

function simplifyIssue(issue) {
  const title = (issue.title || "this issue").replace(/[.!?]+$/, "");
  const body = (issue.body || "").replace(/```[\s\S]*?```/g, "code").replace(/[#>*`_\[\]()]/g, " ").replace(/\s+/g, " ").trim();
  const firstSentence = body.split(/(?<=[.!?])\s+/)[0];
  const labels = (issue.labels || []).map(l => l.name.toLowerCase());
  const skills = [];
  const combined = `${title} ${body} ${labels.join(" ")}`.toLowerCase();
  if (combined.includes("react")) skills.push("React");
  if (combined.includes("javascript") || combined.includes("form") || combined.includes("validation")) skills.push("JavaScript");
  if (combined.includes("css") || combined.includes("style") || combined.includes("ui") || combined.includes("empty-state")) skills.push("HTML / CSS");
  if (combined.includes("test")) skills.push("Testing");
  if (combined.includes("readme") || combined.includes("documentation") || combined.includes("docs")) skills.push("Technical writing");
  if (skills.length === 0) skills.push(inferLanguage(issue), "Git basics");
  const isDocs = combined.includes("readme") || combined.includes("documentation") || combined.includes("docs");
  const isTest = combined.includes("test");
  const isUi = combined.includes("ui") || combined.includes("form") || combined.includes("message") || combined.includes("display");
  const steps = isDocs
    ? ["Find the README and check the existing writing style", "Confirm the commands work on a clean setup", "Add concise instructions and verify the Markdown"]
    : isTest
    ? ["Find the helper and its current tests", "Add cases for normal and edge-case inputs", "Run the test command and check the output"]
    : isUi
    ? ["Locate the component responsible for this behaviour", "Reproduce the current behaviour and identify the expected result", "Make a focused change and test both normal and edge cases"]
    : ["Locate the code connected to this issue", "Reproduce the problem and identify the expected result", "Implement a small change and test it"];
  return {
    summary: firstSentence ? firstSentence.slice(0, 360) : `This task asks you to work on: ${title}. Open the original issue and repository guidelines to understand the full requirements.`,
    skills: [...new Set(skills)].slice(0, 4),
    steps,
    difficulty: labels.some(l => l.includes("good first issue") || l.includes("beginner")) ? "Beginner-friendly label" : "Review before choosing",
    caveat: "This is a rule-based starting summary, not an AI-generated or maintainer-approved solution. Read the full issue and repository guidelines before coding."
  };
}

function getRepo(issue) {
  if (issue.repo) return issue.repo;
  const url = issue.repository_url || "";
  const match = url.match(/repos\/([^/]+\/[^/]+)/);
  return match ? match[1] : "GitHub repository";
}

function labelColor(label) {
  const known = { "good first issue": "#2da44e", documentation: "#8250df", bug: "#cf222e", enhancement: "#0969da", javascript: "#9a6700", python: "#0969da", tests: "#8250df" };
  return known[label.toLowerCase()] || "#7774df";
}

export default function App() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingSamples, setUsingSamples] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("All languages");
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem("issuebridge-saved") || "[]"); } catch { return []; }
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem("issuebridge-checklist") || "{}"); } catch { return {}; }
  });
  const [notice, setNotice] = useState("");

  async function loadIssues() {
    setLoading(true);
    setError("");
    setUsingSamples(false);
    try {
      const url = "https://api.github.com/search/issues?q=is:issue+is:open+label:%22good+first+issue%22&sort=updated&order=desc&per_page=24";
      const response = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error(response.status === 403 || response.status === 429 ? "GitHub rate limit reached. Showing sample issues for the demo." : `GitHub request failed (${response.status}). Showing sample issues for the demo.`);
      const data = await response.json();
      const fetched = (data.items || []).map(item => ({ ...item, repo: getRepo(item), language: inferLanguage(item) }));
      if (!fetched.length) throw new Error("No live issues were returned. Showing sample issues for the demo.");
      setIssues(fetched);
    } catch (err) {
      setIssues(SAMPLE_ISSUES);
      setUsingSamples(true);
      setError(err.message || "Could not reach GitHub. Showing sample issues for the demo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadIssues(); }, []);
  useEffect(() => { localStorage.setItem("issuebridge-saved", JSON.stringify(saved)); }, [saved]);
  useEffect(() => { localStorage.setItem("issuebridge-checklist", JSON.stringify(completed)); }, [completed]);

  const visibleIssues = useMemo(() => issues.filter(issue => {
    const text = `${issue.title} ${issue.body || ""} ${getRepo(issue)} ${(issue.labels || []).map(l => l.name).join(" ")}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesLanguage = language === "All languages" || (issue.language || inferLanguage(issue)) === language;
    const matchesSaved = !showSavedOnly || saved.includes(issue.id);
    return matchesQuery && matchesLanguage && matchesSaved;
  }), [issues, query, language, showSavedOnly, saved]);

  function toggleSaved(id) {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function toggleStep(issueId, stepIndex) {
    const key = `${issueId}-${stepIndex}`;
    setCompleted(prev => ({ ...prev, [key]: !prev[key] }));
  }
  function announce(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  }

  const languages = ["All languages", ...new Set(issues.map(i => i.language || inferLanguage(i)))];
  const active = selected;
  const explanation = active ? simplifyIssue(active) : null;
  const checkedCount = active ? ROADMAP.filter((_, i) => completed[`${active.id}-${i}`]).length : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={e => { e.preventDefault(); setSelected(null); }}>
          <span className="brand-mark"><Code2 size={21} /></span>
          <span>issue<span className="brand-accent">bridge</span><small>OPEN SOURCE, MADE FRIENDLIER</small></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <button className={`nav-item ${!showSavedOnly ? "active" : ""}`} onClick={() => setShowSavedOnly(false)}><Activity size={18}/> Discover issues</button>
        <button className={`nav-item ${showSavedOnly ? "active" : ""}`} onClick={() => setShowSavedOnly(true)}><Bookmark size={18}/> Saved issues <span className="nav-count">{saved.length}</span></button>
        <div className="side-card">
          <div className="side-card-icon"><Sparkles size={17}/></div>
          <strong>Your first contribution</strong>
          <p>Find a manageable issue, understand it, and take one step at a time.</p>
          <button onClick={() => document.getElementById("issue-list")?.scrollIntoView({ behavior: "smooth" })}>Explore issues <ChevronRight size={15}/></button>
        </div>
        <div className="sidebar-bottom">
          <div className="status-dot"></div>
          <div><strong>Community powered</strong><small>Public GitHub issues</small></div>
          <Github size={18} className="muted-icon"/>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">Workspace <ChevronRight size={14}/> <span>{active ? "Issue guide" : showSavedOnly ? "Saved issues" : "Discover"}</span></div>
          <a className="github-link" href="https://github.com/issues" target="_blank" rel="noreferrer"><Github size={16}/> GitHub <ExternalLink size={13}/></a>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot"></span> YOUR OPEN-SOURCE JOURNEY STARTS HERE</div>
            <h1>Good code starts<br/>with <span>one small issue.</span></h1>
            <p>Discover beginner-friendly tasks, understand what they mean, and build the confidence to contribute to open source.</p>
            <div className="hero-points"><span><CheckCircle2 size={15}/> Beginner-friendly discovery</span><span><CheckCircle2 size={15}/> Step-by-step guidance</span></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
            <div className="art-center"><Code2 size={42}/></div>
            <div className="float-card float-top"><span className="float-icon green"><Check size={15}/></span><span><b>First issue found</b><small>You're on your way</small></span></div>
            <div className="float-card float-bottom"><span className="float-icon purple"><GitPullRequest size={16}/></span><span><b>Contribution roadmap</b><small>One step at a time</small></span></div>
            <span className="spark spark-a">✦</span><span className="spark spark-b">✧</span>
          </div>
        </section>

        <section className="stats-row">
          <div className="stat-card"><span className="stat-icon purple-bg"><CircleHelp size={18}/></span><div><small>ISSUES TO EXPLORE</small><strong>{loading ? "…" : visibleIssues.length}</strong></div><span className="stat-trend"><ArrowUpRight size={15}/></span></div>
          <div className="stat-card"><span className="stat-icon green-bg"><BookmarkCheck size={18}/></span><div><small>YOUR SAVED ISSUES</small><strong>{saved.length}</strong></div><span className="stat-trend"><ArrowUpRight size={15}/></span></div>
          <div className="stat-card"><span className="stat-icon orange-bg"><Zap size={18}/></span><div><small>YOUR NEXT STEP</small><strong className="stat-word">Start small</strong></div><span className="stat-trend"><ArrowDownRight size={15}/></span></div>
        </section>

        <section className="issues-section" id="issue-list">
          <div className="section-heading">
            <div><div className="section-kicker">FIND YOUR STARTING POINT</div><h2>{showSavedOnly ? "Your saved issues" : "Explore open issues"} <span className="heading-count">{visibleIssues.length}</span></h2><p>Real issues when available. A clear starting point either way.</p></div>
            <button className="refresh-button" onClick={loadIssues} disabled={loading}>{loading ? <LoaderCircle className="spin" size={16}/> : <Activity size={16}/>} Refresh issues</button>
          </div>

          {error && <div className={`notice ${usingSamples ? "notice-warn" : ""}`}><CircleHelp size={16}/><span>{error} {usingSamples && <b>DEMO DATA</b>}</span></div>}

          <div className="filters">
            <label className="search-box"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search issues, skills, repositories..."/>{query && <button aria-label="Clear search" onClick={() => setQuery("")}><X size={15}/></button>}</label>
            <label className="select-box"><Filter size={16}/><select value={language} onChange={e => setLanguage(e.target.value)}>{languages.map(l => <option key={l}>{l}</option>)}</select></label>
            <button className={`filter-pill ${showSavedOnly ? "selected" : ""}`} onClick={() => setShowSavedOnly(v => !v)}><Bookmark size={15}/> Saved only</button>
          </div>

          {loading && issues.length === 0 ? (
            <div className="loading-state"><LoaderCircle className="spin" size={28}/><strong>Finding issues for you…</strong><span>Fetching public GitHub issues</span></div>
          ) : visibleIssues.length === 0 ? (
            <div className="empty-state"><Search size={26}/><strong>No matching issues</strong><p>Try another search or language filter.</p><button className="secondary-button" onClick={() => { setQuery(""); setLanguage("All languages"); setShowSavedOnly(false); }}>Clear filters</button></div>
          ) : (
            <div className="issue-grid">
              {visibleIssues.map(issue => {
                const labels = (issue.labels || []).slice(0, 3);
                return <article className="issue-card" key={issue.id}>
                  <div className="issue-card-top"><span className="issue-status"><span></span> OPEN ISSUE</span><button className={`save-button ${saved.includes(issue.id) ? "saved" : ""}`} title={saved.includes(issue.id) ? "Remove saved issue" : "Save issue"} onClick={() => toggleSaved(issue.id)}>{saved.includes(issue.id) ? <BookmarkCheck size={18}/> : <Bookmark size={18}/>}</button></div>
                  <div className="repo-line"><Github size={14}/><span>{getRepo(issue)}</span><span className="issue-number">#{issue.number}</span></div>
                  <h3>{issue.title}</h3>
                  <p className="issue-body">{(issue.body || "Open the original issue to read the complete task description.").replace(/```[\s\S]*?```/g, "[code snippet]").slice(0, 145)}{(issue.body || "").length > 145 ? "…" : ""}</p>
                  <div className="labels">{labels.map(label => <span className="label" key={label.name}><i style={{ background: `#${label.color || "7774df"}` }}></i>{label.name}</span>)}</div>
                  <div className="issue-card-footer"><span className="language-tag"><span className="language-dot"></span>{issue.language || inferLanguage(issue)}</span><button className="understand-button" onClick={() => setSelected(issue)}>Understand issue <ChevronRight size={15}/></button></div>
                  {issue.isSample && <div className="sample-tag">SAMPLE ISSUE</div>}
                </article>;
              })}
            </div>
          )}
          <div className="api-footnote"><span className="api-dot"></span>{usingSamples ? "Sample mode — these cards are illustrative, not live issues." : "Issue data is fetched from GitHub's public API."} <a href="https://docs.github.com/en/rest/issues" target="_blank" rel="noreferrer">About the data <ExternalLink size={12}/></a></div>
        </section>

        <footer><span>Built with <span className="footer-heart">♥</span> for the open-source community</span><span>IssueBridge <b>·</b> Hack Day demo</span></footer>
      </main>

      {active && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}>
        <section className="issue-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <header className="modal-header"><div className="modal-label"><Sparkles size={16}/> ISSUE EXPLORER</div><button className="close-modal" onClick={() => setSelected(null)} aria-label="Close issue guide"><X size={20}/></button></header>
          <div className="modal-content">
            <div className="modal-repo"><Github size={15}/>{getRepo(active)} <span>#{active.number}</span></div>
            <h2 id="modal-title">{active.title}</h2>
            <div className="modal-badges"><span className="beginner-badge"><CheckCircle2 size={14}/>{explanation.difficulty}</span>{(active.labels || []).slice(0, 3).map(l => <span className="label" key={l.name}>{l.name}</span>)}</div>
            <div className="explain-card">
              <div className="explain-heading"><span className="explain-icon"><Lightbulb size={19}/></span><div><strong>Let's break it down</strong><small>Plain-language starting summary</small></div></div>
              <p>{explanation.summary}</p>
              <div className="explain-caveat">{explanation.caveat}</div>
            </div>
            <div className="modal-two-col">
              <div className="mini-panel"><h3><Code2 size={16}/> Skills to explore</h3><div className="skill-list">{explanation.skills.map(skill => <span key={skill}>{skill}</span>)}</div></div>
              <div className="mini-panel"><h3><BookOpen size={16}/> First steps</h3><ol>{explanation.steps.map((step, i) => <li key={step}><span>{i + 1}</span>{step}</li>)}</ol></div>
            </div>
            <div className="roadmap-panel">
              <div className="roadmap-title"><div><h3><CheckCircle2 size={17}/> Contribution roadmap</h3><p>Tick off each step as you go. Your progress is saved in this browser.</p></div><span className="progress-count">{checkedCount}/{ROADMAP.length}</span></div>
              <div className="progress-track"><div style={{ width: `${checkedCount / ROADMAP.length * 100}%` }}></div></div>
              {ROADMAP.map((step, i) => <label className={`roadmap-step ${completed[`${active.id}-${i}`] ? "done" : ""}`} key={step}><input type="checkbox" checked={!!completed[`${active.id}-${i}`]} onChange={() => toggleStep(active.id, i)}/><span className="custom-check"><Check size={13}/></span><span>{step}</span></label>)}
            </div>
            <div className="modal-actions"><a className="primary-button" href={active.isSample ? "https://github.com/issues" : active.html_url} target="_blank" rel="noreferrer" onClick={() => announce("Opening GitHub in a new tab")}>Open original issue <ExternalLink size={15}/></a><button className="secondary-button" onClick={() => toggleSaved(active.id)}>{saved.includes(active.id) ? <BookmarkCheck size={16}/> : <Bookmark size={16}/>} {saved.includes(active.id) ? "Saved" : "Save issue"}</button></div>
          </div>
        </section>
      </div>}

      {notice && <div className="toast"><CheckCircle2 size={16}/>{notice}</div>}
    </div>
  );
}