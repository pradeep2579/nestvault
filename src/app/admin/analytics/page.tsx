import { db } from "@/lib/supabase";
import { requirePageActor } from "@/lib/admin-page";
import { googleToken, googlePost, googleConfigProblems } from "@/lib/google";
import { chartPath, dailySeries, formatCount, percent, reportWindow, shares, windowDates } from "@/lib/analytics";
import { disconnectGoogle, saveAnalyticsSettings } from "./actions";
import { TrendChart, type Series } from "./charts";

type Props = { searchParams: Promise<{ days?: string; error?: string; saved?: string; connected?: string; disconnected?: string }> };
type GscRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };
type GaReport = { rows?: { dimensionValues?: { value: string }[]; metricValues: { value: string }[] }[] };
type Connection = { search_site: string | null; ga4_property_id: string | null };

const errors: Record<string, string> = {
  config: "Google OAuth is not configured in Vercel. Add the client ID, client secret, and token encryption key.",
  state: "Google sign-in expired or did not match this session. Try connecting again.",
  google: "Google authorization failed. Check the OAuth redirect URL and try again.",
  search_site: "That Search Console property was not recognised. Enter your domain (nestvault.in) or the full URL (https://nestvault.in/).",
  ga4_property: "The GA4 property ID must be numbers only, like 540224670. It is not the G- measurement ID.",
  save: "Could not save the properties. Try again.",
};
// Categorical slots in fixed order (validated palette); the last slot is the neutral "Other".
const slotColors = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#6250d6"];
const otherColor = "#a3a9b5";
const num = (value: string | undefined) => Number(value || 0);
const message = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

async function loadReports(connection: Connection, startDate: string, endDate: string) {
  const result = { searchError: "", gaError: "", queries: [] as GscRow[], pages: [] as GscRow[], searchDaily: [] as GscRow[],
    totals: undefined as GaReport | undefined, daily: undefined as GaReport | undefined, channels: undefined as GaReport | undefined,
    devices: undefined as GaReport | undefined, leads: 0 };
  let token: string;
  try { token = (await googleToken()).token; }
  catch (error) { result.searchError = result.gaError = message(error, "Google connection failed"); return result; }
  await Promise.all([
    (async () => {
      if (!connection.search_site) return;
      const base = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(connection.search_site)}/searchAnalytics/query`;
      try {
        const [queries, pages, daily] = await Promise.all([
          googlePost(base, token, { startDate, endDate, dimensions: ["query"], rowLimit: 8 }),
          googlePost(base, token, { startDate, endDate, dimensions: ["page"], rowLimit: 8 }),
          googlePost(base, token, { startDate, endDate, dimensions: ["date"], rowLimit: 1000 }),
        ]);
        result.queries = queries.rows || []; result.pages = pages.rows || []; result.searchDaily = daily.rows || [];
      } catch (error) { result.searchError = message(error, "Search Console failed"); }
    })(),
    (async () => {
      if (!connection.ga4_property_id) return;
      const base = `https://analyticsdata.googleapis.com/v1beta/properties/${connection.ga4_property_id}:runReport`;
      const dateRanges = [{ startDate, endDate }];
      const bySessions = { orderBys: [{ metric: { metricName: "sessions" }, desc: true }] };
      try {
        const [totals, daily, channels, devices, leads] = await Promise.all([
          googlePost(base, token, { dateRanges, metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }, { name: "engagementRate" }, { name: "averageSessionDuration" }] }),
          googlePost(base, token, { dateRanges, dimensions: [{ name: "date" }], metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }] }),
          googlePost(base, token, { dateRanges, dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }], ...bySessions }),
          googlePost(base, token, { dateRanges, dimensions: [{ name: "deviceCategory" }], metrics: [{ name: "sessions" }], ...bySessions }),
          googlePost(base, token, { dateRanges, metrics: [{ name: "eventCount" }], dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "generate_lead" } } } }),
        ]);
        Object.assign(result, { totals, daily, channels, devices, leads: num(leads.rows?.[0]?.metricValues?.[0]?.value) });
      } catch (error) { result.gaError = message(error, "GA4 failed"); }
    })(),
  ]);
  return result;
}

