const { useState, useEffect, useRef } = React;

/* ═══════════════════════════════════════════════════════════
   DESIGN DIRECTION: "Warm Intelligence"
   Dark base with warm amber/terracotta accents — feels like
   a premium family product, not a cold productivity tool.
   Typography: Playfair Display (display) + DM Sans (body)
   Aesthetic: editorial warmth meets organised clarity
═══════════════════════════════════════════════════════════ */

const T = {
  bg:       "#080910",
  surface:  "#0f1018",
  card:     "#13151f",
  card2:    "#181b27",
  border:   "#1e2236",
  borderHi: "#2c304a",
  // Warm amber as primary (family warmth)
  warm:     "#e8a040",
  warmS:    "rgba(232,160,64,0.13)",
  warmG:    "rgba(232,160,64,0.07)",
  // Teal as secondary (tech/AI)
  teal:     "#38c4b4",
  tealS:    "rgba(56,196,180,0.13)",
  // Supporting palette
  rose:     "#e06868",
  roseS:    "rgba(224,104,104,0.13)",
  sage:     "#5bb88a",
  sageS:    "rgba(91,184,138,0.13)",
  sky:      "#4899e0",
  skyS:     "rgba(72,153,224,0.13)",
  violet:   "#9870e8",
  violetS:  "rgba(152,112,232,0.13)",
  amber:    "#d88830",
  amberS:   "rgba(216,136,48,0.13)",
  lime:     "#78b820",
  limeS:    "rgba(120,184,32,0.13)",
  pink:     "#d06090",
  pinkS:    "rgba(208,96,144,0.13)",
  // Text
  text:     "#e2e4f0",
  textS:    "#636880",
  textM:    "#303448",
};

/* ── NAV STRUCTURE ─────────────────────────────────────────── */
const NAV = [
  { id:"home",      icon:"🌐", label:"Home",        type:"public" },
  { id:"signup",    icon:"✍️", label:"Sign Up",     type:"public" },
  { id:"signin",    icon:"🔑", label:"Sign In",     type:"public" },
  null,
  { id:"today",     icon:"🌅", label:"Today",       color:T.warm   },
  { id:"lifeadmin", icon:"📋", label:"Life Admin",  color:T.teal   },
  { id:"finance",   icon:"💷", label:"Finance",     color:T.sage   },
  { id:"health",    icon:"🩺", label:"Health",      color:T.rose   },
  { id:"recipes",   icon:"🍳", label:"Recipes & Groceries", color:T.lime  },
  { id:"travel",    icon:"✈️", label:"Travel",                color:T.sky   },
  { id:"account",   icon:"👤", label:"My Account",            color:T.sky   },
  { id:"onboarding",icon:"🚀", label:"Onboarding",           color:T.violet },
];

/* ── GLOBAL CSS ────────────────────────────────────────────── */

const T_DARK = {...T};

const T_LIGHT = {
  bg:"#FBF7F0",surface:"#FFFFFF",card:"#FFFFFF",card2:"#F0E8D8",
  border:"#E0CEAD",borderHi:"#CDB890",
  warm:"#B06010",warmS:"rgba(176,96,16,0.12)",warmG:"rgba(176,96,16,0.06)",
  teal:"#1A7A70",tealS:"rgba(26,122,112,0.12)",
  rose:"#A83838",roseS:"rgba(168,56,56,0.12)",
  sage:"#286840",sageS:"rgba(40,104,64,0.12)",
  sky:"#1860A8",skyS:"rgba(24,96,168,0.12)",
  violet:"#5838A8",violetS:"rgba(88,56,168,0.12)",
  amber:"#A85000",amberS:"rgba(168,80,0,0.12)",
  lime:"#406800",limeS:"rgba(64,104,0,0.12)",
  pink:"#983060",pinkS:"rgba(152,48,96,0.12)",
  text:"#18120A",textS:"#6A5840",textM:"#C0A880",
};

/* ═══════════════════════════════════════════════════════════
   ACCESS CONTROL — shared model for the recipient picker,
   HMG management, and per-member permissions. Pulled in from
   the standalone Access Control prototype.
   ─────────────────────────────────────────────────────────── */

/* FreqLeadPair — pill-based lead time options, defaults, and max-allowed per frequency */
const KE_LEAD_OPTS  = [["1d","1 day"],["2d","2 days"],["3d","3 days"],["1w","1 week"],["2w","2 weeks"],["1mo","1 month"],["3mo","3 months"]];
const KE_LEAD_DEFAULT = {
  "Weekly":"1d","Every 2 Weeks":"2d","Monthly":"3d",
  "Quarterly":"1w","Half Yearly":"2w","9 Months":"2w",
  "Yearly":"1mo","18 Months":"1mo","2 Years":"3mo","3 Years":"3mo",
};
const KE_LEAD_MAX = {
  "Weekly":"3d","Every 2 Weeks":"1w","Monthly":"2w",
  "Quarterly":"1mo","Half Yearly":"3mo","9 Months":"3mo",
  "Yearly":"3mo","18 Months":"3mo","2 Years":"3mo","3 Years":"3mo",
};
const KE_LEAD_ORDER  = ["1d","2d","3d","1w","2w","1mo","3mo"];
const keLeadIdx      = v => KE_LEAD_ORDER.indexOf(v);
const keLeadAllowed  = (freq, val) => !freq || keLeadIdx(val) <= keLeadIdx(KE_LEAD_MAX[freq]||"3mo");

/* FreqLeadPair — default lead times (days) keyed by frequency label */
const FREQ_LEAD_DAYS = {
  "Weekly":        1,
  "Every 2 Weeks": 2,
  "Monthly":       3,
  "Quarterly":     7,
  "Half Yearly":   14,
  "9 Months":      21,
  "Yearly":        30,
  "18 Months":     42,
  "2 Years":       60,
  "3 Years":       90,
};

const MEMBERS_AC = [
  { id:"james", name:"James", role:"Owner", av:"👨", color:T.warm,   inHMG:true,  age:42, you:true },
  { id:"sarah", name:"Sarah", role:"Admin", av:"👩", color:T.rose,   inHMG:true,  age:40 },
  { id:"alex",  name:"Alex",  role:"Adult", av:"🧑", color:T.teal,   inHMG:false, age:28 },
  { id:"mia",   name:"Mia",   role:"Teen",  av:"👧", color:T.violet, inHMG:false, age:15 },
  { id:"lily",  name:"Lily",  role:"Child", av:"🧒", color:T.sky,    inHMG:false, age:9  },
  { id:"tom",   name:"Tom",   role:"Adult", av:"🧔", color:T.sage,   inHMG:false, age:19 },
];
const byIdAC = (id) => MEMBERS_AC.find(m => m.id === id);
const ROLE_FULL_AC = {
  Owner:"Owner", Admin:"Admin · Co-manager", Adult:"Adult Member",
  Teen:"Teenager · 13–17", Child:"Child · under 13",
};
const ROLE_SHORT_AC = {Owner:"Owner",Admin:"Admin",Adult:"Adult",Teen:"Teen",Child:"Child"};

const TIERS_AC = {
  self:       {key:"self",      ic:"🔒", label:"Self",       sub:"Only you can see this",        accent:T.text},
  hmg:        {key:"hmg",       ic:"🛡️", label:"HMG",        sub:"Household Managers Group",     accent:T.warm},
  family:     {key:"family",    ic:"🏠", label:"Family",     sub:"Everyone in the household",    accent:T.sage},
  individual: {key:"individual",ic:"👥", label:"Individual", sub:"Specific people you pick",     accent:T.sky},
};
const PERM_COLOR_AC = {"Manage":T.warm, "Edit":T.sage, "View":T.sky, "None":T.textS};

function availableTiersAC(role) {
  if (role === "Child") return ["hmg"];
  return ["self","hmg","family","individual"];
}
function eligibleIndividualTargetsAC(role, viewerId) {
  const hmgRoles = ["Owner","Admin"];
  if (hmgRoles.includes(role)) return MEMBERS_AC.filter(m => m.id !== viewerId);
  return MEMBERS_AC.filter(m => m.id !== viewerId && m.role !== "Child");
}

const MOD_AC = [
  ["Life Admin","tasks",   "Tasks",            "✅", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"Edit", Child:"View"}],
  ["Life Admin","notes",   "Household Info",   "📝", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"Edit", Child:"Edit"}],
  ["Life Admin","docs",    "Documents",        "📁", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"Edit", Child:"View"}],
  ["Life Admin","carhome", "Cars & Home",      "🚗", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"View", Child:"None"}],
  ["Life Admin","keydates","Key Dates",         "📅", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"View", Child:"None"}],
  ["Life Admin","petcare", "Pet Care",         "🐾", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"View", Child:"View"}],
  ["Finance","finOv",      "Overview",         "💷", false, {Owner:"Manage", Admin:"Manage", Adult:"View", Teen:"View", Child:"None"}],
  ["Finance","finEnv",     "Budget Envelopes", "💰", false, {Owner:"Manage", Admin:"Manage", Adult:"None", Teen:"None", Child:"None"}],
  ["Finance","finTx",      "Transactions",     "💳", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"Edit", Child:"None"}],
  ["Finance","finBills",   "Bills & Subs",     "📄", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"View", Child:"None"}],
  ["Finance","finAdm",     "Finance Admin",    "⚙️", true,  {Owner:"Manage", Admin:"Manage", Adult:"None", Teen:"None", Child:"None"}],
  ["Finance","finMy",      "My Finance",       "👤", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"None", Child:"None"}],
  ["Health","health",      "Health Overview",  "🩺", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"Edit", Child:"View"}],
  ["Health","meds",        "Medications",      "💊", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"Edit", Child:"View"}],
  ["Health","appts",       "Appointments",     "📅", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"Edit", Child:"View"}],
  ["Health","emergency",   "Emergency Info",   "🚨", true,  {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"View", Child:"None"}],
  ["Health","journal",     "Journal",          "📔", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"Edit", Child:"None"}],
  ["Recipes & Groceries","recLib",  "Library",         "📖", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"Edit", Child:"View"}],
  ["Recipes & Groceries","recMeal", "Meal Planner",    "🗓️", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"Edit", Child:"View"}],
  ["Recipes & Groceries","recGroc", "Grocery List",    "🛒", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"Edit", Child:"View"}],
  ["Recipes & Groceries","recNut",  "Nutrition",       "🥗", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"View", Child:"None"}],
  ["Travel","trvTrips",    "My Trips",          "✈️", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"Edit", Child:"View"}],
  ["Travel","trvPack",     "Packing Templates", "🧳", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"Edit", Child:"View"}],
  ["Travel","trvReady",    "Travel Ready",      "🛂", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"View", Child:"None"}],
].map(([area,key,label,icon,locked,perms]) => ({area,key,label,icon,locked,perms}));

function AvatarAC({m, size=22}) {
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",justifyContent:"center",
      width:size,height:size,borderRadius:"50%",
      background:`linear-gradient(135deg, ${m.color}, ${m.color}cc)`,
      color:"#fff", fontSize:size*0.55, border:`1.5px solid ${T.surface}`,
      flexShrink:0,
    }}>{m.av}</span>
  );
}

function AvatarStackAC({ids, size=22, max=3}) {
  const shown = ids.slice(0, max);
  const overflow = ids.length - shown.length;
  return (
    <span style={{display:"inline-flex",alignItems:"center"}}>
      {shown.map((id,i) => {
        const m = byIdAC(id); if (!m) return null;
        return <span key={id} style={{marginLeft: i===0 ? 0 : -6}}><AvatarAC m={m} size={size}/></span>;
      })}
      {overflow > 0 && (
        <span style={{
          marginLeft:-6, width:size, height:size, borderRadius:"50%",
          background:T.card2, color:T.textS, fontSize:size*0.42, fontWeight:700,
          display:"inline-flex",alignItems:"center",justifyContent:"center",
          border:`1.5px solid ${T.surface}`,
        }}>+{overflow}</span>
      )}
    </span>
  );
}

/* Compact two-step dropdown picker for use inside modals / forms.
   value = {tier:"self"|"hmg"|"family"|"individual", ids:string[]} */
function NoteRecipientPicker({value, onChange, viewerRole="Owner", viewerId="james", contentType}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(value.tier === "individual" ? "individuals" : "tier");
  const [draft, setDraft] = useState(value);
  useEffect(()=>{ setDraft(value); }, [value]);

  const tiers = availableTiersAC(viewerRole);
  const targets = eligibleIndividualTargetsAC(viewerRole, viewerId);
  const tier = TIERS_AC[value.tier] || TIERS_AC.family;
  const summary = value.tier === "individual"
    ? (value.ids?.length ? value.ids.map(id => byIdAC(id)?.name).filter(Boolean).join(", ") : "Pick people…")
    : tier.label;
  const sensitive = contentType === "journal" || contentType === "health";

  const close = () => { setOpen(false); setStep(value.tier === "individual" ? "individuals" : "tier"); setDraft(value); };
  const apply = () => {
    if (draft.tier === "individual" && !draft.ids?.length) return;
    onChange(draft); setOpen(false);
  };
  const setTier = (t) => {
    if (t === "individual") { setDraft({tier:"individual", ids: draft.ids?.length ? draft.ids : (value.ids||[])}); setStep("individuals"); }
    else { onChange({tier:t, ids:[]}); setOpen(false); }
  };
  const toggleId = (id) => setDraft(d => {
    const ids = d.ids?.includes(id) ? d.ids.filter(x => x !== id) : [...(d.ids||[]), id];
    return {...d, ids};
  });

  return (
    <div style={{position:"relative"}}>
      <button type="button" onClick={()=>setOpen(o=>!o)}
        style={{
          display:"flex",alignItems:"center",gap:10,width:"100%",
          padding:"10px 12px",background:T.card2,
          border:`1px solid ${open?T.warm:T.border}`,
          borderRadius:9,color:T.text,fontFamily:"inherit",fontSize:13,fontWeight:500,
          cursor:"pointer",textAlign:"left",transition:"all .15s",
        }}>
        <span style={{
          width:24,height:24,borderRadius:7,background:`${tier.accent}26`,color:tier.accent,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,
        }}>{tier.ic}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:600,color:tier.accent,fontSize:12.5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{summary}</div>
          <div style={{fontSize:10.5,color:T.textS,marginTop:1}}>
            {value.tier === "individual" && value.ids?.length
              ? `${value.ids.length} ${value.ids.length===1?"person":"people"}`
              : tier.sub + (value.tier === "self" && sensitive ? " — even Owner/Admin can't see this" : "")}
          </div>
        </div>
        {value.tier === "individual" && value.ids?.length > 0 && (
          <AvatarStackAC ids={value.ids} size={20} max={3}/>
        )}
        <span style={{fontSize:10,color:T.textS,marginLeft:2}}>▾</span>
      </button>

      {open && (
        <>
          <div style={{position:"fixed",inset:0,zIndex:202}} onClick={close}/>
          <div style={{
            position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:203,
            minWidth:232,background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:12,
            padding:6,boxShadow:"0 18px 50px rgba(0,0,0,0.45)",
          }}>
            {step === "tier" && tiers.map(k => {
              const ti = TIERS_AC[k];
              const on = value.tier === k;
              return (
                <div key={k} onClick={()=>setTier(k)}
                  style={{display:"flex",alignItems:"center",gap:11,padding:"9px 11px",borderRadius:8,cursor:"pointer",
                    background: on ? T.warmS : "transparent",
                    border:`1px solid ${on ? T.warm+"55" : "transparent"}`,
                  }}>
                  <span style={{fontSize:14,width:18,textAlign:"center",color:on?ti.accent:T.text}}>{ti.ic}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:on?600:500,color:on?ti.accent:T.text}}>{ti.label}</div>
                    <div style={{fontSize:10.5,color:T.textS,marginTop:1}}>{ti.sub}</div>
                  </div>
                  {k === "individual" && <span style={{fontSize:13,color:T.textM}}>›</span>}
                  {on && k !== "individual" && <span style={{color:ti.accent,fontSize:13}}>✓</span>}
                </div>
              );
            })}

            {step === "individuals" && (
              <>
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px 4px"}}>
                  <button type="button" onClick={()=>setStep("tier")}
                    style={{background:"none",border:0,fontSize:12,color:T.textS,cursor:"pointer",padding:0,fontFamily:"inherit"}}>‹ Back</button>
                  <span style={{fontSize:10.5,fontWeight:700,color:T.textS,letterSpacing:".05em",textTransform:"uppercase"}}>Pick people</span>
                  {draft.ids?.length > 0 && (
                    <span style={{marginLeft:"auto",fontSize:10.5,fontWeight:600,color:T.warm}}>{draft.ids.length} selected</span>
                  )}
                </div>
                <div style={{maxHeight:210,overflowY:"auto"}}>
                  {targets.map(m => {
                    const checked = draft.ids?.includes(m.id);
                    return (
                      <div key={m.id} onClick={()=>toggleId(m.id)}
                        style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:7,cursor:"pointer"}}>
                        <AvatarAC m={m} size={22}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12.5,fontWeight:500,color:T.text}}>{m.name}</div>
                          <div style={{fontSize:10.5,color:T.textS}}>
                            {ROLE_SHORT_AC[m.role]}{m.role==="Child"||m.role==="Teen"?` · ${m.age}`:""}
                          </div>
                        </div>
                        <div style={{
                          width:16,height:16,borderRadius:4,
                          border:`1.5px solid ${checked?T.warm:T.borderHi}`,
                          background:checked?T.warm:"transparent",
                          display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:700,
                        }}>{checked?"✓":""}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",justifyContent:"flex-end",gap:6,padding:"8px 6px 4px",borderTop:`1px solid ${T.border}`,marginTop:4}}>
                  <button type="button" onClick={close}
                    style={{padding:"5px 12px",background:"none",border:0,color:T.textS,fontSize:11.5,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                  <button type="button" onClick={apply} disabled={!draft.ids?.length}
                    style={{padding:"5px 12px",background:T.warm,border:0,borderRadius:7,color:"#fff",fontSize:11.5,fontWeight:600,cursor:draft.ids?.length?"pointer":"not-allowed",opacity:draft.ids?.length?1:.5,fontFamily:"inherit"}}>Apply</button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED DESIGN SYSTEM COMPONENTS
   ─────────────────────────────────────────────────────────
   Single source of truth for recurring UI patterns.
   All new screens and modules MUST use these components.
   Do not hand-roll local alternatives.

   Components:
     ScopePicker  — visibility selector (Own / HMG / Family / Person)
     ForPicker    — assignee selector  (Own / HMG / Family / Person)
     GroupHeader  — collapsible group with count + optional meta
     ItemRow      — two-column row: title+For/By/Done left, meta+badges right

   Constants:
     MODAL_STYLE  — standard modal inner-container style
     badge()      — helper to produce a consistent badge style object
═══════════════════════════════════════════════════════════ */

/* ── Shared scope configuration ─────────────────────────── */
const SCOPE_CFG = {
  own:        { icon:"🔒", label:"Own",    caption:"Visible to you only" },
  hmg:        { icon:"🛡",  label:"HMG",    caption:"Visible to household managers (Owner & Admin)" },
  family:     { icon:"👥", label:"Family", caption:"Visible to all family members" },
  individual: { icon:"👤", label:"Person", caption:"Visible to a specific member" },
};

const FOR_CFG = {
  own:        { icon:"🙋", label:"Own",                 caption:"Assigned to you" },
  hmg:        { icon:"🛡",  label:"Household Managers", caption:"Assigned to household managers" },
  family:     { icon:"👥", label:"Family",              caption:"Shared across all family members" },
  all:        { icon:"🌐", label:"All",                 caption:"Everything across all scopes" },
  individual: { icon:"👤", label:"Person",              caption:"Assigned to a specific member" },
};

/* ── ScopePicker — standard visibility picker ────────────
   Props:
     value          "own" | "hmg" | "family" | "individual"
     onChange       setter
     options        subset of the four keys above (default: all four)
     showCaption    show the description line below (default: true)
     memberId       when value==="individual", the selected member id
     onMemberChange setter for memberId
*/
function ScopePicker({ value, onChange, options=["own","hmg","family","individual"], showCaption=true, memberId, onMemberChange }) {
  return (
    <div>
      <div style={{display:"flex", background:T.surface, borderRadius:8, padding:3, gap:2}}>
        {options.map(v => {
          const o = SCOPE_CFG[v];
          return (
            <button key={v} onClick={()=>onChange(v)}
              style={{flex:1, fontSize:12, fontWeight:500, padding:"7px 4px", borderRadius:6, border:"none",
                cursor:"pointer", textAlign:"center",
                background: value===v ? T.card : "transparent",
                color:      value===v ? T.text  : T.textS}}>
              {o.icon} {o.label}
            </button>
          );
        })}
      </div>
      {showCaption && (
        <div style={{fontSize:11, color:T.textS, marginTop:5, display:"flex", alignItems:"center", gap:8}}>
          <span>{SCOPE_CFG[value]?.caption}</span>
          {value==="individual" && onMemberChange && (
            <select value={memberId||""} onChange={e=>onMemberChange(e.target.value)}
              style={{fontSize:11, background:T.card, color:T.text, border:`1px solid ${T.border}`,
                borderRadius:5, padding:"2px 6px"}}>
              <option value="">Select member…</option>
              {MEMBERS_AC.filter(m=>!m.you).map(m=>(
                <option key={m.id} value={m.id}>{m.av} {m.name}</option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}

/* ── ForPicker — standard assignee picker ────────────────
   Same visual as ScopePicker; different icons, labels, captions.
   Props identical to ScopePicker.
   When value==="individual" and onMemberChange is provided,
   a member dropdown appears in the caption row.
*/
function ForPicker({ value, onChange, options=["own","hmg","family","individual"], showCaption=true, memberId, onMemberChange, inline=false }) {
  if (inline) {
    return (
      <div style={{display:"flex", alignItems:"center", flexWrap:"wrap", gap:8, marginBottom:12}}>
        <span style={{fontSize:12, fontWeight:700, color:T.text, flexShrink:0, whiteSpace:"nowrap"}}>Show for</span>
        <div style={{display:"flex", flex:"1 1 auto", minWidth:0, background:T.surface, borderRadius:8, padding:3, gap:0}}>
          {options.map((v, i) => {
            const isActive = value === v;
            const prevActive = i > 0 && value === options[i-1];
            const showDivider = i > 0 && !isActive && !prevActive;
            const o = FOR_CFG[v];
            return (
              <React.Fragment key={v}>
                {showDivider && <div style={{width:1, background:T.border, flexShrink:0, margin:"4px 0"}}/>}
                <button onClick={()=>onChange(v)}
                  style={{flex:1, minWidth:0, fontSize:12, fontWeight:isActive?600:400,
                    padding:"6px 4px", borderRadius:6, border:"none",
                    cursor:"pointer", textAlign:"center", transition:"all .15s",
                    background: isActive ? T.teal : "transparent",
                    color:      isActive ? "#fff" : T.textS}}>
                  {o.icon} {o.label}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        {value==="individual" && onMemberChange && (
          <select value={memberId||""} onChange={e=>onMemberChange(e.target.value)}
            style={{fontSize:11, background:T.card, color:T.text, border:`1px solid ${T.border}`,
              borderRadius:5, padding:"2px 6px"}}>
            <option value="">Select member…</option>
            {MEMBERS_AC.map(m=>(
              <option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (me)":""}</option>
            ))}
          </select>
        )}
      </div>
    );
  }
  return (
    <div>
      <div style={{display:"flex", background:T.surface, borderRadius:8, padding:3, gap:2}}>
        {options.map(v => {
          const o = FOR_CFG[v];
          return (
            <button key={v} onClick={()=>onChange(v)}
              style={{flex:1, fontSize:12, fontWeight:500, padding:"7px 4px", borderRadius:6, border:"none",
                cursor:"pointer", textAlign:"center",
                background: value===v ? T.card : "transparent",
                color:      value===v ? T.text  : T.textS}}>
              {o.icon} {o.label}
            </button>
          );
        })}
      </div>
      {showCaption && (
        <div style={{fontSize:11, color:T.textS, marginTop:5, display:"flex", alignItems:"center", gap:8}}>
          <span>{FOR_CFG[value]?.caption}</span>
          {value==="individual" && onMemberChange && (
            <select value={memberId||""} onChange={e=>onMemberChange(e.target.value)}
              style={{fontSize:11, background:T.card, color:T.text, border:`1px solid ${T.border}`,
                borderRadius:5, padding:"2px 6px"}}>
              <option value="">Select member…</option>
              {MEMBERS_AC.map(m=>(
                <option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (me)":""}</option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}

/* ── GroupHeader — standard collapsible group ────────────
   Matches Health → Appointments GHdr + SectionBody pattern exactly.
   All groups default closed (open prop undefined/false → closed).

   Visual spec:
     Header:  accent-tinted background (accent+"18") or T.card2 when no accent
              1px solid border (accent+"44" or T.border)
              borderRadius "8px 8px 0 0" when open, "8px" when closed
              marginBottom 0 when open (joins body), 4 when closed
              Label: 11px, fontWeight 700, UPPERCASE, letterSpacing .07em
              Count badge: T.card background, borderRadius 10
              Toggle: ▼ (open) / ▶ (closed)
     Body:    className="card", borderRadius "0 0 8px 8px", borderTop none
              padding 0, matching border colour, overflow hidden, marginBottom 4

   Props:
     id        unique key string
     label     display text — rendered UPPERCASE by CSS
     count     number of items
     meta      optional right-side string (date range, month, etc.)
     accent    colour token — tints header bg and border. Canonical uses:
                 T.rose   Overdue
                 T.warm   Today
                 T.teal   This week
                 T.sage   This month
                 T.violet Next month / Schedules
                 T.amber  Needs action (e.g. Needs booking)
     open      controlled boolean
     onToggle  () => void
     children  body content
*/
function GroupHeader({ id, label, count, meta, accent, open, onToggle, children }) {
  return (
    <>
      <div onClick={onToggle}
        style={{display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"8px 12px", cursor:"pointer",
          borderRadius: open ? "8px 8px 0 0" : "8px",
          background: accent ? accent+"30" : T.card2,
          border: `1px solid ${accent ? accent+"88" : T.border}`,
          marginBottom: open ? 0 : 10}}>
        <div style={{fontSize:11, fontWeight:700, textTransform:"uppercase",
          letterSpacing:".07em", color: accent || T.textS,
          display:"flex", alignItems:"center", gap:8}}>
          {label}
          <span style={{background:T.card, borderRadius:10, padding:"1px 7px",
            fontSize:10, fontWeight:600, color: accent || T.textS}}>{count}</span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          {meta && <span style={{fontSize:10, color: accent || T.textM}}>{meta}</span>}
          <span style={{fontSize:10, color: accent || T.textM}}>{open ? "▼" : "▶"}</span>
        </div>
      </div>
      {open && (
        <div className="card" style={{borderRadius:"0 0 8px 8px", borderTop:"none", padding:0,
          borderColor: accent ? accent+"88" : T.border,
          overflow:"hidden", marginBottom:10}}>
          {children}
        </div>
      )}
    </>
  );
}

/* ── ItemRow — standard two-column item row ──────────────
   Layout:
     LEFT  (flex:1, minWidth:0)
       Line 1 — title (ellipsis on overflow)
       Line 2 — labelled secondary fields: For · By · Done by + time
     RIGHT (flexShrink:0, always visible)
       meta text | badge chips — separated by 1px vertical dividers
     FAR RIGHT — actions slot (btn-sm buttons)

   Rows divided by 1px bottom border (T.border).

   Props:
     left       optional left slot — checkbox, dot, avatar (max 20px wide)
     title      primary label (required)
     forName    "For" value — assignee name or role
     byName     "By" value — creator name
     doneBy     "Done" value — member who completed the item
     doneAt     timestamp string shown after doneBy (e.g. "Today 14:32")
     meta       right-column text — date, amount, or any short string
     badges     array of {label, bg, fg} — right-column status/category chips
     actions    far-right slot — buttons (use btn-sm)
     onClick    row click handler
     highlight  bool — warm-tinted background (e.g. for "today" items)
     dimmed     bool — reduced opacity (e.g. for completed items)
*/
function ItemRow({ left, title, forName, byName, doneBy, doneAt, meta, badges=[], actions, onClick, highlight, dimmed }) {
  /* Label style for secondary-line prefixes */
  const lbl = {fontSize:10, color:T.textM, textTransform:"uppercase",
    letterSpacing:".04em", marginRight:2, flexShrink:0};
  /* 1px vertical divider for the right column */
  const vSep = <div style={{width:1, height:12, background:T.border, flexShrink:0}}/>;
  const hasLine2 = forName || byName || doneBy;

  /* Build right-column items: [meta string, ...badge objects] */
  const rightItems = [
    ...(meta ? [{type:"text", value:meta}] : []),
    ...badges.map(b => ({type:"badge", ...b})),
  ];

  return (
    <div onClick={onClick}
      style={{display:"flex", alignItems:"center", gap:10,
        padding:"8px 12px",
        borderBottom:`1px solid ${T.border}`,
        background: highlight ? T.warmG : "transparent",
        opacity: dimmed ? 0.5 : 1,
        cursor: onClick ? "pointer" : "default"}}>
      {/* Left slot — checkbox, dot, avatar */}
      {left && (
        <div style={{flexShrink:0, width:20, display:"flex", alignItems:"center",
          justifyContent:"center", alignSelf:"flex-start", paddingTop:2}}>
          {left}
        </div>
      )}
      {/* LEFT column — title + secondary fields */}
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:13, fontWeight:500, color:T.text,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
          {title}
        </div>
        {hasLine2 && (
          <div style={{display:"flex", alignItems:"center", gap:6, marginTop:2, flexWrap:"wrap"}}>
            {forName && (
              <span style={{fontSize:11, color:T.textS, whiteSpace:"nowrap"}}>
                <span style={lbl}>For</span>{forName}
              </span>
            )}
            {byName && (
              <span style={{fontSize:11, color:T.textS, whiteSpace:"nowrap"}}>
                <span style={lbl}>By</span>{byName}
              </span>
            )}
            {doneBy && (
              <span style={{fontSize:11, color:T.teal, whiteSpace:"nowrap"}}>
                <span style={{...lbl, color:T.teal}}>Done</span>{doneBy}
                {doneAt && <span style={{color:T.textM, marginLeft:4}}>{doneAt}</span>}
              </span>
            )}
          </div>
        )}
      </div>
      {/* RIGHT column — meta + badges, always visible, separated by dividers */}
      {rightItems.length > 0 && (
        <div style={{display:"flex", alignItems:"center", gap:6, flexShrink:0}}>
          {rightItems.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && vSep}
              {item.type === "text"
                ? <span style={{fontSize:11, color:T.textS, whiteSpace:"nowrap"}}>{item.value}</span>
                : <span style={{fontSize:10, fontWeight:600, padding:"2px 7px",
                    borderRadius:8, background:item.bg, color:item.fg,
                    whiteSpace:"nowrap"}}>{item.label}</span>
              }
            </React.Fragment>
          ))}
        </div>
      )}
      {/* Actions slot */}
      {actions && <div style={{display:"flex", gap:6, flexShrink:0}}>{actions}</div>}
    </div>
  );
}

/* ── MODAL_STYLE — standard modal inner container ────────
   Usage:  <div style={MODAL_STYLE}>…</div>
   Wrap in the standard backdrop (see CLAUDE.md).
*/
const MODAL_STYLE = {
  background:   T.card,
  border:       `1px solid ${T.borderHi}`,
  borderRadius: 14,
  padding:      24,
  boxShadow:    "0 32px 80px rgba(0,0,0,0.55)",
  width:        "100%",
  maxWidth:     420,
};

/* ── badge() — standard badge style helper ───────────────
   Returns an inline style object for a consistent chip/pill badge.
   Usage: <span style={badge(T.sageS, T.sage)}>Active</span>
*/
/* ── useWindowWidth — responsive breakpoint hook ─────────
   Usage: const isMobile = useWindowWidth() < 768;
   Call once at the top of a component; re-renders on resize.
*/
function useWindowWidth() {
  const getW = () => document.documentElement.clientWidth || window.innerWidth;
  const [w, setW] = React.useState(getW);
  React.useEffect(() => {
    const h = () => setW(getW());
    window.addEventListener("resize", h);
    window.addEventListener("orientationchange", h);
    return () => {
      window.removeEventListener("resize", h);
      window.removeEventListener("orientationchange", h);
    };
  }, []);
  return w;
}

function badge(bg, fg) {
  return { fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:8,
    background:bg, color:fg, whiteSpace:"nowrap" };
}

// Date conversion utilities — app stores DD-Mon-YYYY, <input type="date"> needs YYYY-MM-DD
const _MON_TO_NUM = {Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12"};
const _NUM_TO_MON = Object.fromEntries(Object.entries(_MON_TO_NUM).map(([k,v])=>[v,k]));
function toDateInput(s) {
  // "15-Mar-2018" → "2018-03-15"; gracefully handles N/A, year-only, empty, null
  if (!s || s === "N/A" || /^\d{4}$/.test(s)) return "";
  const m = s.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
  if (!m) return "";
  const mo = _MON_TO_NUM[m[2].charAt(0).toUpperCase() + m[2].slice(1).toLowerCase()];
  return mo ? `${m[3]}-${mo}-${m[1]}` : "";
}
function fromDateInput(s) {
  // "2018-03-15" → "15-Mar-2018"; empty → ""
  if (!s) return "";
  const [y, mo, d] = s.split("-");
  return `${d}-${_NUM_TO_MON[mo] || mo}-${y}`;
}

/* ── Access tab — per-member permissions ─── */
function AccessTabContent() {
  const [targetId, setTargetId] = useState(MEMBERS_AC.find(m => m.you)?.id ?? "james");
  const [overrides, setOverrides] = useState({
    "lily__journal": "None",   // example: removed Lily's journal view
  });
  const [savedOverrides, setSavedOverrides] = useState({
    "lily__journal": "None",   // mirrors initial overrides
  });
  const [saveMsg, setSaveMsg] = useState(false);
  const [openGroups, setOpenGroups] = useState({}); // all collapsed by default
  const [helpOpen, setHelpOpen] = useState(false);
  const toggleGroup = (g) => setOpenGroups(p => ({...p, [g]: !p[g]}));

  const target = byIdAC(targetId);

  const ovKey = (id, key) => `${id}__${key}`;
  const getLevel = (id, mod) => overrides[ovKey(id, mod.key)] || mod.perms[byIdAC(id).role] || "None";
  const isCustom = (id, mod) => {
    const v = savedOverrides[ovKey(id, mod.key)];
    return v && v !== mod.perms[byIdAC(id).role];
  };
  const setLevel = (id, mod, lvl) => setOverrides(prev => {
    const next = {...prev};
    const def = mod.perms[byIdAC(id).role];
    if (lvl === def) delete next[ovKey(id, mod.key)]; else next[ovKey(id, mod.key)] = lvl;
    return next;
  });
  const resetMod = (id, mod) => setOverrides(prev => {
    const next = {...prev}; delete next[ovKey(id, mod.key)]; return next;
  });

  const everyoneIsManage = target.role === "Owner" || target.role === "Admin";
  const groups = ["Life Admin","Finance","Health","Recipes & Groceries","Travel"];
  const filterGroup = (g) => {
    if (g === "Finance" && target.role === "Child") return [];
    return MOD_AC.filter(x => x.area === g);
  };

  const sectionCard = {marginBottom:14};
  const sectionTitle = {fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:T.textS,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"};

  return (
    <div>
      {/* Per-member permissions */}
      <div className="card" style={sectionCard}>
        <div style={sectionTitle}>
          <span>Permissions</span>
          <button onClick={()=>setHelpOpen(o=>!o)}
            style={{textTransform:"none",letterSpacing:0,fontSize:11,fontWeight:500,
              color:helpOpen?T.warm:T.textS,background:"none",border:0,cursor:"pointer",
              fontFamily:"inherit",padding:0}}>
            {helpOpen ? "Hide levels" : "What do these mean?"}
          </button>
        </div>

        {helpOpen && (
          <div style={{
            padding:"12px 14px",marginBottom:14,borderRadius:10,
            background:T.warmG,border:`1px solid ${T.border}`,
          }}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:T.warm,marginBottom:8}}>Permission levels</div>
            {[
              ["Manage", T.warm,  "Full control — add, edit, delete, configure. Granted only to Owner and Admin by role; not assignable per-module here. Promote someone to Admin to give them Manage."],
              ["Edit",   T.sage,  "Add and edit items, mark them done, change recipient. Cannot delete the module, change its settings, or override others' permissions."],
              ["View",   T.sky,   "Read-only. Sees the data but can't add, edit, or delete."],
              ["None",   T.textS, "Module is hidden from the member entirely."],
            ].map(([lvl, c, desc]) => (
              <div key={lvl} style={{display:"flex",gap:10,padding:"6px 0",fontSize:12,lineHeight:1.55,color:T.text}}>
                <span style={{
                  flexShrink:0,minWidth:62,padding:"2px 8px",borderRadius:7,
                  background:`${c}1A`,color:c,fontSize:11,fontWeight:700,textAlign:"center",height:"fit-content"
                }}>{lvl}</span>
                <span style={{flex:1}}>{desc}</span>
              </div>
            ))}
            <div style={{fontSize:10.5,color:T.textS,marginTop:6,lineHeight:1.5,paddingTop:8,borderTop:`1px solid ${T.border}`}}>
              The dropdowns below only let you change between <b>None</b>, <b>View</b>, and <b>Edit</b>. <b>Manage</b> is set by role.
            </div>
          </div>
        )}

        {/* Member chips */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>
          {MEMBERS_AC.map(m => {
            const on = targetId === m.id;
            return (
              <button key={m.id} onClick={()=>setTargetId(m.id)}
                style={{
                  display:"flex",alignItems:"center",gap:7,padding:"5px 11px 5px 5px",borderRadius:18,
                  border:`1.5px solid ${on ? T.warm : T.border}`,
                  background:on ? T.warmS : T.surface,
                  color:on ? T.warm : T.text,
                  fontFamily:"inherit",fontSize:12.5,fontWeight:600,cursor:"pointer",
                }}>
                <AvatarAC m={m} size={22}/>
                {m.name} <span style={{color:T.textS,fontWeight:500,marginLeft:2}}>· {ROLE_SHORT_AC[m.role]}</span>
              </button>
            );
          })}
        </div>

        {/* Manage banner for Owner/Admin self */}
        {everyoneIsManage && (
          <div style={{padding:"11px 14px",marginBottom:14,borderRadius:10,background:T.warmS,border:`1px solid ${T.warm}33`,fontSize:12.5,color:T.text,lineHeight:1.6}}>
            <b style={{color:T.warm}}>{target.name} is {target.role === "Owner" ? "the Owner" : "an Admin"}.</b> Every module is <b>Manage</b> by definition — this view is read-only. Use the role-change action to adjust.
          </div>
        )}

        {/* Groups */}
        {groups.map(g => {
          const mods = filterGroup(g);
          if (mods.length === 0) return null;
          const isOpen = !!openGroups[g];
          const customCount = everyoneIsManage ? 0 : mods.filter(m => isCustom(targetId, m)).length;
          return (
            <div key={g} style={{marginBottom:8,border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden"}}>
              <button type="button" onClick={()=>toggleGroup(g)}
                style={{
                  width:"100%",display:"flex",alignItems:"center",gap:10,
                  padding:"10px 14px",background:T.card,border:0,cursor:"pointer",
                  fontFamily:"inherit",textAlign:"left",
                }}>
                <span style={{
                  display:"inline-block",width:10,fontSize:10,color:T.textS,
                  transform:`rotate(${isOpen?90:0}deg)`,transition:"transform .15s",
                }}>▶</span>
                <span style={{fontSize:12.5,fontWeight:700,color:T.text,letterSpacing:".02em",flex:1}}>{g}</span>
                <span style={{fontSize:10.5,color:T.textM,fontWeight:500}}>{mods.length} module{mods.length>1?"s":""}</span>
                {customCount > 0 && (
                  <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:8,background:T.warmS,color:T.warm}}>
                    {customCount} custom
                  </span>
                )}
              </button>

              {isOpen && (
                <div style={{borderTop:`1px solid ${T.border}`,background:T.card}}>
                  {mods.map((mod, i) => {
                    const level = everyoneIsManage ? "Manage" : getLevel(targetId, mod);
                    const custom = !everyoneIsManage && isCustom(targetId, mod);
                    const locked = mod.locked || everyoneIsManage;
                    return (
                      <div key={mod.key}
                        title={
                          everyoneIsManage ? "Full management — locked by role" :
                          mod.locked      ? "Locked by role" :
                          "Default for " + ROLE_SHORT_AC[target.role] + ": " + (mod.perms[target.role] || "None")
                        }
                        style={{
                          display:"flex",alignItems:"center",gap:10,
                          padding:"8px 14px",
                          borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                          minHeight:42,
                        }}>
                        <span style={{fontSize:15,width:22,textAlign:"center",flexShrink:0,opacity:mod.locked?.55:1}}>{mod.icon}</span>
                        <span style={{fontSize:13,fontWeight:500,color:T.text,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {mod.label}
                          {mod.locked && <span style={{marginLeft:6,fontSize:10.5,color:T.textM}}>🔒</span>}
                        </span>

                        {custom && (
                          <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:9.5,fontWeight:700,padding:"2px 7px",borderRadius:7,background:T.warmS,color:T.warm,flexShrink:0}}>
                            <span style={{width:5,height:5,borderRadius:"50%",background:T.warm}}/>Custom
                          </span>
                        )}
                        {custom && !locked && (
                          <button onClick={()=>resetMod(targetId, mod)}
                            style={{fontSize:11,color:T.textS,background:"none",border:0,cursor:"pointer",fontFamily:"inherit",padding:"2px 6px",flexShrink:0}}>Reset</button>
                        )}

                        {locked ? (
                          <span style={{
                            padding:"4px 10px",borderRadius:7,fontSize:11.5,fontWeight:700,
                            background:T.card2,color:PERM_COLOR_AC[level]||T.textS,minWidth:74,textAlign:"center",flexShrink:0,
                          }}>{level}</span>
                        ) : (
                          <select value={level} onChange={e=>setLevel(targetId, mod, e.target.value)}
                            style={{
                              padding:"5px 22px 5px 10px",borderRadius:7,border:`1px solid ${T.border}`,
                              background:T.card,color:PERM_COLOR_AC[level]||T.text,fontSize:12,fontWeight:700,
                              fontFamily:"inherit",cursor:"pointer",
                              appearance:"none",WebkitAppearance:"none",
                              backgroundImage:`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%23${T.textS.slice(1)}' d='M0 0h10L5 6z'/></svg>")`,
                              backgroundRepeat:"no-repeat",backgroundPosition:"right 8px center",
                              minWidth:90,flexShrink:0,
                            }}>
                            {["None","View","Edit"].map(lv => <option key={lv} value={lv}>{lv}</option>)}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {target.role === "Child" && (
          <div style={{padding:"11px 14px",borderRadius:10,background:T.skyS,border:`1px solid ${T.sky}33`,fontSize:12.5,color:T.text,lineHeight:1.6}}>
            <b style={{color:T.sky}}>Finance is hidden for Children.</b> It cannot be enabled from this screen.
          </div>
        )}

        {/* Save / Discard bar — permanent */}
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8,
          marginTop:14,paddingTop:12,borderTop:`1px solid ${T.border}`,
        }}>
          {saveMsg && (
            <span style={{fontSize:12,color:T.sage,fontWeight:600,marginRight:"auto"}}>✓ Permissions saved</span>
          )}
          <button className="btn-sm" onClick={()=>{setOverrides({...savedOverrides}); setSaveMsg(false);}}>Discard</button>
          <button className="btn-sm btn-warm" onClick={()=>{
            setSavedOverrides({...overrides});
            setSaveMsg(true);
            setTimeout(()=>setSaveMsg(false), 2000);
          }}>Save changes</button>
        </div>
      </div>

    </div>
  );
}


const makeCSS = (TH) => {
const T = TH;
return `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,400;1,700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:${T.bg};color:${T.text};font-family:'DM Sans',sans-serif;min-height:100vh;overflow:hidden}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}

/* SHELL */
.shell{display:flex;height:100vh;overflow:hidden}

/* SIDEBAR */
.sb{width:200px;min-width:200px;background:${T.surface};border-right:1px solid ${T.border};display:flex;flex-direction:column;overflow-y:auto;padding-bottom:16px}
.sb-logo{padding:18px 16px 14px;border-bottom:1px solid ${T.border};display:flex;align-items:center;gap:10px;margin-bottom:4px}
.sb-mark{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,${T.warm},${T.rose});display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;box-shadow:0 4px 14px rgba(232,160,64,0.3)}
.sb-name{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:${T.warm}}
.sb-tag{font-size:9px;color:${T.textS};margin-top:1px}
.sb-lbl{font-size:9px;font-weight:700;letter-spacing:.12em;color:${T.textM};text-transform:uppercase;padding:10px 16px 4px}
.si{display:flex;align-items:center;gap:8px;padding:7px 16px;cursor:pointer;font-size:13px;color:${T.textS};border-left:3px solid transparent;transition:all .15s}
.si:hover{background:${T.warmG};color:${T.text}}
.si.on{background:${T.warmS};color:${T.warm};border-left-color:${T.warm}}
.si-ic{width:16px;text-align:center;font-size:13px}
.sdiv{height:1px;background:${T.border};margin:6px 16px}

/* MAIN */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{height:54px;background:${T.surface};border-bottom:1px solid ${T.border};display:flex;align-items:center;padding:0 22px;gap:12px;flex-shrink:0}
.tb-title{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;flex:1;color:${T.warm}}
.tb-chip{display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:18px;cursor:pointer;font-size:12px;border:1px solid ${T.border};background:${T.bg};transition:all .15s;white-space:nowrap}
.tb-chip:hover,.tb-chip.on{border-color:${T.warm};background:${T.warmS};color:${T.warm}}
.content{flex:1;overflow-y:auto;padding:22px}

/* CARDS */
.card{background:${T.card};border:1px solid ${T.border};border-radius:13px;padding:16px}
.card2{background:${T.card2};border:1px solid ${T.border};border-radius:11px;padding:13px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.g-auto{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}

/* TYPOGRAPHY */
.display{font-family:'Playfair Display',serif;font-weight:900}
.serif{font-family:'Playfair Display',serif}
.section-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;margin-bottom:4px}
.section-sub{font-size:13px;color:${T.textS};margin-bottom:20px;line-height:1.6}
.card-title{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:${T.textS};margin-bottom:12px;display:flex;align-items:center}

/* BUTTONS */
.btn-primary{padding:12px 20px;border-radius:11px;background:linear-gradient(135deg,${T.warm},${T.rose});color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;border:none;cursor:pointer;transition:all .2s;box-shadow:0 4px 18px rgba(232,160,64,0.28);width:100%}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 22px rgba(232,160,64,0.4)}
.btn-secondary{padding:11px 20px;border-radius:11px;background:transparent;border:1px solid ${T.border};color:${T.text};font-family:'DM Sans',sans-serif;font-size:14px;cursor:pointer;transition:all .2s;width:100%;margin-top:8px}
.btn-secondary:hover{border-color:${T.borderHi};background:${T.card2}}
.btn-sm{padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid ${T.border};background:${T.card2};color:${T.text};transition:all .15s}
.btn-sm:hover{border-color:${T.warm};color:${T.warm}}
.btn-warm{border-color:${T.warm};color:${T.warm};background:${T.warmS}}
.btn-warm:hover{background:${T.warm};color:#fff}

/* FORM ELEMENTS */
.field{margin-bottom:14px}
.field-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:${T.textS};margin-bottom:6px}
.field-input{width:100%;background:${T.card2};border:1px solid ${T.border};border-radius:10px;color:${T.text};font-family:'DM Sans',sans-serif;font-size:14px;padding:11px 14px;outline:none;transition:all .2s}
.field-input:focus{border-color:${T.warm};box-shadow:0 0 0 3px ${T.warmG}}
.or-div{display:flex;align-items:center;gap:12px;color:${T.textM};font-size:12px;margin:16px 0}
.or-div::before,.or-div::after{content:'';flex:1;height:1px;background:${T.border}}

/* ROWS */
.row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid ${T.border}}
.row:last-child{border:none}
.row:hover{background:${T.card2};margin:0 -16px;padding-left:16px;padding-right:16px;border-radius:6px}
.row-icon{font-size:16px;width:26px;text-align:center}
.row-text{flex:1;font-size:13px}
.row-sub{font-size:11px;color:${T.textS}}
.row-tag{font-size:10.5px;padding:2px 8px;border-radius:8px;font-weight:500}
.row-check{width:18px;height:18px;border-radius:50%;border:2px solid ${T.border};display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;cursor:pointer;transition:all .15s}
.row-check.done{background:${T.sage};border-color:${T.sage}}

/* STATUS BADGES */
.badge{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:600;padding:2px 8px;border-radius:8px}
.dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

/* PROGRESS */
.pbar{height:4px;border-radius:2px;background:${T.border};overflow:hidden;margin-top:6px}
.pfill{height:100%;border-radius:2px;transition:width .5s ease}

/* NAV TABS (sub-navigation) */
.nav-tabs{display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap}
.nav-tab{padding:6px 14px;border-radius:8px;font-size:12.5px;cursor:pointer;border:1px solid ${T.border};color:${T.textS};background:${T.card};transition:all .15s}
.nav-tab:hover{border-color:${T.borderHi};color:${T.text}}
.nav-tab.on{background:${T.warmS};border-color:${T.warm};color:${T.warm}}

/* AI BANNER */
.ai-banner{padding:14px 16px;border-radius:12px;background:linear-gradient(135deg,${T.tealS},${T.violetS});border:1px solid ${T.teal}33;display:flex;align-items:flex-start;gap:13px;margin-bottom:14px}
.ai-icon{font-size:22px;flex-shrink:0}
.ai-text{font-size:13px;color:${T.text};line-height:1.65;flex:1}
.ai-name{font-family:'Playfair Display',serif;font-size:11px;font-weight:700;color:${T.teal};text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px}

/* SOCIAL BUTTONS */
.social-btn{display:flex;align-items:center;gap:12px;width:100%;padding:12px 16px;border-radius:11px;border:1px solid ${T.border};background:${T.card2};color:${T.text};font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:500;cursor:pointer;transition:all .2s;margin-bottom:9px}
.social-btn:hover{border-color:${T.borderHi};background:${T.card};transform:translateX(2px)}

/* HOME PAGE */
.hero-bg{background:radial-gradient(ellipse 80% 60% at 50% -20%,rgba(232,160,64,0.12),transparent 70%),${T.bg};padding:60px 40px 40px;text-align:center;position:relative;overflow:hidden}
.hero-title{font-family:'Playfair Display',serif;font-size:46px;font-weight:900;line-height:1.15;margin-bottom:16px;background:linear-gradient(135deg,${T.text},${T.warm});-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-sub{font-size:16px;color:${T.textS};max-width:480px;margin:0 auto 32px;line-height:1.7}
.hero-cta{display:inline-block;padding:14px 32px;border-radius:12px;background:linear-gradient(135deg,${T.warm},${T.rose});color:#fff;font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 6px 24px rgba(232,160,64,0.35);border:none;font-family:'DM Sans',sans-serif;transition:all .2s}
.hero-cta:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(232,160,64,0.45)}
.feature-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;border:1px solid ${T.border};background:${T.card};font-size:12px;color:${T.textS};margin:4px}
.stat-num{font-family:'Playfair Display',serif;font-size:32px;font-weight:900;color:${T.warm}}
.stat-lbl{font-size:12px;color:${T.textS}}

/* ONBOARDING */
.step-bar{display:flex;align-items:center;gap:0;margin-bottom:28px}
.step-dot{width:28px;height:28px;border-radius:50%;border:2px solid ${T.border};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${T.textS};background:${T.card2};flex-shrink:0;transition:all .3s;position:relative}
.step-dot.done{background:${T.warm};border-color:${T.warm};color:#fff}
.step-dot.active{border-color:${T.warm};color:${T.warm}}
.step-line{flex:1;height:2px;background:${T.border};transition:background .3s}
.step-line.done{background:${T.warm}}
.step-lbl{position:absolute;top:33px;left:50%;transform:translateX(-50%);font-size:9px;color:${T.textS};white-space:nowrap;font-weight:500}

/* INTEREST TAGS */
.int-tag{padding:6px 14px;border-radius:20px;border:1.5px solid ${T.border};font-size:13px;cursor:pointer;transition:all .18s;background:${T.card2};color:${T.textS}}
.int-tag:hover{border-color:${T.warm}44;color:${T.text}}
.int-tag.on{border-color:${T.warm};background:${T.warmS};color:${T.warm}}

/* MEMBER CHIPS */
.mem-chip{display:flex;align-items:center;gap:6px;padding:4px 11px;border-radius:18px;cursor:pointer;font-size:12px;border:1px solid ${T.border};background:${T.bg};transition:all .15s;white-space:nowrap}
.mem-chip:hover,.mem-chip.on{border-color:${T.warm};background:${T.warmS};color:${T.warm}}

/* HEALTH STATS */
.h-stat{padding:12px;border-radius:10px;border:1px solid ${T.border};background:${T.card2}}
.h-val{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;margin-bottom:2px}
.h-lbl{font-size:10.5px;color:${T.textM};margin-bottom:5px}
.h-goal{font-size:11px;color:${T.textS};margin-bottom:5px}

/* JOURNAL MOOD */
.mood-btn{width:44px;height:44px;border-radius:50%;border:2px solid ${T.border};background:${T.card2};font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.mood-btn.on{border-color:${T.warm};background:${T.warmS};transform:scale(1.12)}

/* TRAVEL CARD */
.trip-card{background:${T.card2};border:1px solid ${T.border};border-radius:12px;overflow:hidden}
.trip-header{padding:14px 16px;display:flex;align-items:center;gap:11px}
.trip-status{font-size:10px;font-weight:700;padding:2px 8px;border-radius:8px}

/* EMERGENCY BUTTON */
.emergency-btn{display:flex;align-items:center;gap:10px;padding:14px 16px;border-radius:12px;background:linear-gradient(135deg,rgba(224,104,104,0.15),rgba(232,160,64,0.1));border:1px solid ${T.rose}44;cursor:pointer;transition:all .2s;margin-bottom:16px}
.emergency-btn:hover{background:rgba(224,104,104,0.2);border-color:${T.rose}77}

/* NOTES */
.note-item{padding:10px 14px;border-radius:9px;background:${T.card2};border:1px solid ${T.border};margin-bottom:8px;cursor:pointer;transition:all .15s}
.note-item:hover{border-color:${T.borderHi}}
.note-cat{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px}
.note-text{font-size:13px;color:${T.text}}
.note-sub{font-size:11px;color:${T.textS};margin-top:2px}

/* ANIMATIONS */
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.fade-up{animation:fadeUp .3s ease both}
.pop-in{animation:pop .4s cubic-bezier(0.175,0.885,0.32,1.275) both}

/* FINANCE */
.stat-box{text-align:center;padding:10px 4px;border-radius:8px;background:${T.card2};border:1px solid ${T.border}}
.stat-num{font-family:'Playfair Display',serif;font-size:22px;font-weight:700}
.stat-lbl{font-size:10px;color:${T.textS};margin-top:2px}
.env-card{background:${T.surface};border:1px solid ${T.border};border-radius:10px;padding:12px 13px;box-shadow:0 1px 2px rgba(0,0,0,0.04)}
.env-icon{width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0}
.grp-hdr{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;cursor:pointer;background:${T.card2};border:1px solid ${T.border};transition:all .15s}
.grp-hdr.open{border-radius:8px 8px 0 0;margin-bottom:0}
.grp-hdr.closed{border-radius:8px;margin-bottom:8px}
.grp-body{background:${T.card};border:1px solid ${T.border};border-top:none;border-radius:0 0 8px 8px;padding:8px 16px 12px;margin-bottom:10px}
.grp-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:${T.textS};display:flex;align-items:center;gap:8px}
.grp-count{background:${T.card};border-radius:10px;padding:1px 7px;font-size:10px;font-weight:600}
.ic-box{display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;width:26px;height:26px;border-radius:7px}
.qrow{display:flex;gap:8px;margin-top:10px;align-items:center}
.qrow input,.qrow select{background:${T.card2};border:1px solid ${T.border};border-radius:8px;color:${T.text};font-family:'DM Sans',sans-serif;font-size:12px;padding:6px 9px;outline:none}
.qrow input:focus,.qrow select:focus{border-color:${T.warm}}
`;
};


/* ── MEMBERS ─────────────────────────────────────────────── */
const MEMBERS = [
  {id:"family",name:"Family",  av:"👨‍👩‍👧‍👦"},
  {id:"james", name:"James",   av:"👨"},
  {id:"sarah", name:"Sarah",   av:"👩"},
  {id:"lily",  name:"Lily",    av:"👧"},
  {id:"tom",   name:"Tom",     av:"👦"},
];

/* ── SUB-NAV CONFIGS ─────────────────────────────────────── */
const SUBNAV = {
  today:     ["Daily Briefing"],
  lifeadmin: ["Tasks","Key Dates","Household Info","Documents","Cars & Home","Pet Care"],
  finance:   ["Overview","Budget Envelopes","Transactions","Bills & Subs","Admin","My Finance"],
  health:    ["Overview","Profiles","Medications","Appointments","Emergency Info","Journal"],
  recipes:   ["Library","Meal Planner","Grocery List","Nutrition"],
  travel:    ["My Trips","Packing Templates","Travel Ready"],
  account:   ["My Profile","Family Members","Preferences","Access","Security & Privacy"],
};

/* ═══════════════════════════════════════════════════════════
   SCREEN COMPONENTS
═══════════════════════════════════════════════════════════ */

/* ── HOME PAGE ──────────────────────────────────────────── */
function HomePage({go}) {
  const [openFaq, setOpenFaq] = useState(null);
  const features = [
    {icon:"🌅",label:"Daily Briefing"},   {icon:"🏥",label:"Family Health"},
    {icon:"💳",label:"Bills & Finance"},  {icon:"📔",label:"Daily Journal"},
    {icon:"✈️",label:"Travel Planner"},   {icon:"🐾",label:"Pet Care"},
    {icon:"📄",label:"Documents Vault"},  {icon:"🎯",label:"Hobbies Feed"},
  ];
  const plans = [
    {name:"Individual",price:"£2.99",features:["1 member","All 11 categories","Daily AI briefing","5GB document storage"],color:T.teal},
    {name:"Family",price:"£4.99",features:["Up to 6 members","Everything in Individual","Family sharing controls","Priority support","Unlimited storage"],color:T.warm},
  ];
  const faqs = [
    {q:"Is my health data safe?",a:"All health data is end-to-end encrypted. We use AWS KMS and PostgreSQL row-level security. Your data never leaves EU servers."},
    {q:"What do the AI agents actually do?",a:"Each life category has a dedicated AI agent — your Finance agent tracks bills and flags upcoming due dates, while your Health agent keeps on top of appointments and prescriptions. They work quietly in the background so you don't have to."},
    {q:"Can I use it just for myself?",a:"Yes. Individual accounts have full access to all features, including AI agents. You can add family members any time."},
    {q:"Can I trust AI agents with sensitive family data?",a:"Yes. AI agents only access data you've added to MyPal — they never connect to external accounts without your permission. All processing happens on encrypted data within our UK servers, and you can review or delete anything at any time."},
    {q:"What if I want to cancel?",a:"Cancel any time. You can export all your data as JSON or CSV before leaving. Account deletion is permanent after a 30-day grace period."},
  ];
  return (
    <div>
      {/* Hero */}
      <div className="hero-bg">
        <div style={{fontSize:12,fontWeight:600,letterSpacing:".1em",color:T.warm,textTransform:"uppercase",marginBottom:12}}>Introducing MyPal</div>
        <div className="hero-title">Your Family's<br/>Command Centre</div>
        <div className="hero-sub">The average parent juggles 6 different apps for things that should live in one place. MyPal's AI agents replace them all — health, finances, travel, pets, and your daily family life, beautifully organised so you can focus on what matters.</div>
        <button className="hero-cta" onClick={()=>go("signup")}>Get started free — no card needed</button>
        <div style={{marginTop:14,fontSize:12,color:T.textM}}>Already have an account? <span style={{color:T.warm,cursor:"pointer"}} onClick={()=>go("signin")}>Sign in →</span></div>
      </div>

      <div style={{padding:"28px 22px"}}>
        {/* Stats */}
        <div className="g3" style={{marginBottom:28}}>
          {[
            {v:"11",l:"Life categories"},
            {v:"6",l:"Members per family"},
            {v:"Free",l:"To get started"},
          ].map((s,i)=>(
            <div key={i} className="card" style={{textAlign:"center",padding:"18px"}}>
              <div className="stat-num">{s.v}</div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>

        {/* What we solve */}
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,marginBottom:6}}>What problems we solve</div>
        <div style={{fontSize:13,color:T.textS,marginBottom:16,lineHeight:1.7}}>The average parent juggles 6 different apps for things that should live in one place. MyPal's AI agents replace them all.</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:24}}>
          {features.map((f,i)=>(
            <div key={i} className="feature-pill">{f.icon} {f.label}</div>
          ))}
        </div>

        {/* Privacy */}
        <div className="card" style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{fontSize:22}}>🔒</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>Security & Privacy First</div>
          </div>
          {["End-to-end encrypted health and financial data","GDPR compliant — UK data centres","Your data is never sold to advertisers","Delete your account and all data at any time"].map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:9,marginBottom:7,fontSize:13,color:T.textS}}>
              <span style={{color:T.sage}}>✓</span>{t}
            </div>
          ))}
        </div>

        {/* Plans */}
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:12}}>Simple pricing</div>
        <div className="g2" style={{marginBottom:20}}>
          {plans.map((p,i)=>(
            <div key={i} className="card" style={{borderColor:p.color+"44",display:"flex",flexDirection:"column"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:p.color,marginBottom:4}}>{p.name}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,marginBottom:4}}>{p.price}<span style={{fontSize:14,fontWeight:400}}>/mo</span></div>
              <div style={{fontSize:11,fontWeight:600,color:T.sage,background:T.sageS,borderRadius:8,padding:"2px 8px",display:"inline-block",marginBottom:10}}>14 days free, no card needed</div>
              <div style={{flex:1}}>
                {p.features.map((f,j)=>(
                  <div key={j} style={{display:"flex",gap:8,fontSize:12.5,color:T.textS,marginBottom:5}}>
                    <span style={{color:p.color}}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{marginTop:16}} onClick={()=>go("signup")}>Start 14-day free</button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:10}}>Common questions</div>
        {faqs.map((faq,i)=>(
          <div key={i} className="card2" style={{marginBottom:8,cursor:"pointer"}} onClick={()=>setOpenFaq(openFaq===i?null:i)}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:13.5,fontWeight:600}}>
              {faq.q}
              <span style={{fontSize:11,color:T.textS,marginLeft:12,display:"inline-block",transform:openFaq===i?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}}>▼</span>
            </div>
            {openFaq===i && <div style={{fontSize:12.5,color:T.textS,lineHeight:1.6,marginTop:6}}>{faq.a}</div>}
          </div>
        ))}

        {/* Closing CTA */}
        <div style={{background:T.warmG,border:`1px solid ${T.warm}38`,borderRadius:13,padding:"28px 24px",textAlign:"center",marginTop:20}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,marginBottom:8}}>Ready to bring some calm to family life?</div>
          <div style={{fontSize:13,color:T.textS,marginBottom:20,lineHeight:1.6}}>Try free for 14 days — no credit card needed. Add family members any time.</div>
          <button className="hero-cta" onClick={()=>go("signup")}>Start 14-day free</button>
          <div style={{fontSize:12,color:T.textM,marginTop:12}}>Already have an account? <span style={{color:T.warm,cursor:"pointer"}} onClick={()=>go("signin")}>Sign in →</span></div>
        </div>
      </div>
    </div>
  );
}

/* ── SIGN UP ─────────────────────────────────────────────── */
function SignUp({go,setLoggedIn}) {
  const [type,setType] = useState(null);
  const [screen,setScreen] = useState("plan"); // "plan" | "details" | "verify"
  const [agreed,setAgreed] = useState(false);
  const [pwd,setPwd] = useState("");
  const pwdScore = [/.{8,}/,/[A-Z]/,/[0-9]/,/[^A-Za-z0-9]/].filter(r=>r.test(pwd)).length;
  const pwdColors = ["",T.rose,T.amber,T.teal,T.sage];
  const pwdLabels = ["","Weak","Fair","Good","Strong"];
  const plans = [
    {id:"solo",label:"Individual",price:"£2.99",desc:"Personal account. Full access to all 11 life categories. Add family members any time."},
    {id:"family",label:"Family",price:"£4.99",desc:"Shared account for up to 6 members with private profiles and family sharing controls."},
  ];

  if(screen==="plan") return (
    <div style={{padding:"28px 22px"}}>
      <div className="section-title">Create your account</div>
      <div className="section-sub">Choose your plan — 14 days free, no card needed.</div>
      <div className="g2" style={{marginBottom:20}}>
        {plans.map(p=>(
          <div key={p.id} className="card" style={{cursor:"pointer",borderColor:type===p.id?T.warm:T.border,background:type===p.id?T.warmG:T.card,textAlign:"center",padding:20,display:"flex",flexDirection:"column",gap:5}} onClick={()=>{setType(p.id);setScreen("details")}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700}}>{p.label}</div>
            <div style={{fontSize:20,fontWeight:700,color:T.warm}}>{p.price}<span style={{fontSize:12,fontWeight:400,color:T.textS}}>/mo</span></div>
            <div style={{fontSize:12,color:T.textS,lineHeight:1.5}}>{p.desc}</div>
            <div style={{fontSize:11,background:T.sage+"22",color:T.sage,borderRadius:20,padding:"3px 8px",marginTop:4}}>✓ 14 days free, no card needed</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,margin:"4px 0 12px"}}>
        <div style={{flex:1,height:"0.5px",background:T.border}}/>
        <span style={{fontSize:12,color:T.textM}}>or continue with</span>
        <div style={{flex:1,height:"0.5px",background:T.border}}/>
      </div>
      <button className="social-btn" onClick={()=>{setLoggedIn(true);go("onboarding")}}>
        <span style={{width:22,textAlign:"center",fontSize:15,fontWeight:700}}>G</span>
        <span>Continue with Google</span>
        <span style={{marginLeft:"auto",color:T.textS,fontSize:12}}>→</span>
      </button>
      <div style={{textAlign:"center",fontSize:13,color:T.textS,marginTop:14}}>Already have an account? <span style={{color:T.warm,cursor:"pointer"}} onClick={()=>go("signin")}>Sign in</span></div>
    </div>
  );

  if(screen==="verify") return (
    <div style={{padding:"28px 22px",textAlign:"center"}}>
      <div style={{fontSize:40,margin:"8px 0 16px"}}>📬</div>
      <div className="section-title" style={{fontSize:20}}>Check your inbox</div>
      <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:6}}>james@example.com</div>
      <div style={{fontSize:13,color:T.textS,lineHeight:1.7,marginBottom:24}}>We've sent you a verification link. Click it to activate your account — it expires in 24 hours.</div>
      <button className="btn-primary" onClick={()=>{setLoggedIn(true);go("onboarding")}}>Open email app</button>
      <div style={{fontSize:13,color:T.textS,marginTop:12}}><span style={{color:T.warm,cursor:"pointer"}}>Resend email</span></div>
      <div style={{fontSize:13,color:T.textS,marginTop:8}}><span style={{color:T.warm,cursor:"pointer"}} onClick={()=>setScreen("details")}>Wrong email? Go back and change it</span></div>
      <div style={{fontSize:12,color:T.textM,marginTop:20}}>Already verified? <span style={{color:T.warm,cursor:"pointer"}} onClick={()=>go("signin")}>Sign in</span></div>
    </div>
  );

  return (
    <div style={{padding:"28px 22px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
        <button className="btn-sm" onClick={()=>setScreen("plan")}>← Back</button>
        <span style={{fontSize:12,color:T.textS,background:T.card2,borderRadius:20,padding:"2px 10px"}}>Creating {type==="family"?"Family":"Individual"} account</span>
      </div>
      <div style={{background:T.warmG,border:`0.5px solid ${T.border}`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
        <span style={{fontSize:13}}>🏷️</span>
        <div style={{fontSize:12,color:T.textS}}><span style={{fontWeight:600,color:T.text}}>{type==="family"?"Family · £4.99":"Individual · £2.99"}/mo</span> — 14 days free, no card needed</div>
      </div>
      <div className="section-title" style={{fontSize:20}}>Your details</div>
      <div style={{fontSize:13,color:T.textS,marginBottom:20}}>Create your personal profile</div>
      {type==="family" && (
        <div className="field">
          <div className="field-label">Family name (e.g. The Smiths)</div>
          <input className="field-input" placeholder="The Smith Family"/>
        </div>
      )}
      <div className="g2" style={{marginBottom:14}}>
        <div className="field" style={{margin:0}}>
          <div className="field-label">First name</div>
          <input className="field-input" placeholder="James"/>
        </div>
        <div className="field" style={{margin:0}}>
          <div className="field-label">Last name</div>
          <input className="field-input" placeholder="Smith"/>
        </div>
      </div>
      <div className="field">
        <div className="field-label">Email address</div>
        <input className="field-input" type="email" placeholder="james@example.com"/>
      </div>
      <div className="field">
        <div className="field-label">Password</div>
        <input className="field-input" type="password" placeholder="Min. 8 characters" value={pwd} onChange={e=>setPwd(e.target.value)}/>
        {pwd && (<>
          <div className="pbar" style={{marginTop:6}}><div className="pfill" style={{width:`${pwdScore*25}%`,background:pwdColors[pwdScore]}}/></div>
          <div style={{fontSize:11,color:pwdColors[pwdScore],marginTop:4,fontWeight:600}}>{pwdLabels[pwdScore]}</div>
        </>)}
      </div>
      <div className="field">
        <div className="field-label">Phone number <span style={{fontWeight:400,color:T.textM}}>(optional — used for account recovery)</span></div>
        <div style={{display:"flex",gap:8}}>
          <select className="field-input" style={{width:90,flex:"none"}}>
            <option>🇬🇧 +44</option><option>🇺🇸 +1</option>
          </select>
          <input className="field-input" placeholder="7700 900123"/>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:10,cursor:"pointer"}} onClick={()=>setAgreed(v=>!v)}>
        <div style={{width:18,height:18,borderRadius:5,border:`1.5px solid ${agreed?T.warm:T.border}`,background:agreed?T.warm:T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",flexShrink:0,marginTop:1}}>{agreed?"✓":""}</div>
        <div style={{fontSize:12.5,color:T.textS,lineHeight:1.5}}>I agree to MyPal's <span style={{color:T.warm}}>Terms of Service</span> and <span style={{color:T.warm}}>Privacy Policy</span></div>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:16}}>
        <div style={{width:18,height:18,borderRadius:5,border:`1.5px solid ${T.border}`,background:T.card2,flexShrink:0,marginTop:1}}/>
        <div style={{fontSize:12.5,color:T.textS,lineHeight:1.5}}>Send me helpful tips and product updates (optional)</div>
      </div>
      <button className="btn-primary" disabled={!agreed} onClick={()=>setScreen("verify")}>Create account & continue</button>
      <button className="btn-secondary" onClick={()=>setScreen("plan")}>← Back to plans</button>
    </div>
  );
}

/* ── SIGN IN ─────────────────────────────────────────────── */
function SignIn({go,setLoggedIn}) {
  const [screen,setScreen] = useState("main"); // "main" | "forgot" | "forgotSent"
  const [error,setError] = useState(false);

  if(screen==="forgot") return (
    <div style={{padding:"28px 22px"}}>
      <button className="btn-sm" style={{marginBottom:20}} onClick={()=>setScreen("main")}>← Back</button>
      <div className="section-title" style={{fontSize:20}}>Reset password</div>
      <div style={{fontSize:13,color:T.textS,marginBottom:18,lineHeight:1.6}}>Enter your email and we'll send a reset link. It expires in 1 hour.</div>
      <div className="field"><div className="field-label">Email address</div><input className="field-input" type="email" placeholder="you@example.com"/></div>
      <button className="btn-primary" onClick={()=>setScreen("forgotSent")}>Send reset link</button>
    </div>
  );

  if(screen==="forgotSent") return (
    <div style={{padding:"28px 22px"}}>
      <button className="btn-sm" style={{marginBottom:20}} onClick={()=>setScreen("forgot")}>← Back</button>
      <div style={{fontSize:48,textAlign:"center",margin:"16px 0 14px"}}>📬</div>
      <div className="section-title" style={{textAlign:"center",marginBottom:8}}>Check your inbox</div>
      <div style={{fontSize:13,color:T.textS,textAlign:"center",lineHeight:1.7,marginBottom:24}}>We sent a reset link to your email.<br/>It expires in 1 hour.</div>
      <button className="btn-primary">Open email app</button>
      <div style={{textAlign:"center",marginTop:14}}><span style={{fontSize:13,color:T.warm,cursor:"pointer"}}>Resend email</span></div>
      <div style={{textAlign:"center",marginTop:10}}><span style={{fontSize:13,color:T.warm,cursor:"pointer"}} onClick={()=>setScreen("main")}>Back to sign in</span></div>
    </div>
  );

  return (
    <div style={{padding:"28px 22px"}}>
      <button className="btn-sm" style={{marginBottom:20}} onClick={()=>go("home")}>← Back to home</button>
      <div className="section-title">Welcome back</div>
      <div style={{fontSize:13,color:T.textS,marginBottom:22}}>Sign in to your MyPal account</div>
      <button className="social-btn" onClick={()=>{setLoggedIn(true);go("today")}}>
        <span style={{width:22,textAlign:"center",fontSize:15,fontWeight:700}}>G</span>
        <span>Continue with Google</span>
        <span style={{marginLeft:"auto",color:T.textS,fontSize:12}}>→</span>
      </button>
      <div className="or-div">or sign in with email</div>
      {error && (
        <div style={{padding:"10px 14px",borderRadius:10,background:T.roseS,border:`1px solid ${T.rose}`,fontSize:13,color:T.rose,marginBottom:14}}>
          Incorrect email or password. <span style={{color:T.warm,cursor:"pointer"}} onClick={()=>setScreen("forgot")}>Forgot your password?</span>
        </div>
      )}
      <div className="field"><div className="field-label">Email address</div><input className="field-input" type="email" placeholder="you@example.com"/></div>
      <div className="field"><div className="field-label">Password</div><input className="field-input" type="password" placeholder="••••••••"/></div>
      <div style={{textAlign:"right",marginBottom:16}}><span style={{fontSize:12.5,color:T.warm,cursor:"pointer"}} onClick={()=>setScreen("forgot")}>Forgot password?</span></div>
      <button className="btn-primary" onClick={()=>{setLoggedIn(true);go("today")}}>Sign in</button>
      <div style={{textAlign:"center",marginTop:14}}>
        <span style={{fontSize:12.5,color:T.textS,opacity:.5,cursor:"not-allowed"}}>Sign in with phone</span>
        <span style={{marginLeft:6,fontSize:11,padding:"2px 7px",borderRadius:5,background:T.card2,border:`1px solid ${T.border}`,color:T.textS}}>coming soon</span>
      </div>
      <div style={{textAlign:"center",fontSize:13,color:T.textS,marginTop:12}}>New to MyPal? <span style={{color:T.warm,cursor:"pointer"}} onClick={()=>go("signup")}>Create account</span></div>
    </div>
  );
}

/* ── ONBOARDING ──────────────────────────────────────────── */
function Onboarding({go}) {
  const [step,setStep] = useState(0);
  const [selInterests,setSelInterests] = useState(["📸 Photography","⚽ Football","🚴 Cycling"]);
  const [members,setMembers] = useState([{name:"Sarah",role:"Partner",av:"👩"},{name:"Lily",role:"Child",av:"👧"}]);
  const toggleInt = t => setSelInterests(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t]);
  const interests = ["📸 Photography","🚴 Cycling","🍳 Cooking","📚 Reading","⚽ Football","✈️ Travel","💻 Technology","🌱 Gardening","🎵 Music","🏃 Running","🎮 Gaming","🍷 Wine","🎨 Art","🧘 Yoga"];
  const [obInviteOpen, setObInviteOpen] = useState(false);
  const [obInviteRole, setObInviteRole] = useState("Adult");
  const steps = ["Welcome","Family","Briefing","Interests","Done"];

  return (
    <div style={{padding:"28px 22px"}}>
      {/* Stepper */}
      <div className="step-bar">
        {steps.map((s,i)=>(
          <>
            <div key={`d${i}`} className={`step-dot${i<step?" done":i===step?" active":""}`} style={{position:"relative"}}>
              {i<step?"✓":i+1}
              <span className="step-lbl">{s}</span>
            </div>
            {i<steps.length-1&&<div key={`l${i}`} className={`step-line${i<step?" done":""}`}/>}
          </>
        ))}
      </div>

      {step===0 && (
        <div className="fade-up">
          <div style={{fontSize:40,marginBottom:14}}>🎉</div>
          <div className="section-title">Welcome to MyPal!</div>
          <div style={{fontSize:13.5,color:T.textS,marginBottom:20,lineHeight:1.7}}>Let's take 2 minutes to set up your account. You'll have your personalised family hub ready by the end.</div>
          {[["👨‍👩‍👧‍👦","Add your family members","Set up individual profiles for each person"],["🌅","Configure your daily briefing","Weather, commute, news and emails each morning"],["🎯","Pick your interests","Personalise your content feed"]].map(([ic,t,s],i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,padding:"10px 12px",borderRadius:10,background:T.card2,border:`1px solid ${T.border}`}}>
              <span style={{fontSize:18}}>{ic}</span>
              <div><div style={{fontSize:13.5,fontWeight:600}}>{t}</div><div style={{fontSize:12,color:T.textS}}>{s}</div></div>
            </div>
          ))}
          <button className="btn-primary" style={{marginTop:12}} onClick={()=>setStep(1)}>Let's go →</button>
        </div>
      )}
      {step===1 && (
        <div className="fade-up">
          <div className="section-title" style={{fontSize:20}}>Add family members</div>
          <div style={{fontSize:13,color:T.textS,marginBottom:16}}>Everyone gets their own private profile. Add more any time.</div>
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,border:`1px solid ${T.border}`,background:T.card2,marginBottom:8,opacity:.6}}>
              <span style={{fontSize:18}}>👨</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>You (Admin)</div></div>
              <span style={{fontSize:10,padding:"1px 7px",borderRadius:7,background:T.warmS,color:T.warm}}>You</span>
            </div>
            {members.map((m,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,border:`1px solid ${T.border}`,background:T.card2,marginBottom:8}}>
                <span style={{fontSize:18}}>{m.av}</span>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{m.name}</div><div style={{fontSize:11,color:T.textS}}>{m.role}</div></div>
                <span style={{fontSize:12,color:T.rose,cursor:"pointer"}} onClick={()=>setMembers(ms=>ms.filter((_,j)=>j!==i))}>Remove</span>
              </div>
            ))}
            {members.length<5 && <button className="btn-sm" style={{width:"100%",textAlign:"center"}} onClick={()=>setObInviteOpen(true)}>+ Add member</button>}
          </div>
          <button className="btn-primary" onClick={()=>setStep(2)}>Continue</button>
          <button className="btn-secondary" onClick={()=>setStep(2)}>Skip — add later</button>
        </div>
      )}
      {step===2 && (
        <div className="fade-up">
          <div className="section-title" style={{fontSize:20}}>Set up Daily Briefing</div>
          <div style={{fontSize:13,color:T.textS,marginBottom:16}}>Your morning briefing — personalised to your life.</div>
          <div className="field"><div className="field-label">Home postcode</div><input className="field-input" placeholder="NR32 1AA"/></div>
          <div className="field"><div className="field-label">Work address (for commute)</div><input className="field-input" placeholder="Norwich, NR1 3QD"/></div>
          <div className="field">
            <div className="field-label">Commute mode</div>
            <div style={{display:"flex",gap:8}}>
              {["🚗 Drive","🚌 Transit","🚲 Cycle","🚶 Walk"].map((m,i)=>(
                <div key={i} style={{flex:1,padding:"8px 6px",borderRadius:9,border:`1px solid ${i===0?T.warm:T.border}`,background:i===0?T.warmS:T.card2,textAlign:"center",fontSize:12,cursor:"pointer",color:i===0?T.warm:T.textS}}>{m}</div>
              ))}
            </div>
          </div>
          <div className="field">
            <div className="field-label">News categories</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {["General","Technology","Finance","Sport","Health","Local"].map((c,i)=>(
                <div key={i} style={{padding:"4px 12px",borderRadius:16,border:`1px solid ${[0,1,3].includes(i)?T.warm:T.border}`,background:[0,1,3].includes(i)?T.warmS:T.card2,fontSize:12,cursor:"pointer",color:[0,1,3].includes(i)?T.warm:T.textS}}>{c}</div>
              ))}
            </div>
          </div>
          <button className="btn-primary" onClick={()=>setStep(3)}>Continue</button>
          <button className="btn-secondary" onClick={()=>setStep(3)}>Skip for now</button>
        </div>
      )}
      {step===3 && (
        <div className="fade-up">
          <div className="section-title" style={{fontSize:20}}>Your interests</div>
          <div style={{fontSize:13,color:T.textS,marginBottom:16}}>MyPal will personalise your daily feed and find local events for you.</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
            {interests.map(t=>(
              <div key={t} className={`int-tag${selInterests.includes(t)?" on":""}`} onClick={()=>toggleInt(t)}>{t}</div>
            ))}
          </div>
          <div style={{fontSize:12,color:T.textS,marginBottom:16}}>{selInterests.length} selected</div>
          <button className="btn-primary" onClick={()=>setStep(4)}>Finish setup</button>
          <button className="btn-secondary" onClick={()=>setStep(4)}>Skip — personalise later</button>
        </div>
      )}
      {step===4 && (
        <div style={{textAlign:"center"}} className="fade-up">
          <div style={{width:70,height:70,borderRadius:"50%",background:`linear-gradient(135deg,${T.warm},${T.rose})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 18px",boxShadow:`0 8px 28px rgba(232,160,64,0.4)`}} className="pop-in">🎉</div>
          <div className="section-title">You're all set!</div>
          <div style={{fontSize:13.5,color:T.textS,marginBottom:22,lineHeight:1.7}}>MyPal is ready. Your personalised daily briefing and family hub are waiting.</div>
          {["🌅 First daily briefing ready","📅 Your dashboard is set up","🤖 AI assistant activated","🔔 Smart reminders on"].map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,background:T.card2,border:`1px solid ${T.border}`,marginBottom:8,fontSize:13}}>
              <span style={{color:T.sage}}>✓</span>{t}
            </div>
          ))}
          <button className="btn-primary" style={{marginTop:14}} onClick={()=>go("today")}>Enter MyPal →</button>
        </div>
      )}

      {/* ── Add Member Modal (same as Invite Family Member) ── */}
      {obInviteOpen && (
        <div onClick={()=>setObInviteOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.card,borderRadius:16,padding:24,width:"100%",maxWidth:420,display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700}}>Add Family Member</div>
              <button onClick={()=>setObInviteOpen(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:4}}>✕</button>
            </div>
            <div style={{fontSize:12,color:T.textS,marginBottom:16,lineHeight:1.6}}>Add a family member to your household. You can invite them to create their own login later.</div>
            {[{label:"Full name",placeholder:"e.g. Sarah Smith",type:"text"},{label:"Email address (optional)",placeholder:"e.g. sarah@example.com",type:"email"}].map((f,i)=>(
              <div key={i} style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:600,color:T.textS,marginBottom:4,letterSpacing:".04em",textTransform:"uppercase"}}>{f.label}</div>
                <input type={f.type} placeholder={f.placeholder} style={{width:"100%",padding:"9px 11px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:600,color:T.textS,marginBottom:6,letterSpacing:".04em",textTransform:"uppercase"}}>Role</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["Adult","Teen","Child"].map(r=>(
                  <div key={r} onClick={()=>setObInviteRole(r)} style={{padding:"5px 14px",borderRadius:9,border:`1px solid ${r===obInviteRole?T.warm:T.border}`,background:r===obInviteRole?T.warmS:"transparent",color:r===obInviteRole?T.warm:T.textS,fontSize:12.5,cursor:"pointer",fontWeight:r===obInviteRole?600:400}}>{r}</div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setObInviteOpen(false)} className="btn-sm">Cancel</button>
              <button onClick={()=>{setMembers(m=>[...m,{name:"New Member",role:obInviteRole,av:"🧑"}]);setObInviteOpen(false);}} className="btn-sm btn-warm">Add member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── APPOINTMENTS DATA ───────────────────────────────────── */
const APPT_DATA_INIT = [
  { id:1,  src:"health",  name:"GP appointment — James",       provider:"Dr Patel · Lowestoft Surgery", date:"30/05/2026", time:"11:30am", member:"James",         vis:"own",    group:"today",     status:"upcoming" },
  { id:2,  src:"health",  name:"Dentist — Lily & Tom",         provider:"Coastal Dental",               date:"04/06/2026", time:"2:00pm",  member:"Family",        vis:"family", group:"week",      status:"upcoming" },
  { id:3,  src:"cars",    name:"MOT — Vauxhall Astra",         provider:"Kwik Fit · Lowestoft",         date:"06/06/2026", time:"9:00am",  member:"James",         vis:"hmg",    group:"week",      status:"upcoming" },
  { id:4,  src:"finance", name:"Mortgage renewal — broker",    provider:"John Harris IFA",              date:"12/06/2026", time:"10:00am", member:"James & Sarah", vis:"hmg",    group:"month",     status:"upcoming" },
  { id:5,  src:"general", name:"Haircut — James",              provider:"Tony's Barbers",               date:"18/06/2026", time:"",        member:"James",         vis:"own",    group:"month",     status:"upcoming", recurring:true, freq:"Every 6 weeks" },
  { id:6,  src:"health",  name:"Parents' evening — Maya",      provider:"Kirkley Academy",              date:"24/06/2026", time:"6:30pm",  member:"Family",        vis:"family", group:"month",     status:"upcoming" },
  { id:7,  src:"cars",    name:"Boiler service",               provider:"British Gas",                  date:"08/07/2026", time:"",        member:"Family",        vis:"hmg",    group:"nextmonth", status:"upcoming" },
  { id:8,  src:"health",  name:"Physio — James",               provider:"Suffolk Physio",               date:"15/07/2026", time:"3:00pm",  member:"James",         vis:"own",    group:"nextmonth", status:"upcoming" },
  { id:9,  src:"health",  name:"Eye test — James",             provider:"",                             date:"",           time:"",        member:"James",         vis:"own",    group:"",          status:"unbooked", templateSrc:"Health · Preventive Care", freq:"Every 2 years" },
  { id:10, src:"pet",     name:"Annual vet check — Biscuit",   provider:"",                             date:"",           time:"",        member:"Family",        vis:"family", group:"",          status:"unbooked", templateSrc:"Pet Care · Biscuit", freq:"Annually" },
  { id:11, src:"general", name:"Annual will review",           provider:"",                             date:"",           time:"",        member:"James & Sarah", vis:"hmg",    group:"",          status:"unbooked", recurring:true, freq:"Annually" },
  { id:12, src:"health",  name:"Flu jab — Sarah",              provider:"Boots Pharmacy",               date:"10/04/2026", time:"11:00am", member:"Sarah",         vis:"own",    group:"",          status:"past", resolution:"attended" },
  { id:13, src:"cars",    name:"Car service — Vauxhall Astra", provider:"Vauxhall Dealer",              date:"12/03/2026", time:"8:30am",  member:"James",         vis:"hmg",    group:"",          status:"past", resolution:"attended" },
];

/* ── APPOINTMENTS TAB ────────────────────────────────────── */
function AppointmentsTab() {
  const [forSec,   setForSec]   = useState("family");  // ForPicker: own | hmg | family
  const [openGrps, setOpenGrps] = useState({});      // all groups collapsed by default
  const [bookOpen, setBookOpen] = useState({});
  const [markOpen, setMarkOpen] = useState({});
  const [showAdd,  setShowAdd]  = useState(false);
  const [addType,  setAddType]  = useState("once");
  const [addCat,   setAddCat]   = useState("health");
  const [addVis,   setAddVis]   = useState("family");
  const [appts,    setAppts]    = useState(APPT_DATA_INIT);

  const SRCS = {
    health:  { label:"Health",      c:T.rose,   },
    finance: { label:"Finance",     c:T.sage,   },
    cars:    { label:"Cars & Home", c:T.amber,  },
    pet:     { label:"Pet Care",    c:T.lime,   },
    general: { label:"General",     c:T.violet, },
  };

  const TIME_GROUPS = [
    { id:"today",     label:"Today",      meta:"30 May 2026",    accent:T.warm   },
    { id:"week",      label:"This week",  meta:"31 May – 7 Jun", accent:T.teal   },
    { id:"month",     label:"This month", meta:"Jun 2026",       accent:T.sage   },
    { id:"nextmonth", label:"Next month", meta:"Jul 2026",       accent:T.violet },
  ];

  const visMatch = (a) => {
    if (forSec === "own")    return a.vis === "own";
    if (forSec === "hmg")    return a.vis === "own" || a.vis === "hmg";
    return true;
  };

  const visible  = appts.filter(visMatch);
  const unbooked = visible.filter(a => a.status === "unbooked");
  const past     = visible.filter(a => a.status === "past");
  const byGroup  = id => visible.filter(a => a.group === id && a.status === "upcoming");

  const toggleGrp  = id => setOpenGrps(p => ({...p, [id]: !p[id]}));
  const toggleBook = id => setBookOpen(p => ({...p, [id]: !p[id]}));
  const toggleMark = id => setMarkOpen(p => ({...p, [id]: !p[id]}));

  const confirmBook = (id) => {
    const date = document.getElementById(`bd-${id}`)?.value;
    const time = document.getElementById(`bt-${id}`)?.value;
    const prov = document.getElementById(`bp-${id}`)?.value;
    setAppts(prev => prev.map(a => a.id===id ? {...a, status:"upcoming", group:"week", date:date||"TBC", time:time||"", provider:prov||""} : a));
    setBookOpen(p => ({...p, [id]: false}));
  };

  const resolve = (id, resolution) => {
    setAppts(prev => prev.map(a => a.id===id ? {...a, status:"past", group:"", resolution} : a));
    setMarkOpen(p => ({...p, [id]: false}));
  };

  const inputStyle  = {fontSize:12, padding:"5px 8px", borderRadius:6, border:`1px solid ${T.border}`, background:T.card, color:T.text, width:"100%", boxSizing:"border-box"};
  const selectStyle = {...inputStyle};

  const renderAppt = (a, inNeedsBooking=false) => {
    const s = SRCS[a.src];
    const isToday = a.group === "today";
    return (
      <div key={a.id} style={{borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex", alignItems:"flex-start", gap:10, padding:"10px 14px"}}>
          <div style={{width:8, height:8, borderRadius:"50%", background:s.c, flexShrink:0, marginTop:5}}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13, fontWeight:500, color:T.text, marginBottom:3}}>{a.name}</div>
            <div style={{display:"flex", flexWrap:"wrap", gap:5, alignItems:"center"}}>
              <span style={{fontSize:10, fontWeight:600, padding:"1px 6px", borderRadius:5, background:s.c+"22", color:s.c}}>{s.label}</span>
              {a.resolution==="attended"  && <span style={{fontSize:10, fontWeight:600, padding:"1px 6px", borderRadius:5, background:T.sage+"22", color:T.sage}}>Attended</span>}
              {a.resolution==="missed"    && <span style={{fontSize:10, fontWeight:600, padding:"1px 6px", borderRadius:5, background:T.rose+"22", color:T.rose}}>Missed</span>}
              {a.resolution==="cancelled" && <span style={{fontSize:10, fontWeight:600, padding:"1px 6px", borderRadius:5, background:T.border,     color:T.textS}}>Cancelled</span>}
              {a.member   && <span style={{fontSize:10, padding:"1px 6px", borderRadius:5, background:T.surface, color:T.textS, border:`0.5px solid ${T.border}`}}>👤 {a.member}</span>}
              {a.date     && <span style={{fontSize:11, color:T.textS}}>📅 {a.date}{a.time?` · ${a.time}`:""}</span>}
              {a.provider && <span style={{fontSize:11, color:T.textS}}>📍 {a.provider}</span>}
              {(a.recurring||a.templateSrc) && <span style={{fontSize:10, color:T.textS}}>🔁 {a.freq}</span>}
              {a.templateSrc && <span style={{fontSize:10, color:T.textM, fontStyle:"italic"}}>via {a.templateSrc}</span>}
            </div>
          </div>
          <div style={{display:"flex", gap:6, flexShrink:0}}>
            {inNeedsBooking && <button className="btn-sm btn-warm" onClick={()=>toggleBook(a.id)} style={{fontSize:11}}>Book</button>}
            {!inNeedsBooking && isToday && <button className="btn-sm" onClick={()=>toggleMark(a.id)} style={{fontSize:11, borderColor:T.warm, color:T.warm}}>Resolve</button>}
            {!inNeedsBooking && !isToday && a.status==="upcoming" && <button className="btn-sm" onClick={()=>toggleMark(a.id)} style={{fontSize:11}}>Resolve</button>}
          </div>
        </div>

        {bookOpen[a.id] && (
          <div style={{borderTop:`1px solid ${T.border}`, background:T.surface, padding:"12px 14px"}}>
            <div style={{fontSize:12, fontWeight:600, color:T.text, marginBottom:10}}>Book this appointment</div>
            <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:8}}>
              <div style={{flex:1, minWidth:110}}><div style={{fontSize:10.5,color:T.textS,marginBottom:3}}>Date</div>    <input id={`bd-${a.id}`} type="date" style={inputStyle}/></div>
              <div style={{flex:1, minWidth:90}}> <div style={{fontSize:10.5,color:T.textS,marginBottom:3}}>Time</div>    <input id={`bt-${a.id}`} type="text" placeholder="10:30am" style={inputStyle}/></div>
              <div style={{flex:2, minWidth:140}}><div style={{fontSize:10.5,color:T.textS,marginBottom:3}}>Provider</div><input id={`bp-${a.id}`} type="text" placeholder="Clinic, shop…" style={inputStyle}/></div>
            </div>
            <div style={{display:"flex", gap:8}}>
              <button className="btn-sm btn-warm" onClick={()=>confirmBook(a.id)} style={{fontSize:11}}>Confirm booking</button>
              <button className="btn-sm"          onClick={()=>toggleBook(a.id)}  style={{fontSize:11}}>Cancel</button>
            </div>
          </div>
        )}

        {markOpen[a.id] && (
          <div style={{borderTop:`1px solid ${T.border}`, background:T.surface, padding:"12px 14px"}}>
            <div style={{fontSize:12, fontWeight:600, color:T.text, marginBottom:10}}>How did it go?</div>
            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              <button className="btn-sm" onClick={()=>resolve(a.id,"attended")}  style={{fontSize:11, borderColor:T.sage, color:T.sage}}>✓ Attended</button>
              <button className="btn-sm" onClick={()=>resolve(a.id,"missed")}    style={{fontSize:11, borderColor:T.rose, color:T.rose}}>✗ Missed</button>
              <button className="btn-sm" onClick={()=>resolve(a.id,"cancelled")} style={{fontSize:11}}>Cancelled</button>
              <button className="btn-sm" onClick={()=>toggleMark(a.id)}          style={{fontSize:11, marginLeft:"auto"}}>Close</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex", justifyContent:"flex-end", marginBottom:14}}>
        <button className="btn-sm" onClick={()=>setShowAdd(p=>!p)} style={{fontSize:12, padding:"5px 14px"}}>
          {showAdd?"✕ Close":"+ Add appointment"}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card" style={{marginBottom:14}}>
          {(() => {
            const lbl = {display:"block", fontSize:11, fontWeight:600, color:T.textS,
              marginBottom:4, marginTop:12, letterSpacing:".04em", textTransform:"uppercase"};
            const forOpts = [
              ...MEMBERS_AC.map(m => ({value:m.id, label:`${m.av} ${m.name}${m.you?" (you)":""}`})),
              {value:"family", label:"👥 Family"},
              {value:"hmg",    label:"🛡 Household Managers"},
            ];
            return (
              <>
                <div className="card-title" style={{marginTop:0}}>New appointment</div>

                {/* Row 1: Category + Type toggle */}
                <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"flex-end"}}>
                  <div style={{flex:1, minWidth:130}}>
                    <label style={lbl}>Category</label>
                    <select style={selectStyle} value={addCat} onChange={e=>setAddCat(e.target.value)}>
                      {Object.entries(SRCS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div style={{flex:1, minWidth:160}}>
                    <label style={lbl}>Type</label>
                    <div style={{display:"flex", gap:4}}>
                      <button className={`btn-sm${addType==="once"?" btn-warm":""}`}
                        onClick={()=>setAddType("once")} style={{fontSize:11, flex:1}}>One-off</button>
                      <button className={`btn-sm${addType==="recurring"?" btn-warm":""}`}
                        onClick={()=>setAddType("recurring")} style={{fontSize:11, flex:1}}>Recurring</button>
                    </div>
                  </div>
                </div>

                {/* Row 2: Title + For */}
                <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                  <div style={{flex:2, minWidth:160}}>
                    <label style={lbl}>Title</label>
                    <input type="text" placeholder="e.g. Haircut" style={inputStyle}/>
                  </div>
                  <div style={{flex:1, minWidth:140}}>
                    <label style={lbl}>For</label>
                    <select style={selectStyle}>
                      {forOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {addType==="once" ? (
                  /* ── One-off fields ── */
                  <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                    <div style={{flex:1, minWidth:110}}>
                      <label style={lbl}>Date</label>
                      <input type="date" style={inputStyle}/>
                    </div>
                    <div style={{flex:1, minWidth:90}}>
                      <label style={lbl}>Time</label>
                      <input type="text" placeholder="10:30am" style={inputStyle}/>
                    </div>
                    <div style={{flex:2, minWidth:140}}>
                      <label style={lbl}>Provider</label>
                      <input type="text" placeholder="Clinic, shop…" style={inputStyle}/>
                    </div>
                  </div>
                ) : (
                  /* ── Recurring fields ── */
                  <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                    <div style={{flex:1, minWidth:130}}>
                      <label style={lbl}>Frequency</label>
                      <select style={selectStyle}>
                        {["Weekly","Every 2 Weeks","Monthly","Quarterly","Half Yearly",
                          "9 Months","Yearly","18 Months","2 Years","3 Years"]
                          .map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div style={{flex:1, minWidth:130}}>
                      <label style={lbl}>First due date</label>
                      <input type="date" style={inputStyle}/>
                    </div>
                    <div style={{flex:1, minWidth:130}}>
                      <label style={lbl}>Surface before due</label>
                      <select style={selectStyle}>
                        {["1 week before","2 weeks before","1 month before","2 months before"]
                          .map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Visible to */}
                <div style={{maxWidth:280}}>
                  <label style={lbl}>Visible to</label>
                  <select style={selectStyle} value={addVis} onChange={e=>setAddVis(e.target.value)}>
                    {forOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div style={{display:"flex", gap:8, marginTop:14}}>
                  <button className="btn-sm btn-warm" style={{fontSize:11}}>Save appointment</button>
                  <button className="btn-sm" onClick={()=>setShowAdd(false)} style={{fontSize:11}}>Cancel</button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ── For picker: whose appointments to show ── */}
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap"}}>
        <span style={{fontSize:12, fontWeight:700, color:T.text, whiteSpace:"nowrap", flexShrink:0}}>Show for</span>
        {(() => {
          const opts = [["own","🙋 Own"],["hmg","🛡 Household Managers"],["family","👥 Family"]];
          return (
            <div style={{display:"flex", flex:"1 1 auto", minWidth:0, background:T.surface, borderRadius:8, padding:3}}>
              {opts.map(([v,label], i) => {
                const prevV = i > 0 ? opts[i-1][0] : null;
                const showDivider = i > 0 && forSec !== v && forSec !== prevV;
                return (
                  <React.Fragment key={v}>
                    {i > 0 && (
                      <div style={{width:1, alignSelf:"stretch", margin:"4px 0",
                        background: showDivider ? T.border : "transparent"}} />
                    )}
                    <button onClick={()=>setForSec(v)}
                      style={{flex:1, minWidth:0, fontSize:12, fontWeight:500, padding:"7px 8px", borderRadius:6, border:"none",
                        cursor:"pointer", textAlign:"center",
                        background: forSec===v ? T.teal : "transparent",
                        color:      forSec===v ? "#fff"  : T.textS}}>
                      {label}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ── Needs booking ── */}
      {unbooked.length > 0 && (
        <GroupHeader
          id="needs-booking"
          label="🔖 Needs booking"
          count={unbooked.length}
          accent={T.amber}
          open={!!openGrps["needs-booking"]}
          onToggle={()=>toggleGrp("needs-booking")}
        >
          {unbooked.map(a => renderAppt(a, true))}
        </GroupHeader>
      )}

      {/* ── Time groups — all collapsed by default ── */}
      {TIME_GROUPS.map(g => {
        const items = byGroup(g.id);
        if (!items.length) return null;
        return (
          <GroupHeader
            key={g.id}
            id={g.id}
            label={g.label}
            count={items.length}
            meta={g.meta}
            accent={g.accent}
            open={!!openGrps[g.id]}
            onToggle={()=>toggleGrp(g.id)}
          >
            {items.map(a => renderAppt(a, false))}
          </GroupHeader>
        );
      })}

      {/* ── Past appointments ── */}
      {past.length > 0 && (
        <GroupHeader
          id="past"
          label="Past appointments"
          count={past.length}
          open={!!openGrps["past"]}
          onToggle={()=>toggleGrp("past")}
        >
          {past.map(a => renderAppt(a, false))}
        </GroupHeader>
      )}

      {/* Empty state */}
      {!unbooked.length && TIME_GROUPS.every(g => !byGroup(g.id).length) && (
        <div style={{textAlign:"center", padding:"40px 0", color:T.textS, fontSize:13}}>No appointments to show</div>
      )}
    </div>
  );
}

/* ── TODAY ───────────────────────────────────────────────── */
function TodayScreen() {
  const [tab, setTab] = useState("Daily Briefing");
  const [priorities, setPriorities] = useState({});
  const [remDone, setRemDone] = useState({});
  const togglePri = i => setPriorities(p => ({...p, [i]: p[i]?.done ? null : {done:true,by:"James",when:"Just now"}}));
  const reopenPri = i => setPriorities(p => ({...p, [i]: null}));
  const toggleRem = i => setRemDone(p => ({...p, [i]: p[i]?.done ? null : {done:true,by:"Sarah",when:"Just now"}}));
  const reopenRem = i => setRemDone(p => ({...p, [i]: null}));

  const views = {
    "Daily Briefing": (
      <div>
        {/* Quick briefing strip */}
        <div className="card" style={{marginBottom:14,borderColor:T.warm+"44"}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:18,alignItems:"center"}}>
            {[{ic:"🌤️",main:"16°C",sub:"Partly cloudy · Lowestoft",c:T.sky},{ic:"🚗",main:"47 min",sub:"A47 delays — leave 8:05",c:T.amber},{ic:"🏫",main:"9 min",sub:"School run · no alerts",c:T.sage},{ic:"📧",main:"3 unread",sub:"Sarah, Barclays, School",c:T.teal},{ic:"📰",main:"5 stories",sub:"Finance · Sport · Tech",c:T.warm}].map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                {i>0&&<div style={{width:1,height:30,background:T.border}}/>}
                <span style={{fontSize:18}}>{item.ic}</span>
                <div><div style={{fontSize:13.5,fontWeight:600,color:item.c}}>{item.main}</div><div style={{fontSize:10.5,color:T.textS}}>{item.sub}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="g2">
          {/* Today's priorities */}
          <div className="card">
            <div className="card-title">⭐ Today's Priorities</div>
            {[{ic:"💊",t:"James – Blood pressure medication",tag:"Health",c:T.rose,vis:"family"},{ic:"📋",t:"Maya's school trip form due",tag:"School",c:T.amber,vis:"family"},{ic:"⚽",t:"Lily – Football 4pm",tag:"Family",c:T.teal,vis:"family"},{ic:"💳",t:"Mortgage payment due",tag:"Bills",c:T.sage,vis:"family",done:true,doneBy:"James",doneWhen:"8:30 AM"},{ic:"🏋️",t:"Upper body workout",tag:"Health",c:T.rose,vis:"personal"}].map((item,i)=>{
              const isDone = priorities[i]?.done || item.done;
              const doneBy = priorities[i]?.by || item.doneBy;
              const doneWhen = priorities[i]?.when || item.doneWhen;
              return (
              <div key={i} className="row" onClick={()=>!item.done&&togglePri(i)} style={{cursor:item.done?"default":"pointer",flexWrap:"wrap"}}>
                <div className="row-icon">{item.ic}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:12.5,textDecoration:isDone?"line-through":"none",color:isDone?T.textS:T.text}}>{item.t}</span>
                    <span style={{fontSize:9.5,padding:"1px 6px",borderRadius:6,background:item.vis==="family"?T.teal+"22":T.violet+"22",color:item.vis==="family"?T.teal:T.violet,flexShrink:0}}>{item.vis==="family"?"Family":"Personal"}</span>
                  </div>
                  {isDone&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                    <span style={{fontSize:10,color:T.sage}}>✓ Done by {doneBy}</span>
                    <span style={{fontSize:10,color:T.textM}}>· {doneWhen}</span>
                    {!item.done&&<span onClick={e=>{e.stopPropagation();reopenPri(i)}} style={{fontSize:10,color:T.amber,cursor:"pointer",marginLeft:2}}>↩ Reopen</span>}
                  </div>}
                </div>
                <span className="row-tag" style={{background:item.c+"22",color:item.c,fontSize:10}}>{item.tag}</span>
                <div className={`row-check${isDone?" done":""}`} style={{background:isDone?T.sage+"33":"transparent",borderColor:isDone?T.sage:T.border}}>{isDone?"✓":""}</div>
              </div>);
            })}
          </div>

          {/* News */}
          <div className="card">
            <div className="card-title">📰 Top News</div>
            {[{cat:"Finance",c:T.sage,h:"Bank of England holds rates at 4.25%",t:"1h ago"},{cat:"Sport",c:T.teal,h:"Premier League final day fixtures set",t:"3h ago"},{cat:"Tech",c:T.violet,h:"AI regulation bill passes first reading",t:"4h ago"},{cat:"Local",c:T.warm,h:"New cycling lanes for Lowestoft seafront",t:"5h ago"},{cat:"Health",c:T.rose,h:"NHS winter pressure report published",t:"6h ago"}].map((n,i)=>(
              <div key={i} className="row" style={{gap:9}}>
                <span style={{fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:6,background:n.c+"22",color:n.c,whiteSpace:"nowrap",flexShrink:0}}>{n.cat}</span>
                <span style={{fontSize:12.5,flex:1,lineHeight:1.4}}>{n.h}</span>
                <span style={{fontSize:10.5,color:T.textM,flexShrink:0}}>{n.t}</span>
              </div>
            ))}
          </div>

          {/* Emails */}
          <div className="card">
            <div className="card-title">📧 Inbox Highlights</div>
            {[{av:"👩",from:"Sarah",sub:"Can you pick up Lily at 4?",t:"8:14AM",unread:true},{av:"🏦",from:"Barclays",sub:"Your statement is ready",t:"7:30AM",unread:true},{av:"🏫",from:"School",sub:"Sports Day — 6 June",t:"Yesterday"},{av:"🏥",from:"Dr Patel",sub:"Appointment confirmed 22 May",t:"Yesterday"}].map((e,i)=>(
              <div key={i} className="row">
                {e.unread&&<div style={{width:5,height:5,borderRadius:"50%",background:T.teal,flexShrink:0}}/>}
                <span style={{fontSize:18,width:28,textAlign:"center"}}>{e.av}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12.5,fontWeight:e.unread?600:400}}>{e.from}</div>
                  <div style={{fontSize:11.5,color:T.textS,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.sub}</div>
                </div>
                <span style={{fontSize:10.5,color:T.textM,flexShrink:0}}>{e.t}</span>
              </div>
            ))}
          </div>

          {/* On this day */}
          <div>
            <div className="card" style={{padding:"12px 14px"}}>
              <div style={{fontSize:9.5,fontWeight:700,color:T.violet,textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>On This Day</div>
              <div style={{fontSize:13,color:T.textS,lineHeight:1.6}}>In <strong style={{color:T.text}}>1998</strong> — Google was founded in a garage in Menlo Park, California.</div>
            </div>
          </div>
        </div>

        {/* Daily Feed — Hobbies & Local Events */}
        <div className="g2" style={{marginTop:14}}>
          <div className="card">
            <div className="card-title">🎯 Your Interests Feed</div>
            {[
              {ic:"📸",t:"10 Golden Hour Photography Tips",src:"PetaPixel",time:"2h",c:T.amber,tag:"Photography"},
              {ic:"🚴",t:"Best Cycling Routes in Suffolk",src:"CyclingUK",time:"5h",c:T.sage,tag:"Cycling"},
              {ic:"⚽",t:"Premier League final day results",src:"BBC Sport",time:"3h",c:T.teal,tag:"Football"},
              {ic:"💻",t:"React 20 — what's new for devs",src:"Vercel Blog",time:"6h",c:T.violet,tag:"Tech"},
            ].map((f,i)=>(
              <div key={i} className="row" style={{gap:10}}>
                <div style={{width:30,height:30,borderRadius:8,background:f.c+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{f.ic}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12.5,fontWeight:500,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.t}</div>
                  <div style={{fontSize:11,color:T.textS}}>{f.src} · {f.time}</div>
                </div>
                <span style={{fontSize:10,fontWeight:600,padding:"1px 7px",borderRadius:7,background:f.c+"22",color:f.c,flexShrink:0}}>{f.tag}</span>
              </div>
            ))}
            <div style={{marginTop:10,fontSize:11.5,color:T.textM}}>Based on your interests · <span style={{color:T.warm,cursor:"pointer"}}>Edit interests →</span></div>
          </div>
          <div className="card">
            <div className="card-title">📍 Local Events</div>
            {[
              {ic:"📷",t:"Photography Walk — Saturday",loc:"Lowestoft seafront",c:T.amber},
              {ic:"🚴",t:"Lowestoft Cycling Club",loc:"Sunday 8am · Ness Point",c:T.sage},
              {ic:"⚽",t:"Kirkley & Pakefield FC",loc:"Sat 3pm · Walmer Road",c:T.teal},
              {ic:"📚",t:"Suffolk Book Club",loc:"Thursday 7pm · library",c:T.violet},
            ].map((ev,i)=>(
              <div key={i} className="row">
                <div style={{width:30,height:30,borderRadius:8,background:ev.c+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{ev.ic}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12.5,lineHeight:1.3}}>{ev.t}</div>
                  <div style={{fontSize:11,color:T.textS}}>{ev.loc}</div>
                </div>
              </div>
            ))}
            <div style={{marginTop:10,fontSize:11.5,color:T.textM}}>Events near Lowestoft · <span style={{color:T.warm,cursor:"pointer"}}>See more →</span></div>
          </div>
        </div>

        {/* Suggested Actions */}
        <div className="card" style={{marginTop:14}}>
          <div className="card-title">💡 Suggested Actions</div>
          {[
            {ic:"📝",t:"Draft reply to Mrs Patel (school trip)",tag:"School",c:T.amber},
            {ic:"🖨️",t:"Queue school trip form to print",tag:"School",c:T.amber},
            {ic:"💡",t:"Compare energy tariffs — 18% above budget",tag:"Finance",c:T.sage},
            {ic:"🎂",t:"Order birthday flowers for Sarah (Thu)",tag:"Reminder",c:T.pink},
          ].map((a,i)=>(
            <div key={i} className="row">
              <span style={{fontSize:16}}>{a.ic}</span>
              <span style={{flex:1,fontSize:13}}>{a.t}</span>
              <span className="row-tag" style={{background:a.c+"22",color:a.c,fontSize:10}}>{a.tag}</span>
              <button className="btn-sm" style={{flexShrink:0,fontSize:11,padding:"3px 9px"}}>Do it</button>
            </div>
          ))}
        </div>

        {/* Ask MyPal */}
        <div className="ai-banner" style={{marginTop:14}}>
          <div className="ai-icon">🤖</div>
          <div style={{flex:1}}>
            <div className="ai-name">Ask MyPal</div>
            <div className="ai-text">Your energy bill is up 18% vs last winter. Want me to compare three cheaper tariffs that fit your usage?</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            <button className="btn-sm btn-warm">Compare →</button>
            <button className="btn-sm">Dismiss</button>
          </div>
        </div>
      </div>
    ),
    "Appointments": <AppointmentsTab />,
  };

  return (
    <div>
      <div className="nav-tabs">
        {Object.keys(views).map(t => (
          <div key={t} className={`nav-tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>{t}</div>
        ))}
      </div>
      {views[tab]}
    </div>
  );
}

/* ── BILLS & SUBS DATA ───────────────────────────────────── */
const BILLS_DATA_INIT = {
  household:[
    {ic:"🏠", n:"Mortgage",    provider:"HSBC",                type:"Rent / Mortgage",
     amount:"£1,200.00", variable:false, frequency:"Monthly",
     nextDue:"01-Jun-2026", paymentMethod:"Direct Debit", owner:"Household",
     autoPay:true, reminderDays:3, accountRef:"MTG-44821",
     contractEnd:"01-Oct-2027", notes:"5-yr fixed, ends Oct 2027",
     lastPaid:"01-May-2026", lastUsed:"01-May-2026", paid:true, vis:"household"},
    {ic:"⚡", n:"Electricity", provider:"Octopus Energy",      type:"Electricity",
     amount:"£95.00", variable:true, frequency:"Monthly",
     nextDue:"20-May-2026", paymentMethod:"Direct Debit", owner:"James",
     autoPay:true, reminderDays:3, accountRef:"OCT-9981",
     contractEnd:"", notes:"",
     lastPaid:"20-Apr-2026", lastUsed:"18-May-2026", paid:false, vis:"household"},
    {ic:"🏛️", n:"Council Tax", provider:"East Suffolk Council", type:"Council Tax",
     amount:"£145.00", variable:false, frequency:"Monthly",
     nextDue:"25-May-2026", paymentMethod:"Direct Debit", owner:"Household",
     autoPay:true, reminderDays:3, accountRef:"CT-NR321AA",
     contractEnd:"", notes:"10 monthly instalments Apr–Jan",
     lastPaid:"25-Apr-2026", lastUsed:"25-Apr-2026", paid:false, vis:"household"},
    {ic:"📶", n:"Internet",    provider:"BT",                  type:"Internet",
     amount:"£45.00", variable:false, frequency:"Monthly",
     nextDue:"15-Jun-2026", paymentMethod:"Direct Debit", owner:"James",
     autoPay:true, reminderDays:3, accountRef:"BT-885532",
     contractEnd:"01-Mar-2027", notes:"",
     lastPaid:"15-May-2026", lastUsed:"20-May-2026", paid:true, vis:"household"},
    {ic:"🔥", n:"Gas",         provider:"British Gas",         type:"Gas",
     amount:"£78.00", variable:true, frequency:"Monthly",
     nextDue:"28-May-2026", paymentMethod:"Direct Debit", owner:"James",
     autoPay:true, reminderDays:3, accountRef:"BG-220114",
     contractEnd:"", notes:"",
     lastPaid:"28-Apr-2026", lastUsed:"19-May-2026", paid:false, vis:"household"},
  ],
  personal:[
    {ic:"💳", n:"Amex Card",       provider:"American Express", type:"Credit card",
     amount:"£320.00", variable:true, frequency:"Monthly",
     nextDue:"28-May-2026", paymentMethod:"Direct Debit", owner:"James",
     autoPay:true, reminderDays:3, accountRef:"AMEX-•••4827",
     contractEnd:"", notes:"",
     lastPaid:"28-Apr-2026", lastUsed:"19-May-2026", paid:false, vis:"personal"},
    {ic:"🏦", n:"Personal Loan",   provider:"Barclays",         type:"Loan",
     amount:"£180.00", variable:false, frequency:"Monthly",
     nextDue:"03-Jun-2026", paymentMethod:"Standing Order", owner:"James",
     autoPay:true, reminderDays:5, accountRef:"LN-2901",
     contractEnd:"03-Jun-2028", notes:"36-month term, 18 left",
     lastPaid:"03-May-2026", lastUsed:"03-May-2026", paid:false, vis:"personal"},
  ],
};
const SUBS_DATA_INIT = {
  household:[
    {ic:"🎬",n:"Netflix",         nextDue:"05-Jun-2026",amount:"£15.99",lastPaid:"05-May-2026",paid:true, vis:"household"},
    {ic:"🎵",n:"Spotify Family",  nextDue:"12-Jun-2026",amount:"£9.99", lastPaid:"12-May-2026",paid:true, vis:"household"},
    {ic:"🤝",n:"MyPal Family",    nextDue:"18-Jun-2026",amount:"£4.99", lastPaid:"18-May-2026",paid:true, vis:"household"},
    {ic:"🌍",n:"Duolingo",        nextDue:"22-May-2026",amount:"£6.99", lastPaid:"22-Apr-2026",paid:false,vis:"household",warn:"Unused 6 wks"},
  ],
  personal:[
    {ic:"💪",n:"Gym membership",  nextDue:"01-Jun-2026",amount:"£14.01",lastPaid:"01-May-2026",paid:true, vis:"personal"},
    {ic:"📰",n:"The Times",       nextDue:"30-May-2026",amount:"£9.99", lastPaid:"30-Apr-2026",paid:false,vis:"personal"},
  ],
};

/* ── SHARED SCOPE TOGGLE ─────────────────────────────────────
   Used by Life Admin and Health for consistent Me / Household Manager /
   Family selection. Visual: content-sized pill with outer border, inline
   caption to the right that changes based on selection.
   `segments` is per-area so each module passes its own internal keys + labels;
   `captions` is a map from segment-key → short inline caption string. */
function ScopeToggle({sec, setSec, segments, captions}) {
  return (
    <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:14, flexWrap:"wrap"}}>
      <div style={{display:"flex", gap:2, background:T.card2, borderRadius:9, padding:2,
        border:`1px solid ${T.border}`, width:"fit-content"}}>
        {segments.map(([v, l]) => (
          <div key={v} onClick={()=>setSec(v)}
            style={{padding:"6px 13px", borderRadius:7, cursor:"pointer", fontSize:12.5, fontWeight:600,
              background: sec===v ? T.surface : "transparent",
              color:      sec===v ? T.warm    : T.textS,
              border:     sec===v ? `1px solid ${T.border}` : "1px solid transparent",
              transition:"all .15s", whiteSpace:"nowrap"}}>
            {l}
          </div>
        ))}
      </div>
      {captions && captions[sec] && (
        <div style={{fontSize:11.5, color:T.textS, lineHeight:1.5, flex:"1 1 200px", minWidth:0}}>
          {captions[sec]}
        </div>
      )}
    </div>
  );
}

/* ── LIFE ADMIN ──────────────────────────────────────────── */
function LifeAdminScreen() {
  const [tab,setTab] = useState("Tasks");
  const [todoSec, setTodoSec] = useState("family");
  const [catFilter, setCatFilter] = useState("All");
  const [showRoutines, setShowRoutines] = useState(false);
  const [routinesSec, setRoutinesSec] = useState("all");
  const isMobile = useWindowWidth() < 500;
  const [docSec, setDocSec] = useState("family");
  const [notesSec, setNotesSec] = useState("family");
  const [carTab, setCarTab] = useState("Cars");
  const [carAddModal, setCarAddModal] = useState(null); // {type:"doc"|"task", sec:"cars"|"home"}
  const [bookTaskItem, setBookTaskItem] = useState(null); // task object being booked
  const [histFilterCars, setHistFilterCars] = useState({}); // {[vehicleId]: filterKey}
  const [histFilterHome, setHistFilterHome] = useState("all");
  const [logServiceOpen, setLogServiceOpen] = useState(false);
  const [logMaintenanceOpen, setLogMaintenanceOpen] = useState(false);
  const [carEditItem, setCarEditItem] = useState(null);
  const [homeEditItem, setHomeEditItem] = useState(null);
  const [carProfileModal, setCarProfileModal] = useState(false);
  const [homeProfileModal, setHomeProfileModal] = useState(null); // property object being edited
  const [carKeyEventEdit,  setCarKeyEventEdit]  = useState(null);  // key event template being edited (cars)
  const [homeKeyEventEdit, setHomeKeyEventEdit] = useState(null);  // key event template being edited (home)
  const [keyEventEditFreq, setKeyEventEditFreq] = useState("");    // FreqLeadPair: controlled freq in key event modals
  const [keyEventEditLead, setKeyEventEditLead] = useState("");    // FreqLeadPair: controlled lead time in key event modals
  const [addKeyEventOpen,  setAddKeyEventOpen]  = useState(null);  // {vehicleId, sec} — Add Key Event modal
  const editKeyInfoFormRef = useRef(null);
  const editHistFormRef    = useRef(null);
  const [carKeyEdit, setCarKeyEdit] = useState(null);           // key info item being edited (cars)
  const [homeKeyEdit, setHomeKeyEdit] = useState(null);         // key info item being edited (home)
  const [carAddVehicle, setCarAddVehicle] = useState(false);
  const [keyInfoAttach,  setKeyInfoAttach]  = useState("");  // filename shown in Add Key Info attach area
  const [historyAttach,  setHistoryAttach]  = useState("");  // filename shown in Log History attach area
  const [carsVehicles, setCarsVehicles] = useState(null);   // null = use hardcoded defaults
  const vehiclesRef    = useRef(null);                       // synced each render inside IIFE
  const editVehicleFormRef = useRef(null);
  const addVehicleFormRef  = useRef(null);
  const [homeAddProperty, setHomeAddProperty] = useState(false);
  const [homesState, setHomesState] = useState(null);        // null = use hardcoded defaults
  const homesRef = useRef(null);                             // synced each render inside IIFE
  const [histFilterHomes, setHistFilterHomes] = useState({}); // {[propertyId]: filterKey}
  const editHomeProfileFormRef = useRef(null);
  const addHomeFormRef = useRef(null);
  const homeKeyEventFormRef = useRef(null);
  const homeKeyInfoFormRef  = useRef(null);
  const addKeyEventFormRef  = useRef(null);
  const [addHomeTenure, setAddHomeTenure] = useState("owned");       // controlled tenure in Add Property modal
  const [addHomeOwnership, setAddHomeOwnership] = useState("freehold"); // freehold|leasehold in Add modal
  const [petAddOpen, setPetAddOpen] = useState(false);
  const [petsState, setPetsState] = useState(null);          // null = use hardcoded defaults
  const petsRef = useRef(null);                              // synced each render inside Pet Care IIFE
  const [histFilterPets, setHistFilterPets] = useState({}); // {[petId]: filterKey}
  const [petProfileModal, setPetProfileModal] = useState(null);  // pet object being edited
  const [petKeyEventEdit, setPetKeyEventEdit] = useState(null);  // key event being edited
  const [petKeyEdit, setPetKeyEdit] = useState(null);            // key info item being edited
  const [petHistEdit, setPetHistEdit] = useState(null);          // history entry being edited
  const [logPetHistOpen, setLogPetHistOpen] = useState(null);    // {petId} — log history modal
  const editPetProfileFormRef  = useRef(null);
  const editPetKeyEventFormRef = useRef(null);
  const editPetKeyItemFormRef  = useRef(null);
  const editPetHistFormRef     = useRef(null);
  const addPetFormRef          = useRef(null);
  const logPetHistFormRef      = useRef(null);
  // Key Dates state
  const [kdChip, setKdChip]                     = useState("all");
  const [kdScope, setKdScope]                   = useState("family");
  const [othersRoutinesState, setOthersRoutinesState] = useState(null);
  const [othersEditItem, setOthersEditItem]     = useState(null);
  const [addOthersOpen, setAddOthersOpen]       = useState(false);
  const addOthersFormRef  = useRef(null);
  const editOthersFormRef = useRef(null);
  const [notesQuery, setNotesQuery] = useState("");
  const [noteExp, setNoteExp] = useState({});
  const togNote = id => setNoteExp(p => ({...p, [id]: !p[id]}));
  const isNoteExp = id => !!noteExp[id];
  // Bills & Subs state moved to FinanceScreen
  const [open, setOpen] = useState({});
  const tog = k => setOpen(p => ({...p, [k]: !p[k]}));
  const isOpen = k => open[k] === true;

  const [uploadDocOpen, setUploadDocOpen] = useState(false);
  const [uploadDocCat, setUploadDocCat] = useState("Identity");
  const [modal, setModal] = useState(null);
  const [mForm, setMForm] = useState({});
  const openModal = item => {
    setModal(item);
    const isPrivate = item.visibility === "private";
    const isRecurring = !!item.freq;
    setMForm({
      title:    item.t          || "",
      desc:     item.desc       || "",
      type:     isRecurring ? "recurring" : "one-off",
      freq:     item.freq       || "Weekly",
      leadTime: clampLead(item.freq || "Weekly", item.leadTime || (isRecurring ? TODO_LEAD_DEFAULT[item.freq] || "1d" : "1d")),
      dueDate:  (isRecurring ? item.nextDue : item.dueDate) || "",
      assignee: item.as         || (isPrivate ? "Self" : "Family"),
      for:      item.as         || "Family",
      visibility: item.visibility || (item.as === "Self" ? "private" : "family"),
      category: item.cat        || "Personal",
    });
  };
  const closeModal = () => setModal(null);


  // Bills & Subs helpers moved to FinanceScreen

  const SectionTabs = ({sec,setSec,labels}) => (
    <div style={{display:"flex",gap:4,marginBottom:16,background:T.card2,borderRadius:10,padding:3}}>
      {labels.map(([val,lbl])=>(
        <div key={val} onClick={()=>setSec(val)} style={{flex:1,textAlign:"center",padding:"6px 12px",borderRadius:8,fontSize:12.5,fontWeight:600,cursor:"pointer",
          background:sec===val?T.surface:"transparent",color:sec===val?T.warm:T.textS,
          border:sec===val?`1px solid ${T.border}`:"1px solid transparent",transition:"all .15s"}}>{lbl}</div>
      ))}
    </div>
  );

  /* ── Scope segments (Life Admin) ── role-aware Me / Household Manager / Family.
     Owner/Admin/HMG see all 3 segments. Teen/Adult-non-HMG/Child see Me + Family only.
     Internal keys stay as "my"/"admin"/"family" to match existing data structures. */
  const LA_VIEWER_ROLE = "Owner"; // demo viewer
  const LA_IS_HMG = LA_VIEWER_ROLE === "Owner" || LA_VIEWER_ROLE === "Admin";
  const LA_SCOPE_SEGMENTS = LA_IS_HMG
    ? [["my","🙋 Own"],["admin","🛡 HMG"],["family","👥 Family"]]
    : [["my","🙋 Own"],["family","👥 Family"]];
  /* Inline caption per module × scope. Short by design — it sits next to the pill. */
  const LA_CAPTIONS = {
    todos:  {my:"Your own tasks · visible only to you",
             admin:"Household-management tasks · visible to HMG",
             family:"Shared with the whole household"},
    notes:  {my:"Private notes · visible only to you",
             admin:"Household-management notes · HMG only",
             family:"Shared notes · everyone can read, HMG can edit"},
    docs:   {my:"Personal documents · visible only to you",
             admin:"Sensitive household paperwork · HMG only",
             family:"Shared documents · visible to everyone"},
    cars:   {my:"Personal vehicles or properties",
             admin:"Assets tracked by HMG only",
             family:"Shared household assets"},
  };

  /* Per-item scope badge for To-Do rows. */
  const TODO_SCOPE_CHIP = {
    my:     {ic:"🙋", lbl:"Own",    bg:T.violetS, fg:T.violet},
    admin:  {ic:"👥", lbl:"HMG",    bg:T.warmS,   fg:T.warm},
    family: {ic:"🏠", lbl:"Family", bg:T.sageS,   fg:T.sage},
  };
  const ScopeChip = ({origin}) => {
    const c = TODO_SCOPE_CHIP[origin];
    if (!c) return null;
    return (
      <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9.5,
        padding:"1px 7px",borderRadius:8,whiteSpace:"nowrap",flexShrink:0,fontWeight:600,
        background:c.bg,color:c.fg}}>
        <span style={{fontSize:10}}>{c.ic}</span>{c.lbl}
      </span>
    );
  };

  const GroupHdr = ({gk,label,count,accent}) => (
    <div onClick={()=>tog(gk)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"8px 12px",cursor:"pointer",
      borderRadius:isOpen(gk)?"8px 8px 0 0":"8px",
      background:accent?accent+"18":T.card2,
      border:`1px solid ${accent?accent+"44":T.border}`,marginBottom:isOpen(gk)?0:4}}>
      <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",
        color:accent||T.textS,display:"flex",alignItems:"center",gap:8}}>
        {label}
        <span style={{background:T.card,borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:600,
          color:accent||T.textS}}>{count}</span>
      </div>
      <span style={{fontSize:10,color:accent||T.textM}}>{isOpen(gk)?"▼":"▶"}</span>
    </div>
  );

  const PriDot = ({p}) => <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,
    background:p==="high"?T.rose:p==="medium"?T.amber:T.textM}}/>;

  /* ── NOTE ROW (collapsed = title + 1-line preview, expanded = full body + actions) ── */
  const NOTE_AV   = {james:"👨",sarah:"👩",lily:"👧",tom:"👦"};
  const NOTE_NAME = {james:"James",sarah:"Sarah",lily:"Lily",tom:"Tom"};


  // Compact, consistent SVG icons for the row’s right-meta action group.
  const _IconEdit = (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{display:"block"}}>
      <path d="M11 2 L14 5 L5 14 L1.5 14.5 L2 11 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
  const _IconCopy = (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{display:"block"}}>
      <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 4 V2.5 a1 1 0 0 1 1-1 H11 a1 1 0 0 1 1 1 V4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
  const _IconX = (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" style={{display:"block"}}>
      <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const NoteIconBtn = ({onClick, title, danger, children}) => (
    <button onClick={onClick} title={title}
      style={{
        height:24, minWidth:26, padding:"0 6px", borderRadius:6,
        background:"transparent", cursor:"pointer",
        color: danger ? T.rose : T.textS,
        border:`1px solid ${danger ? T.rose+"44" : T.border}`,
        display:"inline-flex", alignItems:"center", justifyContent:"center",
        transition:"all .15s"
      }}
      onMouseEnter={e=>{
        if(danger){ e.currentTarget.style.background = T.rose+"18"; e.currentTarget.style.borderColor = T.rose; }
        else      { e.currentTarget.style.borderColor = T.warm; e.currentTarget.style.color = T.warm; }
      }}
      onMouseLeave={e=>{
        if(danger){ e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.rose+"44"; }
        else      { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textS; }
      }}>
      {children}
    </button>
  );

  const NoteRow = ({note, showAuthor, canEdit, sec}) => {
    const cfg = {
      my:    {ic:"🔒", lbl:"Self",   bg:T.violetS, fg:T.violet},
      admin: {ic:"🛡️", lbl:"HMG",    bg:T.warmS,   fg:T.warm},
      family:{ic:"🏠", lbl:"Family", bg:T.sageS,   fg:T.sage},
    }[sec] || {ic:"🏠", lbl:"Family", bg:T.sageS, fg:T.sage};
    const preview = (note.body || "").replace(/\s+/g, " ").trim();
    return (
      <div onClick={()=>{ if (canEdit) openEditNote(sec, note); }}
        style={{
          cursor: canEdit ? "pointer" : "default", marginBottom:6,
          padding:"9px 12px",
          background:T.surface, border:`1px solid ${T.border}`, borderRadius:9,
          display:"flex",alignItems:"center",gap:10,
          transition:"all .15s",
        }}
        onMouseEnter={e=>{ if(canEdit){ e.currentTarget.style.borderColor=T.warm+"66"; e.currentTarget.style.background=T.warmG; }}}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background=T.surface; }}>

        {/* Title */}
        <span style={{fontSize:13,fontWeight:600,color:T.text,whiteSpace:"nowrap",
          maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",flexShrink:0}}>{note.t}</span>

        {/* Description preview — truncates */}
        <span style={{fontSize:12,color:T.textS,
          flex:1,minWidth:0,
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {preview || <span style={{color:T.textM,fontStyle:"italic"}}>(no description)</span>}
        </span>

        {/* For chip */}
        <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9.5,padding:"1px 7px",
          borderRadius:9,whiteSpace:"nowrap",flexShrink:0,fontWeight:600,
          background:cfg.bg,color:cfg.fg}}>
          <span style={{fontSize:10}}>{cfg.ic}</span>{cfg.lbl}
        </span>

        {/* Author */}
        {showAuthor && note.author && (
          <span title={`Created by ${NOTE_NAME[note.author]}`}
            style={{fontSize:10.5,color:T.textS,flexShrink:0,
              display:"inline-flex",alignItems:"center",gap:3}}>
            <span style={{fontSize:12,lineHeight:1}}>{NOTE_AV[note.author]}</span>
            <span style={{whiteSpace:"nowrap"}}>{NOTE_NAME[note.author]}</span>
          </span>
        )}

        {/* Date */}
        <span style={{fontSize:10.5,color:T.textM,whiteSpace:"nowrap",flexShrink:0}}>
          {note.updated}
        </span>

        {/* Actions */}
        <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
          {canEdit && (
            <NoteIconBtn title="Edit" onClick={e=>{e.stopPropagation(); openEditNote(sec, note);}}>{_IconEdit}</NoteIconBtn>
          )}
          <NoteIconBtn title="Copy description" onClick={e=>{e.stopPropagation(); try{navigator.clipboard?.writeText(note.body);}catch(_){}}}>{_IconCopy}</NoteIconBtn>
          {canEdit && (
            <NoteIconBtn title="Delete" danger onClick={e=>{e.stopPropagation(); deleteNote(note.id, sec);}}>{_IconX}</NoteIconBtn>
          )}
          {!canEdit && (
            <span title="Read-only — Owner/Admin can edit Family notes"
              style={{fontSize:12,color:T.textM,marginLeft:2}}>🔒</span>
          )}
        </div>
      </div>
    );
  };

  /* ── TODO MODAL ────────────────────────── */
  const TODO_CATS = ["Admin","Bills","Car","Errands","Family","Finance","Food","Health","Home","Personal","Pets","School","Shopping","Social","Travel","Work","Other"];
  const MEMBERS   = ["Family","Sarah","James","Lily","Tom"];
  const priColor  = p => p==="high"?T.rose:p==="medium"?T.amber:T.textS;

  // Recurring/lead-time options for to-dos (mirror reminder modal vocabulary)
  const TODO_TYPE_OPTS  = [["one-off","One-off"],["recurring","Recurring"]];
  const TODO_FREQ_OPTS  = ["Weekly","Every 2 Weeks","Monthly","Quarterly","Half Yearly","9 Months","Yearly","18 Months","2 Years","3 Years"];
  const TODO_LEAD_OPTS  = [["1d","1 day"],["2d","2 days"],["3d","3 days"],["1w","1 week"],["2w","2 weeks"],["1mo","1 month"],["3mo","3 months"]];
  // Default lead-time per frequency (ADR-011)
  const TODO_LEAD_DEFAULT = {
    "one-off":"1d",
    "Weekly":"1d", "Every 2 Weeks":"2d", "Monthly":"3d",
    "Quarterly":"1w", "Half Yearly":"2w", "9 Months":"2w",
    "Yearly":"1mo", "18 Months":"1mo", "2 Years":"3mo", "3 Years":"3mo",
  };
  // Hard maximum lead-time per frequency — must be < 50% of cycle (ADR-011)
  const TODO_LEAD_MAX = {
    "Weekly":"3d", "Every 2 Weeks":"1w", "Monthly":"2w",
    "Quarterly":"1mo", "Half Yearly":"3mo", "9 Months":"3mo",
    "Yearly":"3mo", "18 Months":"3mo", "2 Years":"3mo", "3 Years":"3mo",
  };
  // Ordered lead-time values — used to compare and clamp
  const LEAD_ORDER = ["1d","2d","3d","1w","2w","1mo","3mo"];
  const leadIdx    = v => LEAD_ORDER.indexOf(v);
  // Returns true if leadVal is within the allowed range for the given frequency
  const leadAllowed = (freq, leadVal) => leadIdx(leadVal) <= leadIdx(TODO_LEAD_MAX[freq] || "3mo");
  // Clamps a lead-time value to the max allowed for a frequency
  const clampLead   = (freq, leadVal) => leadAllowed(freq, leadVal) ? leadVal : TODO_LEAD_MAX[freq] || "3mo";
  const todoTypeColor = v => v==="one-off"?T.teal:T.violet;
  const freqTodoColor = s => s==="Daily"?T.rose:s==="Weekly"?T.teal:s==="Fortnightly"?T.sky:s==="Monthly"?T.violet:s==="Half Yearly"?T.warm:s==="Annual"?T.amber:T.textS;

  const fldLbl = {display:"block",fontSize:11,fontWeight:600,color:T.textS,marginBottom:4,marginTop:14,letterSpacing:".04em",textTransform:"uppercase"};
  const fldInp = {width:"100%",padding:"8px 11px",borderRadius:8,border:`1px solid ${T.border}`,
    background:T.surface,color:T.text,fontSize:13,outline:"none",fontFamily:"inherit",
    WebkitAppearance:"none",appearance:"none"};
  const modalShell = {
    position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
    zIndex:201, width:"min(460px,94vw)", maxHeight:"88vh", overflowY:"auto",
    background:T.card, border:`1px solid ${T.borderHi}`, borderRadius:18,
    padding:24, boxShadow:"0 32px 80px rgba(0,0,0,0.55)"
  };
  const rowBase = {
    display:"flex", alignItems:"center", gap:10, padding:"8px 14px",
    borderBottom:`1px solid ${T.border}`, cursor:"pointer", transition:"background .12s"
  };

  const TaskModal = () => (
    <>
      {/* Backdrop */}
      <div onClick={closeModal}
        style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,backdropFilter:"blur(3px)"}}/>
      {/* Sheet */}
      <div style={{...modalShell}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:T.text}}>{modal?._isNew ? "New Task" : "Edit Task"}</div>
          </div>
          <div onClick={closeModal}
            style={{cursor:"pointer",color:T.textS,fontSize:20,lineHeight:1,padding:"2px 6px",borderRadius:6,
              background:T.card2}}>✕</div>
        </div>

        {/* Title */}
        <label style={fldLbl}>Title</label>
        <input value={mForm.title} onChange={e=>setMForm(f=>({...f,title:e.target.value}))}
          style={fldInp} placeholder="What needs to be done?"/>

        {/* Description */}
        <label style={fldLbl}>
          Description
          <span style={{color:T.textM,fontWeight:400,textTransform:"none",letterSpacing:0,marginLeft:6}}>
            {150-(mForm.desc||"").length} chars left
          </span>
        </label>
        <textarea value={mForm.desc} maxLength={150}
          onChange={e=>setMForm(f=>({...f,desc:e.target.value}))}
          style={{...fldInp,resize:"vertical",minHeight:68}}
          placeholder="Add more detail…"/>

        {/* For + Visible to */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <label style={fldLbl}>For</label>
            <div style={{position:"relative"}}>
              <select value={mForm.for||"Family"} onChange={e=>setMForm(f=>({...f,for:e.target.value}))}
                style={{...fldInp,paddingRight:28}}>
                {MEMBERS_AC.map(m=>(
                  <option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>
                ))}
                <option value="Family">👥 Family</option>
                <option value="HMG">🛡 Household Managers</option>
              </select>
              <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
            </div>
          </div>
          <div>
            <label style={fldLbl}>Visible to</label>
            <div style={{position:"relative"}}>
              <select value={mForm.visibility||"family"} onChange={e=>setMForm(f=>({...f,visibility:e.target.value}))}
                style={{...fldInp,paddingRight:28}}>
                {MEMBERS_AC.map(m=>(
                  <option key={m.id} value={`member:${m.id}`}>{m.av} {m.name}{m.you?" (you)":""}</option>
                ))}
                <option value="family">👥 Family</option>
                <option value="hmg">🛡 Household Managers</option>
              </select>
              <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
            </div>
          </div>
        </div>

        {/* Due date */}
        <label style={fldLbl}>Due Date</label>
        <input type="date" value={mForm.dueDate||""}
          onChange={e=>setMForm(f=>({...f,dueDate:e.target.value}))}
          style={{...fldInp,colorScheme:"dark"}}/>

        {/* Category */}
        <label style={fldLbl}>Category</label>
        <div style={{position:"relative"}}>
          <select value={mForm.category} onChange={e=>setMForm(f=>({...f,category:e.target.value}))}
            style={{...fldInp,paddingRight:28}}>
            {TODO_CATS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
            pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:10,alignItems:"center",marginTop:6}}>
          {modal?._sec && modal?._gk!=null && modal?._idx!=null && (
            <button onClick={()=>{ deleteTodo(modal._sec, modal._gk, modal._idx); closeModal(); }}
              className="btn-sm"
              style={{padding:"10px 14px",fontSize:13,color:T.rose,borderColor:T.rose+"66"}}>
              Delete
            </button>
          )}
          <button onClick={closeModal} className="btn-sm"
            style={{flex:1,padding:"10px 0",fontSize:13}}>Cancel</button>
          <button onClick={saveTask} className="btn-sm btn-warm"
            style={{flex:2,padding:"10px 0",fontSize:13,fontWeight:700}}>Save changes</button>
        </div>
      </div>
    </>
  );

  const RoutineModal = () => (
    <>
      {/* Backdrop */}
      <div onClick={closeModal}
        style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,backdropFilter:"blur(3px)"}}/>
      {/* Sheet */}
      <div style={{...modalShell, width:"min(480px,94vw)", border:`1px solid ${T.violet}55`}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <span style={{fontSize:18}}>♻︎</span>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:T.text}}>{modal?._isNew ? "New Routine" : "Edit Routine"}</div>
              <div style={{fontSize:11,color:T.textS,marginTop:2}}>A schedule that creates recurring tasks automatically</div>
            </div>
          </div>
          <div onClick={closeModal}
            style={{cursor:"pointer",color:T.textS,fontSize:20,lineHeight:1,padding:"2px 6px",
              borderRadius:6,background:T.card2}}>✕</div>
        </div>

        {/* Title */}
        <label style={fldLbl}>Title</label>
        <input value={mForm.title} onChange={e=>setMForm(f=>({...f,title:e.target.value}))}
          style={fldInp} placeholder="Name this routine…"/>

        {/* Description */}
        <label style={fldLbl}>
          Description
          <span style={{color:T.textM,fontWeight:400,textTransform:"none",letterSpacing:0,marginLeft:6}}>
            {150-(mForm.desc||"").length} chars left
          </span>
        </label>
        <textarea value={mForm.desc} maxLength={150}
          onChange={e=>setMForm(f=>({...f,desc:e.target.value}))}
          style={{...fldInp,resize:"vertical",minHeight:60}}
          placeholder="Add more detail…"/>

        {/* For + Visible to */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <label style={fldLbl}>For</label>
            <div style={{position:"relative"}}>
              <select value={mForm.for||"Family"} onChange={e=>setMForm(f=>({...f,for:e.target.value}))}
                style={{...fldInp,paddingRight:28}}>
                {MEMBERS_AC.map(m=>(
                  <option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>
                ))}
                <option value="Family">👥 Family</option>
                <option value="HMG">🛡 Household Managers</option>
              </select>
              <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
            </div>
          </div>
          <div>
            <label style={fldLbl}>Visible to</label>
            <div style={{position:"relative"}}>
              <select value={mForm.visibility||"family"} onChange={e=>setMForm(f=>({...f,visibility:e.target.value}))}
                style={{...fldInp,paddingRight:28}}>
                {MEMBERS_AC.map(m=>(
                  <option key={m.id} value={`member:${m.id}`}>{m.av} {m.name}{m.you?" (you)":""}</option>
                ))}
                <option value="family">👥 Family</option>
                <option value="hmg">🛡 Household Managers</option>
              </select>
              <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
            </div>
          </div>
        </div>

        {/* Frequency + Next Occurrence */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <label style={fldLbl}>Frequency</label>
            <div style={{position:"relative"}}>
              <select value={mForm.freq||"Weekly"}
                onChange={e=>{
                  const newFreq = e.target.value;
                  setMForm(f=>({...f, freq:newFreq, leadTime:TODO_LEAD_DEFAULT[newFreq]||"1d"}));
                }}
                style={{...fldInp,paddingRight:28}}>
                {TODO_FREQ_OPTS.map(f=><option key={f} value={f}>{f}</option>)}
              </select>
              <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
            </div>
          </div>
          <div>
            <label style={fldLbl}>Next Occurrence</label>
            <input type="date" value={mForm.dueDate||""}
              onChange={e=>setMForm(f=>({...f,dueDate:e.target.value}))}
              style={{...fldInp,colorScheme:"dark"}}/>
          </div>
        </div>

        {/* Lead time */}
        <label style={fldLbl}>
          Lead Time
          <span style={{color:T.textM,fontWeight:400,textTransform:"none",letterSpacing:0,marginLeft:6}}>
            how far ahead each occurrence surfaces
          </span>
        </label>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:2}}>
          {TODO_LEAD_OPTS.map(([val,lbl])=>{
            const allowed  = leadAllowed(mForm.freq||"Weekly", val);
            const isActive = mForm.leadTime === val;
            return (
              <div key={val}
                onClick={()=>{ if (allowed) setMForm(f=>({...f,leadTime:val})); }}
                title={allowed ? undefined : `Max lead time for ${mForm.freq||"Weekly"} is ${TODO_LEAD_OPTS.find(([v])=>v===TODO_LEAD_MAX[mForm.freq||"Weekly"])?.[1]}`}
                style={{padding:"5px 11px",borderRadius:7,fontSize:12,fontWeight:600,
                  transition:"all .15s",whiteSpace:"nowrap",
                  cursor: allowed ? "pointer" : "not-allowed",
                  opacity: allowed ? 1 : 0.35,
                  border:`1px solid ${isActive ? T.teal : T.border}`,
                  background: isActive ? T.teal+"22" : "transparent",
                  color: isActive ? T.teal : T.textS}}>
                {lbl}
              </div>
            );
          })}
        </div>

        {/* Category */}
        <label style={fldLbl}>Category</label>
        <div style={{position:"relative"}}>
          <select value={mForm.category||"Personal"} onChange={e=>setMForm(f=>({...f,category:e.target.value}))}
            style={{...fldInp,paddingRight:28}}>
            {TODO_CATS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
            pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:10,alignItems:"center",marginTop:6}}>
          {!modal?._isNew && modal?._sec && modal?._idx!=null && (
            <button onClick={()=>{
                setTodoData(d => ({...d, [modal._sec]: {...d[modal._sec],
                  recurring: d[modal._sec].recurring.filter((_,i) => i !== modal._idx)}}));
                closeModal();
              }}
              className="btn-sm"
              style={{padding:"10px 14px",fontSize:13,color:T.rose,borderColor:T.rose+"66"}}>
              Delete
            </button>
          )}
          <button onClick={closeModal} className="btn-sm"
            style={{flex:1,padding:"10px 0",fontSize:13}}>Cancel</button>
          <button onClick={saveRoutine} className="btn-sm btn-warm"
            style={{flex:2,padding:"10px 0",fontSize:13,fontWeight:700}}>Save changes</button>
        </div>
      </div>
    </>
  );

  /* ── HOUSEHOLD INFO / NOTE MODAL ───────── */
  const NoteModal = () => {
    const mode = noteModal?.mode;
    const sec  = noteModal?.sec;
    const titleOk = noteForm.t.trim().length > 0;
    return (
      <>
        {/* Backdrop */}
        <div onClick={closeNoteModal}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,backdropFilter:"blur(3px)"}}/>
        {/* Sheet */}
        <div style={{...modalShell, width:"min(520px,94vw)"}}>

          {/* Header */}
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4,gap:12}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:700,color:T.text}}>
                {mode === "edit" ? "Edit note" : "Add note"}
              </div>
              <div style={{fontSize:11,color:T.textS,marginTop:3,lineHeight:1.5}}>
                {noteForm.sec === "my"
                  ? "Private — only you will see this."
                  : noteForm.sec === "admin"
                  ? "Visible to Household Managers only."
                  : "Visible to the whole household."}
              </div>
            </div>
            <div onClick={closeNoteModal}
              style={{cursor:"pointer",color:T.textS,fontSize:20,lineHeight:1,padding:"2px 6px",borderRadius:6,
                background:T.card2,flexShrink:0}}>✕</div>
          </div>

          {/* Title */}
          <label style={fldLbl}>
            Title
            <span style={{color:T.textM,fontWeight:400,textTransform:"none",letterSpacing:0,marginLeft:6}}>
              max 100
            </span>
          </label>
          <input value={noteForm.t || ""} autoFocus maxLength={100}
            onChange={e=>setNoteForm(f=>({...f,t:e.target.value.slice(0,100)}))}
            onKeyDown={e=>{ if(e.key==="Escape") closeNoteModal(); }}
            placeholder="e.g. Wi-Fi password · Boiler service contact · School portal PIN"
            style={fldInp}/>
          <div style={{display:"flex",justifyContent:"flex-end",fontSize:10,
            color:(100-(noteForm.t||"").length)<10?T.rose:T.textM, marginTop:4,fontVariantNumeric:"tabular-nums"}}>
            {100-(noteForm.t||"").length}/100
          </div>

          {/* Description */}
          <label style={fldLbl}>
            Description
            <span style={{color:T.textM,fontWeight:400,textTransform:"none",letterSpacing:0,marginLeft:6}}>
              max 300
            </span>
          </label>
          <textarea value={noteForm.body || ""}
            onChange={e=>setNoteForm(f=>({...f,body:e.target.value.slice(0,300)}))}
            placeholder={"e.g.\nSSID: HomeNet\nPass: ********\nSocket location: utility cupboard"}
            rows={Math.max(3, Math.min(8, (noteForm.body||"").split("\n").length + 1))}
            style={{...fldInp, resize:"vertical", minHeight:80,
              fontFamily:"'DM Sans',sans-serif", fontSize:13, lineHeight:1.55,
              whiteSpace:"pre-wrap", paddingTop:9, paddingBottom:9}}/>
          <div style={{display:"flex",justifyContent:"flex-end",fontSize:10,
            color:(300-(noteForm.body||"").length)<20?T.rose:T.textM, marginTop:4,fontVariantNumeric:"tabular-nums"}}>
            {300-(noteForm.body||"").length}/300
          </div>

          {/* For + Visible to side-by-side */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={fldLbl}>For</label>
              <div style={{position:"relative"}}>
                <select value={noteForm.for || "family"}
                  onChange={e=>setNoteForm(f=>({...f, for:e.target.value}))}
                  style={{...fldInp,paddingRight:28}}>
                  {MEMBERS_AC.map(m=>(
                    <option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>
                  ))}
                  <option value="family">👥 Family</option>
                  <option value="hmg">🛡 Household Managers</option>
                </select>
                <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                  pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
              </div>
            </div>
            <div>
              <label style={fldLbl}>Visible to</label>
              <div style={{position:"relative"}}>
                <select value={noteForm.sec === "my" ? "my" : noteForm.sec === "admin" ? "hmg" : "family"}
                  onChange={e=>{ const v=e.target.value; setNoteForm(f=>({...f, sec:v==="my"?"my":v==="hmg"?"admin":"family"})); }}
                  style={{...fldInp,paddingRight:28}}>
                  {MEMBERS_AC.filter(m=>m.you).map(m=>(
                    <option key="my" value="my">🔒 {m.name} (you)</option>
                  ))}
                  <option value="family">👥 Family</option>
                  {LA_IS_HMG && <option value="hmg">🛡 Household Managers</option>}
                </select>
                <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                  pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
              </div>
            </div>
          </div>

          {/* Category */}
          <label style={fldLbl}>Category</label>
          <div style={{position:"relative"}}>
            <select value={noteForm.cat}
              onChange={e=>setNoteForm(f=>({...f,cat:e.target.value}))}
              style={{...fldInp,paddingRight:28}}>
              {NOTES_CATS.map(([key,label])=>(
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
              pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
          </div>

          {/* Actions */}
          <div style={{display:"flex",gap:8,marginTop:20}}>
            <button onClick={closeNoteModal} className="btn-sm"
              style={{flex:1,padding:"10px 0",fontSize:13}}>Cancel</button>
            <button onClick={saveNote}
              disabled={!titleOk}
              className={`btn-sm${titleOk ? " btn-warm" : ""}`}
              style={{flex:2,padding:"10px 0",fontSize:13,fontWeight:700,
                opacity: titleOk ? 1 : 0.5,
                cursor: titleOk ? "pointer" : "not-allowed"}}>
              {mode === "edit" ? "Save changes" : "Save note"}
            </button>
          </div>
        </div>
      </>
    );
  };

  /* ── TO DOS DATA ───────────────────────── */
  const [todoData, setTodoData] = useState({
    my: {
      overdue:[
        {t:"Submit expense report",due:"3 days ago",dueDate:"2026-05-18",pri:"high",cat:"Finance",as:"Self",by:"James",visibility:"private"},
        {t:"Call landlord re: boiler",due:"Last week",dueDate:"2026-05-14",pri:"high",cat:"Home",as:"Self",by:"James",visibility:"private"},
        {t:"Book eye test",due:"5 days ago",dueDate:"2026-05-16",pri:"medium",cat:"Health",as:"Self",by:"James",visibility:"private"},
      ],
      today:[
        {t:"Renew car insurance",due:"Today",dueDate:"2026-05-21",pri:"high",cat:"Finance",as:"Self",by:"James",visibility:"private"},
        {t:"Call dentist for check-up",due:"Today",dueDate:"2026-05-21",pri:"medium",cat:"Health",as:"Self",by:"James",visibility:"private"},
        {t:"Pay council tax bill",due:"Today",dueDate:"2026-05-21",pri:"high",cat:"Finance",as:"Self",by:"James",visibility:"private"},
        {t:"Order birthday flowers",due:"Today",dueDate:"2026-05-21",pri:"low",cat:"Personal",as:"Self",by:"James",visibility:"private",done:true,doneBy:"You · 9:14am"},
      ],
      week:[
        {t:"Book flights to Edinburgh",due:"22-May-2026",dueDate:"2026-05-22",pri:"medium",cat:"Travel",as:"Self",by:"James",visibility:"private"},
        {t:"Return Amazon parcel",due:"23-May-2026",dueDate:"2026-05-23",pri:"low",cat:"Shopping",as:"Self",by:"James",visibility:"private"},
        {t:"Collect repeat prescription",due:"24-May-2026",dueDate:"2026-05-24",pri:"medium",cat:"Health",as:"Self",by:"James",visibility:"private"},
      ],
      month:[
        {t:"Renew gym membership",due:"27-May-2026",dueDate:"2026-05-27",pri:"low",cat:"Personal",as:"Self",by:"James",visibility:"private"},
        {t:"Submit timesheets",due:"30-May-2026",dueDate:"2026-05-30",pri:"medium",cat:"Work",as:"Self",by:"James",visibility:"private"},
        {t:"Service the bike",due:"31-May-2026",dueDate:"2026-05-31",pri:"low",cat:"Personal",as:"Self",by:"James",visibility:"private"},
      ],
      nextmonth:[
        {t:"Sort loft storage",due:"01-Jun-2026",dueDate:"2026-06-01",pri:"low",cat:"Home",as:"Self",by:"James",visibility:"private"},
        {t:"Research school options for Sept",due:"01-Aug-2026",dueDate:"2026-08-01",pri:"medium",cat:"Family",as:"Self",by:"James",visibility:"private"},
        {t:"Plan summer BBQ",due:"01-Jul-2026",dueDate:"2026-07-01",pri:"low",cat:"Social",as:"Self",by:"James",visibility:"private"},
      ],
      recurring:[
        {t:"Weekly meal plan",freq:"Weekly",leadTime:"1d",cat:"Food",as:"Self",by:"James",visibility:"private",nextDue:"2026-05-25"},
        {t:"Monthly budget review",freq:"Monthly",leadTime:"3d",cat:"Finance",as:"Self",by:"James",visibility:"private",nextDue:"2026-06-01"},
        {t:"Quarterly health check-in",freq:"Half Yearly",leadTime:"2w",cat:"Health",as:"Self",by:"James",visibility:"private",nextDue:"2026-11-15"},
        {t:"Annual tax return",freq:"Annual",leadTime:"1mo",cat:"Finance",as:"Self",by:"James",visibility:"private",nextDue:"2027-01-31"},
      ],
    },
    admin: {
      overdue:[
        {t:"Renew car insurance — household",as:"HMG",due:"Yesterday",dueDate:"2026-05-20",pri:"high",cat:"Admin",by:"James",visibility:"hmg"},
      ],
      today:[
        {t:"Approve Mia's school excursion form",as:"HMG",due:"Today",dueDate:"2026-05-21",pri:"medium",cat:"Family",by:"Sarah",visibility:"hmg"},
        {t:"Review mortgage statement",as:"HMG",due:"Today",dueDate:"2026-05-21",pri:"medium",cat:"Finance",by:"James",visibility:"hmg"},
      ],
      week:[
        {t:"Update household emergency contacts",as:"HMG",due:"24-May-2026",dueDate:"2026-05-24",pri:"medium",cat:"Admin",by:"James",visibility:"hmg"},
        {t:"Decide on summer camp for Lily",as:"HMG",due:"25-May-2026",dueDate:"2026-05-25",pri:"medium",cat:"Family",by:"Sarah",visibility:"hmg"},
      ],
      month:[
        {t:"Annual home insurance renewal review",as:"HMG",due:"29-May-2026",dueDate:"2026-05-29",pri:"high",cat:"Finance",by:"James",visibility:"hmg"},
        {t:"Discuss Mia's phone access rules",as:"HMG",due:"31-May-2026",dueDate:"2026-05-31",pri:"low",cat:"Family",by:"Sarah",visibility:"hmg"},
      ],
      nextmonth:[
        {t:"Estate planning conversation",as:"HMG",due:"01-Sep-2026",dueDate:"2026-09-01",pri:"low",cat:"Admin",by:"James",visibility:"hmg"},
      ],
      recurring:[
        {t:"Weekly family briefing",freq:"Weekly",leadTime:"1d",cat:"Family",as:"HMG",by:"James",visibility:"hmg",nextDue:"2026-05-26"},
        {t:"Monthly bills review",freq:"Monthly",leadTime:"3d",cat:"Finance",as:"HMG",by:"Sarah",visibility:"hmg",nextDue:"2026-06-01"},
        {t:"Annual insurance review",freq:"Annual",leadTime:"1mo",cat:"Finance",as:"HMG",by:"James",visibility:"hmg",nextDue:"2027-01-01"},
      ],
    },
    family: {
      overdue:[
        {t:"Pay school trip deposit — Lily",as:"Sarah",due:"2 days ago",dueDate:"2026-05-19",pri:"high",cat:"School",by:"James",visibility:"family"},
        {t:"Chase GP referral — Tom",as:"James",due:"Last week",dueDate:"2026-05-14",pri:"medium",cat:"Health",by:"Sarah",visibility:"family"},
      ],
      today:[
        {t:"Book dentist — Lily + Tom",as:"Sarah",due:"Today",dueDate:"2026-05-21",pri:"high",cat:"Health",by:"James",visibility:"family"},
        {t:"Pick up Lily from ballet",as:"James",due:"Today 4pm",dueDate:"2026-05-21",pri:"high",cat:"Family",by:"James",visibility:"family"},
        {t:"Pack PE kit — Tom",as:"James",due:"Today",dueDate:"2026-05-21",pri:"medium",cat:"School",by:"Sarah",visibility:"family",done:true,doneBy:"James · 8:02am"},
      ],
      week:[
        {t:"New school shoes — Tom",as:"Sarah",due:"25-May-2026",dueDate:"2026-05-25",pri:"medium",cat:"School",by:"James",visibility:"family"},
        {t:"Car service drop-off",as:"James",due:"24-May-2026",dueDate:"2026-05-24",pri:"high",cat:"Home",by:"James",visibility:"family"},
        {t:"Weekly grocery shop",as:"Sarah",due:"22-May-2026",dueDate:"2026-05-22",pri:"medium",cat:"Shopping",by:"Sarah",visibility:"family"},
      ],
      month:[
        {t:"Sports day — pack picnic",as:"Sarah",due:"28-May-2026",dueDate:"2026-05-28",pri:"medium",cat:"School",by:"James",visibility:"family"},
        {t:"Drop Tom's blazer at cleaners",as:"James",due:"29-May-2026",dueDate:"2026-05-29",pri:"low",cat:"Errands",by:"Sarah",visibility:"family"},
      ],
      nextmonth:[
        {t:"Plan summer holiday",as:"Family",due:"01-Jun-2026",dueDate:"2026-06-01",pri:"medium",cat:"Travel",by:"James",visibility:"family"},
        {t:"Renew passports — kids",as:"James",due:"01-Aug-2026",dueDate:"2026-08-01",pri:"high",cat:"Admin",by:"Sarah",visibility:"family"},
        {t:"Book school photos",as:"Sarah",due:"01-Sep-2026",dueDate:"2026-09-01",pri:"low",cat:"School",by:"James",visibility:"family"},
      ],
      recurring:[
        {t:"Weekly grocery shop",freq:"Weekly",leadTime:"1d",cat:"Shopping",as:"Family",by:"Sarah",visibility:"family",nextDue:"2026-05-22"},
        {t:"Fortnightly bin collection",freq:"Every 2 Weeks",leadTime:"1d",cat:"Home",as:"Family",by:"James",visibility:"family",nextDue:"2026-05-28"},
        {t:"Monthly family meeting",freq:"Monthly",leadTime:"2d",cat:"Family",as:"Family",by:"James",visibility:"family",nextDue:"2026-06-01"},
        {t:"School term holiday planning",freq:"Quarterly",leadTime:"7d",cat:"Family",as:"Family",by:"Sarah",visibility:"family",nextDue:"2026-07-01"},
      ],
    },
  });

  const [newTodo, setNewTodo] = useState({});

  const getDefaultDue = key => {
    const d = new Date();
    if (key === "today") return d.toISOString().split("T")[0];
    if (key === "week")  { d.setDate(d.getDate()+1); return d.toISOString().split("T")[0]; }
    if (key === "month") { d.setDate(d.getDate()+10); return d.toISOString().split("T")[0]; }
    if (key === "later") { d.setMonth(d.getMonth()+2);  return d.toISOString().split("T")[0]; }
    if (key === "recurring") { d.setDate(d.getDate()+7); return d.toISOString().split("T")[0]; }
    return d.toISOString().split("T")[0];
  };

  const getDueDisplay = key => {
    if (key === "today") return "Today";
    const d = new Date();
    if (key === "week")  { d.setDate(d.getDate()+1); }
    if (key === "month") { d.setDate(d.getDate()+10); }
    if (key === "later") { d.setMonth(d.getMonth()+2); }
    if (key === "recurring") { d.setDate(d.getDate()+7); }
    return d.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
  };

  const addTodo = (sec, groupKey, title) => {
    if (!title.trim()) return;
    const isRecurring = groupKey === "recurring";
    const baseItem = {
      t:          title.trim(),
      pri:        "medium",
      cat:        "Personal",
      desc:       "",
      visibility: sec === "my" ? "private" : "family",
      as:         sec === "my" ? "Self" : "Family",
    };
    const newItem = isRecurring
      ? {...baseItem, freq:"Weekly", leadTime:"1d", nextDue:getDefaultDue("recurring")}
      : {...baseItem, due:getDueDisplay(groupKey), dueDate:getDefaultDue(groupKey)};
    setTodoData(d => ({...d, [sec]: {...d[sec], [groupKey]: [...d[sec][groupKey], newItem]}}));
    setNewTodo(n => ({...n, [`${sec}-${groupKey}`]: ""}));
  };

  const deleteTodo = (sec, groupKey, idx) => {
    setTodoData(d => ({...d, [sec]: {...d[sec], [groupKey]: d[sec][groupKey].filter((_,i)=>i!==idx)}}));
  };

  // Format an ISO date into the friendly "due" label shown on task rows
  /* Format ISO date → dd-Mon-yyyy (e.g. "22-May-2026").
     Relative labels for Today / Tomorrow / Yesterday / overdue. */
  const fmtDate = iso => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-GB", {day:"2-digit", month:"short", year:"numeric"}).replace(/ /g, "-");
  };
  const fmtDueDisplay = iso => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    const today = new Date(); today.setHours(0,0,0,0);
    const diff = Math.round((d - today) / 86400000);
    if (diff === 0)  return "Today";
    if (diff === 1)  return "Tomorrow";
    if (diff === -1) return "Yesterday";
    if (diff < 0)   return `${-diff} days ago`;
    return fmtDate(iso);
  };

  const saveTask = () => {
    if (modal?._isNew) {
      const sec = todoSec==="my"?"my":todoSec==="admin"?"admin":"family";
      const today = new Date(); today.setHours(0,0,0,0);
      const d = mForm.dueDate ? new Date(mForm.dueDate+"T00:00:00") : today;
      const diff = Math.round((d-today)/86400000);
      const key = mForm.dueDate
        ? (diff<0?"overdue":diff===0?"today":diff<=7?"week":diff<=31?"month":"nextmonth")
        : "today";
      const currentUser = MEMBERS_AC.find(m => m.you)?.name || "James";
      const newItem = {
        t: mForm.title.trim()||"Untitled task", desc: mForm.desc,
        cat: mForm.category,
        due: fmtDueDisplay(mForm.dueDate), dueDate: mForm.dueDate,
        as: mForm.for, visibility: mForm.visibility,
        by: currentUser,
      };
      setTodoData(data => ({...data, [sec]:{...data[sec],[key]:[...(data[sec][key]||[]), newItem]}}));
      closeModal();
      return;
    }
    if (!modal?._sec || modal?._gk == null || modal?._idx == null) { closeModal(); return; }
    const { _sec, _gk, _idx } = modal;
    setTodoData(d => {
      const items = d[_sec][_gk].map((it,i) => i===_idx ? {
        ...it,
        t:          mForm.title,
        desc:       mForm.desc,
        dueDate:    mForm.dueDate,
        due:        fmtDueDisplay(mForm.dueDate),
        as:         mForm.for,
        visibility: mForm.visibility,
        cat:        mForm.category,
      } : it);
      return {...d, [_sec]: {...d[_sec], [_gk]: items}};
    });
    closeModal();
  };

  const saveRoutine = () => {
    const currentUser = MEMBERS_AC.find(m => m.you)?.name || "James";
    if (modal?._isNew) {
      const sec = modal._sec || (routinesSec === "all" ? "family"
        : routinesSec === "own" ? "my"
        : routinesSec === "hmg" ? "admin" : "family");
      const newRoutine = {
        t:        mForm.title.trim() || "Untitled routine",
        desc:     mForm.desc,
        freq:     mForm.freq || "Weekly",
        leadTime: mForm.leadTime || "1d",
        nextDue:  mForm.dueDate || "",
        as:       mForm.for || "Family",
        by:       currentUser,
        cat:      mForm.category,
        visibility: mForm.visibility || "family",
      };
      setTodoData(d => ({...d, [sec]: {...d[sec], recurring: [...(d[sec].recurring || []), newRoutine]}}));
      closeModal();
      return;
    }
    if (!modal?._sec || modal?._idx == null) { closeModal(); return; }
    const { _sec, _idx } = modal;
    setTodoData(d => {
      const updated = d[_sec].recurring.map((it,i) => i===_idx ? {
        ...it,
        t:        mForm.title,
        desc:     mForm.desc,
        freq:     mForm.freq,
        leadTime: mForm.leadTime,
        nextDue:  mForm.dueDate,
        as:       mForm.for || it.as,
        cat:      mForm.category,
        visibility: mForm.visibility || it.visibility,
      } : it);
      return {...d, [_sec]: {...d[_sec], recurring: updated}};
    });
    closeModal();
  };

  const toggleTodo = (sec, groupKey, idx) => {
    const currentUser = MEMBERS_AC.find(m => m.you)?.name || "James";
    const timeStr = new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
    setTodoData(d => {
      const items = d[sec][groupKey].map((item,i) => {
        if (i !== idx) return item;
        const done = !item.done;
        return {...item, done, doneBy: done ? currentUser : undefined, doneAt: done ? timeStr : undefined};
      });
      return {...d, [sec]: {...d[sec], [groupKey]: items}};
    });
  };

  const fmtReminderDate = iso => {
    if(!iso) return "";
    const d = new Date(iso+"T00:00:00");
    return d.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
  };

  /* ── DOCUMENTS DATA ────────────────────── */
  const DOC_DATA = {
    my: {
      identity:[
        {ic:"🛂",n:"Passport — James Smith",exp:"Apr 2029",ok:true},
        {ic:"🪪",n:"Driving Licence",exp:"Jun 2030",ok:true},
        {ic:"🌍",n:"National Insurance card",exp:"No expiry",ok:true},
      ],
      insurance:[
        {ic:"🚗",n:"Car insurance — Ford Focus",exp:"Aug 2025",ok:true},
        {ic:"🛡️",n:"Life insurance policy",exp:"Ongoing",ok:true},
        {ic:"🏥",n:"Private health — BUPA",exp:"Mar 2026",ok:true},
      ],
      finance:[
        {ic:"📊",n:"P60 2023/24",exp:"N/A",ok:true},
        {ic:"🧾",n:"Self-assessment 2023",exp:"N/A",ok:true},
      ],
      home:[
        {ic:"🏠",n:"Mortgage statement 2024",exp:"N/A",ok:true},
        {ic:"⚡",n:"Energy contract",exp:"Oct 2025",ok:true},
      ],
      others:[
        {ic:"📄",n:"GP referral letter",exp:"Jun 2025",ok:true},
      ],
    },
    family: {
      identity:[
        {ic:"🛂",n:"Passport — Sarah Smith",exp:"Jan 2026",ok:false,warn:"Expires soon"},
        {ic:"🛂",n:"Passport — Lily Smith",exp:"Sep 2027",ok:true},
        {ic:"🛂",n:"Passport — Tom Smith",exp:"May 2025",ok:false,warn:"Expired"},
      ],
      insurance:[
        {ic:"🏠",n:"Home contents insurance",exp:"Nov 2025",ok:true},
        {ic:"🐾",n:"Pet insurance — Buddy",exp:"Feb 2026",ok:true},
      ],
      finance:[
        {ic:"🏦",n:"Joint account statements Q1",exp:"N/A",ok:true},
        {ic:"🧾",n:"Council tax 2024/25",exp:"N/A",ok:true},
      ],
      home:[
        {ic:"🔥",n:"Boiler service certificate",exp:"Nov 2025",ok:true},
        {ic:"⚡",n:"Electrical safety cert",exp:"2026",ok:true},
      ],
      others:[
        {ic:"📝",n:"School letters — Lily",exp:"N/A",ok:true},
        {ic:"📝",n:"School letters — Tom",exp:"N/A",ok:true},
      ],
    },
  };
  const DOC_CATS = [["identity","Identity & Travel"],["insurance","Insurance"],["finance","Finance"],["home","Home & Property"],["others","Others"]];

  /* ── NOTES DATA ────────────────────────── */
  // Six categories. Each note: id, cat, title (t), freeform plain-text body, updated date.
  // body:"" = pre-populated default not yet filled in — renders as "Add details →" prompt.
  // Family/admin notes carry an `author` (member id) shown as an avatar on the row.
  const NOTES_INITIAL = {
    my: [
      // Security & Access — personal (alarm codes, safe, keys)
      {id:"m1", cat:"security", t:"Home alarm code",          body:"8124 — disarms both zones. Test button is bottom-right of the keypad.", updated:"14 Jan 25"},
      {id:"m2", cat:"security", t:"Safe combination",         body:"04 – 18 – 22",   updated:"02 Feb 24"},
      {id:"m3", cat:"security", t:"Spare key location",       body:"Magnetic box, underside of the bench on the back deck (left support beam).", updated:"06 Sep 24"},
      {id:"m4", cat:"security", t:"Front gate / door code",   body:"",               updated:""},
      {id:"m5", cat:"security", t:"Key safe code",            body:"",               updated:""},
    ],
    admin: [
      // Security & Access — HMG sensitive
      {id:"a1", cat:"security", t:"Emergency cash location",  body:"£200 in the fireproof safe, top drawer, left compartment. Restock if it dips below £100.", updated:"02 Feb 25", author:"james"},
      // Legal & Wills — HMG sensitive
      {id:"a2", cat:"legal",    t:"Will location",            body:"Filed with Jones & Partners (May 2023). Copy in the fireproof safe, top shelf.", updated:"14 May 23", author:"james"},
      {id:"a3", cat:"legal",    t:"Executor details",         body:"",               updated:"", author:"james"},
      {id:"a4", cat:"legal",    t:"Power of attorney",        body:"",               updated:"", author:"james"},
      {id:"a5", cat:"legal",    t:"Solicitor",                body:"Jones & Partners — Mike Jones, 01234 111 222. mike@jones-partners.co.uk", updated:"18 May 24", author:"james"},
    ],
    family: [
      // Appliances — mix of filled (showing what it looks like) and empty (prompts to fill)
      {id:"f1", cat:"appliances", t:"Boiler",                 body:"Worcester Bosch Greenstar 30i.\nInstalled Nov 2020. Serviced by Dyno-Rod (01234 567 890). Warranty until Nov 2030.", updated:"14 Nov 24", author:"james"},
      {id:"f2", cat:"appliances", t:"Washing machine",        body:"Bosch WAU284 — 9 kg drum.\nWool/silks: gentle cycle. Filter behind kick-plate, clean every 2 months.", updated:"14 Nov 24", author:"sarah"},
      {id:"f3", cat:"appliances", t:"Dishwasher",             body:"Tablets under the sink. Add salt when indicator is amber (~every 6 weeks).", updated:"18 Mar 25", author:"sarah"},
      {id:"f4", cat:"appliances", t:"Fridge / freezer",       body:"",               updated:"", author:"james"},
      {id:"f5", cat:"appliances", t:"Tumble dryer",           body:"",               updated:"", author:"james"},
      {id:"f6", cat:"appliances", t:"Oven / hob",             body:"",               updated:"", author:"james"},
      // Utilities & Networks — mix of filled and empty
      {id:"f7",  cat:"utilities", t:"Electricity supplier",   body:"Octopus Energy — account OE-12345. Dual fuel, Agile tariff. Login: family@email.com", updated:"02 Mar 25", author:"james"},
      {id:"f8",  cat:"utilities", t:"Gas supplier",           body:"",               updated:"", author:"james"},
      {id:"f9",  cat:"utilities", t:"Water supplier",         body:"",               updated:"", author:"james"},
      {id:"f10", cat:"utilities", t:"Broadband provider",     body:"",               updated:"", author:"james"},
      {id:"f11", cat:"utilities", t:"Wi-Fi password",         body:"SmithHouse-2024!", updated:"12 Mar 25", author:"james"},
      {id:"f12", cat:"utilities", t:"Router admin",           body:"192.168.1.1 · user: admin · pass: lila-router-91", updated:"18 Feb 25", author:"james"},
      {id:"f13", cat:"utilities", t:"Bin collection",         body:"Black bin — weekly Tuesday morning.\nGreen & blue — alternating Tuesdays (next blue: 27 May).", updated:"02 Apr 25", author:"james"},
      // Key Contacts — residual contacts with no module home
      {id:"f14", cat:"contacts",  t:"School",                 body:"Larkfield Primary — 01234 888 999. Office open 8:15–16:00.", updated:"02 Sep 24", author:"james"},
      {id:"f15", cat:"contacts",  t:"Trusted neighbour / key holder", body:"",      updated:"", author:"james"},
      {id:"f16", cat:"contacts",  t:"Cleaner",                body:"",               updated:"", author:"james"},
      {id:"f17", cat:"contacts",  t:"Gardener",               body:"",               updated:"", author:"james"},
      {id:"f18", cat:"contacts",  t:"Council / local authority", body:"",            updated:"", author:"james"},
    ],
  };
  const NOTES_CATS = [
    ["security",   "🔐 Security & Access"],
    ["appliances", "🔧 Appliances"],
    ["utilities",  "📡 Utilities & Networks"],
    ["contacts",   "📇 Key Contacts"],
    ["legal",      "⚖️ Legal & Wills"],
    ["others",     "📦 Others"],
  ];

  // Mutable copy of NOTES_INITIAL so add / edit / delete actually persist while the demo is open.
  const [notesData, setNotesData] = useState(NOTES_INITIAL);

  // Add-note modal state. noteModal: null | {mode:"new", sec, cat} | {mode:"edit", sec, id}
  const [noteModal, setNoteModal] = useState(null);
  const [noteForm,  setNoteForm]  = useState({t:"", body:"", cat:"security", sec:"my"});

  const noteDateNow = () => new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"2-digit"});

  const openNewNote = (sec, cat) => {
    setNoteForm({t:"", body:"", cat: cat || "security", sec,
      for: sec==="my" ? "james" : sec==="admin" ? "hmg" : "family"});
    setNoteModal({mode:"new", sec, cat});
  };
  const openEditNote = (sec, note) => {
    setNoteForm({t: note.t, body: note.body, cat: note.cat, sec,
      for: note.for || (sec==="my" ? "james" : sec==="admin" ? "hmg" : "family")});
    setNoteModal({mode:"edit", sec, id: note.id});
  };
  const closeNoteModal = () => setNoteModal(null);
  const saveNote = () => {
    if (!noteForm.t.trim()) return;
    const {mode, sec: originSec, id} = noteModal;
    const targetSec = noteForm.sec;
    const baseFields = {
      t: noteForm.t.trim(),
      body: noteForm.body,
      cat: noteForm.cat,
      for: noteForm.for,
      updated: noteDateNow(),
    };

    if (mode === "new") {
      const newNote = {
        id: `n${Date.now()}`,
        ...baseFields,
        ...((targetSec === "family" || targetSec === "admin") ? {author:"james"} : {}),
      };
      setNotesData(d => ({...d, [targetSec]: [...d[targetSec], newNote]}));
      if (notesSec !== targetSec) setNotesSec(targetSec);
    } else if (originSec === targetSec) {
      // Edit, same section — update in place.
      setNotesData(d => ({...d,
        [originSec]: d[originSec].map(n => n.id === id ? {...n, ...baseFields} : n)}));
    } else {
      // Edit, section changed — move the note across.
      setNotesData(d => {
        const moving = d[originSec].find(n => n.id === id);
        if (!moving) return d;
        const moved = {...moving, ...baseFields,
          ...((targetSec === "family" || targetSec === "admin") ? {author: moving.author || "james"} : {})};
        if (targetSec === "my") delete moved.author;
        return {
          ...d,
          [originSec]: d[originSec].filter(n => n.id !== id),
          [targetSec]: [...d[targetSec], moved],
        };
      });
      if (notesSec !== targetSec) setNotesSec(targetSec);
    }
    // Auto-expand the (possibly new) category so the change is visible.
    setOpen(o => ({...o, [`notes-${targetSec}-${noteForm.cat}`]: true}));
    setNoteModal(null);
  };

  const deleteNote = (id, sec) => {
    setNotesData(d => ({...d, [sec]: d[sec].filter(n => n.id !== id)}));
    setNoteExp(p => { const next = {...p}; delete next[id]; return next; });
  };

  const views = {
    "Tasks": (
      /* ── MAIN TASK VIEW ── */
      <div>
        {/* ── Header: Add Task + Key Dates shortcut ── */}
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginBottom:12}}>
          <button onClick={()=>setTab("Key Dates")}
            className="btn-sm"
            style={{display:"flex",alignItems:"center",gap:4,fontSize:11,padding:"5px 11px",
              color:T.teal,borderColor:T.teal+"55",background:T.teal+"11"}}>
            <span>📅</span>
            <span style={{fontWeight:600}}>Key Dates</span>
            <span style={{fontSize:10,color:T.textS,fontWeight:400}}>→</span>
          </button>
          <button
            onClick={()=>{
              setModal({_isNew:true});
              setMForm({title:"",desc:"",type:"one-off",dueDate:"",
                for: "Family",
                visibility: "family",
                category:"Personal"});
            }}
            className="btn-sm btn-warm"
            style={{fontSize:12,padding:"5px 14px",fontWeight:600}}>
            + Add Task
          </button>
        </div>

        {/* ── Show For picker ── */}
        <ForPicker inline
          value={todoSec==="my"?"own":todoSec==="admin"?"hmg":todoSec==="all"?"all":"family"}
          onChange={v=>{ setTodoSec(v==="own"?"my":v==="hmg"?"admin":v==="all"?"all":"family"); setCatFilter("All"); setShowRoutines(false); }}
          options={LA_IS_HMG ? ["own","hmg","family","all"] : ["own","family","all"]}
          showCaption={false}
        />

        {/* ── Category filter pills ── */}
        {(()=>{
          const allGroups = Object.entries(todoData[todoSec] || {})
            .filter(([k]) => k !== "recurring")
            .flatMap(([,v]) => v);
          const countMap = {};
          allGroups.forEach(item=>{ if(item.cat) countMap[item.cat]=(countMap[item.cat]||0)+1; });
          const cats = Object.keys(countMap).sort();
          const total = allGroups.length;
          return (
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
              {[["All",total],...cats.map(c=>[c,countMap[c]])].map(([c,n])=>(
                <span key={c} onClick={()=>setCatFilter(c)}
                  style={{display:"flex",alignItems:"center",gap:4,fontSize:10,padding:"3px 8px",
                    borderRadius:20,cursor:"pointer",userSelect:"none",
                    border:`1px solid ${catFilter===c?T.sky:T.border}`,
                    background:catFilter===c?T.sky+"22":T.card2,
                    color:catFilter===c?T.sky:T.textS,
                    fontWeight:catFilter===c?600:400}}>
                  {c}
                  <span style={{fontSize:9,color:catFilter===c?T.sky:T.textS}}>{n}</span>
                </span>
              ))}
            </div>
          );
        })()}
        {/* ── Groups ── */}
        {(()=>{
          /* Shared row renderer:
             LEFT  (flex:1) — line 1: title | line 2: For · By · Done by + time
             RIGHT (fixed)  — due date | separator | category badge
             Right column is always visible regardless of container width. */
          const TaskRowItem = ({item, groupKey, itemSec, realIdx}) => {
            const isOverdue = groupKey === "overdue";
            const isToday   = groupKey === "today";
            const showFor   = item.as && item.as !== "Self" && item.as !== "HMG";
            const hasLine2  = showFor || item.by || (item.done && item.doneBy);
            const lbl = {fontSize:10,color:T.textM,textTransform:"uppercase",letterSpacing:".04em",marginRight:2};
            const sep = <div style={{width:1,height:12,background:T.border,flexShrink:0}}/>;
            return (
              <div
                onClick={()=>openModal({...item, _sec:itemSec, _gk:groupKey, _idx:realIdx})}
                style={{display:"flex",alignItems:"center",gap:8,
                  padding:"8px 12px",
                  borderBottom:`1px solid ${T.border}`,cursor:"pointer",
                  background: isToday && !item.done ? T.warmG : "transparent",
                  opacity: item.done ? 0.45 : 1}}>
                {/* Tick */}
                <div onClick={e=>{e.stopPropagation();toggleTodo(itemSec,groupKey,realIdx);}}
                  style={{width:14,height:14,borderRadius:3,flexShrink:0,cursor:"pointer",alignSelf:"flex-start",marginTop:2,
                    border:`1.5px solid ${item.done?T.teal:isOverdue?T.rose:T.border}`,
                    background:item.done?T.teal:"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                  {item.done && <span style={{fontSize:9,color:"#fff",fontWeight:700,lineHeight:1}}>✓</span>}
                </div>
                {/* LEFT: title (line 1) + secondary info (line 2) */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,color:T.text,
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                    textDecoration:item.done?"line-through":"none"}}>
                    {item.t}
                  </div>
                  {hasLine2 && (
                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
                      {showFor && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={lbl}>For</span>{item.as}</span>}
                      {item.by  && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={lbl}>By</span>{item.by}</span>}
                      {item.done && item.doneBy && (
                        <span style={{fontSize:11,color:T.teal,whiteSpace:"nowrap"}}>
                          <span style={{...lbl,color:T.teal}}>Done</span>{item.doneBy}
                          {item.doneAt && <span style={{color:T.textM,marginLeft:4}}>· {item.doneAt}</span>}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {/* RIGHT: due | category — fixed, always visible */}
                <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                  {item.due && (
                    <span style={{fontSize:11,whiteSpace:"nowrap",
                      color:isOverdue?T.rose:isToday?T.warm:T.textS,
                      fontWeight:isToday?500:400}}>
                      {item.due}
                    </span>
                  )}
                  {item.due && item.cat && sep}
                  {item.cat && <span style={{...badge(T.skyS,T.sky)}}>{item.cat}</span>}
                </div>
              </div>
            );
          };

          /* Active groups — only undone items */
          const activeGroups = [
            ["overdue",   "Overdue",    T.rose],
            ["today",     "Today",      T.warm],
            ["week",      "This Week",  T.teal],
            ["month",     "This Month", T.sage],
            ["nextmonth", "Next Month", T.violet],
          ].map(([key, label, accent]) => {
            const gk = `todo-${todoSec}-${key}`;
            const allItems = todoSec === "all"
              ? ["my","admin","family"].flatMap(s => (todoData[s]?.[key] || []).map((it,idx) => ({...it, _origin:s, _origIdx:idx})))
              : (todoData[todoSec]?.[key] || []).map((it,idx) => ({...it, _origin:todoSec, _origIdx:idx}));
            const filtered = (catFilter==="All" ? allItems : allItems.filter(it=>it.cat===catFilter))
              .filter(it => !it.done);
            if (filtered.length === 0) return null;
            return (
              <GroupHeader key={key} id={gk} label={label} count={filtered.length} accent={accent}
                open={isOpen(gk)} onToggle={()=>tog(gk)}>
                {filtered.map((item, i) => (
                  <React.Fragment key={i}>
                    {TaskRowItem({item, groupKey:key, itemSec:item._origin, realIdx:item._origIdx})}
                  </React.Fragment>
                ))}
              </GroupHeader>
            );
          });

          /* Completed group — all done items across all active groups */
          const allDoneItems = [
            "overdue","today","week","month","nextmonth",
          ].flatMap(key => {
            const src = todoSec === "all"
              ? ["my","admin","family"].flatMap(s => (todoData[s]?.[key] || []).map((it,idx) => ({...it, _origin:s, _origIdx:idx, _gk:key})))
              : (todoData[todoSec]?.[key] || []).map((it,idx) => ({...it, _origin:todoSec, _origIdx:idx, _gk:key}));
            return src.filter(it => it.done);
          });
          const doneFiltered = catFilter==="All" ? allDoneItems : allDoneItems.filter(it=>it.cat===catFilter);
          const completedGk = `todo-${todoSec}-completed`;
          const completedGroup = doneFiltered.length > 0 ? (
            <GroupHeader key="completed" id={completedGk} label="Completed" count={doneFiltered.length}
              open={isOpen(completedGk)} onToggle={()=>tog(completedGk)}>
              {doneFiltered.map((item, i) => (
                <React.Fragment key={i}>
                  {TaskRowItem({item, groupKey:item._gk, itemSec:item._origin, realIdx:item._origIdx})}
                </React.Fragment>
              ))}
            </GroupHeader>
          ) : null;

          return [...activeGroups, completedGroup];
        })()}

        <div style={{marginTop:12,padding:"10px 12px",borderRadius:9,background:T.tealS,border:`1px solid ${T.teal}33`,fontSize:12.5,color:T.textS,lineHeight:1.6}}>
          <strong style={{color:T.teal}}>🤖 MyPal AI:</strong> You have 3 overdue tasks and Maya's school trip form is due today. Want me to add a reminder and draft the reply to Mrs Patel?
          <span style={{marginLeft:10,color:T.teal,fontWeight:600,cursor:"pointer"}}>Do it →</span>
        </div>
      </div>
    ),

    "Key Dates": (()=>{
      // ── Status constants ──
      const KD_STATUS = {
        overdue:   {label:"Overdue",    bg:T.roseS,  color:T.rose},
        "due-soon":{label:"Due soon",   bg:T.amberS, color:T.amber},
        ok:        {label:"Up to date", bg:T.sageS,  color:T.sage},
        "in-prog": {label:"In progress",bg:T.tealS,  color:T.teal},
        note:      {label:null,         bg:T.card2,  color:T.textS},
      };

      // ── Module groups config ──
      const KD_MODS = [
        {key:"home",   label:"🏠 Home",    accent:T.teal,  goModule:()=>{setTab("Cars & Home");setCarTab("Home");}},
        {key:"cars",   label:"🚗 Cars",    accent:T.amber, goModule:()=>{setTab("Cars & Home");setCarTab("Cars");}},
        {key:"pet",    label:"🐾 Pet Care",accent:T.lime,  goModule:()=>setTab("Pet Care")},
        {key:"health", label:"🩺 Health",  accent:T.rose,  goModule:null}, // top-level nav — no in-prototype navigation
      ];

      // ── Static aggregated Key Dates data ──
      const KD_DATA = {
        home: [
          {id:"hkd1-ins",  assetName:"12 Oak Lane",    label:"Home insurance renewal",     date:"10-Apr-2026", status:"due-soon", icon:"🔒", freq:"Yearly",    assignedTo:"Sarah",  createdBy:"James", hasInstance:true},
          {id:"hkd1-mort", assetName:"12 Oak Lane",    label:"Mortgage deal expiry",       date:"01-Apr-2026", status:"overdue",  icon:"🏦", freq:null,         assignedTo:"Sarah",  createdBy:"James", hasInstance:false},
          {id:"hkd1-boil", assetName:"12 Oak Lane",    label:"Boiler annual service",      date:"01-Nov-2025", status:"overdue",  icon:"🔥", freq:"Yearly",    assignedTo:"Family", createdBy:"James", hasInstance:false},
          {id:"hkd1-gas",  assetName:"12 Oak Lane",    label:"Gas safety certificate",     date:"15-Nov-2025", status:"overdue",  icon:"🔍", freq:"Yearly",    assignedTo:"Sarah",  createdBy:"James", hasInstance:false},
          {id:"hkd1-epc",  assetName:"12 Oak Lane",    label:"EPC certificate expiry",     date:"2032",        status:"ok",       icon:"⚡", freq:null,         assignedTo:"Family", createdBy:"James", hasInstance:false},
          {id:"hkd2-lins", assetName:"8 Harbour View", label:"Landlord insurance renewal", date:"10-Jun-2026", status:"ok",       icon:"🔒", freq:"Yearly",    assignedTo:"James",  createdBy:"James", hasInstance:false},
          {id:"hkd2-gas",  assetName:"8 Harbour View", label:"Gas safety certificate",     date:"01-Feb-2026", status:"overdue",  icon:"🔍", freq:"Yearly",    assignedTo:"James",  createdBy:"James", hasInstance:false},
          {id:"hkd3-ten",  assetName:"3 Maple Close",  label:"Tenancy renewal",            date:"28-Feb-2026", status:"due-soon", icon:"📋", freq:"Yearly",    assignedTo:"James",  createdBy:"James", hasInstance:false},
        ],
        cars: [
          {id:"ckd1-mot",  assetName:"Honda Civic",   label:"MOT",                date:"15-Jun-2026", status:"ok",       icon:"✅", freq:"Yearly",    assignedTo:"James",  createdBy:"James", hasInstance:false},
          {id:"ckd1-ins",  assetName:"Honda Civic",   label:"Insurance renewal",  date:"01-Aug-2026", status:"due-soon", icon:"🔒", freq:"Yearly",    assignedTo:"James",  createdBy:"James", hasInstance:false},
          {id:"ckd1-svc",  assetName:"Honda Civic",   label:"Annual service",     date:"01-Sep-2026", status:"ok",       icon:"🔧", freq:"Yearly",    assignedTo:"James",  createdBy:"James", hasInstance:false},
          {id:"ckd2-mot",  assetName:"VW Touran",     label:"MOT",                date:"01-Jun-2026", status:"ok",       icon:"✅", freq:"Yearly",    assignedTo:"Sarah",  createdBy:"Sarah", hasInstance:false},
          {id:"ckd2-ins",  assetName:"VW Touran",     label:"Insurance renewal",  date:"15-Jul-2026", status:"ok",       icon:"🔒", freq:"Yearly",    assignedTo:"Sarah",  createdBy:"Sarah", hasInstance:false},
        ],
        pet: [
          {id:"pkd1-boost",assetName:"Buddy",     label:"Annual booster",         date:"01-Apr-2027", status:"ok",       icon:"💉", freq:"Yearly",    assignedTo:"Family", createdBy:"James", hasInstance:false},
          {id:"pkd1-flea", assetName:"Buddy",     label:"Flea treatment",         date:"01-May-2025", status:"due-soon", icon:"🐛", freq:"Monthly",   assignedTo:"James",  createdBy:"James", hasInstance:false},
          {id:"pkd1-ins",  assetName:"Buddy",     label:"Pet insurance renewal",  date:"01-Mar-2026", status:"ok",       icon:"🛡️", freq:"Yearly",    assignedTo:"James",  createdBy:"James", hasInstance:false},
          {id:"pkd2-boost",assetName:"Whiskers",  label:"Annual booster",         date:"15-Aug-2026", status:"ok",       icon:"💉", freq:"Yearly",    assignedTo:"Family", createdBy:"Sarah", hasInstance:false},
          {id:"pkd2-ins",  assetName:"Whiskers",  label:"Pet insurance renewal",  date:"01-Sep-2026", status:"ok",       icon:"🛡️", freq:"Yearly",    assignedTo:"Sarah",  createdBy:"Sarah", hasInstance:false},
        ],
        health: [
          {id:"hth1", assetName:"James",  label:"Annual health check",  date:"01-Mar-2027", status:"ok",       icon:"🩺", freq:"Yearly",       assignedTo:"James",  createdBy:"James", hasInstance:false},
          {id:"hth2", assetName:"Sarah",  label:"Dental check",         date:"01-Jun-2026", status:"due-soon", icon:"🦷", freq:"Half Yearly",  assignedTo:"Sarah",  createdBy:"James", hasInstance:false},
          {id:"hth3", assetName:"Lily",   label:"Dental check",         date:"01-Jun-2026", status:"due-soon", icon:"🦷", freq:"Half Yearly",  assignedTo:"Lily",   createdBy:"James", hasInstance:false},
        ],
      };

      // ── Others routines ──
      const OTHERS_INITIAL_KD = [
        {id:"oth1", label:"Monthly budget review",        freq:"Monthly",       nextDue:"01-Jun-2026", status:"ok",  assignedTo:"James",  createdBy:"James"},
        {id:"oth2", label:"Annual tax return",            freq:"Yearly",        nextDue:"31-Jan-2027", status:"ok",  assignedTo:"James",  createdBy:"James"},
        {id:"oth3", label:"Weekly family briefing",       freq:"Weekly",        nextDue:"26-May-2026", status:"ok",  assignedTo:"HMG",    createdBy:"James"},
        {id:"oth4", label:"Monthly bills review",         freq:"Monthly",       nextDue:"01-Jun-2026", status:"ok",  assignedTo:"HMG",    createdBy:"Sarah"},
        {id:"oth5", label:"Fortnightly bin collection",   freq:"Every 2 Weeks", nextDue:"28-May-2026", status:"ok",  assignedTo:"Family", createdBy:"James"},
        {id:"oth6", label:"Monthly family meeting",       freq:"Monthly",       nextDue:"01-Jun-2026", status:"ok",  assignedTo:"Family", createdBy:"James"},
        {id:"oth7", label:"School term holiday planning", freq:"Quarterly",     nextDue:"01-Jul-2026", status:"ok",  assignedTo:"Family", createdBy:"Sarah"},
      ];
      const OTHERS = othersRoutinesState ?? OTHERS_INITIAL_KD;

      // ── Shared row helpers ──
      const kdLbl = {fontSize:10,color:T.textM,textTransform:"uppercase",letterSpacing:".04em",marginRight:2};
      const kdSep = <div style={{width:1,height:12,background:T.border,flexShrink:0}}/>;
      const chip  = kdChip;

      // ── Filter chips ──
      const KD_CHIPS = [
        {key:"all",    label:"All"},
        {key:"home",   label:"🏠 Home"},
        {key:"cars",   label:"🚗 Cars"},
        {key:"pet",    label:"🐾 Pet Care"},
        {key:"health", label:"🩺 Health"},
        {key:"others", label:"📦 Others"},
      ];

      return (
        <div>
          {/* ForPicker */}
          <ForPicker inline
            value={kdScope==="my"?"own":kdScope==="admin"?"hmg":kdScope==="all"?"all":"family"}
            onChange={v=>setKdScope(v==="own"?"my":v==="hmg"?"admin":v==="all"?"all":"family")}
            options={LA_IS_HMG ? ["own","hmg","family","all"] : ["own","family","all"]}
            showCaption={false}
          />

          {/* Module filter chips */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14,marginTop:10}}>
            {KD_CHIPS.map(c=>{
              const active = chip===c.key;
              return (
                <button key={c.key} onClick={()=>setKdChip(c.key)}
                  style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,
                    cursor:"pointer",fontFamily:"inherit",
                    border:`1px solid ${active?T.teal:T.border}`,
                    background:active?T.teal:"transparent",
                    color:active?"#fff":T.textS,transition:"all .12s"}}>
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* ── Module GroupHeaders (read-only) ── */}
          {KD_MODS.map(mod=>{
            if(chip!=="all" && chip!==mod.key) return null;
            const rows = KD_DATA[mod.key] || [];
            const gkId = `kd-${mod.key}`;
            return (
              <GroupHeader key={mod.key} id={gkId} label={mod.label} count={rows.length} accent={mod.accent}
                open={isOpen(gkId)} onToggle={()=>tog(gkId)}>
                <div style={{background:T.card,border:`1px solid ${mod.accent}88`,borderTop:"none",borderRadius:"0 0 8px 8px",marginBottom:10,overflow:"hidden"}}>
                  {rows.map((kd,i,arr)=>{
                    const st = KD_STATUS[kd.status] || KD_STATUS.note;
                    const dateColor = kd.status==="overdue"?T.rose:kd.status==="due-soon"?T.amber:T.textS;
                    return (
                      <div key={kd.id}
                        onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                        style={{display:"flex",flexWrap:"wrap",alignItems:"flex-start",gap:8,
                          padding:"8px 12px",background:"transparent",
                          borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                        {/* DataRow left */}
                        <div style={{display:"flex",flex:"1 1 160px",minWidth:0,gap:8,alignItems:"flex-start"}}>
                          <div style={{width:20,height:20,borderRadius:5,background:mod.accent+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,marginTop:2}}>
                            {kd.icon}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{kd.label}</div>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
                              {kd.assetName && <span style={{fontSize:9.5,fontWeight:700,color:mod.accent,textTransform:"uppercase",letterSpacing:".05em",padding:"1px 5px",borderRadius:4,background:mod.accent+"18",flexShrink:0}}>{kd.assetName}</span>}
                              {kd.assignedTo && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kdLbl}>For</span>{kd.assignedTo}</span>}
                              {kd.createdBy  && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kdLbl}>By</span>{kd.createdBy}</span>}
                            </div>
                          </div>
                        </div>
                        {/* DataRow right */}
                        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                          {kd.freq && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{kd.freq}</span>}
                          {kd.freq && kd.date && kdSep}
                          {kd.date && <span style={{fontSize:11,whiteSpace:"nowrap",color:dateColor}}>{kd.date}</span>}
                          {kd.date && kdSep}
                          {st.label && <span style={{...badge(st.bg,st.color)}}>{st.label}</span>}
                          {kd.hasInstance && kdSep}
                          {kd.hasInstance && <button className="btn-sm" style={{fontSize:9.5,color:T.teal,borderColor:T.teal+"55",whiteSpace:"nowrap"}} onClick={()=>setTab("Tasks")}>View in Tasks →</button>}
                        </div>
                      </div>
                    );
                  })}
                  {/* Read-only footer with Manage link */}
                  <div style={{padding:"8px 12px",borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,color:T.textM,fontStyle:"italic",flexShrink:0}}>🔒 Read only —</span>
                    {mod.goModule ? (
                      <button className="btn-sm" style={{fontSize:11,color:mod.accent,borderColor:mod.accent+"55"}}
                        onClick={()=>mod.goModule()}>
                        Manage in {mod.label.replace(/^[^\w\s]*\s*/,"")} →
                      </button>
                    ) : (
                      <span style={{fontSize:11,color:T.textS}}>Go to Health in the top nav to manage →</span>
                    )}
                  </div>
                </div>
              </GroupHeader>
            );
          })}

          {/* ── Others GroupHeader (full CRUD) ── */}
          {(chip==="all"||chip==="others") && (
            <GroupHeader id="kd-others" label="📦 Others" count={OTHERS.length} accent={T.violet}
              open={isOpen("kd-others")} onToggle={()=>tog("kd-others")}>
              <div style={{background:T.card,border:`1px solid ${T.violet}88`,borderTop:"none",borderRadius:"0 0 8px 8px",marginBottom:10,overflow:"hidden"}}>
                {OTHERS.length===0 && (
                  <div style={{padding:"14px 12px",fontSize:12,color:T.textS,fontStyle:"italic"}}>
                    No household routines yet. Add one below.
                  </div>
                )}
                {OTHERS.map((r,i,arr)=>(
                  <div key={r.id}
                    onClick={()=>setOthersEditItem({...r})}
                    onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    style={{display:"flex",flexWrap:"wrap",alignItems:"flex-start",gap:8,
                      padding:"8px 12px",cursor:"pointer",background:"transparent",
                      borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                    {/* DataRow left */}
                    <div style={{display:"flex",flex:"1 1 160px",minWidth:0,gap:8,alignItems:"flex-start"}}>
                      <div style={{width:20,height:20,borderRadius:5,background:T.violet+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,marginTop:2}}>📅</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.label}</div>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
                          {r.assignedTo && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kdLbl}>For</span>{r.assignedTo}</span>}
                          {r.createdBy  && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kdLbl}>By</span>{r.createdBy}</span>}
                        </div>
                      </div>
                    </div>
                    {/* DataRow right */}
                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                      {r.freq    && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{r.freq}</span>}
                      {r.freq && r.nextDue && kdSep}
                      {r.nextDue && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{r.nextDue}</span>}
                      {r.nextDue && kdSep}
                      <span style={{...badge(T.sageS,T.sage)}}>{r.status==="due-soon"?"Due soon":r.status==="overdue"?"Overdue":"Up to date"}</span>
                      {kdSep}
                      <button className="btn-sm" style={{fontSize:10,padding:"2px 7px"}}
                        onClick={e=>{e.stopPropagation();setOthersEditItem({...r});}}>Edit</button>
                      {kdSep}
                      <button className="btn-sm" style={{fontSize:10,padding:"2px 7px",color:T.rose,borderColor:T.rose+"44"}}
                        onClick={e=>{e.stopPropagation();setOthersRoutinesState(prev=>(prev??OTHERS_INITIAL_KD).filter(o=>o.id!==r.id));}}>Delete</button>
                    </div>
                  </div>
                ))}
                <div style={{padding:"8px 14px",borderTop:OTHERS.length>0?`1px solid ${T.border}`:"none"}}>
                  <button className="btn-sm" style={{width:"100%",fontSize:11}}
                    onClick={()=>setAddOthersOpen(true)}>+ Add routine</button>
                </div>
              </div>
            </GroupHeader>
          )}
        </div>
      );
    })(),

    "Household Info": (() => {
      // Visibility model is real, not visual. My = Private; Family = Household.
      // Viewer is James (Owner) so he can edit Family notes; an Adult Member
      // viewing Family would see Edit replaced with a read-only marker.
      const VIEWER_ROLE = "Owner";
      const canEditFamily = VIEWER_ROLE === "Owner" || VIEWER_ROLE === "Admin";
      const canEdit = notesSec === "all" ? false : (notesSec === "my" ? true : canEditFamily);
      const all = notesSec === "all"
        ? ["my","admin","family"].flatMap(s => (notesData[s] || []).map(n => ({...n, _origin:s})))
        : notesData[notesSec];
      const q = notesQuery.trim().toLowerCase();
      const matchesQuery = n => !q || n.t.toLowerCase().includes(q);
      const totalMatches = all.filter(matchesQuery).length;

      /* Per-category accent colours */
      const NOTES_CAT_ACCENT = {
        security:   T.warm,
        appliances: T.teal,
        utilities:  T.sky,
        contacts:   T.sage,
        legal:      T.violet,
      };

      /* Resolve "For" field to a display label */
      const forLabel = v => {
        if (!v || v === "family") return "👥 Family";
        if (v === "hmg") return "🛡 HMG";
        const m = MEMBERS_AC.find(x => x.id === v);
        return m ? (m.you ? `${m.name} (you)` : m.name) : v;
      };

      /* Secondary-line label style */
      const secLbl = {fontSize:10, color:T.textM, textTransform:"uppercase",
        letterSpacing:".04em", marginRight:3, flexShrink:0};

      return (
        <div>
          {/* Header: Add Note button + ForPicker filter */}
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
            <button
              onClick={()=>openNewNote(notesSec==="all"?"family":notesSec, undefined)}
              className="btn-sm btn-warm"
              style={{fontSize:12,padding:"5px 14px",fontWeight:600}}>
              + Add Note
            </button>
          </div>

          {/* Show For picker (replaces ScopeToggle) */}
          <ForPicker inline
            value={notesSec==="my"?"own":notesSec==="admin"?"hmg":notesSec==="all"?"all":"family"}
            onChange={v=>{setNotesSec(v==="own"?"my":v==="hmg"?"admin":v==="all"?"all":"family");setNotesQuery("");}}
            options={LA_IS_HMG ? ["own","hmg","family","all"] : ["own","family","all"]}
            showCaption={false}
          />

          {/* Search */}
          <div style={{position:"relative",marginBottom:14}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:12,color:T.textS,pointerEvents:"none"}}>🔍</span>
            <input value={notesQuery} onChange={e=>setNotesQuery(e.target.value)}
              placeholder={"Search household info by title…"}
              className="field-input"
              style={{paddingLeft:34, paddingRight: notesQuery ? 70 : 14, height:38, background:T.surface}}/>
            {notesQuery && (
              <span onClick={()=>setNotesQuery("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                cursor:"pointer",fontSize:10.5,color:T.textS,letterSpacing:".04em"}}>clear ✕</span>
            )}
          </div>
          {q && (
            <div style={{fontSize:11,color:T.textS,marginBottom:10,letterSpacing:".02em"}}>
              {totalMatches} {totalMatches===1?"match":"matches"} across {NOTES_CATS.length} categories
            </div>
          )}

          {/* Categories */}
          {NOTES_CATS.map(([key, label]) => {
            const allInCat  = all.filter(n => n.cat === key);
            const filtered  = allInCat.filter(matchesQuery);
            const gk        = `notes-${notesSec}-${key}`;
            const isFiltered = q && filtered.length !== allInCat.length;
            const countLabel = isFiltered ? `${filtered.length}/${allInCat.length}` : allInCat.length;
            const autoExpand = !!q && filtered.length > 0;
            const accent     = NOTES_CAT_ACCENT[key];
            return (
              <GroupHeader key={key} id={gk} label={label} count={countLabel} accent={accent}
                open={isOpen(gk) || autoExpand} onToggle={()=>tog(gk)}>
                {filtered.length === 0 ? (
                  <div style={{padding:"12px 14px",fontSize:12.5,color:T.textS,fontStyle:"italic"}}>
                    {q ? "No matches in this category." : "No notes yet."}
                  </div>
                ) : (
                  filtered.map(note => {
                    const noteSec    = note._origin || notesSec;
                    const noteCanEdit = canEdit && (notesSec !== "all" || (note._origin === "my" || canEditFamily));
                    const noteFor    = note.for || (noteSec==="my" ? "james" : noteSec==="admin" ? "hmg" : "family");
                    const showAuthor = notesSec !== "my" && note.author;
                    return (
                      <div key={note._origin ? `${note._origin}-${note.id}` : note.id}
                        onClick={noteCanEdit ? ()=>openEditNote(noteSec, note) : undefined}
                        style={{display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px",
                          borderBottom:`1px solid ${T.border}`,
                          cursor: noteCanEdit ? "pointer" : "default",
                          background:"transparent", transition:"background .12s"}}
                        onMouseEnter={e=>{ if(noteCanEdit) e.currentTarget.style.background=T.warmG; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; }}>

                        {/* Left: content block */}
                        <div style={{flex:1, minWidth:0}}>
                          {/* Line 1: title */}
                          <div style={{fontSize:13, fontWeight:600, color:T.text,
                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                            {note.t}
                          </div>
                          {/* Line 2: For · By */}
                          <div style={{display:"flex", alignItems:"center", gap:8, marginTop:2, flexWrap:"wrap"}}>
                            <span style={{fontSize:11, color:T.textS, whiteSpace:"nowrap"}}>
                              <span style={secLbl}>For</span>{forLabel(noteFor)}
                            </span>
                            {showAuthor && (
                              <span style={{fontSize:11, color:T.textS, whiteSpace:"nowrap"}}>
                                <span style={secLbl}>By</span>{NOTE_NAME[note.author]}
                              </span>
                            )}
                          </div>
                          {/* Line 3: description (truncated, 2 lines) or empty-state prompt */}
                          {note.body ? (
                            <div style={{fontSize:11.5, color:T.textS, marginTop:3, lineHeight:1.45,
                              overflow:"hidden", display:"-webkit-box",
                              WebkitLineClamp:2, WebkitBoxOrient:"vertical"}}>
                              {note.body}
                            </div>
                          ) : (
                            <div style={{fontSize:11, color:T.textM, marginTop:3, fontStyle:"italic"}}>
                              Add details →
                            </div>
                          )}
                        </div>

                        {/* Right: date | copy | delete — DataRow pattern */}
                        <div style={{display:"flex", alignItems:"center", gap:6, flexShrink:0}} onClick={e=>e.stopPropagation()}>
                          {note.updated && <span style={{fontSize:10.5, color:T.textM, whiteSpace:"nowrap"}}>{note.updated}</span>}
                          {note.updated && <div style={{width:1, height:12, background:T.border, flexShrink:0}}/>}
                          <NoteIconBtn title="Copy" onClick={e=>{e.stopPropagation();try{navigator.clipboard?.writeText(note.body);}catch(_){}}}>{_IconCopy}</NoteIconBtn>
                          {noteCanEdit && <div style={{width:1, height:12, background:T.border, flexShrink:0}}/>}
                          {noteCanEdit && (
                            <NoteIconBtn title="Delete" danger onClick={e=>{e.stopPropagation();deleteNote(note.id,noteSec);}}>{_IconX}</NoteIconBtn>
                          )}
                          {!noteCanEdit && <div style={{width:1, height:12, background:T.border, flexShrink:0}}/>}
                          {!noteCanEdit && <span style={{fontSize:12, color:T.textM}}>🔒</span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </GroupHeader>
            );
          })}
        </div>
      );
    })(),
    "Documents": (
      <div>
        <ScopeToggle sec={docSec} setSec={setDocSec} segments={LA_SCOPE_SEGMENTS} captions={LA_CAPTIONS.docs}/>
        {docSec === "admin" && (
          <div style={{padding:"10px 13px",borderRadius:9,background:T.warmS,border:`1px solid ${T.warm}33`,fontSize:12,color:T.textS,lineHeight:1.6,marginBottom:12}}>
            <strong style={{color:T.warm}}>👥 HMG Documents</strong> — sensitive household paperwork visible only to Owners and Admins (e.g. wills, financial statements, mortgage). No documents on file yet. <span onClick={()=>setUploadDocOpen(true)} style={{color:T.warm,cursor:"pointer",fontWeight:600}}>+ Upload</span>
          </div>
        )}
        {DOC_CATS.map(([key,label])=>{
          const items = DOC_DATA[docSec]?.[key];
          if (!items) return null;
          const gk = `doc-${docSec}-${key}`;
          return (
            <div key={key} style={{marginBottom:10}}>
              <GroupHdr gk={gk} label={label} count={items.length}/>
              {isOpen(gk) && (
                <div className="card" style={{borderRadius:"0 0 8px 8px",borderTop:"none",paddingTop:8}}>
                  {items.map((doc,i)=>(
                    <div key={i} className="row" style={{flexWrap:"nowrap",gap:8}}>
                      <span style={{fontSize:15,flexShrink:0}}>{doc.ic}</span>
                      <span style={{flex:1,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.n}</span>
                      <span style={{fontSize:11.5,color:T.textS,flexShrink:0,whiteSpace:"nowrap"}}>Exp: {doc.exp}</span>
                      {doc.warn && <span style={{fontSize:10,padding:"2px 6px",borderRadius:7,background:T.amberS,color:T.amber,fontWeight:600,flexShrink:0}}>{doc.warn}</span>}
                      <div style={{width:7,height:7,borderRadius:"50%",background:doc.ok?T.sage:T.amber,flexShrink:0}}/>
                      <button className="btn-sm" style={{padding:"3px 8px",fontSize:11,flexShrink:0}}>View</button>
                    </div>
                  ))}
                  <button className="btn-sm" onClick={()=>setUploadDocOpen(true)} style={{marginTop:10,width:"100%"}}>+ Upload document</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    ),
    "Cars & Home": (
      <div>
        {/* ── Section tabs: Cars | Home ── */}
        <div style={{display:"flex",gap:2,background:T.card2,borderRadius:10,padding:3,marginBottom:14}}>
          {[["Cars","🚗"],["Home","🏠"]].map(([t,ic])=>(
            <div key={t} onClick={()=>setCarTab(t)}
              style={{flex:1,textAlign:"center",padding:"6px 12px",borderRadius:8,
                fontSize:12.5,fontWeight:600,cursor:"pointer",transition:"all .15s",
                background:carTab===t?T.surface:"transparent",
                color:carTab===t?T.warm:T.textS,
                border:carTab===t?`1px solid ${T.border}`:"1px solid transparent"}}>
              {ic} {t}
            </div>
          ))}
        </div>

        {/* ══ CARS ══ */}
        {carTab==="Cars" && (()=>{
          const CH_TYPES = {
            service:  {label:"Service",   color:T.teal,   icon:"🔧"},
            mot:      {label:"MOT",        color:T.sage,   icon:"✅"},
            tyre:     {label:"Tyres",      color:T.sky,    icon:"🛞"},
            mileage:  {label:"Mileage",    color:T.textS,  icon:"📏"},
            insurance:{label:"Insurance",  color:T.violet, icon:"🔒"},
            repair:   {label:"Repair",     color:T.amber,  icon:"🔩"},
          };
          const HIST_FILTER_KEYS = ["all","service","mot","tyre","mileage","insurance","repair"];

          const KD_STATUS = {
            overdue:   {label:"Overdue",   bg:T.roseS,  color:T.rose},
            "due-soon":{label:"Due soon",  bg:T.amberS, color:T.amber},
            ok:        {label:"Up to date",bg:T.sageS,  color:T.sage},
            note:      {label:null,        bg:T.card2,  color:T.textS},
          };
          const kiArchBtnStyle = {
            fontSize:9.5,padding:"2px 6px",borderRadius:5,
            border:`1px solid ${T.border}`,background:"transparent",
            color:T.textS,cursor:"pointer",fontFamily:"inherit",flexShrink:0,
          };

          const VEHICLES = carsVehicles ?? [
            {
              id:"v1", icon:"🚗", accent:T.amber,
              name:"Honda Civic",
              summary:"2020 · Silver · Petrol · AB12 CDE",
              ops:[
                {k:"MOT due",          v:"22-Sep-2025", warn:true},
                {k:"Insurance renewal",v:"18-Mar-2026"},
                {k:"Mileage",          v:"47,250 mi"},
                {k:"Owner",            v:"Sarah Davies"},
              ],
              profile:[
                {k:"Make",           v:"Honda"},
                {k:"Model",          v:"Civic"},
                {k:"Year",           v:"2020"},
                {k:"Registration",   v:"AB12 CDE"},
                {k:"Colour",         v:"Silver"},
                {k:"Fuel type",      v:"Petrol"},
                {k:"Body type",      v:"Hatchback"},
                {k:"VIN",            v:"JHMFC1F36LX012345"},
                {k:"Purchase date",  v:"12-Sep-2020"},
                {k:"No. of owners",  v:"1 (Sarah Davies)"},
              ],
              keyDates:[
                {id:"kd1-mot",   label:"MOT expiry",             date:"22-Sep-2025", status:"overdue",  icon:"✅", freq:"Yearly",  cadence:"fixed",   instanceType:"appointment", assignedTo:"Sarah", createdBy:"James", activeInstance:null},
                {id:"kd1-svc",   label:"Next service due",        date:"15-Jun-2025", status:"overdue",  icon:"🔧", freq:"Yearly",  cadence:"rolling", instanceType:"appointment", assignedTo:"Sarah", createdBy:"James", activeInstance:null},
                {id:"kd1-ins",   label:"Insurance renewal",       date:"18-Mar-2026", status:"ok",       icon:"🔒", freq:"Yearly",  cadence:"fixed",   instanceType:"appointment", assignedTo:"Sarah", createdBy:"James", activeInstance:{status:"booked", bookedWith:"Admiral · Online", bookedDate:"18-Mar-2026"}},
                {id:"kd1-break", label:"Breakdown cover renewal", date:"15-Oct-2025", status:"due-soon", icon:"🛠️", freq:"Yearly",  cadence:"fixed",   instanceType:"simple",      assignedTo:"Sarah", createdBy:"James", activeInstance:null},
                {id:"kd1-tax",   label:"Road tax renewal",        date:"01-Dec-2025", status:"due-soon", icon:"📋", freq:"Yearly",  cadence:"fixed",   instanceType:"simple",      assignedTo:"Sarah", createdBy:"James", activeInstance:null},
                {id:"kd1-tyre",  label:"Tyres last checked",      date:"10-Mar-2025", status:"note",     icon:"🛞", freq:null, cadence:null, instanceType:null, assignedTo:null, createdBy:"James", activeInstance:null},
                {id:"kd1-fin",   label:"Finance agreement end",   date:"N/A",         status:"note",     icon:"🏦", freq:null, cadence:null, instanceType:null, assignedTo:null, createdBy:"James", activeInstance:null},
              ],
              keyItems:[
                {id:"cki-ins",   cat:"Insurance",       icon:"🔒", color:T.violet, title:"Admiral · Fully comprehensive",  ref:"Policy AA-44821",       renewal:"18-Mar-2026", link:null,                   doc:{label:"Insurance Certificate", status:"Valid to 18-Mar-2026"}, assignedTo:"Sarah", createdBy:"James", archived:false},
                {id:"cki-break", cat:"Breakdown Cover", icon:"🛠️", color:T.amber,  title:"AA Gold Membership",             ref:"Member no. MB-99321",   renewal:"Annual",      link:null,                   doc:null, assignedTo:"Sarah", createdBy:"James", archived:false},
                {id:"cki-v5c",   cat:"Logbook (V5C)",   icon:"📄", color:T.sky,    title:"Registered to Sarah Davies",     ref:null,                    renewal:null,          link:null,                   doc:{label:"V5C Logbook", status:"Uploaded 15-Jan-2020"}, assignedTo:"Family", createdBy:"James", archived:false},
                {id:"cki-mot",   cat:"MOT Certificate", icon:"✅", color:T.sage,   title:"Pass + 1 advisory",              ref:null,                    renewal:"22-Sep-2025", link:null,                   doc:{label:"MOT Certificate 2025", status:"Expires 22-Sep-2025"}, assignedTo:"Sarah", createdBy:"James", archived:false},
                {id:"cki-tyre",  cat:"Tyre Spec",        icon:"🛞", color:T.textS,  title:"205/55 R16 91V",                 ref:"32 psi recommended",    renewal:null,          link:null,                   doc:null, assignedTo:"Family", createdBy:"Sarah", archived:false},
                {id:"cki-grg",   cat:"Garage Contact",   icon:"🔧", color:T.teal,   title:"Kwik Fit Manchester",            ref:"0161 234 5678",         renewal:null,          link:"kwikfit.com/book",     doc:null, assignedTo:"Family", createdBy:"James", archived:false},
                {id:"cki-motx",  cat:"MOT Certificate", icon:"✅", color:T.sage,   title:"Pass",                           ref:null,                    renewal:"22-Sep-2024", link:null,                   doc:{label:"MOT Certificate 2024", status:"Expired 22-Sep-2024"}, assignedTo:"Sarah", createdBy:"James", archived:true},
              ],
              hist:[
                {type:"mileage",  n:"Mileage recorded",            date:"01-Jun-2025", detail:"47,250 mi",             cost:null,       assignedTo:"Sarah", createdBy:"Sarah"},
                {type:"tyre",     n:"Tyre replacement (front x2)", date:"10-Mar-2025", detail:"Halfords",              cost:"£140",     assignedTo:"Sarah", createdBy:"Sarah"},
                {type:"service",  n:"Full service",                 date:"14-Dec-2024", detail:"Kwik Fit · 45,100 mi", cost:"£285",     assignedTo:"Sarah", createdBy:"James"},
                {type:"mot",      n:"MOT — Pass + 1 advisory",      date:"22-Sep-2024", detail:"ATS Euromaster",        cost:"£55",      assignedTo:"Sarah", createdBy:"James"},
                {type:"insurance",n:"Insurance renewed",            date:"18-Mar-2024", detail:"Admiral · Fully comp",  cost:"£620/yr",  assignedTo:"Sarah", createdBy:"James"},
              ],
            },
            {
              id:"v2", icon:"🚙", accent:T.teal,
              name:"Toyota Yaris",
              summary:"2022 · Blue · Hybrid · EF22 GHI",
              ops:[
                {k:"MOT due",          v:"14-Aug-2026"},
                {k:"Insurance renewal",v:"22-Nov-2025", warn:true},
                {k:"Mileage",          v:"12,100 mi"},
                {k:"Owner",            v:"Tom Davies"},
              ],
              profile:[
                {k:"Make",          v:"Toyota"},
                {k:"Model",         v:"Yaris"},
                {k:"Year",          v:"2022"},
                {k:"Registration",  v:"EF22 GHI"},
                {k:"Colour",        v:"Blue"},
                {k:"Fuel type",     v:"Hybrid (petrol/electric)"},
                {k:"Body type",     v:"Hatchback"},
                {k:"VIN",           v:"JTDKN3DU8E0123456"},
                {k:"Purchase date", v:"02-Mar-2022"},
                {k:"No. of owners", v:"1 (Tom Davies)"},
              ],
              keyDates:[
                {id:"kd2-mot",   label:"MOT expiry",             date:"14-Aug-2026", status:"ok",       icon:"✅", freq:"Yearly",  cadence:"fixed",   instanceType:"appointment", assignedTo:"Tom", createdBy:"James", activeInstance:null},
                {id:"kd2-svc",   label:"Next service due",        date:"14-Aug-2026", status:"ok",       icon:"🔧", freq:"Yearly",  cadence:"rolling", instanceType:"appointment", assignedTo:"Tom", createdBy:"James", activeInstance:null},
                {id:"kd2-ins",   label:"Insurance renewal",       date:"22-Nov-2025", status:"due-soon", icon:"🔒", freq:"Yearly",  cadence:"fixed",   instanceType:"appointment", assignedTo:"Tom", createdBy:"James", activeInstance:{status:"created"}},
                {id:"kd2-break", label:"Breakdown cover renewal", date:"10-Mar-2026", status:"ok",       icon:"🛠️", freq:"Yearly",  cadence:"fixed",   instanceType:"simple",      assignedTo:"Tom", createdBy:"James", activeInstance:null},
                {id:"kd2-tax",   label:"Road tax renewal",        date:"01-Mar-2026", status:"ok",       icon:"📋", freq:"Yearly",  cadence:"fixed",   instanceType:"simple",      assignedTo:"Tom", createdBy:"James", activeInstance:null},
                {id:"kd2-tyre",  label:"Tyres last checked",      date:"02-Mar-2022", status:"note",     icon:"🛞", freq:null, cadence:null, instanceType:null, assignedTo:null, createdBy:"James", activeInstance:null},
              ],
              keyItems:[
                {id:"yki-ins",  cat:"Insurance",      icon:"🔒", color:T.violet, title:"LV= · Third party fire & theft", ref:"Policy LV-88312",       renewal:"22-Nov-2025", link:null,                    doc:{label:"Insurance Certificate", status:"Valid to 22-Nov-2025"}, assignedTo:"Tom", createdBy:"James", archived:false},
                {id:"yki-break",cat:"Breakdown Cover", icon:"🛠️", color:T.amber,  title:"RAC Essential",                 ref:"Member no. RAC-77102", renewal:"Annual",      link:null,                    doc:null, assignedTo:"Tom", createdBy:"James", archived:false},
                {id:"yki-v5c",  cat:"Logbook (V5C)",   icon:"📄", color:T.sky,    title:"Registered to Tom Davies",      ref:null,                    renewal:null,          link:null,                    doc:{label:"V5C Logbook", status:"Uploaded 02-Mar-2022"}, assignedTo:"Family", createdBy:"James", archived:false},
                {id:"yki-grg",  cat:"Garage Contact",   icon:"🔧", color:T.teal,   title:"Toyota Manchester",             ref:"0161 456 7890",         renewal:null,          link:"toyota.co.uk/service",  doc:null, assignedTo:"Family", createdBy:"James", archived:false},
              ],
              hist:[
                {type:"service",  n:"First service",     date:"14-Aug-2023", detail:"Toyota Manchester · 10,000 mi", cost:"£195",    assignedTo:"Tom", createdBy:"James"},
                {type:"insurance",n:"Insurance renewed", date:"22-Nov-2023", detail:"LV= · Third party F&T",         cost:"£480/yr", assignedTo:"Tom", createdBy:"James"},
              ],
            },
          ];
          vehiclesRef.current = VEHICLES;

          return (
            <div>
              {VEHICLES.map(car=>{
                const vOpen     = isOpen("vh-"+car.id);
                const profOpen  = isOpen("vp-"+car.id);
                const archOpen  = isOpen("varch-"+car.id);
                const histFilter   = histFilterCars[car.id] || "all";
                const filteredHist = histFilter==="all" ? car.hist : car.hist.filter(h=>h.type===histFilter);
                const activeKI     = car.keyItems.filter(i=>!i.archived);
                const archivedKI   = car.keyItems.filter(i=>i.archived);
                return (
                  <div key={car.id} style={{
                    borderRadius:10,
                    border:`1px solid ${vOpen ? car.accent+"88" : T.border}`,
                    background:T.card,
                    marginBottom:12,
                    overflow:"hidden",
                  }}>
                    {/* ── Condensed profile (always visible) ── */}
                    <div style={{padding:"12px 14px"}}>
                      {/* Identity row */}
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                        <div style={{width:38,height:38,borderRadius:9,background:car.accent+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,cursor:"pointer"}}
                          onClick={()=>setCarProfileModal(car)}>
                          {car.icon}
                        </div>
                        <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setCarProfileModal(car)}>
                          <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:T.text}}>{car.name}</div>
                          <div style={{fontSize:11,color:T.textS}}>{car.summary}</div>
                        </div>
                        <div onClick={()=>tog("vh-"+car.id)}
                          style={{width:22,height:22,borderRadius:5,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",
                            cursor:"pointer",fontSize:9,color:T.textS,flexShrink:0,border:`1px solid ${T.border}`}}>
                          {vOpen?"▼":"▶"}
                        </div>
                      </div>
                      {/* Full profile expand toggle — sits directly under identity row */}
                      <div onClick={()=>tog("vp-"+car.id)}
                        style={{display:"flex",alignItems:"center",gap:4,marginTop:6,cursor:"pointer",
                          fontSize:11,color:T.textS,userSelect:"none"}}>
                        <span style={{fontSize:8}}>{profOpen?"▼":"▶"}</span>
                        <span>{profOpen?"Hide full profile":"View full profile"}</span>
                      </div>
                      {/* Expanded: full profile fields */}
                      {profOpen && (
                        <div style={{marginTop:8,padding:"10px 12px",borderRadius:8,background:T.card2,border:`1px solid ${T.border}`}}>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 20px"}}>
                            {car.profile.map(({k,v})=>(
                              <div key={k}>
                                <div style={{fontSize:9.5,fontWeight:600,color:T.textS,textTransform:"uppercase",letterSpacing:".04em",marginBottom:1}}>{k}</div>
                                <div style={{fontSize:12,color:T.text}}>{v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Expanded: Groups 2–5 ── */}
                    {vOpen && (
                      <div style={{borderTop:`1px solid ${T.border}`,padding:"10px 10px 4px"}}>

                        {/* Group 2: Key Dates */}
                        <GroupHeader id={`ch-dates-${car.id}`} label="📅 Key Dates" count={car.keyDates.length} accent={T.warm}
                          open={isOpen(`ch-dates-${car.id}`)} onToggle={()=>tog(`ch-dates-${car.id}`)}>
                          <div style={{background:T.card,border:`1px solid ${T.warm}88`,borderTop:"none",borderRadius:"0 0 8px 8px",marginBottom:10,overflow:"hidden"}}>
                            {(()=>{
                              const kdLbl = {fontSize:10,color:T.textM,textTransform:"uppercase",letterSpacing:".04em",marginRight:2};
                              const kdSep = <div style={{width:1,height:12,background:T.border,flexShrink:0}}/>;
                              return car.keyDates.map((kd,i,arr)=>{
                                const st = KD_STATUS[kd.status] || KD_STATUS.note;
                                const isBooked = kd.activeInstance?.status === "booked";
                                const hasInstance = !!kd.activeInstance;
                                const hasCta = kd.status !== "note" && (hasInstance || kd.status==="overdue" || kd.status==="due-soon");
                                const statusLabel = isBooked ? "Booked 📅" : st.label;
                                const statusBg    = isBooked ? T.sageS : st.bg;
                                const statusColor = isBooked ? T.sage  : st.color;
                                return (
                                  /* WrapRow: flexWrap:"wrap" so right side drops below on narrow screens */
                                  <div key={kd.id}
                                    onClick={()=>setCarKeyEventEdit(kd)}
                                    onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                                    style={{display:"flex",flexWrap:"wrap",alignItems:"flex-start",gap:8,
                                      padding:"8px 12px",
                                      borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none",
                                      cursor:"pointer",background:"transparent"}}>
                                    {/* LEFT UNIT: icon + title/For — flex:"1 1 160px" so it fills available space before wrapping */}
                                    <div style={{display:"flex",flex:"1 1 160px",minWidth:0,gap:8,alignItems:"flex-start"}}>
                                      <div style={{width:20,height:20,borderRadius:5,background:st.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,marginTop:2}}>
                                        {kd.icon}
                                      </div>
                                      <div style={{flex:1,minWidth:0}}>
                                        <div style={{fontSize:13,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                                          {kd.label}
                                        </div>
                                        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
                                          {kd.assignedTo && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kdLbl}>For</span>{kd.assignedTo}</span>}
                                          {kd.createdBy  && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kdLbl}>By</span>{kd.createdBy}</span>}
                                        </div>
                                      </div>
                                    </div>
                                    {/* RIGHT UNIT: date | freq | status | CTA — wraps below left on narrow screens */}
                                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                                      {kd.date && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{kd.date}</span>}
                                      {kd.date && kd.freq && kdSep}
                                      {kd.freq && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{kd.freq}</span>}
                                      {(kd.date||kd.freq) && statusLabel && kdSep}
                                      {statusLabel && <span style={{...badge(statusBg,statusColor)}}>{statusLabel}</span>}
                                      {hasCta && kdSep}
                                      {hasCta && (
                                        hasInstance
                                          ? <button className="btn-sm" style={{fontSize:9.5,color:T.teal,borderColor:T.teal+"55",whiteSpace:"nowrap"}}>View in Tasks →</button>
                                          : <button className="btn-sm btn-warm" style={{fontSize:9.5,whiteSpace:"nowrap"}}
                                              onClick={()=>setCarAddModal({type:"task",sec:"cars",vehicleId:car.id})}>+ Create task</button>
                                      )}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                            <div style={{padding:"8px 14px"}}>
                              <button className="btn-sm" style={{width:"100%",fontSize:11}}
                                onClick={()=>setAddKeyEventOpen({vehicleId:car.id,sec:"cars"})}>+ Add Key Event</button>
                            </div>
                          </div>
                        </GroupHeader>

                        {/* Group 3: Key Info & Contacts */}
                        <GroupHeader id={`ch-key-${car.id}`} label="🔑 Key Info &amp; Contacts" count={activeKI.length} accent={T.sky}
                          open={isOpen(`ch-key-${car.id}`)} onToggle={()=>tog(`ch-key-${car.id}`)}>
                          <div style={{background:T.card,border:`1px solid ${T.sky}88`,borderTop:"none",borderRadius:"0 0 8px 8px",marginBottom:10,overflow:"hidden"}}>
                            {(()=>{
                              const kiLbl = {fontSize:10,color:T.textM,textTransform:"uppercase",letterSpacing:".04em",marginRight:2};
                              const kiSep = <div style={{width:1,height:12,background:T.border,flexShrink:0}}/>;
                              return activeKI.map((item,i,arr)=>(
                                /* WrapRow */
                                <div key={item.id}
                                  onClick={()=>setCarKeyEdit({...item,_vehicleId:car.id})}
                                  onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                                  style={{display:"flex",flexWrap:"wrap",alignItems:"flex-start",gap:8,
                                    padding:"8px 12px",cursor:"pointer",background:"transparent",
                                    borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                                  {/* LEFT UNIT: icon + category / title / For · By */}
                                  <div style={{display:"flex",flex:"1 1 160px",minWidth:0,gap:8,alignItems:"flex-start"}}>
                                    <div style={{width:28,height:28,borderRadius:7,background:item.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0,marginTop:2}}>
                                      {item.icon}
                                    </div>
                                    <div style={{flex:1,minWidth:0}}>
                                      <div style={{fontSize:10,fontWeight:700,color:item.color,textTransform:"uppercase",letterSpacing:".05em",marginBottom:2}}>{item.cat}</div>
                                      <div style={{fontSize:13,fontWeight:500,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
                                      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
                                        <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kiLbl}>For</span>{item.assignedTo}</span>
                                        <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kiLbl}>By</span>{item.createdBy}</span>
                                      </div>
                                    </div>
                                  </div>
                                  {/* RIGHT UNIT: ref | renewal | doc | archive */}
                                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                                    {item.ref && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{item.ref}</span>}
                                    {item.ref && item.renewal && kiSep}
                                    {item.renewal && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{item.renewal}</span>}
                                    {(item.ref||item.renewal) && (item.doc||item.link) && kiSep}
                                    {item.link && <span style={{fontSize:11,color:T.teal,whiteSpace:"nowrap"}}>🔗 {item.link}</span>}
                                    {item.doc && !item.link && (
                                      <span style={{fontSize:11,color:T.sky,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:3}}>
                                        <span>📎</span><span>{item.doc.label}</span>
                                      </span>
                                    )}
                                    {(item.ref||item.renewal||item.doc||item.link) && kiSep}
                                    <button style={kiArchBtnStyle} title="Archive this item">📦</button>
                                  </div>
                                </div>
                              ));
                            })()}
                            {/* Archived sub-section */}
                            {archivedKI.length > 0 && (
                              <div style={{borderTop:`1px solid ${T.border}`}}>
                                <div onClick={()=>tog("varch-"+car.id)}
                                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                                    padding:"8px 14px",cursor:"pointer",color:T.textS,fontSize:11}}>
                                  <span>📦 Archived ({archivedKI.length})</span>
                                  <span style={{fontSize:9}}>{archOpen?"▼":"▶"}</span>
                                </div>
                                {archOpen && archivedKI.map((item,i,arr)=>(
                                  <div key={item.id} style={{...rowBase,background:"transparent",opacity:0.55,
                                    borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                                    <div style={{width:30,height:30,borderRadius:7,background:item.color+"10",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
                                      {item.icon}
                                    </div>
                                    <div style={{flex:1,minWidth:0}}>
                                      <div style={{fontSize:10.5,fontWeight:700,color:item.color,textTransform:"uppercase",letterSpacing:".05em",marginBottom:1}}>{item.cat}</div>
                                      <div style={{fontSize:12,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
                                      <div style={{fontSize:10.5,color:T.textS,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.detail}</div>
                                      {item.doc && (
                                        <div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:3,padding:"1px 6px",borderRadius:5,background:T.card2,border:`1px solid ${T.border}`}}>
                                          <span style={{fontSize:10}}>📎</span>
                                          <span style={{fontSize:10,color:T.textS}}>{item.doc.label}</span>
                                        </div>
                                      )}
                                    </div>
                                    <button style={{...kiArchBtnStyle,color:T.teal,borderColor:T.teal+"44"}}>Restore</button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div style={{padding:"8px 14px"}}>
                              <button className="btn-sm" style={{width:"100%",fontSize:11}}
                                onClick={()=>setCarAddModal({type:"key",sec:"cars",vehicleId:car.id})}>+ Add item</button>
                            </div>
                          </div>
                        </GroupHeader>

                        {/* Group 4: History */}
                        <GroupHeader id={`ch-hist-${car.id}`} label="📋 History" count={car.hist.length} accent={T.sage}
                          open={isOpen(`ch-hist-${car.id}`)} onToggle={()=>tog(`ch-hist-${car.id}`)}>
                          <div style={{background:T.card,border:`1px solid ${T.sage}88`,borderTop:"none",borderRadius:"0 0 8px 8px",marginBottom:10,overflow:"hidden"}}>
                            <div style={{padding:"8px 12px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:4,flexWrap:"wrap"}}>
                              {HIST_FILTER_KEYS.map(k=>{
                                const active = histFilter===k;
                                const lbl = k==="all"?"All":(CH_TYPES[k]?.label||k);
                                return (
                                  <button key={k}
                                    onClick={e=>{e.stopPropagation();setHistFilterCars(prev=>({...prev,[car.id]:k}));}}
                                    style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:6,
                                      border:`1px solid ${active?T.warm+"55":"transparent"}`,
                                      cursor:"pointer",fontFamily:"inherit",
                                      background:active?T.warmS:"transparent",color:active?T.warm:T.textS}}>
                                    {lbl}
                                  </button>
                                );
                              })}
                            </div>
                            {(()=>{
                              const hLbl = {fontSize:10,color:T.textM,textTransform:"uppercase",letterSpacing:".04em",marginRight:2};
                              const hSep = <div style={{width:1,height:12,background:T.border,flexShrink:0}}/>;
                              return filteredHist.map((h,i,arr)=>{
                                const tp = CH_TYPES[h.type]||{label:h.type,color:T.textS,icon:"📋"};
                                return (
                                  /* WrapRow */
                                  <div key={i}
                                    onClick={()=>setCarEditItem({...h,_vehicleId:car.id})}
                                    onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                                    style={{display:"flex",flexWrap:"wrap",alignItems:"flex-start",gap:8,
                                      padding:"8px 12px",cursor:"pointer",background:"transparent",
                                      borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                                    {/* LEFT UNIT: icon + type label / entry name / For · By */}
                                    <div style={{display:"flex",flex:"1 1 160px",minWidth:0,gap:8,alignItems:"flex-start"}}>
                                      <div style={{width:28,height:28,borderRadius:6,background:tp.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,marginTop:2}}>
                                        {tp.icon}
                                      </div>
                                      <div style={{flex:1,minWidth:0}}>
                                        <div style={{fontSize:10,fontWeight:700,color:tp.color,textTransform:"uppercase",letterSpacing:".05em",marginBottom:2}}>{tp.label}</div>
                                        <div style={{fontSize:13,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.n}</div>
                                        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
                                          {h.assignedTo && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={hLbl}>For</span>{h.assignedTo}</span>}
                                          {h.createdBy  && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={hLbl}>By</span>{h.createdBy}</span>}
                                        </div>
                                      </div>
                                    </div>
                                    {/* RIGHT UNIT: date | provider | cost */}
                                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                                      <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{h.date}</span>
                                      {h.detail && hSep}
                                      {h.detail && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{h.detail}</span>}
                                      {h.cost && hSep}
                                      {h.cost && <span style={{fontSize:11.5,color:T.text,fontWeight:500,whiteSpace:"nowrap"}}>{h.cost}</span>}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                            <div style={{padding:"8px 14px"}}>
                              <button className="btn-sm" style={{width:"100%",fontSize:11}} onClick={()=>setLogServiceOpen(true)}>+ Log entry</button>
                            </div>
                          </div>
                        </GroupHeader>

                      </div>
                    )}
                  </div>
                );
              })}
              <button className="btn-sm" style={{width:"100%",fontSize:11,marginTop:2}} onClick={()=>setCarAddVehicle(true)}>+ Add vehicle</button>
            </div>
          );
        })()}

        {/* ══ HOME ══ */}
        {carTab==="Home" && (()=>{
          const HT_TYPES = {
            repair:      {label:"Repair",       color:T.rose,   icon:"🔧"},
            service:     {label:"Service",      color:T.teal,   icon:"🔥"},
            improvement: {label:"Improvement",  color:T.sage,   icon:"🏗️"},
            decoration:  {label:"Decoration",   color:T.violet, icon:"🎨"},
            inspection:  {label:"Inspection",   color:T.sky,    icon:"🔍"},
          };
          const HT_FILTER_KEYS = ["all","repair","service","improvement","decoration","inspection"];
          const HP_STATUS = {
            overdue:   {label:"Overdue",    bg:T.roseS,  color:T.rose},
            "due-soon":{label:"Due soon",   bg:T.amberS, color:T.amber},
            ok:        {label:"Up to date", bg:T.sageS,  color:T.sage},
            note:      {label:null,         bg:T.card2,  color:T.textS},
          };
          const hkiArchBtnStyle = {
            fontSize:9.5,padding:"2px 6px",borderRadius:5,
            border:`1px solid ${T.border}`,background:"transparent",
            color:T.textS,cursor:"pointer",fontFamily:"inherit",flexShrink:0,
          };

          const HOMES = homesState ?? [
            {
              id:"hp1", icon:"🏠", accent:T.teal,
              name:"12 Oak Lane",
              summary:"Manchester · M20 6AB · Owned (freehold)",
              tenure:"owned", ownershipType:"freehold",
              ops:[
                {k:"Tenure",            v:"Owned (freehold)"},
                {k:"Est. value",        v:"£320,000"},
                {k:"Mortgage monthly",  v:"£1,240"},
                {k:"Mortgage deal end", v:"01-Apr-2026", warn:true},
              ],
              profile:[
                {k:"Address",         v:"12 Oak Lane"},
                {k:"Postcode",        v:"M20 6AB"},
                {k:"Town / city",     v:"Manchester"},
                {k:"Property type",   v:"Semi-detached"},
                {k:"Tenure",          v:"Owned"},
                {k:"Ownership type",  v:"Freehold"},
                {k:"Purchase date",   v:"15-Mar-2018"},
                {k:"Est. value",      v:"£320,000"},
                {k:"No. of bedrooms", v:"3"},
              ],
              mortgage:{provider:"Halifax",account:"H-998877",monthly:"£1,240",rateType:"Fixed (2.4%)",dealEnd:"01-Apr-2026",mortgageType:"Repayment"},
              leasehold:null,
              rental:null,
              letting:null,
              keyDates:[
                {id:"hkd1-ins",    label:"Home insurance renewal", date:"10-Apr-2026", status:"due-soon", icon:"🔒", freq:"Yearly", assignedTo:"Sarah",  createdBy:"James", hasInstance:true},
                {id:"hkd1-mort",   label:"Mortgage deal expiry",   date:"01-Apr-2026", status:"overdue",  icon:"🏦", freq:null,     assignedTo:"Sarah",  createdBy:"James", hasInstance:false},
                {id:"hkd1-epc",    label:"EPC certificate expiry", date:"2032",        status:"ok",       icon:"⚡", freq:null,     assignedTo:"Family", createdBy:"James", hasInstance:false},
                {id:"hkd1-boiler", label:"Boiler annual service",  date:"01-Nov-2025", status:"overdue",  icon:"🔥", freq:"Yearly", assignedTo:"Family", createdBy:"James", hasInstance:false},
                {id:"hkd1-gas",    label:"Gas safety certificate", date:"15-Nov-2025", status:"overdue",  icon:"🔍", freq:"Yearly", assignedTo:"Sarah",  createdBy:"James", hasInstance:false},
              ],
              keyItems:[
                {id:"hki1-ins",     cat:"Home Insurance",  icon:"🔒", color:T.violet, title:"Direct Line · Buildings & contents", detail:"Policy DL-88123 · Renewal 10-Apr-2026",         ref:"DL-88123",     renewal:"10-Apr-2026", doc:{label:"Insurance Policy",   status:"Renewed 10-Apr-2025"},          assignedTo:"Sarah", createdBy:"James", archived:false},
                {id:"hki1-mort",    cat:"Mortgage",         icon:"🏦", color:T.teal,   title:"Halifax · Fixed rate 2.4%",          detail:"Account H-998877 · £1,240/mo · Deal 01-Apr-2026",ref:"H-998877",     renewal:"01-Apr-2026", doc:{label:"Mortgage Agreement", status:"Added 15-Mar-2018"},             assignedTo:"Sarah", createdBy:"James", archived:false},
                {id:"hki1-epc",     cat:"EPC Certificate", icon:"⚡", color:T.sage,   title:"Rating B (83)",                      detail:"Valid to 2032 · Domestic Energy Assessor",        ref:null,           renewal:"2032",        doc:{label:"EPC Certificate",    status:"Rating B · Valid to 2032"},       assignedTo:"Family",createdBy:"James", archived:false},
                {id:"hki1-alarm",   cat:"Security",         icon:"🔐", color:T.amber,  title:"Yale Smart Alarm",                   detail:"Code stored · Key safe: 4719 · Spare key: Emma Davies", ref:null,      renewal:null,          doc:null,                                                                assignedTo:"Family",createdBy:"James", archived:false},
                {id:"hki1-boiler",  cat:"Boiler Engineer", icon:"🔥", color:T.rose,   title:"British Gas HomeCare",               detail:"0800 111 999 · Contract BG-CX-44812 · Annual service Nov", ref:"BG-CX-44812", renewal:"Annual", doc:null,                                                           assignedTo:"Family",createdBy:"James", archived:false},
                {id:"hki1-plumber", cat:"Plumber",          icon:"🚿", color:T.sky,    title:"Dave's Plumbing",                    detail:"07700 900 123 · Emergency cover available",       ref:"07700 900 123",renewal:null,          doc:null,                                                                assignedTo:"Family",createdBy:"James", archived:false},
                {id:"hki1-elec",    cat:"Electrician",      icon:"⚡", color:T.warm,   title:"J&K Electrical",                     detail:"07700 900 456 · NICEIC registered",                ref:"07700 900 456",renewal:null,          doc:null,                                                                assignedTo:"Family",createdBy:"James", archived:false},
                {id:"hki1-ins-old", cat:"Home Insurance",  icon:"🔒", color:T.violet, title:"Aviva · Buildings only",             detail:"Policy AV-22089 · Expired 10-Apr-2025",           ref:"AV-22089",     renewal:null,          doc:{label:"Old Policy",         status:"Expired 10-Apr-2025"},           assignedTo:"Sarah", createdBy:"James", archived:true},
              ],
              hist:[
                {type:"repair",      n:"Boiler repair",          date:"03-Feb-2025", detail:"British Gas",          cost:"£180"},
                {type:"inspection",  n:"Roof inspection",        date:"15-Oct-2024", detail:"Trusted Trades",       cost:"£120"},
                {type:"decoration",  n:"Repaint living room",    date:"20-Jul-2024", detail:"DIY",                  cost:"£450"},
                {type:"repair",      n:"New bathroom tap",       date:"08-Jan-2025", detail:"Local plumber",        cost:"£90"},
                {type:"service",     n:"Boiler annual service",  date:"01-Nov-2024", detail:"British Gas HomeCare", cost:"£95"},
              ],
            },
            {
              id:"hp2", icon:"🏢", accent:T.violet,
              name:"8 Harbour View",
              summary:"Lowestoft · NR32 1BB · Letting out",
              tenure:"letting-out", ownershipType:"freehold",
              ops:[
                {k:"Tenure",        v:"Letting out"},
                {k:"Est. value",    v:"£185,000"},
                {k:"Rent received", v:"£875/mo"},
                {k:"Tenancy end",   v:"31-Jan-2027"},
              ],
              profile:[
                {k:"Address",         v:"8 Harbour View"},
                {k:"Postcode",        v:"NR32 1BB"},
                {k:"Town / city",     v:"Lowestoft"},
                {k:"Property type",   v:"Flat"},
                {k:"Tenure",          v:"Letting out"},
                {k:"Ownership type",  v:"Freehold"},
                {k:"Purchase date",   v:"10-Jun-2020"},
                {k:"Est. value",      v:"£185,000"},
                {k:"No. of bedrooms", v:"2"},
              ],
              mortgage:null,
              leasehold:null,
              rental:null,
              letting:{tenantName:"Mark & Lisa Taylor",rentReceived:"£875/mo",tenancyStart:"01-Feb-2025",tenancyEnd:"31-Jan-2027",depositHeld:"£1,008",depositScheme:"MyDeposits · MD-77432"},
              keyDates:[
                {id:"hkd2-lins",  label:"Landlord insurance renewal", date:"10-Jun-2026", status:"ok",      icon:"🔒", freq:"Yearly", assignedTo:"James", createdBy:"James", hasInstance:false},
                {id:"hkd2-gas",   label:"Gas safety certificate",     date:"01-Feb-2026", status:"overdue", icon:"🔍", freq:"Yearly", assignedTo:"James", createdBy:"James", hasInstance:false},
                {id:"hkd2-elec",  label:"EICR electrical inspection", date:"10-Jun-2025", status:"overdue", icon:"⚡", freq:null,     assignedTo:"James", createdBy:"James", hasInstance:false},
                {id:"hkd2-ten",   label:"Tenancy agreement renewal",  date:"31-Jan-2027", status:"ok",      icon:"📋", freq:"Yearly", assignedTo:"James", createdBy:"James", hasInstance:false},
                {id:"hkd2-epc",   label:"EPC certificate expiry",     date:"2030",        status:"ok",      icon:"⚡", freq:null,     assignedTo:"James", createdBy:"James", hasInstance:false},
              ],
              keyItems:[
                {id:"hki2-lins",  cat:"Landlord Insurance", icon:"🔒", color:T.violet, title:"Simply Business · Landlord policy", detail:"Policy SB-77410 · Renewal 10-Jun-2026", ref:"SB-77410",      renewal:"10-Jun-2026", doc:{label:"Landlord Insurance", status:"Valid to 10-Jun-2026"}, assignedTo:"James", createdBy:"James", archived:false},
                {id:"hki2-agent", cat:"Letting Agent",       icon:"🏢", color:T.teal,   title:"Sowerbys Residential",             detail:"01502 123 456 · lowestoft@sowerbys.co.uk", ref:"01502 123 456", renewal:null,          doc:null,                                                      assignedTo:"James", createdBy:"James", archived:false},
                {id:"hki2-epc",   cat:"EPC Certificate",    icon:"⚡", color:T.sage,   title:"Rating C (74)",                    detail:"Valid to 2030 · Domestic Energy Assessor", ref:null,             renewal:"2030",        doc:{label:"EPC Certificate", status:"Rating C · Valid to 2030"}, assignedTo:"James", createdBy:"James", archived:false},
              ],
              hist:[
                {type:"inspection",  n:"EICR electrical inspection", date:"10-Jun-2020", detail:"Benson Electrical", cost:"£200"},
                {type:"decoration",  n:"Full redecoration",          date:"20-May-2020", detail:"Local decorator",   cost:"£1,200"},
                {type:"service",     n:"Gas safety check",           date:"01-Feb-2025", detail:"Gas Safe engineer", cost:"£75"},
              ],
            },
            {
              id:"hp3", icon:"🏠", accent:T.sky,
              name:"3 Maple Close",
              summary:"Leeds · LS6 1AA · Rented",
              tenure:"rented", ownershipType:null,
              ops:[
                {k:"Tenure",       v:"Rented"},
                {k:"Monthly rent", v:"£1,150"},
                {k:"Tenancy end",  v:"28-Feb-2026"},
                {k:"Landlord",     v:"Connells Lettings"},
              ],
              profile:[
                {k:"Address",         v:"3 Maple Close"},
                {k:"Postcode",        v:"LS6 1AA"},
                {k:"Town / city",     v:"Leeds"},
                {k:"Property type",   v:"Terraced"},
                {k:"Tenure",          v:"Rented"},
                {k:"Tenancy start",   v:"01-Mar-2023"},
                {k:"No. of bedrooms", v:"2"},
              ],
              mortgage:null,
              leasehold:null,
              rental:{landlordAgent:"Connells Lettings",contact:"0113 456 7890",monthlyRent:"£1,150",depositPaid:"£1,326",depositScheme:"DPS",depositRef:"DPS-449821",tenancyStart:"01-Mar-2023",tenancyEnd:"28-Feb-2026"},
              letting:null,
              keyDates:[
                {id:"hkd3-ten",   label:"Tenancy renewal",          date:"28-Feb-2026", status:"due-soon", icon:"📋", freq:"Yearly", assignedTo:"James", createdBy:"James", hasInstance:false},
                {k:"hkd3-cont",   label:"Contents insurance renewal",date:"01-Mar-2026", status:"ok",       icon:"🔒", freq:"Yearly", assignedTo:"James", createdBy:"James", hasInstance:false},
              ],
              keyItems:[
                {id:"hki3-cont",   cat:"Contents Insurance", icon:"🔒", color:T.violet, title:"Admiral · Contents only",    detail:"Policy AD-11234 · Renewal 01-Mar-2026", ref:"AD-11234",     renewal:"01-Mar-2026", doc:{label:"Insurance Certificate", status:"Valid to 01-Mar-2026"}, assignedTo:"James", createdBy:"James", archived:false},
                {id:"hki3-agent",  cat:"Letting Agent",       icon:"🏢", color:T.teal,   title:"Connells Lettings",          detail:"0113 456 7890 · leeds@connells.co.uk",   ref:"0113 456 7890",renewal:null,          doc:null,                                                           assignedTo:"James", createdBy:"James", archived:false},
                {id:"hki3-ll",     cat:"Landlord",            icon:"👤", color:T.amber,  title:"Mr David Park",              detail:"07700 900 000 — emergency contact",      ref:"07700 900 000",renewal:null,          doc:null,                                                           assignedTo:"James", createdBy:"James", archived:false},
              ],
              hist:[
                {type:"repair",     n:"Boiler fault repair",      date:"10-Nov-2024", detail:"British Gas (landlord)", cost:"£0"},
                {type:"decoration", n:"Painted spare bedroom",    date:"05-Aug-2023", detail:"DIY",                   cost:"£80"},
              ],
            },
          ];
          homesRef.current = HOMES;

          return (
            <div>
              {HOMES.map(prop=>{
                const pOpen      = isOpen("ph-"+prop.id);
                const profOpen   = isOpen("pp-"+prop.id);
                const archOpen   = isOpen("parch-"+prop.id);
                const histFilter = histFilterHomes[prop.id] || "all";
                const filteredHist = histFilter==="all" ? prop.hist : prop.hist.filter(h=>h.type===histFilter);
                const activeKI   = prop.keyItems.filter(i=>!i.archived);
                const archivedKI = prop.keyItems.filter(i=>i.archived);
                return (
                  <div key={prop.id} style={{
                    borderRadius:10,
                    border:`1px solid ${pOpen ? prop.accent+"88" : T.border}`,
                    background:T.card,
                    marginBottom:12,
                    overflow:"hidden",
                  }}>
                    {/* ── Condensed profile (always visible — identity row only) ── */}
                    <div style={{padding:"12px 14px"}}>
                      {/* Identity row */}
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                        <div style={{width:38,height:38,borderRadius:9,background:prop.accent+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,cursor:"pointer"}}
                          onClick={()=>setHomeProfileModal(prop)}>
                          {prop.icon}
                        </div>
                        <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setHomeProfileModal(prop)}>
                          <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:T.text}}>{prop.name}</div>
                          <div style={{fontSize:11,color:T.textS}}>{prop.summary}</div>
                        </div>
                        {/* Expand groups toggle */}
                        <div onClick={()=>tog("ph-"+prop.id)}
                          style={{width:22,height:22,borderRadius:5,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",
                            cursor:"pointer",fontSize:9,color:T.textS,flexShrink:0,border:`1px solid ${T.border}`}}>
                          {pOpen?"▼":"▶"}
                        </div>
                      </div>
                      {/* View full profile toggle — sits directly under identity row */}
                      <div onClick={()=>tog("pp-"+prop.id)}
                        style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",
                          fontSize:11,color:T.textS,userSelect:"none"}}>
                        <span style={{fontSize:8}}>{profOpen?"▼":"▶"}</span>
                        <span>{profOpen?"Hide full profile":"View full profile"}</span>
                      </div>
                      {/* Expanded: full profile fields */}
                      {profOpen && (
                        <div style={{marginTop:8,padding:"10px 12px",borderRadius:8,background:T.card2,border:`1px solid ${T.border}`}}>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 20px",marginBottom:prop.mortgage||prop.letting?12:0}}>
                            {prop.profile.map(({k,v})=>(
                              <div key={k}>
                                <div style={{fontSize:9.5,fontWeight:600,color:T.textS,textTransform:"uppercase",letterSpacing:".04em",marginBottom:1}}>{k}</div>
                                <div style={{fontSize:12.5,color:T.text}}>{v}</div>
                              </div>
                            ))}
                          </div>
                          {/* Mortgage sub-section */}
                          {prop.mortgage && (
                            <div style={{padding:"10px 12px",borderRadius:8,background:T.card,border:`1px solid ${T.border}`,marginBottom:10}}>
                              <div style={{fontSize:10,fontWeight:700,color:T.teal,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>🏦 Mortgage</div>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 20px"}}>
                                {[
                                  {k:"Provider",      v:prop.mortgage.provider},
                                  {k:"Account no.",   v:prop.mortgage.account},
                                  {k:"Monthly",       v:prop.mortgage.monthly},
                                  {k:"Rate type",     v:prop.mortgage.rateType},
                                  {k:"Deal end",      v:prop.mortgage.dealEnd, warn:true},
                                  {k:"Mortgage type", v:prop.mortgage.mortgageType},
                                ].map(({k,v,warn})=>(
                                  <div key={k}>
                                    <div style={{fontSize:9.5,fontWeight:600,color:T.textS,textTransform:"uppercase",letterSpacing:".04em",marginBottom:1}}>{k}</div>
                                    <div style={{fontSize:12,color:warn?T.amber:T.text}}>{v}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Leasehold sub-section */}
                          {prop.leasehold && (
                            <div style={{padding:"10px 12px",borderRadius:8,background:T.card,border:`1px solid ${T.violet}44`,marginBottom:10}}>
                              <div style={{fontSize:10,fontWeight:700,color:T.violet,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>📋 Leasehold Details</div>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 20px"}}>
                                {[
                                  {k:"Years remaining",  v:prop.leasehold.yearsRemaining},
                                  {k:"Lease expiry",     v:prop.leasehold.leaseExpiry},
                                  {k:"Ground rent",      v:prop.leasehold.groundRent},
                                  {k:"Service charge",   v:prop.leasehold.serviceCharge},
                                  {k:"Freeholder",       v:prop.leasehold.freeholder},
                                  {k:"Managing agent",   v:prop.leasehold.managingAgent},
                                ].map(({k,v})=>(
                                  <div key={k}>
                                    <div style={{fontSize:9.5,fontWeight:600,color:T.textS,textTransform:"uppercase",letterSpacing:".04em",marginBottom:1}}>{k}</div>
                                    <div style={{fontSize:12.5,color:T.text}}>{v||"—"}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Rental sub-section (user is tenant) */}
                          {prop.rental && (
                            <div style={{padding:"10px 12px",borderRadius:8,background:T.card,border:`1px solid ${T.sky}44`,marginBottom:10}}>
                              <div style={{fontSize:10,fontWeight:700,color:T.sky,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>🔑 Rental Details</div>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 20px"}}>
                                {[
                                  {k:"Landlord / agent",  v:prop.rental.landlordAgent},
                                  {k:"Contact",           v:prop.rental.contact},
                                  {k:"Monthly rent",      v:prop.rental.monthlyRent},
                                  {k:"Deposit paid",      v:prop.rental.depositPaid},
                                  {k:"Deposit scheme",    v:prop.rental.depositScheme},
                                  {k:"Deposit ref.",      v:prop.rental.depositRef},
                                  {k:"Tenancy start",     v:prop.rental.tenancyStart},
                                  {k:"Tenancy end",       v:prop.rental.tenancyEnd},
                                ].map(({k,v})=>(
                                  <div key={k}>
                                    <div style={{fontSize:9.5,fontWeight:600,color:T.textS,textTransform:"uppercase",letterSpacing:".04em",marginBottom:1}}>{k}</div>
                                    <div style={{fontSize:12.5,color:T.text}}>{v||"—"}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Letting sub-section (user is landlord) */}
                          {prop.letting && (
                            <div style={{padding:"10px 12px",borderRadius:8,background:T.card,border:`1px solid ${T.teal}44`}}>
                              <div style={{fontSize:10,fontWeight:700,color:T.teal,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>🔑 Letting Details</div>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 20px"}}>
                                {[
                                  {k:"Tenant(s)",       v:prop.letting.tenantName},
                                  {k:"Rent received",   v:prop.letting.rentReceived},
                                  {k:"Tenancy start",   v:prop.letting.tenancyStart},
                                  {k:"Tenancy end",     v:prop.letting.tenancyEnd},
                                  {k:"Deposit held",    v:prop.letting.depositHeld},
                                  {k:"Deposit scheme",  v:prop.letting.depositScheme},
                                ].map(({k,v})=>(
                                  <div key={k}>
                                    <div style={{fontSize:9.5,fontWeight:600,color:T.textS,textTransform:"uppercase",letterSpacing:".04em",marginBottom:1}}>{k}</div>
                                    <div style={{fontSize:12.5,color:T.text}}>{v||"—"}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── Expanded: Groups 2–4 ── */}
                    {pOpen && (
                      <div style={{borderTop:`1px solid ${T.border}`,padding:"10px 10px 4px"}}>

                        {/* Group 2: Key Events */}
                        <GroupHeader id={`ph-dates-${prop.id}`} label="📅 Key Dates" count={prop.keyDates.length} accent={T.warm}
                          open={isOpen(`ph-dates-${prop.id}`)} onToggle={()=>tog(`ph-dates-${prop.id}`)}>
                          <div style={{background:T.card,border:`1px solid ${T.warm}88`,borderTop:"none",borderRadius:"0 0 8px 8px",marginBottom:10,overflow:"hidden"}}>
                            {(()=>{
                              const kdLbl = {fontSize:10,color:T.textM,textTransform:"uppercase",letterSpacing:".04em",marginRight:2};
                              const kdSep = <div style={{width:1,height:12,background:T.border,flexShrink:0}}/>;
                              return prop.keyDates.map((kd,i,arr)=>{
                                const st = HP_STATUS[kd.status] || HP_STATUS.note;
                                const hasCta = kd.status !== "note";
                                return (
                                  <div key={kd.id}
                                    onClick={()=>setHomeKeyEventEdit({...kd,_propertyId:prop.id})}
                                    onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                                    style={{display:"flex",flexWrap:"wrap",alignItems:"flex-start",gap:8,
                                      padding:"8px 12px",
                                      borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none",
                                      cursor:"pointer",background:"transparent"}}>
                                    <div style={{display:"flex",flex:"1 1 160px",minWidth:0,gap:8,alignItems:"flex-start"}}>
                                      <div style={{width:20,height:20,borderRadius:5,background:st.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,marginTop:2}}>
                                        {kd.icon}
                                      </div>
                                      <div style={{flex:1,minWidth:0}}>
                                        <div style={{fontSize:13,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{kd.label}</div>
                                        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
                                          {kd.assignedTo && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kdLbl}>For</span>{kd.assignedTo}</span>}
                                          {kd.createdBy  && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kdLbl}>By</span>{kd.createdBy}</span>}
                                        </div>
                                      </div>
                                    </div>
                                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                                      {kd.date && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{kd.date}</span>}
                                      {kd.date && kd.freq && kdSep}
                                      {kd.freq && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{kd.freq}</span>}
                                      {(kd.date||kd.freq) && st.label && kdSep}
                                      {st.label && <span style={{...badge(st.bg,st.color)}}>{st.label}</span>}
                                      {hasCta && kdSep}
                                      {hasCta && (
                                        kd.hasInstance
                                          ? <button className="btn-sm" style={{fontSize:9.5,color:T.teal,borderColor:T.teal+"55",whiteSpace:"nowrap"}}>View in Tasks →</button>
                                          : <button className="btn-sm btn-warm" style={{fontSize:9.5,whiteSpace:"nowrap"}}
                                              onClick={()=>setCarAddModal({type:"task",sec:"home",propertyId:prop.id})}>+ Create task</button>
                                      )}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                            <div style={{padding:"8px 14px"}}>
                              <button className="btn-sm" style={{width:"100%",fontSize:11}}
                                onClick={()=>setAddKeyEventOpen({propertyId:prop.id,sec:"home"})}>+ Add Key Event</button>
                            </div>
                          </div>
                        </GroupHeader>

                        {/* Group 3: Key Info & Contacts */}
                        <GroupHeader id={`ph-key-${prop.id}`} label="🔑 Key Info &amp; Contacts" count={activeKI.length} accent={T.sky}
                          open={isOpen(`ph-key-${prop.id}`)} onToggle={()=>tog(`ph-key-${prop.id}`)}>
                          <div style={{background:T.card,border:`1px solid ${T.sky}88`,borderTop:"none",borderRadius:"0 0 8px 8px",marginBottom:10,overflow:"hidden"}}>
                            {(()=>{
                              const kiLbl = {fontSize:10,color:T.textM,textTransform:"uppercase",letterSpacing:".04em",marginRight:2};
                              const kiSep = <div style={{width:1,height:12,background:T.border,flexShrink:0}}/>;
                              return activeKI.map((item,i,arr)=>(
                                <div key={item.id}
                                  onClick={()=>setHomeKeyEdit({...item,_propertyId:prop.id})}
                                  onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                                  style={{display:"flex",flexWrap:"wrap",alignItems:"flex-start",gap:8,
                                    padding:"8px 12px",cursor:"pointer",background:"transparent",
                                    borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                                  {/* LEFT: icon + category / title / For·By — DataRow */}
                                  <div style={{display:"flex",flex:"1 1 160px",minWidth:0,gap:8,alignItems:"flex-start"}}>
                                    <div style={{width:28,height:28,borderRadius:7,background:item.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0,marginTop:2}}>
                                      {item.icon}
                                    </div>
                                    <div style={{flex:1,minWidth:0}}>
                                      <div style={{fontSize:10,fontWeight:700,color:item.color,textTransform:"uppercase",letterSpacing:".05em",marginBottom:2}}>{item.cat}</div>
                                      <div style={{fontSize:13,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.title}</div>
                                      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
                                        {item.assignedTo && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kiLbl}>For</span>{item.assignedTo}</span>}
                                        {item.createdBy  && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kiLbl}>By</span>{item.createdBy}</span>}
                                      </div>
                                    </div>
                                  </div>
                                  {/* RIGHT: ref | renewal | doc | archive — DataRow metadata */}
                                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                                    {item.ref     && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{item.ref}</span>}
                                    {item.ref && item.renewal && kiSep}
                                    {item.renewal && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{item.renewal}</span>}
                                    {(item.ref||item.renewal) && (item.doc||item.link) && kiSep}
                                    {item.link && <span style={{fontSize:11,color:T.teal,whiteSpace:"nowrap"}}>🔗 {item.link}</span>}
                                    {item.doc && !item.link && (
                                      <span style={{fontSize:11,color:T.sky,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:3}}>
                                        <span>📎</span><span>{item.doc.label}</span>
                                      </span>
                                    )}
                                    {(item.ref||item.renewal||item.doc||item.link) && kiSep}
                                    <button style={hkiArchBtnStyle} title="Archive this item">📦</button>
                                  </div>
                                </div>
                              ));
                            })()}
                            {/* Archived sub-section */}
                            {archivedKI.length > 0 && (
                              <div style={{borderTop:`1px solid ${T.border}`}}>
                                <div onClick={()=>tog("parch-"+prop.id)}
                                  style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",cursor:"pointer",userSelect:"none"}}>
                                  <span style={{fontSize:11,color:T.textS}}>📦 Archived ({archivedKI.length})</span>
                                  <span style={{fontSize:9,color:T.textS}}>{archOpen?"▼":"▶"}</span>
                                </div>
                                {archOpen && archivedKI.map((item,i,arr)=>(
                                  <div key={item.id} style={{...rowBase,background:"transparent",opacity:0.55,
                                    borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                                    <div style={{width:28,height:28,borderRadius:7,background:item.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
                                      {item.icon}
                                    </div>
                                    <div style={{flex:1,minWidth:0}}>
                                      <div style={{fontSize:10,fontWeight:700,color:item.color,textTransform:"uppercase",letterSpacing:".05em",marginBottom:1}}>{item.cat}</div>
                                      <div style={{fontSize:12.5,fontWeight:500,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
                                      <div style={{fontSize:10.5,color:T.textS,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.detail}</div>
                                    </div>
                                    <button className="btn-sm" style={{fontSize:10,padding:"2px 7px",flexShrink:0,alignSelf:"flex-start",marginTop:2}}>Restore</button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div style={{padding:"8px 14px"}}>
                              <button className="btn-sm" style={{width:"100%",fontSize:11}}
                                onClick={()=>setCarAddModal({type:"key",sec:"home",propertyId:prop.id})}>+ Add item</button>
                            </div>
                          </div>
                        </GroupHeader>

                        {/* Group 4: History */}
                        <GroupHeader id={`ph-hist-${prop.id}`} label="📋 History" count={prop.hist.length} accent={T.sage}
                          open={isOpen(`ph-hist-${prop.id}`)} onToggle={()=>tog(`ph-hist-${prop.id}`)}>
                          <div style={{background:T.card,border:`1px solid ${T.sage}88`,borderTop:"none",borderRadius:"0 0 8px 8px",marginBottom:10,overflow:"hidden"}}>
                            <div style={{padding:"8px 12px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:4,flexWrap:"wrap"}}>
                              {HT_FILTER_KEYS.map(k=>{
                                const active = histFilter===k;
                                const lbl = k==="all"?"All":(HT_TYPES[k]?.label||k);
                                return (
                                  <button key={k}
                                    onClick={e=>{e.stopPropagation();setHistFilterHomes(prev=>({...prev,[prop.id]:k}));}}
                                    style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:6,
                                      border:`1px solid ${active?T.warm+"55":"transparent"}`,
                                      cursor:"pointer",fontFamily:"inherit",
                                      background:active?T.warmS:"transparent",color:active?T.warm:T.textS}}>
                                    {lbl}
                                  </button>
                                );
                              })}
                            </div>
                            {(()=>{
                              const hLbl = {fontSize:10,color:T.textM,textTransform:"uppercase",letterSpacing:".04em",marginRight:2};
                              const hSep = <div style={{width:1,height:12,background:T.border,flexShrink:0}}/>;
                              return filteredHist.map((h,i,arr)=>{
                                const tp = HT_TYPES[h.type]||{label:h.type,color:T.textS,icon:"📋"};
                                return (
                                  <div key={i}
                                    onClick={()=>setHomeEditItem({...h,_propertyId:prop.id})}
                                    onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                                    style={{display:"flex",flexWrap:"wrap",alignItems:"flex-start",gap:8,
                                      padding:"8px 12px",cursor:"pointer",background:"transparent",
                                      borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                                    <div style={{display:"flex",flex:"1 1 160px",minWidth:0,gap:8,alignItems:"flex-start"}}>
                                      <div style={{width:28,height:28,borderRadius:6,background:tp.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,marginTop:2}}>
                                        {tp.icon}
                                      </div>
                                      <div style={{flex:1,minWidth:0}}>
                                        <div style={{fontSize:10,fontWeight:700,color:tp.color,textTransform:"uppercase",letterSpacing:".05em",marginBottom:2}}>{tp.label}</div>
                                        <div style={{fontSize:13,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.n}</div>
                                      </div>
                                    </div>
                                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                                      <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{h.date}</span>
                                      {h.detail && hSep}
                                      {h.detail && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{h.detail}</span>}
                                      {h.cost && hSep}
                                      {h.cost && <span style={{fontSize:11.5,color:T.text,fontWeight:500,whiteSpace:"nowrap"}}>{h.cost}</span>}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                            <div style={{padding:"8px 14px"}}>
                              <button className="btn-sm" style={{width:"100%",fontSize:11}} onClick={()=>setLogMaintenanceOpen(true)}>+ Log entry</button>
                            </div>
                          </div>
                        </GroupHeader>

                      </div>
                    )}
                  </div>
                );
              })}
              <button className="btn-sm" style={{width:"100%",fontSize:11,marginTop:2}} onClick={()=>setHomeAddProperty(true)}>+ Add property</button>
            </div>
          );
        })()}
      </div>
    ),
    "Pet Care": (()=>{
      // ── Status & type constants ──
      const PP_STATUS = {
        overdue:   {label:"Overdue",    bg:T.roseS,  color:T.rose},
        "due-soon":{label:"Due soon",   bg:T.amberS, color:T.amber},
        ok:        {label:"Up to date", bg:T.sageS,  color:T.sage},
        note:      {label:null,         bg:T.card2,  color:T.textS},
      };
      const PT_TYPES = {
        "vet-visit":  {label:"Vet Visit",   color:T.teal,   icon:"🏥"},
        vaccination:  {label:"Vaccination", color:T.sage,   icon:"💉"},
        treatment:    {label:"Treatment",   color:T.rose,   icon:"💊"},
        grooming:     {label:"Grooming",    color:T.violet, icon:"✂️"},
        other:        {label:"Other",       color:T.textS,  icon:"📋"},
      };
      const PT_FILTER_KEYS = ["all","vet-visit","vaccination","treatment","grooming","other"];
      const pkiArchBtnStyle = {fontSize:9.5,padding:"2px 6px",borderRadius:5,border:`1px solid ${T.border}`,background:"transparent",color:T.textS,cursor:"pointer",fontFamily:"inherit",flexShrink:0};

      // ── Pet data ──
      const PETS = petsState ?? [
        {
          id:"pet1", icon:"🐕", accent:T.lime,
          name:"Buddy",
          summary:"Golden Retriever · 4 years · Male",
          profile:[
            {k:"Species",       v:"Dog"},
            {k:"Breed",         v:"Golden Retriever"},
            {k:"Date of birth", v:"14-Mar-2021"},
            {k:"Sex",           v:"Male"},
            {k:"Microchip no.", v:"985112345678901"},
            {k:"Insurer",       v:"Petplan"},
            {k:"Policy number", v:"PP-44821"},
          ],
          keyDates:[
            {id:"pkd1-boost", label:"Annual booster",        date:"01-Apr-2027", status:"ok",       icon:"💉", freq:"Yearly",    assignedTo:"Family", createdBy:"James", hasInstance:false},
            {id:"pkd1-flea",  label:"Flea treatment",        date:"01-May-2025", status:"due-soon", icon:"🐛", freq:"Monthly",   assignedTo:"James",  createdBy:"James", hasInstance:false},
            {id:"pkd1-worm",  label:"Worming",               date:"01-Jul-2025", status:"ok",       icon:"🔬", freq:"Quarterly", assignedTo:"James",  createdBy:"James", hasInstance:false},
            {id:"pkd1-ins",   label:"Pet insurance renewal", date:"01-Mar-2026", status:"ok",       icon:"🛡️", freq:"Yearly",    assignedTo:"James",  createdBy:"James", hasInstance:false},
          ],
          keyItems:[
            {id:"pki1-ins",   cat:"Pet Insurance", icon:"🛡️", color:T.violet, title:"Petplan · Accident & illness", detail:"Policy PP-44821 · Renewal 01-Mar-2026", ref:"PP-44821",      renewal:"01-Mar-2026", doc:{label:"Insurance Policy",status:"Valid to 01-Mar-2026"}, assignedTo:"James",  createdBy:"James", archived:false},
            {id:"pki1-vet",   cat:"Vet Practice",  icon:"🏥", color:T.teal,   title:"Riverside Vets",               detail:"0161 123 4567 · riverside@vets.co.uk",  ref:"0161 123 4567", renewal:null,          doc:null,                                                   assignedTo:"Family", createdBy:"James", archived:false},
            {id:"pki1-groom", cat:"Groomer",       icon:"✂️", color:T.sky,    title:"Pawfect Grooms",               detail:"07700 900 321 · Every 6 weeks",         ref:"07700 900 321", renewal:null,          doc:null,                                                   assignedTo:"Family", createdBy:"James", archived:false},
          ],
          hist:[
            {type:"vet-visit",   n:"Annual check-up",        date:"12-Mar-2025", detail:"Riverside Vets", cost:"£85"},
            {type:"vaccination", n:"Annual booster",          date:"12-Mar-2025", detail:"Riverside Vets", cost:"£55"},
            {type:"vet-visit",   n:"Ear infection treatment", date:"08-Jan-2025", detail:"Riverside Vets", cost:"£140"},
            {type:"vet-visit",   n:"Dental clean",            date:"03-Oct-2024", detail:"Riverside Vets", cost:"£220"},
            {type:"grooming",    n:"Full groom",              date:"15-Apr-2025", detail:"Pawfect Grooms", cost:"£45"},
          ],
          aiNudge:"Buddy's flea treatment is due this month — add a reminder to your Tasks?",
        },
        {
          id:"pet2", icon:"🐈", accent:T.lime,
          name:"Whiskers",
          summary:"British Shorthair · 6 years · Female",
          profile:[
            {k:"Species",       v:"Cat"},
            {k:"Breed",         v:"British Shorthair"},
            {k:"Date of birth", v:"02-Aug-2020"},
            {k:"Sex",           v:"Female"},
            {k:"Microchip no.", v:"985198765432100"},
            {k:"Insurer",       v:"More Th>n"},
            {k:"Policy number", v:"MT-29183"},
          ],
          keyDates:[
            {id:"pkd2-boost", label:"Annual booster",        date:"15-Aug-2026", status:"ok", icon:"💉", freq:"Yearly", assignedTo:"Family", createdBy:"Sarah", hasInstance:false},
            {id:"pkd2-ins",   label:"Pet insurance renewal", date:"01-Sep-2026", status:"ok", icon:"🛡️", freq:"Yearly", assignedTo:"Sarah",  createdBy:"Sarah", hasInstance:false},
          ],
          keyItems:[
            {id:"pki2-ins", cat:"Pet Insurance", icon:"🛡️", color:T.violet, title:"More Th>n · Lifetime cover", detail:"Policy MT-29183 · Renewal 01-Sep-2026", ref:"MT-29183",      renewal:"01-Sep-2026", doc:{label:"Insurance Policy",status:"Valid to 01-Sep-2026"}, assignedTo:"Sarah",  createdBy:"Sarah", archived:false},
            {id:"pki2-vet", cat:"Vet Practice",  icon:"🏥", color:T.teal,   title:"Riverside Vets",             detail:"0161 123 4567 · riverside@vets.co.uk",  ref:"0161 123 4567", renewal:null,          doc:null,                                                   assignedTo:"Family", createdBy:"Sarah", archived:false},
          ],
          hist:[
            {type:"vet-visit",   n:"Annual check-up", date:"15-Aug-2024", detail:"Riverside Vets", cost:"£75"},
            {type:"vaccination", n:"Annual booster",   date:"15-Aug-2024", detail:"Riverside Vets", cost:"£50"},
          ],
          aiNudge:null,
        },
      ];
      petsRef.current = PETS;

      return (
        <div>
          {PETS.map(pet=>{
            const pOpen      = isOpen("pt-"+pet.id);
            const profOpen   = isOpen("ptp-"+pet.id);
            const archOpen   = isOpen("ptarch-"+pet.id);
            const histFilter = histFilterPets[pet.id] || "all";
            const filteredHist = histFilter==="all" ? pet.hist : pet.hist.filter(h=>h.type===histFilter);
            const activeKI   = pet.keyItems.filter(i=>!i.archived);
            const archivedKI = pet.keyItems.filter(i=>i.archived);
            return (
              <div key={pet.id} style={{
                borderRadius:10,
                border:`1px solid ${pOpen ? pet.accent+"88" : T.border}`,
                background:T.card,
                marginBottom:12,
                overflow:"hidden",
              }}>
                {/* ── Identity row (always visible) ── */}
                <div style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                    <div style={{width:38,height:38,borderRadius:9,background:pet.accent+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,cursor:"pointer"}}
                      onClick={()=>setPetProfileModal(pet)}>
                      {pet.icon}
                    </div>
                    <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setPetProfileModal(pet)}>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:T.text}}>{pet.name}</div>
                      <div style={{fontSize:11,color:T.textS}}>{pet.summary}</div>
                    </div>
                    <div onClick={()=>tog("pt-"+pet.id)}
                      style={{width:22,height:22,borderRadius:5,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",
                        cursor:"pointer",fontSize:9,color:T.textS,flexShrink:0,border:`1px solid ${T.border}`}}>
                      {pOpen?"▼":"▶"}
                    </div>
                  </div>
                  {/* View full profile toggle */}
                  <div onClick={()=>tog("ptp-"+pet.id)}
                    style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:11,color:T.textS,userSelect:"none"}}>
                    <span style={{fontSize:8}}>{profOpen?"▼":"▶"}</span>
                    <span>{profOpen?"Hide full profile":"View full profile"}</span>
                  </div>
                  {/* Expanded full profile */}
                  {profOpen && (
                    <div style={{marginTop:8,padding:"10px 12px",borderRadius:8,background:T.card2,border:`1px solid ${T.border}`}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 20px"}}>
                        {pet.profile.map(({k,v})=>(
                          <div key={k}>
                            <div style={{fontSize:9.5,fontWeight:600,color:T.textS,textTransform:"uppercase",letterSpacing:".04em",marginBottom:1}}>{k}</div>
                            <div style={{fontSize:12.5,color:T.text}}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* AI nudge */}
                  {pet.aiNudge && (
                    <div style={{marginTop:10,padding:"8px 12px",borderRadius:9,background:T.tealS,border:`1px solid ${T.teal}33`,fontSize:12,color:T.textS,lineHeight:1.6}}>
                      <strong style={{color:T.teal}}>🤖 MyPal AI:</strong> {pet.aiNudge}
                    </div>
                  )}
                </div>

                {/* ── Expanded: Groups 2–4 ── */}
                {pOpen && (
                  <div style={{borderTop:`1px solid ${T.border}`,padding:"10px 10px 4px"}}>

                    {/* Group 2: Key Events */}
                    <GroupHeader id={`pt-dates-${pet.id}`} label="📅 Key Dates" count={pet.keyDates.length} accent={T.warm}
                      open={isOpen(`pt-dates-${pet.id}`)} onToggle={()=>tog(`pt-dates-${pet.id}`)}>
                      <div style={{background:T.card,border:`1px solid ${T.warm}88`,borderTop:"none",borderRadius:"0 0 8px 8px",marginBottom:10,overflow:"hidden"}}>
                        {(()=>{
                          const kdLbl = {fontSize:10,color:T.textM,textTransform:"uppercase",letterSpacing:".04em",marginRight:2};
                          const kdSep = <div style={{width:1,height:12,background:T.border,flexShrink:0}}/>;
                          return pet.keyDates.map((kd,i,arr)=>{
                            const st = PP_STATUS[kd.status] || PP_STATUS.note;
                            const hasCta = kd.status !== "note";
                            return (
                              <div key={kd.id}
                                onClick={()=>setPetKeyEventEdit({...kd,_petId:pet.id})}
                                onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                                style={{display:"flex",flexWrap:"wrap",alignItems:"flex-start",gap:8,
                                  padding:"8px 12px",borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none",
                                  cursor:"pointer",background:"transparent"}}>
                                {/* DataRow left */}
                                <div style={{display:"flex",flex:"1 1 160px",minWidth:0,gap:8,alignItems:"flex-start"}}>
                                  <div style={{width:20,height:20,borderRadius:5,background:st.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,marginTop:2}}>
                                    {kd.icon}
                                  </div>
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:13,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{kd.label}</div>
                                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
                                      {kd.assignedTo && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kdLbl}>For</span>{kd.assignedTo}</span>}
                                      {kd.createdBy  && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kdLbl}>By</span>{kd.createdBy}</span>}
                                    </div>
                                  </div>
                                </div>
                                {/* DataRow right */}
                                <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                                  {kd.date && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{kd.date}</span>}
                                  {kd.date && kd.freq && kdSep}
                                  {kd.freq && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{kd.freq}</span>}
                                  {(kd.date||kd.freq) && st.label && kdSep}
                                  {st.label && <span style={{...badge(st.bg,st.color)}}>{st.label}</span>}
                                  {hasCta && kdSep}
                                  {hasCta && (
                                    kd.hasInstance
                                      ? <button className="btn-sm" style={{fontSize:9.5,color:T.teal,borderColor:T.teal+"55",whiteSpace:"nowrap"}}>View in Tasks →</button>
                                      : <button className="btn-sm btn-warm" style={{fontSize:9.5,whiteSpace:"nowrap"}}
                                          onClick={e=>{e.stopPropagation();setCarAddModal({type:"task",sec:"pet",petId:pet.id});}}>+ Create task</button>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                        <div style={{padding:"8px 14px"}}>
                          <button className="btn-sm" style={{width:"100%",fontSize:11}}
                            onClick={()=>setAddKeyEventOpen({petId:pet.id,sec:"pet"})}>+ Add Key Event</button>
                        </div>
                      </div>
                    </GroupHeader>

                    {/* Group 3: Key Info & Contacts */}
                    <GroupHeader id={`pt-key-${pet.id}`} label="🔑 Key Info &amp; Contacts" count={activeKI.length} accent={T.sky}
                      open={isOpen(`pt-key-${pet.id}`)} onToggle={()=>tog(`pt-key-${pet.id}`)}>
                      <div style={{background:T.card,border:`1px solid ${T.sky}88`,borderTop:"none",borderRadius:"0 0 8px 8px",marginBottom:10,overflow:"hidden"}}>
                        {(()=>{
                          const kiLbl = {fontSize:10,color:T.textM,textTransform:"uppercase",letterSpacing:".04em",marginRight:2};
                          const kiSep = <div style={{width:1,height:12,background:T.border,flexShrink:0}}/>;
                          return activeKI.map((item,i,arr)=>(
                            <div key={item.id}
                              onClick={()=>setPetKeyEdit({...item,_petId:pet.id})}
                              onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                              style={{display:"flex",flexWrap:"wrap",alignItems:"flex-start",gap:8,
                                padding:"8px 12px",cursor:"pointer",background:"transparent",
                                borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                              {/* DataRow left */}
                              <div style={{display:"flex",flex:"1 1 160px",minWidth:0,gap:8,alignItems:"flex-start"}}>
                                <div style={{width:28,height:28,borderRadius:7,background:item.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0,marginTop:2}}>
                                  {item.icon}
                                </div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:10,fontWeight:700,color:item.color,textTransform:"uppercase",letterSpacing:".05em",marginBottom:2}}>{item.cat}</div>
                                  <div style={{fontSize:13,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.title}</div>
                                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
                                    {item.assignedTo && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kiLbl}>For</span>{item.assignedTo}</span>}
                                    {item.createdBy  && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}><span style={kiLbl}>By</span>{item.createdBy}</span>}
                                  </div>
                                </div>
                              </div>
                              {/* DataRow right */}
                              <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                                {item.ref     && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{item.ref}</span>}
                                {item.ref && item.renewal && kiSep}
                                {item.renewal && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{item.renewal}</span>}
                                {(item.ref||item.renewal) && (item.doc||item.link) && kiSep}
                                {item.link && <span style={{fontSize:11,color:T.teal,whiteSpace:"nowrap"}}>🔗 {item.link}</span>}
                                {item.doc && !item.link && (
                                  <span style={{fontSize:11,color:T.sky,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:3}}>
                                    <span>📎</span><span>{item.doc.label}</span>
                                  </span>
                                )}
                                {(item.ref||item.renewal||item.doc||item.link) && kiSep}
                                <button style={pkiArchBtnStyle} title="Archive this item">📦</button>
                              </div>
                            </div>
                          ));
                        })()}
                        {/* Archived sub-section */}
                        {archivedKI.length > 0 && (
                          <div style={{borderTop:`1px solid ${T.border}`}}>
                            <div onClick={()=>tog("ptarch-"+pet.id)}
                              style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",cursor:"pointer",userSelect:"none"}}>
                              <span style={{fontSize:11,color:T.textS}}>📦 Archived ({archivedKI.length})</span>
                              <span style={{fontSize:9,color:T.textS}}>{archOpen?"▼":"▶"}</span>
                            </div>
                            {archOpen && archivedKI.map((item,i,arr)=>(
                              <div key={item.id} style={{...rowBase,background:"transparent",opacity:0.55,
                                borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                                <div style={{width:28,height:28,borderRadius:7,background:item.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
                                  {item.icon}
                                </div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:10,fontWeight:700,color:item.color,textTransform:"uppercase",letterSpacing:".05em",marginBottom:1}}>{item.cat}</div>
                                  <div style={{fontSize:12.5,fontWeight:500,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
                                  <div style={{fontSize:10.5,color:T.textS,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.detail}</div>
                                </div>
                                <button className="btn-sm" style={{fontSize:10,padding:"2px 7px",flexShrink:0,alignSelf:"flex-start",marginTop:2}}>Restore</button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{padding:"8px 14px"}}>
                          <button className="btn-sm" style={{width:"100%",fontSize:11}}
                            onClick={()=>setCarAddModal({type:"key",sec:"pet",petId:pet.id})}>+ Add item</button>
                        </div>
                      </div>
                    </GroupHeader>

                    {/* Group 4: History */}
                    <GroupHeader id={`pt-hist-${pet.id}`} label="📋 History" count={pet.hist.length} accent={T.sage}
                      open={isOpen(`pt-hist-${pet.id}`)} onToggle={()=>tog(`pt-hist-${pet.id}`)}>
                      <div style={{background:T.card,border:`1px solid ${T.sage}88`,borderTop:"none",borderRadius:"0 0 8px 8px",marginBottom:10,overflow:"hidden"}}>
                        {/* Type filter chips */}
                        <div style={{padding:"8px 12px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:4,flexWrap:"wrap"}}>
                          {PT_FILTER_KEYS.map(k=>{
                            const active = histFilter===k;
                            const lbl = k==="all"?"All":(PT_TYPES[k]?.label||k);
                            return (
                              <button key={k}
                                onClick={e=>{e.stopPropagation();setHistFilterPets(prev=>({...prev,[pet.id]:k}));}}
                                style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:6,
                                  border:`1px solid ${active?T.warm+"55":"transparent"}`,
                                  cursor:"pointer",fontFamily:"inherit",
                                  background:active?T.warmS:"transparent",color:active?T.warm:T.textS}}>
                                {lbl}
                              </button>
                            );
                          })}
                        </div>
                        {/* History rows — DataRow / WrapRow */}
                        {(()=>{
                          const hSep = <div style={{width:1,height:12,background:T.border,flexShrink:0}}/>;
                          return filteredHist.map((h,i,arr)=>{
                            const tp = PT_TYPES[h.type]||{label:h.type,color:T.textS,icon:"📋"};
                            return (
                              <div key={i}
                                onClick={()=>setPetHistEdit({...h,_petId:pet.id})}
                                onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                                style={{display:"flex",flexWrap:"wrap",alignItems:"flex-start",gap:8,
                                  padding:"8px 12px",cursor:"pointer",background:"transparent",
                                  borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                                {/* DataRow left */}
                                <div style={{display:"flex",flex:"1 1 160px",minWidth:0,gap:8,alignItems:"flex-start"}}>
                                  <div style={{width:28,height:28,borderRadius:6,background:tp.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,marginTop:2}}>
                                    {tp.icon}
                                  </div>
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:10,fontWeight:700,color:tp.color,textTransform:"uppercase",letterSpacing:".05em",marginBottom:2}}>{tp.label}</div>
                                    <div style={{fontSize:13,fontWeight:500,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.n}</div>
                                  </div>
                                </div>
                                {/* DataRow right */}
                                <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                                  <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{h.date}</span>
                                  {h.detail && hSep}
                                  {h.detail && <span style={{fontSize:11,color:T.textS,whiteSpace:"nowrap"}}>{h.detail}</span>}
                                  {h.cost && hSep}
                                  {h.cost && <span style={{fontSize:11.5,color:T.text,fontWeight:500,whiteSpace:"nowrap"}}>{h.cost}</span>}
                                </div>
                              </div>
                            );
                          });
                        })()}
                        <div style={{padding:"8px 14px"}}>
                          <button className="btn-sm" style={{width:"100%",fontSize:11}}
                            onClick={()=>setLogPetHistOpen({petId:pet.id})}>+ Log entry</button>
                        </div>
                      </div>
                    </GroupHeader>

                  </div>
                )}
              </div>
            );
          })}
          <button className="btn-sm" style={{width:"100%",fontSize:11,marginTop:2}} onClick={()=>setPetAddOpen(true)}>+ Add pet</button>
        </div>
      );
    })(),
  };

  return (
    <div>
      {modal     && (modal._gk === "recurring" || modal._isRoutine ? RoutineModal() : TaskModal())}
      {noteModal && NoteModal()}
      <div className="nav-tabs">{Object.keys(views).map(t=><div key={t} className={`nav-tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>{t}</div>)}</div>
      {views[tab]||<div style={{color:T.textS,fontSize:13}}>Coming soon</div>}

      {/* ── Log Cars History Modal ── */}
      {logServiceOpen && (
        <>
          <div onClick={()=>setLogServiceOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
          <div style={{...modalShell}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
              <div>
                <div style={{fontSize:15,fontWeight:700}}>🔧 Log Cars History Entry</div>
                <div style={{fontSize:11,color:T.textS,marginTop:2}}>Record a service, MOT, mileage, or other vehicle event</div>
              </div>
              <button onClick={()=>setLogServiceOpen(false)} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
            </div>
            <label style={fldLbl}>Entry type</label>
            <div style={{position:"relative"}}>
              <select style={{...fldInp,paddingRight:28}}>
                {["Service","MOT","Tyre replacement","Mileage log","Insurance renewal","Repair","Other"].map(o=><option key={o}>{o}</option>)}
              </select>
              <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
            </div>
            <label style={fldLbl}>Date completed</label>
            <input type="date" style={{...fldInp,colorScheme:"dark"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={fldLbl}>Mileage</label>
                <input style={fldInp} placeholder="e.g. 43,200 mi"/>
              </div>
              <div>
                <label style={fldLbl}>Cost</label>
                <input style={fldInp} placeholder="e.g. £285"/>
              </div>
            </div>
            <label style={fldLbl}>Provider / garage</label>
            <input style={fldInp} placeholder="e.g. Kwik Fit Manchester"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={fldLbl}>For</label>
                <div style={{position:"relative"}}>
                  <select style={{...fldInp,paddingRight:28}}>
                    {MEMBERS_AC.map(m=><option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                    <option value="Family">👥 Family</option>
                    <option value="HMG">🛡 Household Managers</option>
                  </select>
                  <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                </div>
              </div>
              <div>
                <label style={fldLbl}>Visible to</label>
                <div style={{position:"relative"}}>
                  <select defaultValue="family" style={{...fldInp,paddingRight:28}}>
                    {MEMBERS_AC.map(m=><option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                    <option value="family">👥 Family</option>
                    <option value="hmg">🛡 Household Managers</option>
                  </select>
                  <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                </div>
              </div>
            </div>
            <label style={fldLbl}>Notes</label>
            <textarea style={{...fldInp,resize:"vertical",minHeight:60}} placeholder="e.g. Brake pads replaced, all checks passed"/>
            <label style={fldLbl}>Attach document (optional)</label>
            <input id="history-attach" type="file" style={{display:"none"}}
              onChange={e=>setHistoryAttach(e.target.files?.[0]?.name||"")}/>
            <label htmlFor="history-attach"
              style={{display:"block",border:`1px dashed ${T.border}`,borderRadius:8,padding:"12px",
                textAlign:"center",color:historyAttach?T.teal:T.textS,fontSize:12,cursor:"pointer",background:T.card2}}>
              {historyAttach ? `📎 ${historyAttach}` : "📎 Click to upload or drag and drop"}
            </label>
            <div style={{display:"flex",gap:8,marginTop:20}}>
              <button onClick={()=>{setLogServiceOpen(false);setHistoryAttach("");}} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
              <button onClick={()=>{setLogServiceOpen(false);setHistoryAttach("");}} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save entry</button>
            </div>
          </div>
        </>
      )}

      {/* ── Log Home History Modal ── */}
      {logMaintenanceOpen && (()=>{
        const arw = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const close = ()=>setLogMaintenanceOpen(false);
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>🏠 Log Home History Entry</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>Record a repair, maintenance task, or home improvement</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Entry type</label>
              <div style={{position:"relative"}}>
                <select name="lh-type" style={{...fldInp,paddingRight:28}}>
                  {["repair","service","improvement","decoration","inspection"].map(o=>(
                    <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>
                  ))}
                </select><span style={arw}>▾</span>
              </div>
              <label style={fldLbl}>Description</label>
              <input name="lh-desc" style={fldInp} placeholder="e.g. Boiler annual service"/>
              <label style={fldLbl}>Date completed</label>
              <input name="lh-date" type="date" style={{...fldInp,colorScheme:"dark"}}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Provider / contractor</label>
                  <input name="lh-detail" style={fldInp} placeholder="e.g. British Gas"/>
                </div>
                <div>
                  <label style={fldLbl}>Cost</label>
                  <input name="lh-cost" style={fldInp} placeholder="e.g. £180"/>
                </div>
              </div>
              <label style={fldLbl}>Notes</label>
              <textarea name="lh-notes" style={{...fldInp,resize:"vertical",minHeight:60}} placeholder="e.g. No issues found, next due Nov 2026"/>
              {/* ForVisPair */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
                <div>
                  <label style={fldLbl}>For</label>
                  <div style={{position:"relative"}}>
                    <select name="lh-for" style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="Family">👥 Family</option>
                      <option value="HMG">🛡 Household Managers</option>
                    </select><span style={arw}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Visible to</label>
                  <div style={{position:"relative"}}>
                    <select name="lh-vis" defaultValue="family" style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="family">👥 Family</option>
                      <option value="hmg">🛡 Household Managers</option>
                    </select><span style={arw}>▾</span>
                  </div>
                </div>
              </div>
              <label style={fldLbl}>Attach document (optional)</label>
              <div style={{border:`1px dashed ${T.border}`,borderRadius:8,padding:"12px",textAlign:"center",color:T.textS,fontSize:12,cursor:"pointer",background:T.card2}}>
                📎 Click to upload or drag and drop
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={close} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save entry</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Edit Cars History Item Modal — RowModalSync ── */}
      {carEditItem && (()=>{
        const handleHistSave = () => {
          const f = editHistFormRef.current;
          const g = n => f.querySelector(`[name="${n}"]`)?.value || "";
          const updatedEntry = {...carEditItem,
            type:   g("hist-type")     || carEditItem.type,
            date:   g("hist-date")     || carEditItem.date,
            detail: g("hist-detail")   || carEditItem.detail,
            cost:   g("hist-cost")     || carEditItem.cost,
            notes:  g("hist-notes"),
          };
          setCarsVehicles((vehiclesRef.current||[]).map(v =>
            v.id !== carEditItem._vehicleId ? v : {
              ...v, hist: v.hist.map(h => h.n === carEditItem.n && h.date === carEditItem.date ? updatedEntry : h)
            }
          ));
          setCarEditItem(null);
        };
        return (
          <>
            <div onClick={()=>setCarEditItem(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div ref={editHistFormRef} style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>🔧 Edit Cars History Entry</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>{carEditItem.n}</div>
                </div>
                <button onClick={()=>setCarEditItem(null)} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              {/* Entry type — ▾ arrow wrapper */}
              <label style={fldLbl}>Entry type</label>
              <div style={{position:"relative"}}>
                <select name="hist-type" style={{...fldInp,paddingRight:28}} defaultValue={carEditItem.type||"service"}>
                  {["service","mot","tyre","mileage","insurance","repair"].map(o=>(
                    <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>
                  ))}
                </select>
                <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
              </div>
              {/* Date completed — DateField */}
              <label style={fldLbl}>Date completed</label>
              <input name="hist-date" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={carEditItem.date||""}/>
              {/* Provider / garage */}
              <label style={fldLbl}>Provider / garage</label>
              <input name="hist-detail" style={fldInp} defaultValue={carEditItem.detail||""}/>
              {/* Cost */}
              <label style={fldLbl}>Cost</label>
              <input name="hist-cost" style={fldInp} defaultValue={carEditItem.cost||""}/>
              {/* Notes */}
              <label style={fldLbl}>Notes</label>
              <textarea name="hist-notes" style={{...fldInp,resize:"vertical",minHeight:54}} defaultValue={carEditItem.notes||""} placeholder="e.g. All checks passed"/>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={()=>setCarEditItem(null)} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleHistSave} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save changes</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Edit Home History Item Modal — RowModalSync ── */}
      {homeEditItem && (()=>{
        const handleHomeHistSave = () => {
          const f = editHistFormRef.current;
          const g = n => f.querySelector(`[name="${n}"]`)?.value || "";
          const updated = {...homeEditItem,
            type:   g("hhist-type")                 || homeEditItem.type,
            n:      g("hhist-desc")                 || homeEditItem.n,
            date:   fromDateInput(g("hhist-date"))  || homeEditItem.date,
            detail: g("hhist-detail")               || homeEditItem.detail,
            cost:   g("hhist-cost")                 || homeEditItem.cost,
          };
          setHomesState(prev => (prev || homesRef.current || []).map(p=>
            p.id !== homeEditItem._propertyId ? p : {
              ...p, hist: p.hist.map(h => h.n===homeEditItem.n && h.date===homeEditItem.date ? updated : h)
            }
          ));
          setHomeEditItem(null);
        };
        return (
          <>
            <div onClick={()=>setHomeEditItem(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div key={homeEditItem.n + homeEditItem.date} ref={editHistFormRef} style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>🏠 Edit Home History Entry</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>{homeEditItem.n}</div>
                </div>
                <button onClick={()=>setHomeEditItem(null)} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Entry type</label>
              <div style={{position:"relative"}}>
                <select name="hhist-type" defaultValue={homeEditItem.type||"repair"} style={{...fldInp,paddingRight:28}}>
                  {["repair","service","improvement","decoration","inspection"].map(o=>(
                    <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>
                  ))}
                </select>
                <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
              </div>
              <label style={fldLbl}>Description</label>
              <input name="hhist-desc" style={fldInp} defaultValue={homeEditItem.n||""}/>
              <label style={fldLbl}>Date completed</label>
              <input name="hhist-date" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(homeEditItem.date)}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Provider / contractor</label>
                  <input name="hhist-detail" style={fldInp} defaultValue={homeEditItem.detail||""}/>
                </div>
                <div>
                  <label style={fldLbl}>Cost</label>
                  <input name="hhist-cost" style={fldInp} defaultValue={homeEditItem.cost||""}/>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={()=>setHomeEditItem(null)} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleHomeHistSave} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save changes</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Edit Vehicle Profile Modal ── */}
      {carProfileModal && (()=>{
        const pv = k => (carProfileModal.profile||[]).find(p=>p.k===k)?.v || "";
        const handleEditSave = () => {
          const f = editVehicleFormRef.current;
          const g = n => f.querySelector(`[name="${n}"]`)?.value || "";
          const make=g("make"),model=g("model"),year=g("year"),reg=g("reg"),
                colour=g("colour"),fuel=g("fuel"),body=g("body"),vin=g("vin"),
                purchase=fromDateInput(g("purchase")),owners=g("owners");
          setCarsVehicles((vehiclesRef.current||[]).map(v=>v.id===carProfileModal.id ? {
            ...v,
            name:`${make} ${model}`,
            summary:`${year} · ${colour} · ${fuel} · ${reg}`,
            profile:[
              {k:"Make",v:make},{k:"Model",v:model},{k:"Year",v:year},{k:"Registration",v:reg},
              {k:"Colour",v:colour},{k:"Fuel type",v:fuel},{k:"Body type",v:body},{k:"VIN",v:vin},
              {k:"Purchase date",v:purchase},{k:"No. of owners",v:owners},
            ],
          } : v));
          setCarProfileModal(null);
        };
        return (
          <>
            <div onClick={()=>setCarProfileModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div ref={editVehicleFormRef} style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>{carProfileModal.icon||"🚗"} Edit Vehicle Profile</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>{carProfileModal.name}</div>
                </div>
                <button onClick={()=>setCarProfileModal(null)} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  {lbl:"Make",          name:"make",     ph:"e.g. Honda"},
                  {lbl:"Model",         name:"model",    ph:"e.g. Civic"},
                  {lbl:"Year",          name:"year",     ph:"e.g. 2020"},
                  {lbl:"Registration",  name:"reg",      ph:"e.g. AB12 CDE"},
                  {lbl:"Colour",        name:"colour",   ph:"e.g. Silver"},
                  {lbl:"Fuel type",     name:"fuel",     ph:"Petrol / Diesel / Electric"},
                  {lbl:"Body type",     name:"body",     ph:"e.g. Hatchback"},
                  {lbl:"VIN / Chassis", name:"vin",      ph:"e.g. JHMFC1F36LX012345"},
                ].map(({lbl,name,ph})=>(
                  <div key={lbl}>
                    <label style={fldLbl}>{lbl}</label>
                    <input name={name} style={fldInp} defaultValue={pv(lbl==="VIN / Chassis"?"VIN":lbl)} placeholder={ph}/>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Purchase date</label>
                  <input name="purchase" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(pv("Purchase date"))}/>
                </div>
                <div>
                  <label style={fldLbl}>No. of owners</label>
                  <input name="owners" style={fldInp} defaultValue={pv("No. of owners")} placeholder="e.g. 1 (Sarah Davies)"/>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={()=>setCarProfileModal(null)} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleEditSave} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save changes</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Add Another Vehicle Modal ── */}
      {carAddVehicle && (
        <>
          <div onClick={()=>setCarAddVehicle(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
          <div ref={addVehicleFormRef} style={{...modalShell}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
              <div>
                <div style={{fontSize:15,fontWeight:700}}>🚗 Add Vehicle</div>
                <div style={{fontSize:11,color:T.textS,marginTop:2}}>Add another vehicle to your household</div>
              </div>
              <button onClick={()=>setCarAddVehicle(false)} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {lbl:"Make",         name:"make",   ph:"e.g. Toyota"},
                {lbl:"Model",        name:"model",  ph:"e.g. Yaris"},
                {lbl:"Year",         name:"year",   ph:"e.g. 2022"},
                {lbl:"Registration", name:"reg",    ph:"e.g. EF22 GHI"},
                {lbl:"Colour",       name:"colour", ph:"e.g. Blue"},
                {lbl:"Fuel type",    name:"fuel",   ph:"Petrol / Diesel / Electric"},
              ].map(({lbl,name,ph})=>(
                <div key={lbl}>
                  <label style={fldLbl}>{lbl}</label>
                  <input name={name} style={fldInp} placeholder={ph}/>
                </div>
              ))}
            </div>
            <label style={fldLbl}>Owner</label>
            <input name="owner" style={fldInp} placeholder="e.g. Tom Davies"/>
            {/* ForVisPair */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={fldLbl}>For</label>
                <div style={{position:"relative"}}>
                  <select style={{...fldInp,paddingRight:28}}>
                    {MEMBERS_AC.map(m=><option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                    <option value="Family">👥 Family</option>
                    <option value="HMG">🛡 Household Managers</option>
                  </select>
                  <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                </div>
              </div>
              <div>
                <label style={fldLbl}>Visible to</label>
                <div style={{position:"relative"}}>
                  <select defaultValue="family" style={{...fldInp,paddingRight:28}}>
                    {MEMBERS_AC.map(m=><option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                    <option value="family">👥 Family</option>
                    <option value="hmg">🛡 Household Managers</option>
                  </select>
                  <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:20}}>
              <button onClick={()=>setCarAddVehicle(false)} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
              <button className="btn-sm btn-warm" style={{flex:1,padding:"9px"}} onClick={()=>{
                const f = addVehicleFormRef.current;
                const g = n => f.querySelector(`[name="${n}"]`)?.value||"";
                const make=g("make"),model=g("model"),year=g("year"),reg=g("reg"),
                      colour=g("colour"),fuel=g("fuel"),owner=g("owner");
                const ACCENTS = [T.violet,T.sky,T.sage,T.rose];
                const newVehicle = {
                  id:"v"+Date.now(), icon:"🚗",
                  accent: ACCENTS[Math.floor(Math.random()*ACCENTS.length)],
                  name:`${make||"New"} ${model||"Vehicle"}`,
                  summary:`${year} · ${colour} · ${fuel} · ${reg}`,
                  ops:[{k:"MOT due",v:"—"},{k:"Insurance renewal",v:"—"},{k:"Mileage",v:"—"},{k:"Owner",v:owner}],
                  profile:[
                    {k:"Make",v:make},{k:"Model",v:model},{k:"Year",v:year},{k:"Registration",v:reg},
                    {k:"Colour",v:colour},{k:"Fuel type",v:fuel},{k:"Body type",v:"—"},{k:"VIN",v:"—"},
                    {k:"Purchase date",v:"—"},{k:"No. of owners",v:"1 ("+owner+")"},
                  ],
                  keyDates:[], keyItems:[], hist:[],
                };
                setCarsVehicles([...(vehiclesRef.current||[]), newVehicle]);
                setCarAddVehicle(false);
              }}>Add vehicle</button>
            </div>
          </div>
        </>
      )}

      {/* ── Edit Home Property Profile Modal — RowModalSync ── */}
      {homeProfileModal && (()=>{
        const p = homeProfileModal;
        const arw = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const close = ()=>setHomeProfileModal(null);
        const pf = k => (p.profile||[]).find(x=>x.k===k)?.v||"";
        const handleSave = () => {
          const f = editHomeProfileFormRef.current;
          const g = n => f.querySelector(`[name="${n}"]`)?.value||"";
          const tenure = g("ep-tenure");
          const ownershipType = g("ep-ownership");
          const addr=g("ep-address"), postcode=g("ep-postcode"), town=g("ep-town"),
                propType=g("ep-proptype"), bedrooms=g("ep-bedrooms"), estVal=g("ep-estval"),
                purchaseDate=fromDateInput(g("ep-purchasedate"));
          const updatedProfile = [
            {k:"Address",         v:addr},
            {k:"Postcode",        v:postcode},
            {k:"Town / city",     v:town},
            {k:"Property type",   v:propType},
            {k:"Tenure",          v:tenure==="owned"?"Owned":tenure==="rented"?"Rented":"Letting out"},
            ...(tenure==="owned"?[{k:"Ownership type",v:ownershipType==="leasehold"?"Leasehold":"Freehold"}]:[]),
            {k: tenure==="rented"?"Tenancy start":"Purchase date", v:purchaseDate},
            {k:"No. of bedrooms", v:bedrooms},
            ...(tenure!=="rented"?[{k:"Est. value",v:estVal}]:[]),
          ];
          const updatedMortgage = tenure==="owned" ? {
            provider:g("ep-mprovider"), account:g("ep-maccount"), monthly:g("ep-mmonthly"),
            rateType:g("ep-mrate"),    dealEnd:fromDateInput(g("ep-mdeal")),  mortgageType:g("ep-mtype"),
          } : null;
          const updatedLeasehold = (tenure==="owned" && ownershipType==="leasehold") ? {
            yearsRemaining:g("ep-lyears"), leaseExpiry:g("ep-lexpiry"),
            groundRent:g("ep-lground"),    serviceCharge:g("ep-lservice"),
            freeholder:g("ep-lfree"),      managingAgent:g("ep-lagent"),
          } : null;
          const updatedRental = tenure==="rented" ? {
            landlordAgent:g("ep-rlandlord"), contact:g("ep-rcontact"),
            monthlyRent:g("ep-rrent"),       depositPaid:g("ep-rdeposit"),
            depositScheme:g("ep-rscheme"),   depositRef:g("ep-rref"),
            tenancyStart:fromDateInput(g("ep-rstart")), tenancyEnd:fromDateInput(g("ep-rend")),
          } : null;
          const updatedLetting = tenure==="letting-out" ? {
            tenantName:g("ep-ltenant"),   rentReceived:g("ep-lrent"),
            tenancyStart:fromDateInput(g("ep-lstart")), tenancyEnd:fromDateInput(g("ep-lend")),
            depositHeld:g("ep-ldeposit"), depositScheme:g("ep-lscheme"),
          } : null;
          const addrLine = addr || p.name;
          const tenureLabel = tenure==="owned"?`Owned (${ownershipType})`:tenure==="rented"?"Rented":"Letting out";
          setHomesState(prev=>(prev||homesRef.current||[]).map(hp=>hp.id!==p.id?hp:{
            ...hp,
            name:addrLine, summary:`${town} · ${postcode} · ${tenureLabel}`,
            tenure, ownershipType,
            profile:updatedProfile,
            mortgage:updatedMortgage||hp.mortgage,
            leasehold:updatedLeasehold,
            rental:updatedRental,
            letting:updatedLetting||hp.letting,
          }));
          close();
        };
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div key={p.id} ref={editHomeProfileFormRef} style={{...modalShell,maxHeight:"85vh",overflowY:"auto"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>{p.icon} Edit Property Profile</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>{p.name}</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              {/* Core fields */}
              <label style={fldLbl}>Address</label>
              <input name="ep-address" style={fldInp} defaultValue={pf("Address")}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label style={fldLbl}>Town / city</label><input name="ep-town" style={fldInp} defaultValue={pf("Town / city")}/></div>
                <div><label style={fldLbl}>Postcode</label><input name="ep-postcode" style={fldInp} defaultValue={pf("Postcode")}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Property type</label>
                  <div style={{position:"relative"}}>
                    <select name="ep-proptype" defaultValue={pf("Property type")} style={{...fldInp,paddingRight:28}}>
                      {["Semi-detached","Detached","Terraced","Flat / apartment","Bungalow","Other"].map(o=><option key={o}>{o}</option>)}
                    </select><span style={arw}>▾</span>
                  </div>
                </div>
                <div><label style={fldLbl}>No. of bedrooms</label><input name="ep-bedrooms" style={fldInp} defaultValue={pf("No. of bedrooms")}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Tenure</label>
                  <div style={{position:"relative"}}>
                    <select name="ep-tenure" defaultValue={p.tenure||"owned"} style={{...fldInp,paddingRight:28}}>
                      <option value="owned">Owned</option>
                      <option value="rented">Rented</option>
                      <option value="letting-out">Letting out</option>
                    </select><span style={arw}>▾</span>
                  </div>
                </div>
                {p.tenure==="owned" && (
                  <div>
                    <label style={fldLbl}>Ownership type</label>
                    <div style={{position:"relative"}}>
                      <select name="ep-ownership" defaultValue={p.ownershipType||"freehold"} style={{...fldInp,paddingRight:28}}>
                        <option value="freehold">Freehold</option>
                        <option value="leasehold">Leasehold</option>
                      </select><span style={arw}>▾</span>
                    </div>
                  </div>
                )}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>{p.tenure==="rented"?"Tenancy start":"Purchase date"}</label>
                  <input name="ep-purchasedate" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(pf(p.tenure==="rented"?"Tenancy start":"Purchase date"))}/>
                </div>
                {p.tenure!=="rented" && (
                  <div><label style={fldLbl}>Est. value</label><input name="ep-estval" style={fldInp} defaultValue={pf("Est. value")}/></div>
                )}
              </div>
              {/* Mortgage sub-section (owned) */}
              {p.tenure==="owned" && p.mortgage && (<>
                <div style={{fontSize:10,fontWeight:700,color:T.teal,textTransform:"uppercase",letterSpacing:".05em",marginTop:14,marginBottom:2}}>🏦 Mortgage</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={fldLbl}>Provider</label><input name="ep-mprovider" style={fldInp} defaultValue={p.mortgage?.provider||""}/></div>
                  <div><label style={fldLbl}>Account no.</label><input name="ep-maccount" style={fldInp} defaultValue={p.mortgage?.account||""}/></div>
                  <div><label style={fldLbl}>Monthly</label><input name="ep-mmonthly" style={fldInp} defaultValue={p.mortgage?.monthly||""}/></div>
                  <div><label style={fldLbl}>Rate type</label><input name="ep-mrate" style={fldInp} defaultValue={p.mortgage?.rateType||""}/></div>
                  <div><label style={fldLbl}>Deal end</label><input name="ep-mdeal" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(p.mortgage?.dealEnd||"")}/></div>
                  <div>
                    <label style={fldLbl}>Mortgage type</label>
                    <div style={{position:"relative"}}>
                      <select name="ep-mtype" defaultValue={p.mortgage?.mortgageType||"Repayment"} style={{...fldInp,paddingRight:28}}>
                        {["Repayment","Interest only"].map(o=><option key={o}>{o}</option>)}
                      </select><span style={arw}>▾</span>
                    </div>
                  </div>
                </div>
              </>)}
              {/* Leasehold sub-section */}
              {p.tenure==="owned" && p.ownershipType==="leasehold" && (<>
                <div style={{fontSize:10,fontWeight:700,color:T.violet,textTransform:"uppercase",letterSpacing:".05em",marginTop:14,marginBottom:2}}>📋 Leasehold</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={fldLbl}>Years remaining</label><input name="ep-lyears" style={fldInp} defaultValue={p.leasehold?.yearsRemaining||""}/></div>
                  <div><label style={fldLbl}>Lease expiry</label><input name="ep-lexpiry" style={fldInp} defaultValue={p.leasehold?.leaseExpiry||""}/></div>
                  <div><label style={fldLbl}>Ground rent</label><input name="ep-lground" style={fldInp} defaultValue={p.leasehold?.groundRent||""}/></div>
                  <div><label style={fldLbl}>Service charge</label><input name="ep-lservice" style={fldInp} defaultValue={p.leasehold?.serviceCharge||""}/></div>
                  <div><label style={fldLbl}>Freeholder</label><input name="ep-lfree" style={fldInp} defaultValue={p.leasehold?.freeholder||""}/></div>
                  <div><label style={fldLbl}>Managing agent</label><input name="ep-lagent" style={fldInp} defaultValue={p.leasehold?.managingAgent||""}/></div>
                </div>
              </>)}
              {/* Rental sub-section (user is tenant) */}
              {p.tenure==="rented" && (<>
                <div style={{fontSize:10,fontWeight:700,color:T.sky,textTransform:"uppercase",letterSpacing:".05em",marginTop:14,marginBottom:2}}>🔑 Rental Details</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={fldLbl}>Landlord / agent</label><input name="ep-rlandlord" style={fldInp} defaultValue={p.rental?.landlordAgent||""}/></div>
                  <div><label style={fldLbl}>Contact</label><input name="ep-rcontact" style={fldInp} defaultValue={p.rental?.contact||""}/></div>
                  <div><label style={fldLbl}>Monthly rent</label><input name="ep-rrent" style={fldInp} defaultValue={p.rental?.monthlyRent||""}/></div>
                  <div><label style={fldLbl}>Deposit paid</label><input name="ep-rdeposit" style={fldInp} defaultValue={p.rental?.depositPaid||""}/></div>
                  <div>
                    <label style={fldLbl}>Deposit scheme</label>
                    <div style={{position:"relative"}}>
                      <select name="ep-rscheme" defaultValue={p.rental?.depositScheme||"DPS"} style={{...fldInp,paddingRight:28}}>
                        {["DPS","MyDeposits","TDS","Other"].map(o=><option key={o}>{o}</option>)}
                      </select><span style={arw}>▾</span>
                    </div>
                  </div>
                  <div><label style={fldLbl}>Deposit ref.</label><input name="ep-rref" style={fldInp} defaultValue={p.rental?.depositRef||""}/></div>
                  <div><label style={fldLbl}>Tenancy start</label><input name="ep-rstart" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(p.rental?.tenancyStart||"")}/></div>
                  <div><label style={fldLbl}>Tenancy end</label><input name="ep-rend" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(p.rental?.tenancyEnd||"")}/></div>
                </div>
              </>)}
              {/* Letting sub-section (user is landlord) */}
              {p.tenure==="letting-out" && (<>
                <div style={{fontSize:10,fontWeight:700,color:T.teal,textTransform:"uppercase",letterSpacing:".05em",marginTop:14,marginBottom:2}}>🔑 Letting Details</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={fldLbl}>Tenant(s)</label><input name="ep-ltenant" style={fldInp} defaultValue={p.letting?.tenantName||""}/></div>
                  <div><label style={fldLbl}>Rent received</label><input name="ep-lrent" style={fldInp} defaultValue={p.letting?.rentReceived||""}/></div>
                  <div><label style={fldLbl}>Tenancy start</label><input name="ep-lstart" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(p.letting?.tenancyStart||"")}/></div>
                  <div><label style={fldLbl}>Tenancy end</label><input name="ep-lend" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(p.letting?.tenancyEnd||"")}/></div>
                  <div><label style={fldLbl}>Deposit held</label><input name="ep-ldeposit" style={fldInp} defaultValue={p.letting?.depositHeld||""}/></div>
                  <div>
                    <label style={fldLbl}>Deposit scheme</label>
                    <div style={{position:"relative"}}>
                      <select name="ep-lscheme" defaultValue={p.letting?.depositScheme?.split(" ·")[0]||"MyDeposits"} style={{...fldInp,paddingRight:28}}>
                        {["DPS","MyDeposits","TDS","Other"].map(o=><option key={o}>{o}</option>)}
                      </select><span style={arw}>▾</span>
                    </div>
                  </div>
                </div>
              </>)}
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleSave} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save changes</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Add Property Modal ── */}
      {homeAddProperty && (()=>{
        const arw = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const close = ()=>{setHomeAddProperty(false);setAddHomeTenure("owned");setAddHomeOwnership("freehold");};
        const handleAdd = () => {
          const f = addHomeFormRef.current;
          const g = n => f.querySelector(`[name="${n}"]`)?.value||"";
          const tenure = addHomeTenure;
          const ownershipType = addHomeOwnership;
          const addr=g("ap-address"), postcode=g("ap-postcode"), town=g("ap-town"),
                propType=g("ap-proptype"), bedrooms=g("ap-bedrooms"), estVal=g("ap-estval"),
                purchaseDate=g("ap-purchasedate");
          const tenureLabel = tenure==="owned"?`Owned (${ownershipType})`:tenure==="rented"?"Rented":"Letting out";
          const newProp = {
            id:"hp"+Date.now(), icon:"🏠", accent:T.teal,
            name:addr||"New property",
            summary:`${town} · ${postcode} · ${tenureLabel}`,
            tenure, ownershipType:tenure==="owned"?ownershipType:null,
            ops: tenure==="owned"
              ? [{k:"Tenure",v:tenureLabel},{k:"Est. value",v:estVal},{k:"Mortgage monthly",v:"—"},{k:"Mortgage deal end",v:"—"}]
              : tenure==="rented"
              ? [{k:"Tenure",v:"Rented"},{k:"Monthly rent",v:g("ap-rrent")},{k:"Tenancy end",v:g("ap-rend")},{k:"Landlord",v:g("ap-rlandlord")}]
              : [{k:"Tenure",v:"Letting out"},{k:"Est. value",v:estVal},{k:"Rent received",v:g("ap-lrent")},{k:"Tenancy end",v:g("ap-lend")}],
            profile:[
              {k:"Address",v:addr},{k:"Postcode",v:postcode},{k:"Town / city",v:town},
              {k:"Property type",v:propType},
              {k:"Tenure",v:tenure==="owned"?"Owned":tenure==="rented"?"Rented":"Letting out"},
              ...(tenure==="owned"?[{k:"Ownership type",v:ownershipType==="leasehold"?"Leasehold":"Freehold"}]:[]),
              {k:tenure==="rented"?"Tenancy start":"Purchase date",v:purchaseDate},
              {k:"No. of bedrooms",v:bedrooms},
              ...(tenure!=="rented"?[{k:"Est. value",v:estVal}]:[]),
            ],
            mortgage: tenure==="owned" ? {
              provider:g("ap-mprovider"),account:g("ap-maccount"),monthly:g("ap-mmonthly"),
              rateType:g("ap-mrate"),dealEnd:g("ap-mdeal"),mortgageType:g("ap-mtype"),
            } : null,
            leasehold: (tenure==="owned"&&ownershipType==="leasehold") ? {
              yearsRemaining:g("ap-lyears"),leaseExpiry:g("ap-lexpiry"),
              groundRent:g("ap-lground"),serviceCharge:g("ap-lservice"),
              freeholder:g("ap-lfree"),managingAgent:g("ap-lagent"),
            } : null,
            rental: tenure==="rented" ? {
              landlordAgent:g("ap-rlandlord"),contact:g("ap-rcontact"),
              monthlyRent:g("ap-rrent"),depositPaid:g("ap-rdeposit"),
              depositScheme:g("ap-rscheme"),depositRef:g("ap-rref"),
              tenancyStart:g("ap-rstart"),tenancyEnd:g("ap-rend"),
            } : null,
            letting: tenure==="letting-out" ? {
              tenantName:g("ap-ltenant"),rentReceived:g("ap-lrent"),
              tenancyStart:g("ap-lstart"),tenancyEnd:g("ap-lend"),
              depositHeld:g("ap-ldeposit"),depositScheme:g("ap-lscheme"),
            } : null,
            keyDates:[], keyItems:[], hist:[],
          };
          setHomesState([...(homesRef.current||[]),newProp]);
          close();
        };
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div ref={addHomeFormRef} style={{...modalShell,maxHeight:"85vh",overflowY:"auto"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>🏠 Add Property</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>Add a property to your household</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              {/* Core fields */}
              <label style={fldLbl}>Address</label>
              <input name="ap-address" style={fldInp} placeholder="e.g. 5 Elm Street"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label style={fldLbl}>Town / city</label><input name="ap-town" style={fldInp} placeholder="e.g. Leeds"/></div>
                <div><label style={fldLbl}>Postcode</label><input name="ap-postcode" style={fldInp} placeholder="e.g. LS1 4DY"/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Property type</label>
                  <div style={{position:"relative"}}>
                    <select name="ap-proptype" style={{...fldInp,paddingRight:28}}>
                      {["Semi-detached","Detached","Terraced","Flat / apartment","Bungalow","Other"].map(o=><option key={o}>{o}</option>)}
                    </select><span style={arw}>▾</span>
                  </div>
                </div>
                <div><label style={fldLbl}>No. of bedrooms</label><input name="ap-bedrooms" style={fldInp} placeholder="e.g. 3"/></div>
              </div>
              {/* Tenure selector */}
              <label style={fldLbl}>Tenure</label>
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                {[["owned","Owned"],["rented","Rented"],["letting-out","Letting out"]].map(([val,lbl])=>(
                  <button key={val} type="button"
                    onClick={()=>setAddHomeTenure(val)}
                    style={{flex:1,padding:"6px 4px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",
                      border:`1px solid ${addHomeTenure===val?T.warm:T.border}`,
                      background:addHomeTenure===val?T.warmS:"transparent",
                      color:addHomeTenure===val?T.warm:T.textS}}>
                    {lbl}
                  </button>
                ))}
              </div>
              {/* Owned: ownership type + date + value */}
              {addHomeTenure==="owned" && (<>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <label style={fldLbl}>Ownership type</label>
                    <div style={{display:"flex",gap:6}}>
                      {[["freehold","Freehold"],["leasehold","Leasehold"]].map(([val,lbl])=>(
                        <button key={val} type="button" onClick={()=>setAddHomeOwnership(val)}
                          style={{flex:1,padding:"5px 4px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",
                            border:`1px solid ${addHomeOwnership===val?T.teal:T.border}`,
                            background:addHomeOwnership===val?T.tealS:"transparent",
                            color:addHomeOwnership===val?T.teal:T.textS}}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label style={fldLbl}>Purchase date</label><input name="ap-purchasedate" type="date" style={{...fldInp,colorScheme:"dark"}}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={fldLbl}>Est. value</label><input name="ap-estval" style={fldInp} placeholder="e.g. £320,000"/></div>
                </div>
                <div style={{fontSize:10,fontWeight:700,color:T.teal,textTransform:"uppercase",letterSpacing:".05em",marginTop:12,marginBottom:2}}>🏦 Mortgage (optional)</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={fldLbl}>Provider</label><input name="ap-mprovider" style={fldInp} placeholder="e.g. Halifax"/></div>
                  <div><label style={fldLbl}>Account no.</label><input name="ap-maccount" style={fldInp} placeholder="e.g. H-998877"/></div>
                  <div><label style={fldLbl}>Monthly</label><input name="ap-mmonthly" style={fldInp} placeholder="e.g. £1,240"/></div>
                  <div><label style={fldLbl}>Rate type</label><input name="ap-mrate" style={fldInp} placeholder="e.g. Fixed (2.4%)"/></div>
                  <div><label style={fldLbl}>Deal end</label><input name="ap-mdeal" type="date" style={{...fldInp,colorScheme:"dark"}}/></div>
                  <div>
                    <label style={fldLbl}>Mortgage type</label>
                    <div style={{position:"relative"}}>
                      <select name="ap-mtype" style={{...fldInp,paddingRight:28}}>
                        {["Repayment","Interest only"].map(o=><option key={o}>{o}</option>)}
                      </select><span style={arw}>▾</span>
                    </div>
                  </div>
                </div>
                {addHomeOwnership==="leasehold" && (<>
                  <div style={{fontSize:10,fontWeight:700,color:T.violet,textTransform:"uppercase",letterSpacing:".05em",marginTop:12,marginBottom:2}}>📋 Leasehold</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div><label style={fldLbl}>Years remaining</label><input name="ap-lyears" style={fldInp} placeholder="e.g. 112 years"/></div>
                    <div><label style={fldLbl}>Lease expiry</label><input name="ap-lexpiry" style={fldInp} placeholder="e.g. 2136"/></div>
                    <div><label style={fldLbl}>Ground rent</label><input name="ap-lground" style={fldInp} placeholder="e.g. £250/yr"/></div>
                    <div><label style={fldLbl}>Service charge</label><input name="ap-lservice" style={fldInp} placeholder="e.g. £180/mo"/></div>
                    <div><label style={fldLbl}>Freeholder</label><input name="ap-lfree" style={fldInp} placeholder="e.g. Belgravia Estates Ltd"/></div>
                    <div><label style={fldLbl}>Managing agent</label><input name="ap-lagent" style={fldInp} placeholder="e.g. FirstPort"/></div>
                  </div>
                </>)}
              </>)}
              {/* Rented: rental details */}
              {addHomeTenure==="rented" && (<>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={fldLbl}>Tenancy start</label><input name="ap-purchasedate" type="date" style={{...fldInp,colorScheme:"dark"}}/></div>
                </div>
                <div style={{fontSize:10,fontWeight:700,color:T.sky,textTransform:"uppercase",letterSpacing:".05em",marginTop:12,marginBottom:2}}>🔑 Rental Details</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={fldLbl}>Landlord / agent</label><input name="ap-rlandlord" style={fldInp} placeholder="e.g. Connells Lettings"/></div>
                  <div><label style={fldLbl}>Contact</label><input name="ap-rcontact" style={fldInp} placeholder="e.g. 0113 456 7890"/></div>
                  <div><label style={fldLbl}>Monthly rent</label><input name="ap-rrent" style={fldInp} placeholder="e.g. £1,150"/></div>
                  <div><label style={fldLbl}>Deposit paid</label><input name="ap-rdeposit" style={fldInp} placeholder="e.g. £1,326"/></div>
                  <div>
                    <label style={fldLbl}>Deposit scheme</label>
                    <div style={{position:"relative"}}>
                      <select name="ap-rscheme" style={{...fldInp,paddingRight:28}}>
                        {["DPS","MyDeposits","TDS","Other"].map(o=><option key={o}>{o}</option>)}
                      </select><span style={arw}>▾</span>
                    </div>
                  </div>
                  <div><label style={fldLbl}>Deposit ref.</label><input name="ap-rref" style={fldInp} placeholder="e.g. DPS-449821"/></div>
                  <div><label style={fldLbl}>Tenancy start</label><input name="ap-rstart" type="date" style={{...fldInp,colorScheme:"dark"}}/></div>
                  <div><label style={fldLbl}>Tenancy end</label><input name="ap-rend" type="date" style={{...fldInp,colorScheme:"dark"}}/></div>
                </div>
              </>)}
              {/* Letting out: letting details */}
              {addHomeTenure==="letting-out" && (<>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={fldLbl}>Purchase date</label><input name="ap-purchasedate" type="date" style={{...fldInp,colorScheme:"dark"}}/></div>
                  <div><label style={fldLbl}>Est. value</label><input name="ap-estval" style={fldInp} placeholder="e.g. £185,000"/></div>
                </div>
                <div style={{fontSize:10,fontWeight:700,color:T.teal,textTransform:"uppercase",letterSpacing:".05em",marginTop:12,marginBottom:2}}>🔑 Letting Details</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={fldLbl}>Tenant(s)</label><input name="ap-ltenant" style={fldInp} placeholder="e.g. Mark & Lisa Taylor"/></div>
                  <div><label style={fldLbl}>Rent received</label><input name="ap-lrent" style={fldInp} placeholder="e.g. £875/mo"/></div>
                  <div><label style={fldLbl}>Tenancy start</label><input name="ap-lstart" type="date" style={{...fldInp,colorScheme:"dark"}}/></div>
                  <div><label style={fldLbl}>Tenancy end</label><input name="ap-lend" type="date" style={{...fldInp,colorScheme:"dark"}}/></div>
                  <div><label style={fldLbl}>Deposit held</label><input name="ap-ldeposit" style={fldInp} placeholder="e.g. £1,008"/></div>
                  <div>
                    <label style={fldLbl}>Deposit scheme</label>
                    <div style={{position:"relative"}}>
                      <select name="ap-lscheme" style={{...fldInp,paddingRight:28}}>
                        {["DPS","MyDeposits","TDS","Other"].map(o=><option key={o}>{o}</option>)}
                      </select><span style={arw}>▾</span>
                    </div>
                  </div>
                </div>
              </>)}
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleAdd} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Add property</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Edit / Add Car Key Event (Template) Modal ── */}
      {carKeyEventEdit && (()=>{
        const freqVal = keyEventEditFreq || carKeyEventEdit.freq || "";
        const leadVal = keyEventEditLead || KE_LEAD_DEFAULT[freqVal] || "1d";
        const arw = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const close = ()=>{setCarKeyEventEdit(null);setKeyEventEditFreq("");setKeyEventEditLead("");};
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>{carKeyEventEdit.icon} Edit: {carKeyEventEdit.label}</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>Schedule template · changes apply to future instances</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Label</label>
              <input style={fldInp} defaultValue={carKeyEventEdit.label}/>
              {/* Calendar date picker */}
              <label style={fldLbl}>Anchor / next due date</label>
              <input style={{...fldInp,colorScheme:"dark"}} type="date"/>
              {/* FreqLeadPair — frequency + lead time side by side */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Frequency</label>
                  <div style={{position:"relative"}}>
                    <select value={freqVal} onChange={e=>{setKeyEventEditFreq(e.target.value);setKeyEventEditLead(KE_LEAD_DEFAULT[e.target.value]||"1d");}} style={{...fldInp,paddingRight:28}}>
                      <option value="">One-off / note</option>
                      {["Weekly","Every 2 Weeks","Monthly","Quarterly","Half Yearly","9 Months","Yearly","18 Months","2 Years","3 Years"].map(o=><option key={o}>{o}</option>)}
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
                {freqVal ? (
                  <div>
                    <label style={fldLbl}>Lead time <span style={{color:T.textM,fontWeight:400,textTransform:"none",letterSpacing:0,marginLeft:4}}>before due</span></label>
                    <div style={{position:"relative"}}>
                      <select value={leadVal}
                        onChange={e=>{if(keLeadAllowed(freqVal,e.target.value))setKeyEventEditLead(e.target.value);}}
                        style={{...fldInp,paddingRight:28}}>
                        {KE_LEAD_OPTS.map(([val,lbl])=>{
                          const allowed = keLeadAllowed(freqVal,val);
                          const maxLbl = KE_LEAD_OPTS.find(([v])=>v===KE_LEAD_MAX[freqVal])?.[1]||"";
                          return (
                            <option key={val} value={val} disabled={!allowed}>
                              {lbl}{!allowed?` (max: ${maxLbl})`:""}
                            </option>
                          );
                        })}
                      </select>
                      <span style={arw}>▾</span>
                    </div>
                  </div>
                ) : <div/>}
              </div>
              {freqVal && (<>
                <label style={fldLbl}>Cadence mode</label>
                <div style={{position:"relative"}}>
                  <select style={{...fldInp,paddingRight:28}} defaultValue={carKeyEventEdit.cadence||"fixed"}>
                    <option value="fixed">Fixed — anchor-based (e.g. same date each year)</option>
                    <option value="rolling">Rolling — based on completion date</option>
                  </select>
                  <span style={arw}>▾</span>
                </div>
                <label style={fldLbl}>Instance type</label>
                <div style={{position:"relative"}}>
                  <select style={{...fldInp,paddingRight:28}} defaultValue={carKeyEventEdit.instanceType||"simple"}>
                    <option value="simple">Simple — tick when done</option>
                    <option value="appointment">Appointment — book → attend → complete</option>
                  </select>
                  <span style={arw}>▾</span>
                </div>
              </>)}
              {/* ForVisPair */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
                <div>
                  <label style={fldLbl}>For</label>
                  <div style={{position:"relative"}}>
                    <select style={{...fldInp,paddingRight:28}} defaultValue={carKeyEventEdit.assignedTo||""}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="Family">👥 Family</option>
                      <option value="HMG">🛡 Household Managers</option>
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Visible to</label>
                  <div style={{position:"relative"}}>
                    <select defaultValue="family" style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="family">👥 Family</option>
                      <option value="hmg">🛡 Household Managers</option>
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={close} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save changes</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Add Key Event Modal ── */}
      {addKeyEventOpen && (()=>{
        const freqVal  = keyEventEditFreq;
        const leadVal  = keyEventEditLead || KE_LEAD_DEFAULT[freqVal] || "1d";
        const arw      = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const close    = ()=>{setAddKeyEventOpen(null);setKeyEventEditFreq("");setKeyEventEditLead("");};
        const isCarsEv = addKeyEventOpen.sec==="cars";
        const isPetEv  = addKeyEventOpen.sec==="pet";
        const youName  = MEMBERS_AC.find(m=>m.you)?.name || "";
        const handleAddKE = () => {
          const f = addKeyEventFormRef.current;
          if (!f) return;
          const g = n => f.querySelector(`[name="${n}"]`)?.value||"";
          const label = g("ake-label");
          if (!label.trim()) return;
          const newKE = {
            id:           "ke-" + Date.now(),
            label,
            date:         fromDateInput(g("ake-date")) || "TBC",
            status:       "ok",
            icon:         "📅",
            freq:         freqVal || null,
            cadence:      freqVal ? (g("ake-cadence")||"fixed")  : null,
            instanceType: freqVal ? (g("ake-insttype")||"simple"): null,
            assignedTo:   g("ake-for") || youName,
            createdBy:    youName,
            hasInstance:  false,
          };
          if (isCarsEv) {
            setCarsVehicles(prev => (prev || vehiclesRef.current || []).map(v =>
              v.id !== addKeyEventOpen.vehicleId ? v : {...v, keyDates:[...v.keyDates, newKE]}
            ));
          } else if (isPetEv) {
            setPetsState(prev => (prev || petsRef.current || []).map(p =>
              p.id !== addKeyEventOpen.petId ? p : {...p, keyDates:[...p.keyDates, newKE]}
            ));
          } else {
            setHomesState(prev => (prev || homesRef.current || []).map(p =>
              p.id !== addKeyEventOpen.propertyId ? p : {...p, keyDates:[...p.keyDates, newKE]}
            ));
          }
          close();
        };
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div ref={addKeyEventFormRef} style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>{isCarsEv?"🚗":isPetEv?"🐾":"🏠"} Add Key Event</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>Create a new recurring or one-off event</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Label</label>
              <input name="ake-label" style={fldInp} placeholder={isCarsEv?"e.g. MOT expiry":isPetEv?"e.g. Annual booster / Flea treatment":"e.g. Home insurance renewal"}/>
              <label style={fldLbl}>Anchor / next due date</label>
              <input name="ake-date" type="date" style={{...fldInp,colorScheme:"dark"}}/>
              {/* FreqLeadPair — frequency and lead time side by side */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Frequency</label>
                  <div style={{position:"relative"}}>
                    <select value={freqVal} onChange={e=>{setKeyEventEditFreq(e.target.value);setKeyEventEditLead(KE_LEAD_DEFAULT[e.target.value]||"1d");}} style={{...fldInp,paddingRight:28}}>
                      <option value="">One-off / note</option>
                      {["Weekly","Every 2 Weeks","Monthly","Quarterly","Half Yearly","9 Months","Yearly","18 Months","2 Years","3 Years"].map(o=><option key={o}>{o}</option>)}
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
                {freqVal ? (
                  <div>
                    <label style={fldLbl}>Lead time <span style={{color:T.textM,fontWeight:400,textTransform:"none",letterSpacing:0,marginLeft:4}}>before due</span></label>
                    <div style={{position:"relative"}}>
                      <select value={leadVal}
                        onChange={e=>{if(keLeadAllowed(freqVal,e.target.value))setKeyEventEditLead(e.target.value);}}
                        style={{...fldInp,paddingRight:28}}>
                        {KE_LEAD_OPTS.map(([val,lbl])=>{
                          const allowed = keLeadAllowed(freqVal,val);
                          const maxLbl  = KE_LEAD_OPTS.find(([v])=>v===KE_LEAD_MAX[freqVal])?.[1]||"";
                          return (
                            <option key={val} value={val} disabled={!allowed}>
                              {lbl}{!allowed?` (max: ${maxLbl})`:""}
                            </option>
                          );
                        })}
                      </select>
                      <span style={arw}>▾</span>
                    </div>
                  </div>
                ) : <div/>}
              </div>
              {freqVal && (<>
                <label style={fldLbl}>Cadence mode</label>
                <div style={{position:"relative"}}>
                  <select name="ake-cadence" style={{...fldInp,paddingRight:28}} defaultValue="fixed">
                    <option value="fixed">Fixed — anchor-based (e.g. same date each year)</option>
                    <option value="rolling">Rolling — based on completion date</option>
                  </select>
                  <span style={arw}>▾</span>
                </div>
                <label style={fldLbl}>Instance type</label>
                <div style={{position:"relative"}}>
                  <select name="ake-insttype" style={{...fldInp,paddingRight:28}} defaultValue="simple">
                    <option value="simple">Simple — tick when done</option>
                    <option value="appointment">Appointment — book → attend → complete</option>
                  </select>
                  <span style={arw}>▾</span>
                </div>
              </>)}
              {/* ForVisPair */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
                <div>
                  <label style={fldLbl}>For</label>
                  <div style={{position:"relative"}}>
                    <select name="ake-for" style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="Family">👥 Family</option>
                      <option value="HMG">🛡 Household Managers</option>
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Visible to</label>
                  <div style={{position:"relative"}}>
                    <select name="ake-vis" defaultValue="family" style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="family">👥 Family</option>
                      <option value="hmg">🛡 Household Managers</option>
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleAddKE} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Add key event</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Edit Car Key Info Item Modal ── */}
      {carKeyEdit && (()=>{
        const handleKISave = () => {
          const f = editKeyInfoFormRef.current;
          const g = n => f.querySelector(`[name="${n}"]`)?.value || "";
          const updatedItem = {...carKeyEdit,
            title:   g("ki-title")   || carKeyEdit.title,
            ref:     g("ki-ref")     || carKeyEdit.ref,
            renewal: g("ki-renewal") || carKeyEdit.renewal,
            link:    g("ki-link")    || carKeyEdit.link,
            notes:   g("ki-notes"),
          };
          setCarsVehicles((vehiclesRef.current||[]).map(v =>
            v.id !== carKeyEdit._vehicleId ? v : {
              ...v, keyItems: v.keyItems.map(ki => ki.id === carKeyEdit.id ? updatedItem : ki)
            }
          ));
          setCarKeyEdit(null);
        };
        return (
          <>
            <div onClick={()=>setCarKeyEdit(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div ref={editKeyInfoFormRef} style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>{carKeyEdit.icon} Edit: {carKeyEdit.cat}</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>{carKeyEdit.title}</div>
                </div>
                <button onClick={()=>setCarKeyEdit(null)} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Title / provider</label>
              <input name="ki-title" style={fldInp} defaultValue={carKeyEdit.title}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Policy / reference no.</label>
                  <input name="ki-ref" style={fldInp} defaultValue={carKeyEdit.ref||""}/>
                </div>
                <div>
                  <label style={fldLbl}>Renewal date</label>
                  <input name="ki-renewal" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={carKeyEdit.renewal||""}/>
                </div>
              </div>
              <label style={fldLbl}>Link (optional)</label>
              <input name="ki-link" style={fldInp} defaultValue={carKeyEdit.link||""}/>
              <label style={fldLbl}>Notes (optional)</label>
              <textarea name="ki-notes" style={{...fldInp,resize:"vertical",minHeight:54}} defaultValue={carKeyEdit.notes||""} placeholder="Any additional notes…"/>
              <label style={fldLbl}>Attached document (optional)</label>
              <div style={{border:`1px dashed ${T.border}`,borderRadius:8,padding:"12px",textAlign:"center",color:T.textS,fontSize:12,cursor:"pointer",background:T.card2}}>
                {carKeyEdit.doc ? `📎 ${carKeyEdit.doc.label} · Replace` : "📎 Click to upload or drag and drop"}
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={()=>setCarKeyEdit(null)} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleKISave} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save changes</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Edit Home Key Event Modal — RowModalSync ── */}
      {homeKeyEventEdit && (()=>{
        const freqVal = keyEventEditFreq || homeKeyEventEdit.freq || "";
        const leadVal = keyEventEditLead || KE_LEAD_DEFAULT[freqVal] || "1d";
        const arw = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const close = ()=>{setHomeKeyEventEdit(null);setKeyEventEditFreq("");setKeyEventEditLead("");};
        const handleSave = () => {
          const f = homeKeyEventFormRef.current;
          const g = n => f.querySelector(`[name="${n}"]`)?.value||"";
          const updated = {...homeKeyEventEdit,
            label:        g("hke-label")                    || homeKeyEventEdit.label,
            date:         fromDateInput(g("hke-date"))       || homeKeyEventEdit.date,
            freq:         freqVal                            || null,
            cadence:      g("hke-cadence")                  || homeKeyEventEdit.cadence,
            instanceType: g("hke-insttype")                 || homeKeyEventEdit.instanceType,
            assignedTo:   g("hke-for")                      || homeKeyEventEdit.assignedTo,
          };
          setHomesState(prev => (prev || homesRef.current || []).map(p=>
            p.id!==homeKeyEventEdit._propertyId ? p : {
              ...p, keyDates: p.keyDates.map(kd=>kd.id===homeKeyEventEdit.id ? updated : kd)
            }
          ));
          close();
        };
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div key={homeKeyEventEdit.id} ref={homeKeyEventFormRef} style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>{homeKeyEventEdit.icon} Edit: {homeKeyEventEdit.label}</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>Schedule template · changes apply to future instances</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Label</label>
              <input name="hke-label" style={fldInp} defaultValue={homeKeyEventEdit.label}/>
              <label style={fldLbl}>Anchor / next due date</label>
              <input name="hke-date" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(homeKeyEventEdit.date)}/>
              {/* FreqLeadPair */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Frequency</label>
                  <div style={{position:"relative"}}>
                    <select value={freqVal} onChange={e=>{setKeyEventEditFreq(e.target.value);setKeyEventEditLead(KE_LEAD_DEFAULT[e.target.value]||"1d");}} style={{...fldInp,paddingRight:28}}>
                      <option value="">One-off / note</option>
                      {["Weekly","Every 2 Weeks","Monthly","Quarterly","Half Yearly","9 Months","Yearly","18 Months","2 Years","3 Years"].map(o=><option key={o}>{o}</option>)}
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
                {freqVal ? (
                  <div>
                    <label style={fldLbl}>Lead time <span style={{color:T.textM,fontWeight:400,textTransform:"none",letterSpacing:0,marginLeft:4}}>before due</span></label>
                    <div style={{position:"relative"}}>
                      <select value={leadVal}
                        onChange={e=>{if(keLeadAllowed(freqVal,e.target.value))setKeyEventEditLead(e.target.value);}}
                        style={{...fldInp,paddingRight:28}}>
                        {KE_LEAD_OPTS.map(([val,lbl])=>{
                          const allowed = keLeadAllowed(freqVal,val);
                          const maxLbl = KE_LEAD_OPTS.find(([v])=>v===KE_LEAD_MAX[freqVal])?.[1]||"";
                          return (
                            <option key={val} value={val} disabled={!allowed}>
                              {lbl}{!allowed?` (max: ${maxLbl})`:""}
                            </option>
                          );
                        })}
                      </select>
                      <span style={arw}>▾</span>
                    </div>
                  </div>
                ) : <div/>}
              </div>
              {freqVal && (<>
                <label style={fldLbl}>Cadence mode</label>
                <div style={{position:"relative"}}>
                  <select name="hke-cadence" defaultValue={homeKeyEventEdit.cadence||"fixed"} style={{...fldInp,paddingRight:28}}>
                    <option value="fixed">Fixed — anchor-based (e.g. same date each year)</option>
                    <option value="rolling">Rolling — based on completion date</option>
                  </select><span style={arw}>▾</span>
                </div>
                <label style={fldLbl}>Instance type</label>
                <div style={{position:"relative"}}>
                  <select name="hke-insttype" defaultValue={homeKeyEventEdit.instanceType||"simple"} style={{...fldInp,paddingRight:28}}>
                    <option value="simple">Simple — tick when done</option>
                    <option value="appointment">Appointment — book → attend → complete</option>
                  </select><span style={arw}>▾</span>
                </div>
              </>)}
              {/* ForVisPair */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
                <div>
                  <label style={fldLbl}>For</label>
                  <div style={{position:"relative"}}>
                    <select name="hke-for" defaultValue={homeKeyEventEdit.assignedTo||""} style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="Family">👥 Family</option>
                      <option value="HMG">🛡 Household Managers</option>
                    </select><span style={arw}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Visible to</label>
                  <div style={{position:"relative"}}>
                    <select name="hke-vis" defaultValue="family" style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="family">👥 Family</option>
                      <option value="hmg">🛡 Household Managers</option>
                    </select><span style={arw}>▾</span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleSave} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save changes</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Edit Home Key Info Item Modal — RowModalSync ── */}
      {homeKeyEdit && (()=>{
        const arw = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const handleKISave = () => {
          const f = homeKeyInfoFormRef.current;
          const g = n => f.querySelector(`[name="${n}"]`)?.value||"";
          const updated = {...homeKeyEdit,
            title:      g("hki-title")                  || homeKeyEdit.title,
            detail:     g("hki-detail")                  || homeKeyEdit.detail,
            ref:        g("hki-ref")                     || homeKeyEdit.ref,
            renewal:    fromDateInput(g("hki-renewal"))  || homeKeyEdit.renewal,
            link:       g("hki-link"),
            assignedTo: g("hki-for")                     || homeKeyEdit.assignedTo,
            notes:      g("hki-notes"),
          };
          setHomesState(prev => (prev || homesRef.current || []).map(p=>
            p.id!==homeKeyEdit._propertyId ? p : {
              ...p, keyItems: p.keyItems.map(ki=>ki.id===homeKeyEdit.id ? updated : ki)
            }
          ));
          setHomeKeyEdit(null);
        };
        return (
          <>
            <div onClick={()=>setHomeKeyEdit(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div key={homeKeyEdit.id} ref={homeKeyInfoFormRef} style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>{homeKeyEdit.icon} Edit: {homeKeyEdit.cat}</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>{homeKeyEdit.title}</div>
                </div>
                <button onClick={()=>setHomeKeyEdit(null)} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Title / provider</label>
              <input name="hki-title" style={fldInp} defaultValue={homeKeyEdit.title||""}/>
              <label style={fldLbl}>Details</label>
              <input name="hki-detail" style={fldInp} defaultValue={homeKeyEdit.detail||""}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Policy / reference no.</label>
                  <input name="hki-ref" style={fldInp} defaultValue={homeKeyEdit.ref||""}/>
                </div>
                <div>
                  <label style={fldLbl}>Renewal date</label>
                  <input name="hki-renewal" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(homeKeyEdit.renewal||"")}/>
                </div>
              </div>
              <label style={fldLbl}>Link (optional)</label>
              <input name="hki-link" style={fldInp} defaultValue={homeKeyEdit.link||""} placeholder="e.g. directline.com"/>
              {/* ForVisPair */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
                <div>
                  <label style={fldLbl}>For</label>
                  <div style={{position:"relative"}}>
                    <select name="hki-for" defaultValue={homeKeyEdit.assignedTo||""} style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="Family">👥 Family</option>
                      <option value="HMG">🛡 Household Managers</option>
                    </select><span style={arw}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Visible to</label>
                  <div style={{position:"relative"}}>
                    <select name="hki-vis" defaultValue="family" style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="family">👥 Family</option>
                      <option value="hmg">🛡 Household Managers</option>
                    </select><span style={arw}>▾</span>
                  </div>
                </div>
              </div>
              <label style={fldLbl}>Notes (optional)</label>
              <textarea name="hki-notes" style={{...fldInp,resize:"vertical",minHeight:54}} defaultValue={homeKeyEdit.notes||""} placeholder="Any additional notes…"/>
              <label style={fldLbl}>Attached document (optional)</label>
              <div style={{border:`1px dashed ${T.border}`,borderRadius:8,padding:"12px",textAlign:"center",color:T.textS,fontSize:12,cursor:"pointer",background:T.card2}}>
                {homeKeyEdit.doc ? `📎 ${homeKeyEdit.doc.label} · Replace` : "📎 Click to upload or drag and drop"}
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={()=>setHomeKeyEdit(null)} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleKISave} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save changes</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Add Document / Task / Key Info Item Modal ── */}
      {carAddModal && (()=>{
        const isDoc  = carAddModal.type==="doc";
        const isKey  = carAddModal.type==="key";
        const isCars = carAddModal.sec==="cars";
        const isPet  = carAddModal.sec==="pet";
        const close = ()=>setCarAddModal(null);
        const title = isDoc
          ? (isCars?"🚗 Upload Vehicle Document":isPet?"🐾 Upload Pet Document":"🏠 Upload Home Document")
          : isKey
            ? (isCars?"🔑 Add Key Info Item (Vehicle)":isPet?"🔑 Add Key Info Item (Pet)":"🔑 Add Key Info Item (Home)")
            : (isCars?"✅ Add Vehicle Task":isPet?"✅ Add Pet Task":"✅ Add Home Task");
        const sub = isDoc
          ? "Save a document for quick reference"
          : isKey
            ? "Add insurance, a contact, a certificate, or any key pet reference"
            : "Add a one-off or recurring task or appointment";
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>{title}</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>{sub}</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              {isDoc ? (
                <>
                  <label style={fldLbl}>Document name</label>
                  <input style={fldInp} placeholder="e.g. Insurance Certificate 2025"/>
                  <label style={fldLbl}>Document type</label>
                  <select style={{...fldInp,paddingRight:28}}>
                    {["Insurance","Certificate","Contract / Agreement","Identity","Other"].map(o=><option key={o}>{o}</option>)}
                  </select>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <label style={fldLbl}>Date added</label>
                      <input type="date" style={{...fldInp,colorScheme:"dark"}}/>
                    </div>
                    <div>
                      <label style={fldLbl}>Expiry date</label>
                      <input type="date" style={{...fldInp,colorScheme:"dark"}}/>
                    </div>
                  </div>
                  <label style={fldLbl}>Upload file</label>
                  <div style={{border:`1px dashed ${T.border}`,borderRadius:8,padding:"16px",textAlign:"center",color:T.textS,fontSize:12,cursor:"pointer",background:T.card2}}>
                    📎 Click to upload or drag and drop
                  </div>
                </>
              ) : isKey ? (
                <>
                  <label style={fldLbl}>Category</label>
                  <div style={{position:"relative"}}>
                    <select style={{...fldInp,paddingRight:28}}>
                      {(isCars
                        ? ["Insurance","Breakdown Cover","Logbook (V5C)","MOT Certificate","Tyre Spec","Garage Contact","Other"]
                        : isPet
                          ? ["Pet Insurance","Vet Practice","Groomer","Pet Sitter","Other"]
                          : ["Home Insurance","Mortgage","EPC Certificate","Security","Boiler Engineer","Plumber","Electrician","Letting Agent","Other"]
                      ).map(o=><option key={o}>{o}</option>)}
                    </select>
                    <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                  </div>
                  <label style={fldLbl}>Title / provider</label>
                  <input style={fldInp} placeholder={isCars?"e.g. Admiral · Fully comprehensive":isPet?"e.g. Petplan · Accident & illness":"e.g. Direct Line · Buildings & contents"}/>
                  <label style={fldLbl}>Details</label>
                  <input style={fldInp} placeholder={isCars?"e.g. Policy AA-44821 · Renewal Aug 2026":isPet?"e.g. Policy PP-44821 · Renewal 01-Mar-2026":"e.g. Policy DL-88123 · Renewal 10-Apr-2026"}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <label style={fldLbl}>Policy / reference no.</label>
                      <input style={fldInp} placeholder="e.g. Policy AA-44821"/>
                    </div>
                    <div>
                      <label style={fldLbl}>Renewal date</label>
                      <input type="date" style={{...fldInp,colorScheme:"dark"}}/>
                    </div>
                  </div>
                  <label style={fldLbl}>Link (optional)</label>
                  <input style={fldInp} placeholder="e.g. kwikfit.com/book"/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <label style={fldLbl}>For</label>
                      <div style={{position:"relative"}}>
                        <select style={{...fldInp,paddingRight:28}}>
                          {MEMBERS_AC.map(m=><option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                          <option value="Family">👥 Family</option>
                          <option value="HMG">🛡 Household Managers</option>
                        </select>
                        <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                      </div>
                    </div>
                    <div>
                      <label style={fldLbl}>Visible to</label>
                      <div style={{position:"relative"}}>
                        <select defaultValue="family" style={{...fldInp,paddingRight:28}}>
                          {MEMBERS_AC.map(m=><option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                          <option value="family">👥 Family</option>
                          <option value="hmg">🛡 Household Managers</option>
                        </select>
                        <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                      </div>
                    </div>
                  </div>
                  <label style={fldLbl}>Notes (optional)</label>
                  <textarea style={{...fldInp,resize:"vertical",minHeight:54}} placeholder="Any additional notes…"/>
                  <label style={fldLbl}>Attach document (optional)</label>
                  <input id="key-info-attach" type="file" style={{display:"none"}}
                    onChange={e=>setKeyInfoAttach(e.target.files?.[0]?.name||"")}/>
                  <label htmlFor="key-info-attach"
                    style={{display:"block",border:`1px dashed ${T.border}`,borderRadius:8,padding:"12px",
                      textAlign:"center",color:keyInfoAttach?T.teal:T.textS,fontSize:12,cursor:"pointer",background:T.card2}}>
                    {keyInfoAttach ? `📎 ${keyInfoAttach}` : "📎 Click to upload or drag and drop"}
                  </label>
                </>
              ) : (
                <>
                  <label style={fldLbl}>Task name</label>
                  <input style={fldInp} placeholder={isCars?"e.g. Annual MOT":"e.g. Annual Boiler Service"}/>
                  <label style={fldLbl}>Type</label>
                  <div style={{display:"flex",gap:4,background:T.card2,borderRadius:8,padding:3}}>
                    {[["Task","✅"],["Appointment","📅"]].map(([v,ic])=>(
                      <div key={v} style={{flex:1,textAlign:"center",padding:"6px",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",
                        background:v==="Task"?T.surface:"transparent",color:v==="Task"?T.warm:T.textS}}>
                        {ic} {v}
                      </div>
                    ))}
                  </div>
                  <label style={fldLbl}>Recurrence</label>
                  <select style={{...fldInp,paddingRight:28}}>
                    {["One-off","Weekly","Every 2 Weeks","Monthly","Quarterly","Half Yearly","9 Months","Yearly","18 Months","2 Years","3 Years"].map(o=><option key={o}>{o}</option>)}
                  </select>
                  <label style={fldLbl}>Due date</label>
                  <input type="date" style={{...fldInp,colorScheme:"dark"}}/>
                  <label style={fldLbl}>Notes</label>
                  <textarea style={{...fldInp,resize:"vertical",minHeight:54}} placeholder="e.g. Book via AA app, check last service record first"/>
                </>
              )}
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={close} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>
                  {isDoc?"Save document":isKey?"Add item":"Add task"}
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Book Task Modal ── */}
      {bookTaskItem && (()=>{
        const close = ()=>setBookTaskItem(null);
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>📅 Book: {bookTaskItem.n}</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>Add booking details — date, time, and provider</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Date</label>
                  <input type="date" style={{...fldInp,colorScheme:"dark"}}/>
                </div>
                <div>
                  <label style={fldLbl}>Time (optional)</label>
                  <input type="time" style={{...fldInp,colorScheme:"dark"}}/>
                </div>
              </div>
              <label style={fldLbl}>Provider / location</label>
              <input style={fldInp} placeholder="e.g. ATS Euromaster, Manchester"/>
              <label style={fldLbl}>Booking reference (optional)</label>
              <input style={fldInp} placeholder="e.g. REF-12345"/>
              <label style={fldLbl}>Notes (optional)</label>
              <textarea style={{...fldInp,resize:"vertical",minHeight:54}} placeholder="e.g. Bring the V5C logbook"/>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={close} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Confirm booking</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Add Others Routine Modal — FreqLeadPair + ForVisPair ── */}
      {addOthersOpen && (()=>{
        const arw = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const freqVal = keyEventEditFreq;
        const leadVal = keyEventEditLead || KE_LEAD_DEFAULT[freqVal] || "1d";
        const close = ()=>{setAddOthersOpen(false);setKeyEventEditFreq("");setKeyEventEditLead("");};
        const handleAdd = () => {
          const f = addOthersFormRef.current;
          if (!f) return;
          const g = n => f.querySelector(`[name="${n}"]`)?.value||"";
          const label = g("ao-label");
          if (!label.trim()) return;
          const newRoutine = {
            id: "oth-"+Date.now(),
            label,
            freq:      freqVal || "Monthly",
            nextDue:   fromDateInput(g("ao-date")) || "TBC",
            status:    "ok",
            assignedTo:g("ao-for") || MEMBERS_AC.find(m=>m.you)?.name || "James",
            createdBy: MEMBERS_AC.find(m=>m.you)?.name || "James",
          };
          setOthersRoutinesState(prev=>[...(prev ?? [
            {id:"oth1",label:"Monthly budget review",freq:"Monthly",nextDue:"01-Jun-2026",status:"ok",assignedTo:"James",createdBy:"James"},
            {id:"oth2",label:"Annual tax return",freq:"Yearly",nextDue:"31-Jan-2027",status:"ok",assignedTo:"James",createdBy:"James"},
            {id:"oth3",label:"Weekly family briefing",freq:"Weekly",nextDue:"26-May-2026",status:"ok",assignedTo:"HMG",createdBy:"James"},
            {id:"oth4",label:"Monthly bills review",freq:"Monthly",nextDue:"01-Jun-2026",status:"ok",assignedTo:"HMG",createdBy:"Sarah"},
            {id:"oth5",label:"Fortnightly bin collection",freq:"Every 2 Weeks",nextDue:"28-May-2026",status:"ok",assignedTo:"Family",createdBy:"James"},
            {id:"oth6",label:"Monthly family meeting",freq:"Monthly",nextDue:"01-Jun-2026",status:"ok",assignedTo:"Family",createdBy:"James"},
            {id:"oth7",label:"School term holiday planning",freq:"Quarterly",nextDue:"01-Jul-2026",status:"ok",assignedTo:"Family",createdBy:"Sarah"},
          ]), newRoutine]);
          close();
        };
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div ref={addOthersFormRef} style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>📅 Add routine — Others</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>Recurring events with no specific module home</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Routine name</label>
              <input name="ao-label" style={fldInp} placeholder="e.g. Quarterly finance review"/>
              {/* FreqLeadPair */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Frequency</label>
                  <div style={{position:"relative"}}>
                    <select value={freqVal} onChange={e=>{setKeyEventEditFreq(e.target.value);setKeyEventEditLead(KE_LEAD_DEFAULT[e.target.value]||"1d");}} style={{...fldInp,paddingRight:28}}>
                      <option value="">One-off</option>
                      {["Weekly","Every 2 Weeks","Monthly","Quarterly","Half Yearly","9 Months","Yearly","18 Months","2 Years","3 Years"].map(o=><option key={o}>{o}</option>)}
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
                {freqVal ? (
                  <div>
                    <label style={fldLbl}>Lead time</label>
                    <div style={{position:"relative"}}>
                      <select value={leadVal} onChange={e=>{if(keLeadAllowed(freqVal,e.target.value))setKeyEventEditLead(e.target.value);}} style={{...fldInp,paddingRight:28}}>
                        {KE_LEAD_OPTS.map(([val,lbl])=>{
                          const allowed=keLeadAllowed(freqVal,val);
                          const maxLbl=KE_LEAD_OPTS.find(([v])=>v===KE_LEAD_MAX[freqVal])?.[1]||"";
                          return <option key={val} value={val} disabled={!allowed}>{lbl}{!allowed?` (max: ${maxLbl})`:""}</option>;
                        })}
                      </select>
                      <span style={arw}>▾</span>
                    </div>
                  </div>
                ) : <div/>}
              </div>
              <label style={fldLbl}>Next due date</label>
              <input name="ao-date" type="date" style={{...fldInp,colorScheme:"dark"}}/>
              {/* ForVisPair */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>For</label>
                  <div style={{position:"relative"}}>
                    <select name="ao-for" style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="Family">👥 Family</option>
                      <option value="HMG">🛡 Household Managers</option>
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Visible to</label>
                  <div style={{position:"relative"}}>
                    <select name="ao-vis" defaultValue="family" style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="family">👥 Family</option>
                      <option value="hmg">🛡 Household Managers</option>
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
              </div>
              <label style={fldLbl}>Notes (optional)</label>
              <textarea name="ao-notes" style={{...fldInp,resize:"vertical",minHeight:48}} placeholder="Any context or reminders…"/>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleAdd} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Add routine</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Edit Others Routine Modal — RowModalSync ── */}
      {othersEditItem && (()=>{
        const r = othersEditItem;
        const arw = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const freqVal = keyEventEditFreq || r.freq || "";
        const leadVal = keyEventEditLead || KE_LEAD_DEFAULT[freqVal] || "1d";
        const close = ()=>{setOthersEditItem(null);setKeyEventEditFreq("");setKeyEventEditLead("");};
        const OTHERS_FALLBACK = [
          {id:"oth1",label:"Monthly budget review",freq:"Monthly",nextDue:"01-Jun-2026",status:"ok",assignedTo:"James",createdBy:"James"},
          {id:"oth2",label:"Annual tax return",freq:"Yearly",nextDue:"31-Jan-2027",status:"ok",assignedTo:"James",createdBy:"James"},
          {id:"oth3",label:"Weekly family briefing",freq:"Weekly",nextDue:"26-May-2026",status:"ok",assignedTo:"HMG",createdBy:"James"},
          {id:"oth4",label:"Monthly bills review",freq:"Monthly",nextDue:"01-Jun-2026",status:"ok",assignedTo:"HMG",createdBy:"Sarah"},
          {id:"oth5",label:"Fortnightly bin collection",freq:"Every 2 Weeks",nextDue:"28-May-2026",status:"ok",assignedTo:"Family",createdBy:"James"},
          {id:"oth6",label:"Monthly family meeting",freq:"Monthly",nextDue:"01-Jun-2026",status:"ok",assignedTo:"Family",createdBy:"James"},
          {id:"oth7",label:"School term holiday planning",freq:"Quarterly",nextDue:"01-Jul-2026",status:"ok",assignedTo:"Family",createdBy:"Sarah"},
        ];
        const handleSave = () => {
          const f = editOthersFormRef.current;
          if (!f) return;
          const g = n => f.querySelector(`[name="${n}"]`)?.value||"";
          const updated = {...r,
            label:     g("eo-label")                || r.label,
            freq:      freqVal                      || r.freq,
            nextDue:   fromDateInput(g("eo-date"))  || r.nextDue,
            assignedTo:g("eo-for")                  || r.assignedTo,
          };
          setOthersRoutinesState(prev=>(prev??OTHERS_FALLBACK).map(o=>o.id===r.id?updated:o));
          close();
        };
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div key={r.id} ref={editOthersFormRef} style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>📅 Edit routine</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>{r.label}</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Routine name</label>
              <input name="eo-label" style={fldInp} defaultValue={r.label}/>
              {/* FreqLeadPair */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Frequency</label>
                  <div style={{position:"relative"}}>
                    <select value={freqVal} onChange={e=>{setKeyEventEditFreq(e.target.value);setKeyEventEditLead(KE_LEAD_DEFAULT[e.target.value]||"1d");}} style={{...fldInp,paddingRight:28}}>
                      <option value="">One-off</option>
                      {["Weekly","Every 2 Weeks","Monthly","Quarterly","Half Yearly","9 Months","Yearly","18 Months","2 Years","3 Years"].map(o=><option key={o}>{o}</option>)}
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
                {freqVal ? (
                  <div>
                    <label style={fldLbl}>Lead time</label>
                    <div style={{position:"relative"}}>
                      <select value={leadVal} onChange={e=>{if(keLeadAllowed(freqVal,e.target.value))setKeyEventEditLead(e.target.value);}} style={{...fldInp,paddingRight:28}}>
                        {KE_LEAD_OPTS.map(([val,lbl])=>{
                          const allowed=keLeadAllowed(freqVal,val);
                          const maxLbl=KE_LEAD_OPTS.find(([v])=>v===KE_LEAD_MAX[freqVal])?.[1]||"";
                          return <option key={val} value={val} disabled={!allowed}>{lbl}{!allowed?` (max: ${maxLbl})`:""}</option>;
                        })}
                      </select>
                      <span style={arw}>▾</span>
                    </div>
                  </div>
                ) : <div/>}
              </div>
              <label style={fldLbl}>Next due date</label>
              <input name="eo-date" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(r.nextDue)}/>
              {/* ForVisPair */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>For</label>
                  <div style={{position:"relative"}}>
                    <select name="eo-for" defaultValue={r.assignedTo} style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="Family">👥 Family</option>
                      <option value="HMG">🛡 Household Managers</option>
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Visible to</label>
                  <div style={{position:"relative"}}>
                    <select defaultValue="family" style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="family">👥 Family</option>
                      <option value="hmg">🛡 Household Managers</option>
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleSave} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save changes</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Pet Add Modal ── */}
      {petAddOpen && (()=>{
        const close = ()=>setPetAddOpen(false);
        const arw = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const speciesIcons = {Dog:"🐕",Cat:"🐈",Rabbit:"🐇",Bird:"🐦",Other:"🐠"};
        const handleAddPet = () => {
          const f = addPetFormRef.current;
          if (!f) return;
          const g = n => f.querySelector(`[name="${n}"]`)?.value||"";
          const name = g("ap-name");
          if (!name.trim()) return;
          const species = g("ap-species") || "Dog";
          const breed   = g("ap-breed");
          const dob     = fromDateInput(g("ap-dob"));
          const sex     = g("ap-sex");
          const newPet = {
            id:      "pet-" + Date.now(),
            icon:    speciesIcons[species] || "🐾",
            accent:  T.lime,
            name,
            summary: [breed||species, sex].filter(Boolean).join(" · "),
            profile: [
              {k:"Species",       v:species},
              {k:"Breed",         v:breed||"—"},
              {k:"Date of birth", v:dob||"—"},
              {k:"Sex",           v:sex||"—"},
              {k:"Microchip no.", v:g("ap-chip")||"—"},
              {k:"Insurer",       v:g("ap-insurer")||"—"},
              {k:"Policy number", v:g("ap-policy")||"—"},
            ],
            keyDates: [],
            keyItems: [],
            hist:     [],
            aiNudge:  null,
          };
          setPetsState(prev => [...(prev || petsRef.current || []), newPet]);
          close();
        };
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div ref={addPetFormRef} style={{...modalShell,maxHeight:"88vh",overflowY:"auto"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>🐾 Add Pet</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>Add a pet profile to your household</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Species</label>
              <div style={{position:"relative"}}>
                <select name="ap-species" style={{...fldInp,paddingRight:28}}>
                  {[["🐕 Dog","Dog"],["🐈 Cat","Cat"],["🐇 Rabbit","Rabbit"],["🐦 Bird","Bird"],["🐠 Other","Other"]].map(([l,v])=><option key={v} value={v}>{l}</option>)}
                </select>
                <span style={arw}>▾</span>
              </div>
              <label style={fldLbl}>Pet name</label>
              <input name="ap-name" style={fldInp} placeholder="e.g. Biscuit"/>
              <label style={fldLbl}>Breed</label>
              <input name="ap-breed" style={fldInp} placeholder="e.g. Labrador / Moggy"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Date of birth</label>
                  <input name="ap-dob" type="date" style={{...fldInp,colorScheme:"dark"}}/>
                </div>
                <div>
                  <label style={fldLbl}>Sex</label>
                  <div style={{position:"relative"}}>
                    <select name="ap-sex" style={{...fldInp,paddingRight:28}}>
                      {["Male","Female"].map(o=><option key={o}>{o}</option>)}
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
              </div>
              <label style={fldLbl}>Microchip no.</label>
              <input name="ap-chip" style={fldInp} placeholder="e.g. 985112345678901"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Insurer</label>
                  <input name="ap-insurer" style={fldInp} placeholder="e.g. Petplan"/>
                </div>
                <div>
                  <label style={fldLbl}>Policy number</label>
                  <input name="ap-policy" style={fldInp} placeholder="e.g. PP-12345"/>
                </div>
              </div>
              <label style={fldLbl}>Vet practice</label>
              <input name="ap-vet" style={fldInp} placeholder="e.g. Riverside Vets, Manchester"/>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleAddPet} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Add pet</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Edit Pet Profile Modal — RowModalSync ── */}
      {petProfileModal && (()=>{
        const p = petProfileModal;
        const close = ()=>setPetProfileModal(null);
        const arw = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const handleSave = () => {
          const f = editPetProfileFormRef.current;
          if (!f) return;
          const g = n => f.querySelector(`[name="${n}"]`)?.value||"";
          const name=g("pp-name"), breed=g("pp-breed"), dob=fromDateInput(g("pp-dob")),
                sex=g("pp-sex"), chip=g("pp-chip"), insurer=g("pp-insurer"), policy=g("pp-policy");
          const profileKind = p.profile.find(x=>x.k==="Species")?.v||"";
          setPetsState(prev=>(prev||petsRef.current||[]).map(pet=>pet.id!==p.id?pet:{
            ...pet,
            name,
            summary:`${breed} · ${p.summary.split("·").slice(1).join("·").trim()}`,
            profile:[
              {k:"Species",       v:profileKind},
              {k:"Breed",         v:breed},
              {k:"Date of birth", v:dob||p.profile.find(x=>x.k==="Date of birth")?.v||""},
              {k:"Sex",           v:sex},
              {k:"Microchip no.", v:chip},
              {k:"Insurer",       v:insurer},
              {k:"Policy number", v:policy},
            ],
          }));
          close();
        };
        const pf = k => p.profile.find(x=>x.k===k)?.v||"";
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div key={p.id} ref={editPetProfileFormRef} style={{...modalShell,maxHeight:"88vh",overflowY:"auto"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>{p.icon} Edit Pet Profile</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>{p.name}</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Pet name</label>
              <input name="pp-name" style={fldInp} defaultValue={p.name}/>
              <label style={fldLbl}>Breed</label>
              <input name="pp-breed" style={fldInp} defaultValue={pf("Breed")}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Date of birth</label>
                  <input name="pp-dob" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(pf("Date of birth"))}/>
                </div>
                <div>
                  <label style={fldLbl}>Sex</label>
                  <div style={{position:"relative"}}>
                    <select name="pp-sex" style={{...fldInp,paddingRight:28}} defaultValue={pf("Sex")}>
                      {["Male","Female"].map(o=><option key={o}>{o}</option>)}
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
              </div>
              <label style={fldLbl}>Microchip no.</label>
              <input name="pp-chip" style={fldInp} defaultValue={pf("Microchip no.")}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Insurer</label>
                  <input name="pp-insurer" style={fldInp} defaultValue={pf("Insurer")}/>
                </div>
                <div>
                  <label style={fldLbl}>Policy number</label>
                  <input name="pp-policy" style={fldInp} defaultValue={pf("Policy number")}/>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleSave} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save changes</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Edit Pet Key Event Modal — RowModalSync + FreqLeadPair + ForVisPair ── */}
      {petKeyEventEdit && (()=>{
        const kd = petKeyEventEdit;
        const freqVal = keyEventEditFreq || kd.freq || "";
        const leadVal = keyEventEditLead || KE_LEAD_DEFAULT[freqVal] || "1d";
        const arw = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const close = ()=>{setPetKeyEventEdit(null);setKeyEventEditFreq("");setKeyEventEditLead("");};
        const handleSave = () => {
          const f = editPetKeyEventFormRef.current;
          if (!f) return;
          const g = n => f.querySelector(`[name="${n}"]`)?.value||"";
          const updated = {...kd,
            label:      g("pke-label")                || kd.label,
            date:       fromDateInput(g("pke-date"))  || kd.date,
            freq:       freqVal || null,
            assignedTo: g("pke-for")                  || kd.assignedTo,
          };
          setPetsState(prev=>(prev||petsRef.current||[]).map(p=>
            p.id!==kd._petId ? p : {...p, keyDates:p.keyDates.map(d=>d.id===kd.id?updated:d)}
          ));
          close();
        };
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div key={kd.id} ref={editPetKeyEventFormRef} style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>📅 Edit Key Event</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>{kd.label}</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Label</label>
              <input name="pke-label" style={fldInp} defaultValue={kd.label}/>
              <label style={fldLbl}>Next due date</label>
              <input name="pke-date" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(kd.date)}/>
              {/* FreqLeadPair */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Frequency</label>
                  <div style={{position:"relative"}}>
                    <select value={freqVal} onChange={e=>{setKeyEventEditFreq(e.target.value);setKeyEventEditLead(KE_LEAD_DEFAULT[e.target.value]||"1d");}} style={{...fldInp,paddingRight:28}}>
                      <option value="">One-off / note</option>
                      {["Weekly","Every 2 Weeks","Monthly","Quarterly","Half Yearly","9 Months","Yearly","18 Months","2 Years","3 Years"].map(o=><option key={o}>{o}</option>)}
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
                {freqVal ? (
                  <div>
                    <label style={fldLbl}>Lead time</label>
                    <div style={{position:"relative"}}>
                      <select value={leadVal} onChange={e=>{if(keLeadAllowed(freqVal,e.target.value))setKeyEventEditLead(e.target.value);}} style={{...fldInp,paddingRight:28}}>
                        {KE_LEAD_OPTS.map(([val,lbl])=>{
                          const allowed=keLeadAllowed(freqVal,val);
                          const maxLbl=KE_LEAD_OPTS.find(([v])=>v===KE_LEAD_MAX[freqVal])?.[1]||"";
                          return <option key={val} value={val} disabled={!allowed}>{lbl}{!allowed?` (max: ${maxLbl})`:""}</option>;
                        })}
                      </select>
                      <span style={arw}>▾</span>
                    </div>
                  </div>
                ) : <div/>}
              </div>
              {/* ForVisPair */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>For</label>
                  <div style={{position:"relative"}}>
                    <select name="pke-for" defaultValue={kd.assignedTo} style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="Family">👥 Family</option>
                      <option value="HMG">🛡 Household Managers</option>
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Visible to</label>
                  <div style={{position:"relative"}}>
                    <select defaultValue="family" style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="family">👥 Family</option>
                      <option value="hmg">🛡 Household Managers</option>
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleSave} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save changes</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Edit Pet Key Info & Contacts Modal — RowModalSync + ForVisPair ── */}
      {petKeyEdit && !petKeyEdit._new && (()=>{
        const ki = petKeyEdit;
        const arw = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const close = ()=>setPetKeyEdit(null);
        const handleSave = () => {
          const f = editPetKeyItemFormRef.current;
          if (!f) return;
          const g = n => f.querySelector(`[name="${n}"]`)?.value||"";
          const updated = {...ki,
            title:      g("pki-title")                  || ki.title,
            detail:     g("pki-detail")                 || ki.detail,
            ref:        g("pki-ref"),
            renewal:    fromDateInput(g("pki-renewal"))  || ki.renewal,
            assignedTo: g("pki-for")                     || ki.assignedTo,
          };
          setPetsState(prev=>(prev||petsRef.current||[]).map(p=>
            p.id!==ki._petId ? p : {...p, keyItems:p.keyItems.map(i=>i.id===ki.id?updated:i)}
          ));
          close();
        };
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div key={ki.id} ref={editPetKeyItemFormRef} style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>{ki.icon} Edit: {ki.cat}</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>{ki.title}</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Title / provider</label>
              <input name="pki-title" style={fldInp} defaultValue={ki.title||""}/>
              <label style={fldLbl}>Details</label>
              <input name="pki-detail" style={fldInp} defaultValue={ki.detail||""}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Policy / reference no.</label>
                  <input name="pki-ref" style={fldInp} defaultValue={ki.ref||""}/>
                </div>
                <div>
                  <label style={fldLbl}>Renewal date</label>
                  <input name="pki-renewal" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(ki.renewal||"")}/>
                </div>
              </div>
              {/* ForVisPair */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>For</label>
                  <div style={{position:"relative"}}>
                    <select name="pki-for" defaultValue={ki.assignedTo} style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="Family">👥 Family</option>
                      <option value="HMG">🛡 Household Managers</option>
                    </select>
                    <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Visible to</label>
                  <div style={{position:"relative"}}>
                    <select defaultValue="family" style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="family">👥 Family</option>
                      <option value="hmg">🛡 Household Managers</option>
                    </select>
                    <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleSave} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save changes</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Log Pet History Entry Modal — ForVisPair + DateField ── */}
      {logPetHistOpen && (()=>{
        const arw = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const close = ()=>setLogPetHistOpen(null);
        const handleLogSave = () => {
          const f = logPetHistFormRef.current;
          if (!f) return;
          const g = n => f.querySelector(`[name="${n}"]`)?.value||"";
          const desc = g("plh-desc");
          if (!desc.trim()) return;
          const rawDate = g("plh-date");
          const displayDate = rawDate
            ? fromDateInput(rawDate)
            : new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}).replace(/ /g,"-");
          const newEntry = {
            type:   g("plh-type") || "vet-visit",
            n:      desc,
            date:   displayDate,
            detail: g("plh-detail"),
            cost:   g("plh-cost"),
          };
          setPetsState(prev => (prev || petsRef.current || []).map(p =>
            p.id !== logPetHistOpen.petId ? p : {...p, hist:[newEntry, ...p.hist]}
          ));
          close();
        };
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div ref={logPetHistFormRef} style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>🐾 Log History Entry</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>Record a vet visit, vaccination, treatment, or grooming</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Entry type</label>
              <div style={{position:"relative"}}>
                <select name="plh-type" style={{...fldInp,paddingRight:28}}>
                  {[["vet-visit","Vet Visit"],["vaccination","Vaccination"],["treatment","Treatment"],["grooming","Grooming"],["other","Other"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
                <span style={arw}>▾</span>
              </div>
              <label style={fldLbl}>Description</label>
              <input name="plh-desc" style={fldInp} placeholder="e.g. Annual check-up / Annual booster"/>
              <label style={fldLbl}>Date</label>
              <input name="plh-date" type="date" style={{...fldInp,colorScheme:"dark"}}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Provider / vet practice</label>
                  <input name="plh-detail" style={fldInp} placeholder="e.g. Riverside Vets"/>
                </div>
                <div>
                  <label style={fldLbl}>Cost</label>
                  <input name="plh-cost" style={fldInp} placeholder="e.g. £85"/>
                </div>
              </div>
              <label style={fldLbl}>Notes</label>
              <textarea name="plh-notes" style={{...fldInp,resize:"vertical",minHeight:54}} placeholder="e.g. All clear, next check in 12 months"/>
              {/* ForVisPair */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>For</label>
                  <div style={{position:"relative"}}>
                    <select name="plh-for" style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.name}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="Family">👥 Family</option>
                      <option value="HMG">🛡 Household Managers</option>
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Visible to</label>
                  <div style={{position:"relative"}}>
                    <select name="plh-vis" defaultValue="family" style={{...fldInp,paddingRight:28}}>
                      {MEMBERS_AC.map(m=><option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
                      <option value="family">👥 Family</option>
                      <option value="hmg">🛡 Household Managers</option>
                    </select>
                    <span style={arw}>▾</span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleLogSave} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save entry</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Edit Pet History Entry Modal — RowModalSync ── */}
      {petHistEdit && (()=>{
        const h = petHistEdit;
        const arw = {position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS};
        const close = ()=>setPetHistEdit(null);
        const handleSave = () => {
          const f = editPetHistFormRef.current;
          if (!f) return;
          const g = n => f.querySelector(`[name="${n}"]`)?.value||"";
          const updated = {...h,
            type:   g("phe-type")                || h.type,
            n:      g("phe-desc")                || h.n,
            date:   fromDateInput(g("phe-date")) || h.date,
            detail: g("phe-detail")              || h.detail,
            cost:   g("phe-cost"),
          };
          setPetsState(prev=>(prev||petsRef.current||[]).map(p=>
            p.id!==h._petId ? p : {...p, hist:p.hist.map((e,i)=>e.n===h.n&&e.date===h.date?updated:e)}
          ));
          close();
        };
        return (
          <>
            <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(3px)",zIndex:200}}/>
            <div key={h.n+h.date} ref={editPetHistFormRef} style={{...modalShell}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>🐾 Edit History Entry</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2}}>{h.n}</div>
                </div>
                <button onClick={close} style={{fontSize:20,padding:"2px 7px",borderRadius:6,background:T.card2,border:"none",cursor:"pointer",color:T.textS,lineHeight:1,fontFamily:"inherit"}}>✕</button>
              </div>
              <label style={fldLbl}>Entry type</label>
              <div style={{position:"relative"}}>
                <select name="phe-type" defaultValue={h.type||"vet-visit"} style={{...fldInp,paddingRight:28}}>
                  {[["vet-visit","Vet Visit"],["vaccination","Vaccination"],["treatment","Treatment"],["grooming","Grooming"],["other","Other"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
                <span style={arw}>▾</span>
              </div>
              <label style={fldLbl}>Description</label>
              <input name="phe-desc" style={fldInp} defaultValue={h.n||""}/>
              <label style={fldLbl}>Date</label>
              <input name="phe-date" type="date" style={{...fldInp,colorScheme:"dark"}} defaultValue={toDateInput(h.date)}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={fldLbl}>Provider / vet practice</label>
                  <input name="phe-detail" style={fldInp} defaultValue={h.detail||""}/>
                </div>
                <div>
                  <label style={fldLbl}>Cost</label>
                  <input name="phe-cost" style={fldInp} defaultValue={h.cost||""}/>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:20}}>
                <button onClick={close} className="btn-sm" style={{flex:1,padding:"9px"}}>Cancel</button>
                <button onClick={handleSave} className="btn-sm btn-warm" style={{flex:1,padding:"9px"}}>Save changes</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Upload Document Modal ── */}
      {uploadDocOpen && (
        <div onClick={()=>setUploadDocOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.card,borderRadius:16,padding:24,width:"100%",maxWidth:440,display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700}}>Upload Document</div>
              <button onClick={()=>setUploadDocOpen(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:4}}>✕</button>
            </div>
            <div style={{fontSize:12,color:T.textS,marginBottom:16,lineHeight:1.6}}>Add a document to your household vault. Supported formats: PDF, JPG, PNG.</div>
            {/* File picker (visual only) */}
            <div style={{border:`2px dashed ${T.border}`,borderRadius:10,padding:"20px 16px",textAlign:"center",marginBottom:14,cursor:"pointer",background:T.card2}}>
              <div style={{fontSize:28,marginBottom:6}}>📎</div>
              <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>Click to choose a file</div>
              <div style={{fontSize:11.5,color:T.textS}}>or drag and drop here</div>
            </div>
            {[{label:"Document name",placeholder:"e.g. Passport — James Smith",type:"text"},{label:"Expiry date (if applicable)",placeholder:"e.g. 14-Apr-2034",type:"text"}].map((f,i)=>(
              <div key={i} style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:600,color:T.textS,marginBottom:4,letterSpacing:".04em",textTransform:"uppercase"}}>{f.label}</div>
                <input type={f.type} placeholder={f.placeholder} style={{width:"100%",padding:"9px 11px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:600,color:T.textS,marginBottom:6,letterSpacing:".04em",textTransform:"uppercase"}}>Category</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["Identity","Property","Finance","Medical","Vehicle","Other"].map(c=>(
                  <div key={c} onClick={()=>setUploadDocCat(c)} style={{padding:"4px 12px",borderRadius:8,border:`1px solid ${c===uploadDocCat?T.warm:T.border}`,background:c===uploadDocCat?T.warmS:"transparent",color:c===uploadDocCat?T.warm:T.textS,fontSize:12,cursor:"pointer",fontWeight:c===uploadDocCat?600:400}}>{c}</div>
                ))}
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:600,color:T.textS,marginBottom:6,letterSpacing:".04em",textTransform:"uppercase"}}>Visible to</div>
              <select defaultValue="family" style={{width:"100%",padding:"8px 11px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13,outline:"none",fontFamily:"inherit",WebkitAppearance:"none",appearance:"none"}}>
                <option value="just-me">Just me</option>
                <option value="family">Family</option>
                <option value="hmg">Household managers only</option>
              </select>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setUploadDocOpen(false)} className="btn-sm">Cancel</button>
              <button onClick={()=>setUploadDocOpen(false)} className="btn-sm btn-warm">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   HEALTH AREA — family health hub.
   Personal-first. HMG can switch to family view.
   Modules: Overview · Profiles · Medications · Appointments ·
            Emergency Info · Journal.
═══════════════════════════════════════════════════════════ */

/* Members with role + HMG sharing state. you=true = logged-in user. */
const H_MEMBERS = [
  {id:"dip",    name:"Dip",    surname:"", av:"👨", role:"Owner", age:42, dob:"12-Mar-1984", color:T.warm,   you:true,  sharedHMG:true},
  {id:"apala",  name:"Apala",  surname:"", av:"👩", role:"Admin", age:38, dob:"05-Sep-1987", color:T.rose,   sharedHMG:true},
  {id:"sandip", name:"Sandip", surname:"", av:"🧔", role:"Adult", age:32, dob:"22-Jun-1993", color:T.teal,   sharedHMG:true},
  {id:"aaryan", name:"Aaryan", surname:"", av:"👦", role:"Teen",  age:15, dob:"14-Jan-2011", color:T.violet, sharedHMG:false},
  {id:"aarman", name:"Aarman", surname:"", av:"👧", role:"Child", age:9,  dob:"03-Aug-2016", color:T.sky,    sharedHMG:true},
];
const H_byId = id => H_MEMBERS.find(m=>m.id===id) || H_MEMBERS[0];
const H_HMG_IDS = ["dip","apala","sandip"];
const H_isHMG = id => H_HMG_IDS.includes(id);
const H_LOGGED_IN = "dip"; // demo viewer
const H_visibleTo = viewerId => {
  if (H_isHMG(viewerId)) return H_MEMBERS.filter(m => m.id===viewerId || m.sharedHMG || m.role==="Child");
  return [H_byId(viewerId)];
};

/* Per-member health data — all sample/placeholder. */
const HEALTH_DATA = {
  dip:{
    medical:{bloodType:"O+", nhs:"485 777 3456", height:"183 cm", weight:"88 kg", organDonor:"Registered",
      conditions:[{name:"Hypertension", note:"Diagnosed 2024 · controlled with medication"}]},
    allergies:[
      {name:"Penicillin", type:"Drug", severity:"Severe", critical:true, note:"Anaphylaxis risk · EpiPen in kitchen drawer"},
      {name:"Shellfish",  type:"Food", severity:"Mild"},
    ],
    vaccines:[
      {name:"COVID-19 booster", date:"12-Oct-2025"},
      {name:"Flu (annual)",     date:"22-Oct-2025"},
      {name:"Tetanus",          date:"04-Mar-2022"},
    ],
    care:{
      gp:[{name:"Dr Patel", org:"Kirkley Medical Centre", type:"NHS", phone:"01502 511 999"}],
      dentist:[{name:"Mr Cole", org:"Bridge Dental, Lowestoft", type:"Private", phone:"01502 561 200"}],
      optician:[{name:"Specsavers", org:"Lowestoft", type:"Private", phone:"01502 580 700"}],
      specialist:[{name:"Mr Hughes", org:"Cardiology, James Paget Hospital", type:"NHS", phone:"01502 600 100"}],
    },
    meds:[
      {name:"Ramipril",  strength:"5mg",     freq:"Daily 8am",     start:"04-Mar-2024", prescriber:"Dr Patel", pharmacy:"Boots Lowestoft", supply:"NHS", reorderDate:"02-Jun-2026", low:false},
      {name:"Vitamin D", strength:"1000 IU", freq:"Daily morning", start:"01-Jan-2025", prescriber:"Self",     pharmacy:"Tesco",           supply:"OTC", reorderDate:"15-Jul-2026", low:true},
    ],
    medsHistory:[
      {name:"Amoxicillin 500mg", freq:"3× daily", stopped:"22-Feb-2025", reason:"Course complete"},
    ],
    prev:{
      dental:   {last:"08-Nov-2025", cycle:"6 months",  next:"08-May-2026", status:"overdue",  booked:false},
      optician: {last:"03-Apr-2025", cycle:"24 months", next:"03-Apr-2027", status:"upcoming", booked:false},
      screenings:[{name:"Bowel cancer (FIT)", last:"—", next:"At age 50", status:"upcoming"}],
      vaxDue:   [{name:"Flu (annual)", due:"Oct 2026", linked:"Profiles · Flu", status:"upcoming"}],
      custom:   [{name:"Eye pressure (family glaucoma hx)", cycle:"24 months", next:"Mar 2027", status:"upcoming"}],
    },
    recurring:[
      {id:"dip-r1", type:"Dental",   label:"Dental check-up",    cycle:"6 months",  last:"08-Nov-2025", nextDue:"08-May-2026", status:"overdue",  booked:false, bookedDate:null,        provider:"Bridge Dental", visibleTo:"self"},
      {id:"dip-r2", type:"Optician", label:"Eye test",           cycle:"24 months", last:"03-Apr-2025", nextDue:"03-Apr-2027", status:"upcoming", booked:false, bookedDate:null,        provider:"Specsavers Lowestoft", visibleTo:"self"},
      {id:"dip-r3", type:"Screening",label:"Eye pressure check", cycle:"24 months", last:null,          nextDue:"Mar-2027",    status:"upcoming", booked:false, bookedDate:null,        provider:null, visibleTo:"self"},
      {id:"dip-r4", type:"Vaccination",label:"Flu jab (annual)", cycle:"12 months", last:"22-Oct-2025", nextDue:"Oct-2026",    status:"upcoming", booked:false, bookedDate:null,        provider:"Kirkley Medical", visibleTo:"self"},
    ],
    upcoming:[
      {id:"dip-u1", date:"30-May-2026", time:"09:20", type:"GP",        reason:"Blood pressure review",
       provider:"Dr Patel · Kirkley Medical",   location:"Kirkley Rd, Lowestoft NR33",        recurring:false, visibleTo:"self"},
      {id:"dip-u2", date:"17-Jun-2026", time:"14:30", type:"Specialist", reason:"Annual cardiology review",
       provider:"Mr Hughes · James Paget UH",   location:"Lowestoft Rd, Gorleston NR31 6LA",  recurring:false, visibleTo:"self"},
    ],
    past:[
      {id:"dip-p1", date:"08-Nov-2025", type:"Dental",   provider:"Bridge Dental",        outcome:"All clear · next check 6 months",         recurring:true},
      {id:"dip-p2", date:"03-Apr-2025", type:"Optician", provider:"Specsavers Lowestoft", outcome:"Prescription unchanged · review in 2 years", recurring:true},
    ],
    dietary:[],
    contacts:[
      {label:"GP",           name:"Dr Patel",  phone:"01502 511 999"},
      {label:"Cardiologist", name:"Mr Hughes", phone:"01502 600 100"},
      {label:"Next of kin",  name:"Apala",     phone:"07700 900 234"},
    ],
    careNotes:"Takes Ramipril daily at 8am. Severe penicillin allergy — anaphylaxis risk, EpiPen in kitchen drawer. Cardiology review annually under Mr Hughes.",
  },
  apala:{
    medical:{bloodType:"A-", nhs:"485 777 4112", height:"168 cm", weight:"62 kg", organDonor:"Registered",
      conditions:[{name:"Mild asthma", note:"Exercise-induced; well controlled with reliever inhaler"}]},
    allergies:[{name:"Pollen", type:"Environmental", severity:"Moderate"}],
    vaccines:[
      {name:"COVID-19 booster", date:"15-Oct-2025"},
      {name:"Flu (annual)",     date:"22-Oct-2025"},
      {name:"HPV",              date:"12-Jun-2007"},
    ],
    care:{
      gp:[{name:"Dr Patel", org:"Kirkley Medical Centre", type:"NHS", phone:"01502 511 999"}],
      dentist:[{name:"Mr Cole", org:"Bridge Dental, Lowestoft", type:"Private", phone:"01502 561 200"}],
      optician:[{name:"Boots Opticians", org:"Lowestoft", type:"Private", phone:"01502 565 300"}],
      specialist:[],
    },
    meds:[
      {name:"Ventolin inhaler", strength:"100mcg", freq:"As needed", start:"12-Apr-2022", prescriber:"Dr Patel",
       pharmacy:"Boots Lowestoft", supply:"NHS", reorderDate:"30-May-2026", low:false},
    ],
    medsHistory:[],
    prev:{
      dental:   {last:"15-Nov-2025", cycle:"6 months",  next:"15-May-2026", status:"due",      booked:true, bookedDate:"22-May-2026"},
      optician: {last:"10-Oct-2024", cycle:"24 months", next:"10-Oct-2026", status:"upcoming", booked:false},
      screenings:[
        {name:"Cervical (smear)",       last:"04-Feb-2024", next:"Feb 2027",   status:"upcoming"},
        {name:"Breast screening (NHS)", last:"—",           next:"From age 50", status:"upcoming"},
      ],
      vaxDue:[{name:"Flu (annual)", due:"Oct 2026", linked:"Profiles · Flu", status:"upcoming"}],
      custom:[],
    },
    recurring:[
      {id:"apala-r1", type:"Dental",     label:"Dental check-up",       cycle:"6 months",  last:"15-Nov-2025", nextDue:"15-May-2026", status:"due",      booked:true,  bookedDate:"15-Jun-2026", provider:"Bridge Dental",        visibleTo:"self"},
      {id:"apala-r2", type:"Optician",   label:"Eye test",              cycle:"24 months", last:"10-Oct-2024", nextDue:"10-Oct-2026", status:"upcoming", booked:true,  bookedDate:"02-Jun-2026", provider:"Boots Opticians",      visibleTo:"self"},
      {id:"apala-r3", type:"Vaccination",label:"Flu jab (annual)",      cycle:"12 months", last:"22-Oct-2025", nextDue:"Oct-2026",    status:"upcoming", booked:false, bookedDate:null,          provider:"Kirkley Medical",      visibleTo:"self"},
      {id:"apala-r4", type:"Screening",  label:"Cervical smear",        cycle:"36 months", last:"04-Feb-2024", nextDue:"Feb-2027",    status:"upcoming", booked:false, bookedDate:null,          provider:null,                   visibleTo:"self"},
    ],
    upcoming:[
      {id:"apala-u1", date:"22-May-2026", time:"08:30", type:"Dental",   reason:"6-month check", provider:"Bridge Dental",        location:"Lowestoft",  recurring:true,  visibleTo:"self"},
      {id:"apala-u2", date:"02-Jun-2026", time:"14:00", type:"Optician", reason:"Eye test",      provider:"Boots Opticians",      location:"Lowestoft",  recurring:true,  visibleTo:"self"},
    ],
    past:[
      {id:"apala-p1", date:"15-Nov-2025", type:"Dental", provider:"Bridge Dental", outcome:"One small filling · next check in 6 months", recurring:true},
    ],
    dietary:[
      {restriction:"Vegetarian", type:"Lifestyle", note:""},
    ],
    contacts:[
      {label:"GP",          name:"Dr Patel", phone:"01502 511 999"},
      {label:"Next of kin", name:"Dip",      phone:"07700 900 123"},
    ],
    careNotes:"Mild asthma · reliever inhaler as needed. Pollen-sensitive in spring.",
  },
  sandip:{
    medical:{bloodType:"B+", nhs:"485 777 7103", height:"176 cm", weight:"75 kg", organDonor:"Registered",
      conditions:[]},
    allergies:[{name:"Dust mites", type:"Environmental", severity:"Mild"}],
    vaccines:[
      {name:"COVID-19 booster", date:"10-Oct-2025"},
      {name:"Flu (annual)",     date:"22-Oct-2025"},
      {name:"Hepatitis B",      date:"03-Sep-2019"},
    ],
    care:{
      gp:[{name:"Dr Sharma", org:"Kirkley Medical Centre", type:"NHS", phone:"01502 511 999"}],
      dentist:[{name:"Mr Cole", org:"Bridge Dental, Lowestoft", type:"Private", phone:"01502 561 200"}],
      optician:[],
      specialist:[],
    },
    meds:[],
    medsHistory:[
      {name:"Amoxicillin 500mg", freq:"3× daily", stopped:"14-Mar-2025", reason:"Course complete"},
    ],
    prev:{
      dental:   {last:"08-Jan-2026", cycle:"6 months",  next:"08-Jul-2026", status:"upcoming", booked:false},
      optician: {last:"—",           cycle:"24 months", next:"—",           status:"upcoming", booked:false},
      screenings:[],
      vaxDue:[{name:"Flu (annual)", due:"Oct 2026", linked:"Profiles · Flu", status:"upcoming"}],
      custom:[],
    },
    recurring:[
      {id:"sandip-r1", type:"Dental",     label:"Dental check-up",  cycle:"6 months",  last:"08-Jan-2026", nextDue:"08-Jul-2026", status:"upcoming", booked:false, bookedDate:null, provider:"Bridge Dental",    visibleTo:"self"},
      {id:"sandip-r2", type:"Vaccination",label:"Flu jab (annual)", cycle:"12 months", last:"22-Oct-2025", nextDue:"Oct-2026",    status:"upcoming", booked:false, bookedDate:null, provider:"Kirkley Medical",  visibleTo:"self"},
    ],
    upcoming:[],
    past:[
      {id:"sandip-p1", date:"08-Jan-2026", type:"Dental", provider:"Bridge Dental", outcome:"All clear", recurring:true},
    ],
    dietary:[
      {restriction:"Halal", type:"Lifestyle", note:""},
    ],
    contacts:[
      {label:"GP",          name:"Dr Sharma", phone:"01502 511 999"},
      {label:"Next of kin", name:"Apala",     phone:"07700 900 234"},
    ],
    careNotes:"No known conditions. Mild dust mite sensitivity.",
  },
  aaryan:{
    medical:{bloodType:"O+", nhs:"485 777 5008", height:"172 cm", weight:"65 kg", organDonor:"Unknown",
      conditions:[]},
    allergies:[],
    vaccines:[
      {name:"HPV (school programme)", date:"04-May-2023"},
      {name:"3-in-1 booster",         date:"04-May-2023"},
      {name:"MenACWY",                date:"04-May-2023"},
    ],
    care:{
      gp:[{name:"Dr Patel", org:"Kirkley Medical Centre", type:"NHS", phone:"01502 511 999"}],
      dentist:[{name:"Mr Cole", org:"Bridge Dental, Lowestoft", type:"Private", phone:"01502 561 200"}],
      optician:[],
      specialist:[],
    },
    meds:[],
    medsHistory:[
      {name:"Amoxicillin 250mg", freq:"3× daily", stopped:"18-Jan-2025", reason:"Course complete"},
    ],
    prev:{
      dental:   {last:"12-Dec-2025", cycle:"6 months",  next:"12-Jun-2026", status:"upcoming", booked:false},
      optician: {last:"—",           cycle:"24 months", next:"—",           status:"upcoming", booked:false},
      screenings:[],
      vaxDue:[],
      custom:[],
    },
    recurring:[
      {id:"aaryan-r1", type:"Dental", label:"Dental check-up", cycle:"6 months", last:"12-Dec-2025", nextDue:"12-Jun-2026", status:"upcoming", booked:false, bookedDate:null, provider:"Bridge Dental", visibleTo:"hmg"},
    ],
    upcoming:[],
    past:[
      {id:"aaryan-p1", date:"12-Dec-2025", type:"Dental", provider:"Bridge Dental", outcome:"All good", recurring:true},
    ],
    dietary:[
      {restriction:"Halal", type:"Lifestyle", note:""},
    ],
    contacts:[
      {label:"GP",          name:"Dr Patel", phone:"01502 511 999"},
      {label:"Next of kin", name:"Apala",    phone:"07700 900 234"},
    ],
    careNotes:"No known conditions. School medical info on file.",
  },
  aarman:{
    medical:{bloodType:"A+", nhs:"485 777 6291", height:"132 cm", weight:"30 kg", organDonor:"Not set",
      conditions:[{name:"Eczema", note:"Mild; flare-ups in winter, managed with emollient"}]},
    allergies:[
      {name:"Peanuts",    type:"Food",         severity:"Severe", critical:true, note:"Anaphylaxis risk · EpiPen in school bag + kitchen"},
      {name:"Pet dander", type:"Environmental", severity:"Mild"},
    ],
    vaccines:[
      {name:"4-in-1 pre-school",   date:"14-Jun-2020"},
      {name:"MMR (2nd dose)",      date:"14-Jun-2020"},
      {name:"COVID-19 (children)", date:"02-Nov-2023"},
    ],
    care:{
      gp:[{name:"Dr Patel", org:"Kirkley Medical Centre", type:"NHS", phone:"01502 511 999"}],
      dentist:[{name:"Mr Cole", org:"Bridge Dental, Lowestoft", type:"Private", phone:"01502 561 200"}],
      optician:[{name:"Specsavers", org:"Lowestoft", type:"Private", phone:"01502 580 700"}],
      specialist:[{name:"Dr Wong", org:"Paediatric Dermatology", type:"Private", phone:"01603 287 900"}],
    },
    meds:[
      {name:"EpiPen Junior", strength:"0.15mg",   freq:"Emergency only",      start:"01-Mar-2022", prescriber:"Dr Patel",
       pharmacy:"Boots Lowestoft", supply:"NHS", reorderDate:"01-Mar-2027", low:false},
      {name:"E45 cream",     strength:"—",         freq:"Twice daily on flare", start:"01-Nov-2024", prescriber:"Self",
       pharmacy:"Boots",           supply:"OTC", reorderDate:"30-May-2026", low:true},
    ],
    medsHistory:[],
    prev:{
      dental:   {last:"20-Oct-2025", cycle:"6 months",  next:"20-Apr-2026", status:"overdue",  booked:false},
      optician: {last:"03-Sep-2025", cycle:"12 months", next:"03-Sep-2026", status:"upcoming", booked:false},
      screenings:[],
      vaxDue:[{name:"Teen booster (3-in-1, MenACWY)", due:"From age 13", linked:"Profiles · vaccines", status:"upcoming"}],
      custom:[{name:"Dermatology review", cycle:"12 months", next:"Aug 2026", status:"upcoming"}],
    },
    recurring:[
      {id:"aarman-r1", type:"Dental",     label:"Dental check-up",       cycle:"6 months",  last:"20-Oct-2025", nextDue:"20-Apr-2026", status:"overdue",  booked:true,  bookedDate:"07-Jun-2026", provider:"Bridge Dental",         visibleTo:"hmg"},
      {id:"aarman-r2", type:"Optician",   label:"Eye test",              cycle:"12 months", last:"03-Sep-2025", nextDue:"03-Sep-2026", status:"upcoming", booked:false, bookedDate:null,          provider:"Specsavers Lowestoft",  visibleTo:"hmg"},
      {id:"aarman-r3", type:"Specialist", label:"Dermatology review",    cycle:"12 months", last:"15-Aug-2025", nextDue:"Aug-2026",    status:"upcoming", booked:false, bookedDate:null,          provider:"Dr Wong",               visibleTo:"hmg"},
    ],
    upcoming:[
      {id:"aarman-u1", date:"07-Jun-2026", time:"10:00", type:"Dental", reason:"6-month check",
       provider:"Bridge Dental", location:"Lowestoft", recurring:true, visibleTo:"hmg"},
    ],
    past:[
      {id:"aarman-p1", date:"20-Oct-2025", type:"Dental",     provider:"Bridge Dental",         outcome:"One filling · review in 6 months", recurring:true},
      {id:"aarman-p2", date:"15-Aug-2025", type:"Specialist", provider:"Dr Wong (Dermatology)", outcome:"E45 ongoing · annual review",      recurring:true},
    ],
    dietary:[
      {restriction:"Halal",      type:"Lifestyle", note:""},
      {restriction:"Nut-free",   type:"Medical",   note:"Critical peanut allergy — see Allergies section"},
    ],
    contacts:[
      {label:"GP",            name:"Dr Patel", phone:"01502 511 999"},
      {label:"Dermatologist", name:"Dr Wong",  phone:"01603 287 900"},
      {label:"Parent",        name:"Apala",    phone:"07700 900 234"},
      {label:"Parent",        name:"Dip",      phone:"07700 900 123"},
    ],
    careNotes:"Severe peanut allergy — EpiPen in school bag + kitchen drawer. Mild eczema; E45 on flare-ups.",
  },
};

/* Status pill — overdue / due / upcoming / booked.
   Functions, not constants, so they read live T after theme switch. */
const H_pill = (status, customLabel) => {
  const defs = {
    overdue:  {bg:"rgba(229,115,115,0.16)", fg:T.rose,  label:"Overdue"},
    due:      {bg:"rgba(232,160,64,0.18)",  fg:T.amber||T.warm, label:"Due ≤ 7 days"},
    upcoming: {bg:T.card2,                  fg:T.textS, label:"Upcoming"},
    booked:   {bg:"rgba(91,184,138,0.16)",  fg:T.sage,  label:"Booked"},
  };
  const s = defs[status] || defs.upcoming;
  return (
    <span style={{fontSize:10.5, fontWeight:600, padding:"2px 8px", borderRadius:8,
      background:s.bg, color:s.fg, whiteSpace:"nowrap", display:"inline-block"}}>
      {customLabel || s.label}
    </span>
  );
};

const HAvatar = ({m, size=32}) => (
  <div style={{width:size, height:size, borderRadius:"50%", background:m.color+"30",
    border:`1.5px solid ${m.color}`, display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:Math.round(size*0.5), flexShrink:0}}>
    {m.av}
  </div>
);

/* Reusable card-per-member with stacked sub-sections.
   m: member · flags: top-right badges · sections: [{title, content}] */
function HMemberCard({m, flags=[], sections, defaultOpen=false, locked=false, lockMsg, cardStyle}) {
  const [open, setOpen] = useState(defaultOpen);
  /* If every section uses the __custom__ sentinel, render content directly
     without the title label or the shared padding wrapper. */
  const allCustom = sections.every(s => s.title === "__custom__");
  return (
    <div className="card" style={{padding:0, marginBottom:10, overflow:"hidden",
      opacity:locked?0.78:1, ...cardStyle}}>
      <div onClick={()=>!locked && setOpen(!open)}
        style={{padding:"12px 16px", display:"flex", alignItems:"center", gap:12,
          cursor:locked?"not-allowed":"pointer",
          background:open?T.card2:T.card,
          borderBottom:open?`1px solid ${T.border}`:"none",
          transition:"background .15s"}}>
        <HAvatar m={m}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap"}}>
            <div style={{fontSize:14.5, fontWeight:600}}>
              {m.name}
              {m.you && <span style={{fontSize:10, color:T.warm, fontWeight:700, marginLeft:6}}>· You</span>}
            </div>
            <div style={{fontSize:11, color:T.textS}}>{m.role} · age {m.age}</div>
          </div>
        </div>
        <div style={{display:"flex", gap:6, alignItems:"center"}}>
          {flags.map((f,i) => (
            <span key={i} style={{fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:8,
              background:f.bg, color:f.fg, whiteSpace:"nowrap"}}>{f.text}</span>
          ))}
          {locked
            ? <span style={{fontSize:14, color:T.textS}}>🔒</span>
            : <span style={{fontSize:11, color:T.textS,
                transform:`rotate(${open?180:0}deg)`, transition:"transform .2s",
                display:"inline-block", width:14, textAlign:"center"}}>▾</span>}
        </div>
      </div>
      {open && !locked && (
        allCustom
          ? sections.map((s,i) => <div key={i}>{s.content}</div>)
          : <div style={{padding:"4px 16px 14px"}}>
              {sections.map((s,i) => (
                <div key={i} style={{paddingTop:14, borderTop:i===0?"none":`1px dashed ${T.border}`, marginTop:i===0?0:10}}>
                  <div className="card-title" style={{marginBottom:9}}>{s.title}</div>
                  {s.content}
                </div>
              ))}
            </div>
      )}
      {locked && (
        <div style={{padding:"0 16px 14px"}}>
          <div style={{fontSize:11.5, color:T.textS, lineHeight:1.6}}>
            {lockMsg || `${m.name} hasn't shared their health data with the Household Managers Group.`}
          </div>
        </div>
      )}
    </div>
  );
}

const KV = ({k, v, vColor}) => (
  <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline",
    padding:"5px 0", fontSize:12.5, borderBottom:`1px solid ${T.border}`}}>
    <span style={{color:T.textS, fontSize:11.5}}>{k}</span>
    <span style={{color:vColor||T.text, textAlign:"right", maxWidth:"65%"}}>{v}</span>
  </div>
);

/* ── Health area: persistent Overview header panel (Option 3) ── */
/* Always visible above the tab strip regardless of which module is active.
   HMG gets a member chip filter; individuals always see own data only.    */
function HOverviewPanel({allVisible, viewerIsHMG}) {
  const [open, setOpen] = useState(false); // collapsed by default
  const [panelMemberId, setPanelMemberId] = useState("all");

  const panelScope = panelMemberId === "all"
    ? allVisible
    : allVisible.filter(m => m.id === panelMemberId);

  const reorders=[], overdue=[], thisWeek=[], critical=[];
  const MONTH_IDX = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  const today = new Date(2026,4,30); // demo: 30 May 2026
  const weekEnd = new Date(2026,5,6); // demo: 6 Jun 2026

  const parseDate = s => {
    const [d, mon, y] = s.split("-");
    return new Date(parseInt(y), MONTH_IDX[mon], parseInt(d));
  };

  panelScope.forEach(m => {
    const d = HEALTH_DATA[m.id]; if (!d) return;
    d.meds.forEach(med => { if (med.low) reorders.push({m, name:med.name}); });
    d.recurring.forEach(r => { if (r.status==="overdue") overdue.push({m, label:r.label}); });
    d.upcoming.forEach(a => {
      try {
        const dt = parseDate(a.date);
        if (dt >= today && dt <= weekEnd) thisWeek.push({m, type:a.type, date:a.date});
      } catch(e) {}
    });
    d.allergies.forEach(a => { if (a.critical) critical.push({m, name:a.name, sev:a.severity}); });
  });

  /* Collapsed: header row only — shows 4 dot-badges as a glanceable summary */
  const Dot = ({accent, count, label}) => count > 0 ? (
    <span style={{display:"inline-flex", alignItems:"center", gap:4, fontSize:11,
      color:accent, fontWeight:600}}>
      <span style={{width:6, height:6, borderRadius:"50%", background:accent, display:"inline-block"}}/>
      {count} {label}
    </span>
  ) : null;

  /* Expanded: compact horizontal cards — count + one-line hint, no sub-lines */
  const MiniCard = ({accent, accentBg, label, count, hint}) => (
    <div style={{flex:1, minWidth:0, background:accentBg,
      border:`0.5px solid ${accent}44`, borderRadius:7, padding:"7px 10px"}}>
      <div style={{fontSize:9.5, fontWeight:600, color:accent,
        letterSpacing:".04em", textTransform:"uppercase", marginBottom:3}}>{label}</div>
      <div style={{fontSize:18, fontWeight:700, color:T.text, lineHeight:1, marginBottom:3}}>{count}</div>
      <div style={{fontSize:10, color:T.textS, overflow:"hidden",
        textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{hint || "All clear"}</div>
    </div>
  );

  return (
    <div style={{background:T.surface, border:`1px solid ${T.border}`,
      borderRadius:9, marginBottom:12}}>
      {/* Header row — always visible, click to toggle */}
      <div onClick={()=>setOpen(!open)}
        style={{display:"flex", alignItems:"center", gap:10, padding:"7px 12px", cursor:"pointer"}}>
        <span style={{fontSize:10, fontWeight:700, color:T.textS,
          textTransform:"uppercase", letterSpacing:".06em", flexShrink:0}}>Family overview</span>
        {!open && (
          <div style={{display:"flex", gap:10, flex:1, minWidth:0, flexWrap:"wrap"}}>
            <Dot accent={T.rose}  count={critical.length}  label="critical"/>
            <Dot accent={T.amber} count={reorders.length}  label="reorder"/>
            <Dot accent={T.rose}  count={overdue.length}   label="overdue"/>
            <Dot accent={T.teal}  count={thisWeek.length}  label="this week"/>
            {critical.length===0 && reorders.length===0 && overdue.length===0 && thisWeek.length===0 &&
              <span style={{fontSize:11, color:T.textS}}>All clear</span>}
          </div>
        )}
        <span style={{fontSize:11, color:T.textS, marginLeft:"auto", flexShrink:0,
          display:"inline-block", transform:`rotate(${open?180:0}deg)`, transition:"transform .2s"}}>▾</span>
      </div>

      {/* Expanded body */}
      {open && (
        <div style={{padding:"0 10px 10px"}}>
          {viewerIsHMG && (
            <div style={{display:"flex", gap:4, flexWrap:"wrap", marginBottom:8}}>
              {[{id:"all", name:"All"}, ...allVisible].map(m => (
                <button key={m.id} onClick={e=>{e.stopPropagation(); setPanelMemberId(m.id);}}
                  style={{background: panelMemberId===m.id ? T.warmS : "transparent",
                    border:`0.5px solid ${panelMemberId===m.id ? T.warm : T.border}`,
                    borderRadius:20, padding:"1px 9px", fontSize:10.5,
                    color: panelMemberId===m.id ? T.warm : T.textS, cursor:"pointer"}}>
                  {m.name}
                </button>
              ))}
            </div>
          )}
          <div style={{display:"flex", gap:6}}>
            <MiniCard
              accent={T.rose} accentBg="rgba(224,104,104,0.08)"
              label="Critical flags" count={critical.length}
              hint={critical.map(c=>`${c.m.name} · ${c.name}`).join(" · ")||null}
            />
            <MiniCard
              accent={T.amber} accentBg="rgba(216,136,48,0.08)"
              label="Reorder" count={reorders.length}
              hint={reorders.map(r=>`${r.m.name} · ${r.name}`).join(" · ")||null}
            />
            <MiniCard
              accent={T.rose} accentBg="rgba(224,104,104,0.08)"
              label="Overdue" count={overdue.length}
              hint={overdue.map(r=>`${r.m.name} · ${r.label}`).join(" · ")||null}
            />
            <MiniCard
              accent={T.teal} accentBg={T.tealS}
              label="This week" count={thisWeek.length}
              hint={thisWeek.map(r=>`${r.m.name} · ${r.type}`).join(" · ")||null}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Health module: Overview (legacy — kept for reference, no longer a tab) ── */
function HOverview({inScope}) {
  const reorders = [], prevDue = [], upcoming = [], critical = [];
  inScope.forEach(m => {
    const d = HEALTH_DATA[m.id]; if (!d) return;
    d.meds.forEach(med => {
      if (med.low) reorders.push({m, med, urgent:true});
      else if (med.reorderDate) reorders.push({m, med, urgent:false});
    });
    if (d.prev.dental.status==="overdue" || d.prev.dental.status==="due")
      prevDue.push({m, label:"Dental check", item:d.prev.dental});
    if (d.prev.optician.status==="overdue" || d.prev.optician.status==="due")
      prevDue.push({m, label:"Eye test", item:d.prev.optician});
    ["screenings","vaxDue","custom"].forEach(k => d.prev[k].forEach(i => {
      if (i.status==="overdue"||i.status==="due") prevDue.push({m, label:i.name, item:i});
    }));
    d.upcoming.forEach(a => upcoming.push({m, a})); // within 7 days demo
    d.allergies.forEach(a => { if (a.critical) critical.push({m, label:`Allergy · ${a.name}`, sev:a.severity, note:a.note}); });
  });

  const Block = ({title, count, accent, ic, body, empty}) => (
    <div className="card" style={{padding:0}}>
      <div style={{padding:"13px 16px", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${T.border}`}}>
        <div style={{width:30, height:30, borderRadius:8, background:accent+"22", color:accent,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:15}}>{ic}</div>
        <div style={{flex:1, fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700}}>{title}</div>
        <span style={{fontSize:11, color:T.textS, padding:"2px 8px", borderRadius:8, background:T.card2}}>{count}</span>
      </div>
      <div style={{padding:"4px 16px 14px"}}>
        {body && body.length > 0 ? body : <div style={{padding:"14px 0", fontSize:12.5, color:T.textS, textAlign:"center"}}>{empty}</div>}
      </div>
    </div>
  );

  return (
    <div className="g2">
      <Block title="Reorder reminders" accent={T.amber||T.warm} ic="💊" count={`${reorders.length}`}
        empty="No reorders due in the next 30 days."
        body={reorders.length ? reorders.map((r,i) => (
          <div key={i} className="row">
            <HAvatar m={r.m} size={26}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:500}}>{r.med.name} <span style={{color:T.textS, fontWeight:400}}>{r.med.strength}</span></div>
              <div style={{fontSize:11, color:T.textS}}>Reorder by {r.med.reorderDate} · {r.med.pharmacy}</div>
            </div>
            {r.urgent ? H_pill("overdue","Running low") : H_pill("due","Reorder soon")}
          </div>
        )) : null}/>

      <Block title="Appointments due" accent={T.rose} ic="📅" count={`${prevDue.length}`}
        empty="Nothing overdue or due in 7 days."
        body={prevDue.length ? prevDue.map((r,i) => (
          <div key={i} className="row">
            <HAvatar m={r.m} size={26}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:500}}>{r.label}</div>
              <div style={{fontSize:11, color:T.textS}}>Next: {r.item.next || r.item.due || "—"}</div>
            </div>
            {H_pill(r.item.status)}
          </div>
        )) : null}/>

      <Block title="Appointments this week" accent={T.teal} ic="🏥" count={`${upcoming.length}`}
        empty="No appointments in the next 7 days."
        body={upcoming.length ? upcoming.map((r,i) => (
          <div key={i} className="row">
            <HAvatar m={r.m} size={26}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:500}}>{r.a.type}{r.a.reason ? ` · ${r.a.reason}` : ""}</div>
              <div style={{fontSize:11, color:T.textS}}>{r.a.date} · {r.a.time} · {r.a.provider}</div>
            </div>
          </div>
        )) : null}/>

      <Block title="Active critical flags" accent={T.rose} ic="🆘" count={`${critical.length}`}
        empty="No critical flags on file."
        body={critical.length ? critical.map((r,i) => (
          <div key={i} className="row">
            <HAvatar m={r.m} size={26}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:600, color:T.rose}}>{r.label}</div>
              <div style={{fontSize:11, color:T.textS}}>{r.note}</div>
            </div>
            <span style={{fontSize:10.5, fontWeight:700, padding:"2px 8px", borderRadius:8,
              background:"rgba(229,115,115,0.16)", color:T.rose}}>{r.sev}</span>
          </div>
        )) : null}/>
      <div style={{gridColumn:"1/-1",marginTop:4,padding:"10px 12px",borderRadius:9,background:T.tealS,border:`1px solid ${T.teal}33`,fontSize:12.5,color:T.textS,lineHeight:1.6}}>
        <strong style={{color:T.teal}}>🤖 MyPal AI:</strong> Lily's E45 cream is running low and her dentist check-up is overdue. Want me to add a reorder reminder and book an appointment?
        <span style={{marginLeft:10,color:T.teal,fontWeight:600,cursor:"pointer"}}>Do it →</span>
      </div>
    </div>
  );
}

/* ── Health module: Profiles ─────────────────────────────── */

/* Collapsible sub-section within a profile member card.
   onEdit: optional callback — renders an "✎ Edit" button in the header. */
function HProfileSection({title, countLabel, children, defaultOpen=false, onEdit}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{borderTop:`1px solid ${T.border}`}}>
      <div style={{display:"flex", alignItems:"center", gap:8, padding:"9px 14px 9px 16px",
        background:open?T.card2:T.card, transition:"background .15s"}}>
        <div onClick={()=>setOpen(!open)} style={{display:"flex", alignItems:"center", gap:8,
          flex:1, minWidth:0, cursor:"pointer"}}>
          <span style={{flex:1, fontSize:11, fontWeight:700, color:T.textS,
            textTransform:"uppercase", letterSpacing:".06em"}}>{title}</span>
          {countLabel !== undefined && (
            <span style={{fontSize:11, fontWeight:600, padding:"2px 7px", borderRadius:20,
              background:T.card2, color:T.textS, flexShrink:0}}>{countLabel}</span>
          )}
          <span style={{fontSize:11, color:T.textS, display:"inline-block",
            transform:`rotate(${open?180:0}deg)`, transition:"transform .2s",
            width:14, textAlign:"center", flexShrink:0}}>▾</span>
        </div>
        {onEdit && (
          <button className="btn-sm" onClick={e=>{e.stopPropagation(); onEdit();}}
            style={{fontSize:11, padding:"2px 9px", flexShrink:0}}>✎ Edit</button>
        )}
      </div>
      {open && (
        <div style={{borderTop:`1px dashed ${T.border}`}}>
          {children}
        </div>
      )}
    </div>
  );
}

/* Modal wrapper — rose-themed, standard health modal */
function HProfileModal({title, onClose, children}) {
  return (
    <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(3px)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:200}}>
      <div style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:13,
        boxShadow:"0 32px 80px rgba(0,0,0,0.55)", width:"100%", maxWidth:420,
        margin:"0 16px", maxHeight:"90vh", overflowY:"auto"}}>
        <div style={{display:"flex", alignItems:"center", gap:10, padding:"14px 18px",
          borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, background:T.card, zIndex:1}}>
          <div style={{flex:1, fontSize:15, fontWeight:600, color:T.text}}>{title}</div>
          <button className="btn-sm" onClick={onClose} style={{padding:"4px 10px"}}>✕</button>
        </div>
        <div style={{padding:"16px 18px 18px"}}>
          {children}
        </div>
      </div>
    </div>
  );
}

function HProfiles({inScope, viewerId}) {
  /* Local mutable copy of health data — deep cloned so prototype saves don't
     mutate the module-level HEALTH_DATA const used by other health modules. */
  const [profileData, setProfileData] = useState(() => JSON.parse(JSON.stringify(HEALTH_DATA)));
  /* HMG sharing — per member, initialised from H_MEMBERS. Adults + Teens control their own. */
  const [hmgShared, setHmgShared] = useState(() => Object.fromEntries(H_MEMBERS.map(m=>[m.id, m.sharedHMG])));
  const viewerIsHMG = H_isHMG(viewerId);

  /* modal: {type, memberId, record, idx} | null */
  const [modal, setModal] = useState(null);
  /* formVals: controlled form state, pre-populated on open */
  const [formVals, setFormVals] = useState({});
  const setF = (k, v) => setFormVals(p => ({...p, [k]:v}));

  const openAdd  = (type, memberId) => {
    setFormVals({});
    setModal({type, memberId, record:null, idx:null});
  };
  const openEdit = (type, memberId, record, idx) => {
    setFormVals({...record});
    setModal({type, memberId, record, idx});
  };
  const closeModal = () => { setModal(null); setFormVals({}); };

  /* ── Save helpers ── */
  const saveListItem = (memberId, pathKeys, idx, item) => {
    setProfileData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const arr = pathKeys.reduce((o,k) => o[k], next[memberId]);
      if (idx !== null) arr[idx] = item; else arr.push(item);
      return next;
    });
    closeModal();
  };

  const saveCondition = () => {
    const item = {name:(formVals.name||"").trim(), note:(formVals.note||"").trim()};
    if (!item.name) return;
    saveListItem(modal.memberId, ["medical","conditions"], modal.idx, item);
  };

  const saveAllergy = () => {
    const item = {
      name:(formVals.name||"").trim(), type:formVals.type||"Food",
      severity:formVals.severity||"Mild", critical:!!formVals.critical,
      note:(formVals.note||"").trim(),
    };
    if (!item.name) return;
    saveListItem(modal.memberId, ["allergies"], modal.idx, item);
  };

  const saveVaccine = () => {
    const item = {name:(formVals.name||"").trim(), date:(formVals.date||"").trim()};
    if (!item.name) return;
    saveListItem(modal.memberId, ["vaccines"], modal.idx, item);
  };

  const saveProvider = () => {
    const pType = formVals.providerType || "gp";
    const item = {
      name:(formVals.name||"").trim(), org:(formVals.org||"").trim(),
      type:formVals.nhsPrivate||"NHS", phone:(formVals.phone||"").trim(),
    };
    if (!item.name) return;
    setProfileData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const origType = modal.record?.providerType;
      if (modal.idx !== null && origType) {
        if (origType !== pType) {
          next[modal.memberId].care[origType].splice(modal.idx, 1);
          next[modal.memberId].care[pType].push(item);
        } else {
          next[modal.memberId].care[pType][modal.idx] = item;
        }
      } else {
        next[modal.memberId].care[pType].push(item);
      }
      return next;
    });
    closeModal();
  };

  const saveHealthIdentity = () => {
    setProfileData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const med = next[modal.memberId].medical;
      med.bloodType   = formVals.bloodType   ?? med.bloodType;
      med.nhs         = formVals.nhs         ?? med.nhs;
      med.height      = formVals.height      ?? med.height;
      med.weight      = formVals.weight      ?? med.weight;
      med.organDonor  = formVals.organDonor  ?? med.organDonor;
      return next;
    });
    closeModal();
  };

  const saveDietary = () => {
    const item = {
      restriction:(formVals.restriction||"").trim(),
      type:formVals.type||"Lifestyle",
      note:(formVals.note||"").trim(),
    };
    if (!item.restriction) return;
    saveListItem(modal.memberId, ["dietary"], modal.idx, item);
  };

  /* helpers */
  const donorColour = v => v === "Registered" ? T.sage : T.textS;

  /* Reusable record row — pass readOnly to suppress hover/click when editing is not allowed */
  const RecRow = ({onClick, children, last, readOnly}) => (
    <div onClick={readOnly ? undefined : onClick}
      style={{display:"flex", alignItems:"flex-start", gap:8,
        padding:"9px 16px 9px 28px", cursor:readOnly?"default":"pointer",
        borderBottom:last?"none":`1px dashed ${T.border}`,
        background:"transparent", transition:"background .1s"}}
      onMouseEnter={readOnly?undefined:e=>e.currentTarget.style.background=T.card2}
      onMouseLeave={readOnly?undefined:e=>e.currentTarget.style.background="transparent"}>
      {children}
    </div>
  );

  const AddRow = ({onClick, label}) => (
    <div onClick={onClick}
      style={{padding:"8px 16px 10px 28px", fontSize:12, color:T.rose,
        fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:4,
        borderTop:`1px dashed ${T.border}`}}>
      + {label}
    </div>
  );

  return (
    <div>
      {inScope.map(m => {
        const d = profileData[m.id];
        if (!d) return null;
        /* Adults + Teens control their own HMG sharing; profile is locked for HMG viewers
           when sharing is off and they're not the member themselves. */
        const isPrivate = (m.role==="Teen" || m.role==="Adult") && !hmgShared[m.id] && m.id!==viewerId;
        /* Child profiles are managed by HMG only — no edit access for anyone else. */
        const canEdit = m.role !== "Child" || viewerIsHMG;

        const critAllergies = d.allergies.filter(a => a.critical);
        const flags = critAllergies.map(a => ({
          text:`${a.name} — ${a.severity.toLowerCase()}`,
          bg:"rgba(229,115,115,0.16)", fg:T.rose,
        }));
        const providerCount = Object.values(d.care).reduce((n,arr) => n+arr.length, 0);

        return (
          <HMemberCard key={m.id} m={m} flags={flags} locked={isPrivate}
            defaultOpen={m.you}
            cardStyle={{border:`1px solid ${T.rose}33`, borderLeft:`3px solid ${T.rose}`}}
            sections={[

              /* ── HMG sharing toggle (Adult / Teen — own card only) ── */
              ...((m.role==="Adult"||m.role==="Teen") && m.id===viewerId ? [{title:"__custom__", content:(
                <div style={{display:"flex", alignItems:"center", gap:12, padding:"10px 16px",
                  borderBottom:`1px solid ${T.border}`, background:hmgShared[m.id]?`${T.warm}11`:T.card2}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12.5, fontWeight:600, color:T.text}}>Share profile with HMG</div>
                    <div style={{fontSize:11.5, color:T.textS, marginTop:2, lineHeight:1.5}}>
                      Allow Household Managers to view your health profile
                    </div>
                  </div>
                  <div onClick={()=>setHmgShared(p=>({...p,[m.id]:!p[m.id]}))}
                    style={{width:44, height:24, borderRadius:12, cursor:"pointer", flexShrink:0,
                      background:hmgShared[m.id]?T.warm:T.border, position:"relative",
                      transition:"background .2s", userSelect:"none"}}>
                    <div style={{position:"absolute", top:3, width:18, height:18, borderRadius:"50%",
                      background:T.card, transition:"left .2s",
                      left:hmgShared[m.id]?23:3, boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}/>
                  </div>
                </div>
              )}] : []),

              /* ── Health Identity ── */
              {title:"__custom__", content:(
                <HProfileSection title="Health Identity" defaultOpen={false}
                  onEdit={canEdit ? ()=>{
                    setFormVals({
                      bloodType:d.medical.bloodType||"",
                      nhs:d.medical.nhs||"",
                      height:d.medical.height||"",
                      weight:d.medical.weight||"",
                      organDonor:d.medical.organDonor||"Not set",
                    });
                    setModal({type:"healthIdentity", memberId:m.id, record:null, idx:null});
                  } : undefined}>
                  <div style={{padding:"4px 16px 10px"}}>
                    <KV k="Blood type"      v={d.medical.bloodType||"—"}/>
                    <KV k="NHS number"      v={d.medical.nhs||"—"}/>
                    <KV k="Height / Weight"
                      v={(d.medical.height||d.medical.weight)
                        ? `${d.medical.height||"—"} · ${d.medical.weight||"—"}`
                        : "—"}/>
                    <KV k="Organ donor"
                      v={d.medical.organDonor||"Not set"}
                      vColor={donorColour(d.medical.organDonor)}/>
                  </div>
                </HProfileSection>
              )},

              /* ── Conditions ── */
              {title:"__custom__", content:(
                <HProfileSection title="Conditions"
                  countLabel={`${d.medical.conditions.length}`}
                  defaultOpen={false}>
                  {d.medical.conditions.length === 0
                    ? <div style={{padding:"8px 16px", fontSize:12.5, color:T.textS}}>No conditions on file.</div>
                    : d.medical.conditions.map((c,i) => (
                      <RecRow key={i} onClick={()=>openEdit("condition", m.id, c, i)}
                        last={i===d.medical.conditions.length-1} readOnly={!canEdit}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13, fontWeight:500}}>{c.name}</div>
                          {c.note && <div style={{fontSize:11.5, color:T.textS, marginTop:1}}>{c.note}</div>}
                        </div>
                        {canEdit && <span style={{fontSize:12, color:T.textS, flexShrink:0}}>✎</span>}
                      </RecRow>
                    ))}
                  {canEdit && <AddRow onClick={()=>openAdd("condition", m.id)} label="Add condition"/>}
                </HProfileSection>
              )},

              /* ── Allergies ── */
              {title:"__custom__", content:(
                <HProfileSection title="Allergies"
                  countLabel={`${d.allergies.length}`}
                  defaultOpen={false}>
                  {d.allergies.length === 0
                    ? <div style={{padding:"8px 16px", fontSize:12.5, color:T.textS}}>No allergies on file.</div>
                    : d.allergies.map((a,i) => (
                      <RecRow key={i} onClick={()=>openEdit("allergy", m.id, a, i)}
                        last={i===d.allergies.length-1} readOnly={!canEdit}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13, fontWeight:500}}>
                            {a.name}
                            <span style={{color:T.textS, fontWeight:400, marginLeft:6, fontSize:11.5}}>· {a.type}</span>
                          </div>
                          {a.note && <div style={{fontSize:11.5, color:T.textS, marginTop:1}}>{a.note}</div>}
                        </div>
                        {a.critical
                          ? <span style={{fontSize:10.5, fontWeight:700, padding:"2px 8px", borderRadius:20,
                              background:"rgba(229,115,115,0.16)", color:T.rose, whiteSpace:"nowrap", flexShrink:0}}>
                              {a.severity} · critical
                            </span>
                          : <span style={{fontSize:10.5, fontWeight:600, padding:"2px 8px", borderRadius:20,
                              background:T.card2, color:T.textS, flexShrink:0}}>{a.severity}</span>}
                        {canEdit && <span style={{fontSize:12, color:T.textS, flexShrink:0}}>✎</span>}
                      </RecRow>
                    ))}
                  {canEdit && <AddRow onClick={()=>openAdd("allergy", m.id)} label="Add allergy"/>}
                </HProfileSection>
              )},

              /* ── Dietary Restrictions ── */
              {title:"__custom__", content:(
                <HProfileSection title="Dietary Restrictions"
                  countLabel={`${d.dietary.length}`}
                  defaultOpen={false}>
                  {d.dietary.length === 0
                    ? <div style={{padding:"8px 16px", fontSize:12.5, color:T.textS}}>No dietary restrictions on file.</div>
                    : d.dietary.map((r,i) => (
                      <RecRow key={i} onClick={()=>openEdit("dietary", m.id, r, i)}
                        last={i===d.dietary.length-1} readOnly={!canEdit}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13, fontWeight:500}}>{r.restriction}</div>
                          {r.note && <div style={{fontSize:11.5, color:T.textS, marginTop:1}}>{r.note}</div>}
                        </div>
                        <span style={{fontSize:10.5, fontWeight:600, padding:"2px 8px", borderRadius:20,
                          background:r.type==="Medical"?"rgba(229,115,115,0.12)":T.card2,
                          color:r.type==="Medical"?T.rose:T.textS, flexShrink:0}}>{r.type}</span>
                        {canEdit && <span style={{fontSize:12, color:T.textS, flexShrink:0}}>✎</span>}
                      </RecRow>
                    ))}
                  <div style={{fontSize:11, color:T.textS, padding:"6px 16px 4px", fontStyle:"italic"}}>
                    Used in Recipes & Groceries meal planning · shown on Emergency Info
                  </div>
                  {canEdit && <AddRow onClick={()=>openAdd("dietary", m.id)} label="Add restriction"/>}
                </HProfileSection>
              )},

              /* ── Vaccination History ── */
              {title:"__custom__", content:(
                <HProfileSection title="Vaccination History"
                  countLabel={`${d.vaccines.length}`}
                  defaultOpen={false}>
                  {d.vaccines.length === 0
                    ? <div style={{padding:"8px 16px", fontSize:12.5, color:T.textS}}>No vaccinations on file.</div>
                    : d.vaccines.map((v,i) => (
                      <RecRow key={i} onClick={()=>openEdit("vaccine", m.id, v, i)}
                        last={i===d.vaccines.length-1} readOnly={!canEdit}>
                        <div style={{flex:1, fontSize:13}}>{v.name}</div>
                        <span style={{fontSize:11.5, color:T.textS}}>{v.date}</span>
                        {canEdit && <span style={{fontSize:12, color:T.textS, flexShrink:0}}>✎</span>}
                      </RecRow>
                    ))}
                  <div style={{fontSize:11, color:T.textS, padding:"6px 16px 4px", fontStyle:"italic"}}>
                    Upcoming boosters live in Appointments (recurring) · linked by vaccine type
                  </div>
                  {canEdit && <AddRow onClick={()=>openAdd("vaccine", m.id)} label="Record vaccination"/>}
                </HProfileSection>
              )},

              /* ── Care Details ── */
              {title:"__custom__", content:(
                <HProfileSection title="Care Details"
                  countLabel={`${providerCount} provider${providerCount!==1?"s":""}`}
                  defaultOpen={false}>
                  {[["GP","gp"],["Dentist","dentist"],["Optician","optician"],["Specialist","specialist"]].map(([label,key]) =>
                    d.care[key].map((p,i) => (
                      <RecRow key={`${key}-${i}`} onClick={()=>openEdit("provider", m.id, {...p, providerType:key}, i)}
                        last={false} readOnly={!canEdit}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13, fontWeight:500}}>
                            {p.name}
                            <span style={{fontSize:10.5, color:T.textS, fontWeight:400, marginLeft:5}}>
                              · {label} · {p.type}
                            </span>
                          </div>
                          <div style={{fontSize:11.5, color:T.textS}}>{p.org} · {p.phone}</div>
                        </div>
                        {canEdit && <span style={{fontSize:12, color:T.textS, flexShrink:0}}>✎</span>}
                      </RecRow>
                    ))
                  )}
                  {providerCount === 0 && (
                    <div style={{padding:"8px 16px", fontSize:12.5, color:T.textS}}>No providers on file.</div>
                  )}
                  <div style={{fontSize:11, color:T.textS, padding:"6px 16px 4px", fontStyle:"italic"}}>
                    Multiple providers per type supported (e.g. NHS GP + private specialist).
                  </div>
                  {canEdit && <AddRow onClick={()=>openAdd("provider", m.id)} label="Add provider"/>}
                </HProfileSection>
              )},
            ]}/>
        );
      })}

      {/* ══ Modals ══ */}

      {modal?.type==="healthIdentity" && (
        <HProfileModal title="Edit health identity" onClose={closeModal}>
          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              <div>
                <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Blood type</div>
                <select className="field-input" value={formVals.bloodType||""} onChange={e=>setF("bloodType",e.target.value)}>
                  {["","A+","A-","B+","B-","AB+","AB-","O+","O-","Unknown"].map(o=>(
                    <option key={o} value={o}>{o||"— select —"}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Organ donor</div>
                <select className="field-input" value={formVals.organDonor||"Not set"} onChange={e=>setF("organDonor",e.target.value)}>
                  {["Registered","Not registered","Unknown","Not set"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div style={{fontSize:12, color:T.textS, marginBottom:4}}>NHS number</div>
              <input className="field-input" value={formVals.nhs||""} onChange={e=>setF("nhs",e.target.value)} placeholder="e.g. 485 777 3456"/>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              <div>
                <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Height</div>
                <input className="field-input" value={formVals.height||""} onChange={e=>setF("height",e.target.value)} placeholder="e.g. 183 cm"/>
              </div>
              <div>
                <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Weight</div>
                <input className="field-input" value={formVals.weight||""} onChange={e=>setF("weight",e.target.value)} placeholder="e.g. 88 kg"/>
              </div>
            </div>
            <div style={{display:"flex", gap:8, marginTop:4}}>
              <button className="btn-sm btn-warm" style={{flex:1}} onClick={saveHealthIdentity}>Save</button>
              <button className="btn-sm" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </HProfileModal>
      )}

      {modal?.type==="condition" && (
        <HProfileModal title={modal.record?"Edit condition":"Add condition"} onClose={closeModal}>
          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            <div>
              <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Condition</div>
              <input className="field-input" value={formVals.name||""} onChange={e=>setF("name",e.target.value)} placeholder="e.g. Hypertension, Eczema"/>
            </div>
            <div>
              <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Notes (optional)</div>
              <textarea className="field-input" value={formVals.note||""} onChange={e=>setF("note",e.target.value)}
                placeholder="e.g. Diagnosed 2024 · controlled with medication"
                style={{minHeight:64, resize:"vertical"}}/>
            </div>
            <div style={{display:"flex", gap:8, marginTop:4}}>
              <button className="btn-sm btn-warm" style={{flex:1}} onClick={saveCondition}>Save</button>
              <button className="btn-sm" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </HProfileModal>
      )}

      {modal?.type==="allergy" && (
        <HProfileModal title={modal.record?"Edit allergy":"Add allergy"} onClose={closeModal}>
          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            <div>
              <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Allergen name</div>
              <input className="field-input" value={formVals.name||""} onChange={e=>setF("name",e.target.value)} placeholder="e.g. Pollen, Latex, Aspirin"/>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              <div>
                <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Type</div>
                <select className="field-input" value={formVals.type||"Food"} onChange={e=>setF("type",e.target.value)}>
                  <option>Food</option><option>Drug</option><option>Environmental</option><option>Other</option>
                </select>
              </div>
              <div>
                <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Severity</div>
                <select className="field-input" value={formVals.severity||"Mild"} onChange={e=>setF("severity",e.target.value)}>
                  <option>Mild</option><option>Moderate</option><option>Severe</option>
                </select>
              </div>
            </div>
            <div style={{padding:"10px 12px", borderRadius:9, background:T.card2, border:`1px solid ${T.border}`}}>
              <label style={{display:"flex", alignItems:"flex-start", gap:8, fontSize:13, cursor:"pointer"}}>
                <input type="checkbox" checked={!!formVals.critical} onChange={e=>setF("critical",e.target.checked)} style={{marginTop:2}}/>
                Mark as critical (life-threatening)
              </label>
              <div style={{fontSize:11, color:T.textS, marginTop:4, marginLeft:22, lineHeight:1.6}}>
                Surfaces as a red badge on the member card face — visible without expanding
              </div>
            </div>
            <div>
              <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Notes (optional)</div>
              <textarea className="field-input" value={formVals.note||""} onChange={e=>setF("note",e.target.value)}
                placeholder="e.g. Carries EpiPen — see kitchen drawer"
                style={{minHeight:52, resize:"vertical"}}/>
            </div>
            <div style={{display:"flex", gap:8, marginTop:4}}>
              <button className="btn-sm btn-warm" style={{flex:1}} onClick={saveAllergy}>Save</button>
              <button className="btn-sm" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </HProfileModal>
      )}

      {modal?.type==="dietary" && (
        <HProfileModal title={modal.record?"Edit dietary restriction":"Add dietary restriction"} onClose={closeModal}>
          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            <div>
              <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Restriction</div>
              <input className="field-input" value={formVals.restriction||""} onChange={e=>setF("restriction",e.target.value)}
                placeholder="e.g. Vegetarian, Halal, Coeliac, Lactose-free"/>
            </div>
            <div>
              <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Type</div>
              <select className="field-input" value={formVals.type||"Lifestyle"} onChange={e=>setF("type",e.target.value)}>
                <option value="Lifestyle">Lifestyle (ethical / religious / preference)</option>
                <option value="Medical">Medical (coeliac, lactose intolerance, diabetic etc.)</option>
              </select>
            </div>
            <div>
              <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Notes (optional)</div>
              <textarea className="field-input" value={formVals.note||""} onChange={e=>setF("note",e.target.value)}
                placeholder="e.g. Diagnosed coeliac 2022 · strict avoidance required"
                style={{minHeight:52, resize:"vertical"}}/>
            </div>
            <div style={{display:"flex", gap:8, marginTop:4}}>
              <button className="btn-sm btn-warm" style={{flex:1}} onClick={saveDietary}>Save</button>
              <button className="btn-sm" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </HProfileModal>
      )}

      {modal?.type==="vaccine" && (
        <HProfileModal title={modal.record?"Edit vaccination":"Record vaccination"} onClose={closeModal}>
          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            <div>
              <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Vaccine name</div>
              <input className="field-input" value={formVals.name||""} onChange={e=>setF("name",e.target.value)} placeholder="e.g. Flu (annual), MMR, COVID-19 booster"/>
            </div>
            <div>
              <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Date given</div>
              <input className="field-input" value={formVals.date||""} onChange={e=>setF("date",e.target.value)} placeholder="DD-Mon-YYYY"/>
            </div>
            <div style={{display:"flex", gap:8, marginTop:4}}>
              <button className="btn-sm btn-warm" style={{flex:1}} onClick={saveVaccine}>Save</button>
              <button className="btn-sm" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </HProfileModal>
      )}

      {modal?.type==="provider" && (
        <HProfileModal title={modal.record?"Edit provider":"Add provider"} onClose={closeModal}>
          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            <div>
              <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Provider name</div>
              <input className="field-input" value={formVals.name||""} onChange={e=>setF("name",e.target.value)} placeholder="e.g. Dr Patel"/>
            </div>
            <div>
              <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Organisation</div>
              <input className="field-input" value={formVals.org||""} onChange={e=>setF("org",e.target.value)} placeholder="e.g. Kirkley Medical Centre"/>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              <div>
                <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Type</div>
                <select className="field-input" value={formVals.providerType||"gp"} onChange={e=>setF("providerType",e.target.value)}>
                  <option value="gp">GP</option>
                  <option value="dentist">Dentist</option>
                  <option value="optician">Optician</option>
                  <option value="specialist">Specialist</option>
                </select>
              </div>
              <div>
                <div style={{fontSize:12, color:T.textS, marginBottom:4}}>NHS / Private</div>
                <select className="field-input" value={formVals.nhsPrivate||formVals.type||"NHS"} onChange={e=>setF("nhsPrivate",e.target.value)}>
                  <option>NHS</option><option>Private</option>
                </select>
              </div>
            </div>
            <div>
              <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Phone</div>
              <input className="field-input" value={formVals.phone||""} onChange={e=>setF("phone",e.target.value)} placeholder="e.g. 01502 511 999"/>
            </div>
            <div style={{display:"flex", gap:8, marginTop:4}}>
              <button className="btn-sm btn-warm" style={{flex:1}} onClick={saveProvider}>Save</button>
              <button className="btn-sm" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </HProfileModal>
      )}
    </div>
  );
}

/* ── Health module: Medications ──────────────────────────── */
function HMedications({inScope, viewerId}) {
  /* Local mutable copy of meds so add / edit / stop reflect immediately.
     visibleTo defaults to "self" for any existing med that lacks it. */
  const [medData, setMedData] = useState(() => {
    const d = {};
    Object.keys(HEALTH_DATA).forEach(id => {
      d[id] = {
        meds:        HEALTH_DATA[id].meds.map(m=>({visibleTo:"self", ...m})),
        medsHistory: HEALTH_DATA[id].medsHistory.map(h=>({...h})),
      };
    });
    return d;
  });

  const [secOpen,      setSecOpen]      = useState({});
  const [addOpen,      setAddOpen]      = useState(false);
  const [addFor,        setAddFor]        = useState(viewerId);   // "For" — member id
  const [addVis,        setAddVis]        = useState("self");     // "Visible to"
  const [addPrescriber, setAddPrescriber] = useState("");         // controlled — defaults to member's GP
  const [editOpen,     setEditOpen]     = useState(false);
  const [editMed,      setEditMed]      = useState(null);
  const [editMemberId, setEditMemberId] = useState(null);
  const [editFor,      setEditFor]      = useState(viewerId);   // "For" in edit
  const [editVis,      setEditVis]      = useState("self");     // "Visible to" in edit
  const [stopMode,     setStopMode]     = useState(false);
  const [stopReason,   setStopReason]   = useState("");

  /* Uncontrolled refs for add form */
  const aN = useRef(); const aSt = useRef(); const aFr = useRef();
  const aTi = useRef(); const aSD = useRef();
  const aSu = useRef(); const aPh = useRef(); const aRD = useRef();

  /* Uncontrolled refs for edit form */
  const eN = useRef(); const eSt = useRef(); const eFr = useRef();
  const ePr = useRef(); const eSu = useRef(); const ePh = useRef();
  const eRD = useRef();

  const togSec   = (mid, sec) => setSecOpen(p => ({...p, [mid]:{...p[mid], [sec]:!p[mid]?.[sec]}}));
  const gpFor    = (id) => HEALTH_DATA[id]?.care?.gp?.[0]?.name || "";
  const openAdd  = () => { setAddFor(viewerId); setAddVis("self"); setAddPrescriber(gpFor(viewerId)); setAddOpen(true); };
  const handleAddForChange = (id) => { setAddFor(id); setAddPrescriber(gpFor(id)); };
  const openEdit = (med, mid) => {
    setEditMed(med); setEditMemberId(mid);
    setEditFor(mid); setEditVis(med.visibleTo || "self");
    setStopMode(false); setStopReason(""); setEditOpen(true);
  };
  const closeEdit = () => { setEditOpen(false); setStopMode(false); setStopReason(""); };

  /* Visibility helpers — same as HAppointments */
  const visLabel = v => ({self:"Self", hmg:"HMG", family:"Family"}[v] || v);
  const visBg    = v => ({self:T.card2, hmg:"rgba(232,160,64,0.14)", family:"rgba(91,184,138,0.14)"}[v] || T.card2);
  const visFg    = v => ({self:T.textS, hmg:T.amber||T.warm, family:T.sage}[v] || T.textS);
  const VisPills = ({value, onChange}) => (
    <div style={{display:"flex", gap:6}}>
      {["self","hmg","family"].map(v=>(
        <div key={v} onClick={()=>onChange(v)}
          style={{flex:1, textAlign:"center", padding:"7px 8px", borderRadius:8, cursor:"pointer",
            fontSize:12, fontWeight:600,
            background:value===v?visBg(v):"transparent",
            color:value===v?visFg(v):T.textS,
            border:`1px solid ${value===v?visFg(v)+"55":T.border}`}}>
          {visLabel(v)}
        </div>
      ))}
    </div>
  );

  const toDateStr = (iso) => iso
    ? new Date(iso).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}).replace(/ /g,"-")
    : new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}).replace(/ /g,"-");

  const saveMed = () => {
    const name = aN.current?.value?.trim();
    if (!name) return;
    const newMed = {
      name,
      strength:   aSt.current?.value || "",
      freq:       [aFr.current?.value, aTi.current?.value].filter(Boolean).join(" "),
      start:      toDateStr(aSD.current?.value),
      prescriber: addPrescriber || "Self",
      createdById: viewerId,
      pharmacy:   aPh.current?.value || "",
      supply:     aSu.current?.value || "NHS",
      reorderDate:aRD.current?.value ? toDateStr(aRD.current.value) : "",
      visibleTo:  addVis,
      low: false,
    };
    setMedData(p => ({...p, [addFor]:{...p[addFor], meds:[...p[addFor].meds, newMed]}}));
    setAddOpen(false);
  };

  const saveEdit = () => {
    const updated = {
      ...editMed,
      name:       eN.current?.value  || editMed.name,
      strength:   eSt.current?.value || editMed.strength,
      freq:       eFr.current?.value || editMed.freq,
      prescriber: ePr.current?.value || editMed.prescriber,
      supply:     eSu.current?.value || editMed.supply,
      pharmacy:   ePh.current?.value || editMed.pharmacy,
      reorderDate:eRD.current?.value ? toDateStr(eRD.current.value) : editMed.reorderDate,
      visibleTo:  editVis,
    };
    if (editFor !== editMemberId) {
      /* Member changed — move med from old member to new */
      setMedData(p => ({
        ...p,
        [editMemberId]: {...p[editMemberId], meds: p[editMemberId].meds.filter(m => m!==editMed)},
        [editFor]:      {...p[editFor],      meds: [...p[editFor].meds, updated]},
      }));
    } else {
      setMedData(p => ({...p, [editMemberId]:{...p[editMemberId],
        meds: p[editMemberId].meds.map(m => m===editMed ? updated : m),
      }}));
    }
    closeEdit();
  };

  const toggleLow = () => {
    const updated = {...editMed, low:!editMed.low};
    setMedData(p => ({...p, [editMemberId]:{...p[editMemberId],
      meds: p[editMemberId].meds.map(m => m===editMed ? updated : m),
    }}));
    setEditMed(updated);
  };

  const stopMed = () => {
    const today = toDateStr(null);
    const histEntry = {
      name:    editMed.name + (editMed.strength ? " "+editMed.strength : ""),
      freq:    editMed.freq,
      stopped: today,
      reason:  stopReason.trim() || "Stopped",
    };
    setMedData(p => ({...p, [editMemberId]:{
      meds:        p[editMemberId].meds.filter(m => m!==editMed),
      medsHistory: [...p[editMemberId].medsHistory, histEntry],
    }}));
    closeEdit();
  };

  /* ── Style constants (design contract §12) ─────────────── */
  const fldLbl = {display:"block", fontSize:11, fontWeight:600, color:T.textS,
    marginBottom:4, marginTop:14, letterSpacing:".04em", textTransform:"uppercase"};
  const fldInp = {width:"100%", padding:"8px 11px", borderRadius:8,
    border:`1px solid ${T.border}`, background:T.surface, color:T.text,
    fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box"};
  const modalShell = {position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
    zIndex:201, width:"min(480px,94vw)", maxHeight:"88vh", overflowY:"auto",
    background:T.card, border:`1px solid ${T.borderHi}`, borderRadius:18,
    padding:24, boxShadow:"0 32px 80px rgba(0,0,0,0.55)"};
  const rowBase = {display:"flex", alignItems:"center", gap:10, padding:"9px 14px",
    borderBottom:`1px solid ${T.border}`, cursor:"pointer"};
  const secDivLbl = {fontSize:11, fontWeight:600, color:T.textS,
    margin:"16px 0 6px", letterSpacing:".04em", textTransform:"uppercase"};
  const backdrop = {position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, backdropFilter:"blur(3px)"};
  const modalHdr = {display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:4};
  const closeBtn = {fontSize:20, padding:"2px 7px", borderRadius:6, background:T.card2, lineHeight:1};

  /* ── Add modal (JSX value — not a component, avoids focus loss) ── */
  const addModalJSX = addOpen && (
    <div onClick={()=>setAddOpen(false)} style={backdrop}>
      <div onClick={e=>e.stopPropagation()} style={modalShell}>
        <div style={modalHdr}>
          <div style={{fontSize:15, fontWeight:700}}>Add medication</div>
          <button className="btn-sm" onClick={()=>setAddOpen(false)} style={closeBtn}>×</button>
        </div>

        <label style={fldLbl}>Medication name</label>
        <input style={fldInp} placeholder="e.g. Ramipril" ref={aN}/>

        <label style={fldLbl}>For</label>
        <select style={fldInp} value={addFor} onChange={e=>handleAddForChange(e.target.value)}>
          {H_MEMBERS.map(m=>(
            <option key={m.id} value={m.id}>{m.name}{m.id===viewerId?" (you)":""}</option>
          ))}
        </select>
        {H_byId(addFor)?.role==="Child" && (
          <div style={{fontSize:11, color:T.textS, marginTop:4}}>
            Children's medications are managed on their behalf by an HMG.
          </div>
        )}

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <div><label style={fldLbl}>Strength / dose</label>
            <input style={fldInp} placeholder="e.g. 5mg" ref={aSt}/></div>
          <div><label style={fldLbl}>Form</label>
            <select style={fldInp}>
              {["Tablet","Liquid","Inhaler","Patch","Injection","Other"].map(o=><option key={o}>{o}</option>)}
            </select></div>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <div><label style={fldLbl}>Frequency</label>
            <select style={fldInp} ref={aFr}>
              {["Once daily","Twice daily","Three times daily","As needed","Weekly","Other"].map(o=><option key={o}>{o}</option>)}
            </select></div>
          <div><label style={fldLbl}>Time of day</label>
            <input style={fldInp} placeholder="e.g. Morning" ref={aTi}/></div>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <div><label style={fldLbl}>Prescriber</label>
            <input style={fldInp} placeholder="e.g. Dr Patel"
              value={addPrescriber} onChange={e=>setAddPrescriber(e.target.value)}/></div>
          <div><label style={fldLbl}>Start date</label>
            <input type="date" style={fldInp} ref={aSD}/></div>
        </div>

        <div style={secDivLbl}>Prescription details</div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <div><label style={fldLbl}>Type</label>
            <select style={fldInp} ref={aSu}>
              {["NHS","Private","OTC"].map(o=><option key={o}>{o}</option>)}
            </select></div>
          <div><label style={fldLbl}>Pharmacy</label>
            <input style={fldInp} placeholder="e.g. Boots Lowestoft" ref={aPh}/></div>
        </div>

        <label style={fldLbl}>Reorder date</label>
        <input type="date" style={fldInp} ref={aRD}/>

        <label style={fldLbl}>Visible to</label>
        <VisPills value={addVis} onChange={setAddVis}/>
        <div style={{fontSize:11, color:T.textS, marginTop:5}}>
          Self = only you · HMG = household managers · Family = everyone
        </div>

        <div style={{display:"flex", gap:8, marginTop:20}}>
          <button className="btn-sm btn-warm" style={{flex:1, padding:"9px"}} onClick={saveMed}>Save medication</button>
          <button className="btn-sm" onClick={()=>setAddOpen(false)} style={{flex:1, padding:"9px"}}>Cancel</button>
        </div>
      </div>
    </div>
  );

  /* ── Edit modal ──────────────────────────────────────────── */
  const editModalJSX = editOpen && editMed && (
    <div onClick={closeEdit} style={backdrop}>
      <div onClick={e=>e.stopPropagation()} style={modalShell}>
        <div style={modalHdr}>
          <div>
            <div style={{fontSize:15, fontWeight:700}}>Edit medication</div>
            <div style={{fontSize:11, color:T.textS, marginTop:2}}>{editMed.name}</div>
          </div>
          <button className="btn-sm" onClick={closeEdit} style={closeBtn}>×</button>
        </div>

        {!stopMode ? <>
          <label style={fldLbl}>Medication name</label>
          <input style={fldInp} defaultValue={editMed.name} ref={eN}/>

          <label style={fldLbl}>For</label>
          <select style={fldInp} value={editFor} onChange={e=>setEditFor(e.target.value)}>
            {H_MEMBERS.map(m=>(
              <option key={m.id} value={m.id}>{m.name}{m.id===viewerId?" (you)":""}</option>
            ))}
          </select>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
            <div><label style={fldLbl}>Strength / dose</label>
              <input style={fldInp} defaultValue={editMed.strength} ref={eSt}/></div>
            <div><label style={fldLbl}>Form</label>
              <select style={fldInp}>
                {["Tablet","Liquid","Inhaler","Patch","Injection","Other"].map(o=><option key={o}>{o}</option>)}
              </select></div>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
            <div><label style={fldLbl}>Frequency</label>
              <input style={fldInp} defaultValue={editMed.freq} ref={eFr}/></div>
            <div><label style={fldLbl}>Prescriber</label>
              <input style={fldInp} defaultValue={editMed.prescriber} ref={ePr}/></div>
          </div>

          <div style={secDivLbl}>Prescription details</div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
            <div><label style={fldLbl}>Type</label>
              <select style={fldInp} defaultValue={editMed.supply} ref={eSu}>
                {["NHS","Private","OTC"].map(o=><option key={o}>{o}</option>)}
              </select></div>
            <div><label style={fldLbl}>Pharmacy</label>
              <input style={fldInp} defaultValue={editMed.pharmacy} ref={ePh}/></div>
          </div>

          <label style={fldLbl}>Reorder date</label>
          <input type="date" style={fldInp} ref={eRD}/>

          <label style={fldLbl}>Visible to</label>
          <VisPills value={editVis} onChange={setEditVis}/>
          <div style={{fontSize:11, color:T.textS, marginTop:5}}>
            Self = only you · HMG = household managers · Family = everyone
          </div>

          <div style={secDivLbl}>Status</div>
          <div style={{display:"flex", gap:8}}>
            <button className="btn-sm" style={{fontSize:11, padding:"5px 10px"}} onClick={toggleLow}>
              {editMed.low ? "Unmark running low" : "Mark running low"}
            </button>
            <button className="btn-sm" onClick={()=>setStopMode(true)}
              style={{fontSize:11, padding:"5px 10px", color:T.rose, borderColor:T.rose+"66"}}>
              Stop medication
            </button>
          </div>

          <div style={{display:"flex", gap:8, marginTop:20}}>
            <button className="btn-sm btn-warm" style={{flex:1, padding:"9px"}} onClick={saveEdit}>Save changes</button>
            <button className="btn-sm" onClick={closeEdit} style={{flex:1, padding:"9px"}}>Cancel</button>
          </div>

        </> : <>
          <div style={{background:T.rose+"12", border:`1px solid ${T.rose+"44"}`, borderRadius:10,
            padding:"12px 14px", marginTop:8}}>
            <div style={{fontSize:13, fontWeight:600, color:T.rose, marginBottom:6}}>Stop {editMed.name}?</div>
            <div style={{fontSize:12, color:T.textS, marginBottom:10}}>
              This will move it to History. You can view it there but it won't appear in active medications.
            </div>
            <label style={{...fldLbl, marginTop:0}}>Reason (optional)</label>
            <input style={fldInp} placeholder="e.g. Course complete, side effects, switched medication"
              value={stopReason} onChange={e=>setStopReason(e.target.value)}/>
          </div>
          <div style={{display:"flex", gap:8, marginTop:16}}>
            <button className="btn-sm" onClick={stopMed}
              style={{flex:1, padding:"9px", color:T.rose, borderColor:T.rose+"66"}}>
              Confirm — stop medication
            </button>
            <button className="btn-sm" onClick={()=>setStopMode(false)} style={{flex:1, padding:"9px"}}>
              Back
            </button>
          </div>
        </>}
      </div>
    </div>
  );

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div>
      <div style={{display:"flex", justifyContent:"flex-end", marginBottom:12}}>
        <button className="btn-sm btn-warm" onClick={openAdd}>
          + Add medication
        </button>
      </div>

      {inScope.map(m => {
        const d    = medData[m.id] || HEALTH_DATA[m.id];
        const isTeenPrivate = m.role==="Teen" && !m.sharedHMG && m.id!==viewerId;
        const lowCount = d.meds.filter(x => x.low).length;
        const flags = [];
        if (lowCount > 0) flags.push({text:`${lowCount} running low`, bg:"rgba(229,115,115,0.16)", fg:T.rose});
        else if (d.meds.length === 0 && !isTeenPrivate) flags.push({text:"No medications", bg:T.card2, fg:T.textS});

        const medsOpen = secOpen[m.id]?.meds    ?? false;
        const histOpen = secOpen[m.id]?.history ?? false;

        const medsSec = (
          <div style={{marginBottom:4}}>
            <div onClick={()=>togSec(m.id,"meds")}
              style={{display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"8px 12px", cursor:"pointer",
                borderRadius: medsOpen ? "8px 8px 0 0" : "8px",
                background: medsOpen ? T.card2 : T.warm+"18",
                border:`1px solid ${medsOpen ? T.border : T.warm+"44"}`}}>
              <div style={{fontSize:11, fontWeight:700, textTransform:"uppercase",
                letterSpacing:".07em", color:T.warm, display:"flex", alignItems:"center", gap:8}}>
                Current medications
                <span style={{background:T.card, borderRadius:10, padding:"1px 7px",
                  fontSize:10, fontWeight:600, color:T.warm}}>{d.meds.length}</span>
              </div>
              <span style={{fontSize:10, color:T.warm}}>{medsOpen?"▼":"▶"}</span>
            </div>
            {medsOpen && (
              <div style={{border:`1px solid ${T.border}`, borderTop:"none",
                borderRadius:"0 0 8px 8px", overflow:"hidden"}}>
                {d.meds.length === 0
                  ? <div style={{padding:"10px 14px", fontSize:12.5, color:T.textS, fontStyle:"italic"}}>No current medications.</div>
                  : d.meds.map((med, i) => {
                    const hmgCreator    = H_MEMBERS.find(hm => H_isHMG(hm.id) && hm.role !== "Child");
                    const createdByName = med.createdById
                      ? (H_byId(med.createdById)?.name || "Unknown")
                      : m.role === "Child"
                        ? (hmgCreator?.name || "HMG")
                        : m.name;
                    return (
                    <div key={i} onClick={()=>openEdit(med, m.id)}
                      style={{...rowBase, alignItems:"center",
                        borderBottom: i < d.meds.length-1 ? `1px solid ${T.border}` : "none"}}
                      onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      {/* Col 1: name + strength */}
                      <div style={{flex:"1 1 120px", minWidth:0}}>
                        <div style={{fontSize:12.5, fontWeight:600,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                          {med.name}
                          {med.strength && <span style={{fontSize:11, color:T.textS, fontWeight:400, marginLeft:5}}>· {med.strength}</span>}
                        </div>
                      </div>
                      {/* Col 2: For · By */}
                      <div style={{flex:"0 1 110px", minWidth:0, fontSize:10, color:T.textS,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                        For {m.name} · By {createdByName}
                      </div>
                      {/* Col 3: Badges — right-aligned, never truncated */}
                      <div style={{display:"flex", alignItems:"center", gap:5, flexShrink:0}}>
                        <span style={{fontSize:9.5, fontWeight:600, padding:"2px 7px", borderRadius:6,
                          whiteSpace:"nowrap",
                          background:med.supply==="OTC"?T.card2:T.warmS,
                          color:med.supply==="OTC"?T.textS:T.warm}}>{med.supply}</span>
                        {med.low && (
                          <span style={{fontSize:9.5, fontWeight:600, padding:"2px 7px", borderRadius:6,
                            whiteSpace:"nowrap", background:"rgba(229,115,115,0.16)", color:T.rose}}>
                            Running low
                          </span>
                        )}
                      </div>
                    </div>
                  ); })
                }
              </div>
            )}
          </div>
        );

        const histSec = (
          <div>
            <div onClick={()=>togSec(m.id,"history")}
              style={{display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"8px 12px", cursor:"pointer",
                borderRadius: histOpen ? "8px 8px 0 0" : "8px",
                background: T.card2,
                border:`1px solid ${T.border}`}}>
              <div style={{fontSize:11, fontWeight:700, textTransform:"uppercase",
                letterSpacing:".07em", color:T.textS, display:"flex", alignItems:"center", gap:8}}>
                History
                <span style={{background:T.card, borderRadius:10, padding:"1px 7px",
                  fontSize:10, fontWeight:600, color:T.textS}}>{d.medsHistory.length}</span>
              </div>
              <span style={{fontSize:10, color:T.textM}}>{histOpen?"▼":"▶"}</span>
            </div>
            {histOpen && (
              <div style={{border:`1px solid ${T.border}`, borderTop:"none",
                borderRadius:"0 0 8px 8px", overflow:"hidden"}}>
                {d.medsHistory.length === 0
                  ? <div style={{padding:"10px 14px", fontSize:12.5, color:T.textS, fontStyle:"italic"}}>No discontinued medications.</div>
                  : d.medsHistory.map((h, i) => (
                    <div key={i}
                      style={{...rowBase, cursor:"default", alignItems:"center",
                        borderBottom: i < d.medsHistory.length-1 ? `1px solid ${T.border}` : "none"}}
                      onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div style={{flex:"1 1 0", minWidth:0}}>
                        <div style={{fontSize:12.5, fontWeight:500, color:T.textS,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{h.name}</div>
                        <div style={{fontSize:10.5, color:T.textM, marginTop:2}}>{h.reason}</div>
                      </div>
                      <div style={{flexShrink:0, fontSize:11, color:T.textS, whiteSpace:"nowrap"}}>
                        Stopped {h.stopped}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        );

        return (
          <HMemberCard key={m.id} m={m} flags={flags} locked={isTeenPrivate} defaultOpen={m.you}
            sections={[{title:"__custom__", content:(
              <div style={{padding:"10px 14px 14px"}}>
                <div style={{display:"flex", flexDirection:"column", gap:6}}>
                  {medsSec}
                  {histSec}
                </div>
              </div>
            )}]}/>
        );
      })}

      {addModalJSX}
      {editModalJSX}
    </div>
  );
}

/* ── Health module: Appointments ─────────────────────────────────────────────────── */
/* Behaviour:
   - Schedules (recurring[]) are definitions — cycle, last, nextDue, provider, visibility.
   - Instances are generated from schedules when nextDue (or bookedDate) falls within
     today → end of next calendar month. Beyond that window: no instance, schedule only.
   - One-off upcoming[] entries (recurring:false) appear directly in the timed buckets.
   - Buckets: Overdue · Today · This week · This month · Next month · Past
   - When marked Done: instance leaves active buckets → Past (read-only).
   - When a recurring instance is marked Done: schedule recalculates nextDue; if the new
     nextDue falls within window a fresh instance appears automatically.
   NOTE: PROTO_TODAY is hardcoded for prototype — Claude Code derives from auth session. */

/* ── Health module: Emergency Info ──────────────────────── */
function HEmergency({inScope}) {
  /* Per-member mutable copies of editable fields (contacts + care notes).
     Read-only fields (identity, allergies, meds, dietary) stay in HEALTH_DATA. */
  const [localData, setLocalData] = useState(() => {
    const d = {};
    inScope.forEach(m => {
      d[m.id] = {
        contacts:  JSON.parse(JSON.stringify(HEALTH_DATA[m.id].contacts)),
        careNotes: HEALTH_DATA[m.id].careNotes,
      };
    });
    return d;
  });

  /* Which member cards are expanded — all collapsed by default */
  const [expanded, setExpanded] = useState(new Set());
  const toggleExpand = id => setExpanded(p => { const n = new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });

  /* Share link — per member */
  const [shareOpenId, setShareOpenId] = useState(null);
  const shareM = shareOpenId ? inScope.find(m=>m.id===shareOpenId) : null;

  /* Contact modal: {memberId, idx (null=add), record} */
  const [contactModal, setContactModal] = useState(null);
  const [contactForm,  setContactForm]  = useState({});
  const setCF = (k,v) => setContactForm(p=>({...p,[k]:v}));

  const openAddContact  = (mid)          => { setContactForm({label:"",name:"",phone:""}); setContactModal({memberId:mid, idx:null, record:null}); };
  const openEditContact = (mid, idx, rec) => { setContactForm({...rec}); setContactModal({memberId:mid, idx, record:rec}); };
  const closeContactModal = () => { setContactModal(null); setContactForm({}); };
  const saveContact = () => {
    const item = {label:(contactForm.label||"").trim(), name:(contactForm.name||"").trim(), phone:(contactForm.phone||"").trim()};
    if (!item.name) return;
    setLocalData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (contactModal.idx !== null) next[contactModal.memberId].contacts[contactModal.idx] = item;
      else next[contactModal.memberId].contacts.push(item);
      return next;
    });
    closeContactModal();
  };

  /* Care notes modal */
  const [notesModal, setNotesModal] = useState(null); // memberId | null
  const [notesForm,  setNotesForm]  = useState("");
  const openEditNotes  = (mid) => { setNotesForm(localData[mid]?.careNotes||""); setNotesModal(mid); };
  const closeNotesModal = () => setNotesModal(null);
  const saveNotes = () => {
    setLocalData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[notesModal].careNotes = notesForm;
      return next;
    });
    closeNotesModal();
  };

  return (
    <div>
      {inScope.map(m => {
        const d  = HEALTH_DATA[m.id];
        const ld = localData[m.id] || {contacts:[], careNotes:""};
        const isOpen        = expanded.has(m.id);
        const critAllergies  = d.allergies.filter(a => a.critical);
        const otherAllergies = d.allergies.filter(a => !a.critical);

        return (
          <div key={m.id} style={{marginBottom:10, borderRadius:11, overflow:"hidden",
            border:`1px solid ${T.rose}33`, borderLeft:`3px solid ${T.rose}`}}>

            {/* ── Member header (always visible) ── */}
            <div onClick={()=>toggleExpand(m.id)}
              style={{padding:"12px 16px", display:"flex", alignItems:"center", gap:12,
                cursor:"pointer", background:isOpen?T.card2:T.card,
                borderBottom:isOpen?`1px solid ${T.border}`:"none", transition:"background .15s"}}>
              <HAvatar m={m} size={40}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:14.5, fontWeight:600}}>
                  {m.name} {m.surname}
                  {m.you && <span style={{fontSize:10, color:T.warm, fontWeight:700, marginLeft:6}}>· You</span>}
                </div>
                <div style={{fontSize:11.5, color:T.textS, marginTop:1}}>
                  {m.role} · DOB {m.dob} · age {m.age}
                </div>
              </div>
              {critAllergies.length > 0 && (
                <span style={{fontSize:10.5, fontWeight:700, padding:"2px 8px", borderRadius:20,
                  background:"rgba(229,115,115,0.16)", color:T.rose, whiteSpace:"nowrap", flexShrink:0}}>
                  🆘 {critAllergies.length} critical
                </span>
              )}
              <button className="btn-sm btn-warm" onClick={e=>{e.stopPropagation(); setShareOpenId(m.id);}}>
                🔗 Share
              </button>
              <span style={{fontSize:12, color:T.textS, display:"inline-block",
                transform:`rotate(${isOpen?180:0}deg)`, transition:"transform .2s", flexShrink:0}}>▾</span>
            </div>

            {/* ── Expanded content ── */}
            {isOpen && (
              <div style={{padding:12}}>
                <div style={{fontSize:11, color:T.textS, marginBottom:10, lineHeight:1.6}}>
                  Curated for carers and emergency situations. Read-only · live · revocable · expires in 24h.
                </div>
                <div className="g2">

                  {/* 1. Identity */}
                  <div className="card">
                    <div className="card-title">🪪 Identity</div>
                    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 12px", padding:"4px 0 2px"}}>
                      {[["Full name",`${m.name} ${m.surname}`.trim()],["Date of birth",m.dob],
                        ["NHS number",d.medical.nhs||"—"],["Blood type",d.medical.bloodType||"—"]
                      ].map(([k,v])=>(
                        <div key={k}>
                          <div style={{fontSize:10.5, color:T.textS, fontWeight:600, textTransform:"uppercase",
                            letterSpacing:".05em", marginBottom:2}}>{k}</div>
                          <div style={{fontSize:13, fontWeight:500, fontVariantNumeric:"tabular-nums"}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:11, color:T.textS, marginTop:10, fontStyle:"italic"}}>Pulled live from Profiles</div>
                  </div>

                  {/* 2. Critical Flags */}
                  <div className="card">
                    <div className="card-title">🆘 Critical Flags</div>
                    {critAllergies.length === 0 && d.medical.conditions.length === 0
                      ? <div style={{fontSize:12.5, color:T.textS}}>No critical flags on file.</div>
                      : <>
                          {critAllergies.map((a,i) => (
                            <div key={"a"+i} className="row">
                              <span style={{fontSize:16}}>🆘</span>
                              <div style={{flex:1, minWidth:0}}>
                                <div style={{fontSize:13, fontWeight:600, color:T.rose}}>Allergy · {a.name}</div>
                                <div style={{fontSize:11.5, color:T.textS}}>{a.severity} · {a.note}</div>
                              </div>
                            </div>
                          ))}
                          {d.medical.conditions.map((c,i) => (
                            <div key={"c"+i} className="row">
                              <span style={{fontSize:16}}>⚠️</span>
                              <div style={{flex:1, minWidth:0}}>
                                <div style={{fontSize:13, fontWeight:600}}>{c.name}</div>
                                <div style={{fontSize:11.5, color:T.textS}}>{c.note}</div>
                              </div>
                            </div>
                          ))}
                        </>}
                    <div style={{fontSize:11, color:T.textS, marginTop:10, fontStyle:"italic"}}>Pulled live from Profiles</div>
                  </div>

                  {/* 3. All Allergies */}
                  <div className="card">
                    <div className="card-title">🤧 All Allergies</div>
                    {d.allergies.length === 0
                      ? <div style={{fontSize:12.5, color:T.textS}}>No allergies on file.</div>
                      : <>
                          {critAllergies.length > 0 && (
                            <div style={{fontSize:10.5, fontWeight:700, color:T.rose, textTransform:"uppercase",
                              letterSpacing:".06em", padding:"4px 0 2px"}}>Critical</div>
                          )}
                          {critAllergies.map((a,i) => (
                            <div key={"c"+i} className="row">
                              <div style={{flex:1, minWidth:0}}>
                                <div style={{fontSize:13, fontWeight:500}}>{a.name}
                                  <span style={{fontSize:11, color:T.textS, marginLeft:6}}>· {a.type}</span>
                                </div>
                                {a.note && <div style={{fontSize:11, color:T.textS}}>{a.note}</div>}
                              </div>
                              <span style={{fontSize:10.5, fontWeight:700, padding:"2px 8px", borderRadius:20,
                                background:"rgba(229,115,115,0.16)", color:T.rose, whiteSpace:"nowrap", flexShrink:0}}>
                                {a.severity} · critical
                              </span>
                            </div>
                          ))}
                          {otherAllergies.length > 0 && (
                            <div style={{fontSize:10.5, fontWeight:700, color:T.textS, textTransform:"uppercase",
                              letterSpacing:".06em", padding:"6px 0 2px"}}>Other</div>
                          )}
                          {otherAllergies.map((a,i) => (
                            <div key={"o"+i} className="row">
                              <div style={{flex:1, minWidth:0}}>
                                <div style={{fontSize:13, fontWeight:500}}>{a.name}
                                  <span style={{fontSize:11, color:T.textS, marginLeft:6}}>· {a.type}</span>
                                </div>
                              </div>
                              <span style={{fontSize:10.5, fontWeight:600, padding:"2px 8px", borderRadius:20,
                                background:T.card2, color:T.textS, flexShrink:0}}>{a.severity}</span>
                            </div>
                          ))}
                        </>}
                    <div style={{fontSize:11, color:T.textS, marginTop:10, fontStyle:"italic"}}>Pulled live from Profiles</div>
                  </div>

                  {/* 4. Dietary Restrictions */}
                  <div className="card">
                    <div className="card-title">🥗 Dietary Restrictions</div>
                    {d.dietary.length === 0
                      ? <div style={{fontSize:12.5, color:T.textS}}>No dietary restrictions on file.</div>
                      : d.dietary.map((r,i) => (
                        <div key={i} className="row">
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{fontSize:13, fontWeight:500}}>{r.restriction}</div>
                            {r.note && <div style={{fontSize:11, color:T.textS}}>{r.note}</div>}
                          </div>
                          <span style={{fontSize:10.5, fontWeight:600, padding:"2px 8px", borderRadius:20,
                            background:r.type==="Medical"?"rgba(229,115,115,0.12)":T.card2,
                            color:r.type==="Medical"?T.rose:T.textS, flexShrink:0}}>{r.type}</span>
                        </div>
                      ))}
                    <div style={{fontSize:11, color:T.textS, marginTop:10, fontStyle:"italic"}}>Pulled live from Profiles</div>
                  </div>

                  {/* 5. Current Medications */}
                  <div className="card">
                    <div className="card-title">💊 Current Medications</div>
                    {d.meds.length === 0
                      ? <div style={{fontSize:12.5, color:T.textS}}>None on file.</div>
                      : d.meds.map((med,i) => (
                        <div key={i} className="row">
                          <span style={{fontSize:14}}>💊</span>
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{fontSize:13, fontWeight:500}}>{med.name}
                              <span style={{color:T.textS, fontWeight:400, marginLeft:5}}>{med.strength}</span>
                            </div>
                            <div style={{fontSize:11, color:T.textS}}>{med.freq}</div>
                            <div style={{fontSize:11, color:T.textS}}>{med.prescriber}</div>
                          </div>
                          <span style={{fontSize:10.5, fontWeight:700, padding:"2px 7px", borderRadius:6,
                            background:med.supply==="OTC"?T.card2:T.warmS,
                            color:med.supply==="OTC"?T.textS:T.warm}}>{med.supply}</span>
                        </div>
                      ))}
                    <div style={{fontSize:11, color:T.textS, marginTop:10, fontStyle:"italic"}}>Pulled live from Medications</div>
                  </div>

                  {/* 6. Emergency Contacts */}
                  <div className="card">
                    <div className="card-title">📞 Emergency Contacts</div>
                    {ld.contacts.length === 0
                      ? <div style={{fontSize:12.5, color:T.textS, marginBottom:8}}>No contacts on file.</div>
                      : ld.contacts.map((c,i) => (
                        <div key={i} className="row" onClick={()=>openEditContact(m.id, i, c)}
                          style={{cursor:"pointer"}}
                          onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{fontSize:13, fontWeight:500}}>{c.name}</div>
                            <div style={{fontSize:11, color:T.textS}}>{c.label}</div>
                          </div>
                          <span style={{fontSize:12, color:T.text, fontVariantNumeric:"tabular-nums", marginRight:6}}>{c.phone}</span>
                          <span style={{fontSize:12, color:T.textS}}>✎</span>
                        </div>
                      ))}
                    <button className="btn-sm" style={{marginTop:8}}
                      onClick={()=>openAddContact(m.id)}>+ Add contact</button>
                  </div>

                  {/* 7. Care Notes */}
                  <div className="card">
                    <div className="card-title">📝 Care Notes</div>
                    {ld.careNotes
                      ? <div style={{fontSize:12.5, color:T.text, lineHeight:1.75, padding:"4px 0"}}>{ld.careNotes}</div>
                      : <div style={{fontSize:12.5, color:T.textS, padding:"4px 0"}}>No care notes added yet.</div>}
                    <button className="btn-sm" style={{marginTop:12}}
                      onClick={()=>openEditNotes(m.id)}>
                      {ld.careNotes ? "Edit notes" : "+ Add notes"}
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Share link modal ── */}
      {shareM && (
        <div onClick={()=>setShareOpenId(null)}
          style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex",
            alignItems:"center", justifyContent:"center", zIndex:100, padding:24, animation:"fadeUp .2s ease both"}}>
          <div onClick={e=>e.stopPropagation()}
            style={{maxWidth:480, width:"100%", background:T.surface, borderRadius:14,
              border:`1px solid ${T.border}`, padding:22, boxShadow:"0 18px 50px rgba(0,0,0,0.35)"}}>
            <div style={{fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, marginBottom:4}}>
              Share emergency info — {shareM.name}
            </div>
            <div style={{fontSize:12.5, color:T.textS, marginBottom:14, lineHeight:1.65}}>
              Read-only, view-only link to {shareM.name}'s emergency info. No login required for the recipient.
            </div>
            <div style={{padding:"11px 14px", borderRadius:9, background:T.card2,
              border:`1px solid ${T.border}`, fontSize:12.5, fontFamily:"monospace", color:T.text,
              marginBottom:10, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
              https://mypal.app/em/{shareM.id}-7K3pN9wQ
            </div>
            <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:14}}>
              {H_pill("upcoming","Live data")}
              {H_pill("due","Expires in 24h")}
              {H_pill("booked","Revocable")}
            </div>
            <ul style={{fontSize:12, color:T.textS, lineHeight:1.8, paddingLeft:18, marginBottom:14}}>
              <li>Always reflects current health info at time of opening — not a snapshot</li>
              <li>Automatically expires after 24 hours</li>
              <li>Cancellable anytime from this screen before expiry</li>
            </ul>
            <div style={{display:"flex", gap:8}}>
              <button className="btn-sm btn-warm" style={{flex:1}}>📋 Copy link</button>
              <button className="btn-sm" onClick={()=>setShareOpenId(null)} style={{flex:1}}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Contact add / edit modal ── */}
      {contactModal && (
        <div onClick={closeContactModal}
          style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex",
            alignItems:"center", justifyContent:"center", zIndex:200, padding:24}}>
          <div onClick={e=>e.stopPropagation()}
            style={{maxWidth:400, width:"100%", background:T.card, borderRadius:13,
              border:`1px solid ${T.border}`, boxShadow:"0 24px 60px rgba(0,0,0,0.45)"}}>
            <div style={{display:"flex", alignItems:"center", gap:10, padding:"14px 18px",
              borderBottom:`1px solid ${T.border}`}}>
              <div style={{flex:1, fontSize:15, fontWeight:600}}>
                {contactModal.idx !== null ? "Edit contact" : "Add contact"}
              </div>
              <button className="btn-sm" onClick={closeContactModal} style={{padding:"4px 10px"}}>✕</button>
            </div>
            <div style={{padding:"16px 18px 18px", display:"flex", flexDirection:"column", gap:12}}>
              <div>
                <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Name</div>
                <input className="field-input" value={contactForm.name||""} onChange={e=>setCF("name",e.target.value)}
                  placeholder="e.g. Dr Patel"/>
              </div>
              <div>
                <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Role / label</div>
                <input className="field-input" value={contactForm.label||""} onChange={e=>setCF("label",e.target.value)}
                  placeholder="e.g. GP, Parent, Specialist"/>
              </div>
              <div>
                <div style={{fontSize:12, color:T.textS, marginBottom:4}}>Phone</div>
                <input className="field-input" value={contactForm.phone||""} onChange={e=>setCF("phone",e.target.value)}
                  placeholder="e.g. 01502 511 999"/>
              </div>
              <div style={{display:"flex", gap:8, marginTop:4}}>
                <button className="btn-sm btn-warm" style={{flex:1}} onClick={saveContact}>Save</button>
                <button className="btn-sm" onClick={closeContactModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Care notes edit modal ── */}
      {notesModal && (
        <div onClick={closeNotesModal}
          style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex",
            alignItems:"center", justifyContent:"center", zIndex:200, padding:24}}>
          <div onClick={e=>e.stopPropagation()}
            style={{maxWidth:440, width:"100%", background:T.card, borderRadius:13,
              border:`1px solid ${T.border}`, boxShadow:"0 24px 60px rgba(0,0,0,0.45)"}}>
            <div style={{display:"flex", alignItems:"center", gap:10, padding:"14px 18px",
              borderBottom:`1px solid ${T.border}`}}>
              <div style={{flex:1, fontSize:15, fontWeight:600}}>Care notes — {inScope.find(m=>m.id===notesModal)?.name}</div>
              <button className="btn-sm" onClick={closeNotesModal} style={{padding:"4px 10px"}}>✕</button>
            </div>
            <div style={{padding:"16px 18px 18px", display:"flex", flexDirection:"column", gap:12}}>
              <textarea className="field-input" value={notesForm} onChange={e=>setNotesForm(e.target.value)}
                placeholder="e.g. Severe peanut allergy — EpiPen in school bag + kitchen. Likes warm milk at bedtime."
                style={{minHeight:120, resize:"vertical"}}/>
              <div style={{display:"flex", gap:8}}>
                <button className="btn-sm btn-warm" style={{flex:1}} onClick={saveNotes}>Save</button>
                <button className="btn-sm" onClick={closeNotesModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HAppointments({inScope, viewerIsHMG, viewerId}) {
  /* ── Prototype date reference (Claude Code: derive from auth session, never hardcode) ── */
  const PROTO_TODAY   = new Date(2026, 4, 30);           // 30-May-2026 (Saturday)
  const isSameDay     = (a, b) => a.toDateString() === b.toDateString();
  const endOfDay      = d => { const r = new Date(d); r.setHours(23,59,59,999); return r; };
  const dayOfWeek     = PROTO_TODAY.getDay();            // 6 = Saturday
  const daysToSun     = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  const END_WEEK      = endOfDay(new Date(PROTO_TODAY.getFullYear(), PROTO_TODAY.getMonth(), PROTO_TODAY.getDate() + daysToSun));
  const END_MONTH     = endOfDay(new Date(PROTO_TODAY.getFullYear(), PROTO_TODAY.getMonth() + 1, 0));
  const END_NEXT_MNTH = endOfDay(new Date(PROTO_TODAY.getFullYear(), PROTO_TODAY.getMonth() + 2, 0));

  /* Parse "DD-Mon-YYYY" or "YYYY-MM-DD" -> Date */
  const MON = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  const MNAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const parseD = str => {
    if (!str) return null;
    const p = str.split("-");
    if (p.length === 3 && MON[p[1]] !== undefined) return new Date(+p[2], MON[p[1]], +p[0]); // DD-Mon-YYYY
    if (p.length === 3 && !isNaN(+p[0]) && +p[0] > 999) return new Date(+p[0], +p[1]-1, +p[2]); // YYYY-MM-DD
    return null;
  };
  /* Convert YYYY-MM-DD to DD-Mon-YYYY for display */
  const fmtDateStr = str => {
    if (!str) return "";
    const p = str.split("-");
    if (p.length === 3 && !isNaN(+p[0]) && +p[0] > 999) return `${p[2]}-${MNAMES[+p[1]-1]}-${p[0]}`;
    return str;
  };

  /* Assign a date to a time bucket */
  const bucket = date => {
    if (!date) return null;
    if (date < PROTO_TODAY && !isSameDay(date, PROTO_TODAY)) return "overdue";
    if (isSameDay(date, PROTO_TODAY))   return "today";
    if (date <= END_WEEK)               return "week";
    if (date <= END_MONTH)              return "month";
    if (date <= END_NEXT_MNTH)          return "next";
    return null; // beyond window -- stays in Schedules only
  };

  const [memFilter,       setMemFilter]       = useState("all");
  const [open,            setOpen]            = useState({overdue:false, today:false, week:false, month:false, next:false, past:false, schedules:false});
  const [apptModal,       setApptModal]       = useState(false);
  const [apptForm,        setApptForm]        = useState({type:"one-off", apptType:"GP", member:viewerId, title:"", date:"", time:"", provider:"", location:"", reason:"", visibleTo:"self", cycle:"1 month"});
  const [detailEntry,     setDetailEntry]     = useState(null);
  const [doneIds,         setDoneIds]         = useState(new Set());
  const [localDoneItems,  setLocalDoneItems]  = useState([]); /* items marked done this session */
  const [detailNotes,     setDetailNotes]     = useState({});
  /* Local-session created appointments and schedules (prototype: no API) */
  const [localAppts,      setLocalAppts]      = useState([]);
  const [localSchedules,  setLocalSchedules]  = useState([]);
  /* Persisted status overrides from the detail modal (id -> status string) */
  const [localApptStatus, setLocalApptStatus] = useState({});
  /* Schedule editing */
  const [removedSchedIds, setRemovedSchedIds] = useState(new Set()); /* prototype-session removes */
  const [schedEditEntry,  setSchedEditEntry]  = useState(null);
  const [localSchedEdits, setLocalSchedEdits] = useState({}); // id -> overrides
  const [schedEditForm,   setSchedEditForm]   = useState(null);

  const tog      = k  => setOpen(p => ({...p, [k]: !p[k]}));
  const markDone = (id, item) => {
    setDoneIds(p => new Set([...p, id]));
    if (item) setLocalDoneItems(p => [...p.filter(x => x.entry.id !== id), item]);
  };

  /* Shared helpers */
  const visLabel = v => ({self:"Self", hmg:"HMG", family:"Family"}[v] || v);
  const visBg    = v => ({self:T.card2, hmg:"rgba(232,160,64,0.14)", family:"rgba(91,184,138,0.14)"}[v] || T.card2);
  const visFg    = v => ({self:T.textS, hmg:T.amber||T.warm, family:T.sage}[v] || T.textS);
  const typeIcon = t => ({GP:"🩺",Dental:"🦷",Optician:"👓",Physio:"🏃",Hospital:"🏥",Specialist:"🧑‍⚕️",Vaccination:"💉",Screening:"🔬",Other:"📅"}[t]||"📅");
  const VisPill  = ({val}) => (
    <span style={{fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:6,
      background:visBg(val), color:visFg(val), border:`1px solid ${visFg(val)}33`}}>
      {visLabel(val)}
    </span>
  );

  /* -- Instance generation -- */
  /* groups: time-bucketed appointment instances
     allSchedules: all recurring definitions (always visible in Schedules section) */
  const groups = {overdue:[], today:[], week:[], month:[], next:[], past:[]};
  const allSchedules = [];

  inScope.forEach(m => {
    const d = HEALTH_DATA[m.id];

    /* Recurring schedules -> generate instance if within window */
    (d.recurring||[]).forEach(r => {
      if (removedSchedIds.has(r.id)) return;
      allSchedules.push({m, entry:r});
      if (doneIds.has(r.id)) return; // marked done this session
      const instanceDateStr = r.bookedDate || r.nextDue;
      const instanceDate    = parseD(instanceDateStr);
      const bkt             = bucket(instanceDate);
      if (bkt) groups[bkt].push({m, entry:r, kind:"recurring", instanceDateStr, isBooked:!!r.bookedDate});
    });

    /* One-off upcoming appointments (recurring:false only) */
    (d.upcoming||[]).filter(a => !a.recurring).forEach(a => {
      if (doneIds.has(a.id)) return;
      const instanceDate = parseD(a.date);
      const bkt          = bucket(instanceDate);
      if (bkt) groups[bkt].push({m, entry:a, kind:"oneoff", instanceDateStr:a.date, isBooked:true});
    });

    /* Past */
    (d.past||[]).forEach(a => groups.past.push({m, entry:a, kind:"past", instanceDateStr:a.date, isBooked:true}));
  });

  /* Include session-created one-offs and schedules */
  localAppts.forEach(a => {
    if (doneIds.has(a.id)) return;
    const mem = H_byId(a.memberId);
    if (!mem) return;
    const instanceDate = parseD(a.date);
    const bkt = bucket(instanceDate);
    if (bkt) groups[bkt].push({m:mem, entry:a, kind:"oneoff", instanceDateStr:fmtDateStr(a.date), isBooked:true});
  });
  localSchedules.forEach(r => {
    if (removedSchedIds.has(r.id)) return;
    const mem = H_byId(r.memberId);
    if (!mem) return;
    allSchedules.push({m:mem, entry:r});
    if (doneIds.has(r.id)) return;
    const instanceDateStr = r.bookedDate || r.nextDue;
    if (!instanceDateStr) return;
    const instanceDate = parseD(instanceDateStr);
    const bkt = bucket(instanceDate);
    if (bkt) groups[bkt].push({m:mem, entry:r, kind:"recurring", instanceDateStr, isBooked:!!r.bookedDate});
  });

  /* Session-done items go into past (deduplicated against existing past entries) */
  localDoneItems.forEach(item => {
    if (!groups.past.find(x => x.entry.id === item.entry.id))
      groups.past.push({...item, kind:"past"});
  });

  const applyFilter = list => memFilter === "all" ? list : list.filter(x => x.m.id === memFilter);

  /* -- Shared style tokens -- */
  const fldLbl = {display:"block", fontSize:11, fontWeight:600, color:T.textS,
    marginBottom:4, marginTop:14, letterSpacing:".04em", textTransform:"uppercase"};
  const fldInp = {width:"100%", padding:"8px 11px", borderRadius:8, border:`1px solid ${T.border}`,
    background:T.surface, color:T.text, fontSize:13, outline:"none",
    fontFamily:"inherit", boxSizing:"border-box"};
  const modalShell = {
    position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
    zIndex:201, width:"min(460px,94vw)", maxHeight:"88vh", overflowY:"auto",
    background:T.card, border:`1px solid ${T.borderHi}`, borderRadius:18,
    padding:24, boxShadow:"0 32px 80px rgba(0,0,0,0.55)"
  };
  const rowBase = {
    display:"flex", alignItems:"center", gap:10, padding:"8px 14px",
    borderBottom:`1px solid ${T.border}`, cursor:"pointer", transition:"background .12s"
  };

  /* -- Group header (collapsible -- Tasks GroupHdr pattern) -- */
  const GHdr = ({gk, label, count, accent}) => (
    <div onClick={()=>tog(gk)}
      style={{display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"8px 12px", cursor:"pointer",
        borderRadius:open[gk] ? "8px 8px 0 0" : "8px",
        background:accent ? accent+"18" : T.card2,
        border:`1px solid ${accent ? accent+"44" : T.border}`,
        marginBottom:open[gk] ? 0 : 4}}>
      <div style={{fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".07em",
        color:accent||T.textS, display:"flex", alignItems:"center", gap:8}}>
        {label}
        <span style={{background:T.card, borderRadius:10, padding:"1px 7px",
          fontSize:10, fontWeight:600, color:accent||T.textS}}>{count}</span>
      </div>
      <span style={{fontSize:10, color:accent||T.textM}}>{open[gk]?"▼":"▶"}</span>
    </div>
  );

  const SectionBody = ({children, accent}) => (
    <div className="card" style={{borderRadius:"0 0 8px 8px", borderTop:"none", padding:0,
      borderColor:accent ? accent+"44" : T.border, overflow:"hidden", marginBottom:4}}>
      {children}
    </div>
  );

  const Empty = ({msg}) => (
    <div style={{padding:"18px 14px", textAlign:"center", color:T.textS, fontSize:13}}>{msg}</div>
  );

  /* -- Entry card — compact single-line row -- */
  const EntryCard = ({m, entry, kind, instanceDateStr, isBooked}) => {
    const canEdit  = m.id === viewerId || viewerIsHMG;
    const isPast   = kind === "past";
    /* createdById is set on locally-created entries; for seed data fall back to
       member's name (self-created) or first HMG member (children's entries). */
    const hmgCreator = H_MEMBERS.find(hm => H_isHMG(hm.id) && hm.role !== "Child");
    const createdByName = entry.createdById
      ? (H_byId(entry.createdById)?.name || "Unknown")
      : m.role === "Child"
        ? (hmgCreator?.name || "HMG")
        : m.name;

    const savedStatus = localApptStatus[entry.id];
    const statusCfg =
      isPast
        ? {label:"Done",        bg:T.card2,                       fg:T.textS}
      : savedStatus === "rescheduled"
        ? {label:"Rescheduled", bg:"rgba(140,120,220,0.16)",       fg:T.violet}
      : savedStatus === "cancelled"
        ? {label:"Cancelled",   bg:"rgba(229,115,115,0.16)",       fg:T.rose}
      : (savedStatus === "booked" || (!savedStatus && isBooked))
        ? {label:"Booked",      bg:"rgba(91,184,138,0.16)",       fg:T.sage}
        : {label:"Not booked",  bg:"rgba(232,160,64,0.16)",       fg:T.amber||T.warm};

    const title   = entry.title || entry.label || entry.reason || entry.type;
    const dateStr = instanceDateStr || "";
    const timeStr = entry.time || "";
    const provAddr = [entry.provider, entry.location].filter(Boolean).join(" · ");

    return (
      <div
        onClick={()=>{ if (!isPast) setDetailEntry({m, entry, kind, instanceDateStr, isBooked}); }}
        style={{...rowBase, cursor:isPast ? "default" : "pointer"}}
        onMouseEnter={e=>{ if (!isPast) e.currentTarget.style.background = T.card2; }}
        onMouseLeave={e=>{ e.currentTarget.style.background = "transparent"; }}>

        {/* Type icon */}
        <span style={{fontSize:14, flexShrink:0, width:20, textAlign:"center"}}>
          {typeIcon(entry.type||entry.apptType)}
        </span>

        {/* Title + for/by — flexible, truncates if needed */}
        <div style={{flex:"1 1 130px", minWidth:0}}>
          <div style={{fontSize:12.5, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
            {title}
          </div>
          <div style={{fontSize:10, color:T.textS, whiteSpace:"nowrap", marginTop:1}}>
            For {m.name} · By {createdByName}
          </div>
        </div>

        {/* Date — never truncated, auto width */}
        <div style={{flexShrink:0, fontSize:11, color:T.text, whiteSpace:"nowrap"}}>
          {dateStr ? <span>{"📅 "}{dateStr}{timeStr ? " · "+timeStr : ""}</span>
                   : <span style={{color:T.textS}}>No date</span>}
        </div>

        {/* Provider & address — flexible */}
        <div style={{flex:"1 1 100px", minWidth:0, fontSize:10.5, color:T.textS,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
          {provAddr || "—"}
        </div>

        {/* Status badge */}
        <span style={{flexShrink:0, fontSize:9.5, padding:"2px 7px", borderRadius:6,
          background:statusCfg.bg, color:statusCfg.fg, fontWeight:600, whiteSpace:"nowrap"}}>
          {statusCfg.label}
        </span>

        {/* Done button */}
        {!isPast && canEdit && (
          <button className="btn-sm" style={{fontSize:10, padding:"2px 7px", flexShrink:0}}
            onClick={e=>{ e.stopPropagation(); markDone(entry.id, {m, entry, instanceDateStr, isBooked}); }}>
            ✓ Done
          </button>
        )}
      </div>
    );
  };

  /* -- Schedule row (definitions panel) — same 2-line convention as EntryCard -- */
  const ScheduleRow = ({m, entry}) => {
    const overrides     = localSchedEdits[entry.id] || {};
    const merged        = {...entry, ...overrides};
    const forMember     = H_byId(overrides.forMemberId || m.id);
    const hmgCreator    = H_MEMBERS.find(hm => H_isHMG(hm.id) && hm.role !== "Child");
    const createdByName = merged.createdById
      ? (H_byId(merged.createdById)?.name || "Unknown")
      : m.role === "Child"
        ? (hmgCreator?.name || "HMG")
        : m.name;
    return (
      <div style={{...rowBase}}
        onClick={()=>{
          setSchedEditEntry({m:forMember, entry:merged});
          setSchedEditForm({
            title:       merged.label||"",
            cycle:       merged.cycle||"1 month",
            provider:    merged.provider||"",
            visibleTo:   merged.visibleTo||"self",
            forMemberId: forMember.id,
            nextDue:     merged.nextDue||"",
            time:        merged.time||"",
          });
        }}
        onMouseEnter={e=>e.currentTarget.style.background = T.card2}
        onMouseLeave={e=>e.currentTarget.style.background = "transparent"}>

        {/* Type icon */}
        <span style={{fontSize:13, flexShrink:0, width:18, textAlign:"center"}}>
          {typeIcon(merged.type)}
        </span>

        {/* Title + For · By (matches EntryCard 2-line convention) */}
        <div style={{flex:"1 1 130px", minWidth:0}}>
          <div style={{fontSize:12.5, fontWeight:600, overflow:"hidden",
            textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
            {merged.label}
          </div>
          <div style={{fontSize:10, color:T.textS, whiteSpace:"nowrap", marginTop:1}}>
            For {forMember.name} · By {createdByName}
          </div>
        </div>

        {/* Frequency — auto width, no truncation */}
        <div style={{flexShrink:0, fontSize:11, color:T.textS, whiteSpace:"nowrap"}}>
          Every {merged.cycle}
        </div>

        {/* Next due — auto width, no truncation */}
        <div style={{flexShrink:0, fontSize:11, whiteSpace:"nowrap",
          color:merged.status==="overdue"?T.rose:merged.status==="due"?(T.amber||T.warm):T.textS}}>
          Next: {merged.nextDue||"—"}
        </div>

        {/* Remove button */}
        <button className="btn-sm" style={{fontSize:10, padding:"2px 7px", flexShrink:0,
          color:T.rose, borderColor:T.rose+"55", background:"rgba(229,115,115,0.08)"}}
          onClick={e=>{ e.stopPropagation(); setRemovedSchedIds(p=>new Set([...p, entry.id])); }}>
          Remove
        </button>
        {/* Edit hint */}
        <span style={{flexShrink:0, fontSize:9.5, color:T.textS, padding:"1px 6px",
          borderRadius:5, background:T.card2, border:`1px solid ${T.border}`, whiteSpace:"nowrap"}}>
          Edit →
        </span>
      </div>
    );
  };

  /* -- Detail modal -- view/edit an appointment instance -- */
  const DetailModal = () => {
    const {m, entry, kind, instanceDateStr, isBooked} = detailEntry;
    const isPastModal = kind === "past";
    const [editDate,   setEditDate]   = useState(instanceDateStr||"");
    const [editTime,   setEditTime]   = useState(entry.time||"");
    const [notes,      setNotes]      = useState(detailNotes[entry.id]||"");
    const [editStatus, setEditStatus] = useState(
      isPastModal ? "done" : isBooked ? "booked" : "not-booked"
    );
    return (
      <>
        <div onClick={()=>setDetailEntry(null)}
          style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, backdropFilter:"blur(3px)"}}/>
        <div style={{...modalShell}}>

          <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14}}>
            <div>
              <div style={{fontSize:15, fontWeight:700}}>
                {entry.label || entry.reason || entry.type}
              </div>
              <div style={{fontSize:11, color:T.textS, marginTop:2}}>
                {typeIcon(entry.type)} {entry.type} · {m.name}
              </div>
            </div>
            <div onClick={()=>setDetailEntry(null)}
              style={{cursor:"pointer", color:T.textS, fontSize:20, lineHeight:1,
                padding:"2px 7px", borderRadius:6, background:T.card2, flexShrink:0}}>{"✕"}</div>
          </div>

          {/* Details summary */}
          <div className="card" style={{padding:"10px 14px", marginBottom:0}}>
            <div style={{fontSize:12.5, color:T.text, lineHeight:2.1}}>
              <div><span style={{color:T.textS, display:"inline-block", width:72}}>Provider</span>{entry.provider||"—"}</div>
              {entry.location && <div><span style={{color:T.textS, display:"inline-block", width:72}}>Address</span>{entry.location}</div>}
              <div><span style={{color:T.textS, display:"inline-block", width:72}}>For</span>{m.name} · {m.role}</div>
              {kind==="recurring" && entry.cycle && (
                <div><span style={{color:T.textS, display:"inline-block", width:72}}>Cycle</span>Every {entry.cycle}</div>
              )}
              <div><span style={{color:T.textS, display:"inline-block", width:72}}>Visibility</span>{visLabel(entry.visibleTo||"self")}</div>
            </div>
          </div>

          {/* Editable: date/time and notes only (not the schedule definition) */}
          <div style={{fontSize:11, fontWeight:600, color:T.textS, margin:"16px 0 6px",
            letterSpacing:".04em", textTransform:"uppercase"}}>Date & time</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:4}}>
            <div>
              <label style={{...fldLbl, marginTop:0}}>Date</label>
              <input value={editDate} onChange={e=>setEditDate(e.target.value)}
                style={fldInp} placeholder="DD-Mon-YYYY"/>
            </div>
            <div>
              <label style={{...fldLbl, marginTop:0}}>Time</label>
              <input type="time" value={editTime} onChange={e=>setEditTime(e.target.value)} style={fldInp}/>
            </div>
          </div>

          <label style={fldLbl}>Notes</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)}
            style={{...fldInp, height:72, resize:"vertical"}}
            placeholder="Add notes for this appointment…"/>

          {/* Status selector */}
          <div style={{fontSize:11, fontWeight:600, color:T.textS, margin:"16px 0 6px",
            letterSpacing:".04em", textTransform:"uppercase"}}>Status</div>
          <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
            {[
              ["booked",      "Booked",      T.sage,         "rgba(91,184,138,0.16)"],
              ["not-booked",  "Not booked",  T.amber||T.warm,"rgba(232,160,64,0.16)"],
              ["rescheduled", "Rescheduled", T.violet,       "rgba(140,120,220,0.16)"],
              ["cancelled",   "Cancelled",   T.rose,         "rgba(229,115,115,0.16)"],
            ].map(([v,l,fg,bg])=>(
              <div key={v} onClick={()=>{ if (!isPastModal) setEditStatus(v); }}
                style={{flex:1, textAlign:"center", padding:"6px 4px", borderRadius:8,
                  cursor:isPastModal?"default":"pointer", fontSize:11, fontWeight:600,
                  background:editStatus===v?bg:"transparent",
                  color:editStatus===v?fg:T.textS,
                  border:`1px solid ${editStatus===v?fg+"55":T.border}`,
                  opacity:isPastModal?0.7:1}}>
                {l}
              </div>
            ))}
          </div>

          {kind==="recurring" && (
            <div style={{fontSize:11, color:T.textS, marginTop:8, lineHeight:1.6,
              padding:"7px 10px", background:T.card2, borderRadius:7, border:`1px solid ${T.border}`}}>
              {"♻︎"} Changes here affect this occurrence only. Edit the Schedule below to update the cycle or provider.
            </div>
          )}

          <div style={{display:"flex", gap:8, marginTop:18}}>
            <button className="btn-sm btn-warm" style={{flex:2, padding:"9px"}}
              onClick={()=>{ setDetailNotes(p=>({...p,[entry.id]:notes})); setLocalApptStatus(p=>({...p,[entry.id]:editStatus})); setDetailEntry(null); }}>
              Save changes
            </button>
            <button className="btn-sm" style={{flex:2, padding:"9px"}}
              onClick={()=>{ markDone(entry.id, {m, entry, instanceDateStr, isBooked}); setDetailEntry(null); }}>
              {"✓"} Mark as done
            </button>
            <button className="btn-sm" style={{padding:"9px"}}
              onClick={()=>setDetailEntry(null)}>Cancel</button>
          </div>
        </div>
      </>
    );
  };

  /* -- New Appointment modal -- */
  /* forOptions: always ALL household members, independent of the current scope/filter.
     inScope is the scope-toggle view (can be "Me" only) — we need the full list here. */
  const forOptions = H_MEMBERS;

  /* Stored as JSX value (not component) to prevent remount/focus-loss on apptForm state change */
  const apptModalJSX = (
    <>
      <div onClick={()=>setApptModal(false)}
        style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, backdropFilter:"blur(3px)"}}/>
      <div style={{...modalShell, width:"min(480px,94vw)"}}>

        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4}}>
          <div>
            <div style={{fontSize:15, fontWeight:700}}>New appointment</div>
            <div style={{fontSize:11, color:T.textS, marginTop:2}}>One-off visit or a recurring schedule</div>
          </div>
          <div onClick={()=>setApptModal(false)}
            style={{cursor:"pointer", color:T.textS, fontSize:20, lineHeight:1,
              padding:"2px 7px", borderRadius:6, background:T.card2}}>✕</div>
        </div>

        {/* One-off / Recurring toggle */}
        <label style={fldLbl}>Type</label>
        <div style={{display:"flex", gap:2, background:T.card2, borderRadius:9, padding:2, border:`1px solid ${T.border}`}}>
          {[["one-off","One-off"],["recurring","Recurring"]].map(([v,l])=>(
            <div key={v} onClick={()=>setApptForm(f=>({...f,type:v}))}
              style={{flex:1, textAlign:"center", padding:"6px 12px", borderRadius:7, cursor:"pointer",
                fontSize:12.5, fontWeight:600,
                background:apptForm.type===v?T.surface:"transparent",
                color:apptForm.type===v?T.warm:T.textS,
                border:apptForm.type===v?`1px solid ${T.border}`:"1px solid transparent"}}>{l}</div>
          ))}
        </div>

        {/* Title — both types */}
        <label style={fldLbl}>Title</label>
        <input value={apptForm.title} onChange={e=>setApptForm(f=>({...f,title:e.target.value}))}
          style={fldInp} placeholder={apptForm.type==="recurring"
            ? "e.g. Dental check-up, Annual flu jab"
            : "e.g. Blood pressure review, Physio assessment"}/>

        {/* Category */}
        <label style={fldLbl}>Category</label>
        <select value={apptForm.apptType} onChange={e=>setApptForm(f=>({...f,apptType:e.target.value}))} style={fldInp}>
          {["GP","Dental","Optician","Screening","Vaccination","Physio","Hospital","Specialist","Other"].map(t=>(
            <option key={t}>{t}</option>
          ))}
        </select>

        {/* Recurring-only: cycle */}
        {apptForm.type==="recurring" && (
          <>
            <label style={fldLbl}>Cycle</label>
            <select value={apptForm.cycle} onChange={e=>setApptForm(f=>({...f,cycle:e.target.value}))} style={fldInp}>
              {["1 week","2 weeks","1 month","3 months","6 months","12 months","18 months","24 months","3 years"].map(c=>(
                <option key={c}>{c}</option>
              ))}
            </select>
          </>
        )}

        {/* One-off only: date, time, location */}
        {apptForm.type==="one-off" && (
          <>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
              <div>
                <label style={fldLbl}>Date</label>
                <input type="date" value={apptForm.date}
                  onChange={e=>setApptForm(f=>({...f,date:e.target.value}))} style={fldInp}/>
              </div>
              <div>
                <label style={fldLbl}>Time</label>
                <input type="time" value={apptForm.time}
                  onChange={e=>setApptForm(f=>({...f,time:e.target.value}))} style={fldInp}/>
              </div>
            </div>
            <label style={fldLbl}>Location / Address</label>
            <input value={apptForm.location} onChange={e=>setApptForm(f=>({...f,location:e.target.value}))}
              style={fldInp} placeholder="e.g. Kirkley Rd, Lowestoft NR33"/>
          </>
        )}

        {/* Provider — both types */}
        <label style={fldLbl}>Provider</label>
        <input value={apptForm.provider} onChange={e=>setApptForm(f=>({...f,provider:e.target.value}))}
          style={fldInp} placeholder="e.g. Dr Patel · Kirkley Medical"/>

        {/* For — family member picker */}
        <label style={fldLbl}>For</label>
        <select value={apptForm.member} onChange={e=>setApptForm(f=>({...f,member:e.target.value}))} style={fldInp}>
          {forOptions.map(m=>(
            <option key={m.id} value={m.id}>
              {m.name}{m.id===viewerId?" (you)":""}
            </option>
          ))}
        </select>
        <div style={{fontSize:11, color:T.textS, marginTop:4}}>
          Children's appointments are managed on their behalf by an HMG.
        </div>

        {/* Visibility */}
        <label style={fldLbl}>Visibility</label>
        <div style={{display:"flex", gap:6}}>
          {["self","hmg","family"].map(v=>(
            <div key={v} onClick={()=>setApptForm(f=>({...f,visibleTo:v}))}
              style={{flex:1, textAlign:"center", padding:"7px 8px", borderRadius:8, cursor:"pointer",
                fontSize:12, fontWeight:600,
                background:apptForm.visibleTo===v?visBg(v):"transparent",
                color:apptForm.visibleTo===v?visFg(v):T.textS,
                border:`1px solid ${apptForm.visibleTo===v?visFg(v)+"55":T.border}`}}>
              {visLabel(v)}
            </div>
          ))}
        </div>
        <div style={{fontSize:11, color:T.textS, marginTop:5}}>
          Self = only you · HMG = household managers · Family = everyone
        </div>

        <div style={{display:"flex", gap:8, marginTop:20}}>
          <button className="btn-sm btn-warm" style={{flex:1, padding:"9px"}} onClick={()=>{
            if (!apptForm.title.trim()) { alert("Please enter a title."); return; }
            const newId = "local-" + Date.now();
            if (apptForm.type === "recurring") {
              setLocalSchedules(p=>[...p, {id:newId, memberId:apptForm.member, createdById:viewerId, type:apptForm.apptType, label:apptForm.title, cycle:apptForm.cycle, provider:apptForm.provider, visibleTo:apptForm.visibleTo, nextDue:null, status:"upcoming", booked:false, bookedDate:null}]);
              setOpen(p=>({...p, schedules:true}));
            } else {
              setLocalAppts(p=>[...p, {id:newId, memberId:apptForm.member, createdById:viewerId, type:apptForm.apptType, title:apptForm.title, date:apptForm.date, time:apptForm.time, provider:apptForm.provider, location:apptForm.location, visibleTo:apptForm.visibleTo}]);
              const bkt = bucket(parseD(apptForm.date));
              if (bkt) setOpen(p=>({...p, [bkt]:true}));
            }
            setApptForm({type:"one-off", apptType:"GP", member:viewerId, title:"", date:"", time:"", provider:"", location:"", reason:"", visibleTo:"self", cycle:"1 month"});
            setApptModal(false);
          }}>
            {apptForm.type==="recurring" ? "Add to schedules" : "Add appointment"}
          </button>
          <button className="btn-sm" style={{flex:1, padding:"9px"}} onClick={()=>setApptModal(false)}>Cancel</button>
        </div>
      </div>
    </>
  );

  /* -- Schedule edit modal (JSX value to avoid focus-loss bug) -- */
  const schedEditModalJSX = schedEditEntry && schedEditForm && (
    <>
      <div onClick={()=>setSchedEditEntry(null)}
        style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, backdropFilter:"blur(3px)"}}/>
      <div style={{...modalShell}}>

        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4}}>
          <div>
            <div style={{fontSize:15, fontWeight:700}}>Edit schedule</div>
            <div style={{fontSize:11, color:T.textS, marginTop:2}}>
              {typeIcon(schedEditEntry.entry.type)} {schedEditEntry.entry.type} · For {schedEditEntry.m.name}
            </div>
          </div>
          <div onClick={()=>setSchedEditEntry(null)}
            style={{cursor:"pointer", color:T.textS, fontSize:20, lineHeight:1,
              padding:"2px 7px", borderRadius:6, background:T.card2}}>✕</div>
        </div>

        <label style={fldLbl}>Title</label>
        <input value={schedEditForm.title}
          onChange={e=>setSchedEditForm(f=>({...f,title:e.target.value}))}
          style={fldInp} placeholder="e.g. Dental check-up"/>

        <label style={fldLbl}>For</label>
        <select value={schedEditForm.forMemberId}
          onChange={e=>setSchedEditForm(f=>({...f,forMemberId:e.target.value}))} style={fldInp}>
          {H_MEMBERS.map(hm=>(
            <option key={hm.id} value={hm.id}>
              {hm.name}{hm.id===viewerId?" (you)":""}
            </option>
          ))}
        </select>

        <label style={fldLbl}>Cycle</label>
        <select value={schedEditForm.cycle}
          onChange={e=>setSchedEditForm(f=>({...f,cycle:e.target.value}))} style={fldInp}>
          {["1 week","2 weeks","1 month","3 months","6 months","12 months","18 months","24 months","3 years"].map(c=>(
            <option key={c}>{c}</option>
          ))}
        </select>

        <label style={fldLbl}>Provider</label>
        <input value={schedEditForm.provider}
          onChange={e=>setSchedEditForm(f=>({...f,provider:e.target.value}))}
          style={fldInp} placeholder="e.g. Bridge Dental, Kirkley Medical"/>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <div>
            <label style={fldLbl}>Next due date</label>
            <input value={schedEditForm.nextDue}
              onChange={e=>setSchedEditForm(f=>({...f,nextDue:e.target.value}))}
              style={fldInp} placeholder="DD-Mon-YYYY e.g. 15-Jun-2026"/>
          </div>
          <div>
            <label style={fldLbl}>Time</label>
            <input type="time" value={schedEditForm.time}
              onChange={e=>setSchedEditForm(f=>({...f,time:e.target.value}))}
              style={fldInp}/>
          </div>
        </div>

        <label style={fldLbl}>Visibility</label>
        <div style={{display:"flex", gap:6}}>
          {["self","hmg","family"].map(v=>(
            <div key={v} onClick={()=>setSchedEditForm(f=>({...f,visibleTo:v}))}
              style={{flex:1, textAlign:"center", padding:"7px 8px", borderRadius:8, cursor:"pointer",
                fontSize:12, fontWeight:600,
                background:schedEditForm.visibleTo===v?visBg(v):"transparent",
                color:schedEditForm.visibleTo===v?visFg(v):T.textS,
                border:`1px solid ${schedEditForm.visibleTo===v?visFg(v)+"55":T.border}`}}>
              {visLabel(v)}
            </div>
          ))}
        </div>

        <div style={{display:"flex", gap:8, marginTop:20}}>
          <button className="btn-sm btn-warm" style={{flex:1, padding:"9px"}} onClick={()=>{
            setLocalSchedEdits(p=>({...p, [schedEditEntry.entry.id]: {
              label:       schedEditForm.title || schedEditEntry.entry.label,
              cycle:       schedEditForm.cycle,
              provider:    schedEditForm.provider,
              visibleTo:   schedEditForm.visibleTo,
              forMemberId: schedEditForm.forMemberId,
              nextDue:     schedEditForm.nextDue || schedEditEntry.entry.nextDue,
              time:        schedEditForm.time,
            }}));
            setSchedEditEntry(null);
          }}>Save changes</button>
          <button className="btn-sm" style={{flex:1, padding:"9px"}} onClick={()=>setSchedEditEntry(null)}>Cancel</button>
        </div>
      </div>
    </>
  );

  /* -- Bucket config -- */
  const BUCKETS = [
    {k:"overdue", label:"Overdue",    accent:T.rose,   alwaysShow:true},
    {k:"today",   label:"Today",      accent:T.warm,   alwaysShow:true},
    {k:"week",    label:"This week",  accent:T.teal,   alwaysShow:false},
    {k:"month",   label:"This month", accent:T.sage,   alwaysShow:false},
    {k:"next",    label:"Next month", accent:T.violet, alwaysShow:false},
  ];

  return (
    <div>
      {/* -- Toolbar -- */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center",
        marginBottom:14, flexWrap:"wrap", gap:8}}>
        {viewerIsHMG && inScope.length > 1 && (
          <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
            <div onClick={()=>setMemFilter("all")} className={`tb-chip${memFilter==="all"?" on":""}`}>
              <span>{"👪"}</span><span>All</span>
            </div>
            {inScope.map(m=>(
              <div key={m.id} onClick={()=>setMemFilter(m.id)}
                className={`tb-chip${memFilter===m.id?" on":""}`}>
                <span>{m.av}</span><span>{m.name}</span>
              </div>
            ))}
          </div>
        )}
        <button className="btn-sm btn-warm" style={{fontSize:12, marginLeft:"auto"}}
          onClick={()=>setApptModal(true)}>+ New appointment</button>
      </div>

      {/* -- Time-bucketed sections -- */}
      {BUCKETS.map(({k, label, accent, alwaysShow}) => {
        const items = applyFilter(groups[k]);
        if (!alwaysShow && items.length === 0) return null;
        return (
          <React.Fragment key={k}>
            <GHdr gk={k} label={label} count={items.length}
              accent={items.length > 0 ? accent : undefined}/>
            {open[k] && (
              <SectionBody accent={items.length > 0 ? accent : undefined}>
                {items.length === 0
                  ? <Empty msg={k==="overdue" ? "Nothing overdue — all on track." : "Nothing booked."}/>
                  : items.map(({m,entry,kind,instanceDateStr,isBooked},i)=>(
                      <EntryCard key={entry.id||i} m={m} entry={entry} kind={kind}
                        instanceDateStr={instanceDateStr} isBooked={isBooked}/>
                    ))}
              </SectionBody>
            )}
          </React.Fragment>
        );
      })}

      {/* -- Past -- */}
      <GHdr gk="past" label="Past" count={applyFilter(groups.past).length}/>
      {open.past && (
        <SectionBody>
          {applyFilter(groups.past).length === 0
            ? <Empty msg="No past appointments on file."/>
            : applyFilter(groups.past).map(({m,entry,kind,instanceDateStr,isBooked},i)=>(
                <EntryCard key={entry.id||i} m={m} entry={entry} kind={kind}
                  instanceDateStr={instanceDateStr} isBooked={isBooked}/>
              ))}
        </SectionBody>
      )}

      {/* -- Recurring schedules divider -- */}
      <div style={{display:"flex", alignItems:"center", gap:10, margin:"20px 2px 12px"}}>
        <div style={{flex:1, height:1, background:T.border}}/>
        <div style={{fontSize:10, fontWeight:600, letterSpacing:".09em",
          textTransform:"uppercase", color:T.textM, whiteSpace:"nowrap"}}>
          {"♻︎"} Recurring schedules
        </div>
        <div style={{flex:1, height:1, background:T.border}}/>
      </div>

      {/* -- Schedules -- */}
      <GHdr gk="schedules" label="Schedules"
        count={applyFilter(allSchedules).length} accent={T.violet}/>
      {open.schedules && (
        <SectionBody accent={T.violet}>
          {applyFilter(allSchedules).length === 0
            ? <Empty msg="No recurring schedules yet. Add one with + New appointment."/>
            : (()=>{
                const rows = applyFilter(allSchedules);
                return rows.map(({m,entry},i)=>(
                  <ScheduleRow key={entry.id||i} m={m} entry={entry} i={i} total={rows.length}/>
                ));
              })()}
          <div style={{padding:"8px 14px", fontSize:11, color:T.textS, lineHeight:1.6,
            borderTop:`1px solid ${T.border}`}}>
            Recurring health maintenance. Appointments appear automatically once they fall within the next month.
            Edit a schedule to change the cycle, provider, or visibility.
          </div>
        </SectionBody>
      )}

      {apptModal && apptModalJSX}
      {detailEntry && <DetailModal/>}
      {schedEditEntry && schedEditModalJSX}
    </div>
  );
}
/* ── Health module: Journal ─────────────────────────────── */
const J_TAGS_SYSTEM = ["Exercise","Family","Work","Social","Rest","Food","Outdoors","Mindfulness","Nature","Friends"];

function HJournal() {
  // Mood spectrum — function-scoped so it reads live T after theme switch
  const moods = [
    {key:5, ic:"😄", l:"Great", c:T.sage},
    {key:4, ic:"😊", l:"Good",  c:T.teal},
    {key:3, ic:"🙂", l:"Okay",  c:T.textM},
    {key:2, ic:"😐", l:"Low",   c:T.amber||T.warm},
    {key:1, ic:"😟", l:"Rough", c:T.rose},
  ];
  const byKey = k => moods.find(m=>m.key===k);

  const [entries, setEntries] = useState([
    {id:"e1",  date:"22-May-2026", mood:4, tags:["Family","Outdoors"],   happy:"Walked to the marina with Sarah after dinner. Sky was perfect.", stress:"", improve:"", photos:2},
    {id:"e2",  date:"21-May-2026", mood:3, tags:["Work"],                happy:"", stress:"Slow morning, felt behind all day.", improve:"Get the BP review booking sorted.", photos:0},
    {id:"e3",  date:"20-May-2026", mood:5, tags:["Work","Rest"],         happy:"Finally cleared the inbox. Small win but real.", stress:"", improve:"", photos:1},
    {id:"e4",  date:"19-May-2026", mood:2, tags:["Work"],                happy:"", stress:"Worry about Tom's exams next month.", improve:"Check in with Tom this week.", photos:0},
    {id:"e5",  date:"18-May-2026", mood:4, tags:["Outdoors"],            happy:"", stress:"", improve:"", photos:3},
    {id:"e6",  date:"17-May-2026", mood:4, tags:["Family","Outdoors"],   happy:"Sunday walk · 12k steps. Quiet but good.", stress:"", improve:"", photos:2},
    {id:"e7",  date:"16-May-2026", mood:5, tags:["Social","Friends"],    happy:"", stress:"", improve:"", photos:1},
    {id:"e8",  date:"14-May-2026", mood:3, tags:["Rest"],                happy:"", stress:"Average day, low energy.", improve:"", photos:0},
    {id:"e9",  date:"12-May-2026", mood:4, tags:["Exercise"],            happy:"Stuck to my BP meds routine for 30 days running.", stress:"", improve:"", photos:0},
    {id:"e10", date:"10-May-2026", mood:5, tags:["Family","Food"],       happy:"Big family dinner. Everyone round.", stress:"", improve:"", photos:3},
    {id:"e11", date:"07-May-2026", mood:3, tags:["Work"],                happy:"", stress:"Long day. Lots of meetings.", improve:"Block focus time tomorrow.", photos:0},
    {id:"e12", date:"04-May-2026", mood:4, tags:["Outdoors","Exercise"], happy:"Bank holiday walk in the hills.", stress:"", improve:"", photos:2},
  ]);

  const [composing,       setComposing]       = useState(false);
  const [draftMood,       setDraftMood]       = useState(null);
  const [draftHappy,      setDraftHappy]      = useState("");
  const [draftStress,     setDraftStress]     = useState("");
  const [draftImprove,    setDraftImprove]    = useState("");
  const [draftTags,       setDraftTags]       = useState([]);
  const [selectedEntry,   setSelectedEntry]   = useState(null);
  const [selectedDayDate, setSelectedDayDate] = useState(null);
  const [weekOffset,      setWeekOffset]      = useState(0);  // 0 = last 7 days

  const today       = new Date(2026, 4, 23);
  const monthsShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmt         = d => `${String(d.getDate()).padStart(2,"0")}-${monthsShort[d.getMonth()]}-${d.getFullYear()}`;
  const todayStr    = fmt(today);

  // 30-day window for heatmap
  const last30 = [...Array(30)].map((_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (29 - i));
    const dateStr = fmt(d);
    const e = entries.find(x => x.date === dateStr);
    return {date:dateStr, dow:d.getDay(), mood:e?.mood ?? null};
  });
  const firstDow  = last30[0].dow;
  const padStart  = firstDow === 0 ? 6 : firstDow - 1;
  const gridCells = [...Array(padStart).fill(null), ...last30];
  const DOW       = ["M","T","W","T","F","S","S"];

  // Memories: 7-day window driven by weekOffset
  const weekDates = [...Array(7)].map((_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - weekOffset * 7 - i);
    return fmt(d);
  }); // newest first
  const weekGroups = weekDates
    .map(date => ({ date, entry: entries.find(e => e.date === date) }))
    .filter(({entry}) => entry && entry.photos > 0);

  const weekLabel = weekOffset === 0 ? "Last 7 days" : (() => {
    const end   = new Date(today); end.setDate(today.getDate() - weekOffset * 7);
    const start = new Date(today); start.setDate(today.getDate() - weekOffset * 7 - 6);
    return `${start.getDate()} ${monthsShort[start.getMonth()]} – ${end.getDate()} ${monthsShort[end.getMonth()]}`;
  })();

  // Check if there are any entries with photos older than current window
  const oldestWindowDate = (() => {
    const d = new Date(today); d.setDate(today.getDate() - weekOffset * 7 - 6); return fmt(d);
  })();
  const hasEarlier = entries.some(e => e.photos > 0 && e.date < oldestWindowDate);

  const toggleTag = (tag) =>
    setDraftTags(prev => prev.includes(tag) ? prev.filter(t=>t!==tag) : [...prev, tag]);

  const openDay = (cell) => {
    if (!cell) return;
    const existing = entries.find(e => e.date === cell.date);
    if (existing) { setSelectedEntry(existing); setComposing(false); }
    else           { startNew(cell.date); }
  };

  const startNew = (dateStr = null) => {
    setComposing(true); setDraftMood(null);
    setDraftHappy(""); setDraftStress(""); setDraftImprove(""); setDraftTags([]);
    setSelectedDayDate(dateStr); setSelectedEntry(null);
  };

  const saveEntry = () => {
    if (!draftMood) return;
    const date = selectedDayDate || todayStr;
    setEntries(p => [
      {id:"e"+Date.now(), date, mood:draftMood, tags:draftTags,
       happy:draftHappy, stress:draftStress, improve:draftImprove, photos:0},
      ...p.filter(e => e.date !== date),
    ]);
    setComposing(false); setSelectedDayDate(null);
  };

  const todayPhotos = entries.filter(e=>e.date===todayStr).reduce((s,e)=>s+e.photos, 0);

  const textareaStyle = {
    width:"100%", background:T.card2, border:`1px solid ${T.border}`, borderRadius:8,
    color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13, padding:"8px 11px",
    resize:"none", outline:"none", lineHeight:1.6,
  };

  return (
    <div style={{maxWidth:760, margin:"0 auto"}}>

      {/* ── Weekly insight card ── */}
      <div className="card" style={{marginBottom:12,
        borderColor:T.sage+"55",
        background:`linear-gradient(135deg, ${T.sage}11, transparent 70%)`}}>
        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
          <span style={{fontSize:14}}>✨</span>
          <div style={{fontSize:10.5, fontWeight:700, color:T.sage, letterSpacing:".08em", textTransform:"uppercase"}}>
            Weekly insight
          </div>
          <span style={{fontSize:10, color:T.textS, marginLeft:"auto"}}>refreshes Monday</span>
        </div>
        <div style={{fontSize:13, color:T.text, lineHeight:1.6, marginBottom:4}}>
          Your best days this week featured <strong>Family</strong> and <strong>Outdoors</strong> time — both showed up on your highest-mood days.
        </div>
        <div style={{fontSize:11, color:T.textS}}>Sunday walk · marina evening · 2 great days logged 🌿</div>
      </div>

      {/* ── Compact 30-day heatmap ── */}
      <div className="card" style={{marginBottom:12}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
          <div className="card-title" style={{margin:0}}>Last 30 days</div>
          <div style={{display:"flex", gap:8}}>
            {moods.map(m => (
              <div key={m.key} style={{display:"flex", alignItems:"center", gap:3, fontSize:10, color:T.textS}}>
                <div style={{width:8, height:8, borderRadius:2, background:m.c}}/>
                <span>{m.l}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Compact DOW headers */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:2, marginBottom:2}}>
          {DOW.map((d,i) => (
            <div key={i} style={{textAlign:"center", fontSize:9, color:T.textS, fontWeight:600}}>{d}</div>
          ))}
        </div>
        {/* Compact heatmap squares — no day numbers */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:2}}>
          {gridCells.map((cell, i) => {
            if (!cell) return <div key={i} style={{height:14}}/>;
            const mood    = cell.mood ? byKey(cell.mood) : null;
            const isToday = cell.date === todayStr;
            return (
              <div key={i} onClick={() => openDay(cell)}
                title={`${cell.date}${mood ? ` · ${mood.l}` : " · no entry"}`}
                style={{
                  height:14, borderRadius:3, cursor:"pointer",
                  background: mood ? mood.c+"cc" : T.card2,
                  border:     isToday ? `1.5px solid ${T.warm}` : `1px solid ${mood ? mood.c+"55" : T.border}`,
                  opacity:    mood ? 1 : 0.45,
                  transition: "transform .1s",
                }}
                onMouseEnter={e=>e.currentTarget.style.transform="scaleY(1.3)"}
                onMouseLeave={e=>e.currentTarget.style.transform="scaleY(1)"}/>
            );
          })}
        </div>
        <div style={{marginTop:6, fontSize:10.5, color:T.textS, textAlign:"center"}}>
          Tap any day to view or add an entry
        </div>
      </div>

      {/* ── Mood strip + Write button ── */}
      <div className="card" style={{marginBottom:12}}>
        <div style={{fontSize:10.5, color:T.textM, marginBottom:7,
          textTransform:"uppercase", letterSpacing:".08em", fontWeight:700}}>
          How are you today?
        </div>
        <div style={{display:"flex", alignItems:"center", gap:6}}>
          {moods.map(m => (
            <div key={m.key}
              onClick={() => { setComposing(true); setDraftMood(m.key); setSelectedEntry(null); }}
              title={m.l}
              style={{
                flex:1, height:38, borderRadius:8, cursor:"pointer",
                border:`1.5px solid ${draftMood===m.key && composing ? m.c : T.border}`,
                background: draftMood===m.key && composing ? m.c+"22" : T.card2,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:19, transition:"all .15s",
              }}>
              {m.ic}
            </div>
          ))}
          <button className="btn-sm btn-warm"
            style={{height:38, padding:"0 14px", flexShrink:0, whiteSpace:"nowrap"}}
            onClick={() => startNew()}>
            + Write
          </button>
        </div>

        {/* ── Composer ── */}
        {composing && (
          <div style={{marginTop:14, paddingTop:14, borderTop:`1px solid ${T.border}`}}>
            {/* Tag strip */}
            <div style={{display:"flex", flexWrap:"wrap", gap:5, marginBottom:12}}>
              {J_TAGS_SYSTEM.map(tag => (
                <div key={tag} onClick={() => toggleTag(tag)}
                  style={{padding:"3px 10px", borderRadius:20, fontSize:11, cursor:"pointer",
                    border:`1.5px solid ${draftTags.includes(tag) ? T.teal : T.border}`,
                    background: draftTags.includes(tag) ? T.teal+"22" : T.card2,
                    color:      draftTags.includes(tag) ? T.teal : T.textM,
                    fontWeight: draftTags.includes(tag) ? 600 : 400,
                    transition:"all .15s"}}>
                  {tag}
                </div>
              ))}
            </div>
            {/* Three prompted sections */}
            {[
              {icon:"🌟", label:"What made you happy?",          value:draftHappy,   setter:setDraftHappy,   ph:"A moment, activity, or person…"},
              {icon:"😓", label:"What's stressing you out?",     value:draftStress,  setter:setDraftStress,  ph:"Optional — what's weighing on you?"},
              {icon:"💡", label:"One thing to improve or try",   value:draftImprove, setter:setDraftImprove, ph:"A small step or intention…"},
            ].map(({icon, label, value, setter, ph}) => (
              <div key={label} style={{marginBottom:10}}>
                <div style={{fontSize:11, color:T.textS, marginBottom:4, fontWeight:600}}>
                  {icon} {label}
                </div>
                <textarea value={value} onChange={e=>setter(e.target.value)}
                  style={textareaStyle} rows={2} placeholder={ph}/>
              </div>
            ))}
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:4}}>
              <div style={{fontSize:11, color:T.textS}}>📷 {todayPhotos}/3 photos today</div>
              <div style={{display:"flex", gap:6}}>
                <button className="btn-sm"
                  onClick={() => { setComposing(false); setDraftMood(null); setSelectedDayDate(null); }}>
                  Cancel
                </button>
                <button className="btn-sm btn-warm" onClick={saveEntry}
                  style={{opacity:draftMood ? 1 : 0.4, cursor:draftMood ? "pointer" : "not-allowed"}}>
                  Save entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Entry detail modal ── */}
      {selectedEntry && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:200,
          display:"flex", alignItems:"center", justifyContent:"center", padding:16}}
          onClick={e => { if (e.target===e.currentTarget) setSelectedEntry(null); }}>
          <div className="card" style={{width:"100%", maxWidth:520, maxHeight:"85vh", overflowY:"auto"}}>
            {/* Header */}
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14}}>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700}}>
                  {selectedEntry.date}
                </div>
                <div style={{display:"flex", alignItems:"center", gap:6, marginTop:5}}>
                  {selectedEntry.mood && (() => { const m = byKey(selectedEntry.mood); return (
                    <div style={{display:"flex", alignItems:"center", gap:5, padding:"3px 10px",
                      borderRadius:20, background:m.c+"20", border:`1px solid ${m.c}44`}}>
                      <span style={{fontSize:14}}>{m.ic}</span>
                      <span style={{fontSize:12, color:m.c, fontWeight:600}}>{m.l}</span>
                    </div>
                  ); })()}
                  <span style={{fontSize:10.5, color:T.textS}}>🔒 Mood locked</span>
                </div>
              </div>
              <button className="btn-sm" onClick={() => setSelectedEntry(null)}>✕ Close</button>
            </div>
            {/* Tags */}
            {selectedEntry.tags?.length > 0 && (
              <div style={{display:"flex", flexWrap:"wrap", gap:5, marginBottom:12}}>
                {selectedEntry.tags.map(t => (
                  <span key={t} style={{padding:"3px 10px", borderRadius:20, fontSize:11.5,
                    border:`1px solid ${T.teal}44`, background:T.teal+"15", color:T.teal, fontWeight:600}}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            {/* Prompted sections (read) */}
            {[
              {icon:"🌟", label:"What made you happy?",       value: selectedEntry.happy || selectedEntry.text},
              {icon:"😓", label:"What's stressing you out?",  value: selectedEntry.stress},
              {icon:"💡", label:"Improvement or intention",   value: selectedEntry.improve},
            ].filter(s=>s.value).map(s => (
              <div key={s.label} style={{marginBottom:10}}>
                <div style={{fontSize:10.5, color:T.textS, fontWeight:600, marginBottom:3}}>
                  {s.icon} {s.label}
                </div>
                <div style={{fontSize:13.5, lineHeight:1.7, color:T.text}}>{s.value}</div>
              </div>
            ))}
            {/* Photos */}
            {selectedEntry.photos > 0 && (
              <div style={{display:"grid",
                gridTemplateColumns:`repeat(${Math.min(selectedEntry.photos, 3)}, 1fr)`,
                gap:6, marginBottom:14, marginTop:6}}>
                {[...Array(selectedEntry.photos)].map((_,i) => (
                  <div key={i} style={{aspectRatio:"1/1", borderRadius:8, cursor:"pointer",
                    background:`repeating-linear-gradient(${30+i*55}deg, ${T.card2}, ${T.card2} 8px, ${T.border}44 8px, ${T.border}44 9px)`,
                    border:`1px solid ${T.border}`, display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:18}}>📷</div>
                ))}
              </div>
            )}
            {/* Add controls */}
            <div style={{borderTop:`1px solid ${T.border}`, paddingTop:12, marginTop:4}}>
              <div style={{fontSize:11, color:T.textS, marginBottom:8}}>
                Add to this entry · editable for 30 days
              </div>
              <textarea rows={3} placeholder="Add more context or a thought…"
                style={{...textareaStyle, marginBottom:8}}/>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <div style={{fontSize:11.5, color:T.textS}}>
                  📷 {selectedEntry.photos}/3 · {3-selectedEntry.photos} remaining
                </div>
                <button className="btn-sm btn-warm">Save changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Memories — weekly grouped view ── */}
      <div className="card" style={{marginTop:4}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
          <div className="card-title" style={{margin:0}}>🖼 Memories</div>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <button className="btn-sm" style={{padding:"3px 10px"}}
              disabled={weekOffset >= 4}
              onClick={() => setWeekOffset(v => Math.min(v+1, 4))}>
              ← Earlier
            </button>
            <span style={{fontSize:11.5, color:T.textS, minWidth:100, textAlign:"center"}}>
              {weekLabel}
            </span>
            <button className="btn-sm" style={{padding:"3px 10px"}}
              disabled={weekOffset === 0}
              onClick={() => setWeekOffset(v => Math.max(v-1, 0))}>
              Later →
            </button>
          </div>
        </div>

        {weekGroups.length === 0 ? (
          <div style={{textAlign:"center", padding:"24px 0", color:T.textS, fontSize:13}}>
            No photos this week
          </div>
        ) : (
          weekGroups.map(({date, entry}) => (
            <div key={date} style={{marginBottom:14}}>
              <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
                {entry.mood && (() => { const m = byKey(entry.mood); return (
                  <span style={{fontSize:13}}>{m.ic}</span>
                ); })()}
                <div style={{fontSize:11.5, fontWeight:600, color:T.textM}}>{date}</div>
                {entry.tags?.length > 0 && (
                  <span style={{fontSize:10.5, color:T.textS}}>· {entry.tags.join(", ")}</span>
                )}
              </div>
              <div style={{display:"flex", gap:6}}>
                {[...Array(entry.photos)].map((_,pi) => (
                  <div key={pi}
                    onClick={() => { setSelectedEntry(entry); setComposing(false); }}
                    style={{width:80, height:80, borderRadius:9, cursor:"pointer", flexShrink:0,
                      background:`repeating-linear-gradient(${30+(pi)*55}deg, ${T.card2}, ${T.card2} 6px, ${T.border}55 6px, ${T.border}55 7px)`,
                      border:`1px solid ${T.border}`,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:18}}>
                    📷
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {!hasEarlier && weekOffset >= 1 && weekGroups.length === 0 && (
          <div style={{textAlign:"center", fontSize:11, color:T.textS, marginTop:4}}>
            No older photos
          </div>
        )}
      </div>

    </div>
  );
}
/* ── HEALTH SCREEN ──────────────────────────────────────── */
function HealthScreen({viewerId, setViewerId}) {
  /* viewerId / setViewerId are PROTOTYPE ONLY — injected from the global
     "View as" switcher in the topbar. Claude Code must not implement these;
     the real app derives viewer identity from Cognito / NextAuth. */
  const [tab, setTab] = useState("Profiles");

  const viewerIsHMG = H_isHMG(viewerId);
  const [scope, setScope] = useState("me"); // me | hm | family
  const [focusId, setFocusId] = useState(viewerId);
  useEffect(() => { if (!viewerIsHMG && scope !== "me") setScope("me"); }, [viewerIsHMG, scope]);
  useEffect(() => { setFocusId(viewerId); setScope("me"); }, [viewerId]);

  const allVisible = H_visibleTo(viewerId);
  const inScope =
    scope === "me"  ? [H_byId(viewerId)] :
    scope === "hm"  ? allVisible.filter(m => m.id !== viewerId) :
    /* family */      allVisible;
  const focus = H_byId(focusId);

  /* Scope segments + captions for Health — keys differ from Life Admin
     ("me"/"hm"/"family") because Health is about MEMBERS, not item ownership. */
  const H_SCOPE_SEGMENTS = viewerIsHMG
    ? [["me","🙋 Own"],["hm","🛡 HMG"],["family","👥 Family"]]
    : [["me","🙋 Own"],["family","👥 Family"]];
  const otherCount = allVisible.filter(m => m.id !== viewerId).length;
  const H_CAPTIONS = {
    me:     "Showing only your data",
    hm:     otherCount === 0
              ? "No other members have shared records with the HMG yet"
              : `Family members the HMG manages · ${otherCount} member${otherCount===1?"":"s"}`,
    family: `All visible members · ${allVisible.length} member${allVisible.length===1?"":"s"} · sharing is member-initiated`,
  };

  const ScopeBar = () => (
    viewerIsHMG
      ? <ScopeToggle sec={scope} setSec={setScope} segments={H_SCOPE_SEGMENTS} captions={H_CAPTIONS}/>
      : <div style={{fontSize:11.5, color:T.textS, padding:"4px 0", marginBottom:14}}>
          🙋 Personal view · only you
        </div>
  );

  const views = {
    "Profiles":       <HProfiles     inScope={inScope} viewerId={viewerId}/>,
    "Medications":    <HMedications  inScope={inScope} viewerId={viewerId}/>,
    "Appointments":   <HAppointments inScope={inScope} viewerIsHMG={viewerIsHMG} viewerId={viewerId}/>,
    "Emergency Info": <HEmergency    inScope={inScope}/>,
    "Journal":        <HJournal/>,
  };

  return (
    <div>
      {/* Persistent overview panel — always visible above the tab strip */}
      <HOverviewPanel allVisible={allVisible} viewerIsHMG={viewerIsHMG}/>

      <div className="nav-tabs">
        {Object.keys(views).map(t => (
          <div key={t} className={`nav-tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>{t}</div>
        ))}
      </div>

      {tab !== "Journal" && <ScopeBar/>}
      {views[tab]}
    </div>
  );
}


/* ── RECIPES & GROCERIES ─────────────────────────────────── */
function RecipesScreen() {
  const [tab,setTab] = useState("Library");

  /* ── Library data ── */
  const [recipes, setRecipes] = useState([
    {id:"r1",name:"Spaghetti Bolognese",    cuisine:"Italian",      time:"40 min",serves:4,meals:["Dinner"],         diet:"nonveg", tags:["Family fav","Freezable"],  src:"predefined"},
    {id:"r2",name:"Chicken Tikka Masala",   cuisine:"Indian",       time:"45 min",serves:4,meals:["Dinner"],         diet:"nonveg", tags:["Mild spice","Family fav"], src:"predefined"},
    {id:"r3",name:"Greek Salad w/ Halloumi",cuisine:"Mediterranean",time:"15 min",serves:2,meals:["Lunch","Dinner"], diet:"veg",    tags:["Quick"],                   src:"predefined"},
    {id:"r4",name:"Baked Salmon with Veg",  cuisine:"British",      time:"30 min",serves:2,meals:["Dinner"],         diet:"nonveg", tags:["Healthy","Quick"],          src:"predefined"},
    {id:"r5",name:"Margherita Pizza",       cuisine:"Italian",      time:"60 min",serves:4,meals:["Lunch","Dinner"], diet:"veg",    tags:["Kids fav"],                 src:"predefined"},
    {id:"r6",name:"Overnight Oats",         cuisine:"British",      time:"5 min", serves:1,meals:["Breakfast"],      diet:"vegan",  tags:["Quick","Healthy"],          src:"predefined"},
    {id:"r7",name:"Beef & Veg Stew",        cuisine:"British",      time:"90 min",serves:6,meals:["Dinner"],         diet:"nonveg", tags:["Freezable","Family fav"],   src:"predefined"},
    {id:"r8",name:"Chicken Fajitas",        cuisine:"Mexican",      time:"25 min",serves:4,meals:["Lunch","Dinner"], diet:"nonveg", tags:["Family fav","Quick"],       src:"mine",   notes:"Tom always wants double the sour cream!"},
    {id:"r9",name:"Spiced Cauliflower Soup",cuisine:"British",      time:"35 min",serves:4,meals:["Lunch"],          diet:"vegan",  tags:["Healthy"],                  src:"ai",     notes:""},
  ]);

  /* ── Library state ── */
  const [libSearch,setLibSearch]             = useState("");
  const [srcFilter,setSrcFilter]             = useState("all");
  const [mealFilter,setMealFilter]           = useState("all");
  const [libSaved,setLibSaved]               = useState(["r1","r2","r4","r6","r8"]);
  const [recipeViewData,setRecipeViewData]   = useState(null);
  const [editName,setEditName]               = useState("");
  const [editTags,setEditTags]               = useState([]);
  const [editNotes,setEditNotes]             = useState("");
  const [newTagInput,setNewTagInput]         = useState("");
  const [showTagInput,setShowTagInput]       = useState(false);
  const [forkConfirm,setForkConfirm]         = useState(null);
  const [addRecipeOpen,setAddRecipeOpen]     = useState(false);
  const [newRec,setNewRec]                   = useState({name:"",cuisine:"British",meals:[],diet:"nonveg",time:30,serves:2,tags:[],notes:"",ingredients:"",method:""});
  const [newRecTagInput,setNewRecTagInput]   = useState("");
  const [aiView,setAiView]                     = useState(false);
  const [aiStep,setAiStep]                     = useState("input"); // "input" | "review" | "confirm"
  const [aiMealType,setAiMealType]             = useState("Dinner");
  const [aiText,setAiText]                     = useState("");
  const [aiServings,setAiServings]             = useState(4);
  const [aiGenerated,setAiGenerated]           = useState(null);
  const [aiConfirmName,setAiConfirmName]       = useState("");
  const [aiConfirmMeals,setAiConfirmMeals]     = useState([]);
  const [aiConfirmCuisine,setAiConfirmCuisine] = useState("");
  const [aiConfirmServes,setAiConfirmServes]   = useState(4);
  const PANTRY = ["Chicken","Pasta","Eggs","Tomatoes","Onion","Garlic","Potatoes","Rice","Cheese","Spinach","Salmon","Lentils"];

  const libFiltered = recipes.filter(r=>{
    if(srcFilter==="mine" && r.src!=="mine") return false;
    if(srcFilter==="ai"   && r.src!=="ai")   return false;
    if(mealFilter!=="all" && !r.meals.includes(mealFilter)) return false;
    if(libSearch && !r.name.toLowerCase().includes(libSearch.toLowerCase()) && !r.cuisine.toLowerCase().includes(libSearch.toLowerCase())) return false;
    return true;
  });

  const openForEdit = r => { setRecipeViewData(r); setEditName(r.name); setEditTags([...r.tags]); setEditNotes(r.notes||""); setNewTagInput(""); setShowTagInput(false); };
  const openRecipe  = r => { if(r.src==="predefined") setForkConfirm(r); else openForEdit(r); };
  const confirmFork = r => { setForkConfirm(null); openForEdit({...r,src:"mine",id:`r${Date.now()}`,notes:""}); };

  const addNewRecTag    = () => { const t=newRecTagInput.trim(); if(t&&!newRec.tags.includes(t)) setNewRec(p=>({...p,tags:[...p.tags,t]})); setNewRecTagInput(""); };
  const removeNewRecTag = t => setNewRec(p=>({...p,tags:p.tags.filter(x=>x!==t)}));

  const saveRecipe = () => {
    const updated = {...recipeViewData, name:editName, tags:editTags, notes:editNotes};
    setRecipes(rs => rs.some(r=>r.id===updated.id)
      ? rs.map(r=>r.id===updated.id ? updated : r)   // edit existing
      : [...rs, updated]                              // fork — add new
    );
    setRecipeViewData(null);
  };

  const saveNewRecipe = () => {
    if(!newRec.name.trim() || newRec.meals.length===0) return;
    setRecipes(rs=>[...rs, {...newRec, id:`r${Date.now()}`, src:"mine"}]);
    setNewRec({name:"",cuisine:"British",meals:[],diet:"nonveg",time:30,serves:2,tags:[],notes:"",ingredients:"",method:""});
    setAddRecipeOpen(false);
  };

  /* ── AI creation flow handlers ── */
  const openAiFlow = () => {
    setAiStep("input"); setAiMealType("Dinner"); setAiText("");
    setAiServings(4); setAiGenerated(null);
    setAiView(true);
  };

  const generateRecipe = () => {
    // Prototype: mock generated recipe. In production this calls the AI API.
    const mock = {
      name: "Chicken arrabiata pasta",
      ingredients: [
        "400g chicken breast, diced","300g penne pasta","400g tinned tomatoes",
        "2 cloves garlic, minced","1 tsp dried chilli flakes","2 tbsp olive oil",
        "Salt and black pepper to taste",
      ],
      method: [
        "Bring a large pan of salted water to the boil. Cook penne according to packet instructions.",
        "Heat olive oil in a frying pan over medium-high heat. Add chicken and cook for 6–8 minutes until golden.",
        "Add garlic and chilli flakes, stir for 1 minute. Pour in tinned tomatoes, season and simmer for 10 minutes.",
        "Drain pasta, toss with the sauce and serve immediately.",
      ],
      calorieMin:420, calorieMax:480, cookTime:40,
      cuisine:"Italian", meals:[aiMealType], serves:aiServings,
      diet:"nonveg", dietaryOk:true,
      dietaryMsg:"No conflicts with your family's restrictions",
    };
    setAiGenerated(mock);
    setAiConfirmName(mock.name);
    setAiConfirmMeals([...mock.meals]);
    setAiConfirmCuisine(mock.cuisine);
    setAiConfirmServes(mock.serves);
    setAiStep("review");
  };

  const saveAiRecipe = () => {
    if(!aiConfirmName.trim() || aiConfirmMeals.length===0 || !aiConfirmCuisine) return;
    setRecipes(rs=>[...rs,{
      id:`r${Date.now()}`, src:"ai",
      name:aiConfirmName, cuisine:aiConfirmCuisine,
      meals:aiConfirmMeals, diet:aiGenerated.diet,
      serves:aiConfirmServes, time:`${aiGenerated.cookTime} min`,
      tags:[], notes:"",
      ingredients:aiGenerated.ingredients.join("\n"),
      method:aiGenerated.method.join("\n"),
    }]);
    setAiView(false); setAiStep("input"); setAiGenerated(null);
  };

  /* ── Library badge/pill helpers ── */
  const MEAL_COLORS = {Breakfast:{bg:T.amberS,c:T.amber},Lunch:{bg:T.sageS,c:T.sage},Dinner:{bg:T.tealS,c:T.teal},Snack:{bg:T.card2,c:T.textM}};
  const DietDot  = ({diet}) => {
    if(!diet) return null;
    const c = diet==="veg"?"#16a34a":diet==="vegan"?"#7c3aed":"#dc2626";
    return <span title={diet==="veg"?"Vegetarian":diet==="vegan"?"Vegan":"Non-vegetarian"}
      style={{width:11,height:11,border:`1.5px solid ${c}`,borderRadius:2,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:c}}/>
    </span>;
  };
  const MealBadge  = ({meal}) => { const col=MEAL_COLORS[meal]||MEAL_COLORS.Snack; return <span style={{fontSize:10,padding:"1px 6px",borderRadius:6,background:col.bg,color:col.c,fontWeight:600,whiteSpace:"nowrap"}}>{meal}</span>; };
  const InfoTag    = ({children}) => <span style={{fontSize:10,padding:"1px 6px",borderRadius:6,background:T.card2,color:T.textS,whiteSpace:"nowrap"}}>{children}</span>;
  const WarmTag    = ({children}) => <span style={{fontSize:10,padding:"1px 6px",borderRadius:6,background:T.warmS,color:T.warm,fontWeight:600,whiteSpace:"nowrap"}}>{children}</span>;
  const SrcBadge   = ({src}) => {
    if(src==="predefined") return null;
    const label=src==="mine"?"My recipe":"AI-made";
    const bg=src==="mine"?T.warmS:T.sageS, c=src==="mine"?T.warm:T.sage;
    return <span style={{fontSize:10,padding:"1px 6px",borderRadius:6,background:bg,color:c,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>;
  };
  const FilterPill = ({label,active,onClick}) => (
    <span onClick={onClick} style={{padding:"4px 11px",borderRadius:20,fontSize:11,border:`1px solid ${active?T.warm:T.border}`,background:active?T.warmS:"transparent",color:active?T.warm:T.textS,cursor:"pointer",whiteSpace:"nowrap",fontWeight:active?600:400,userSelect:"none"}}>{label}</span>
  );
  const DietSelect = ({value,onChange}) => (
    <div style={{display:"flex",gap:6}}>
      {[["nonveg","Non-veg"],["veg","Veg"],["vegan","Vegan"]].map(([v,l])=>(
        <span key={v} onClick={()=>onChange(v)}
          style={{padding:"4px 10px",borderRadius:20,fontSize:11,border:`1px solid ${value===v?T.warm:T.border}`,background:value===v?T.warmS:"transparent",color:value===v?T.warm:T.textS,cursor:"pointer",fontWeight:value===v?600:400,userSelect:"none"}}>{l}</span>
      ))}
    </div>
  );
  const fldLbl = {
    display:"block", fontSize:11, fontWeight:600, color:T.textS,
    marginBottom:4, marginTop:14, letterSpacing:".04em", textTransform:"uppercase"
  };
  const fldInp = {
    width:"100%", padding:"8px 11px", borderRadius:8,
    border:`1px solid ${T.border}`, background:T.surface, color:T.text,
    fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box"
  };
  const modalShell = {
    position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
    zIndex:201, width:"min(460px,94vw)", maxHeight:"88vh", overflowY:"auto",
    background:T.card, border:`1px solid ${T.borderHi}`, borderRadius:18,
    padding:24, boxShadow:"0 32px 80px rgba(0,0,0,0.55)"
  };
  const rowBase = {
    display:"flex", alignItems:"center", gap:10, padding:"8px 14px",
    borderBottom:`1px solid ${T.border}`, cursor:"pointer", transition:"background .12s"
  };
  const fieldStyle = {...fldInp, borderRadius:9};
  const labelStyle = {...fldLbl, marginTop:0};
  const SUGGESTED_TAGS = ["Quick","Healthy","Freezable","Family fav","Kids fav","Comfort food","Batch cook","Date night"];

  /* ── Meal Planner ── */
  const DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const MEALS = ["Breakfast","Lunch","Snack","Dinner"];
  const WEEK_LABELS = ["26 May – 1 Jun","2 Jun – 8 Jun"];
  const WEEK_DEFAULTS = {
    0: {
      "Breakfast-Mon":{v:"Overnight Oats",t:"lib"},"Breakfast-Tue":{v:"Toast & Eggs",t:"lib"},"Breakfast-Wed":{v:"Porridge",t:"lib"},"Breakfast-Thu":{v:"Yoghurt",t:"qck"},"Breakfast-Fri":{v:"Cereal",t:"qck"},"Breakfast-Sat":{v:"Pancakes",t:"lib"},"Breakfast-Sun":{v:"Full English",t:"lib"},
      "Lunch-Mon":{v:"Greek Salad",t:"lib"},"Lunch-Tue":{v:"Chicken Wrap",t:"lib"},"Lunch-Wed":{v:"Soup & Bread",t:"qck"},"Lunch-Thu":{v:"Leftovers",t:"qck"},"Lunch-Fri":{v:"Tuna Sandwich",t:"qck"},"Lunch-Sat":{v:"Fajitas",t:"lib"},"Lunch-Sun":{v:"Leftovers",t:"qck"},
      "Snack-Mon":{v:"Fruit",t:"qck"},"Snack-Tue":{v:"Oat Biscuits",t:"qck"},"Snack-Wed":{v:"Fruit",t:"qck"},"Snack-Thu":{v:"Hummus & Crackers",t:"ai"},"Snack-Fri":{v:"Crisps",t:"qck"},"Snack-Sat":{v:"Cake",t:"qck"},"Snack-Sun":{v:"Popcorn",t:"qck"},
      "Dinner-Mon":{v:"Spag Bol",t:"lib"},"Dinner-Tue":{v:"Tikka Masala",t:"lib"},"Dinner-Wed":{v:"Salmon & Veg",t:"lib"},"Dinner-Thu":{v:"Pizza",t:"qck"},"Dinner-Fri":{v:"Fish & Chips",t:"qck"},"Dinner-Sat":{v:"Beef Stew",t:"lib"},"Dinner-Sun":{v:"Sunday Roast",t:"lib"},
    },
    1: {
      "Breakfast-Mon":{v:"Granola Bowl",t:"ai"},"Breakfast-Tue":{v:"Porridge",t:"lib"},"Breakfast-Wed":{v:"Toast & Eggs",t:"lib"},"Breakfast-Thu":{v:"Overnight Oats",t:"lib"},"Breakfast-Fri":{v:"Cereal",t:"qck"},"Breakfast-Sat":{v:"Pancakes",t:"lib"},"Breakfast-Sun":{v:"Full English",t:"lib"},
      "Lunch-Mon":{v:"Chicken Wrap",t:"lib"},"Lunch-Tue":{v:"Greek Salad",t:"lib"},"Lunch-Wed":{v:"Tomato Soup",t:"ai"},"Lunch-Thu":{v:"Sandwiches",t:"qck"},"Lunch-Fri":{v:"Leftovers",t:"qck"},"Lunch-Sat":{v:"Eating out",t:"qck"},"Lunch-Sun":{v:"Fajitas",t:"lib"},
      "Snack-Mon":{v:"Fruit",t:"qck"},"Snack-Tue":{v:"Nuts & Seeds",t:"ai"},"Snack-Wed":{v:"Oat Biscuits",t:"qck"},"Snack-Thu":{v:"Fruit",t:"qck"},"Snack-Fri":{v:"Yoghurt",t:"qck"},"Snack-Sat":{v:"Cake",t:"qck"},"Snack-Sun":{v:"Popcorn",t:"qck"},
      "Dinner-Mon":{v:"Tikka Masala",t:"lib"},"Dinner-Tue":{v:"Lentil Dahl",t:"ai"},"Dinner-Wed":{v:"Spag Bol",t:"lib"},"Dinner-Thu":{v:"Salmon & Veg",t:"lib"},"Dinner-Fri":{v:"Takeaway",t:"qck"},"Dinner-Sat":{v:"Sunday Roast",t:"lib"},"Dinner-Sun":{v:"Beef Stew",t:"lib"},
    },
  };
  const PLANNER_QUICK = ["Leftovers","Takeaway","Eating out","Sandwiches","Soup","Salad","Toast","Cereal","Yoghurt","Fruit","Crisps","Oat Biscuits","Porridge","Popcorn","Eggs on toast"];
  const AI_PLAN_RESULT = {
    "Breakfast-Mon":{v:"Overnight Oats",t:"lib"},"Breakfast-Tue":{v:"Berry Smoothie Bowl",t:"ai"},"Breakfast-Wed":{v:"Toast & Eggs",t:"lib"},"Breakfast-Thu":{v:"Shakshuka",t:"ai"},"Breakfast-Fri":{v:"Porridge",t:"lib"},"Breakfast-Sat":{v:"Pancakes",t:"lib"},"Breakfast-Sun":{v:"Full English",t:"lib"},
    "Lunch-Mon":{v:"Greek Salad",t:"lib"},"Lunch-Tue":{v:"Pesto Orzo Salad",t:"ai"},"Lunch-Wed":{v:"Chicken Wrap",t:"lib"},"Lunch-Thu":{v:"Courgette Soup",t:"ai"},"Lunch-Fri":{v:"Greek Salad",t:"lib"},"Lunch-Sat":{v:"Halloumi Wrap",t:"ai"},"Lunch-Sun":{v:"Leftovers",t:"qck"},
    "Snack-Mon":{v:"Fruit",t:"qck"},"Snack-Tue":{v:"Hummus & Veg",t:"ai"},"Snack-Wed":{v:"Oat Biscuits",t:"qck"},"Snack-Thu":{v:"Nuts & Seeds",t:"qck"},"Snack-Fri":{v:"Fruit",t:"qck"},"Snack-Sat":{v:"Yoghurt",t:"qck"},"Snack-Sun":{v:"Fruit",t:"qck"},
    "Dinner-Mon":{v:"Spag Bol",t:"lib"},"Dinner-Tue":{v:"Lentil Dahl",t:"ai"},"Dinner-Wed":{v:"Salmon & Veg",t:"lib"},"Dinner-Thu":{v:"Tikka Masala",t:"lib"},"Dinner-Fri":{v:"Courgette Fritters",t:"ai"},"Dinner-Sat":{v:"Sunday Roast",t:"lib"},"Dinner-Sun":{v:"Beef Stew",t:"lib"},
  };
  const isMobile = window.innerWidth < 640;
  const [weekIdx,setWeekIdx]                     = useState(0);
  const [weekPlans,setWeekPlans]                 = useState(WEEK_DEFAULTS);
  const [mealPickerCell,setMealPickerCell]       = useState(null);
  const [mpSearch,setMpSearch]                   = useState("");
  const [planMenuOpen,setPlanMenuOpen]           = useState(false);
  const [saveTemplateOpen,setSaveTemplateOpen]   = useState(false);
  const [loadTemplateOpen,setLoadTemplateOpen]   = useState(false);
  const [templateNameInput,setTemplateNameInput] = useState("");
  const [planTemplates,setPlanTemplates]         = useState([
    {name:"Busy weekday plan",saved:"12-May-2026",count:24},
    {name:"Family favourite week",saved:"03-May-2026",count:28},
  ]);
  const [aiPlanView,setAiPlanView]               = useState(false);
  const [aiPlanStep,setAiPlanStep]               = useState("input");
  const [aiPlanWeekSel,setAiPlanWeekSel]         = useState(0);
  const [aiPlanBudget,setAiPlanBudget]           = useState("90");
  const [aiPlanMeals,setAiPlanMeals]             = useState({Breakfast:true,Lunch:true,Snack:true,Dinner:true});
  const [aiPlanPrefs,setAiPlanPrefs]             = useState("");
  const [aiPlanUseLib,setAiPlanUseLib]           = useState(true);
  const [aiPlanResult,setAiPlanResult]           = useState(null);
  const [aiPlanPickerCell,setAiPlanPickerCell]   = useState(null);
  const [aiPlanPickerSearch,setAiPlanPickerSearch] = useState("");
  const [aiPlanGrocery,setAiPlanGrocery]         = useState(true);
  const [aiPlanBriefing,setAiPlanBriefing]       = useState(true);

  /* ── Grocery List ── */
  // Each item: { id, name, qty, unit, category, sources, done, removed, pantry, manual }
  const GROC_CATS = ["Produce","Dairy & Eggs","Meat & Fish","Pantry & Dry","Bakery","Other"];
  const INITIAL_GROC = [
    {id:"g1", name:"Onions",          qty:"3",    unit:"",       category:"Produce",      sources:["Spag Bol","Tikka Masala","Beef Stew"], done:false, removed:false, pantry:false, manual:false},
    {id:"g2", name:"Garlic",          qty:"1",    unit:"bulb",   category:"Produce",      sources:["Tikka Masala","Beef Stew"],            done:false, removed:false, pantry:true,  manual:false},
    {id:"g3", name:"Broccoli",        qty:"2",    unit:"",       category:"Produce",      sources:["Salmon & Veg"],                        done:false, removed:false, pantry:false, manual:false},
    {id:"g4", name:"Spinach",         qty:"1",    unit:"bag",    category:"Produce",      sources:["Greek Salad"],                         done:false, removed:false, pantry:false, manual:false},
    {id:"g5", name:"Lemon",           qty:"2",    unit:"",       category:"Produce",      sources:["Salmon & Veg","Greek Salad"],          done:false, removed:false, pantry:false, manual:false},
    {id:"g6", name:"Milk",            qty:"2",    unit:"pints",  category:"Dairy & Eggs", sources:[],                                      done:true,  removed:false, pantry:false, manual:true},
    {id:"g7", name:"Eggs",            qty:"12",   unit:"",       category:"Dairy & Eggs", sources:["Pancakes","Full English"],             done:false, removed:false, pantry:true,  manual:false},
    {id:"g8", name:"Cheddar",         qty:"200",  unit:"g",      category:"Dairy & Eggs", sources:["Fajitas"],                            done:false, removed:false, pantry:false, manual:false},
    {id:"g9", name:"Natural yoghurt", qty:"1",    unit:"pot",    category:"Dairy & Eggs", sources:["Tikka Masala"],                       done:false, removed:false, pantry:false, manual:false},
    {id:"g10",name:"Chicken breast",  qty:"800",  unit:"g",      category:"Meat & Fish",  sources:["Tikka Masala","Fajitas"],             done:false, removed:false, pantry:false, manual:false},
    {id:"g11",name:"Beef mince",      qty:"500",  unit:"g",      category:"Meat & Fish",  sources:["Spag Bol"],                           done:false, removed:false, pantry:false, manual:false},
    {id:"g12",name:"Salmon fillets",  qty:"2",    unit:"",       category:"Meat & Fish",  sources:["Salmon & Veg"],                       done:false, removed:false, pantry:false, manual:false},
    {id:"g13",name:"Penne pasta",     qty:"500",  unit:"g",      category:"Pantry & Dry", sources:["Spag Bol"],                           done:false, removed:false, pantry:true,  manual:false},
    {id:"g14",name:"Tinned tomatoes", qty:"3",    unit:"cans",   category:"Pantry & Dry", sources:["Spag Bol","Tikka Masala"],            done:false, removed:false, pantry:false, manual:false},
    {id:"g15",name:"Olive oil",       qty:"1",    unit:"bottle", category:"Pantry & Dry", sources:["Salmon & Veg","Greek Salad"],         done:false, removed:false, pantry:true,  manual:false},
    {id:"g16",name:"Tortilla wraps",  qty:"8",    unit:"",       category:"Bakery",        sources:["Fajitas"],                           done:false, removed:false, pantry:false, manual:false},
    {id:"g17",name:"Sourdough loaf",  qty:"1",    unit:"",       category:"Bakery",        sources:[],                                    done:false, removed:false, pantry:false, manual:true},
  ];
  const [grocItems,setGrocItems]               = useState(INITIAL_GROC);
  const [grocFilter,setGrocFilter]             = useState("all");   // "all" | "needed" | "got"
  const [grocCollapsed,setGrocCollapsed]       = useState({__pantry:true});
  const [grocListView,setGrocListView]         = useState("active"); // "active" | "history"
  const [grocGenModal,setGrocGenModal]         = useState(false);
  const [grocShareModal,setGrocShareModal]     = useState(false);
  const [grocCompleted,setGrocCompleted]       = useState(false);
  const [grocPastExpanded,setGrocPastExpanded] = useState({});
  const [grocPastLists,setGrocPastLists]       = useState([
    {id:"pl1", week:"19–25 May 2026", items:16, spend:"£74.20", status:"completed",
      rows:[{name:"Milk",qty:"2 pints",done:true},{name:"Chicken breast",qty:"800g",done:true},{name:"Onions",qty:"×3",done:true},{name:"Sourdough loaf",qty:"×1",done:false,removed:true},{name:"Broccoli",qty:"×2",done:true}]},
    {id:"pl2", week:"12–18 May 2026", items:14, spend:"£68.50", status:"completed",
      rows:[{name:"Salmon fillets",qty:"×2",done:true},{name:"Eggs",qty:"×12",done:true},{name:"Cheddar",qty:"200g",done:true}]},
    {id:"pl3", week:"5–11 May 2026",  items:19, spend:"£91.10", status:"abandoned",
      rows:[]},
  ]);
  // Edit item modal
  const [grocEditItem,setGrocEditItem]         = useState(null);
  const [grocEditName,setGrocEditName]         = useState("");
  const [grocEditQty,setGrocEditQty]           = useState("");
  const [grocEditUnit,setGrocEditUnit]         = useState("");
  const [grocEditCat,setGrocEditCat]           = useState("");
  // Add item modal
  const [grocAddModal,setGrocAddModal]         = useState(false);
  const [grocAddName,setGrocAddName]           = useState("");
  const [grocAddQty,setGrocAddQty]             = useState("");
  const [grocAddUnit,setGrocAddUnit]           = useState("");
  const [grocAddCat,setGrocAddCat]             = useState("Other");

  const toggleGrocDone   = id => setGrocItems(p=>p.map(g=>g.id===id ? {...g, done:!g.done, removed:false} : g));
  const toggleGrocPantry = id => setGrocItems(p=>p.map(g=>g.id===id ? {...g, pantry:!g.pantry} : g));
  const removeGrocItem   = id => setGrocItems(p=>p.map(g=>g.id===id ? {...g, removed:!g.removed, done:false} : g));

  const openGrocEdit = g => { setGrocEditItem(g); setGrocEditName(g.name); setGrocEditQty(g.qty); setGrocEditUnit(g.unit); setGrocEditCat(g.category); };
  const saveGrocEdit = () => {
    setGrocItems(p=>p.map(g=>g.id===grocEditItem.id ? {...g, name:grocEditName, qty:grocEditQty, unit:grocEditUnit, category:grocEditCat} : g));
    setGrocEditItem(null);
  };
  const addGrocItem = () => {
    if(!grocAddName.trim()) return;
    setGrocItems(p=>[...p,{id:`gm${Date.now()}`,name:grocAddName.trim(),qty:grocAddQty.trim(),unit:grocAddUnit.trim(),category:grocAddCat,sources:[],done:false,removed:false,pantry:false,manual:true}]);
    setGrocAddName(""); setGrocAddQty(""); setGrocAddUnit(""); setGrocAddCat("Other"); setGrocAddModal(false);
  };

  // Derived counts
  const grocActive  = grocItems.filter(g=>!g.pantry);
  const grocNeeded  = grocActive.filter(g=>!g.done&&!g.removed);
  const grocGot     = grocActive.filter(g=>g.done||g.removed);
  const grocEstSpend = 68;
  const allResolved  = grocActive.length > 0 && grocNeeded.length === 0;

  // Grouped display for active list (needed items only in "all"/"needed"; resolved in "got")
  const grocFiltered = grocActive.filter(g=>{
    if(grocFilter==="needed") return !g.done && !g.removed;
    if(grocFilter==="got")    return g.done || g.removed;
    return true;
  });
  const grocByCategory = GROC_CATS.map(cat=>({
    cat,
    needed: grocActive.filter(g=>g.category===cat&&!g.done&&!g.removed),
    got:    grocActive.filter(g=>g.category===cat&&(g.done||g.removed)),
    all:    grocFiltered.filter(g=>g.category===cat),
  })).filter(({all})=>all.length>0);

  const pantryItems = grocItems.filter(g=>g.pantry);

  const completeList = () => {
    setGrocPastLists(p=>[{id:`pl${Date.now()}`,week:"26 May–1 Jun 2026",items:grocGot.length,spend:`£${grocEstSpend}.00`,status:"completed",rows:grocGot.slice(0,5).map(g=>({name:g.name,qty:`${g.qty}${g.unit?" "+g.unit:""}`,done:g.done,removed:g.removed}))},...p]);
    setGrocCompleted(true);
  };
  const startNewList = () => { setGrocItems(INITIAL_GROC.map(g=>({...g,done:false,removed:false}))); setGrocCompleted(false); setGrocFilter("all"); };

  // Shared item row helpers
  const grocItemRowStyle = {display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:9,background:T.card,border:`1px solid ${T.border}`,marginBottom:4,cursor:"pointer",minHeight:36};
  const grocCbStyle = (done,removed) => ({width:17,height:17,borderRadius:4,border:`1.5px solid ${done?T.sage:removed?T.rose:T.border}`,background:done?T.sage:removed?T.roseS:T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:done?"#fff":removed?T.rose:"transparent",flexShrink:0,cursor:"pointer"});
  const grocCatHeaderStyle = {display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 2px",cursor:"pointer",userSelect:"none",borderBottom:`1px solid ${T.border}`,marginBottom:4,marginTop:8};
  const grocUndoBtn   = {fontSize:11,padding:"2px 9px",borderRadius:12,border:`1px solid ${T.sky}`,background:T.skyS,color:T.sky,cursor:"pointer",fontFamily:"inherit",flexShrink:0,fontWeight:600};
  const grocRemoveBtn = {fontSize:11,padding:"2px 9px",borderRadius:12,border:`1px solid ${T.border}`,background:"none",color:T.textS,cursor:"pointer",fontFamily:"inherit",flexShrink:0};
  const grocPantryBtn = {fontSize:14,width:26,height:26,borderRadius:8,border:`1px solid ${T.border}`,background:"none",color:T.teal,cursor:"pointer",fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,title:"Move to pantry"};
  const grocFieldStyle = {width:"100%",padding:"7px 10px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
  const grocLabelStyle = {fontSize:10,fontWeight:600,color:T.textS,letterSpacing:".04em",textTransform:"uppercase",display:"block",marginBottom:4};

  const views = {
    "Library": aiView ? (
      /* ── AI Creation Flow (3 stages: input → review → confirm) ── */
      <div>

        {/* ── STAGE 1: INPUT ── */}
        {aiStep==="input" && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <button onClick={()=>setAiView(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,padding:0,lineHeight:1}}>←</button>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>Create with AI</div>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:T.sageS,color:T.sage,fontWeight:600,marginLeft:"auto"}}>AI</span>
            </div>

            {/* Ingredient chips — tap to append to text box */}
            <div style={{fontSize:11,fontWeight:600,color:T.textS,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Ingredients</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
              {PANTRY.map(item=>{
                const added=aiText.toLowerCase().includes(item.toLowerCase());
                return <span key={item} onClick={()=>{
                  if(added) return;
                  setAiText(t=>{ const s=t.trim(); return s?`${s}, ${item}`:item; });
                }}
                  style={{fontSize:12,padding:"5px 11px",borderRadius:20,border:`1px solid ${added?T.warm:T.border}`,background:added?T.warmS:"transparent",color:added?T.warm:T.textS,cursor:added?"default":"pointer",userSelect:"none"}}>{item}</span>;
              })}
            </div>
            <input value={aiText} onChange={e=>setAiText(e.target.value)}
              placeholder="Select ingredients above or type here…"
              style={{width:"100%",padding:"8px 11px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:16}}/>

            <div style={{height:1,background:T.border,marginBottom:16}}/>

            {/* Meal type — single-select */}
            <div style={{fontSize:11,fontWeight:600,color:T.textS,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Meal type</div>
            <div style={{display:"flex",gap:6,marginBottom:16}}>
              {["Breakfast","Lunch","Dinner","Snack"].map(m=>{
                const col=MEAL_COLORS[m];
                const sel=aiMealType===m;
                return <span key={m} onClick={()=>setAiMealType(m)}
                  style={{fontSize:12,padding:"5px 11px",borderRadius:20,border:`1px solid ${sel?col.c:T.border}`,background:sel?col.bg:"transparent",color:sel?col.c:T.textS,cursor:"pointer",userSelect:"none"}}>{m}</span>;
              })}
            </div>

            <div style={{height:1,background:T.border,marginBottom:16}}/>

            {/* Serving count */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:600,color:T.textS,letterSpacing:".04em",textTransform:"uppercase",whiteSpace:"nowrap"}}>How many people?</div>
              <div style={{display:"flex",gap:6}}>
                {[1,2,3,4,5,6].map(n=>(
                  <span key={n} onClick={()=>setAiServings(n)}
                    style={{width:28,height:28,borderRadius:"50%",border:`1px solid ${aiServings===n?T.warm:T.border}`,background:aiServings===n?T.warmS:"transparent",color:aiServings===n?T.warm:T.textS,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,cursor:"pointer",fontWeight:aiServings===n?600:400,userSelect:"none"}}>{n}</span>
                ))}
              </div>
            </div>

            <div style={{fontSize:11,color:T.textS,marginBottom:14}}>🛡 Family dietary preferences loaded automatically</div>
            <button className="btn-primary" onClick={generateRecipe}
              disabled={!aiText.trim()}
              style={{width:"100%",opacity:aiText.trim()?1:0.5}}>✨ Generate recipe</button>
          </div>
        )}

        {/* ── STAGE 2: REVIEW ── */}
        {aiStep==="review" && aiGenerated && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <button onClick={()=>setAiStep("input")} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,padding:0,lineHeight:1}}>←</button>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>Create with AI</div>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:T.sageS,color:T.sage,fontWeight:600,marginLeft:"auto"}}>AI</span>
            </div>

            {/* Dietary safety strip — always shown */}
            <div style={{
              display:"flex",alignItems:"center",gap:8,padding:"9px 12px",marginBottom:14,borderRadius:9,fontSize:12.5,fontWeight:500,
              background:aiGenerated.dietaryOk?T.sageS:T.warmS,
              border:`1px solid ${aiGenerated.dietaryOk?T.sage+"44":T.warm+"44"}`,
              color:aiGenerated.dietaryOk?T.sage:T.warm,
            }}>
              <span>{aiGenerated.dietaryOk?"✓":"⚠"}</span>
              <span>{aiGenerated.dietaryMsg}</span>
            </div>

            {/* Editable recipe name */}
            <div style={{position:"relative",marginBottom:12}}>
              <input value={aiConfirmName} onChange={e=>setAiConfirmName(e.target.value)}
                style={{width:"100%",background:"transparent",border:"none",borderBottom:`2px solid ${T.warm}`,color:T.text,fontSize:17,fontWeight:600,padding:"0 24px 6px 0",outline:"none",fontFamily:"'Playfair Display',serif",boxSizing:"border-box"}}/>
              <span style={{position:"absolute",right:0,top:4,fontSize:12,color:T.warm,pointerEvents:"none"}}>✏</span>
            </div>

            {/* Meta pills */}
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
              {aiConfirmMeals.map(m=>{ const col=MEAL_COLORS[m]; return <span key={m} style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:col.bg,color:col.c,fontWeight:600}}>{m}</span>; })}
              <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:T.card2,color:T.textS}}>Serves {aiConfirmServes}</span>
              <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:T.amberS,color:T.amber}}>~{aiGenerated.cookTime} min · AI est.</span>
              <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:T.amberS,color:T.amber}}>{aiGenerated.calorieMin}–{aiGenerated.calorieMax} kcal · AI est.</span>
            </div>

            <div style={{height:1,background:T.border,marginBottom:12}}/>

            {/* Ingredients */}
            <div style={{fontSize:11,fontWeight:600,color:T.textS,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Ingredients</div>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
              {aiGenerated.ingredients.map((ing,i)=>(
                <div key={i} style={{display:"flex",alignItems:"baseline",gap:8,fontSize:13,color:T.text}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:T.warm,flexShrink:0,marginTop:6,display:"inline-block"}}/>
                  <span>{ing}</span>
                </div>
              ))}
            </div>

            <div style={{height:1,background:T.border,marginBottom:12}}/>

            {/* Method */}
            <div style={{fontSize:11,fontWeight:600,color:T.textS,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Method</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
              {aiGenerated.method.map((step,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:13,color:T.text,lineHeight:1.5}}>
                  <span style={{width:20,height:20,borderRadius:"50%",background:T.warmS,color:T.warm,fontSize:11,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{display:"flex",gap:8,borderTop:`1px solid ${T.border}`,paddingTop:14}}>
              <button className="btn-sm" style={{flex:1}} onClick={()=>setAiStep("input")}>↺ Regenerate</button>
              <button className="btn-primary" style={{flex:2}} onClick={()=>setAiStep("confirm")}>Save to library →</button>
            </div>
          </div>
        )}

        {/* ── STAGE 3: CONFIRM ── */}
        {aiStep==="confirm" && aiGenerated && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <button onClick={()=>setAiStep("review")} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,padding:0,lineHeight:1}}>←</button>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>Save to library</div>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:T.sageS,color:T.sage,fontWeight:600,marginLeft:"auto"}}>AI</span>
            </div>

            {/* Recipe preview */}
            <div style={{background:T.card2,borderRadius:9,padding:"10px 14px",marginBottom:18,border:`1px solid ${T.border}`}}>
              <div style={{fontSize:11,color:T.textS,marginBottom:2}}>Recipe</div>
              <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:3}}>{aiConfirmName}</div>
              <div style={{fontSize:12}}>
                <span style={{color:T.amber}}>{aiGenerated.calorieMin}–{aiGenerated.calorieMax} kcal · AI est.</span>
                <span style={{color:T.textM}}> · </span>
                <span style={{color:T.amber}}>~{aiGenerated.cookTime} min · AI est.</span>
              </div>
            </div>

            {/* Name */}
            <div style={{marginBottom:16}}>
              <label style={labelStyle}>Name</label>
              <input value={aiConfirmName} onChange={e=>setAiConfirmName(e.target.value)} style={fieldStyle}/>
            </div>

            {/* Meal type — multi-select */}
            <div style={{marginBottom:16}}>
              <label style={labelStyle}>Meal type</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["Breakfast","Lunch","Dinner","Snack"].map(m=>{
                  const col=MEAL_COLORS[m];
                  const sel=aiConfirmMeals.includes(m);
                  return <span key={m} onClick={()=>setAiConfirmMeals(s=>sel?s.filter(x=>x!==m):[...s,m])}
                    style={{fontSize:12,padding:"5px 11px",borderRadius:20,border:`1px solid ${sel?col.c:T.border}`,background:sel?col.bg:"transparent",color:sel?col.c:T.textS,cursor:"pointer",userSelect:"none"}}>{m}</span>;
                })}
              </div>
            </div>

            {/* Cuisine */}
            <div style={{marginBottom:16}}>
              <label style={labelStyle}>Cuisine</label>
              <select value={aiConfirmCuisine} onChange={e=>setAiConfirmCuisine(e.target.value)} style={fieldStyle}>
                <option value="">Select cuisine…</option>
                {["British","Italian","Indian","Chinese","Mexican","American","Mediterranean","Other"].map(c=>(
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Serves */}
            <div style={{marginBottom:20}}>
              <label style={labelStyle}>Serves</label>
              <div style={{display:"flex",gap:6}}>
                {[1,2,3,4,5,6].map(n=>(
                  <span key={n} onClick={()=>setAiConfirmServes(n)}
                    style={{width:28,height:28,borderRadius:"50%",border:`1px solid ${aiConfirmServes===n?T.warm:T.border}`,background:aiConfirmServes===n?T.warmS:"transparent",color:aiConfirmServes===n?T.warm:T.textS,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,cursor:"pointer",fontWeight:aiConfirmServes===n?600:400,userSelect:"none"}}>{n}</span>
                ))}
              </div>
            </div>

            <div style={{height:1,background:T.border,marginBottom:16}}/>

            <button className="btn-primary" style={{width:"100%",opacity:(!aiConfirmName.trim()||aiConfirmMeals.length===0||!aiConfirmCuisine)?0.5:1}}
              onClick={saveAiRecipe} disabled={!aiConfirmName.trim()||aiConfirmMeals.length===0||!aiConfirmCuisine}>
              🔖 Save recipe
            </button>
          </div>
        )}

      </div>
    ) : (
      /* ── Library list view ── */
      <div>
        {/* Search */}
        <div style={{position:"relative",marginBottom:10}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:12,color:T.textS,pointerEvents:"none"}}>🔍</span>
          <input value={libSearch} onChange={e=>setLibSearch(e.target.value)} placeholder="Search recipes…"
            style={{width:"100%",padding:"8px 14px 8px 34px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        </div>
        {/* Source filter pills */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,marginBottom:6,scrollbarWidth:"none"}}>
          {[["all","All"],["mine","My recipes"],["ai","AI-made"]].map(([v,l])=>(
            <FilterPill key={v} label={l} active={srcFilter===v} onClick={()=>setSrcFilter(v)}/>
          ))}
        </div>
        {/* Meal filter pills */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:4,scrollbarWidth:"none"}}>
          {[["all","All meals"],["Breakfast","Breakfast"],["Lunch","Lunch"],["Dinner","Dinner"],["Snack","Snack"]].map(([v,l])=>(
            <FilterPill key={v} label={l} active={mealFilter===v} onClick={()=>setMealFilter(v)}/>
          ))}
        </div>
        {/* Recipe list card */}
        <div className="card" style={{padding:0,overflow:"hidden",marginBottom:0}}>
          {/* List header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px 8px",borderBottom:`1px solid ${T.border}`}}>
            <div style={{fontSize:12,fontWeight:600,color:T.text}}>Recipes</div>
            <div style={{fontSize:11,color:T.textM}}>{libFiltered.length} {libFiltered.length!==1?"recipes":"recipe"}</div>
          </div>
          {/* Rows */}
          <div style={{display:"flex",flexDirection:"column"}}>
            {libFiltered.map(r=>(
              <div key={r.id} onClick={()=>openRecipe(r)}
                style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}>
                <DietDot diet={r.diet}/>
                <span style={{fontSize:13,fontWeight:600,color:T.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",minWidth:0}}>{r.name}</span>
                <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:"55%"}}>
                  {r.meals.map(m=><MealBadge key={m} meal={m}/>)}
                  <InfoTag>{r.cuisine}</InfoTag>
                  {r.tags.slice(0,1).map(t=><WarmTag key={t}>{t}</WarmTag>)}
                  <SrcBadge src={r.src}/>
                </div>
                <span onClick={e=>{e.stopPropagation();setLibSaved(s=>s.includes(r.id)?s.filter(x=>x!==r.id):[...s,r.id]);}}
                  style={{fontSize:15,cursor:"pointer",color:libSaved.includes(r.id)?T.amber:T.textM,flexShrink:0,userSelect:"none"}}>★</span>
              </div>
            ))}
            {libFiltered.length===0 && <div style={{fontSize:13,color:T.textS,textAlign:"center",padding:"28px 0"}}>No recipes match your filters</div>}
          </div>
        </div>
        {/* Actions */}
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button className="btn-sm" onClick={()=>setAddRecipeOpen(true)} style={{flex:1}}>+ Add recipe</button>
          <button className="btn-sm" onClick={openAiFlow} style={{flex:1}}>✨ Create with AI</button>
        </div>
        {/* AI nudge */}
        <div style={{marginTop:12,padding:"10px 12px",borderRadius:9,background:T.tealS,border:`1px solid ${T.teal}33`,fontSize:12.5,color:T.textS,lineHeight:1.6}}>
          <strong style={{color:T.teal}}>🤖 MyPal AI:</strong> You haven't used your Beef Stew recipe in 6 weeks — add it to this week's plan?
        </div>
      </div>
    ),
    "Meal Planner": aiPlanView ? (
      /* ── AI Plan Flow (3 stages) ── */
      <div>
        <button onClick={()=>{setAiPlanView(false);setAiPlanStep("input");}}
          style={{background:"none",border:"none",cursor:"pointer",color:T.textS,fontSize:13,fontFamily:"inherit",display:"flex",alignItems:"center",gap:4,padding:"0 0 14px 0"}}>
          ← Back to planner
        </button>
        {/* Step indicator */}
        <div style={{display:"flex",alignItems:"center",marginBottom:20}}>
          {["Preferences","AI plan","Confirm"].map((label,i)=>{
            const stepIdx=aiPlanStep==="input"?0:aiPlanStep==="loading"?1:aiPlanStep==="review"?1:2;
            const isDone=i<stepIdx; const isAct=i===stepIdx;
            return (
              <React.Fragment key={i}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:isDone?T.sageS:isAct?T.warm:T.card2,color:isDone?T.sage:isAct?"#000":T.textM,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600}}>
                    {isDone?"✓":i+1}
                  </div>
                  <span style={{fontSize:12,fontWeight:isAct?600:400,color:isDone?T.sage:isAct?T.warm:T.textM}}>{label}</span>
                </div>
                {i<2&&<div style={{flex:1,height:1,background:T.border,margin:"0 8px"}}/>}
              </React.Fragment>
            );
          })}
        </div>
        {/* Stage 1: Input */}
        {aiPlanStep==="input" && (
          <div className="card">
            <div style={{marginBottom:16}}>
              <div style={labelStyle}>Week to plan</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[["26 May – 1 Jun",0],["2 Jun – 8 Jun",1]].map(([lbl,w])=>(
                  <span key={w} onClick={()=>setAiPlanWeekSel(w)}
                    style={{fontSize:12,padding:"5px 12px",borderRadius:20,border:`1px solid ${aiPlanWeekSel===w?T.warm:T.border}`,background:aiPlanWeekSel===w?T.warmS:"transparent",color:aiPlanWeekSel===w?T.warm:T.textS,cursor:"pointer",userSelect:"none"}}>{lbl}</span>
                ))}
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={labelStyle}>Weekly grocery budget</div>
              <div style={{display:"flex",alignItems:"center",gap:6,maxWidth:130}}>
                <span style={{fontSize:14,color:T.textS,flexShrink:0}}>£</span>
                <input type="number" min="0" value={aiPlanBudget} onChange={e=>setAiPlanBudget(e.target.value)} style={{...fieldStyle,maxWidth:100}}/>
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={labelStyle}>Meals to include</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["Breakfast","Lunch","Snack","Dinner"].map(m=>(
                  <span key={m} onClick={()=>setAiPlanMeals(p=>({...p,[m]:!p[m]}))}
                    style={{fontSize:12,padding:"5px 12px",borderRadius:20,border:`1px solid ${aiPlanMeals[m]?T.warm:T.border}`,background:aiPlanMeals[m]?T.warmS:"transparent",color:aiPlanMeals[m]?T.warm:T.textS,cursor:"pointer",fontWeight:aiPlanMeals[m]?600:400,userSelect:"none"}}>{m}</span>
                ))}
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={labelStyle}>Preferences</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                {["Quick weekday meals","One vegetarian day","No repeats from last week","Family-friendly","Budget-friendly","Batch cook friendly","Light lunches","No fish"].map(chip=>(
                  <span key={chip}
                    onClick={()=>setAiPlanPrefs(p=>{const t=p.trim();return t?t+", "+chip:chip;})}
                    style={{fontSize:11.5,padding:"4px 10px",borderRadius:20,border:`1px solid ${T.border}`,background:T.card2,color:T.textM,cursor:"pointer",userSelect:"none",whiteSpace:"nowrap"}}>
                    {chip}
                  </span>
                ))}
              </div>
              <textarea value={aiPlanPrefs} onChange={e=>setAiPlanPrefs(e.target.value)}
                placeholder="Add any other preferences…"
                rows={3} style={{...fieldStyle,resize:"vertical"}}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:T.text}}>
                <input type="checkbox" checked={aiPlanUseLib} onChange={e=>setAiPlanUseLib(e.target.checked)}
                  style={{width:15,height:15,accentColor:T.warm,cursor:"pointer"}}/>
                Prioritise recipes from my library where possible
              </label>
            </div>
            <div style={{padding:"10px 12px",borderRadius:9,background:T.card2,border:`1px solid ${T.border}`,fontSize:12.5,color:T.textS,lineHeight:1.6,marginBottom:16}}>
              🧑‍🤝‍🧑 Planning for <strong style={{color:T.text}}>6 members</strong> · Mia is vegetarian · James & Alex no shellfish · Lily no nuts
            </div>
            <button className="btn-primary" style={{width:"100%",opacity:Object.values(aiPlanMeals).some(Boolean)?1:0.45}}
              disabled={!Object.values(aiPlanMeals).some(Boolean)}
              onClick={()=>{setAiPlanStep("loading");setTimeout(()=>setAiPlanStep("review"),1800);}}>
              ✨ Generate meal plan
            </button>
          </div>
        )}
        {/* Stage 1.5: Loading */}
        {aiPlanStep==="loading" && (
          <div className="card" style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontSize:24,marginBottom:16}}>✨</div>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:8}}>Planning your week…</div>
            <div style={{fontSize:12.5,color:T.textS,lineHeight:1.6}}>Checking your library · Balancing nutrition · Avoiding conflicts</div>
          </div>
        )}
        {/* Stage 2: Review */}
        {aiPlanStep==="review" && (()=>{
          const planData=aiPlanResult||AI_PLAN_RESULT;
          if(!aiPlanResult) setTimeout(()=>setAiPlanResult(AI_PLAN_RESULT),0);
          const CONFLICT_KEYS=new Set(["Dinner-Mon","Dinner-Wed","Dinner-Sat","Dinner-Sun","Breakfast-Sun"]);
          const cS=t=>({background:t==="lib"?T.skyS:t==="ai"?T.roseS:T.warmS,color:t==="lib"?T.sky:t==="ai"?T.rose:T.warm,border:`1px solid ${t==="lib"?T.sky+"44":t==="ai"?T.rose+"44":T.warm+"44"}`});
          const lc=Object.values(planData).filter(c=>c.t==="lib").length;
          const ac=Object.values(planData).filter(c=>c.t==="ai").length;
          return (
            <div>
              <div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 12px",borderRadius:9,background:T.amberS,border:`1px solid ${T.amber}44`,fontSize:12.5,fontWeight:500,color:T.amber,lineHeight:1.5,marginBottom:12}}>
                <span style={{flexShrink:0}}>⚠</span>
                <span>5 meals contain meat or fish — not suitable for Mia (vegetarian). Tap any cell to swap.</span>
              </div>
              <div className="card" style={{padding:14,marginBottom:10}}>
                <div style={{overflowX:"auto"}}>
                  <div style={{display:"grid",gridTemplateColumns:"58px repeat(7,1fr)",gap:4,fontSize:11,minWidth:520}}>
                    <div/>
                    {DAYS.map(d=><div key={d} style={{fontWeight:700,color:T.warm,textAlign:"center",padding:"4px 2px"}}>{d}</div>)}
                    {MEALS.map(meal=>(
                      <React.Fragment key={meal}>
                        <div style={{color:T.textS,fontSize:10.5,alignSelf:"center",paddingRight:4,fontWeight:600}}>{meal}</div>
                        {DAYS.map(day=>{
                          const key=`${meal}-${day}`;
                          const cell=planData[key]||{v:"—",t:"qck"};
                          const isConflict=CONFLICT_KEYS.has(key);
                          return (
                            <div key={day} onClick={()=>setAiPlanPickerCell({meal,day})}
                              style={{...cS(cell.t),borderRadius:6,padding:"5px 4px",textAlign:"center",fontSize:10,cursor:"pointer",lineHeight:1.3,minHeight:32,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",fontWeight:500}}>
                              {cell.v}
                              {isConflict&&<span style={{position:"absolute",top:2,right:2,width:5,height:5,borderRadius:"50%",background:T.amber}}/>}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12,marginTop:10,flexWrap:"wrap"}}>
                  {[["lib",T.sky,T.skyS,"Library"],["ai",T.rose,T.roseS,"AI-suggested"],["qck",T.warm,T.warmS,"Quick option"]].map(([t,c,bg,lbl])=>(
                    <div key={t} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:T.textS}}>
                      <div style={{width:10,height:10,borderRadius:3,background:bg,border:`1px solid ${c}44`}}/>{lbl}
                    </div>
                  ))}
                  <div style={{fontSize:11,color:T.textM,marginLeft:"auto"}}>Tap cell to swap</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
                {[["1,780","avg kcal/day","target 2,000",T.text],["£82","est. cost",`budget £${aiPlanBudget}`,T.sage],[`${lc}`,"library recipes",`${ac} new AI meals`,T.text],["28/28","meals planned","fully planned",T.text]].map(([v,l,s,c],i)=>(
                  <div key={i} className="card" style={{textAlign:"center",padding:"10px 8px"}}>
                    <div style={{fontSize:15,fontWeight:700,color:c}}>{v}</div>
                    <div style={{fontSize:10,color:T.textS}}>{l}</div>
                    <div style={{fontSize:10,color:T.textM}}>{s}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn-sm" style={{flex:1}} onClick={()=>{setAiPlanStep("loading");setTimeout(()=>{setAiPlanResult(AI_PLAN_RESULT);setAiPlanStep("review");},1800);}}>↺ Regenerate</button>
                <button className="btn-primary" style={{flex:2}} onClick={()=>setAiPlanStep("confirm")}>Confirm plan →</button>
              </div>
            </div>
          );
        })()}
        {/* Stage 3: Confirm */}
        {aiPlanStep==="confirm" && (
          <div>
            <div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 12px",borderRadius:9,background:T.sageS,border:`1px solid ${T.sage}44`,fontSize:12.5,fontWeight:500,color:T.sage,lineHeight:1.5,marginBottom:12}}>
              <span>✓</span>
              <span>Your 28-meal plan is ready — {aiPlanResult?Object.values(aiPlanResult).filter(c=>c.t==="lib").length:13} library recipes, {aiPlanResult?Object.values(aiPlanResult).filter(c=>c.t==="ai").length:8} new AI meals, budget on track at £82 / £{aiPlanBudget}.</span>
            </div>
            <div className="card">
              <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:14}}>What would you like to do next?</div>
              {[[aiPlanGrocery,setAiPlanGrocery,"Auto-generate grocery list","Ingredients from all recipes consolidated and grouped by category, ready to shop."],[aiPlanBriefing,setAiPlanBriefing,"Show in Today's Briefing","Each morning's briefing will show today's planned meals so the family knows what's for dinner."]].map(([val,setter,title,sub],i)=>(
                <label key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}>
                  <input type="checkbox" checked={val} onChange={e=>setter(e.target.checked)}
                    style={{width:15,height:15,accentColor:T.warm,cursor:"pointer",marginTop:2,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:T.text}}>{title}</div>
                    <div style={{fontSize:12,color:T.textS,lineHeight:1.5,marginTop:2}}>{sub}</div>
                  </div>
                </label>
              ))}
              <div style={{padding:"10px 12px",borderRadius:9,background:T.card2,border:`1px solid ${T.border}`,fontSize:12,color:T.textS,lineHeight:1.5,margin:"12px 0"}}>
                ✨ 8 AI-suggested meals will be saved to your library with an <strong style={{color:T.text}}>AI-made</strong> badge.
              </div>
              <button className="btn-primary" style={{width:"100%"}}
                onClick={()=>{if(aiPlanResult)setWeekPlans(p=>({...p,[aiPlanWeekSel]:aiPlanResult}));setWeekIdx(aiPlanWeekSel);setAiPlanView(false);setAiPlanStep("input");setAiPlanResult(null);}}>
                ✓ Apply plan
              </button>
            </div>
          </div>
        )}
      </div>
    ) : (
      /* ── Main Planner ── */
      <div>
        {/* Week nav header */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
            <button onClick={()=>setWeekIdx(0)} disabled={weekIdx===0}
              style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.textS,cursor:weekIdx===0?"default":"pointer",padding:"5px 10px",fontSize:13,fontFamily:"inherit",opacity:weekIdx===0?0.35:1}}>←</button>
            <div style={{fontSize:13,fontWeight:600,color:T.text,minWidth:160,textAlign:"center"}}>
              {WEEK_LABELS[weekIdx]}
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,fontWeight:700,marginLeft:6,background:weekIdx===0?T.warmS:T.skyS,color:weekIdx===0?T.warm:T.sky}}>
                {weekIdx===0?"This week":"Next week"}
              </span>
            </div>
            <button onClick={()=>setWeekIdx(1)} disabled={weekIdx===1}
              style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.textS,cursor:weekIdx===1?"default":"pointer",padding:"5px 10px",fontSize:13,fontFamily:"inherit",opacity:weekIdx===1?0.35:1}}>→</button>
          </div>
          <div style={{position:"relative"}}>
            <button onClick={()=>setPlanMenuOpen(p=>!p)}
              style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.textS,cursor:"pointer",padding:"5px 10px",fontSize:16,fontFamily:"inherit"}}>⋯</button>
            {planMenuOpen && (
              <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:10,minWidth:210,overflow:"hidden",zIndex:100,boxShadow:"0 16px 48px rgba(0,0,0,0.4)"}}>
                {[["📋 Save this week as template",()=>{setTemplateNameInput("");setSaveTemplateOpen(true);setPlanMenuOpen(false);}],["📂 Load a template",()=>{setLoadTemplateOpen(true);setPlanMenuOpen(false);}],["⬆ Copy from last week",()=>{const src=weekIdx===0?1:0;setWeekPlans(p=>({...p,[weekIdx]:JSON.parse(JSON.stringify(p[src]))}));setPlanMenuOpen(false);}]].map(([label,action],i)=>(
                  <div key={i} onClick={action}
                    style={{padding:"10px 14px",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8,color:T.text,borderTop:i>0?`1px solid ${T.border}`:"none"}}>
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Grid */}
        <div className="card" style={{padding:14,marginBottom:10}}>
          <div style={{overflowX:"auto"}}>
            {(()=>{
              const curPlan=weekPlans[weekIdx];
              const cBg=t=>t==="lib"?T.skyS:t==="ai"?T.roseS:t==="qck"?T.warmS:T.card2;
              const cBd=t=>t==="lib"?T.sky+"44":t==="ai"?T.rose+"44":t==="qck"?T.warm+"44":T.border;
              const cCl=t=>t==="lib"?T.sky:t==="ai"?T.rose:t==="qck"?T.warm:T.textM;
              return (
                <div style={{display:"grid",gridTemplateColumns:"58px repeat(7,1fr)",gap:4,fontSize:11,minWidth:520}}>
                  <div/>
                  {DAYS.map(d=><div key={d} style={{fontWeight:700,color:T.warm,textAlign:"center",padding:"4px 2px"}}>{d}</div>)}
                  {MEALS.map(meal=>(
                    <React.Fragment key={meal}>
                      <div style={{color:T.textS,fontSize:10.5,alignSelf:"center",paddingRight:4,fontWeight:600}}>{meal}</div>
                      {DAYS.map(day=>{
                        const key=`${meal}-${day}`;
                        const cell=curPlan[key]||{v:"",t:""};
                        return (
                          <div key={day} onClick={()=>setMealPickerCell({meal,day})}
                            style={{background:cBg(cell.t),borderRadius:6,padding:"5px 4px",textAlign:"center",fontSize:10,color:cCl(cell.t),cursor:"pointer",lineHeight:1.3,minHeight:32,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${cBd(cell.t)}`,fontWeight:cell.v?500:400}}>
                            {cell.v||"+"}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              );
            })()}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginTop:10,flexWrap:"wrap"}}>
            {[["lib",T.sky,T.skyS,"Library recipe"],["ai",T.rose,T.roseS,"AI-suggested"],["qck",T.warm,T.warmS,"Quick option"]].map(([t,c,bg,lbl])=>(
              <div key={t} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:T.textS}}>
                <div style={{width:10,height:10,borderRadius:3,background:bg,border:`1px solid ${c}44`}}/>{lbl}
              </div>
            ))}
          </div>
        </div>
        {/* Actions */}
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <button onClick={()=>{setAiPlanView(true);setAiPlanStep("input");setAiPlanWeekSel(weekIdx);}}
            style={{flex:1,padding:"9px 0",borderRadius:9,border:`1px solid ${T.border}`,background:"none",color:T.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            ✨ Plan with AI
          </button>
          <button onClick={()=>{ setTab("Grocery List"); grocNeeded.length>0 ? setGrocGenModal(true) : startNewList(); }}
            style={{flex:1,padding:"9px 0",borderRadius:9,border:`1px solid ${T.border}`,background:"none",color:T.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            🛒 Generate grocery list
          </button>
        </div>
        {/* Stats */}
        {(()=>{
          const plan=weekPlans[weekIdx];
          const vals=Object.values(plan);
          const planned=vals.filter(c=>c&&c.v).length;
          const lc=vals.filter(c=>c&&c.t==="lib").length;
          const kcal=weekIdx===0?1847:1792;
          const cost=weekIdx===0?68:72;
          return (
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {[[`${kcal.toLocaleString()}`,"avg kcal/day","target 2,000",T.text],[`£${cost}`,"est. grocery cost","budget £90",cost>90?T.rose:cost>75?T.amber:T.sage],[`${planned}/28`,"meals planned",`${28-planned} remaining`,T.text],[`${lc}`,"library recipes","in this week",T.text]].map(([v,l,s,c],i)=>(
                <div key={i} className="card" style={{textAlign:"center",padding:"10px 8px"}}>
                  <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div>
                  <div style={{fontSize:10,color:T.textS}}>{l}</div>
                  <div style={{fontSize:10,color:T.textM}}>{s}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    ),
    "Grocery List": (
      <div>

        {/* ── Tab bar: Active list / Past lists ── */}
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[["active","🛒 Active list"],["history","🕐 Past lists"]].map(([v,l])=>(
            <button key={v} onClick={()=>setGrocListView(v)}
              style={{padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:grocListView===v?600:400,border:`1px solid ${grocListView===v?T.warm:T.border}`,background:grocListView===v?T.warmS:"none",color:grocListView===v?T.warm:T.textS,cursor:"pointer",fontFamily:"inherit"}}>
              {l}
            </button>
          ))}
        </div>

        {/* ══ ACTIVE LIST VIEW ══ */}
        {grocListView==="active" && (
          <div>
            {grocCompleted ? (
              /* ── Completion state ── */
              <div className="card" style={{textAlign:"center",padding:"32px 20px"}}>
                <div style={{fontSize:36,marginBottom:10}}>🎉</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:6}}>Shopping done!</div>
                <div style={{fontSize:13,color:T.textS,marginBottom:20}}>All {grocGot.length} items collected · Est. £{grocEstSpend}.00 spent</div>
                <button onClick={startNewList} className="btn-primary" style={{maxWidth:220,margin:"0 auto"}}>+ Start new list</button>
              </div>
            ) : (
              <div>
                {/* ── Summary bar ── */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
                  {[[grocActive.length,"total",T.text],[grocNeeded.length,"needed",T.amber],[grocGot.length,"got it",T.sage],[`£${grocEstSpend}`,"est. spend",T.teal]].map(([v,l,c],i)=>(
                    <div key={i} className="card" style={{textAlign:"center",padding:"9px 4px"}}>
                      <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div>
                      <div style={{fontSize:10,color:T.textS,marginTop:1}}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* ── Filter chips + share ── */}
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                  {[["all","All"],["needed","Needed"],["got","Got it"]].map(([v,l])=>(
                    <span key={v} onClick={()=>setGrocFilter(v)}
                      style={{padding:"4px 11px",borderRadius:20,fontSize:11,border:`1px solid ${grocFilter===v?T.warm:T.border}`,background:grocFilter===v?T.warmS:"transparent",color:grocFilter===v?T.warm:T.textS,cursor:"pointer",fontWeight:grocFilter===v?600:400,userSelect:"none"}}>
                      {l}
                    </span>
                  ))}
                  <button onClick={()=>setGrocShareModal(true)}
                    style={{marginLeft:"auto",padding:"4px 11px",borderRadius:20,fontSize:11,border:`1px solid ${T.border}`,background:"none",color:T.textS,cursor:"pointer",fontFamily:"inherit"}}>
                    ↑ Share
                  </button>
                </div>

                {/* ── Category groups ── */}
                {grocByCategory.map(({cat,all,needed,got})=>(
                  <div key={cat}>
                    <div onClick={()=>setGrocCollapsed(p=>({...p,[cat]:!p[cat]}))} style={grocCatHeaderStyle}>
                      <span style={{fontSize:11,fontWeight:600,color:T.textS,letterSpacing:".05em",textTransform:"uppercase"}}>{cat}</span>
                      <span style={{fontSize:10,color:T.textM,display:"flex",alignItems:"center",gap:6}}>
                        {got.length}/{all.length} {grocCollapsed[cat]?"▶":"▼"}
                      </span>
                    </div>
                    {!grocCollapsed[cat] && all.map(g=>(
                      <div key={g.id} onClick={()=>openGrocEdit(g)}
                        style={{...grocItemRowStyle, opacity:g.removed?0.55:1}}>
                        <div onClick={e=>{e.stopPropagation();toggleGrocDone(g.id);}} style={grocCbStyle(g.done,g.removed)}>
                          {g.done?"✓":g.removed?"–":""}
                        </div>
                        <span style={{flex:1,fontSize:13,color:g.done||g.removed?T.textS:T.text,textDecoration:g.done||g.removed?"line-through":"none",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                          {g.name}
                          {(g.qty||g.unit)?<span style={{color:T.textS,fontSize:11}}> · {g.qty}{g.unit?" "+g.unit:""}</span>:null}
                          {g.sources.length>0 && <span style={{color:T.textM,fontSize:10}}> · {g.sources.join(", ")}</span>}
                        </span>
                        {g.done || g.removed ? (
                          <button onClick={e=>{e.stopPropagation(); g.done?toggleGrocDone(g.id):removeGrocItem(g.id);}} style={grocUndoBtn}>Undo</button>
                        ) : (
                          <>
                            <button onClick={e=>{e.stopPropagation();toggleGrocPantry(g.id);}} style={grocPantryBtn} title="Move to pantry">🧺</button>
                            <button onClick={e=>{e.stopPropagation();removeGrocItem(g.id);}} style={grocRemoveBtn}>Remove</button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {/* ── Pantry (collapsed by default) ── */}
                {pantryItems.length>0 && (
                  <div>
                    <div onClick={()=>setGrocCollapsed(p=>({...p,__pantry:!p.__pantry}))} style={{...grocCatHeaderStyle,marginTop:4}}>
                      <span style={{fontSize:11,fontWeight:600,color:T.teal,letterSpacing:".05em",textTransform:"uppercase"}}>🧺 Already in pantry</span>
                      <span style={{fontSize:10,color:T.textM,display:"flex",alignItems:"center",gap:6}}>{pantryItems.length} items {grocCollapsed.__pantry?"▶":"▼"}</span>
                    </div>
                    {!grocCollapsed.__pantry && pantryItems.map(g=>(
                      <div key={g.id} style={{...grocItemRowStyle,opacity:0.6}}>
                        <div style={{...grocCbStyle(true,false),background:T.tealS,border:`1.5px solid ${T.teal}`,color:T.teal}}>✓</div>
                        <span style={{flex:1,fontSize:13,color:T.textS}}>{g.name}{g.qty?<span style={{fontSize:11}}> · {g.qty}{g.unit?" "+g.unit:""}</span>:null}</span>
                        <button onClick={()=>toggleGrocPantry(g.id)} style={{...grocRemoveBtn,color:T.teal}}>Need it</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Add item + Mark done ── */}
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button onClick={()=>setGrocAddModal(true)} className="btn-sm" style={{flex:1}}>+ Add item</button>
                  {allResolved && <button onClick={completeList} className="btn-sm btn-warm" style={{flex:1}}>✓ Mark as done</button>}
                </div>

                {/* ── Shop online placeholder ── */}
                <div className="card" style={{marginTop:14,opacity:0.6,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:10,right:12,fontSize:9.5,fontWeight:700,padding:"2px 8px",borderRadius:8,background:T.amberS,color:T.amber,letterSpacing:".04em"}}>✦ Phase 2</div>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>🛍️ Shop online</div>
                  <div style={{fontSize:12,color:T.textS,lineHeight:1.6,marginBottom:10}}>Connect to Tesco, Sainsbury's or Asda to match your list to real products and send your basket straight to checkout.</div>
                  <button className="btn-sm" style={{opacity:0.5,cursor:"not-allowed"}} disabled>Coming soon</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ PAST LISTS VIEW ══ */}
        {grocListView==="history" && (
          <div>
            {grocPastLists.length===0 ? (
              <div className="card" style={{textAlign:"center",padding:28,color:T.textS,fontSize:13}}>No past lists yet.</div>
            ) : grocPastLists.map(pl=>(
              <div key={pl.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:11,marginBottom:10,overflow:"hidden"}}>
                {/* Header row — click to expand */}
                <div onClick={()=>setGrocPastExpanded(p=>({...p,[pl.id]:!p[pl.id]}))}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:T.text}}>w/c {pl.week}</div>
                    <div style={{fontSize:11,color:T.textS,marginTop:1}}>{pl.items} items · {pl.spend}</div>
                  </div>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,fontWeight:600,background:pl.status==="completed"?T.sageS:T.card2,color:pl.status==="completed"?T.sage:T.textM}}>
                    {pl.status==="completed"?"Completed":"Abandoned"}
                  </span>
                  <span style={{fontSize:10,color:T.textM}}>{grocPastExpanded[pl.id]?"▼":"▶"}</span>
                </div>
                {/* Expanded rows — read only */}
                {grocPastExpanded[pl.id] && (
                  <div style={{borderTop:`1px solid ${T.border}`,padding:"8px 14px 12px"}}>
                    {pl.status==="abandoned" ? (
                      <div style={{fontSize:12,color:T.textS,fontStyle:"italic"}}>List replaced before completion.</div>
                    ) : pl.rows.map((r,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:i<pl.rows.length-1?`1px solid ${T.border}22`:"none"}}>
                        <div style={{width:14,height:14,borderRadius:3,background:r.done?T.sage:T.roseS,border:`1px solid ${r.done?T.sage:T.rose}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#fff",flexShrink:0}}>
                          {r.done?"✓":"–"}
                        </div>
                        <span style={{flex:1,fontSize:12,color:T.textS}}>{r.name}</span>
                        <span style={{fontSize:11,color:T.textM}}>{r.qty}</span>
                        {r.removed && <span style={{fontSize:10,padding:"1px 6px",borderRadius:6,background:T.roseS,color:T.rose}}>removed</span>}
                      </div>
                    ))}
                    {pl.rows.length>0 && pl.status!=="abandoned" && (
                      <div style={{fontSize:11,color:T.textM,marginTop:6}}>+{pl.items-pl.rows.length} more items</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Generate modal (replace vs merge) ── */}
        {grocGenModal && (
          <div onClick={()=>setGrocGenModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:14,padding:24,width:"100%",maxWidth:340,boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,marginBottom:8}}>You have an open list</div>
              <div style={{fontSize:13,color:T.textS,lineHeight:1.6,marginBottom:14}}>
                You still have <strong style={{color:T.text}}>{grocNeeded.length} items needed</strong>. What would you like to do?
              </div>
              <div style={{marginBottom:14}}>
                <div className="card" style={{padding:"10px 12px",marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:2}}>Replace</div>
                  <div style={{fontSize:11.5,color:T.textS,lineHeight:1.5}}>Start fresh. Current list saved to Past lists as Abandoned.</div>
                </div>
                <div className="card" style={{padding:"10px 12px"}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:2}}>Add to it</div>
                  <div style={{fontSize:11.5,color:T.textS,lineHeight:1.5}}>New meal plan items merged in. Checked-off items stay as-is.</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setGrocGenModal(false)} className="btn-sm" style={{flex:1}}>Cancel</button>
                <button onClick={()=>{ setGrocPastLists(p=>[{id:`pl${Date.now()}`,week:"26 May–1 Jun 2026",items:grocGot.length,spend:`£${grocEstSpend}.00`,status:"abandoned",rows:[]},...p]); startNewList(); setGrocGenModal(false); }} className="btn-sm" style={{flex:1}}>Replace</button>
                <button onClick={()=>setGrocGenModal(false)} className="btn-sm btn-warm" style={{flex:1}}>Add to it</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Share modal ── */}
        {grocShareModal && (
          <div onClick={()=>setGrocShareModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:14,padding:24,width:"100%",maxWidth:320,boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,marginBottom:16}}>Share list</div>
              {[["📧","Email list","Send to your email address"],["💬","WhatsApp","Share via WhatsApp"],["🔗","Copy link","Copy a shareable link"],["🖨️","Print / PDF","Save or print as PDF"]].map(([ic,l,d])=>(
                <div key={l} onClick={()=>setGrocShareModal(false)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}>
                  <span style={{fontSize:20,width:28,textAlign:"center"}}>{ic}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:T.text}}>{l}</div>
                    <div style={{fontSize:11,color:T.textS}}>{d}</div>
                  </div>
                </div>
              ))}
              <button onClick={()=>setGrocShareModal(false)} className="btn-sm" style={{width:"100%",marginTop:14}}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── Edit item modal ── */}
        {grocEditItem && (
          <div onClick={()=>setGrocEditItem(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:14,padding:24,width:"100%",maxWidth:340,boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>Edit item</div>
                <button onClick={()=>setGrocEditItem(null)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:2}}>✕</button>
              </div>
              <div style={{marginBottom:12}}>
                <label style={grocLabelStyle}>Item name</label>
                <input value={grocEditName} onChange={e=>setGrocEditName(e.target.value)} style={grocFieldStyle}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                <div>
                  <label style={grocLabelStyle}>Quantity</label>
                  <input value={grocEditQty} onChange={e=>setGrocEditQty(e.target.value)} style={grocFieldStyle}/>
                </div>
                <div>
                  <label style={grocLabelStyle}>Unit</label>
                  <input value={grocEditUnit} onChange={e=>setGrocEditUnit(e.target.value)} placeholder="e.g. g, pints…" style={grocFieldStyle}/>
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <label style={grocLabelStyle}>Category</label>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginTop:4}}>
                  {GROC_CATS.map(cat=>(
                    <button key={cat} onClick={()=>setGrocEditCat(cat)}
                      style={{padding:"6px 4px",borderRadius:8,border:`1px solid ${grocEditCat===cat?T.warm:T.border}`,background:grocEditCat===cat?T.warmS:"none",color:grocEditCat===cat?T.warm:T.textS,fontSize:11,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setGrocEditItem(null)} className="btn-sm" style={{flex:1}}>Cancel</button>
                <button onClick={saveGrocEdit} className="btn-sm btn-warm" style={{flex:1}}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Add item modal ── */}
        {grocAddModal && (
          <div onClick={()=>setGrocAddModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:14,padding:24,width:"100%",maxWidth:340,boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>Add item</div>
                <button onClick={()=>setGrocAddModal(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:2}}>✕</button>
              </div>
              <div style={{marginBottom:12}}>
                <label style={grocLabelStyle}>Item name</label>
                <input autoFocus value={grocAddName} onChange={e=>setGrocAddName(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")addGrocItem();if(e.key==="Escape")setGrocAddModal(false);}}
                  placeholder="e.g. Butter" style={grocFieldStyle}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                <div>
                  <label style={grocLabelStyle}>Quantity</label>
                  <input value={grocAddQty} onChange={e=>setGrocAddQty(e.target.value)} placeholder="e.g. 2" style={grocFieldStyle}/>
                </div>
                <div>
                  <label style={grocLabelStyle}>Unit</label>
                  <input value={grocAddUnit} onChange={e=>setGrocAddUnit(e.target.value)} placeholder="e.g. packs" style={grocFieldStyle}/>
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <label style={grocLabelStyle}>Category</label>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginTop:4}}>
                  {GROC_CATS.map(cat=>(
                    <button key={cat} onClick={()=>setGrocAddCat(cat)}
                      style={{padding:"6px 4px",borderRadius:8,border:`1px solid ${grocAddCat===cat?T.warm:T.border}`,background:grocAddCat===cat?T.warmS:"none",color:grocAddCat===cat?T.warm:T.textS,fontSize:11,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setGrocAddModal(false)} className="btn-sm" style={{flex:1}}>Cancel</button>
                <button onClick={addGrocItem} disabled={!grocAddName.trim()} className="btn-sm btn-warm" style={{flex:1,opacity:grocAddName.trim()?1:0.4}}>Add</button>
              </div>
            </div>
          </div>
        )}

      </div>
    ),
    "Nutrition": (
      <div className="card" style={{opacity:0.7,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:10,right:12,fontSize:9.5,fontWeight:700,padding:"2px 8px",borderRadius:8,background:T.amberS,color:T.amber,letterSpacing:".04em"}}>✦ Phase 2</div>
        <div className="card-title">🥗 Nutrition Insights</div>
        <div style={{fontSize:12.5,color:T.textS,lineHeight:1.6}}>
          Per-meal and weekly nutrition tracking based on your meal plan and grocery data — coming soon.
        </div>
      </div>
    ),
  };

  return (
    <div>
      <div className="nav-tabs">{Object.keys(views).map(t=><div key={t} className={`nav-tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>{t}</div>)}</div>
      {views[tab]}

      {/* ── Fork confirmation modal ── */}
      {forkConfirm && (
        <div onClick={()=>setForkConfirm(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:14,padding:24,width:"100%",maxWidth:340,boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <DietDot diet={forkConfirm.diet}/>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700}}>{forkConfirm.name}</div>
            </div>
            <div style={{fontSize:13,color:T.textS,lineHeight:1.6,marginBottom:16}}>This is a MyPal recipe. To make changes, we'll save a copy to <strong style={{color:T.text}}>My recipes</strong> that you can edit freely.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setForkConfirm(null)} className="btn-sm" style={{flex:1}}>Cancel</button>
              <button onClick={()=>confirmFork(forkConfirm)} className="btn-sm btn-warm" style={{flex:1}}>Save a copy</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Recipe modal ── */}
      {addRecipeOpen && (
        <div onClick={()=>setAddRecipeOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:14,padding:24,width:"100%",maxWidth:460,maxHeight:"90vh",overflowY:"auto",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700}}>Add recipe</div>
              <button onClick={()=>setAddRecipeOpen(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:4}}>✕</button>
            </div>
            <div style={{marginBottom:12}}>
              <label style={labelStyle}>Recipe name</label>
              <input value={newRec.name} onChange={e=>setNewRec(p=>({...p,name:e.target.value}))} placeholder="e.g. Mum's shepherd's pie" style={fieldStyle}/>
            </div>
            <div style={{marginBottom:12}}>
              <label style={labelStyle}>Diet type</label>
              <DietSelect value={newRec.diet} onChange={v=>setNewRec(p=>({...p,diet:v}))}/>
            </div>
            <div style={{marginBottom:12}}>
              <label style={labelStyle}>Meal type</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["Breakfast","Lunch","Dinner","Snack"].map(m=>{
                  const active=newRec.meals.includes(m);
                  return <span key={m} onClick={()=>setNewRec(p=>({...p,meals:active?p.meals.filter(x=>x!==m):[...p.meals,m]}))}
                    style={{padding:"4px 11px",borderRadius:20,fontSize:12,border:`1px solid ${active?T.warm:T.border}`,background:active?T.warmS:"transparent",color:active?T.warm:T.textS,cursor:"pointer",fontWeight:active?600:400,userSelect:"none"}}>{m}</span>;
                })}
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <div style={{flex:"0 0 70px"}}>
                <label style={labelStyle}>Serves</label>
                <input type="number" min="1" value={newRec.serves} onChange={e=>setNewRec(p=>({...p,serves:Number(e.target.value)}))} style={fieldStyle}/>
              </div>
              <div style={{flex:"0 0 90px"}}>
                <label style={labelStyle}>Cook time</label>
                <input type="number" min="1" value={newRec.time} onChange={e=>setNewRec(p=>({...p,time:Number(e.target.value)}))} style={fieldStyle}/>
              </div>
              <div style={{flex:1}}>
                <label style={labelStyle}>Cuisine</label>
                <select value={newRec.cuisine} onChange={e=>setNewRec(p=>({...p,cuisine:e.target.value}))} style={{...fieldStyle,appearance:"auto"}}>
                  {["British","Italian","Indian","Chinese","Mexican","American","Mediterranean","Other"].map(c=>(
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <label style={labelStyle}>Ingredients</label>
              <textarea rows={4} value={newRec.ingredients} onChange={e=>setNewRec(p=>({...p,ingredients:e.target.value}))} placeholder="One ingredient per line…" style={{...fieldStyle,resize:"vertical"}}/>
            </div>
            <div style={{marginBottom:12}}>
              <label style={labelStyle}>Method</label>
              <textarea rows={4} value={newRec.method} onChange={e=>setNewRec(p=>({...p,method:e.target.value}))} placeholder="Describe the cooking steps…" style={{...fieldStyle,resize:"vertical"}}/>
            </div>
            <div style={{marginBottom:12}}>
              <label style={labelStyle}>Tags</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:6}}>
                {newRec.tags.map(t=>(
                  <span key={t} style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:T.warmS,color:T.warm,display:"flex",alignItems:"center",gap:4}}>
                    {t}<span onClick={()=>removeNewRecTag(t)} style={{cursor:"pointer",fontWeight:700,lineHeight:1}}>×</span>
                  </span>
                ))}
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  <input value={newRecTagInput} onChange={e=>setNewRecTagInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addNewRecTag();}}}
                    placeholder="Add tag…"
                    style={{padding:"3px 9px",borderRadius:20,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:11,outline:"none",fontFamily:"inherit",width:80}}/>
                  {newRecTagInput&&<span onClick={addNewRecTag} style={{fontSize:11,cursor:"pointer",color:T.warm,fontWeight:600}}>+ Add</span>}
                </div>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {SUGGESTED_TAGS.filter(t=>!newRec.tags.includes(t)).map(t=>(
                  <span key={t} onClick={()=>setNewRec(p=>({...p,tags:[...p.tags,t]}))}
                    style={{fontSize:10,padding:"1px 7px",borderRadius:20,border:`1px solid ${T.border}`,color:T.textS,cursor:"pointer",userSelect:"none"}}>+ {t}</span>
                ))}
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <label style={labelStyle}>Personal notes</label>
              <textarea rows={2} value={newRec.notes} onChange={e=>setNewRec(p=>({...p,notes:e.target.value}))}
                placeholder="e.g. Double the garlic, Tom loves this with extra cheese…"
                style={{...fieldStyle,resize:"vertical"}}/>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setAddRecipeOpen(false)} className="btn-sm">Cancel</button>
              <button onClick={saveNewRecipe} className="btn-sm btn-warm">Save recipe</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Recipe View / Edit Modal ── */}
      {recipeViewData && (
        <div onClick={()=>setRecipeViewData(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:14,padding:24,width:"100%",maxWidth:460,maxHeight:"88vh",overflowY:"auto",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                <DietDot diet={recipeViewData.diet}/>
                <input value={editName} onChange={e=>setEditName(e.target.value)}
                  style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:T.text,background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,outline:"none",padding:"4px 8px",flex:1,minWidth:0}}/>
              </div>
              <button onClick={()=>setRecipeViewData(null)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:4}}>✕</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:14}}>
              {recipeViewData.meals.map(m=><MealBadge key={m} meal={m}/>)}
              <InfoTag>{recipeViewData.cuisine}</InfoTag>
              <InfoTag>{recipeViewData.time}</InfoTag>
              <InfoTag>Serves {recipeViewData.serves}</InfoTag>
              <SrcBadge src={recipeViewData.src}/>
            </div>
            {/* Tags — editable */}
            <div style={{marginBottom:14}}>
              <div style={labelStyle}>Tags</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:5}}>
                {editTags.map(t=>(
                  <span key={t} style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:T.warmS,color:T.warm,display:"flex",alignItems:"center",gap:4}}>
                    {t}<span onClick={()=>setEditTags(s=>s.filter(x=>x!==t))} style={{cursor:"pointer",fontWeight:700,lineHeight:1}}>×</span>
                  </span>
                ))}
                {showTagInput ? (
                  <div style={{display:"flex",gap:5,alignItems:"center"}}>
                    <input autoFocus value={newTagInput} onChange={e=>setNewTagInput(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"&&newTagInput.trim()){setEditTags(s=>[...s,newTagInput.trim()]);setNewTagInput("");setShowTagInput(false);}if(e.key==="Escape"){setNewTagInput("");setShowTagInput(false);}}}
                      placeholder="New tag…"
                      style={{padding:"3px 9px",borderRadius:20,border:`1px solid ${T.warm}`,background:T.surface,color:T.text,fontSize:11,outline:"none",fontFamily:"inherit",width:80}}/>
                    <span onClick={()=>{if(newTagInput.trim()){setEditTags(s=>[...s,newTagInput.trim()]);setNewTagInput("");setShowTagInput(false);}}} style={{fontSize:11,cursor:"pointer",color:T.warm,fontWeight:600}}>+ Add</span>
                  </div>
                ) : (
                  <span onClick={()=>setShowTagInput(true)} style={{fontSize:11,padding:"2px 8px",borderRadius:20,border:`1px solid ${T.border}`,color:T.textS,cursor:"pointer",userSelect:"none"}}>+ Add tag</span>
                )}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {SUGGESTED_TAGS.filter(t=>!editTags.includes(t)).map(t=>(
                  <span key={t} onClick={()=>setEditTags(s=>[...s,t])}
                    style={{fontSize:10,padding:"1px 7px",borderRadius:20,border:`1px solid ${T.border}`,color:T.textS,cursor:"pointer",userSelect:"none"}}>+ {t}</span>
                ))}
              </div>
            </div>
            {/* Serves · Cook time · Cuisine — one row */}
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <div style={{flex:"0 0 70px"}}>
                <div style={labelStyle}>Serves</div>
                <input type="number" min="1" defaultValue={recipeViewData.serves} style={fieldStyle}/>
              </div>
              <div style={{flex:"0 0 90px"}}>
                <div style={labelStyle}>Cook time</div>
                <input type="number" min="1" defaultValue={parseInt(recipeViewData.time)||30} style={fieldStyle}/>
              </div>
              <div style={{flex:1}}>
                <div style={labelStyle}>Cuisine</div>
                <select defaultValue={recipeViewData.cuisine} style={{...fieldStyle,appearance:"auto"}}>
                  {["British","Italian","Indian","Chinese","Mexican","American","Mediterranean","Other"].map(c=>(
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <div style={labelStyle}>Ingredients</div>
              <textarea rows={5} defaultValue={recipeViewData.id==="r1"?"500g beef mince\n1 onion, diced\n2 garlic cloves\n400g tinned tomatoes\n250g spaghetti\nSalt, pepper, herbs":""} placeholder="List ingredients, one per line…" style={{...fieldStyle,resize:"vertical"}}/>
            </div>
            <div style={{marginBottom:10}}>
              <div style={labelStyle}>Method</div>
              <textarea rows={5} placeholder="Describe the cooking steps…" style={{...fieldStyle,resize:"vertical"}}/>
            </div>
            {/* Personal notes — only for mine / ai recipes */}
            {recipeViewData.src!=="predefined" && (
              <div style={{marginBottom:14}}>
                <div style={labelStyle}>Personal notes</div>
                <textarea rows={2} value={editNotes} onChange={e=>setEditNotes(e.target.value)}
                  placeholder="e.g. Tom loves this, double the garlic next time…"
                  style={{...fieldStyle,resize:"vertical"}}/>
              </div>
            )}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setRecipeViewData(null)} className="btn-sm">Close</button>
              <button onClick={saveRecipe} className="btn-sm btn-warm">Save changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Meal Picker Modal — bottom sheet ── */}
      {mealPickerCell && (() => {
        const cellKey = `${mealPickerCell.meal}-${mealPickerCell.day}`;
        const curCell = weekPlans[weekIdx]?.[cellKey] || {v:"",t:""};
        const mpLower = mpSearch.toLowerCase();
        const libMatches = recipes.filter(r=>
          r.meals.includes(mealPickerCell.meal) &&
          (!mpSearch || r.name.toLowerCase().includes(mpLower) || r.cuisine.toLowerCase().includes(mpLower))
        );
        const qckMatches = PLANNER_QUICK.filter(q=>
          !mpSearch || q.toLowerCase().includes(mpLower)
        );
        const pickCell = (v,t) => {
          setWeekPlans(p=>({...p,[weekIdx]:{...p[weekIdx],[cellKey]:{v,t}}}));
          setMealPickerCell(null);
          setMpSearch("");
        };
        return (
          <div onClick={()=>{setMealPickerCell(null);setMpSearch("");}}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",padding:isMobile?0:20}}>
            <div onClick={e=>e.stopPropagation()}
              style={{background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:isMobile?"16px 16px 0 0":"14px",width:"100%",maxWidth:isMobile?"100%":480,maxHeight:"78vh",display:"flex",flexDirection:"column",boxShadow:isMobile?"0 -16px 60px rgba(0,0,0,0.5)":"0 32px 80px rgba(0,0,0,0.55)"}}>
              {/* Handle bar — mobile only */}
              {isMobile && (
                <div style={{display:"flex",justifyContent:"center",padding:"10px 0 0"}}>
                  <div style={{width:40,height:4,borderRadius:2,background:T.border}}/>
                </div>
              )}
              {/* Header */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:isMobile?"10px 18px 8px":"16px 18px 8px"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>{mealPickerCell.meal} · {mealPickerCell.day}</div>
                <button onClick={()=>{setMealPickerCell(null);setMpSearch("");}}
                  style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:4}}>✕</button>
              </div>
              {/* Search */}
              <div style={{padding:"0 16px 10px",position:"relative"}}>
                <span style={{position:"absolute",left:28,top:"50%",transform:"translateY(-50%)",fontSize:12,color:T.textS,pointerEvents:"none"}}>🔍</span>
                <input value={mpSearch} onChange={e=>setMpSearch(e.target.value)}
                  placeholder="Search recipes or quick options…"
                  style={{width:"100%",padding:"8px 12px 8px 32px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
              {/* Scrollable list */}
              <div style={{overflowY:"auto",flex:1,paddingBottom:12}}>
                {/* Library section */}
                {libMatches.length > 0 && (
                  <>
                    <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:T.textS,padding:"6px 18px 4px"}}>From your library</div>
                    {libMatches.map(r=>{
                      const sel = curCell.v===r.name && curCell.t==="lib";
                      return (
                        <div key={r.id} onClick={()=>pickCell(r.name,"lib")}
                          style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",cursor:"pointer",
                            background:sel?T.skyS:"transparent",
                            borderBottom:`1px solid ${T.border}22`}}>
                          <DietDot diet={r.diet}/>
                          <span style={{fontSize:13,fontWeight:sel?600:400,color:sel?T.sky:T.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</span>
                          <div style={{display:"flex",gap:3,flexShrink:0}}>
                            {r.meals.map(m=><MealBadge key={m} meal={m}/>)}
                          </div>
                          {sel && <span style={{fontSize:13,color:T.sky,flexShrink:0}}>✓</span>}
                        </div>
                      );
                    })}
                  </>
                )}
                {/* Quick options section */}
                {qckMatches.length > 0 && (
                  <>
                    <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:T.textS,padding:"10px 18px 4px"}}>Quick options</div>
                    {qckMatches.map(q=>{
                      const sel = curCell.v===q && curCell.t==="qck";
                      return (
                        <div key={q} onClick={()=>pickCell(q,"qck")}
                          style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 18px",cursor:"pointer",
                            background:sel?T.warmS:"transparent",
                            borderBottom:`1px solid ${T.border}22`}}>
                          <span style={{fontSize:13,fontWeight:sel?600:400,color:sel?T.warm:T.text}}>{q}</span>
                          {sel && <span style={{fontSize:13,color:T.warm}}>✓</span>}
                        </div>
                      );
                    })}
                  </>
                )}
                {/* No results */}
                {libMatches.length===0 && qckMatches.length===0 && (
                  <div style={{fontSize:13,color:T.textS,textAlign:"center",padding:"28px 0"}}>No matches for "{mpSearch}"</div>
                )}
              </div>
              {/* Fixed footer — Clear this meal */}
              {curCell.v && (
                <div style={{borderTop:`1px solid ${T.border}`,padding:"10px 18px",flexShrink:0}}>
                  <button onClick={()=>pickCell("","")}
                    style={{width:"100%",padding:"9px 0",borderRadius:9,border:`1px solid ${T.rose}44`,background:T.roseS,color:T.rose,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <span style={{fontSize:12}}>✕</span> Clear this meal
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Save Template Modal ── */}
      {saveTemplateOpen && (
        <div onClick={()=>{setSaveTemplateOpen(false);setTemplateNameInput("");}}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:isMobile?16:20}}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:14,padding:22,width:"100%",maxWidth:isMobile?"100%":340,boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>Save as template</div>
              <button onClick={()=>{setSaveTemplateOpen(false);setTemplateNameInput("");}}
                style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:4}}>✕</button>
            </div>
            <div style={{fontSize:12.5,color:T.textS,marginBottom:14}}>
              This saves the current week's plan as a reusable template. You can load it any time.
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:600,color:T.textM,marginBottom:5}}>Template name</div>
              <input value={templateNameInput} onChange={e=>setTemplateNameInput(e.target.value)}
                placeholder="e.g. Busy weekday plan"
                style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setSaveTemplateOpen(false);setTemplateNameInput("");}}
                style={{flex:1,padding:"9px 0",borderRadius:9,border:`1px solid ${T.border}`,background:"none",color:T.text,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                Cancel
              </button>
              <button
                disabled={!templateNameInput.trim()}
                onClick={()=>{
                  const count = Object.values(weekPlans[weekIdx]||{}).filter(c=>c.v).length;
                  const now = new Date();
                  const label = `${String(now.getDate()).padStart(2,"0")}-${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][now.getMonth()]}-${now.getFullYear()}`;
                  setPlanTemplates(p=>[{name:templateNameInput.trim(),saved:label,count},{...p}].flat());
                  setSaveTemplateOpen(false);
                  setTemplateNameInput("");
                }}
                style={{flex:2,padding:"9px 0",borderRadius:9,border:"none",background:templateNameInput.trim()?T.sky:"#aaa",color:"#fff",fontSize:13,fontWeight:600,cursor:templateNameInput.trim()?"pointer":"not-allowed",fontFamily:"inherit"}}>
                Save template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Load Template Modal ── */}
      {loadTemplateOpen && (
        <div onClick={()=>setLoadTemplateOpen(false)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",padding:isMobile?0:20}}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:isMobile?"16px 16px 0 0":"14px",width:"100%",maxWidth:isMobile?"100%":480,maxHeight:"70vh",display:"flex",flexDirection:"column",boxShadow:isMobile?"0 -16px 60px rgba(0,0,0,0.5)":"0 32px 80px rgba(0,0,0,0.55)"}}>
            {isMobile && (
              <div style={{display:"flex",justifyContent:"center",padding:"10px 0 0"}}>
                <div style={{width:40,height:4,borderRadius:2,background:T.border}}/>
              </div>
            )}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:isMobile?"10px 18px 14px":"16px 18px 14px"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>Load a template</div>
              <button onClick={()=>setLoadTemplateOpen(false)}
                style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:4}}>✕</button>
            </div>
            <div style={{fontSize:12,color:T.textS,padding:"0 18px 10px"}}>
              Loading a template overwrites all meals in the current week.
            </div>
            <div style={{overflowY:"auto",flex:1,paddingBottom:16}}>
              {planTemplates.length===0 && (
                <div style={{fontSize:13,color:T.textS,textAlign:"center",padding:"28px 0"}}>No saved templates yet</div>
              )}
              {planTemplates.map((tpl,i)=>(
                <div key={i}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderBottom:`1px solid ${T.border}22`,cursor:"pointer"}}
                  onClick={()=>{
                    /* In a real app: load tpl.cells into weekPlans[weekIdx]; here just close */
                    setLoadTemplateOpen(false);
                  }}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:2}}>{tpl.name}</div>
                    <div style={{fontSize:11,color:T.textS}}>Saved {tpl.saved} · {tpl.count} meals</div>
                  </div>
                  <button style={{fontSize:12,fontWeight:600,padding:"5px 12px",borderRadius:8,border:`1px solid ${T.border}`,background:T.card2,color:T.text,cursor:"pointer",fontFamily:"inherit"}}>
                    Load
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AI Plan Picker Modal (swap individual cell during AI review) ── */}
      {aiPlanPickerCell && aiPlanResult && (() => {
        const cellKey = `${aiPlanPickerCell.meal}-${aiPlanPickerCell.day}`;
        const curVal  = aiPlanResult[cellKey]?.v || "";
        const pLower  = aiPlanPickerSearch.toLowerCase();
        const libOpts = recipes.filter(r=>
          r.meals.includes(aiPlanPickerCell.meal) &&
          (!aiPlanPickerSearch || r.name.toLowerCase().includes(pLower))
        );
        const qckOpts = PLANNER_QUICK.filter(q=>
          !aiPlanPickerSearch || q.toLowerCase().includes(pLower)
        );
        const swapCell = (v,t) => {
          setAiPlanResult(p=>({...p,[cellKey]:{v,t}}));
          setAiPlanPickerCell(null);
          setAiPlanPickerSearch("");
        };
        return (
          <div onClick={()=>{setAiPlanPickerCell(null);setAiPlanPickerSearch("");}}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:1000,display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",padding:isMobile?0:20}}>
            <div onClick={e=>e.stopPropagation()}
              style={{background:T.card,border:`1px solid ${T.borderHi}`,borderRadius:isMobile?"16px 16px 0 0":"14px",width:"100%",maxWidth:isMobile?"100%":480,maxHeight:"78vh",display:"flex",flexDirection:"column",boxShadow:isMobile?"0 -16px 60px rgba(0,0,0,0.5)":"0 32px 80px rgba(0,0,0,0.55)"}}>
              {isMobile && (
                <div style={{display:"flex",justifyContent:"center",padding:"10px 0 0"}}>
                  <div style={{width:40,height:4,borderRadius:2,background:T.border}}/>
                </div>
              )}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:isMobile?"10px 18px 8px":"16px 18px 8px"}}>
                <div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700}}>Swap meal</div>
                  <div style={{fontSize:11,color:T.textS}}>{aiPlanPickerCell.meal} · {aiPlanPickerCell.day}</div>
                </div>
                <button onClick={()=>{setAiPlanPickerCell(null);setAiPlanPickerSearch("");}}
                  style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:4}}>✕</button>
              </div>
              <div style={{padding:"0 16px 10px",position:"relative"}}>
                <span style={{position:"absolute",left:28,top:"50%",transform:"translateY(-50%)",fontSize:12,color:T.textS,pointerEvents:"none"}}>🔍</span>
                <input value={aiPlanPickerSearch} onChange={e=>setAiPlanPickerSearch(e.target.value)}
                  placeholder="Search library or quick options…"
                  style={{width:"100%",padding:"8px 12px 8px 32px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
              <div style={{overflowY:"auto",flex:1,paddingBottom:12}}>
                {libOpts.length > 0 && (
                  <>
                    <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:T.textS,padding:"6px 18px 4px"}}>From your library</div>
                    {libOpts.map(r=>{
                      const sel = curVal===r.name;
                      return (
                        <div key={r.id} onClick={()=>swapCell(r.name,"lib")}
                          style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",cursor:"pointer",
                            background:sel?T.skyS:"transparent",borderBottom:`1px solid ${T.border}22`}}>
                          <DietDot diet={r.diet}/>
                          <span style={{fontSize:13,fontWeight:sel?600:400,color:sel?T.sky:T.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</span>
                          <div style={{display:"flex",gap:3,flexShrink:0}}>{r.meals.map(m=><MealBadge key={m} meal={m}/>)}</div>
                          {sel && <span style={{fontSize:13,color:T.sky}}>✓</span>}
                        </div>
                      );
                    })}
                  </>
                )}
                {qckOpts.length > 0 && (
                  <>
                    <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:T.textS,padding:"10px 18px 4px"}}>Quick options</div>
                    {qckOpts.map(q=>{
                      const sel = curVal===q;
                      return (
                        <div key={q} onClick={()=>swapCell(q,"qck")}
                          style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 18px",cursor:"pointer",
                            background:sel?T.warmS:"transparent",borderBottom:`1px solid ${T.border}22`}}>
                          <span style={{fontSize:13,fontWeight:sel?600:400,color:sel?T.warm:T.text}}>{q}</span>
                          {sel && <span style={{fontSize:13,color:T.warm}}>✓</span>}
                        </div>
                      );
                    })}
                  </>
                )}
                {libOpts.length===0 && qckOpts.length===0 && (
                  <div style={{fontSize:13,color:T.textS,textAlign:"center",padding:"28px 0"}}>No matches for "{aiPlanPickerSearch}"</div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ── TRAVEL ──────────────────────────────────────────────── */
function TravelScreen() {
  const [tab,setTab] = useState("My Trips");

  const Ph2Card = ({icon,title,sub}) => (
    <div className="card" style={{opacity:0.7,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:10,right:12,fontSize:9.5,fontWeight:700,padding:"2px 8px",borderRadius:8,background:T.amberS,color:T.amber,letterSpacing:".04em"}}>✦ Phase 2</div>
      <div style={{fontSize:28,marginBottom:10}}>{icon}</div>
      <div className="card-title">{title}</div>
      <div style={{fontSize:12.5,color:T.textS,lineHeight:1.6}}>{sub}</div>
    </div>
  );

  const views = {
    "My Trips":          <Ph2Card icon="✈️" title="My Trips"          sub="Plan and track your trips, from weekend breaks to holidays — coming soon."/>,
    "Packing Templates": <Ph2Card icon="🧳" title="Packing Templates" sub="Smart packing lists tailored to your destination and trip type — coming soon."/>,
    "Travel Ready":      <Ph2Card icon="🛂" title="Travel Ready"      sub="Track passport expiry, visa requirements, and travel insurance in one place — coming soon."/>,
  };

  return (
    <div>
      <div className="nav-tabs">{Object.keys(views).map(t=><div key={t} className={`nav-tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>{t}</div>)}</div>
      {views[tab]}
    </div>
  );
}

/* ── MY ACCOUNT ──────────────────────────────────────────── */
function AccountScreen() {
  const [tab,setTab] = useState("My Profile");
  const [interests, setInterests] = useState(["📸 Photography","🚴 Cycling","⚽ Football","💻 Technology"]);
  const toggleInt = t => setInterests(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const allInts = ["📸 Photography","🚴 Cycling","🍳 Cooking","📚 Reading","⚽ Football","✈️ Travel","💻 Technology","🌱 Gardening","🎵 Music","🏃 Running","🎮 Gaming","🍷 Wine","🏊 Swimming","🧘 Yoga","🎨 Art & Craft","🎭 Theatre","🐶 Pets","🚵 Mountain Biking","🎯 Archery","🎸 Guitar"];
  const [addHobbyOpen, setAddHobbyOpen] = useState(false);
  const availableInts = allInts.filter(t => !interests.includes(t));
  const [billHistOpen, setBillHistOpen] = useState(false);
  const [idocsOpen, setIdocsOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [docModal, setDocModal] = useState(null); // {mode:"edit"|"add", type:string, data?:object}
  const [docFile, setDocFile] = useState(null);   // null | string (existing filename) | File (new upload)
  const fileInputRef = useRef(null);
  const openDocModal = (mode, type, data={}) => { setDocModal({mode, type, data}); setDocFile(data.file||null); };
  const closeDocModal = () => { setDocModal(null); setDocFile(null); };
  const MONTH_MAP = {Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12"};
  const toDateInput = s => { if (!s) return ""; const [d,m,y] = s.split("-"); return `${y}-${MONTH_MAP[m]||"01"}-${String(d).padStart(2,"0")}`; };
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState("Adult");
  const [manageMember, setManageMember] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removedIds, setRemovedIds] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([
    { id:"inv1", name:"Chris Guha",  email:"chris@example.com", role:"Adult", sentDate:"23-May-2026", status:"pending" },
    { id:"inv2", name:"Priya Sharma",email:"priya@example.com", role:"Teen",  sentDate:"15-May-2026", status:"expired" },
  ]);
  const [memberRoles, setMemberRoles] = useState(
    Object.fromEntries(MEMBERS_AC.map(m => [m.id, m.role]))
  );
  const [memberHMG, setMemberHMG] = useState(
    Object.fromEntries(MEMBERS_AC.map(m => [m.id, m.inHMG]))
  );
  const [savedRoles, setSavedRoles] = useState(
    Object.fromEntries(MEMBERS_AC.map(m => [m.id, m.role]))
  );
  const [savedHMG, setSavedHMG] = useState(
    Object.fromEntries(MEMBERS_AC.map(m => [m.id, m.inHMG]))
  );
  const [prefTheme, setPrefTheme] = useState("System");
  const [prefOpen, setPrefOpen] = useState({lang:true, appear:false, notif:false});
  const togglePref = k => setPrefOpen(p => ({...p, [k]:!p[k]}));

  const fldLbl = {
    display:"block", fontSize:11, fontWeight:600, color:T.textS,
    marginBottom:4, marginTop:14, letterSpacing:".04em", textTransform:"uppercase"
  };
  const fldInp = {
    width:"100%", padding:"8px 11px", borderRadius:8,
    border:`1px solid ${T.border}`, background:T.surface, color:T.text,
    fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box"
  };
  const modalShell = {
    position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
    zIndex:201, width:"min(460px,94vw)", maxHeight:"88vh", overflowY:"auto",
    background:T.card, border:`1px solid ${T.borderHi}`, borderRadius:18,
    padding:24, boxShadow:"0 32px 80px rgba(0,0,0,0.55)"
  };
  const rowBase = {
    display:"flex", alignItems:"center", gap:10, padding:"8px 14px",
    borderBottom:`1px solid ${T.border}`, cursor:"pointer", transition:"background .12s"
  };

  const views = {
    "My Profile": (
      <div>
        {/* Identity */}
        <div className="card" style={{marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${T.warm},${T.rose})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>👨</div>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700}}>James Smith</div>
              <div style={{fontSize:12.5,color:T.textS}}>james@example.com · +44 7700 900123</div>
            </div>
            <button className="btn-sm" style={{marginLeft:"auto"}}>Edit</button>
          </div>
          {[{l:"Home address",v:"14 Marina Road, Lowestoft, NR32 1AA"},{l:"Date joined",v:"January 2025"},{l:"Account type",v:"Family Plan · 6 members"}].map((f,i)=>(
            <div key={i} className="row">
              <span style={{fontSize:12,color:T.textS,width:110,flexShrink:0}}>{f.l}</span>
              <span style={{fontSize:13}}>{f.v}</span>
            </div>
          ))}
        </div>
        {/* Identity Documents — collapsible, collapsed by default */}
        <div className="card" style={{marginBottom:12}}>
          <div onClick={()=>setIdocsOpen(v=>!v)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",userSelect:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div className="card-title" style={{marginBottom:0}}>🪪 Identity Documents</div>
              {!idocsOpen && <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:7,background:T.amberS,color:T.amber}}>1 expiring soon</span>}
            </div>
            <span style={{fontSize:13,color:T.textS,display:"inline-block",transition:"transform .2s",transform:idocsOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
          </div>
          {idocsOpen && (
            <div style={{marginTop:12}}>
              {[
                {label:"Passport",           sub:"British · Expires 12-Mar-2030",           dot:T.sage,  subColor:T.textS,  type:"passport", data:{country:"United Kingdom",number:"123456789",expiry:"12-Mar-2030",file:"passport-scan.pdf"}},
                {label:"Driving Licence",    sub:"DVLA · Expires 14-Jul-2026 — renew soon", dot:T.amber, subColor:T.amber,  type:"licence",  data:{country:"United Kingdom",number:"SMITH701054J99AB",expiry:"14-Jul-2026",categories:"B, BE",file:"driving-licence.jpg"}},
                {label:"National Insurance", sub:"AB 12 34 56 C · No expiry",               dot:T.textM, subColor:T.textS,  type:"ni",       data:{number:"AB 12 34 56 C"}},
              ].map((doc,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:doc.dot,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600}}>{doc.label}</div>
                    <div style={{fontSize:11.5,color:doc.subColor}}>{doc.sub}</div>
                  </div>
                  <button className="btn-sm" onClick={()=>openDocModal("edit", doc.type, doc.data)}>Edit</button>
                </div>
              ))}
              {[
                {label:"BRP",            type:"brp"},
                {label:"GHIC",           type:"ghic"},
                {label:"OCI Card",       type:"oci"},
                {label:"Other document", type:"other"},
              ].map(({label,type},i,arr)=>(
                <div key={i} onClick={()=>openDocModal("add", type)} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom: i < arr.length-1 ? `1px solid ${T.border}` : "none",color:T.textS,cursor:"pointer",fontSize:12}}>
                  <span style={{fontSize:14,color:T.textM,width:8,textAlign:"center",flexShrink:0}}>+</span>
                  <span>Add {label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Hobbies & Interests */}
        <div className="card" style={{marginBottom:12}}>
          <div className="card-title">🎯 Hobbies & Interests</div>
          <div style={{fontSize:12,color:T.textS,marginBottom:10}}>Tap to select — MyPal AI personalises suggestions based on your interests.</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:8}}>
            {interests.map(t=><div key={t} className="int-tag on" onClick={()=>toggleInt(t)} style={{fontSize:12,padding:"5px 11px"}}>{t}</div>)}
            {availableInts.length > 0 && (
              <div className="int-tag" onClick={()=>setAddHobbyOpen(true)} style={{fontSize:12,padding:"5px 11px",borderStyle:"dashed",cursor:"pointer"}}>+ Add</div>
            )}
          </div>
          <div style={{fontSize:11.5,color:T.textM}}>{interests.length} active</div>
        </div>
        {/* My Plan — collapsible, collapsed by default */}
        <div className="card" style={{marginBottom:12}}>
          <div onClick={()=>setPlanOpen(v=>!v)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",userSelect:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div className="card-title" style={{marginBottom:0}}>💳 My Plan</div>
              {!planOpen && <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:7,background:T.warmS,color:T.warm}}>Family · Active</span>}
            </div>
            <span style={{fontSize:13,color:T.textS,display:"inline-block",transition:"transform .2s",transform:planOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
          </div>
          {planOpen && (
            <div style={{marginTop:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:T.warm}}>Family Plan</div>
                <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:7,background:T.warmS,color:T.warm}}>Active</span>
                <button className="btn-sm" style={{marginLeft:"auto"}}>Manage plan</button>
              </div>
              {[{l:"Monthly cost",v:"£4.99"},{l:"Next renewal",v:"14-Jun-2026"},{l:"Members",v:"6 of 6"},{l:"Payment method",v:"Visa •••• 4231"}].map((f,i)=>(
                <div key={i} className="row">
                  <span style={{fontSize:12,color:T.textS,width:120,flexShrink:0}}>{f.l}</span>
                  <span style={{fontSize:13}}>{f.v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Billing History — separate card, collapsible, collapsed by default */}
        <div className="card" style={{marginBottom:12}}>
          <div onClick={()=>setBillHistOpen(v=>!v)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",userSelect:"none"}}>
            <div className="card-title" style={{marginBottom:0}}>🧾 Billing History</div>
            <span style={{fontSize:13,color:T.textS,display:"inline-block",transition:"transform .2s",transform:billHistOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
          </div>
          {billHistOpen && (
            <div style={{marginTop:10}}>
              {[
                {date:"14-May-2026", desc:"Family Plan — May 2026", amt:"£4.99", status:"Paid"},
                {date:"14-Apr-2026", desc:"Family Plan — Apr 2026", amt:"£4.99", status:"Paid"},
                {date:"14-Mar-2026", desc:"Family Plan — Mar 2026", amt:"£4.99", status:"Paid"},
                {date:"14-Feb-2026", desc:"Family Plan — Feb 2026", amt:"£4.99", status:"Paid"},
                {date:"14-Jan-2026", desc:"Family Plan — Jan 2026", amt:"£4.99", status:"Paid"},
              ].map((r,i,arr)=>(
                <div key={i} style={{display:"flex",alignItems:"center",padding:"7px 0",borderBottom: i < arr.length-1 ? `1px solid ${T.border}` : "none",gap:8}}>
                  <span style={{fontSize:11.5,color:T.textS,width:90,flexShrink:0}}>{r.date}</span>
                  <span style={{fontSize:13,flex:1}}>{r.desc}</span>
                  <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:7,background:T.sageS,color:T.sage,flexShrink:0}}>{r.status}</span>
                  <span style={{fontSize:13,fontWeight:600,width:36,textAlign:"right",flexShrink:0}}>{r.amt}</span>
                  <button className="btn-sm" style={{fontSize:11,padding:"3px 9px",flexShrink:0}}>Receipt</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{padding:"10px 12px",borderRadius:9,background:T.tealS,border:`1px solid ${T.teal}33`,fontSize:12.5,color:T.textS,lineHeight:1.6}}>
          <strong style={{color:T.teal}}>🤖 MyPal AI:</strong> Your profile is 80% complete — add a profile photo and emergency contact to finish setup.
          <span style={{marginLeft:10,color:T.teal,fontWeight:600,cursor:"pointer"}}>Complete →</span>
        </div>
      </div>
    ),
    "Family Members": (() => {
      const viewer = MEMBERS_AC.find(m => m.you);
      const activeMembers = MEMBERS_AC.filter(m => !removedIds.includes(m.id));
      const removedCount = removedIds.length;
      const hasFMChanges = activeMembers.some(m =>
        memberRoles[m.id] !== savedRoles[m.id] || memberHMG[m.id] !== savedHMG[m.id]
      );
      const saveFMChanges = () => {
        setSavedRoles({...memberRoles});
        setSavedHMG({...memberHMG});
      };
      const discardFMChanges = () => {
        setMemberRoles({...savedRoles});
        setMemberHMG({...savedHMG});
      };
      const canRemove = (m) => !m.you && (
        viewer.role === "Owner" ||
        (viewer.role === "Admin" && m.role !== "Owner")
      );
      return (
        <div className="card">
          <div className="card-title">
            Family Members · {activeMembers.length}
            {removedCount > 0 && <span style={{marginLeft:8,fontSize:11,fontWeight:500,color:T.textS}}>({removedCount} removed)</span>}
          </div>

          {/* ── All members (active + removed) ── */}
          {MEMBERS_AC.map(m => {
            const isRemoved = removedIds.includes(m.id);
            const role = memberRoles[m.id];
            const isDirty = !isRemoved && (memberRoles[m.id] !== savedRoles[m.id] || memberHMG[m.id] !== savedHMG[m.id]);
            const isHMGEditable = !isRemoved && role === "Adult" && !m.you;
            const hmgChecked = role === "Owner" || role === "Admin" ? true : role === "Adult" ? memberHMG[m.id] : false;
            const hmgDisabled = isRemoved || role !== "Adult" || m.you;
            return (
              <div key={m.id} className="row" style={{
                marginLeft:-12, marginRight:-12, paddingLeft:12, paddingRight:12,
                background: isRemoved ? "transparent" : isDirty ? T.warmS+"55" : "transparent",
                borderLeft: isRemoved ? `3px solid ${T.border}` : isDirty ? `3px solid ${T.warm}` : "3px solid transparent",
                opacity: isRemoved ? 0.5 : 1,
                transition:"background 0.2s, opacity 0.2s"
              }}>
                <AvatarAC m={m} size={32}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600}}>
                    {m.name}
                    {m.you && <span style={{marginLeft:6,fontSize:10,color:T.warm,fontWeight:600}}>(You)</span>}
                  </div>
                  <div style={{fontSize:11.5,color:T.textS}}>
                    {(role==="Teen"||role==="Child"||role==="Adult") ? `${m.age} yrs` : ""}
                  </div>
                </div>
                {isRemoved
                  ? <span style={{fontSize:9.5,fontWeight:700,padding:"2px 7px",borderRadius:6,background:T.roseS||T.rose+"22",color:T.rose,letterSpacing:".03em",whiteSpace:"nowrap"}}>Removed</span>
                  : <>
                      <label style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:hmgDisabled?T.textS:T.warm,cursor:isHMGEditable?"pointer":"default",marginRight:8,whiteSpace:"nowrap"}}>
                        <input
                          type="checkbox"
                          checked={hmgChecked}
                          disabled={hmgDisabled}
                          onChange={e => setMemberHMG(h => ({...h, [m.id]: e.target.checked}))}
                          style={{accentColor:T.warm,cursor:isHMGEditable?"pointer":"default"}}
                        />
                        HMG
                      </label>
                      {m.you
                        ? <span style={{fontSize:12,color:T.textS,whiteSpace:"nowrap"}}>{ROLE_SHORT_AC[role]}</span>
                        : <select
                            value={role}
                            onChange={e => {
                              const newRole = e.target.value;
                              setMemberRoles(r => ({...r, [m.id]: newRole}));
                              if (newRole !== "Adult") setMemberHMG(h => ({...h, [m.id]: false}));
                            }}
                            style={{
                              fontSize:12,padding:"3px 8px",borderRadius:7,
                              border:`1px solid ${T.border}`,background:T.card2,
                              color:T.text,cursor:"pointer",outline:"none"
                            }}
                          >
                            {["Admin","Adult","Teen","Child"].map(r => (
                              <option key={r} value={r}>{ROLE_SHORT_AC[r]}</option>
                            ))}
                          </select>
                      }
                      {canRemove(m) && (
                        <button
                          onClick={() => setRemoveTarget(m)}
                          title="Remove from household"
                          style={{
                            marginLeft:8,background:"none",border:"none",cursor:"pointer",
                            color:T.rose,fontSize:14,padding:"2px 4px",borderRadius:5,
                            lineHeight:1,opacity:0.7,transition:"opacity 0.15s"
                          }}
                          onMouseEnter={e=>e.currentTarget.style.opacity=1}
                          onMouseLeave={e=>e.currentTarget.style.opacity=0.7}
                        >🗑️</button>
                      )}
                    </>
                }
              </div>
            );
          })}

          {/* ── Pending invites ── */}
          {pendingInvites.length > 0 && (
            <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${T.border}`}}>
              <div style={{fontSize:11,fontWeight:700,color:T.textS,letterSpacing:".04em",textTransform:"uppercase",marginBottom:8}}>Pending Invites</div>
              {pendingInvites.map(inv => (
                <div key={inv.id} className="row" style={{alignItems:"flex-start"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:T.card2,border:`1px dashed ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>✉️</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600}}>{inv.name}</div>
                    <div style={{fontSize:11.5,color:T.textS}}>{inv.email} · {ROLE_SHORT_AC[inv.role]}</div>
                    <div style={{fontSize:11,color:T.textS,marginTop:1}}>Sent {inv.sentDate}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
                    <span style={{
                      fontSize:9.5,fontWeight:700,padding:"2px 7px",borderRadius:6,letterSpacing:".03em",
                      background: inv.status==="expired" ? T.amberS : T.tealS,
                      color:       inv.status==="expired" ? T.amber  : T.teal,
                    }}>{inv.status==="expired" ? "Expired" : "Pending"}</span>
                    <div style={{display:"flex",gap:6}}>
                      <button className="btn-sm" onClick={()=>setPendingInvites(p=>p.map(i=>i.id===inv.id?{...i,status:"pending",sentDate:"27-May-2026"}:i))}>Resend</button>
                      <button className="btn-sm" style={{color:T.rose,borderColor:T.rose+"55"}} onClick={()=>setPendingInvites(p=>p.filter(i=>i.id!==inv.id))}>Cancel</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Save / Discard bar ── */}
          {hasFMChanges && (
            <div style={{
              display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8,
              marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`
            }}>
              <button className="btn-sm" onClick={discardFMChanges}>Discard</button>
              <button className="btn-sm btn-warm" onClick={saveFMChanges}>Save changes</button>
            </div>
          )}

          {/* ── Action buttons ── */}
          <div style={{marginTop: hasFMChanges ? 8 : 12, display:"flex",flexDirection:"column",gap:8}}>
            <button className="btn-sm btn-warm" onClick={()=>setInviteOpen(true)} style={{width:"100%"}}>+ Invite family member</button>
            <button className="btn-sm" style={{width:"100%"}}>📧 Refer a friend — get 1 month free</button>
          </div>
        </div>
      );
    })(),
    "Preferences": (
      <div>
        {/* Helper: collapsible section header */}
        {[
          {key:"lang",   icon:"🌐", label:"Language & Region", content:(
            <div>
              {[{l:"Language",v:"English (UK)"},{l:"Date format",v:"DD-Mon-YYYY"},{l:"Currency",v:"GBP (£)"},{l:"Time zone",v:"Europe/London"}].map((f,i)=>(
                <div key={i} className="row">
                  <span style={{flex:1,fontSize:13}}>{f.l}</span>
                  <span style={{fontSize:13,color:T.textS,marginRight:10}}>{f.v}</span>
                  <button className="btn-sm">Change</button>
                </div>
              ))}
            </div>
          )},
          {key:"appear", icon:"🎨", label:"Appearance", content:(
            <div className="row">
              <span style={{flex:1,fontSize:13}}>Theme</span>
              <div style={{display:"flex",gap:6}}>
                {[["☀️","Light"],["💻","System"],["🌙","Dark"]].map(([ic,lbl])=>(
                  <div key={lbl} onClick={()=>setPrefTheme(lbl)} style={{
                    padding:"4px 10px",borderRadius:8,fontSize:12,cursor:"pointer",
                    background: lbl===prefTheme ? T.warmS : T.card2,
                    color:      lbl===prefTheme ? T.warm  : T.textS,
                    border:`1px solid ${lbl===prefTheme ? T.warm+"66" : T.border}`,
                    fontWeight: lbl===prefTheme ? 600 : 400,
                  }}>{ic} {lbl}</div>
                ))}
              </div>
            </div>
          )},
          {key:"notif",  icon:"🔔", label:"Notifications", content:(
            <div style={{position:"relative",opacity:0.6,pointerEvents:"none"}}>
              <div style={{position:"absolute",top:-4,right:0,fontSize:9.5,fontWeight:700,padding:"2px 8px",borderRadius:8,background:T.amberS,color:T.amber,letterSpacing:".04em",zIndex:1}}>✦ Phase 2</div>
              {[
                {t:"Daily briefing",sub:"Morning summary at 8:00am",on:true},
                {t:"Task reminders",sub:"Due and overdue tasks",on:true},
                {t:"Bill due dates",sub:"3 days before payment",on:true},
                {t:"Health appointments",sub:"24 hours before",on:true},
                {t:"Family activity",sub:"When family members add items",on:false},
              ].map((s,i)=>(
                <div key={i} className="row">
                  <div style={{flex:1}}>
                    <div style={{fontSize:13}}>{s.t}</div>
                    <div style={{fontSize:11.5,color:T.textS}}>{s.sub}</div>
                  </div>
                  <div style={{width:36,height:20,borderRadius:10,background:s.on?T.sage:T.border,display:"flex",alignItems:"center",padding:2}}>
                    <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",marginLeft:s.on?"auto":"0"}}/>
                  </div>
                </div>
              ))}
            </div>
          )},
        ].map(({key,icon,label,content})=>(
          <div key={key} className="card" style={{marginBottom:12}}>
            <div onClick={()=>togglePref(key)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",userSelect:"none"}}>
              <div className="card-title" style={{marginBottom:0}}>{icon} {label}</div>
              <span style={{fontSize:13,color:T.textS,display:"inline-block",transition:"transform .2s",transform:prefOpen[key]?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
            </div>
            {prefOpen[key] && <div style={{marginTop:10}}>{content}</div>}
          </div>
        ))}
      </div>
    ),
    "Access": <AccessTabContent/>,
    "Security & Privacy": (
      <div>
        <div className="card" style={{marginBottom:12}}>
          <div className="card-title">🔐 Login Methods</div>
          {[{ic:"✉️",t:"Email",sub:"james@example.com",active:true},{ic:"🇬",t:"Google",sub:"Linked",active:true},{ic:"📱",t:"Phone (SMS)",sub:"+44 7700 ••••23",active:true},{ic:"🍎",t:"Apple",sub:"Not linked",active:false}].map((lm,i)=>(
            <div key={i} className="row">
              <span style={{fontSize:17,width:28,textAlign:"center"}}>{lm.ic}</span>
              <div style={{flex:1}}><div style={{fontSize:13}}>{lm.t}</div><div style={{fontSize:11.5,color:T.textS}}>{lm.sub}</div></div>
              <button className="btn-sm">{lm.active?"Manage":"Link"}</button>
            </div>
          ))}
        </div>
        <div className="card" style={{marginBottom:12,opacity:0.65,position:"relative",overflow:"hidden",pointerEvents:"none"}}>
          <div style={{position:"absolute",top:10,right:12,fontSize:9.5,fontWeight:700,padding:"2px 8px",borderRadius:8,background:T.amberS,color:T.amber,letterSpacing:".04em"}}>✦ Phase 2</div>
          <div className="card-title">🛡️ Two-Factor Authentication</div>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0"}}>
            <div style={{width:36,height:20,borderRadius:10,background:T.sage,display:"flex",alignItems:"center",padding:2}}>
              <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",marginLeft:"auto"}}/>
            </div>
            <span style={{fontSize:13}}>2FA enabled via SMS</span>
            <span style={{fontSize:10,padding:"1px 7px",borderRadius:7,background:T.sageS,color:T.sage}}>Active</span>
          </div>
        </div>
        <div className="card" style={{marginBottom:12}}>
          <div className="card-title">📱 Active Sessions</div>
          {[{d:"MacBook Pro · Chrome",l:"Lowestoft, UK",t:"Now"},{d:"iPhone 15 · Safari",l:"Lowestoft, UK",t:"2h ago"},{d:"iPad Air · Safari",l:"Lowestoft, UK",t:"Yesterday"}].map((s,i)=>(
            <div key={i} className="row">
              <div style={{flex:1}}><div style={{fontSize:13}}>{s.d}</div><div style={{fontSize:11.5,color:T.textS}}>{s.l} · {s.t}</div></div>
              {i>0&&<button className="btn-sm" style={{color:T.rose,borderColor:T.rose}}>Revoke</button>}
              {i===0&&<span style={{fontSize:10,padding:"1px 7px",borderRadius:7,background:T.sageS,color:T.sage}}>Current</span>}
            </div>
          ))}
        </div>
        <div className="card" style={{marginBottom:12}}>
          <div className="card-title">🔑 Password</div>
          <button className="btn-sm" style={{marginBottom:8}}>Change password</button>
          <div style={{fontSize:12,color:T.textS}}>Last changed: 3 months ago</div>
        </div>
        <div className="card" style={{marginBottom:12}}>
          <div className="card-title">🔒 Privacy Settings</div>
          {[{t:"Share health summary with family",on:false},{t:"Journal visible to partner",on:false},{t:"Share fitness achievements",on:true},{t:"Allow personalised AI suggestions",on:true}].map((s,i)=>(
            <div key={i} className="row">
              <span style={{flex:1,fontSize:13}}>{s.t}</span>
              <div style={{width:36,height:20,borderRadius:10,background:s.on?T.sage:T.border,display:"flex",alignItems:"center",padding:2,cursor:"pointer",transition:"all .2s"}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",marginLeft:s.on?"auto":"0"}}/>
              </div>
            </div>
          ))}
        </div>
        <div className="card" style={{opacity:0.65,position:"relative",overflow:"hidden",pointerEvents:"none"}}>
          <div style={{position:"absolute",top:10,right:12,fontSize:9.5,fontWeight:700,padding:"2px 8px",borderRadius:8,background:T.amberS,color:T.amber,letterSpacing:".04em"}}>✦ Phase 2</div>
          <div className="card-title">📦 Your Data</div>
          <div style={{fontSize:12.5,color:T.textS,lineHeight:1.6,marginBottom:12}}>Under GDPR, you have the right to access, export, or delete all your data.</div>
          <button className="btn-sm" style={{width:"100%",marginBottom:8}}>⬇️ Export all my data (JSON / CSV)</button>
          <button className="btn-sm" style={{width:"100%",marginBottom:8}}>📋 View connected apps</button>
          <button className="btn-sm" style={{width:"100%",color:T.rose,borderColor:T.rose}}>🗑️ Delete account (30-day grace period)</button>
        </div>
      </div>
    ),
  };

  return (
    <div>
      <div className="nav-tabs">{Object.keys(views).map(t=><div key={t} className={`nav-tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>{t}</div>)}</div>
      {views[tab]}

      {/* ── Invite Family Member Modal ── */}
      {inviteOpen && (
        <div onClick={()=>setInviteOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.card,borderRadius:16,padding:24,width:"100%",maxWidth:420,display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700}}>Invite Family Member</div>
              <button onClick={()=>setInviteOpen(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:4}}>✕</button>
            </div>
            <div style={{fontSize:12,color:T.textS,marginBottom:16,lineHeight:1.6}}>Send an invitation by email. They'll be asked to create an account or sign in, then join your family.</div>
            {[
              {label:"Full name",        placeholder:"e.g. Sarah Smith",             type:"text"},
              {label:"Email address",    placeholder:"e.g. sarah@example.com",        type:"email"},
            ].map((f,i)=>(
              <div key={i} style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:600,color:T.textS,marginBottom:4,letterSpacing:".04em",textTransform:"uppercase"}}>{f.label}</div>
                <input type={f.type} placeholder={f.placeholder} style={{width:"100%",padding:"9px 11px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:600,color:T.textS,marginBottom:6,letterSpacing:".04em",textTransform:"uppercase"}}>Role</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["Adult","Teen","Child"].map(r=>(
                  <div key={r} onClick={()=>setInviteRole(r)} style={{padding:"5px 14px",borderRadius:9,border:`1px solid ${r===inviteRole?T.warm:T.border}`,background:r===inviteRole?T.warmS:"transparent",color:r===inviteRole?T.warm:T.textS,fontSize:12.5,cursor:"pointer",fontWeight:r===inviteRole?600:400}}>{r}</div>
                ))}
              </div>
              <div style={{fontSize:11.5,color:T.textS,marginTop:6}}>1 of 6 slots remaining on your Family Plan</div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setInviteOpen(false)} className="btn-sm">Cancel</button>
              <button onClick={()=>setInviteOpen(false)} className="btn-sm btn-warm">Send invite</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Identity Document Modal (Edit & Add) ── */}
      {docModal && (() => {
        const {mode, type, data} = docModal;
        const isEdit = mode === "edit";
        const fieldStyle = {...fldInp};
        const labelStyle = fldLbl;
        const Field = ({label, placeholder, value}) => (
          <div style={{marginBottom:12}}>
            <div style={labelStyle}>{label}</div>
            <input defaultValue={value||""} placeholder={placeholder||""} style={fieldStyle}/>
          </div>
        );
        const DateField = ({label, value, optional}) => (
          <div style={{marginBottom:12}}>
            <div style={labelStyle}>{label}{optional?" (optional)":""}</div>
            <input type="date" defaultValue={toDateInput(value)} style={{...fieldStyle, colorScheme:"dark"}}/>
          </div>
        );
        const fileName = docFile instanceof File ? docFile.name : docFile;
        const FileField = ({optional}) => (
          <div style={{marginBottom:12}}>
            <div style={labelStyle}>Document scan{optional?" (optional)":""}</div>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:"none"}}
              onChange={e=>{ if(e.target.files[0]) setDocFile(e.target.files[0]); }}/>
            {fileName
              ? <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface,fontSize:12.5,color:T.textS}}>
                  <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📎 {fileName}</span>
                  <span onClick={()=>{ setDocFile(null); if(fileInputRef.current) fileInputRef.current.value=""; }}
                    style={{color:T.rose,cursor:"pointer",fontWeight:600,flexShrink:0}}>Remove</span>
                </div>
              : <button onClick={()=>fileInputRef.current&&fileInputRef.current.click()}
                  style={{width:"100%",padding:"9px 11px",borderRadius:9,border:`1px dashed ${T.border}`,background:T.surface,color:T.textS,fontSize:12.5,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                  📎 Upload file…
                </button>
            }
          </div>
        );
        const titles = {passport:"Passport",licence:"Driving Licence",ni:"National Insurance",brp:"BRP",ghic:"GHIC",oci:"OCI Card",other:"Document"};
        const subtitles = {
          passport:"Update your passport details. Your data is stored securely and never shared.",
          licence:"Update your driving licence details.",
          ni:"Your NI number is used for tax and benefits. It does not expire.",
          brp:"Biometric Residence Permit — for non-UK nationals with permission to stay.",
          ghic:"Global Health Insurance Card — covers healthcare costs in EU countries.",
          oci:"Overseas Citizen of India card. This card does not expire, but must be re-endorsed when you renew your passport.",
          other:"Add any other identity or travel document.",
        };
        const body = {
          passport: <><Field label="Country of issue" value={data.country} placeholder="e.g. United Kingdom"/><Field label="Passport number" value={data.number} placeholder="e.g. 123456789"/><DateField label="Expiry date" value={data.expiry}/><FileField/></>,
          licence:  <><Field label="Country of issue" value={data.country} placeholder="e.g. United Kingdom"/><Field label="Licence number" value={data.number} placeholder="e.g. SMITH701054J99AB"/><DateField label="Expiry date" value={data.expiry}/><Field label="Licence categories" value={data.categories} placeholder="e.g. B, BE"/><FileField/></>,
          ni:       <><Field label="NI number" value={data.number} placeholder="e.g. AB 12 34 56 C"/></>,
          brp:      <><Field label="BRP number" value={data.number} placeholder="e.g. ZU1234567"/><DateField label="Expiry date" value={data.expiry}/><FileField optional/></>,
          ghic:     <><Field label="Card number" value={data.number} placeholder="e.g. 1234567890"/><DateField label="Expiry date" value={data.expiry}/><FileField optional/></>,
          oci:      <><Field label="OCI number" value={data.number} placeholder="e.g. J1234567"/><FileField optional/></>,
          other:    <><Field label="Document name" value={data.name} placeholder="e.g. Voter Authority Certificate"/><Field label="Reference number" value={data.number} placeholder="Optional"/><DateField label="Expiry date" optional/><FileField optional/></>,
        };
        return (
          <div onClick={closeDocModal} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,borderRadius:16,padding:24,width:"100%",maxWidth:420,display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700}}>{isEdit?"Edit ":""}{titles[type]||"Document"}</div>
                <button onClick={closeDocModal} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:4}}>✕</button>
              </div>
              <div style={{fontSize:12,color:T.textS,marginBottom:16,lineHeight:1.6}}>{subtitles[type]}</div>
              {body[type]}
              <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
                <button onClick={closeDocModal} className="btn-sm">Cancel</button>
                <button onClick={closeDocModal} className="btn-sm btn-warm">{isEdit?"Save":"Add document"}</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Manage Member Modal ── */}
      {/* ── Remove Member Confirmation Modal ── */}
      {removeTarget && (
        <div onClick={()=>setRemoveTarget(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.card,borderRadius:16,padding:24,width:"100%",maxWidth:400,boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700}}>Remove member?</div>
              <button onClick={()=>setRemoveTarget(null)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:4}}>✕</button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,padding:"10px 12px",borderRadius:10,background:T.card2}}>
              <AvatarAC m={removeTarget} size={40}/>
              <div>
                <div style={{fontSize:15,fontWeight:700}}>{removeTarget.name}</div>
                <div style={{fontSize:12,color:T.textS}}>{ROLE_FULL_AC[removeTarget.role]}{removeTarget.age ? ` · ${removeTarget.age} yrs` : ""}</div>
              </div>
            </div>
            <div style={{fontSize:12.5,color:T.textS,lineHeight:1.6,marginBottom:16}}>
              Removing <strong style={{color:T.text}}>{removeTarget.name}</strong> will:
              <ul style={{margin:"8px 0 0 16px",padding:0}}>
                <li>Revoke their access to MyPal immediately</li>
                <li>Remove them from any shared tasks and household items</li>
                <li>Delete their private data after 30 days</li>
              </ul>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn-sm" style={{flex:1}} onClick={()=>setRemoveTarget(null)}>Cancel</button>
              <button
                style={{flex:1,padding:"8px",borderRadius:9,border:"none",background:T.rose,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}
                onClick={()=>{ setRemovedIds(ids=>[...ids,removeTarget.id]); setRemoveTarget(null); }}
              >Remove {removeTarget.name}</button>
            </div>
          </div>
        </div>
      )}

      {manageMember && (
        <div onClick={()=>setManageMember(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.card,borderRadius:16,padding:24,width:"100%",maxWidth:420,display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700}}>Manage Member</div>
              <button onClick={()=>setManageMember(null)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:4}}>✕</button>
            </div>
            {/* Member identity */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,padding:"10px 12px",borderRadius:10,background:T.card2}}>
              <AvatarAC m={manageMember} size={40}/>
              <div>
                <div style={{fontSize:15,fontWeight:700}}>{manageMember.name}</div>
                <div style={{fontSize:12,color:T.textS}}>{ROLE_FULL_AC[manageMember.role]}{manageMember.age ? ` · ${manageMember.age} yrs` : ""}</div>
              </div>
            </div>
            {/* Actions */}
            {[
              {label:"Change role",       icon:"🔄", desc:"Adjust what this member can see and do"},
              {label:"Reset access PIN",  icon:"🔑", desc:"Send a new PIN to their email"},
              {label:"Edit profile",      icon:"✏️", desc:"Update name, photo, date of birth"},
              {label:"Transfer ownership",icon:"👑", desc:"Make this member the Household Manager"},
            ].map((a,i)=>(
              <div key={i} className="row" style={{cursor:"pointer"}} onClick={()=>setManageMember(null)}>
                <span style={{fontSize:18,width:28,textAlign:"center"}}>{a.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{a.label}</div>
                  <div style={{fontSize:11.5,color:T.textS}}>{a.desc}</div>
                </div>
                <span style={{color:T.textS,fontSize:12}}>›</span>
              </div>
            ))}
            <div style={{borderTop:`1px solid ${T.border}`,marginTop:8,paddingTop:12}}>
              <button style={{width:"100%",padding:"9px",borderRadius:9,border:`1px solid ${T.rose}55`,background:"transparent",color:T.rose,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                🗑️ Remove from household
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Hobby Modal ── */}
      {addHobbyOpen && (
        <div onClick={()=>setAddHobbyOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(3px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.card,borderRadius:16,padding:24,width:"100%",maxWidth:420,maxHeight:"80vh",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,0.55)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700}}>Add Interests</div>
              <button onClick={()=>setAddHobbyOpen(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.textS,lineHeight:1,padding:4}}>✕</button>
            </div>
            <div style={{fontSize:12,color:T.textS,marginBottom:14}}>Tap an interest to add it to your profile.</div>
            {availableInts.length === 0 ? (
              <div style={{fontSize:13,color:T.textS,textAlign:"center",padding:"24px 0"}}>You've added all available interests!</div>
            ) : (
              <div style={{overflowY:"auto",flex:1}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {availableInts.map(t=>(
                    <div key={t}
                      className="int-tag"
                      onClick={()=>{ toggleInt(t); }}
                      style={{fontSize:12,padding:"6px 13px",cursor:"pointer"}}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={()=>setAddHobbyOpen(false)} className="btn-sm btn-warm" style={{marginTop:18,alignSelf:"flex-end",padding:"8px 20px"}}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── FINANCE ─────────────────────────────────────────────── */
function FinanceScreen({member="family"}) {
  const [htab, setHtab] = useState("Overview");  // module tab

  /* ── Top-level month/year viewer ───────────────────────────────
     Both Household and My Finances views read finMonth/finYear so the
     user can browse past data with a single picker. */
  const FIN_MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const FIN_MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [finMonth, setFinMonth] = useState(4); // May
  const [finYear,  setFinYear]  = useState(2026);
  const [pickerOpen, setPickerOpen] = useState(false);
  const shiftFinMonth = (d) => {
    let m = finMonth + d, y = finYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setFinMonth(m); setFinYear(y);
  };
  const isCurrentMonth = finMonth === 4 && finYear === 2026; // demo "today" = May 2026
  const finMonthLabel  = `${FIN_MONTHS_SHORT[finMonth]} ${finYear}`;
  const finMonthLong   = `${FIN_MONTHS_FULL[finMonth]} ${finYear}`;

  const MonthPicker = () => (
    <div style={{position:"relative",display:"flex",alignItems:"center",gap:4}}>
      <button onClick={()=>shiftFinMonth(-1)} title="Previous month"
        style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.border}`,background:T.surface,color:T.text,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>‹</button>

      <button onClick={()=>setPickerOpen(v=>!v)} title="Jump to month"
        style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,border:`1px solid ${pickerOpen?T.warm:T.border}`,background:pickerOpen?T.warmS:T.surface,color:T.text,cursor:"pointer",fontSize:13,fontWeight:600,minWidth:128,justifyContent:"center",fontFamily:"inherit"}}>
        <span>📅</span>
        <span>{finMonthLong}</span>
        <span style={{fontSize:9,color:T.textS}}>▾</span>
      </button>

      <button onClick={()=>shiftFinMonth(1)}
        disabled={isCurrentMonth}
        title={isCurrentMonth ? "Already at the latest month" : "Next month"}
        style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.border}`,background:T.surface,color:isCurrentMonth?T.textM:T.text,cursor:isCurrentMonth?"not-allowed":"pointer",opacity:isCurrentMonth?0.45:1,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>›</button>

      {!isCurrentMonth && (
        <button onClick={()=>{setFinMonth(4);setFinYear(2026);}}
          style={{fontSize:11,color:T.warm,background:"none",border:"none",cursor:"pointer",padding:"0 6px",fontFamily:"inherit"}}>
          Today
        </button>
      )}

      {/* Year + month dropdown */}
      {pickerOpen && (
        <>
          <div onClick={()=>setPickerOpen(false)}
            style={{position:"fixed",inset:0,zIndex:50}}/>
          <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,zIndex:51,background:T.surface,border:`1px solid ${T.borderHi}`,borderRadius:12,padding:14,boxShadow:"0 12px 32px rgba(0,0,0,0.18)",minWidth:280}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <button onClick={()=>setFinYear(y=>y-1)}
                style={{width:24,height:24,borderRadius:6,border:`1px solid ${T.border}`,background:T.surface,color:T.text,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>‹</button>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>{finYear}</div>
              <button onClick={()=>setFinYear(y=>y+1)}
                disabled={finYear>=2026}
                style={{width:24,height:24,borderRadius:6,border:`1px solid ${T.border}`,background:T.surface,color:finYear>=2026?T.textM:T.text,cursor:finYear>=2026?"not-allowed":"pointer",opacity:finYear>=2026?0.45:1,fontSize:11,fontFamily:"inherit"}}>›</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
              {FIN_MONTHS_SHORT.map((m,i)=>{
                const isFuture = finYear === 2026 && i > 4;
                const isPicked = finMonth === i;
                return (
                  <button key={m}
                    disabled={isFuture}
                    onClick={()=>{setFinMonth(i);setPickerOpen(false);}}
                    style={{padding:"8px 4px",borderRadius:8,border:isPicked?`1px solid ${T.warm}`:`1px solid ${T.border}`,background:isPicked?T.warmS:T.surface,color:isFuture?T.textM:isPicked?T.warm:T.text,fontSize:12,fontWeight:isPicked?700:500,cursor:isFuture?"not-allowed":"pointer",opacity:isFuture?0.4:1,fontFamily:"inherit",transition:"all .1s"}}>
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );


  /* ── Bills & Subs state (moved from LifeAdminScreen) ── */
  const [billsSec, setBillsSec] = useState("household");
  const [billsData, setBillsData] = useState(BILLS_DATA_INIT);
  const [subsData,  setSubsData]  = useState(SUBS_DATA_INIT);

  /* ── Bills & Subs helpers ── */
  const parsePounds = s => parseFloat((s||"0").replace(/[^0-9.]/g,""))||0;
  const dueCls = dateStr => {
    const today = new Date(); today.setHours(0,0,0,0);
    const parts = dateStr.split("-");
    const due = new Date(`${parts[2]}-${{"Jan":"01","Feb":"02","Mar":"03","Apr":"04","May":"05","Jun":"06","Jul":"07","Aug":"08","Sep":"09","Oct":"10","Nov":"11","Dec":"12"}[parts[1]]}-${parts[0]}`);
    const diff = (due - today) / 86400000;
    if (diff < 0) return T.rose;
    if (diff <= 7) return T.amber;
    return T.textS;
  };
  const nextMonthStr = () => {
    const d = new Date(); d.setMonth(d.getMonth()+1);
    return `${String(d.getDate()).padStart(2,"0")}-${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]}-${d.getFullYear()}`;
  };
  const todayStr = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,"0")}-${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]}-${d.getFullYear()}`;
  };
  const toggleBillPaid = (s2,idx) => setBillsData(prev => ({...prev, [s2]: prev[s2].map((b,i)=>i===idx?{...b,paid:!b.paid,lastPaid:!b.paid?todayStr():b.lastPaid}:b)}));
  const removeBill     = (s2,idx) => setBillsData(prev => ({...prev, [s2]: prev[s2].filter((_,i)=>i!==idx)}));
  const toggleSubPaid  = (s2,idx) => setSubsData(prev  => ({...prev, [s2]: prev[s2].map((s,i)=>i===idx?{...s,paid:!s.paid,lastPaid:!s.paid?todayStr():s.lastPaid}:s)}));
  const removeSub      = (s2,idx) => setSubsData(prev  => ({...prev, [s2]: prev[s2].filter((_,i)=>i!==idx)}));
  const [newBillName, setNewBillName] = useState("");
  const [newSubName,  setNewSubName]  = useState("");
  const addBill = () => {
    if (!newBillName.trim()) return;
    setBillsData(prev => ({...prev, [billsSec]: [...prev[billsSec], {ic:"📄",n:newBillName.trim(),nextDue:nextMonthStr(),amount:"£0.00",lastPaid:todayStr(),lastUsed:todayStr(),paid:false,vis:billsSec}]}));
    setNewBillName("");
  };
  const addSub = () => {
    if (!newSubName.trim()) return;
    setSubsData(prev => ({...prev, [billsSec]: [...prev[billsSec], {ic:"🔄",n:newSubName.trim(),nextDue:nextMonthStr(),amount:"£0.00",lastPaid:todayStr(),paid:false,vis:billsSec}]}));
    setNewSubName("");
  };

  /* ── Shared style tokens ── */
  const fldLbl = {
    display:"block", fontSize:11, fontWeight:600, color:T.textS,
    marginBottom:4, marginTop:14, letterSpacing:".04em", textTransform:"uppercase"
  };
  const fldInp = {
    width:"100%", padding:"8px 11px", borderRadius:8,
    border:`1px solid ${T.border}`, background:T.surface, color:T.text,
    fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box"
  };
  const modalShell = {
    position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
    zIndex:201, width:"min(460px,94vw)", maxHeight:"88vh", overflowY:"auto",
    background:T.surface, border:`1px solid ${T.borderHi}`, borderRadius:18,
    padding:24, boxShadow:"0 24px 60px rgba(0,0,0,0.22)"
  };
  const rowBase = {
    display:"flex", alignItems:"center", gap:10, padding:"8px 14px",
    borderBottom:`1px solid ${T.border}`, cursor:"pointer", transition:"background .12s"
  };

  /* ── SectionTabs (pill toggle) ── */
  const SectionTabs = ({sv,setV,labels}) => (
    <div style={{display:"flex",gap:4,marginBottom:16,background:T.card2,borderRadius:10,padding:3}}>
      {labels.map(([val,lbl])=>(
        <div key={val} onClick={()=>setV(val)} style={{flex:1,textAlign:"center",padding:"6px 12px",borderRadius:8,fontSize:12.5,fontWeight:600,cursor:"pointer",
          background:sv===val?T.surface:"transparent",color:sv===val?T.warm:T.textS,
          border:sv===val?`1px solid ${T.border}`:"1px solid transparent",transition:"all .15s"}}>{lbl}</div>
      ))}
    </div>
  );

  /* ── Household sub-tab content ── */
  const HOverview = () => {
    const ENVELOPES = [
      {ic:"🛒",lbl:"Groceries",    spent:312,budget:400,c:T.sage},
      {ic:"🍽️",lbl:"Eating Out",   spent:183,budget:200,c:T.amber},
      {ic:"🎭",lbl:"Entertainment", spent:167,budget:150,c:T.rose},
      {ic:"🚗",lbl:"Transport",    spent:134,budget:200,c:T.sage},
    ];
    return (
      <div>
        {/* 4-stat strip */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          {[
            {lbl:"Monthly income", val:"£4,200"},
            {lbl:"Total spent",    val:"£2,847", c:T.amber},
            {lbl:`Budget · ${FIN_MONTHS_SHORT[finMonth]}`,val:"£3,500"},
            {lbl:"Remaining",      val:"£653",   c:T.sage},
          ].map((s,i)=>(
            <div key={i} className="stat-box">
              <div className="stat-num" style={{color:s.c||T.text}}>{s.val}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
        {/* Budget progress bar */}
        <div className="card" style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:12,color:T.textS}}>Monthly budget used</span>
            <span style={{fontSize:12,fontWeight:600,color:T.amber}}>81% · 11 days left</span>
          </div>
          <div className="pbar" style={{height:6}}><div className="pfill" style={{width:"81%",background:T.amber}}/></div>
        </div>
        {/* g2 split */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:12}}>
          <div className="card" style={{marginBottom:0}}>
            <div className="card-title">📊 Budget envelopes</div>
            {ENVELOPES.map((e,i)=>{
              const pct = Math.min(100,Math.round(e.spent/e.budget*100));
              return (
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                    <span>{e.ic} {e.lbl}</span>
                    <span style={{color:pct>=100?T.rose:pct>=85?T.amber:T.textS}}>£{e.spent} / £{e.budget}</span>
                  </div>
                  <div className="pbar"><div className="pfill" style={{width:pct+"%",background:e.c}}/></div>
                </div>
              );
            })}
            <button className="btn-sm" style={{width:"100%",marginTop:4,fontSize:11}} onClick={()=>setHtab("Budget Envelopes")}>View all envelopes →</button>
          </div>
          <div className="card" style={{marginBottom:0}}>
            <div className="card-title">🧾 Recent transactions</div>
            {(() => {
              const RECENT_COLS = "18px minmax(0,1fr) 64px 72px 56px";
              const recent = [
                {ic:"🛒",n:"Tesco Metro",     who:"James",     amt:"47.20",d:"21 May",pos:false},
                {ic:"🚂",n:"TfL Contactless", who:"James",     amt:"5.40", d:"20 May",pos:false},
                {ic:"💰",n:"Salary — James",  who:"Household", amt:"2,800",d:"19 May",pos:true},
                {ic:"🍽️",n:"Dishoom",         who:"Sarah",     amt:"68.00",d:"18 May",pos:false},
                {ic:"☕",n:"Pret a Manger",   who:"James",     amt:"6.50", d:"21 May",pos:false},
                {ic:"🛒",n:"Waitrose",        who:"Sarah",     amt:"63.40",d:"17 May",pos:false},
              ];
              return (
                <>
                  {/* Column header */}
                  <div style={{
                    display:"grid",gridTemplateColumns:RECENT_COLS,columnGap:8,alignItems:"center",
                    padding:"4px 4px 6px",borderBottom:`1px solid ${T.border}`,
                    fontSize:9,color:T.textM,letterSpacing:".08em",textTransform:"uppercase",fontWeight:600
                  }}>
                    <span></span>
                    <span>Description</span>
                    <span>Who</span>
                    <span style={{textAlign:"right"}}>Amount</span>
                    <span style={{textAlign:"right"}}>Date</span>
                  </div>
                  {recent.map((tx,i)=>(
                    <div key={i} style={{
                      display:"grid",gridTemplateColumns:RECENT_COLS,columnGap:8,alignItems:"center",
                      padding:"6px 4px",
                      borderBottom: i===recent.length-1 ? "none" : `1px solid ${T.border}`,
                      fontSize:12.5
                    }}>
                      <span style={{fontSize:13,lineHeight:1}}>{tx.ic}</span>
                      <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tx.n}</span>
                      <span style={{color:T.textS,fontSize:11.5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tx.who}</span>
                      <span style={{textAlign:"right",fontWeight:600,color:tx.pos?T.sage:T.rose,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>
                        {tx.pos?"+":"−"}£{tx.amt}
                      </span>
                      <span style={{textAlign:"right",fontSize:11,color:T.textS,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>
                        {tx.d}
                      </span>
                    </div>
                  ))}
                </>
              );
            })()}
            <button className="btn-sm btn-warm" style={{width:"100%",marginTop:10,fontSize:11}} onClick={()=>setHtab("Transactions")}>View all + log transaction →</button>
          </div>
        </div>
        {/* AI banner */}
        <div className="ai-banner">
          <div style={{fontSize:22,flexShrink:0}}>🤖</div>
          <div style={{flex:1}}>
            <div className="ai-name">MyPal Finance</div>
            <div className="ai-text">You're on track this month, but Eating Out is 91% of budget with 11 days left. At current pace you'll overspend by ~£40. Want me to suggest where to trim?</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7,flexShrink:0}}>
            <button className="btn-sm btn-warm">Show me →</button>
            <button className="btn-sm">Dismiss</button>
          </div>
        </div>
      </div>
    );
  };

  const HBudgetEnvelopes = () => {
    const ENVELOPES = [
      {ic:"🛒",n:"Groceries",       spent:312,budget:400},
      {ic:"🚗",n:"Transport",       spent:134,budget:200},
      {ic:"🍽️",n:"Eating Out",      spent:183,budget:200,note:true},
      {ic:"🎭",n:"Entertainment",   spent:167,budget:150,note:true},
      {ic:"👗",n:"Clothing",        spent:45, budget:100},
      {ic:"🧒",n:"Kids' Activities",spent:120,budget:150},
      {ic:"✈️",n:"Holidays",        spent:0,  budget:300},
      {ic:"📦",n:"Miscellaneous",   spent:89, budget:150},
    ];
    const envColor = pct => pct>=100?T.rose:pct>=85?T.amber:T.sage;
    const envBadge = pct => pct>=100?{txt:"Over budget",bg:T.roseS,c:T.rose}:pct>=85?{txt:"Near limit",bg:T.amberS,c:T.amber}:{txt:"On track",bg:T.sageS,c:T.sage};
    return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
          {[
            {val:"£1,650",lbl:"Total budgeted"},
            {val:"£1,050",lbl:"Total spent",  c:T.amber},
            {val:"£600",  lbl:"Remaining",    c:T.sage},
          ].map((s,i)=>(
            <div key={i} className="stat-box">
              <div className="stat-num" style={{color:s.c||T.text}}>{s.val}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">📊 All envelopes · {finMonthLong}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
            {ENVELOPES.map((e,i)=>{
              const pct = Math.min(100,Math.round(e.spent/e.budget*100));
              const b = envBadge(pct);
              return (
                <div key={i} className="env-card">
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                    <div className="env-icon" style={{background:envColor(pct)+"22"}}>{e.ic}</div>
                    <div style={{flex:1,fontSize:12.5,fontWeight:500}}>{e.n}</div>
                    <span style={{fontSize:10.5,fontWeight:600,padding:"2px 8px",borderRadius:8,background:b.bg,color:b.c}}>{b.txt}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:4}}>
                    <span style={{fontWeight:500,color:pct>=100?T.rose:T.text}}>£{e.spent}</span>
                    <span style={{color:T.textS}}>of £{e.budget}</span>
                  </div>
                  <div className="pbar"><div className="pfill" style={{width:pct+"%",background:envColor(pct)}}/></div>
                  {e.note && <div style={{fontSize:10,color:T.textS,marginTop:5}}>Includes Bills &amp; Subs auto-contribution</div>}
                </div>
              );
            })}
          </div>
          <div className="qrow">
            <select style={{flex:2}} defaultValue="">
              <option value="" disabled>Select envelope…</option>
              <optgroup label="Everyday">
                <option>🛒 Groceries</option>
                <option>🚗 Transport</option>
                <option>🍽️ Eating Out</option>
                <option>☕ Coffee & Snacks</option>
              </optgroup>
              <optgroup label="Home & Family">
                <option>🏠 Home Maintenance</option>
                <option>🧒 Kids' Activities</option>
                <option>🎓 Education</option>
                <option>🐕 Pet Care</option>
              </optgroup>
              <optgroup label="Lifestyle">
                <option>🎭 Entertainment</option>
                <option>👗 Clothing</option>
                <option>✈️ Holidays</option>
                <option>🎁 Gifts</option>
                <option>💪 Fitness</option>
                <option>💄 Personal Care</option>
              </optgroup>
              <optgroup label="Health & Other">
                <option>🏥 Health</option>
                <option>📱 Subscriptions</option>
                <option>💼 Professional</option>
                <option>📦 Miscellaneous</option>
              </optgroup>
            </select>
            <input placeholder="£ budget" style={{flex:1}}/>
            <button className="btn-sm btn-warm">+ Add</button>
          </div>
        </div>
      </div>
    );
  };

  const HTransactions = () => {
    // Contribution types — what kind of money movement this is.
    //   famSpend  family spend (counts against household envelopes)
    //   perSpend  personal spend (private to the logger)
    //   famPot    family pot contribution (money going INTO the household pot)
    //   income    salary / external income
    const CONTRIB = {
      famSpend: { label: "Family spend",   bg: T.warmS,   c: T.warm   },
      perSpend: { label: "Personal spend", bg: T.violetS, c: T.violet },
      famPot:   { label: "Family pot ↑",   bg: T.tealS,   c: T.teal   },
      income:   { label: "Income",         bg: T.sageS,   c: T.sage   },
    };
    const [txs, setTxs] = useState([
      {ic:"🛒",n:"Tesco Metro",      cat:"Groceries",     who:"James", amt:47.20, d:"21 May", t:"14:32", neg:true,  contrib:"famSpend"},
      {ic:"☕",n:"Pret a Manger",    cat:"Eating out",    who:"James", amt:6.50,  d:"21 May", t:"08:14", neg:true,  contrib:"perSpend"},
      {ic:"💰",n:"Pot top-up",       cat:"Transfer",      who:"James", amt:300.00,d:"21 May", t:"07:02", neg:true,  contrib:"famPot"},
      {ic:"🚂",n:"TfL Contactless",  cat:"Transport",     who:"James", amt:5.40,  d:"20 May", t:"18:47", neg:true,  contrib:"perSpend"},
      {ic:"💰",n:"Salary — James",   cat:"Income",        who:"James", amt:2800,  d:"19 May", t:"09:00", neg:false, contrib:"income"},
      {ic:"🍽️",n:"Dishoom",          cat:"Eating out",    who:"Sarah", amt:68.00, d:"18 May", t:"20:18", neg:true,  contrib:"famSpend"},
      {ic:"💰",n:"Salary — Sarah",   cat:"Income",        who:"Sarah", amt:1700,  d:"18 May", t:"09:00", neg:false, contrib:"income"},
      {ic:"🛒",n:"Waitrose",         cat:"Groceries",     who:"Sarah", amt:63.40, d:"17 May", t:"11:24", neg:true,  contrib:"famSpend"},
      {ic:"🎭",n:"Vue Cinema",       cat:"Entertainment", who:"James", amt:36.00, d:"16 May", t:"19:45", neg:true,  contrib:"famSpend"},
      {ic:"💰",n:"Pot top-up",       cat:"Transfer",      who:"Sarah", amt:200.00,d:"15 May", t:"08:10", neg:true,  contrib:"famPot"},
      {ic:"⛽",n:"Shell forecourt",  cat:"Transport",     who:"James", amt:62.30, d:"14 May", t:"17:55", neg:true,  contrib:"famSpend"},
      {ic:"👕",n:"Uniqlo",           cat:"Clothing",      who:"Sarah", amt:48.00, d:"13 May", t:"13:21", neg:true,  contrib:"perSpend"},
    ]);
    const remove = (i) => setTxs(prev => prev.filter((_, idx) => idx !== i));
    const COLS = "20px minmax(0,1.6fr) 110px 70px 130px 92px 96px 22px";

    // Catalog of dropdowns
    const CATS  = ["Groceries","Transport","Eating out","Entertainment","Clothing","Kids' Activities","Holidays","Subscriptions","Health","Transfer","Income","Other"];
    const CAT_ICONS = {
      "Groceries":"🛒","Transport":"🚂","Eating out":"🍽️","Entertainment":"🎭",
      "Clothing":"👕","Kids' Activities":"🧒","Holidays":"✈️","Subscriptions":"📱",
      "Health":"🏥","Transfer":"💰","Income":"💰","Other":"📦"
    };
    const WHO   = ["James","Sarah","Lily","Tom","Household"];
    const CONTRIB_OPTS = [
      ["famSpend","Family spend"],
      ["perSpend","Personal spend"],
      ["famPot",  "Family pot ↑"],
      ["income",  "Income"],
    ];

    // "21 May" ⇄ ISO date for the date picker
    const MO_TO_NUM = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
    const SHORT_MO  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const txParseDMY = (s) => {
      const m = (s||"").match(/^(\d{1,2})\s+(\w{3})$/);
      if (!m) return "";
      return `${finYear}-${String((MO_TO_NUM[m[2]]??0)+1).padStart(2,"0")}-${String(m[1]).padStart(2,"0")}`;
    };
    const txFmtDMY = (iso) => {
      if (!iso) return "";
      const [_, mm, dd] = iso.split("-");
      return `${parseInt(dd,10)} ${SHORT_MO[parseInt(mm,10)-1]}`;
    };

    // Modal state
    const [editing, setEditing] = useState(null);
    const openEdit = (i) => {
      const tx = txs[i];
      setEditing({
        index: i,
        ic: tx.ic, n: tx.n, cat: tx.cat, who: tx.who,
        contrib: tx.contrib,
        amt: String(tx.amt),
        date: txParseDMY(tx.d),
        time: tx.t || "12:00",
      });
    };
    const closeEdit = () => setEditing(null);
    const saveEdit = () => {
      if (!editing) return;
      const amtNum = parseFloat(editing.amt);
      if (!editing.n.trim() || isNaN(amtNum) || amtNum < 0) return;
      const updated = {
        ic: editing.ic || CAT_ICONS[editing.cat] || "📦",
        n: editing.n.trim(),
        cat: editing.cat,
        who: editing.who,
        contrib: editing.contrib,
        amt: amtNum,
        d: txFmtDMY(editing.date) || txs[editing.index].d,
        t: editing.time || txs[editing.index].t,
        neg: editing.contrib !== "income",
      };
      setTxs(prev => prev.map((x, idx) => idx === editing.index ? updated : x));
      setEditing(null);
    };

    return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
          {[
            {val:"£4,500",lbl:`Income · ${FIN_MONTHS_SHORT[finMonth]}`, c:T.sage},
            {val:"£2,847",lbl:`Spent · ${FIN_MONTHS_SHORT[finMonth]}`,  c:T.rose},
            {val:"£1,653",lbl:`Net · ${FIN_MONTHS_SHORT[finMonth]}`,    c:T.sage},
          ].map((s,i)=>(
            <div key={i} className="stat-box">
              <div className="stat-num" style={{color:s.c||T.text}}>{s.val}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
            <div className="card-title" style={{marginBottom:0}}>🧾 {finMonthLong}</div>
            <div style={{fontSize:10.5,color:T.textS,letterSpacing:".06em",textTransform:"uppercase"}}>{txs.length} entries</div>
          </div>

          {/* Column header */}
          <div style={{
            display:"grid",gridTemplateColumns:COLS,columnGap:10,alignItems:"center",
            padding:"6px 6px 8px",borderBottom:`1px solid ${T.border}`,
            fontSize:9.5,color:T.textM,letterSpacing:".08em",textTransform:"uppercase",fontWeight:600
          }}>
            <span></span>
            <span>Description</span>
            <span>Type</span>
            <span>Who</span>
            <span>Contribution</span>
            <span style={{textAlign:"right"}}>Amount</span>
            <span style={{textAlign:"right"}}>When</span>
            <span></span>
          </div>

          {/* Rows */}
          {txs.map((tx,i)=>{
            const cb = CONTRIB[tx.contrib];
            const amtStr = tx.amt>=1000
              ? tx.amt.toLocaleString("en-GB",{minimumFractionDigits:2,maximumFractionDigits:2})
              : tx.amt.toFixed(2);
            return (
              <div key={i}
                onClick={()=>openEdit(i)}
                title="Click to edit"
                style={{
                  display:"grid",gridTemplateColumns:COLS,columnGap:10,alignItems:"center",
                  padding:"7px 6px",
                  borderBottom: i===txs.length-1 ? "none" : `1px solid ${T.border}`,
                  fontSize:12.5,
                  cursor:"pointer",
                  transition:"background .1s",
                }}
                onMouseEnter={e=>e.currentTarget.style.background=T.warmG||T.card2}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span style={{fontSize:14,lineHeight:1}}>{tx.ic}</span>
                <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tx.n}</span>
                <span style={{color:T.textS,fontSize:11.5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tx.cat}</span>
                <span style={{color:T.textS,fontSize:11.5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tx.who}</span>
                <span>
                  <span style={{
                    display:"inline-block",fontSize:10.5,fontWeight:600,
                    padding:"2px 8px",borderRadius:6,background:cb.bg,color:cb.c,
                    whiteSpace:"nowrap"
                  }}>{cb.label}</span>
                </span>
                <span style={{textAlign:"right",fontWeight:600,color:tx.neg?T.rose:T.sage,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>
                  {tx.neg?"−":"+"}£{amtStr}
                </span>
                <span style={{textAlign:"right",fontSize:11,color:T.textS,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>
                  {tx.d}<span style={{color:T.textM}}>{` · ${tx.t}`}</span>
                </span>
                <button
                  onClick={e=>{e.stopPropagation();remove(i);}}
                  title="Remove transaction"
                  style={{
                    width:22,height:22,borderRadius:6,border:"1px solid transparent",
                    background:"transparent",color:T.textM,cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:14,lineHeight:1,padding:0,transition:"all .12s"
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.background=T.roseS;e.currentTarget.style.color=T.rose;e.currentTarget.style.borderColor=T.rose+"55";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textM;e.currentTarget.style.borderColor="transparent";}}>
                  ×
                </button>
              </div>
            );
          })}

          {/* Quick-log */}
          <div className="qrow" style={{marginTop:10}}>
            <input placeholder="Description…" style={{flex:2}}/>
            <input placeholder="£0.00" style={{flex:0.8}}/>
            <select style={{flex:1.2}}>
              {CATS.filter(c=>c!=="Transfer"&&c!=="Income"&&c!=="Other").map(c=><option key={c}>{c}</option>)}
            </select>
            <select style={{flex:1.2}}>
              {CONTRIB_OPTS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
            <button className="btn-sm btn-warm" style={{flexShrink:0}}>+ Log</button>
          </div>
        </div>

        {/* Edit modal */}
        {editing && (
          <>
            <div onClick={closeEdit}
              style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,backdropFilter:"blur(3px)"}}/>
            <div style={{...modalShell, width:"min(540px,94vw)", maxHeight:"90vh"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <div style={{fontSize:15,fontWeight:700,color:T.text,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>{editing.ic}</span>
                  Edit transaction
                </div>
                <div onClick={closeEdit} title="Close" style={{cursor:"pointer",color:T.textS,fontSize:18,lineHeight:1,padding:"4px 8px",borderRadius:6,background:T.card2}}>✕</div>
              </div>

              <label style={fldLbl}>Description</label>
              <input value={editing.n} autoFocus
                onChange={e=>setEditing(p=>({...p,n:e.target.value}))}
                onKeyDown={e=>{if(e.key==="Enter")saveEdit();if(e.key==="Escape")closeEdit();}}
                placeholder="What was the transaction for?"
                style={fldInp}/>

              <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:12}}>
                <div>
                  <label style={fldLbl}>Category</label>
                  <div style={{position:"relative"}}>
                    <select value={editing.cat}
                      onChange={e=>setEditing(p=>({...p,cat:e.target.value,ic:CAT_ICONS[e.target.value]||p.ic}))}
                      style={{...fldInp,paddingRight:28}}>
                      {CATS.map(c=><option key={c}>{c}</option>)}
                    </select>
                    <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Who</label>
                  <div style={{position:"relative"}}>
                    <select value={editing.who}
                      onChange={e=>setEditing(p=>({...p,who:e.target.value}))}
                      style={{...fldInp,paddingRight:28}}>
                      {WHO.map(w=><option key={w}>{w}</option>)}
                    </select>
                    <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                  </div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:12}}>
                <div>
                  <label style={fldLbl}>Contribution type</label>
                  <div style={{position:"relative"}}>
                    <select value={editing.contrib}
                      onChange={e=>setEditing(p=>({...p,contrib:e.target.value}))}
                      style={{...fldInp,paddingRight:28}}>
                      {CONTRIB_OPTS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                    <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Amount</label>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,color:T.textS,pointerEvents:"none"}}>£</span>
                    <input type="number" min="0" step="0.01" value={editing.amt}
                      onChange={e=>setEditing(p=>({...p,amt:e.target.value}))}
                      onKeyDown={e=>{if(e.key==="Enter")saveEdit();if(e.key==="Escape")closeEdit();}}
                      style={{...fldInp,paddingLeft:22,fontVariantNumeric:"tabular-nums"}}/>
                  </div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 0.7fr",gap:12}}>
                <div>
                  <label style={fldLbl}>Date</label>
                  <input type="date" value={editing.date||""}
                    onChange={e=>setEditing(p=>({...p,date:e.target.value}))}
                    style={fldInp}/>
                </div>
                <div>
                  <label style={fldLbl}>Time</label>
                  <input type="time" value={editing.time||""}
                    onChange={e=>setEditing(p=>({...p,time:e.target.value}))}
                    style={fldInp}/>
                </div>
                <div>
                  <label style={fldLbl}>Icon</label>
                  <input value={editing.ic}
                    onChange={e=>setEditing(p=>({...p,ic:e.target.value}))}
                    placeholder="emoji"
                    style={{...fldInp,textAlign:"center",fontSize:18}}/>
                </div>
              </div>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:24,gap:8}}>
                <button
                  onClick={()=>{remove(editing.index);closeEdit();}}
                  style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${T.rose}55`,background:"transparent",color:T.rose,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                  Delete
                </button>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={closeEdit}
                    style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                    Cancel
                  </button>
                  <button onClick={saveEdit}
                    style={{padding:"8px 18px",borderRadius:8,border:"none",background:T.warm,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const HBillsAndSubs = () => {
    const [openBills, setOpenBills] = useState(true);
    const [openSubs,  setOpenSubs]  = useState(true);
    const bills = billsData[billsSec]||[];
    const subs  = subsData[billsSec]||[];

    // ── Bill edit modal model ────────────────────────────────────────
    // Core fields per the new bill model: name, provider, type, amount,
    // variable/fixed, frequency, next due, payment method, owner,
    // auto-pay, reminder lead, account ref, contract end, notes.
    const BILL_TYPES = [
      "Rent / Mortgage","Council Tax","Gas","Electricity","Water",
      "Internet","Mobile","TV / Streaming","Insurance","Loan",
      "Credit card","Childcare","Other"
    ];
    const BILL_TYPE_ICONS = {
      "Rent / Mortgage":"🏠","Council Tax":"🏛️","Gas":"🔥","Electricity":"⚡",
      "Water":"💧","Internet":"📶","Mobile":"📱","TV / Streaming":"📺",
      "Insurance":"🛡️","Loan":"🏦","Credit card":"💳","Childcare":"🧒","Other":"📄"
    };
    const FREQS    = ["Monthly","Quarterly","Annual","One-off"];
    const PAY_METHODS = ["Direct Debit","Standing Order","Card","Manual transfer","Cash"];
    const OWNERS   = ["James","Sarah","Household"];

    // Convert "01-Jun-2026" ⇄ ISO "2026-06-01" for the date picker.
    const BMO = {Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12"};
    const BMO_R = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const billParseDate = (s) => {
      const m = (s||"").match(/^(\d{2})-(\w{3})-(\d{4})$/);
      if (!m) return "";
      return `${m[3]}-${BMO[m[2]]||"01"}-${m[1]}`;
    };
    const billFmtDate = (iso) => {
      if (!iso) return "";
      const [y,mm,dd] = iso.split("-");
      return `${dd}-${BMO_R[parseInt(mm,10)-1]}-${y}`;
    };
    const parsePoundsLocal = s => parseFloat((s||"0").replace(/[^0-9.]/g,""))||0;

    const [billEdit, setBillEdit] = useState(null);
    const openBillEdit = (idx) => {
      const b = bills[idx];
      setBillEdit({
        index: idx,
        ic: b.ic,
        n: b.n,
        provider: b.provider || "",
        type: b.type || "Other",
        amount: String(parsePoundsLocal(b.amount).toFixed(2)),
        variable: !!b.variable,
        frequency: b.frequency || "Monthly",
        nextDue: billParseDate(b.nextDue),
        paymentMethod: b.paymentMethod || "Direct Debit",
        owner: b.owner || "Household",
        autoPay: b.autoPay !== false,
        reminderDays: b.reminderDays ?? 3,
        accountRef: b.accountRef || "",
        contractEnd: billParseDate(b.contractEnd || ""),
        notes: b.notes || "",
      });
    };
    const openBillCreate = () => {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth()+1);
      const nextDueISO = nextMonth.toISOString().split("T")[0];
      setBillEdit({
        index: null,            // create mode
        ic: "📄",
        n: "",
        provider: "",
        type: "Other",
        amount: "",
        variable: false,
        frequency: "Monthly",
        nextDue: nextDueISO,
        paymentMethod: "Direct Debit",
        owner: billsSec === "personal" ? "James" : "Household",
        autoPay: true,
        reminderDays: 3,
        accountRef: "",
        contractEnd: "",
        notes: "",
      });
    };
    const closeBillEdit = () => setBillEdit(null);
    const saveBillEdit = () => {
      if (!billEdit) return;
      const amtNum = parseFloat(billEdit.amount);
      if (!billEdit.n.trim() || isNaN(amtNum) || amtNum < 0) return;

      const fields = {
        ic: billEdit.ic || BILL_TYPE_ICONS[billEdit.type] || "📄",
        n: billEdit.n.trim(),
        provider: billEdit.provider.trim(),
        type: billEdit.type,
        amount: `£${amtNum.toFixed(2)}`,
        variable: billEdit.variable,
        frequency: billEdit.frequency,
        nextDue: billFmtDate(billEdit.nextDue) || "",
        paymentMethod: billEdit.paymentMethod,
        owner: billEdit.owner,
        autoPay: billEdit.autoPay,
        reminderDays: Number(billEdit.reminderDays)||0,
        accountRef: billEdit.accountRef.trim(),
        contractEnd: billEdit.contractEnd ? billFmtDate(billEdit.contractEnd) : "",
        notes: billEdit.notes.trim(),
      };

      if (billEdit.index === null) {
        // Create — append a fresh bill in the current section
        const newBill = {
          ...fields,
          paid: false,
          lastPaid: "",
          lastUsed: "",
          vis: billsSec,
        };
        setBillsData(prev => ({...prev, [billsSec]: [...prev[billsSec], newBill]}));
      } else {
        // Update — preserve paid/lastPaid/vis flags on the existing row
        setBillsData(prev => ({
          ...prev,
          [billsSec]: prev[billsSec].map((x,i) =>
            i === billEdit.index ? {...x, ...fields, nextDue: fields.nextDue || x.nextDue} : x
          )
        }));
      }
      setBillEdit(null);
    };

    const billsTotal = bills.reduce((s,b)=>s+parsePounds(b.amount),0);
    const subsTotal  = subs.reduce((s,b)=>s+parsePounds(b.amount),0);
    const dueThisWeek = [...bills,...subs].filter(x=>{
      const c = dueCls(x.nextDue); return (c===T.amber||c===T.rose)&&!x.paid;
    });
    return (
      <div>
        {/* Info banner */}
        <div style={{display:"flex",alignItems:"center",gap:9,padding:"10px 13px",borderRadius:10,background:T.tealS,border:`1px solid ${T.teal}33`,marginBottom:14,fontSize:12.5}}>
          <span style={{fontSize:16,flexShrink:0}}>ℹ️</span>
          Bills &amp; Subs spending automatically counts against your household budget envelopes.
        </div>
        {/* g3 stat strip */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
          {[
            {val:`£${billsTotal.toFixed(0)}`, lbl:"Bills / mo"},
            {val:`£${subsTotal.toFixed(2)}`,  lbl:"Subs / mo"},
            {val:`£${(billsTotal+subsTotal).toFixed(2)}`,lbl:"Total / mo",c:T.amber},
          ].map((s,i)=>(
            <div key={i} className="stat-box">
              <div className="stat-num" style={{color:s.c||T.text}}>{s.val}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
        {/* Household / Personal tab */}
        <SectionTabs sv={billsSec} setV={setBillsSec} labels={[["household","Household"],["personal","Personal"]]}/>
        {billsSec==="personal" && (
          <div style={{fontSize:11,color:T.violet,background:T.violet+"12",border:`1px solid ${T.violet}33`,borderRadius:8,padding:"6px 12px",marginBottom:12}}>
            🔒 These items are private to you — not visible to other household members.
          </div>
        )}
        {/* Due this week */}
        {dueThisWeek.length>0 && (
          <div className="card" style={{marginBottom:12,borderColor:T.amber+"55"}}>
            <div className="card-title">⏰ Due this week</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {dueThisWeek.map((b,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 11px",borderRadius:8,background:T.amberS,border:`1px solid ${T.amber}44`,fontSize:12}}>
                  <span>{b.ic}</span><strong>{b.n}</strong><span style={{color:T.textS}}>Due {b.nextDue}</span><span style={{fontWeight:600}}>{b.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Bills collapsible */}
        <div className={`grp-hdr ${openBills?"open":"closed"}`} onClick={()=>setOpenBills(v=>!v)}>
          <div className="grp-lbl">💳 Bills<span className="grp-count">{bills.length}</span></div>
          <span style={{fontSize:10,color:T.textM}}>{openBills?"▼":"▶"}</span>
        </div>
        {openBills && (
          <div className="grp-body">
            {bills.map((b,i)=>(
              <div key={i} className="row"
                onClick={()=>openBillEdit(i)}
                title="Click to edit bill"
                style={{cursor:"pointer",alignItems:"center"}}>
                <span style={{fontSize:18,width:30,textAlign:"center",flexShrink:0}}>{BILL_TYPE_ICONS[b.type]||b.ic||"📄"}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,fontWeight:500,textDecoration:b.paid?"line-through":"none",color:b.paid?T.textS:T.text}}>{b.n}</span>
                    {b.variable && <span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:6,background:T.amberS,color:T.amber,letterSpacing:".04em",textTransform:"uppercase"}}>Variable</span>}
                  </div>
                  <div style={{fontSize:11,color:T.textS,marginTop:2,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    {b.provider && <span style={{whiteSpace:"nowrap"}}>{b.provider}</span>}
                    {b.provider && <span style={{color:T.textM}}>·</span>}
                    <span style={{whiteSpace:"nowrap"}}>{b.frequency||"Monthly"}</span>
                    {b.autoPay && <><span style={{color:T.textM}}>·</span><span style={{color:T.sage,whiteSpace:"nowrap"}}>⚡ Auto</span></>}
                    {b.paymentMethod && b.paymentMethod !== "Direct Debit" && <><span style={{color:T.textM}}>·</span><span style={{whiteSpace:"nowrap"}}>{b.paymentMethod}</span></>}
                  </div>
                </div>
                {dueCls(b.nextDue)!==T.textS && (
                  <span style={{fontSize:10.5,fontWeight:600,padding:"2px 8px",borderRadius:8,background:dueCls(b.nextDue)===T.rose?T.roseS:T.amberS,color:dueCls(b.nextDue),marginRight:4,flexShrink:0,whiteSpace:"nowrap"}}>
                    {dueCls(b.nextDue)===T.rose?"Overdue ":"Due "}{b.nextDue}
                  </span>
                )}
                <span style={{fontSize:13,fontWeight:600,color:b.paid?T.sage:T.text,marginRight:6,flexShrink:0,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>{b.amount}</span>
                <div onClick={e=>{e.stopPropagation();toggleBillPaid(billsSec,i);}} title={b.paid?"Mark unpaid":"Mark paid"}
                  style={{width:22,height:22,borderRadius:6,border:`1.5px solid ${b.paid?T.sage:T.border}`,background:b.paid?T.sageS:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.sage,cursor:"pointer",flexShrink:0,transition:"all .15s"}}>{b.paid?"✓":""}</div>
                <div onClick={e=>{e.stopPropagation();removeBill(billsSec,i);}} title="Delete bill"
                  style={{fontSize:11,color:T.textM,cursor:"pointer",marginLeft:6,padding:"2px 5px",flexShrink:0,transition:"color .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.color=T.rose}
                  onMouseLeave={e=>e.currentTarget.style.color=T.textM}>✕</div>
              </div>
            ))}
            <button className="btn-sm btn-warm" style={{width:"100%",marginTop:10}} onClick={openBillCreate}>+ Add new bill</button>
          </div>
        )}
        {/* Subs collapsible */}
        <div className={`grp-hdr ${openSubs?"open":"closed"}`} onClick={()=>setOpenSubs(v=>!v)}>
          <div className="grp-lbl">🔄 Subscriptions<span className="grp-count">{subs.length}</span></div>
          <span style={{fontSize:10,color:T.textM}}>{openSubs?"▼":"▶"}</span>
        </div>
        {openSubs && (
          <div className="grp-body">
            {subs.map((s,i)=>(
              <div key={i} className="row">
                <span style={{fontSize:16,width:26,textAlign:"center"}}>{s.ic}</span>
                <span style={{flex:1,fontSize:13,textDecoration:s.paid?"line-through":"none",color:s.paid?T.textS:T.text}}>{s.n}</span>
                {s.warn && <span style={{fontSize:10,padding:"2px 7px",borderRadius:8,background:T.roseS,color:T.rose,fontWeight:600,marginRight:4}}>{s.warn}</span>}
                <span style={{fontSize:13,color:T.textS,marginRight:6}}>{s.amount}</span>
                <div onClick={()=>toggleSubPaid(billsSec,i)} style={{width:22,height:22,borderRadius:6,border:`1.5px solid ${s.paid?T.sage:T.border}`,background:s.paid?T.sageS:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.sage,cursor:"pointer",flexShrink:0,transition:"all .15s"}}>{s.paid?"✓":""}</div>
                <div onClick={()=>removeSub(billsSec,i)} style={{fontSize:11,color:T.rose,cursor:"pointer",marginLeft:6,padding:"2px 5px",flexShrink:0}}>✕</div>
              </div>
            ))}
            <div className="qrow">
              <input placeholder="Add a subscription…" value={newSubName} onChange={e=>setNewSubName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSub()} style={{flex:2}}/>
              <input placeholder="£0.00" style={{flex:0.8}}/>
              <button className="btn-sm btn-warm" onClick={addSub}>+</button>
            </div>
          </div>
        )}

        {/* ── Bill edit / create modal ───────────────────── */}
        {billEdit && (
          <>
            <div onClick={closeBillEdit}
              style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,backdropFilter:"blur(3px)"}}/>
            <div style={{...modalShell, width:"min(640px,94vw)", maxHeight:"92vh"}}>

              {/* Header */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <div style={{fontSize:15,fontWeight:700,color:T.text,display:"flex",alignItems:"center",gap:9,minWidth:0}}>
                  <span style={{fontSize:22,width:32,height:32,borderRadius:8,background:T.warmS,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{BILL_TYPE_ICONS[billEdit.type] || billEdit.ic || "📄"}</span>
                  <span style={{whiteSpace:"nowrap"}}>{billEdit.index === null ? "Add new bill" : "Edit bill"}</span>
                </div>
                <div onClick={closeBillEdit} title="Close" style={{cursor:"pointer",color:T.textS,fontSize:18,lineHeight:1,padding:"4px 8px",borderRadius:6,background:T.card2}}>✕</div>
              </div>

              {/* ── BASICS ── */}
              <div style={{fontSize:10,fontWeight:700,color:T.warm,textTransform:"uppercase",letterSpacing:".08em",marginTop:20,paddingBottom:4,borderBottom:`1px solid ${T.border}`}}>Basics</div>

              <label style={fldLbl}>Name <span style={{color:T.rose,fontWeight:400,textTransform:"none",letterSpacing:0}}>*</span></label>
              <input value={billEdit.n} autoFocus={billEdit.index === null}
                onChange={e=>setBillEdit(p=>({...p,n:e.target.value}))}
                onKeyDown={e=>{if(e.key==="Escape")closeBillEdit();}}
                placeholder="e.g. Mortgage, Netflix, Council Tax"
                style={fldInp}/>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={fldLbl}>Provider</label>
                  <input value={billEdit.provider}
                    onChange={e=>setBillEdit(p=>({...p,provider:e.target.value}))}
                    placeholder="e.g. HSBC, Octopus Energy"
                    style={fldInp}/>
                </div>
                <div>
                  <label style={fldLbl}>Type</label>
                  <div style={{position:"relative"}}>
                    <select value={billEdit.type}
                      onChange={e=>setBillEdit(p=>({...p,type:e.target.value,ic:BILL_TYPE_ICONS[e.target.value]||p.ic}))}
                      style={{...fldInp,paddingRight:28}}>
                      {BILL_TYPES.map(t=><option key={t}>{t}</option>)}
                    </select>
                    <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                  </div>
                </div>
              </div>

              {/* ── AMOUNT & FREQUENCY ── */}
              <div style={{fontSize:10,fontWeight:700,color:T.warm,textTransform:"uppercase",letterSpacing:".08em",marginTop:20,paddingBottom:4,borderBottom:`1px solid ${T.border}`}}>Amount &amp; frequency</div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.2fr",gap:12}}>
                <div>
                  <label style={fldLbl}>Amount <span style={{color:T.rose,fontWeight:400,textTransform:"none",letterSpacing:0}}>*</span></label>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,color:T.textS,pointerEvents:"none"}}>£</span>
                    <input type="number" min="0" step="0.01" value={billEdit.amount}
                      onChange={e=>setBillEdit(p=>({...p,amount:e.target.value}))}
                      onKeyDown={e=>{if(e.key==="Enter")saveBillEdit();if(e.key==="Escape")closeBillEdit();}}
                      placeholder="0.00"
                      style={{...fldInp,paddingLeft:22,fontVariantNumeric:"tabular-nums"}}/>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Frequency</label>
                  <div style={{position:"relative"}}>
                    <select value={billEdit.frequency}
                      onChange={e=>setBillEdit(p=>({...p,frequency:e.target.value}))}
                      style={{...fldInp,paddingRight:28}}>
                      {FREQS.map(f=><option key={f}>{f}</option>)}
                    </select>
                    <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Payment method</label>
                  <div style={{position:"relative"}}>
                    <select value={billEdit.paymentMethod}
                      onChange={e=>{
                        const v = e.target.value;
                        const isAuto = v === "Direct Debit" || v === "Standing Order";
                        setBillEdit(p=>({...p,paymentMethod:v,autoPay:isAuto?true:p.autoPay}));
                      }}
                      style={{...fldInp,paddingRight:28}}>
                      {PAY_METHODS.map(m=><option key={m}>{m}</option>)}
                    </select>
                    <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                  </div>
                </div>
              </div>

              {/* Variable amount toggle */}
              <div onClick={()=>setBillEdit(p=>({...p,variable:!p.variable}))}
                style={{display:"flex",alignItems:"center",gap:11,padding:"10px 12px",marginTop:14,borderRadius:10,background:billEdit.variable?T.amberS:T.card2,border:`1px solid ${billEdit.variable?T.amber+"55":T.border}`,cursor:"pointer",transition:"all .15s"}}>
                <div style={{width:32,height:18,borderRadius:9,background:billEdit.variable?T.amber:T.border,display:"flex",alignItems:"center",padding:2,transition:"all .15s",flexShrink:0}}>
                  <div style={{width:14,height:14,borderRadius:"50%",background:"#fff",marginLeft:billEdit.variable?"auto":0,transition:"all .15s"}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500}}>Estimated / variable amount</div>
                  <div style={{fontSize:11,color:T.textS,marginTop:1}}>For bills that change each cycle — gas, electric, credit cards</div>
                </div>
              </div>

              {/* ── SCHEDULE ── */}
              <div style={{fontSize:10,fontWeight:700,color:T.warm,textTransform:"uppercase",letterSpacing:".08em",marginTop:20,paddingBottom:4,borderBottom:`1px solid ${T.border}`}}>Schedule &amp; reminders</div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={fldLbl}>Next due date <span style={{color:T.rose,fontWeight:400,textTransform:"none",letterSpacing:0}}>*</span></label>
                  <input type="date" value={billEdit.nextDue||""}
                    onChange={e=>setBillEdit(p=>({...p,nextDue:e.target.value}))}
                    style={fldInp}/>
                </div>
                <div>
                  <label style={fldLbl}>Owner / payer</label>
                  <div style={{position:"relative"}}>
                    <select value={billEdit.owner}
                      onChange={e=>setBillEdit(p=>({...p,owner:e.target.value}))}
                      style={{...fldInp,paddingRight:28}}>
                      {OWNERS.map(o=><option key={o}>{o}</option>)}
                    </select>
                    <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                  </div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:2}}>
                <div onClick={()=>setBillEdit(p=>({...p,autoPay:!p.autoPay}))}
                  style={{display:"flex",alignItems:"center",gap:11,padding:"10px 12px",marginTop:14,borderRadius:10,background:billEdit.autoPay?T.sageS:T.card2,border:`1px solid ${billEdit.autoPay?T.sage+"55":T.border}`,cursor:"pointer",transition:"all .15s",alignSelf:"end"}}>
                  <div style={{width:32,height:18,borderRadius:9,background:billEdit.autoPay?T.sage:T.border,display:"flex",alignItems:"center",padding:2,transition:"all .15s",flexShrink:0}}>
                    <div style={{width:14,height:14,borderRadius:"50%",background:"#fff",marginLeft:billEdit.autoPay?"auto":0,transition:"all .15s"}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500}}>Auto-pay enabled</div>
                    <div style={{fontSize:11,color:T.textS,marginTop:1}}>{billEdit.autoPay?"We won't nag you to pay":"You'll get reminders"}</div>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Reminder lead time</label>
                  <div style={{position:"relative"}}>
                    <select value={String(billEdit.reminderDays)}
                      onChange={e=>setBillEdit(p=>({...p,reminderDays:Number(e.target.value)}))}
                      style={{...fldInp,paddingRight:28}}>
                      <option value="0">On the day</option>
                      <option value="1">1 day before</option>
                      <option value="3">3 days before</option>
                      <option value="7">1 week before</option>
                      <option value="14">2 weeks before</option>
                    </select>
                    <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                  </div>
                </div>
              </div>

              {/* ── REFERENCE ── */}
              <div style={{fontSize:10,fontWeight:700,color:T.warm,textTransform:"uppercase",letterSpacing:".08em",marginTop:20,paddingBottom:4,borderBottom:`1px solid ${T.border}`}}>Reference</div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={fldLbl}>Account / customer ref</label>
                  <input value={billEdit.accountRef}
                    onChange={e=>setBillEdit(p=>({...p,accountRef:e.target.value}))}
                    placeholder="Useful for support calls"
                    style={fldInp}/>
                </div>
                <div>
                  <label style={fldLbl}>Contract end <span style={{color:T.textM,fontWeight:400,textTransform:"none",letterSpacing:0}}>(optional)</span></label>
                  <input type="date" value={billEdit.contractEnd||""}
                    onChange={e=>setBillEdit(p=>({...p,contractEnd:e.target.value}))}
                    style={fldInp}/>
                </div>
              </div>

              <label style={fldLbl}>Notes <span style={{color:T.textM,fontWeight:400,textTransform:"none",letterSpacing:0}}>(optional)</span></label>
              <textarea value={billEdit.notes}
                onChange={e=>setBillEdit(p=>({...p,notes:e.target.value}))}
                rows={2}
                placeholder="Anything else worth remembering…"
                style={{...fldInp,resize:"vertical",minHeight:54,fontFamily:"inherit"}}/>

              {/* Footer actions */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:24,gap:8}}>
                {billEdit.index !== null ? (
                  <button
                    onClick={()=>{removeBill(billsSec,billEdit.index);closeBillEdit();}}
                    style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${T.rose}55`,background:"transparent",color:T.rose,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                    Delete bill
                  </button>
                ) : <div/>}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={closeBillEdit}
                    style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                    Cancel
                  </button>
                  <button onClick={saveBillEdit}
                    style={{padding:"8px 20px",borderRadius:8,border:"none",background:T.warm,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                    {billEdit.index === null ? "Add bill" : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Personal spending — single-line rows; click row to edit via modal.
  const PersonalSpending = ({ T }) => {
    const CATS = ["Eating Out","Entertainment","Transport","Clothing","Groceries","Health","Travel","Subscriptions","Other"];
    const CAT_ICONS = {
      "Eating Out":"🍽️","Entertainment":"🎭","Transport":"🚗","Clothing":"👕",
      "Groceries":"🛒","Health":"🏥","Travel":"✈️","Subscriptions":"📱","Other":"📦"
    };

    // Convert "21 May" ⇄ YYYY-MM-DD for the <input type="date">.
    const MONTHS_LONG = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
    const SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const parseDMY = (s) => {
      const m = (s||"").match(/^(\d{1,2})\s+(\w{3})$/);
      if (!m) return "";
      const dd = String(m[1]).padStart(2,"0");
      const mm = String((MONTHS_LONG[m[2]]??0)+1).padStart(2,"0");
      return `2026-${mm}-${dd}`;
    };
    const fmtDMY = (iso) => {
      if (!iso) return "";
      const [_, mm, dd] = iso.split("-");
      return `${parseInt(dd,10)} ${SHORT[parseInt(mm,10)-1]}`;
    };

    const [items, setItems] = useState([
      {ic:"☕", n:"Pret a Manger", cat:"Eating Out",    amt:"6.50",  d:"21 May"},
      {ic:"📚", n:"Kindle book",   cat:"Entertainment", amt:"8.99",  d:"19 May"},
      {ic:"🚂", n:"TfL",           cat:"Transport",     amt:"5.40",  d:"20 May"},
      {ic:"👟", n:"ASOS order",    cat:"Clothing",      amt:"42.00", d:"15 May"},
      {ic:"☕", n:"Nero Coffee",   cat:"Eating Out",    amt:"3.80",  d:"14 May"},
      {ic:"🎮", n:"Steam — game",  cat:"Entertainment", amt:"19.99", d:"12 May"},
      {ic:"🍔", n:"Five Guys",     cat:"Eating Out",    amt:"14.50", d:"11 May"},
      {ic:"🚕", n:"Uber",          cat:"Transport",     amt:"12.80", d:"10 May"},
    ]);
    const remove = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));
    const PS_COLS = "20px minmax(0,1.4fr) 110px 80px 70px 22px";

    // Modal state — null when closed, otherwise { index, draft }.
    const [editing, setEditing] = useState(null);
    const openEdit = (i) => {
      const it = items[i];
      setEditing({
        index: i,
        ic: it.ic,
        n: it.n,
        cat: it.cat,
        amt: it.amt,
        date: parseDMY(it.d),
      });
    };
    const closeEdit = () => setEditing(null);
    const saveEdit = () => {
      if (!editing) return;
      const amtNum = parseFloat(editing.amt);
      if (!editing.n.trim() || isNaN(amtNum) || amtNum < 0) return;
      const updated = {
        ic: editing.ic || CAT_ICONS[editing.cat] || "📦",
        n: editing.n.trim(),
        cat: editing.cat,
        amt: amtNum.toFixed(2),
        d: fmtDMY(editing.date) || items[editing.index].d,
      };
      setItems(prev => prev.map((x, idx) => idx === editing.index ? updated : x));
      setEditing(null);
    };

    return (
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
          <div className="card-title" style={{marginBottom:0}}>🧾 My personal spending</div>
          <div style={{fontSize:10.5,color:T.textS,letterSpacing:".06em",textTransform:"uppercase"}}>{items.length} entries</div>
        </div>
        {/* Column header */}
        <div style={{
          display:"grid",gridTemplateColumns:PS_COLS,columnGap:10,alignItems:"center",
          padding:"6px 6px 8px",borderBottom:`1px solid ${T.border}`,
          fontSize:9.5,color:T.textM,letterSpacing:".08em",textTransform:"uppercase",fontWeight:600
        }}>
          <span></span>
          <span>Description</span>
          <span>Type</span>
          <span style={{textAlign:"right"}}>Amount</span>
          <span style={{textAlign:"right"}}>Date</span>
          <span></span>
        </div>
        {items.map((tx,i)=>(
          <div
            key={i}
            onClick={()=>openEdit(i)}
            title="Click to edit"
            style={{
              display:"grid",gridTemplateColumns:PS_COLS,columnGap:10,alignItems:"center",
              padding:"7px 6px",
              borderBottom: i===items.length-1 ? "none" : `1px solid ${T.border}`,
              fontSize:12.5,
              cursor:"pointer",
              transition:"background .1s",
            }}
            onMouseEnter={e=>e.currentTarget.style.background=T.warmG||T.card2}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <span style={{fontSize:14,lineHeight:1}}>{tx.ic}</span>
            <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tx.n}</span>
            <span style={{color:T.textS,fontSize:11.5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tx.cat}</span>
            <span style={{textAlign:"right",fontWeight:600,color:T.rose,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>−£{tx.amt}</span>
            <span style={{textAlign:"right",fontSize:11,color:T.textS,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>{tx.d}</span>
            <button
              onClick={e=>{e.stopPropagation();remove(i);}}
              title="Remove transaction"
              style={{width:22,height:22,borderRadius:6,border:"1px solid transparent",background:"transparent",color:T.textM,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,lineHeight:1,padding:0,transition:"all .12s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=T.roseS;e.currentTarget.style.color=T.rose;e.currentTarget.style.borderColor=T.rose+"55";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textM;e.currentTarget.style.borderColor="transparent";}}>
              ×
            </button>
          </div>
        ))}
        <div className="qrow" style={{marginTop:10}}>
          <input placeholder="Description…" style={{flex:2}}/>
          <input placeholder="£0.00" style={{flex:0.8}}/>
          <select style={{flex:1.2}}>
            {CATS.map(c=><option key={c}>{c}</option>)}
          </select>
          <button className="btn-sm btn-warm" style={{flexShrink:0}}>+ Log</button>
        </div>

        {/* Edit modal */}
        {editing && (
          <>
            <div onClick={closeEdit}
              style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,backdropFilter:"blur(3px)"}}/>
            <div style={{...modalShell, width:"min(480px,94vw)", maxHeight:"90vh"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <div style={{fontSize:15,fontWeight:700,color:T.text,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>{editing.ic}</span>
                  Edit transaction
                </div>
                <div onClick={closeEdit} title="Close" style={{cursor:"pointer",color:T.textS,fontSize:18,lineHeight:1,padding:"4px 8px",borderRadius:6,background:T.card2}}>✕</div>
              </div>

              <label style={fldLbl}>Description</label>
              <input value={editing.n} autoFocus
                onChange={e=>setEditing(p=>({...p,n:e.target.value}))}
                onKeyDown={e=>{if(e.key==="Enter")saveEdit();if(e.key==="Escape")closeEdit();}}
                placeholder="What did you spend on?"
                style={fldInp}/>

              <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:12}}>
                <div>
                  <label style={fldLbl}>Category</label>
                  <div style={{position:"relative"}}>
                    <select value={editing.cat}
                      onChange={e=>setEditing(p=>({...p,cat:e.target.value,ic:CAT_ICONS[e.target.value]||p.ic}))}
                      style={{...fldInp,paddingRight:28}}>
                      {CATS.map(c=><option key={c}>{c}</option>)}
                    </select>
                    <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:T.textS}}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={fldLbl}>Amount</label>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,color:T.textS,pointerEvents:"none"}}>£</span>
                    <input type="number" min="0" step="0.01" value={editing.amt}
                      onChange={e=>setEditing(p=>({...p,amt:e.target.value}))}
                      onKeyDown={e=>{if(e.key==="Enter")saveEdit();if(e.key==="Escape")closeEdit();}}
                      style={{...fldInp,paddingLeft:22,fontVariantNumeric:"tabular-nums"}}/>
                  </div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={fldLbl}>Date</label>
                  <input type="date" value={editing.date||""}
                    onChange={e=>setEditing(p=>({...p,date:e.target.value}))}
                    style={fldInp}/>
                </div>
                <div>
                  <label style={fldLbl}>Icon</label>
                  <input value={editing.ic}
                    onChange={e=>setEditing(p=>({...p,ic:e.target.value}))}
                    placeholder="emoji"
                    style={{...fldInp,textAlign:"center",fontSize:18}}/>
                </div>
              </div>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:24,gap:8}}>
                <button
                  onClick={()=>{remove(editing.index);closeEdit();}}
                  style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${T.rose}55`,background:"transparent",color:T.rose,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                  Delete
                </button>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={closeEdit}
                    style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                    Cancel
                  </button>
                  <button onClick={saveEdit}
                    style={{padding:"8px 18px",borderRadius:8,border:"none",background:T.warm,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const MyFinances = () => {
    // Editable monthly budget — click pencil to edit, Save/Cancel commits.
    const [personalBudget, setPersonalBudget] = useState(800);
    const [budgetEditing, setBudgetEditing]   = useState(false);
    const [budgetDraft,   setBudgetDraft]     = useState(800);
    const PERSONAL_SPENT = 312;
    const pct = Math.min(100, Math.round(PERSONAL_SPENT / personalBudget * 100));

    // Editable monthly income — list of regular + one-off entries.
    const TYPE_STYLES = {
      "Regular":  { bg: T.sageS,   c: T.sage,   dot: T.sage   },
      "One-off":  { bg: T.amberS,  c: T.amber,  dot: T.amber  },
      "Bonus":    { bg: T.warmS,   c: T.warm,   dot: T.warm   },
      "Other":    { bg: T.card2,   c: T.textS,  dot: T.textS  },
    };
    const [incomes, setIncomes] = useState([
      { n:"Salary",            type:"Regular", amt:2450 },
      { n:"Freelance project", type:"One-off", amt:350  },
    ]);
    const [iName, setIName] = useState("");
    const [iType, setIType] = useState("Regular");
    const [iAmt,  setIAmt]  = useState("");
    const addIncome = () => {
      const amt = parseFloat(iAmt);
      if (!iName.trim() || isNaN(amt) || amt <= 0) return;
      setIncomes(prev => [...prev, { n: iName.trim(), type: iType, amt }]);
      setIName(""); setIAmt(""); setIType("Regular");
    };
    const removeIncome = (idx) => setIncomes(prev => prev.filter((_, i) => i !== idx));
    const incomeTotal = incomes.reduce((s, x) => s + x.amt, 0);
    const fmtMoney = (n) => n.toLocaleString("en-GB", { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });

    return (
      <div>
        {/* g2: budget + income */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          {/* Personal budget */}
          <div className="card" style={{marginBottom:0}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div className="card-title" style={{marginBottom:0}}>💳 My monthly budget</div>
              {!budgetEditing ? (
                <button
                  onClick={()=>{ setBudgetDraft(personalBudget); setBudgetEditing(true); }}
                  style={{fontSize:11,color:T.warm,background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:4}}>
                  ✏️ Edit
                </button>
              ) : null}
            </div>

            {budgetEditing ? (
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,padding:"10px 12px",borderRadius:10,background:T.warmS,border:`1px solid ${T.warm}55`}}>
                <span style={{fontSize:14,color:T.textS}}>£</span>
                <input
                  type="number" min="0" step="50" value={budgetDraft}
                  onChange={e=>setBudgetDraft(Number(e.target.value))}
                  autoFocus
                  style={{flex:1,padding:"6px 10px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:15,fontWeight:600,outline:"none",fontFamily:"inherit",fontVariantNumeric:"tabular-nums"}}/>
                <span style={{fontSize:11,color:T.textS}}>/mo</span>
                <button className="btn-sm btn-warm" onClick={()=>{ setPersonalBudget(budgetDraft||0); setBudgetEditing(false); }}>Save</button>
                <button className="btn-sm" onClick={()=>setBudgetEditing(false)}>Cancel</button>
              </div>
            ) : (
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                {[
                  [`£${fmtMoney(PERSONAL_SPENT)}`,        "Spent",  T.text],
                  [`£${fmtMoney(personalBudget)}`,        "Budget", T.warm],
                  [`£${fmtMoney(personalBudget-PERSONAL_SPENT)}`,"Left", T.sage],
                ].map(([v,l,col],i)=>(
                  <div key={i} style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:col}}>{v}</div>
                    <div style={{fontSize:10.5,color:T.textS}}>{l}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="pbar"><div className="pfill" style={{width:`${pct}%`,background:pct>=90?T.rose:pct>=75?T.amber:T.sage}}/></div>
            <div style={{fontSize:11,color:T.textS,marginTop:4}}>{pct}% used · {new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate()-new Date().getDate()} days left</div>
            <div style={{marginTop:10,fontSize:11,color:T.textS,padding:"8px 10px",borderRadius:8,background:T.card2,border:`1px solid ${T.border}`,lineHeight:1.5}}>
              🔒 Personal budget is private — not visible to other household members.
            </div>
          </div>

          {/* Income — editable list */}
          <div className="card" style={{marginBottom:0}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div className="card-title" style={{marginBottom:0}}>💰 My income · {FIN_MONTHS_SHORT[finMonth]}</div>
              <div style={{fontSize:11,color:T.textS}}>Total <span style={{color:T.sage,fontWeight:700}}>£{fmtMoney(incomeTotal)}</span></div>
            </div>

            {/* Income list — single line each */}
            {(() => {
              const INC_COLS = "10px minmax(0,1fr) 78px 72px 22px";
              return (
                <>
                  {incomes.map((inc,i)=>{
                    const s = TYPE_STYLES[inc.type] || TYPE_STYLES["Other"];
                    return (
                      <div key={i} style={{
                        display:"grid",gridTemplateColumns:INC_COLS,columnGap:10,alignItems:"center",
                        padding:"7px 4px",
                        borderBottom: i===incomes.length-1 ? "none" : `1px solid ${T.border}`,
                        fontSize:13
                      }}>
                        <span style={{width:8,height:8,borderRadius:"50%",background:s.dot}}/>
                        <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{inc.n}</span>
                        <span>
                          <span style={{fontSize:10.5,fontWeight:600,padding:"2px 8px",borderRadius:8,background:s.bg,color:s.c,whiteSpace:"nowrap"}}>{inc.type}</span>
                        </span>
                        <span style={{textAlign:"right",fontWeight:600,color:T.sage,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>£{fmtMoney(inc.amt)}</span>
                        <button
                          onClick={()=>removeIncome(i)}
                          title="Remove income"
                          style={{width:22,height:22,borderRadius:6,border:"1px solid transparent",background:"transparent",color:T.textM,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,lineHeight:1,padding:0,transition:"all .12s"}}
                          onMouseEnter={e=>{e.currentTarget.style.background=T.roseS;e.currentTarget.style.color=T.rose;e.currentTarget.style.borderColor=T.rose+"55";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.textM;e.currentTarget.style.borderColor="transparent";}}>
                          ×
                        </button>
                      </div>
                    );
                  })}
                </>
              );
            })()}

            {/* Add new income */}
            <div className="qrow" style={{marginTop:10}}>
              <input
                placeholder="Income source…"
                value={iName} onChange={e=>setIName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addIncome()}
                style={{flex:2}}/>
              <select value={iType} onChange={e=>setIType(e.target.value)} style={{flex:1.1}}>
                <option>Regular</option>
                <option>One-off</option>
                <option>Bonus</option>
                <option>Other</option>
              </select>
              <input
                placeholder="£0.00" type="number" min="0" step="0.01"
                value={iAmt} onChange={e=>setIAmt(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addIncome()}
                style={{flex:0.8}}/>
              <button className="btn-sm btn-warm" style={{flexShrink:0}} onClick={addIncome}>+ Add</button>
            </div>
          </div>
        </div>
        {/* Personal spending */}
        <PersonalSpending T={T}/>
      </div>
    );
  };

  /* ── Finance Admin ── */
  const HFinanceAdmin = () => {
    /* Role map for prototype demo members */
    const ROLE_MAP = {family:"owner",james:"owner",sarah:"admin",lily:"adult",tom:"child"};
    const role = ROLE_MAP[member] || "adult";
    const canWrite = role==="owner"||role==="admin";
    const canRead  = canWrite||role==="adult";

    /* Month navigation state */
    const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const [curMonth, setCurMonth] = useState(4); // 0-indexed; 4 = May
    const [curYear,  setCurYear]  = useState(2026);
    const shiftMonth = d => {
      let m = curMonth + d, y = curYear;
      if(m>11){m=0;y++;}
      if(m<0){m=11;y--;}
      setCurMonth(m); setCurYear(y);
    };

    /* Contribution data */
    const [contribs, setContribs] = useState([
      {id:"james",name:"James",initials:"JA",color:T.warm,  role:"Owner",
       amount:800, effFrom:"01-Feb-2026", paid:true,
       hist:[{amt:800,from:"01-Feb-2026",to:"present"},{amt:700,from:"01-Aug-2025",to:"31-Jan-2026"}]},
      {id:"sarah",name:"Sarah",initials:"SA",color:T.sky,   role:"Admin",
       amount:750, effFrom:"01-Apr-2026", paid:true,
       hist:[{amt:750,from:"01-Apr-2026",to:"present"},{amt:700,from:"01-Nov-2025",to:"31-Mar-2026"}]},
      {id:"lily", name:"Lily", initials:"LI",color:T.sage,  role:"Adult",
       amount:200, effFrom:"01-Jan-2026", paid:false,
       hist:[{amt:200,from:"01-Jan-2026",to:"present"}]},
    ]);
    const [contribDrafts, setContribDrafts] = useState({});
    const [histOpen, setHistOpen] = useState({});

    /* Envelope budget data */
    const [envBudgets, setEnvBudgets] = useState([
      {ic:"🛒",name:"Groceries",        budget:400, prev:400},
      {ic:"🚗",name:"Transport",         budget:200, prev:180},
      {ic:"🍽️",name:"Eating Out",        budget:200, prev:200},
      {ic:"🎭",name:"Entertainment",     budget:150, prev:150},
      {ic:"👗",name:"Clothing",          budget:100, prev:80},
      {ic:"🧒",name:"Kids' Activities",  budget:150, prev:150},
      {ic:"✈️",name:"Holidays",          budget:300, prev:300},
      {ic:"📦",name:"Miscellaneous",     budget:150, prev:100},
    ]);
    const [envDrafts, setEnvDrafts] = useState({});

    const saveAll = () => {
      if(Object.keys(contribDrafts).length) {
        setContribs(prev => prev.map((c,i) => {
          if(contribDrafts[i]===undefined) return c;
          const newAmt = contribDrafts[i];
          return {...c, amount:newAmt, effFrom:`01-${MONTHS_SHORT[curMonth]}-${curYear}`,
            hist:[{amt:newAmt,from:`01-${MONTHS_SHORT[curMonth]}-${curYear}`,to:"present"}, ...c.hist.map((h,j)=>j===0?{...h,to:`30-${MONTHS_SHORT[(curMonth-1+12)%12]}-${curMonth===0?curYear-1:curYear}`}:h)]};
        }));
        setContribDrafts({});
      }
      if(Object.keys(envDrafts).length) {
        setEnvBudgets(prev => prev.map((e,i) => envDrafts[i]!==undefined?{...e,prev:e.budget,budget:envDrafts[i]}:e));
        setEnvDrafts({});
      }
    };

    const roleBadge = r => {
      const map = {Owner:{bg:T.warmS,c:T.warm},Admin:{bg:T.skyS,c:T.sky},Adult:{bg:T.sageS,c:T.sage}};
      const s = map[r]||map["Adult"];
      return <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:12,background:s.bg,color:s.c}}>{r}</span>;
    };
    const copyPill = (edited,changed) => {
      if(edited)   return <span style={{fontSize:11,display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:12,background:T.amberS,color:T.amber,border:`1px solid ${T.amber}33`,fontWeight:600}}>✏️ Edited</span>;
      if(changed)  return <span style={{fontSize:11,display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:12,background:T.warmS,color:T.warm,border:`1px solid ${T.warm}33`,fontWeight:600}}>↑ Changed</span>;
      return             <span style={{fontSize:11,display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:12,background:T.card2,color:T.textS,border:`1px solid ${T.border}`}}>⟳ Carried over</span>;
    };

    /* No access for teenager / child */
    if(!canRead) return (
      <div style={{textAlign:"center",padding:"48px 0"}}>
        <div style={{fontSize:32,marginBottom:12}}>🔒</div>
        <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>Access restricted</div>
        <div style={{fontSize:13,color:T.textS}}>Finance Admin is only available to Owner and Admin members.</div>
      </div>
    );

    const totalBudget = envBudgets.reduce((s,e,i)=>s+(envDrafts[i]??e.budget),0);
    const prevTotal   = envBudgets.reduce((s,e)=>s+e.prev,0);

    return (
      <div>
        {/* Page header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{fontSize:15,fontWeight:700}}>Finance Admin</div>
            <div style={{fontSize:12,color:T.textS,marginTop:2}}>
              {canWrite ? "Owner & admin" : "View only · Adult member"} · {MONTHS_FULL[curMonth]} {curYear}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <button onClick={()=>shiftMonth(-1)} className="btn-sm" style={{padding:"5px 9px"}}>◀</button>
            <span style={{fontSize:13,fontWeight:600,minWidth:90,textAlign:"center"}}>{MONTHS_FULL[curMonth]} {curYear}</span>
            <button onClick={()=>shiftMonth(1)}  className="btn-sm" style={{padding:"5px 9px"}}>▶</button>
          </div>
        </div>

        {/* Info banner */}
        <div style={{display:"flex",alignItems:"center",gap:9,padding:"10px 13px",borderRadius:10,background:T.tealS,border:`1px solid ${T.teal}33`,marginBottom:16,fontSize:12.5}}>
          <span style={{fontSize:16,flexShrink:0}}>ℹ️</span>
          Amounts copy forward automatically each month — only edit what changes.
        </div>

        {/* ── Member contributions ── */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:T.textS}}>Member contributions</div>
            <div style={{fontSize:11,color:T.textS}}>Agreed monthly amount paid into the household pot</div>
          </div>
          <div className="card">
            {/* Table header */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 1.4fr 1fr 0.8fr",gap:8,padding:"8px 14px",borderBottom:`1px solid ${T.border}`,background:T.card2}}>
              {["Member","Contribution","Effective from",`Status · ${MONTHS_SHORT[curMonth]}`,canWrite?"":""].map((h,i)=>(
                <span key={i} style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:T.textS}}>{h}</span>
              ))}
            </div>
            {contribs.map((c,i)=>{
              const edited = contribDrafts[i]!==undefined;
              const displayAmt = edited ? contribDrafts[i] : c.amount;
              const effFrom = edited ? `01-${MONTHS_SHORT[curMonth]}-${curYear}` : c.effFrom;
              const isHistOpen = !!histOpen[i];
              return (
                <div key={i}>
                  <div style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 1.4fr 1fr 0.8fr",gap:8,padding:"8px 14px",alignItems:"center",borderBottom:`1px solid ${T.border}22`}}>
                    {/* Member — inline: avatar · name · role badge */}
                    <div style={{display:"flex",alignItems:"center",gap:9,minWidth:0}}>
                      <div style={{width:26,height:26,borderRadius:"50%",background:c.color+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:c.color,flexShrink:0}}>{c.initials}</div>
                      <div style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div>
                      {roleBadge(c.role)}
                    </div>
                    {/* Amount */}
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      {canWrite ? (
                        <>
                          <span style={{color:T.textS,fontSize:13}}>£</span>
                          <input type="number" value={displayAmt} min="0" step="50"
                            onChange={e=>setContribDrafts(p=>({...p,[i]:Number(e.target.value)}))}
                            style={{width:72,padding:"4px 8px",borderRadius:8,border:`1px solid ${edited?T.amber:T.border}`,background:edited?T.amberS:T.card2,color:T.text,fontSize:13,outline:"none",textAlign:"right",fontFamily:"inherit"}}/>
                          <span style={{fontSize:11,color:T.textS}}>/mo</span>
                        </>
                      ) : (
                        <span style={{fontSize:13,fontWeight:600}}>£{displayAmt}/mo</span>
                      )}
                    </div>
                    {/* Effective from */}
                    <div style={{fontSize:12,color:T.textS}}>{effFrom}</div>
                    {/* Status */}
                    <div>
                      {c.paid
                        ? <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:12,background:T.sageS,color:T.sage}}>✓ Paid</span>
                        : <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:12,background:T.amberS,color:T.amber}}>Pending</span>}
                    </div>
                    {/* History toggle */}
                    <div>
                      <button onClick={()=>setHistOpen(p=>({...p,[i]:!p[i]}))}
                        style={{fontSize:11,color:T.textS,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:3,padding:0}}>
                        🕐 history {isHistOpen?"▲":"▼"}
                      </button>
                    </div>
                  </div>
                  {/* History accordion */}
                  {isHistOpen && (
                    <div style={{padding:"10px 14px 12px 52px",background:T.card2,borderBottom:`1px solid ${T.border}22`}}>
                      <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:T.textS,marginBottom:6}}>Contribution history</div>
                      {c.hist.map((h,j)=>(
                        <div key={j} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${T.border}22`,fontSize:12}}>
                          <span style={{fontWeight:600}}>£{h.amt}/mo</span>
                          <span style={{color:T.textS}}>{h.from} → {h.to}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Contribution total row */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 1.4fr 1fr 0.8fr",gap:8,padding:"10px 14px",background:T.card2,borderTop:`1px solid ${T.border}`}}>
              <span style={{fontSize:12,fontWeight:700,color:T.textS,textTransform:"uppercase",letterSpacing:".05em"}}>Total pot / month</span>
              <span style={{fontSize:13,fontWeight:700,color:T.sage}}>
                £{contribs.reduce((s,c,i)=>s+(contribDrafts[i]??c.amount),0).toLocaleString()}
              </span>
              <span/><span/><span/>
            </div>
          </div>
        </div>

        {/* ── Envelope budgets ── */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:T.textS}}>Envelope budgets</div>
            <div style={{fontSize:11,color:T.textS}}>Copy forward from previous month unless changed</div>
          </div>
          <div className="card">
            {/* Table header */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 1.2fr 1fr",gap:8,padding:"8px 14px",borderBottom:`1px solid ${T.border}`,background:T.card2}}>
              {["Envelope","This month","Previous","Status"].map((h,i)=>(
                <span key={i} style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:T.textS}}>{h}</span>
              ))}
            </div>
            {envBudgets.map((e,i)=>{
              const edited = envDrafts[i]!==undefined;
              const displayAmt = edited ? envDrafts[i] : e.budget;
              const changed = e.budget !== e.prev && !edited;
              return (
                <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 1.2fr 1fr",gap:8,padding:"10px 14px",alignItems:"center",borderBottom:`1px solid ${T.border}22`}}>
                  {/* Envelope name */}
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:26,height:26,borderRadius:7,background:T.sageS,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{e.ic}</div>
                    <span style={{fontSize:13}}>{e.name}</span>
                  </div>
                  {/* Budget input */}
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    {canWrite ? (
                      <>
                        <span style={{color:T.textS,fontSize:13}}>£</span>
                        <input type="number" value={displayAmt} min="0" step="10"
                          onChange={ev=>setEnvDrafts(p=>({...p,[i]:Number(ev.target.value)}))}
                          style={{width:72,padding:"4px 8px",borderRadius:8,border:`1px solid ${edited?T.amber:T.border}`,background:edited?T.amberS:T.card2,color:T.text,fontSize:13,outline:"none",textAlign:"right",fontFamily:"inherit"}}/>
                      </>
                    ) : (
                      <span style={{fontSize:13,fontWeight:600}}>£{displayAmt}</span>
                    )}
                  </div>
                  {/* Previous */}
                  <span style={{fontSize:12,color:T.textS}}>£{e.prev}</span>
                  {/* Status pill */}
                  <div>{copyPill(edited, changed)}</div>
                </div>
              );
            })}
            {/* Totals row */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 1.2fr 1fr",gap:8,padding:"10px 14px",background:T.card2,borderTop:`1px solid ${T.border}`}}>
              <span style={{fontSize:12,fontWeight:700,color:T.textS,textTransform:"uppercase",letterSpacing:".05em"}}>Total budget / month</span>
              <span style={{fontSize:13,fontWeight:700,color:T.sage}}>£{totalBudget.toLocaleString()}</span>
              <span style={{fontSize:12,color:T.textS}}>£{prevTotal.toLocaleString()}</span>
              <span/>
            </div>
          </div>
        </div>

        {/* Save / discard */}
        {canWrite && (
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}>
            <button className="btn-sm" onClick={()=>{setContribDrafts({});setEnvDrafts({});}}>Discard changes</button>
            <button className="btn-sm btn-warm" onClick={saveAll}>Save &amp; apply</button>
          </div>
        )}
      </div>
    );
  };

  /* ── Module tabs ── all 6 flat per the brief ── */
  const financeViews = {
    "Overview":         <HOverview/>,
    "Budget Envelopes": <HBudgetEnvelopes/>,
    "Transactions":     <HTransactions/>,
    "Bills & Subs":     <HBillsAndSubs/>,
    "Admin":            <HFinanceAdmin/>,
    "My Finance":       <MyFinances/>,
  };

  return (
    <div>
      {/* Top toolbar — module tabs + month picker on the right */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:14,flexWrap:"wrap"}}>
        <div className="nav-tabs" style={{marginBottom:0,flex:1,minWidth:0}}>
          {Object.keys(financeViews).map(t=>(
            <div key={t} className={`nav-tab${htab===t?" on":""}`} onClick={()=>setHtab(t)}>{t}</div>
          ))}
        </div>
        <div style={{flex:"0 0 auto",display:"flex",alignItems:"center",gap:10}}>
          {!isCurrentMonth && (
            <span style={{fontSize:11,color:T.amber,background:T.amberS,padding:"3px 9px",borderRadius:12,fontWeight:600,letterSpacing:".04em",textTransform:"uppercase"}}>
              Viewing past
            </span>
          )}
          <MonthPicker/>
        </div>
      </div>

      {financeViews[htab]}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
function MyPal() {
  const [screen, setScreen] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [member, setMember] = useState("family");
  const [theme, setTheme] = useState("light"); // "light" | "dark" | "system"
  /* ── PROTOTYPE ONLY — global "View as" viewer for Health screen ── */
  const [healthViewerId, setHealthViewerId] = useState(H_LOGGED_IN);

  // Resolve actual theme based on selection + system preference
  const getResolved = () => {
    if (theme === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return theme;
  };
  const [resolved, setResolved] = useState(getResolved);

  useEffect(() => {
    const update = () => setResolved(getResolved());
    update();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [theme]);

  // Pick colour tokens based on resolved theme
  const TH = resolved === "light" ? T_LIGHT : T_DARK;
  // Override global T so all child components pick up the right theme
  Object.assign(T, TH);

  const go = s => setScreen(s);
  const publicScreens = ["home","signup","signin"];
  const isPublic = publicScreens.includes(screen);
  const SCREEN_TITLES = {home:"Home",signup:"Sign Up",signin:"Sign In",onboarding:"Getting Started",today:"Today",lifeadmin:"Life Admin",finance:"Finance",health:"Health",recipes:"Recipes & Groceries",travel:"Travel",account:"My Account"};

  const renderScreen = () => {
    switch(screen) {
      case "home":       return <HomePage go={go}/>;
      case "signup":     return <SignUp go={go} setLoggedIn={setLoggedIn}/>;
      case "signin":     return <SignIn go={go} setLoggedIn={setLoggedIn}/>;
      case "onboarding": return <Onboarding go={go}/>;
      case "today":      return <TodayScreen/>;
      case "lifeadmin":  return <LifeAdminScreen/>;
      case "finance":    return <FinanceScreen member={member}/>;
      case "health":     return <HealthScreen member={member} setMember={setMember} viewerId={healthViewerId} setViewerId={setHealthViewerId}/>;
      case "recipes":    return <RecipesScreen/>;
      case "travel":     return <TravelScreen/>;
      case "account":    return <AccountScreen/>;
      default: return <div style={{padding:20,color:T.textS}}>Screen not found</div>;
    }
  };

  // Theme toggle segmented control
  const ThemeToggle = () => (
    <div style={{display:"flex",gap:2,background:T.card2,borderRadius:8,padding:2,border:`1px solid ${T.border}`}}>
      {[["light","☀️"],["system","💻"],["dark","🌙"]].map(([val,icon])=>(
        <div key={val} onClick={()=>setTheme(val)}
          title={val.charAt(0).toUpperCase()+val.slice(1)}
          style={{padding:"4px 9px",borderRadius:6,cursor:"pointer",fontSize:13,
            background:theme===val?T.surface:"transparent",
            color:theme===val?T.warm:T.textS,
            border:theme===val?`1px solid ${T.border}`:"1px solid transparent",
            transition:"all .15s"}}>
          {icon}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <style>{makeCSS(TH)}</style>
      <div className="shell">
        {/* Sidebar */}
        <div className="sb">
          <div className="sb-logo">
            <div className="sb-mark">🤝</div>
            <div>
              <div className="sb-name">MyPal</div>
              <div className="sb-tag">Family OS</div>
            </div>
          </div>

          <div className="sb-lbl">Public</div>
          {NAV.filter(n=>n&&n.type==="public").map(n=>(
            <div key={n.id} className={`si${screen===n.id?" on":""}`} onClick={()=>go(n.id)}>
              <span className="si-ic">{n.icon}</span>{n.label}
            </div>
          ))}

          <div className="sdiv"/>
          <div className="sb-lbl">App</div>
          {NAV.filter(n=>n&&!n.type).map(n=>(
            <div key={n.id} className={`si${screen===n.id?" on":""}`} onClick={()=>go(n.id)} style={{color:screen===n.id?T.warm:T.textS}}>
              <span className="si-ic">{n.icon}</span>{n.label}
            </div>
          ))}

          <div className="sdiv"/>
          {loggedIn && (
            <div className="si" style={{color:T.rose}} onClick={()=>{setLoggedIn(false);go("home")}}>
              <span className="si-ic">🚪</span>Sign Out
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="main">
          <div className="topbar">
            <div className="tb-title">{SCREEN_TITLES[screen]||screen}</div>
            {loggedIn && !isPublic && (
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {MEMBERS.map(m=>(
                  <div key={m.id} className={`tb-chip${member===m.id?" on":""}`} onClick={()=>setMember(m.id)}>
                    <span>{m.av}</span><span>{m.name}</span>
                  </div>
                ))}
              </div>
            )}
            {/* ── PROTOTYPE ONLY — viewer switcher · Claude Code must not implement ── */}
            {!isPublic && (
              <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                <span style={{fontSize:9.5,fontWeight:700,color:T.textS,textTransform:"uppercase",
                  letterSpacing:".07em",flexShrink:0}}>🧪 View as</span>
                {H_MEMBERS.map(m => {
                  const active = healthViewerId === m.id;
                  return (
                    <div key={m.id} onClick={()=>setHealthViewerId(m.id)}
                      style={{display:"flex",alignItems:"center",gap:3,padding:"2px 8px 2px 6px",
                        borderRadius:20,cursor:"pointer",fontSize:11,fontWeight:active?600:400,
                        background:active?m.color+"22":"transparent",
                        border:`1px solid ${active?m.color:T.border}`,
                        color:active?m.color:T.textS,transition:"all .15s",userSelect:"none"}}>
                      <span style={{fontSize:12}}>{m.av}</span>{m.name}
                      <span style={{fontSize:9,opacity:.7,marginLeft:1}}>{m.role}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {!loggedIn && (
              <div style={{display:"flex",gap:8}}>
                <button className="btn-sm" onClick={()=>go("signin")}>Sign in</button>
                <button className="btn-sm btn-warm" onClick={()=>go("signup")}>Sign up free</button>
              </div>
            )}
            <ThemeToggle/>
          </div>
          <div className="content">{renderScreen()}</div>
        </div>
      </div>
    </>
  );
}


window.MyPal = MyPal;
