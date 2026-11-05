import { db } from "@/lib/supabase";
import { requirePageActor } from "@/lib/admin-page";
import { googleToken, googlePost } from "@/lib/google";
import { disconnectGoogle, saveAnalyticsSettings } from "./actions";

type Props = { searchParams: Promise<{ days?: string; error?: string; saved?: string; connected?: string; disconnected?: string }> };
type GscRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };
type GaRow = { metricValues: { value: string }[] };

export default async function Analytics({ searchParams }: Props) {
  await requirePageActor(true);
  const query = await searchParams;
  const days = [7,28,90].includes(Number(query.days)) ? Number(query.days) : 28;
  const oauthConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && Buffer.from(process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || "", "base64").length === 32);
  const trackingConfigured = !!process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const { data: connection, error: connectionError } = await db().from("integrations").select("name,search_site,ga4_property_id").eq("name", "google").maybeSingle();
  let searchRows: GscRow[] = [], pageRows: GscRow[] = [], ga: GaRow[] = [], conversions = 0;
  let searchError = "", gaError = "";
  if (connection) {
    try {
      const { token } = await googleToken();
      const endDate = new Date(Date.now() - 3 * 86400000).toISOString().slice(0,10);
      const startDate = new Date(Date.now() - (days + 3) * 86400000).toISOString().slice(0,10);
      if (connection.search_site) {
        const base = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(connection.search_site)}/searchAnalytics/query`;
        try {
          const [queries, pages] = await Promise.all([
            googlePost(base, token, { startDate, endDate, dimensions: ["query"], rowLimit: 10 }),
            googlePost(base, token, { startDate, endDate, dimensions: ["page"], rowLimit: 10 }),
          ]);
          searchRows = queries.rows || []; pageRows = pages.rows || [];
        } catch (error) { searchError = error instanceof Error ? error.message : "Search Console failed"; }
      }
      if (connection.ga4_property_id) {
        try {
          const base = `https://analyticsdata.googleapis.com/v1beta/properties/${connection.ga4_property_id}:runReport`;
          const [overview, leads] = await Promise.all([
            googlePost(base, token, { dateRanges: [{ startDate: `${days}daysAgo`, endDate: "yesterday" }], metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }] }),
            googlePost(base, token, { dateRanges: [{ startDate: `${days}daysAgo`, endDate: "yesterday" }], metrics: [{ name: "eventCount" }],
              dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "generate_lead" } } } }),
          ]);
          ga = overview.rows || []; conversions = Number(leads.rows?.[0]?.metricValues?.[0]?.value || 0);
        } catch (error) { gaError = error instanceof Error ? error.message : "GA4 failed"; }
      }
    } catch (error) { searchError = gaError = error instanceof Error ? error.message : "Google connection failed"; }
  }
  return <><div className="admin-page-heading"><p className="admin-eyebrow">PERFORMANCE</p><h1>Analytics</h1><p>Understand search visibility, traffic, and saved enquiries.</p></div>
    {query.connected && <p className="admin-success">Google connected. Select your properties below.</p>}
    {query.saved && <p className="admin-success">Properties saved.</p>}
    {query.disconnected && <p className="admin-success">Google disconnected.</p>}
    {query.error && <p className="admin-error">{({ config: "Google OAuth is not configured in Vercel. Add the client ID, client secret, and token encryption key.", state: "Google sign-in expired or did not match this session. Try connecting again.", google: "Google authorization failed. Check the OAuth redirect URL and try again." } as Record<string, string>)[query.error] || "Google connection failed. Try connecting again."}</p>}
    {connectionError && <p className="admin-error">Could not check the saved Google connection: {connectionError.message}</p>}
    <section className="admin-card"><h2>Google connection</h2>
      <p>{connection ? "Connected with read-only access to Search Console and GA4." : "Connect a Google account with access to the Nest Vault Search Console and GA4 properties."}</p>
      {!oauthConfigured && <p className="admin-error">Google reporting setup is incomplete. Add the OAuth client ID, client secret, and token encryption key in Vercel.</p>}
      {!trackingConfigured && <p className="admin-error">GA4 website tracking is not configured. Add the web stream measurement ID in Vercel to collect new page views and saved enquiries.</p>}
      <div className="admin-row"><a className="admin-button" href="/api/admin/google/connect">{connection ? "Reconnect Google" : "Connect Google"}</a>
      {connection && <form action={disconnectGoogle}><button className="admin-button">Disconnect</button></form>}</div>
      {connection && <form action={saveAnalyticsSettings} className="admin-form">
        <label>Search Console property<input name="search_site" defaultValue={connection.search_site || ""} placeholder="https://nestvault.in/ or sc-domain:nestvault.in" /></label>
        <label>GA4 property ID<input name="ga4_property_id" defaultValue={connection.ga4_property_id || ""} placeholder="Numeric property ID, not measurement ID" /></label>
        <button>Save properties</button>
      </form>}
      {connection && !connection.search_site && <p className="admin-error">Enter the Search Console property above to show search reports.</p>}
      {connection && !connection.ga4_property_id && <p className="admin-error">Enter the numeric GA4 property ID above to show traffic and enquiry reports.</p>}
    </section>
    <section style={{ marginTop: "1.5rem" }}><div className="admin-row"><h2>Performance</h2>{[7,28,90].map(n => <a key={n} className="admin-link" href={`/admin/analytics?days=${n}`}>{n} days</a>)}</div>
      <div className="admin-grid"><div className="admin-card"><strong>{ga[0]?.metricValues?.[0]?.value || "—"}</strong><p>Active users</p></div>
      <div className="admin-card"><strong>{ga[0]?.metricValues?.[1]?.value || "—"}</strong><p>Sessions</p></div>
      <div className="admin-card"><strong>{ga[0]?.metricValues?.[2]?.value || "—"}</strong><p>Page views</p></div>
      <div className="admin-card"><strong>{connection?.ga4_property_id ? conversions : "—"}</strong><p>Saved enquiries (GA4 event)</p></div>
      <div className="admin-card"><strong>{searchRows.reduce((sum, row) => sum + row.clicks, 0) || "—"}</strong><p>Clicks in top queries</p></div>
      <div className="admin-card"><strong>{searchRows.reduce((sum, row) => sum + row.impressions, 0) || "—"}</strong><p>Impressions in top queries</p></div></div>
      {searchError && <p className="admin-error">Search Console: {searchError}</p>}{gaError && <p className="admin-error">GA4: {gaError}</p>}
      <div className="admin-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: "1.5rem" }}>
        <div className="admin-card"><h2>Top queries</h2><table className="admin-table"><thead><tr><th>Query</th><th>Clicks</th><th>Impressions</th></tr></thead><tbody>{searchRows.map((row,i) => <tr key={i}><td>{row.keys[0]}</td><td>{row.clicks}</td><td>{row.impressions}</td></tr>)}</tbody></table>{!searchRows.length && <p>No query data yet.</p>}</div>
        <div className="admin-card"><h2>Top pages</h2><table className="admin-table"><thead><tr><th>Page</th><th>Clicks</th></tr></thead><tbody>{pageRows.map((row,i) => <tr key={i}><td style={{ overflowWrap: "anywhere" }}>{row.keys[0]}</td><td>{row.clicks}</td></tr>)}</tbody></table>{!pageRows.length && <p>No page data yet.</p>}</div>
      </div>
    </section></>;
}