/** Small trend line for a stat tile; decorative, the number beside it carries the value. */
function Sparkline({ values, light = false }: { values: number[]; light?: boolean }) {
  if (values.length < 2) return null;
  const { line, area } = chartPath(values, 120, 36, 3);
  return <svg className="an-spark" viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden="true">
    <path d={area} fill={light ? "#ffffff1f" : "#2a78d614"} /><path d={line} fill="none" stroke={light ? "#c9a84c" : "#2a78d6"} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
  </svg>;
}

function Stat({ label, value, note, values, hero = false, icon }: { label: string; value: string; note?: string; values?: number[]; hero?: boolean; icon: React.ReactNode }) {
  return <div className={`an-stat${hero ? " an-stat-hero" : ""}`}>
    <div className="an-stat-head"><span className="an-stat-icon" aria-hidden="true">{icon}</span>{label}</div>
    <strong>{value}</strong>
    {note && <small>{note}</small>}
    {values && <Sparkline values={values} light={hero} />}
  </div>;
}

function Donut({ items }: { items: { label: string; value: number; color: string }[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const radius = 54, circumference = 2 * Math.PI * radius, gap = items.length > 1 ? 2 : 0;
  const slices = shares(items.map(item => item.value));
  return <div className="an-donut">
    <svg viewBox="0 0 140 140" role="img" aria-label="Sessions by traffic source">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#eef0f4" strokeWidth="18" />
      {total > 0 && items.map((item, index) => {
        const length = Math.max(0, slices[index].share * circumference - gap);
        return <circle key={item.label} cx="70" cy="70" r={radius} fill="none" stroke={item.color} strokeWidth="18"
          strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-slices[index].start * circumference} transform="rotate(-90 70 70)">
          <title>{`${item.label}: ${formatCount(item.value)} sessions (${percent(item.value, total)})`}</title></circle>;
      })}
      <text x="70" y="68" textAnchor="middle" className="an-donut-value">{formatCount(total)}</text>
      <text x="70" y="86" textAnchor="middle" className="an-donut-label">sessions</text>
    </svg>
    <ul className="an-legend">{items.map(item => <li key={item.label}>
      <span className="an-swatch" style={{ background: item.color }} />{item.label}<b>{percent(item.value, total, 0)}</b></li>)}</ul>
  </div>;
}

function BarList({ rows, valueLabel }: { rows: { label: string; value: number; detail?: string; href?: string }[]; valueLabel: string }) {
  const max = Math.max(1, ...rows.map(row => row.value));
  return <ol className="an-bars">{rows.map((row, index) => <li key={`${row.label}-${index}`}>
    <span className="an-rank">{index + 1}</span>
    <div className="an-bar-body">
      <div className="an-bar-text">{row.href ? <a href={row.href} target="_blank" rel="noreferrer">{row.label}</a> : <span>{row.label}</span>}
        <b title={valueLabel}>{formatCount(row.value)}</b></div>
      <div className="an-bar-track"><span style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }} /></div>
      {row.detail && <small>{row.detail}</small>}
    </div>
  </li>)}</ol>;
}

const icons = {
  users: <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.8a3.3 3.3 0 0 1 0 6.4M18 14.4c2 .7 3.5 2.6 3.5 5.6" /></svg>,
  sessions: <svg viewBox="0 0 24 24"><path d="M3 12h4l3-7 4 14 3-7h4" /></svg>,
  views: <svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>,
  leads: <svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4V5Z" /><path d="M8 10h8M8 13h5" /></svg>,
  search: <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 5 5" /></svg>,
  google: <svg viewBox="0 0 24 24"><path d="M20.5 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.6-3.9 2.6-6.6Z" /><path d="M12 21c2.4 0 4.5-.8 5.9-2.2L15 16.6c-.8.6-1.8.9-3 .9-2.3 0-4.3-1.6-5-3.7H4v2.3A9 9 0 0 0 12 21ZM7 13.8a5.4 5.4 0 0 1 0-3.6V7.9H4a9 9 0 0 0 0 8.2l3-2.3ZM12 6.5c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 4 7.9l3 2.3c.7-2.1 2.7-3.7 5-3.7Z" /></svg>,
};

