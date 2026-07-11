"use client";

import { useEffect, useMemo, useState } from "react";

type LastMileKpi = { id: string; name: string; unit: string; defects: number; opportunities: number; target: number; severity: number; owner: string; signal: string; method: string };
type DspFirm = { id: string; name: string; station: string; area: string; routes: number; drivers: number; contact: string; status: string };

const initialKpis: LastMileKpi[] = [
  { id: "delay", name: "Delay", unit: "late stops", defects: 1840, opportunities: 52000, target: 1.8, severity: 4, owner: "DSP / Route Ops", signal: "Planned vs actual stop time", method: "Reduce route variance and rescue late waves" },
  { id: "incomplete", name: "Incomplete delivery", unit: "failed stops", defects: 960, opportunities: 52000, target: 0.9, severity: 5, owner: "Station Ops", signal: "Attempted but not completed", method: "Fix access, address quality, and driver exception flow" },
  { id: "damage", name: "Damage", unit: "damaged parcels", defects: 520, opportunities: 52000, target: 0.35, severity: 4, owner: "Sort / Loadout", signal: "Customer or driver damage scan", method: "Separate fragile handling and audit loading pressure points" },
  { id: "lostbags", name: "Lost bags", unit: "missing bags", defects: 210, opportunities: 7600, target: 0.12, severity: 5, owner: "Loadout Control", signal: "Bag scan gap by route", method: "Scan-to-stage reconciliation before departure" },
  { id: "accidents", name: "Accidents", unit: "safety events", defects: 18, opportunities: 52000, target: 0.02, severity: 5, owner: "Safety / DSP", signal: "Incident, near miss, or telematics event", method: "Coach risky lanes, weather exposure, and high-pressure routes" },
];

const hessenAreas = [
  { id: "hessen", name: "Complete Hessen", query: "Hessen Germany delivery area", type: "State coverage" },
  { id: "frankfurt", name: "Frankfurt am Main", query: "Frankfurt am Main Hessen Germany", type: "Urban dense" },
  { id: "wiesbaden", name: "Wiesbaden / Mainz-Kastel", query: "Wiesbaden Hessen Germany", type: "Urban / suburban" },
  { id: "darmstadt", name: "Darmstadt / South Hessen", query: "Darmstadt Hessen Germany", type: "Suburban" },
  { id: "kassel", name: "Kassel / North Hessen", query: "Kassel Hessen Germany", type: "Regional" },
  { id: "giessen", name: "Giessen / Central Hessen", query: "Giessen Hessen Germany", type: "Mixed routes" },
  { id: "fulda", name: "Fulda / East Hessen", query: "Fulda Hessen Germany", type: "Rural / regional" },
  { id: "hanau", name: "Hanau / Offenbach corridor", query: "Hanau Offenbach Hessen Germany", type: "High volume corridor" },
];

const initialDspFirms: DspFirm[] = [
  { id: "dsp-1", name: "DSP Firma 1", station: "Frankfurt", area: "Frankfurt am Main", routes: 42, drivers: 58, contact: "ops@dsp1.de", status: "Active" },
  { id: "dsp-2", name: "DSP Firma 2", station: "Wiesbaden", area: "Wiesbaden", routes: 31, drivers: 44, contact: "ops@dsp2.de", status: "Active" },
  { id: "dsp-3", name: "DSP Firma 3", station: "Darmstadt", area: "South Hessen", routes: 27, drivers: 36, contact: "ops@dsp3.de", status: "Watch" },
  { id: "dsp-4", name: "DSP Firma 4", station: "Kassel", area: "North Hessen", routes: 24, drivers: 32, contact: "ops@dsp4.de", status: "Active" },
  { id: "dsp-5", name: "DSP Firma 5", station: "Giessen", area: "Central Hessen", routes: 22, drivers: 29, contact: "ops@dsp5.de", status: "Active" },
  { id: "dsp-6", name: "DSP Firma 6", station: "Fulda", area: "East Hessen", routes: 18, drivers: 25, contact: "ops@dsp6.de", status: "Improve" },
  { id: "dsp-7", name: "DSP Firma 7", station: "Hanau", area: "Hanau / Offenbach", routes: 35, drivers: 47, contact: "ops@dsp7.de", status: "Active" },
  { id: "dsp-8", name: "DSP Firma 8", station: "Offenbach", area: "Main corridor", routes: 29, drivers: 40, contact: "ops@dsp8.de", status: "Watch" },
];