export default async function Analytics({ searchParams }: Props) {
  await requirePageActor(true);
  const query = await searchParams;
  const days = [7, 28, 90].includes(Number(query.days)) ? Number(query.days) : 28;
  const configProblems = googleConfigProblems();
  const trackingConfigured = !!process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const { data: connection, error: connectionError } = await db().from("integrations").select("name,search_site,ga4_property_id").eq("name", "google").maybeSingle();
  const { startDate, endDate } = reportWindow(days);
  const dates = windowDates(startDate, endDate);
  const report = connection ? await loadReports(connection, startDate, endDate) : null;

  // A report that loaded with no rows means 0; a missing or failed report shows a dash.
  const gaLoaded = !!connection?.ga4_property_id && !!report && !report.gaError;
  const searchLoaded = !!connection?.search_site && !!report && !report.searchError;
  const total = (index: number) => gaLoaded ? num(report?.totals?.rows?.[0]?.metricValues?.[index]?.value) : null;
  const gaDaily = (index: number) => dailySeries(dates, (report?.daily?.rows || []).map(row => ({ date: row.dimensionValues?.[0]?.value || "", value: num(row.metricValues[index]?.value) })));
  const searchDaily = (field: "clicks" | "impressions") => dailySeries(dates, (report?.searchDaily || []).map(row => ({ date: row.keys[0], value: row[field] })));
  const users = total(0), sessions = total(1), views = total(2), engagement = total(3), duration = total(4);
  const leads = gaLoaded ? report!.leads : null;
  const clicks = searchLoaded ? searchDaily("clicks").reduce((sum, point) => sum + point.value, 0) : null;
  const impressions = searchLoaded ? searchDaily("impressions").reduce((sum, point) => sum + point.value, 0) : null;
  const position = searchLoaded && impressions ? (report!.searchDaily.reduce((sum, row) => sum + row.position * row.impressions, 0) / impressions) : null;

  const series: Series[] = [];
  if (gaLoaded) series.push(
    { key: "users", label: "Active users", total: formatCount(users), points: gaDaily(0) },
    { key: "sessions", label: "Sessions", total: formatCount(sessions), points: gaDaily(1) },
    { key: "views", label: "Page views", total: formatCount(views), points: gaDaily(2) });
  if (searchLoaded) series.push(
    { key: "clicks", label: "Search clicks", total: formatCount(clicks), points: searchDaily("clicks") },
    { key: "impressions", label: "Impressions", total: formatCount(impressions), points: searchDaily("impressions") });

  const channelRows = (report?.channels?.rows || []).map(row => ({ label: row.dimensionValues?.[0]?.value || "Unassigned", value: num(row.metricValues[0]?.value) }));
  const channels = [...channelRows.slice(0, 5).map((row, index) => ({ ...row, color: slotColors[index] })),
    ...(channelRows.length > 5 ? [{ label: "Other", value: channelRows.slice(5).reduce((sum, row) => sum + row.value, 0), color: otherColor }] : [])];
  const deviceRows = (report?.devices?.rows || []).map(row => ({ label: row.dimensionValues?.[0]?.value || "other", value: num(row.metricValues[0]?.value) }));
  const deviceTotal = deviceRows.reduce((sum, row) => sum + row.value, 0);
  const deviceShares = shares(deviceRows.map(row => row.value));

  const funnel = [
    { label: "Seen in Google", value: impressions, note: "Search impressions" },
    { label: "Clicked through", value: clicks, note: "Search clicks" },
    { label: "Visited", value: sessions, note: "All sessions" },
    { label: "Enquired", value: leads, note: "Saved enquiries" },
  ].filter((step): step is { label: string; value: number; note: string } => step.value !== null);
  const funnelMax = Math.max(1, ...funnel.map(step => step.value));

  const setupNeeded = !!configProblems.length || !connection || !connection.search_site || !connection.ga4_property_id || (!!query.error && query.error in errors);
  const status = !connection ? { tone: "off", text: "Google not connected" } : setupNeeded ? { tone: "warn", text: "Finish Google setup" } : { tone: "on", text: "Google connected" };
  const connectionPanel = <>
    <div className="an-panel-head"><span className="an-google" aria-hidden="true">{icons.google}</span>
      <div><h2>Google connection</h2><p>{connection ? "Read-only access to Search Console and GA4." : "Connect the Google account that can see the Nest Vault Search Console and GA4 properties."}</p></div></div>
    {!!configProblems.length && <div className="admin-error"><p>Google reporting setup is incomplete in Vercel:</p><ul>{configProblems.map(problem => <li key={problem}>{problem}</li>)}</ul></div>}
    {!trackingConfigured && <p className="admin-error">GA4 website tracking is not configured. Add the web stream measurement ID in Vercel to collect new page views and saved enquiries.</p>}
    {connection && <form action={saveAnalyticsSettings} className="admin-form an-settings">
      <label>Search Console property<input name="search_site" defaultValue={connection.search_site || ""} placeholder="nestvault.in or https://nestvault.in/" /></label>
      <label>GA4 property ID<input name="ga4_property_id" inputMode="numeric" defaultValue={connection.ga4_property_id || ""} placeholder="Numbers only, e.g. 540224670" /></label>
      <button>Save properties</button>
    </form>}
    <div className="an-panel-actions"><a className="admin-button" href="/api/admin/google/connect">{connection ? "Reconnect Google" : "Connect Google"}</a>
      {connection && <form action={disconnectGoogle}><button className="admin-button admin-button-danger">Disconnect</button></form>}</div>
  </>;

  return <div className="an-page">
    <div className="an-header">
      <div className="admin-page-heading"><p className="admin-eyebrow">PERFORMANCE</p><h1>Analytics</h1><p>Search visibility, website traffic and saved enquiries at a glance.</p></div>
      <div className="an-controls">
        <nav className="an-range" aria-label="Report period">{[7, 28, 90].map(n => <a key={n} href={`/admin/analytics?days=${n}`} aria-current={n === days ? "page" : undefined}>{n} days</a>)}</nav>
        {!setupNeeded && <button type="button" className={`an-status an-status-${status.tone}`} popoverTarget="an-connection"><span className="an-status-dot" />{status.text}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></button>}
      </div>
    </div>
    <p className="an-range-note">{shortRange(startDate, endDate)} · Search Console data arrives about 3 days late, so every report ends on the same date.</p>

    {query.connected && <p className="admin-success">Google connected. Select your properties below.</p>}
    {query.saved && <p className="admin-success">Properties saved.</p>}
    {query.disconnected && <p className="admin-success">Google disconnected.</p>}
    {query.error && <p className="admin-error">{errors[query.error] || "Google connection failed. Try connecting again."}</p>}
    {connectionError && <p className="admin-error">Could not check the saved Google connection: {connectionError.message}</p>}

    {setupNeeded
      ? <section className="admin-card an-setup"><span className={`an-status an-status-${status.tone}`}><span className="an-status-dot" />{status.text}</span>{connectionPanel}</section>
      : <div id="an-connection" popover="auto" className="an-popover">{connectionPanel}</div>}

    {report?.gaError && <p className="admin-error">GA4: {report.gaError}</p>}
    {report?.searchError && report.searchError !== report.gaError && <p className="admin-error">Search Console: {report.searchError}</p>}

    <section className="an-stats" aria-label="Key numbers">
      <Stat hero label="Active users" value={formatCount(users)} note={sessions && users ? `${(sessions / users).toFixed(1)} sessions per user` : undefined} values={gaLoaded ? gaDaily(0).map(point => point.value) : undefined} icon={icons.users} />
      <Stat label="Sessions" value={formatCount(sessions)} note={engagement !== null ? `${percent(engagement, 1, 0)} engaged` : undefined} values={gaLoaded ? gaDaily(1).map(point => point.value) : undefined} icon={icons.sessions} />
      <Stat label="Page views" value={formatCount(views)} note={views !== null && sessions ? `${(views / sessions).toFixed(1)} pages per session` : undefined} values={gaLoaded ? gaDaily(2).map(point => point.value) : undefined} icon={icons.views} />
      <Stat label="Saved enquiries" value={formatCount(leads)} note={leads !== null && sessions ? `${percent(leads, sessions)} of sessions` : undefined} icon={icons.leads} />
      <Stat label="Search clicks" value={formatCount(clicks)} note={clicks !== null && impressions ? `${percent(clicks, impressions)} click rate` : undefined} values={searchLoaded ? searchDaily("clicks").map(point => point.value) : undefined} icon={icons.search} />
    </section>

    {series.length > 0 && <section className="admin-card an-card"><div className="an-card-head"><h2>Daily trend</h2><p>Hover the chart to see each day.</p></div><TrendChart series={series} /></section>}

    <div className="an-trio">
      <section className="admin-card an-card"><div className="an-card-head"><h2>Where visitors come from</h2><p>Sessions by traffic source</p></div>
        {channels.length ? <Donut items={channels} /> : <p className="an-empty">{gaLoaded ? "No visits in this period yet." : "Connect GA4 to see traffic sources."}</p>}
      </section>
      <section className="admin-card an-card"><div className="an-card-head"><h2>Devices</h2><p>Share of sessions</p></div>
        {deviceTotal ? <>
          <div className="an-stack" role="img" aria-label="Sessions by device">{deviceRows.map((row, index) => <span key={row.label} style={{ width: `${deviceShares[index].share * 100}%`, background: slotColors[index] || otherColor }} title={`${row.label}: ${percent(row.value, deviceTotal)}`} />)}</div>
          <ul className="an-devices">{deviceRows.map((row, index) => <li key={row.label}><span className="an-swatch" style={{ background: slotColors[index] || otherColor }} />
            <span className="an-device-name">{row.label}</span><b>{percent(row.value, deviceTotal, 0)}</b><small>{formatCount(row.value)} sessions</small></li>)}</ul>
          <dl className="an-facts">
            <div><dt>Avg. visit</dt><dd>{duration !== null ? `${Math.floor(duration / 60)}m ${Math.round(duration % 60)}s` : "—"}</dd></div>
            <div><dt>Avg. Google position</dt><dd>{position !== null ? position.toFixed(1) : "—"}</dd></div>
          </dl>
        </> : <p className="an-empty">{gaLoaded ? "No visits in this period yet." : "Connect GA4 to see devices."}</p>}
      </section>
      <section className="admin-card an-card"><div className="an-card-head"><h2>From search to enquiry</h2><p>How people move toward contacting you</p></div>
        {funnel.length ? <ol className="an-funnel">{funnel.map((step, index) => <li key={step.label}>
          <div className="an-funnel-text"><span>{step.label}</span><b>{formatCount(step.value)}</b></div>
          <div className="an-funnel-bar"><span style={{ width: `${Math.max(3, (step.value / funnelMax) * 100)}%` }} /></div>
          <small>{step.note}{index > 0 && ` · ${percent(step.value, funnel[index - 1].value)} of previous step`}</small>
        </li>)}</ol> : <p className="an-empty">Connect Google to see the journey.</p>}
      </section>
    </div>

    <div className="an-duo">
      <section className="admin-card an-card"><div className="an-card-head"><h2>Top searches</h2><p>What people typed in Google before clicking</p></div>
        {report?.queries.length ? <BarList valueLabel="Clicks" rows={report.queries.map(row => ({ label: row.keys[0], value: row.clicks, detail: `${formatCount(row.impressions)} impressions · position ${row.position.toFixed(1)}` }))} />
          : <p className="an-empty">{searchLoaded ? "No search queries in this period yet." : "Add the Search Console property to see searches."}</p>}
      </section>
      <section className="admin-card an-card"><div className="an-card-head"><h2>Top pages from search</h2><p>Pages that earned the most Google clicks</p></div>
        {report?.pages.length ? <BarList valueLabel="Clicks" rows={report.pages.map(row => ({ label: pagePath(row.keys[0]), href: row.keys[0], value: row.clicks, detail: `${formatCount(row.impressions)} impressions · ${percent(row.ctr, 1)} click rate` }))} />
          : <p className="an-empty">{searchLoaded ? "No page data in this period yet." : "Add the Search Console property to see pages."}</p>}
      </section>
    </div>
  </div>;
}

function shortRange(startDate: string, endDate: string) {
  const format = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return `${format(startDate)} – ${format(endDate)}`;
}

function pagePath(url: string) {
  try { const { pathname } = new URL(url); return pathname === "/" ? "Home page" : decodeURIComponent(pathname); } catch { return url; }
}