const environments = ["Urban dense", "Suburban", "Rural", "XL / Heavy bulky", "Locker / PUDO", "Multi-DSP station", "Hessen complete area"];

function clamp(value: number, min: number, max: number) { return Math.min(Math.max(value, min), max); }
function normInv(p: number) {
  if (p <= 0 || p >= 1) return p < 0.5 ? -8 : 8;
  const a1 = -39.69683028665376, a2 = 220.9460984245205, a3 = -275.9285104469687, a4 = 138.357751867269, a5 = -30.66479806614716, a6 = 2.506628277459239;
  const b1 = -54.47609879822406, b2 = 161.5858368580409, b3 = -155.6989798598866, b4 = 66.80131188771972, b5 = -13.28068155288572;
  const c1 = -0.007784894002430293, c2 = -0.3223964580411365, c3 = -2.400758277161838, c4 = -2.549732539343734, c5 = 4.374664141464968, c6 = 2.938163982698783;
  const d1 = 0.007784695709041462, d2 = 0.3224671290700398, d3 = 2.445134137142996, d4 = 3.754408661907416;
  const plow = 0.02425, phigh = 1 - plow;
  if (p < plow) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1); }
  if (phigh < p) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1); }
  const q = p - 0.5, r = q * q;
  return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
}
function sigmaFromDpmo(dpmo: number) { const yieldRate = clamp(1 - dpmo / 1_000_000, 0.000001, 0.999999); return clamp(normInv(yieldRate) + 1.5, 0, 6).toFixed(2); }
function statusFor(sigma: number) { if (sigma >= 4) return "Stable"; if (sigma >= 3) return "Control"; return "DMAIC now"; }
function timeStamp() { return new Date().toLocaleString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }

export default function Home() {
  const [kpis, setKpis] = useState(initialKpis);
  const [environment, setEnvironment] = useState(environments[0]);
  const [confidence, setConfidence] = useState(95);
  const [costPerDefect, setCostPerDefect] = useState(38);
  const [selectedAreaId, setSelectedAreaId] = useState(hessenAreas[0].id);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [graphicsVisible, setGraphicsVisible] = useState(false);
  const [modelRun, setModelRun] = useState("Not run yet");
  const [graphicRun, setGraphicRun] = useState("No graphics generated yet");
  const [dspSavedAt, setDspSavedAt] = useState("Auto-save ready");
  const [storageReady, setStorageReady] = useState(false);
  const [dspFirms, setDspFirms] = useState(initialDspFirms);

  useEffect(() => { const saved = window.localStorage.getItem("last-mile-dsp-firms"); if (saved) { try { setDspFirms(JSON.parse(saved) as DspFirm[]); } catch { setDspFirms(initialDspFirms); } } setStorageReady(true); }, []);
  useEffect(() => { if (storageReady) window.localStorage.setItem("last-mile-dsp-firms", JSON.stringify(dspFirms)); }, [dspFirms, storageReady]);

  const rows = useMemo(() => {
    const totalWeighted = kpis.reduce((sum, kpi) => sum + kpi.defects * kpi.severity, 0);
    let cumulative = 0;
    return kpis.map((kpi) => {
      const defectRate = kpi.opportunities > 0 ? (kpi.defects / kpi.opportunities) * 100 : 0;
      const dpmo = kpi.opportunities > 0 ? (kpi.defects / kpi.opportunities) * 1_000_000 : 0;
      const sigma = Number(sigmaFromDpmo(dpmo));
      const weighted = kpi.defects * kpi.severity;
      const pareto = totalWeighted > 0 ? (weighted / totalWeighted) * 100 : 0;
      return { ...kpi, defectRate, dpmo, sigma, weighted, pareto };
    }).sort((a, b) => b.weighted - a.weighted).map((row) => { cumulative += row.pareto; return { ...row, cumulative }; });
  }, [kpis]);

  const totalDefects = kpis.reduce((sum, kpi) => sum + kpi.defects, 0);
  const totalOpps = kpis.reduce((sum, kpi) => sum + kpi.opportunities, 0);
  const totalDpmo = totalOpps > 0 ? (totalDefects / totalOpps) * 1_000_000 : 0;
  const portfolioSigma = sigmaFromDpmo(totalDpmo);
  const priority = rows[0];
  const annualizedCost = totalDefects * costPerDefect * 4;
  const selectedArea = hessenAreas.find((area) => area.id === selectedAreaId) ?? hessenAreas[0];
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(selectedArea.query)}&output=embed`;
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedArea.query)}`;

  function updateKpi(id: string, field: keyof LastMileKpi, value: string) { setKpis((current) => current.map((kpi) => kpi.id !== id ? kpi : { ...kpi, [field]: ["defects", "opportunities", "target", "severity"].includes(field) ? Number(value) : value })); }
  function updateDsp(id: string, field: keyof DspFirm, value: string) { setDspFirms((current) => current.map((firm) => firm.id !== id ? firm : { ...firm, [field]: ["routes", "drivers"].includes(field) ? Number(value) : value })); }
  function runModel() { setModelRun(`Recalculated ${timeStamp()} | ${selectedArea.name} | top Pareto driver: ${priority?.name} | portfolio sigma ${portfolioSigma}`); }
  function loadMaps() { setMapsLoaded(true); setEnvironment("Hessen complete area"); setModelRun(`Google Maps area loaded ${timeStamp()} | ${selectedArea.name}`); }
  function generateGraphics() { setGraphicsVisible(true); setGraphicRun(`Graphics generated ${timeStamp()} from ${rows.length} KPI streams and ${dspFirms.length} DSP firms`); }
  function saveDspFirms() { window.localStorage.setItem("last-mile-dsp-firms", JSON.stringify(dspFirms)); setDspSavedAt(`DSP firms saved ${timeStamp()}`); }

  return <main className="min-h-screen bg-[#f6f7f3] text-[#17211f]">
    <section className="border-b border-[#d9ded4] bg-[#fbfcf8]"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-6 lg:grid-cols-[1fr_390px] lg:px-8"><div className="flex flex-col justify-between gap-8"><div><p className="text-xs font-semibold uppercase text-[#5c6d65]">Amazon-style Last Mile Six Sigma Model</p><h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">Editable Hessen last-mile cockpit for DSP performance, Google Maps areas, and Pareto graphics.</h1><p className="mt-4 max-w-3xl text-base leading-7 text-[#53625d]">Edit KPIs and DSP firms, load Hessen delivery areas from Google Maps, recalculate the Six Sigma model, and generate data graphics for delay, incomplete, damage, lost bags, and accidents.</p></div><div className="grid gap-3 sm:grid-cols-4"><div className="metric-block"><span>Portfolio sigma</span><strong>{portfolioSigma}</strong></div><div className="metric-block"><span>Total DPMO</span><strong>{Math.round(totalDpmo).toLocaleString()}</strong></div><div className="metric-block"><span>Pareto priority</span><strong>{priority?.name}</strong></div><div className="metric-block"><span>Cost exposure</span><strong>EUR {Math.round(annualizedCost / 1000).toLocaleString()}k</strong></div></div></div><aside className="status-panel"><div className="flex items-center justify-between"><h2>Working Controls</h2><span className="status-dot">Live</span></div><div className="mt-5 space-y-3"><div className="availability-row"><span>Recalculate model</span><strong>Working</strong></div><div className="availability-row"><span>Google Maps Hessen</span><strong>{mapsLoaded ? "Loaded" : "Ready"}</strong></div><div className="availability-row"><span>Generate graphics</span><strong>{graphicsVisible ? "Generated" : "Ready"}</strong></div><div className="availability-row"><span>DSP editable places</span><strong>{dspFirms.length} slots</strong></div></div></aside></div></section>
    <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[340px_1fr] lg:px-8"><aside className="control-panel"><h2>Last-Mile Scenario</h2><label>Environment<select value={environment} onChange={(event) => setEnvironment(event.target.value)}>{environments.map((item) => <option key={item}>{item}</option>)}</select></label><label>Hessen Google Maps area<select value={selectedAreaId} onChange={(event) => setSelectedAreaId(event.target.value)}>{hessenAreas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label><label>Confidence level: {confidence}%<input type="range" min="80" max="99" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} /></label><label>Cost per defect<input type="number" min="1" value={costPerDefect} onChange={(event) => setCostPerDefect(Number(event.target.value))} /></label><button type="button" onClick={runModel}>Recalculate model</button><button type="button" onClick={loadMaps}>Load Hessen Google Maps</button><button type="button" onClick={generateGraphics}>Generate graphics</button><button type="button" onClick={saveDspFirms}>Save DSP firms</button><div className="method-box"><strong>Latest result</strong><span>{modelRun}</span><span>{graphicRun}</span><span>{dspSavedAt}</span></div></aside>
    <section className="space-y-5"><section className="analysis-panel map-panel"><div className="panel-heading"><h2>Germany / Hessen Google Maps Area</h2><span>{selectedArea.name} - {selectedArea.type}</span></div>{mapsLoaded ? <div className="map-grid"><iframe title={`Google Maps ${selectedArea.name}`} src={mapUrl} loading="lazy" /><div className="area-list">{hessenAreas.map((area) => <button type="button" className={area.id === selectedAreaId ? "area-button active" : "area-button"} key={area.id} onClick={() => setSelectedAreaId(area.id)}><strong>{area.name}</strong><span>{area.type}</span></button>)}<a className="map-link" href={mapSearchUrl} target="_blank" rel="noreferrer">Open selected area in Google Maps</a></div></div> : <div className="empty-state">Press "Load Hessen Google Maps" to load the live Google Maps area panel for complete Hessen coverage and regional delivery zones.</div>}</section>
    <div className="grid gap-4 xl:grid-cols-5">{kpis.map((kpi) => { const row = rows.find((item) => item.id === kpi.id)!; return <article className="kpi-card editable" key={kpi.id}><div className="flex items-start justify-between gap-3"><div><h2>{kpi.name}</h2><p>{kpi.owner}</p></div><span className={row.sigma >= 3 ? "badge watch" : "badge risk"}>{statusFor(row.sigma)}</span></div><div className="kpi-value">{row.sigma}<span>sigma</span></div><div className="edit-grid"><label>Defects<input type="number" min="0" value={kpi.defects} onChange={(event) => updateKpi(kpi.id, "defects", event.target.value)} /></label><label>Opportunities<input type="number" min="1" value={kpi.opportunities} onChange={(event) => updateKpi(kpi.id, "opportunities", event.target.value)} /></label><label>Target %<input type="number" step="0.01" value={kpi.target} onChange={(event) => updateKpi(kpi.id, "target", event.target.value)} /></label><label>Severity<input type="number" min="1" max="5" value={kpi.severity} onChange={(event) => updateKpi(kpi.id, "severity", event.target.value)} /></label></div><div className="mini-grid"><span>Rate <strong>{row.defectRate.toFixed(2)}%</strong></span><span>DPMO <strong>{Math.round(row.dpmo).toLocaleString()}</strong></span><span>Pareto <strong>{row.pareto.toFixed(1)}%</strong></span><span>Target <strong>{kpi.target}%</strong></span></div></article>; })}</div>
    {graphicsVisible && <section className="analysis-panel graphics-panel"><div className="panel-heading"><h2>Generated Data Graphics</h2><span>{graphicRun}</span></div><div className="chart-grid"><div><h3>Pareto impact</h3>{rows.map((row) => <div className="chart-row" key={`pareto-${row.id}`}><span>{row.name}</span><div><b style={{ width: `${Math.max(row.pareto, 2)}%` }} /></div><strong>{row.pareto.toFixed(1)}%</strong></div>)}</div><div><h3>Sigma level</h3>{rows.map((row) => <div className="chart-row" key={`sigma-${row.id}`}><span>{row.name}</span><div><b className={row.sigma >= 3 ? "sigma-ok" : "sigma-risk"} style={{ width: `${Math.min((row.sigma / 6) * 100, 100)}%` }} /></div><strong>{row.sigma.toFixed(2)}</strong></div>)}</div></div></section>}
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]"><section className="analysis-panel"><div className="panel-heading"><h2>Pareto Six Sigma Priority</h2><span>Weighted by defect count and safety/customer severity</span></div><div className="pareto-list">{rows.map((row) => <div className="pareto-row" key={row.id}><div><strong>{row.name}</strong><span>{row.method}</span></div><div className="bar-wrap"><div style={{ width: `${Math.max(row.pareto, 2)}%` }} /></div><b>{row.pareto.toFixed(1)}%</b><em>{row.cumulative.toFixed(1)}% cum.</em></div>)}</div></section><section className="analysis-panel"><div className="panel-heading"><h2>DMAIC Playbook</h2><span>{environment} operating lens</span></div><ol className="playbook"><li><strong>Define:</strong> lock CTQ definitions for late, incomplete, damaged, lost bag, and accident events.</li><li><strong>Measure:</strong> use route, driver, wave, DSP, Hessen area, station, weather, and package profile as segmentation fields.</li><li><strong>Analyze:</strong> start with {priority?.name}; it carries the highest weighted Pareto impact right now.</li><li><strong>Improve:</strong> test one countermeasure per top cause before broad rollout.</li><li><strong>Control:</strong> review DPMO and sigma weekly with alerts when any KPI misses target rate.</li></ol></section></div>
    <section className="analysis-panel"><div className="panel-heading"><h2>DSP Firma Workspace</h2><span>8 editable places, saved in this browser</span></div><div className="dsp-grid"><div>DSP firma</div><div>Station</div><div>Area</div><div>Routes</div><div>Drivers</div><div>Contact</div><div>Status</div>{dspFirms.map((firm) => <div className="dsp-row" key={firm.id}><input value={firm.name} onChange={(event) => updateDsp(firm.id, "name", event.target.value)} /><input value={firm.station} onChange={(event) => updateDsp(firm.id, "station", event.target.value)} /><input value={firm.area} onChange={(event) => updateDsp(firm.id, "area", event.target.value)} /><input type="number" min="0" value={firm.routes} onChange={(event) => updateDsp(firm.id, "routes", event.target.value)} /><input type="number" min="0" value={firm.drivers} onChange={(event) => updateDsp(firm.id, "drivers", event.target.value)} /><input value={firm.contact} onChange={(event) => updateDsp(firm.id, "contact", event.target.value)} /><select value={firm.status} onChange={(event) => updateDsp(firm.id, "status", event.target.value)}><option>Active</option><option>Watch</option><option>Improve</option><option>Paused</option></select></div>)}</div></section>
    <section className="analysis-panel"><div className="panel-heading"><h2>Last-Mile Action Table</h2><span>Specific KPI decisions for the selected environment</span></div><div className="decision-table last-mile-table"><div>KPI</div><div>Signal</div><div>Six Sigma read</div><div>Action</div><div>Owner</div>{rows.map((row) => <div className="table-row" key={row.id}><strong>{row.name}</strong><span>{row.signal}</span><span>{row.sigma.toFixed(2)} sigma / {Math.round(row.dpmo).toLocaleString()} DPMO</span><span>{row.defectRate > row.target ? "Open DMAIC charter" : "Keep control plan"}</span><span>{row.owner}</span></div>)}</div></section></section></div>
  </main>;
}
