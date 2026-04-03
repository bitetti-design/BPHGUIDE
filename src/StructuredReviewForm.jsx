import { useState, useEffect, useCallback } from "react";

/*
 * StructuredReviewForm — "Zillow for Prostates" data collection
 * 
 * Multi-step form collecting:
 *   Step 1: Baseline (prostate volume, pre-op IPSS, medication history, trigger)
 *   Step 2: Procedure (treatment type, surgeon/facility, out-of-pocket cost, wait time)
 *   Step 3: Recovery Reality (catheter days, pain scores, back-to-baseline timeline)
 *   Step 4: Outcomes (post-op IPSS, sexual function, "Worth It" rating, free text)
 * 
 * Designed for Supabase REST API insert.
 * Replace SUPABASE_URL and SUPABASE_ANON_KEY with your values.
 */

const SUPABASE_URL = "https://eizeuzksgbbwclmufjay.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpemV1emtzZ2Jid2NsbXVmamF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjU2ODIsImV4cCI6MjA5MDQwMTY4Mn0.ajeZRJE1BuZ2iKi5VOntwxGVvnTmifKWuWCn59Uu8FU";

/* ── IPSS Calculator Questions ── */
const ipssQuestions = [
  { id: "q1", text: "Over the past month, how often have you had a sensation of not emptying your bladder completely after urinating?", short: "Incomplete emptying" },
  { id: "q2", text: "Over the past month, how often have you had to urinate again less than 2 hours after you finished?", short: "Frequency" },
  { id: "q3", text: "Over the past month, how often have you found you stopped and started again several times when you urinated?", short: "Intermittency" },
  { id: "q4", text: "Over the past month, how often have you found it difficult to postpone urination?", short: "Urgency" },
  { id: "q5", text: "Over the past month, how often have you had a weak urinary stream?", short: "Weak stream" },
  { id: "q6", text: "Over the past month, how often have you had to push or strain to begin urination?", short: "Straining" },
  { id: "q7", text: "Over the past month, how many times did you most typically get up at night to urinate?", short: "Nocturia" },
];
const ipssOptions = ["Never", "< 1 in 5", "< Half", "About Half", "More than Half", "Almost Always"];
const nocturiaOptions = ["None", "1 time", "2 times", "3 times", "4 times", "5+ times"];

/* ── Treatment options ── */
const treatmentOptions = [
  "-- Watchful Waiting --",
  "Active Surveillance / Watchful Waiting",
  "-- Medication --",
  "Alpha Blockers (Tamsulosin/Flomax, Alfuzosin, Silodosin)",
  "5-Alpha Reductase Inhibitors (Finasteride/Proscar, Dutasteride/Avodart)",
  "Combination Therapy (Alpha Blocker + 5-ARI)",
  "PDE-5 Inhibitor (Tadalafil/Cialis 5mg daily)",
  "-- Supplements --",
  "Saw Palmetto",
  "Beta-Sitosterol",
  "Pygeum",
  "Stinging Nettle Root",
  "Pumpkin Seed Oil",
  "-- Minimally Invasive --",
  "UroLift (Prostatic Urethral Lift)",
  "Rezūm (Water Vapor Therapy)",
  "iTind (Temporary Implantable Nitinol Device)",
  "PAE (Prostate Artery Embolization)",
  "TUIP (Transurethral Incision)",
  "-- Surgery --",
  "TURP (Transurethral Resection)",
  "HoLEP (Holmium Laser Enucleation)",
  "Greenlight / PVP (Laser Vaporization)",
  "Aquablation (Robotic Waterjet)",
  "Open / Robotic Simple Prostatectomy",
];

/* ── Medication failure options ── */
const medicationOptions = [
  "Tamsulosin (Flomax)",
  "Alfuzosin (Uroxatral)",
  "Silodosin (Rapaflo)",
  "Finasteride (Proscar)",
  "Dutasteride (Avodart)",
  "Tadalafil (Cialis 5mg)",
  "Saw Palmetto",
  "Other supplement",
  "None — went straight to procedure",
];

/* ── "Why Now" triggers ── */
const triggerOptions = [
  "Catheter / acute urinary retention",
  "Waking 4+ times per night (nocturia)",
  "Weak/slow urine flow",
  "Medications stopped working",
  "Medication side effects intolerable",
  "Recurring UTIs or bladder stones",
  "Quality of life — couldn't take it anymore",
  "Doctor recommended it",
  "Other",
];

/* ── Styles ── */
const colors = {
  navy: "#1E3A5F",
  teal: "#4A90A4",
  lightBg: "#F0F4F8",
  white: "#FFFFFF",
  border: "#D1D5DB",
  borderFocus: "#4A90A4",
  error: "#DC2626",
  errorBg: "#FEF2F2",
  green: "#059669",
  greenBg: "#ECFDF5",
  gray: "#6B7280",
  lightGray: "#F9FAFB",
  accent: "#F59E0B",
};

const fontStack = `"Crimson Text", Georgia, serif`;
const bodyFont = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

/* ── Component ── */
export default function StructuredReviewForm({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Anti-spam
  const [formOpenedAt] = useState(Date.now());
  const [honeypot, setHoneypot] = useState("");
  const [captcha, setCaptcha] = useState({ a: 0, b: 0 });
  const [captchaInput, setCaptchaInput] = useState("");

  useEffect(() => {
    setCaptcha({ a: Math.floor(Math.random() * 8) + 2, b: Math.floor(Math.random() * 8) + 2 });
  }, []);

  // Step 1: Baseline
  const [prostateVolume, setProstateVolume] = useState("");
  const [volumeUnknown, setVolumeUnknown] = useState(false);
  const [preIpss, setPreIpss] = useState(Array(7).fill(-1)); // -1 = unanswered
  const [preIpssKnown, setPreIpssKnown] = useState("calculator"); // "calculator" | "direct" | "skip"
  const [preIpssDirectValue, setPreIpssDirectValue] = useState("");
  const [medHistory, setMedHistory] = useState([]);
  const [medDuration, setMedDuration] = useState("");
  const [trigger, setTrigger] = useState([]);

  // Step 2: Procedure
  const [treatment, setTreatment] = useState("");
  const [surgeonName, setSurgeonName] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [facilityState, setFacilityState] = useState("");
  const [outOfPocket, setOutOfPocket] = useState("");
  const [waitWeeks, setWaitWeeks] = useState("");
  const [procedureDate, setProcedureDate] = useState("");

  // Step 3: Recovery
  const [catheterDays, setCatheterDays] = useState("");
  const [painDay1, setPainDay1] = useState(0);
  const [painDay7, setPainDay7] = useState(0);
  const [painDay30, setPainDay30] = useState(0);
  const [daysToNormal, setDaysToNormal] = useState({ drive: "", exercise: "", sex: "" });

  // Step 4: Outcomes
  const [postIpss, setPostIpss] = useState(Array(7).fill(-1));
  const [postIpssMode, setPostIpssMode] = useState("calculator");
  const [postIpssDirectValue, setPostIpssDirectValue] = useState("");
  const [monthsSinceProcedure, setMonthsSinceProcedure] = useState("");
  const [erectileFunction, setErectileFunction] = useState("");
  const [ejaculatoryFunction, setEjaculatoryFunction] = useState("");
  const [worthIt, setWorthIt] = useState("");
  const [overallRating, setOverallRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ── IPSS Score Computation ── */
  const calcIpss = (arr) => {
    if (arr.some(v => v < 0)) return null;
    return arr.reduce((a, b) => a + b, 0);
  };

  const preIpssScore = preIpssKnown === "direct" ? parseInt(preIpssDirectValue) || null
    : preIpssKnown === "calculator" ? calcIpss(preIpss) : null;

  const postIpssScore = postIpssMode === "direct" ? parseInt(postIpssDirectValue) || null
    : postIpssMode === "calculator" ? calcIpss(postIpss) : null;

  const ipssLabel = (score) => {
    if (score === null || score === undefined) return "";
    if (score <= 7) return "Mild";
    if (score <= 19) return "Moderate";
    return "Severe";
  };

  /* ── Validation per step ── */
  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      // Prostate volume and IPSS are encouraged but not strictly required
      if (trigger.length === 0) e.trigger = "Please select at least one reason";
    }
    if (s === 2) {
      if (!treatment || treatment.startsWith("--")) e.treatment = "Please select your treatment";
      if (!procedureDate) e.procedureDate = "Approximate procedure date helps others compare";
    }
    if (s === 3) {
      // All optional but gently encouraged
    }
    if (s === 4) {
      if (!worthIt) e.worthIt = "Please answer the 'Worth It' question";
      if (!overallRating) e.overallRating = "Please give an overall rating";
      if (!displayName.trim()) e.displayName = "A name or initials is required";
      if (reviewText.trim().length < 20) e.reviewText = "Please share at least a sentence or two";
      if (parseInt(captchaInput) !== captcha.a + captcha.b) e.captcha = "Incorrect — please try again";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) setStep(s => Math.min(s + 1, totalSteps));
  };
  const goBack = () => setStep(s => Math.max(s - 1, 1));

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (honeypot) return;
    if (Date.now() - formOpenedAt < 4000) {
      setErrors({ general: "Please take a moment to complete the form." });
      return;
    }
    if (!validateStep(4)) return;
    setSubmitting(true);

    const payload = {
      // Baseline
      prostate_volume: volumeUnknown ? null : (parseInt(prostateVolume) || null),
      prostate_volume_unknown: volumeUnknown,
      pre_ipss: preIpssScore,
      med_history: medHistory.length > 0 ? medHistory.join("; ") : null,
      med_duration: medDuration || null,
      trigger_reasons: trigger.join("; "),
      // Procedure
      treatment,
      surgeon_name: surgeonName.trim() || null,
      facility_name: facilityName.trim() || null,
      facility_state: facilityState.trim() || null,
      out_of_pocket: parseInt(outOfPocket) || null,
      wait_weeks: parseInt(waitWeeks) || null,
      procedure_date: procedureDate || null,
      // Recovery
      catheter_days: parseInt(catheterDays) >= 0 ? parseInt(catheterDays) : null,
      pain_day1: painDay1 || null,
      pain_day7: painDay7 || null,
      pain_day30: painDay30 || null,
      days_to_drive: parseInt(daysToNormal.drive) || null,
      days_to_exercise: parseInt(daysToNormal.exercise) || null,
      days_to_sex: parseInt(daysToNormal.sex) || null,
      // Outcomes
      post_ipss: postIpssScore,
      months_since_procedure: parseInt(monthsSinceProcedure) || null,
      erectile_function: erectileFunction || null,
      ejaculatory_function: ejaculatoryFunction || null,
      worth_it: worthIt,
      rating: overallRating,
      // Display
      name: displayName.trim(),
      age: parseInt(age) || null,
      review_text: reviewText.trim(),
      display_date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      // Legacy compat fields
      recovery: null,
      side_effects: null,
      would_recommend: worthIt === "yes",
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Prefer": "return=representation",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
    } catch {
      setErrors({ general: "Could not connect. Please check your connection and try again." });
    }
    setSubmitting(false);
  };

  /* ── Shared UI helpers ── */
  const sectionTitle = (text) => (
    <h3 style={{ fontFamily: fontStack, fontSize: 22, color: colors.navy, margin: "0 0 4px", fontWeight: 600 }}>{text}</h3>
  );
  const sectionSubtitle = (text) => (
    <p style={{ fontFamily: bodyFont, fontSize: 13, color: colors.gray, margin: "0 0 20px", lineHeight: 1.5 }}>{text}</p>
  );
  const fieldLabel = (text, optional) => (
    <label style={{ fontFamily: bodyFont, fontSize: 14, fontWeight: 600, color: colors.navy, display: "block", marginBottom: 5 }}>
      {text} {optional && <span style={{ fontWeight: 400, color: colors.gray, fontSize: 12 }}>(optional)</span>}
    </label>
  );
  const errorMsg = (key) => errors[key] ? (
    <p style={{ fontFamily: bodyFont, fontSize: 12, color: colors.error, margin: "4px 0 0" }}>{errors[key]}</p>
  ) : null;
  const inputStyle = (hasError) => ({
    fontFamily: bodyFont, fontSize: 14, padding: "10px 14px", border: `1.5px solid ${hasError ? colors.error : colors.border}`,
    borderRadius: 8, width: "100%", boxSizing: "border-box", outline: "none", transition: "border-color 0.2s",
    background: hasError ? colors.errorBg : colors.white,
  });
  const chipStyle = (selected) => ({
    fontFamily: bodyFont, fontSize: 13, padding: "8px 16px", borderRadius: 20,
    border: `1.5px solid ${selected ? colors.teal : colors.border}`,
    background: selected ? "#E0F2FE" : colors.white,
    color: selected ? colors.navy : colors.gray,
    cursor: "pointer", transition: "all 0.15s", fontWeight: selected ? 600 : 400,
    display: "inline-block", margin: "0 6px 8px 0", userSelect: "none",
  });

  /* ── Pain Slider ── */
  const PainSlider = ({ value, onChange, label }) => {
    const painColor = value <= 3 ? colors.green : value <= 6 ? colors.accent : colors.error;
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontFamily: bodyFont, fontSize: 13, color: colors.navy, fontWeight: 500 }}>{label}</span>
          <span style={{ fontFamily: bodyFont, fontSize: 14, fontWeight: 700, color: value > 0 ? painColor : colors.gray }}>
            {value > 0 ? `${value}/10` : "—"}
          </span>
        </div>
        <input type="range" min="0" max="10" value={value} onChange={(e) => onChange(parseInt(e.target.value))}
          style={{ width: "100%", accentColor: painColor, cursor: "pointer" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: colors.gray }}>No pain</span>
          <span style={{ fontSize: 11, color: colors.gray }}>Worst pain</span>
        </div>
      </div>
    );
  };

  /* ── IPSS Calculator Widget ── */
  const IpssCalculator = ({ values, setValues, prefix }) => {
    const score = calcIpss(values);
    return (
      <div style={{ background: colors.lightBg, borderRadius: 12, padding: 20, marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: bodyFont, fontSize: 14, fontWeight: 600, color: colors.navy }}>IPSS Questionnaire</span>
          {score !== null && (
            <span style={{
              fontFamily: bodyFont, fontSize: 14, fontWeight: 700, padding: "4px 14px", borderRadius: 20,
              background: score <= 7 ? colors.greenBg : score <= 19 ? "#FEF9C3" : colors.errorBg,
              color: score <= 7 ? colors.green : score <= 19 ? "#92400E" : colors.error,
            }}>
              Score: {score} — {ipssLabel(score)}
            </span>
          )}
        </div>
        {ipssQuestions.map((q, i) => {
          const opts = i === 6 ? nocturiaOptions : ipssOptions;
          return (
            <div key={q.id} style={{ marginBottom: 14 }}>
              <p style={{ fontFamily: bodyFont, fontSize: 13, color: colors.navy, margin: "0 0 6px", fontWeight: 500 }}>
                {i + 1}. {q.short}
              </p>
              <p style={{ fontFamily: bodyFont, fontSize: 12, color: colors.gray, margin: "0 0 8px", lineHeight: 1.4 }}>{q.text}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {opts.map((opt, oi) => (
                  <button key={oi} type="button" onClick={() => {
                    const next = [...values]; next[i] = oi; setValues(next);
                  }}
                    style={{
                      fontFamily: bodyFont, fontSize: 12, padding: "6px 12px", borderRadius: 6,
                      border: `1.5px solid ${values[i] === oi ? colors.teal : colors.border}`,
                      background: values[i] === oi ? "#E0F2FE" : colors.white,
                      color: values[i] === oi ? colors.navy : colors.gray,
                      cursor: "pointer", fontWeight: values[i] === oi ? 600 : 400,
                    }}>
                    {oi} — {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ── Star Rating ── */
  const StarRating = ({ value, onChange, size = 28 }) => (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} onClick={() => onChange(star)}
          style={{ fontSize: size, cursor: "pointer", color: star <= value ? colors.accent : "#D1D5DB", transition: "color 0.15s" }}>
          ★
        </span>
      ))}
    </div>
  );

  /* ── Progress Bar ── */
  const ProgressBar = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
      {["Your Baseline", "Procedure Details", "Recovery Reality", "Outcomes & Review"].map((label, i) => {
        const stepNum = i + 1;
        const isActive = step === stepNum;
        const isDone = step > stepNum;
        return (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              height: 4, borderRadius: 2, marginBottom: 6,
              background: isDone ? colors.green : isActive ? colors.teal : "#E5E7EB",
              transition: "background 0.3s",
            }} />
            <span style={{
              fontFamily: bodyFont, fontSize: 11, fontWeight: isActive ? 700 : 400,
              color: isActive ? colors.navy : isDone ? colors.green : colors.gray,
            }}>
              {isDone ? "✓ " : ""}{label}
            </span>
          </div>
        );
      })}
    </div>
  );

  /* ── Success Screen ── */
  if (submitted) {
    return (
      <div style={{ background: colors.white, borderRadius: 16, border: `1.5px solid #E5E7EB`, padding: 40, textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <h3 style={{ fontFamily: fontStack, fontSize: 24, color: colors.navy, margin: "0 0 12px" }}>Thank you for contributing</h3>
        <p style={{ fontFamily: bodyFont, fontSize: 15, color: colors.gray, lineHeight: 1.6, margin: "0 0 8px" }}>
          Your structured review helps other men find their "prostate twin" and make better-informed decisions.
        </p>
        <p style={{ fontFamily: bodyFont, fontSize: 13, color: colors.teal, fontWeight: 600 }}>
          We may email you at 3, 6, and 12 months to ask how things are going — longitudinal data is the most valuable kind.
        </p>
        {onClose && (
          <button onClick={onClose} style={{
            fontFamily: bodyFont, fontSize: 14, fontWeight: 600, padding: "12px 32px", borderRadius: 8,
            background: colors.navy, color: colors.white, border: "none", cursor: "pointer", marginTop: 24,
          }}>
            Back to BPH Guide
          </button>
        )}
      </div>
    );
  }

  /* ── Main Form ── */
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", fontFamily: bodyFont }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: fontStack, fontSize: 28, color: colors.navy, margin: "0 0 6px" }}>
          Share Your BPH Experience
        </h2>
        <p style={{ fontSize: 14, color: colors.gray, margin: 0, lineHeight: 1.5 }}>
          Your data helps other men find their "prostate twin" — someone with similar anatomy, symptoms, and treatment.
          <br />The more detail you share, the more useful it becomes.
        </p>
      </div>

      <ProgressBar />

      <div style={{ background: colors.white, borderRadius: 16, border: `1.5px solid #E5E7EB`, padding: "28px 28px 20px", minHeight: 340 }}>

        {/* ── STEP 1: BASELINE ── */}
        {step === 1 && (
          <div>
            {sectionTitle("📊 Your Baseline")}
            {sectionSubtitle("Help others compare apples to apples. A 50g prostate and a 150g prostate are completely different situations.")}

            {/* Prostate Volume */}
            <div style={{ marginBottom: 20 }}>
              {fieldLabel("Prostate volume (cc or grams)", true)}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="number" placeholder="e.g. 65" value={prostateVolume} disabled={volumeUnknown}
                  onChange={(e) => setProstateVolume(e.target.value)}
                  style={{ ...inputStyle(false), maxWidth: 120, opacity: volumeUnknown ? 0.4 : 1 }} />
                <label style={{ fontSize: 13, color: colors.gray, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="checkbox" checked={volumeUnknown} onChange={(e) => { setVolumeUnknown(e.target.checked); if (e.target.checked) setProstateVolume(""); }} />
                  I don't know my prostate size
                </label>
              </div>
              <p style={{ fontSize: 12, color: colors.gray, margin: "4px 0 0" }}>
                Ask your urologist — it's on your ultrasound or MRI report. Normal is ~25cc; many BPH patients are 40–120cc.
              </p>
            </div>

            {/* Pre-Op IPSS */}
            <div style={{ marginBottom: 20 }}>
              {fieldLabel("Pre-procedure IPSS score (symptom severity)", true)}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {[
                  { val: "calculator", label: "Calculate it now (7 quick questions)" },
                  { val: "direct", label: "I know my score" },
                  { val: "skip", label: "Skip this" },
                ].map(opt => (
                  <span key={opt.val} onClick={() => setPreIpssKnown(opt.val)} style={chipStyle(preIpssKnown === opt.val)}>{opt.label}</span>
                ))}
              </div>
              {preIpssKnown === "calculator" && <IpssCalculator values={preIpss} setValues={setPreIpss} prefix="pre" />}
              {preIpssKnown === "direct" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <input type="number" min="0" max="35" placeholder="0–35" value={preIpssDirectValue}
                    onChange={(e) => setPreIpssDirectValue(e.target.value)} style={{ ...inputStyle(false), maxWidth: 100 }} />
                  {preIpssScore !== null && (
                    <span style={{ fontSize: 13, fontWeight: 600, color: preIpssScore <= 7 ? colors.green : preIpssScore <= 19 ? "#92400E" : colors.error }}>
                      {ipssLabel(preIpssScore)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Medication History */}
            <div style={{ marginBottom: 20 }}>
              {fieldLabel("What medications/supplements did you try before this?", true)}
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {medicationOptions.map(med => (
                  <span key={med} onClick={() => setMedHistory(prev => prev.includes(med) ? prev.filter(m => m !== med) : [...prev, med])}
                    style={chipStyle(medHistory.includes(med))}>
                    {med}
                  </span>
                ))}
              </div>
              {medHistory.length > 0 && medHistory[0] !== "None — went straight to procedure" && (
                <div style={{ marginTop: 8 }}>
                  <input type="text" placeholder="How long were you on medication? e.g. '2 years on Flomax'" value={medDuration}
                    onChange={(e) => setMedDuration(e.target.value)} style={{ ...inputStyle(false), maxWidth: 350 }} />
                </div>
              )}
            </div>

            {/* Trigger */}
            <div style={{ marginBottom: 8 }}>
              {fieldLabel("What finally pushed you to act? (select all that apply)")}
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {triggerOptions.map(t => (
                  <span key={t} onClick={() => setTrigger(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                    style={chipStyle(trigger.includes(t))}>
                    {t}
                  </span>
                ))}
              </div>
              {errorMsg("trigger")}
            </div>
          </div>
        )}

        {/* ── STEP 2: PROCEDURE ── */}
        {step === 2 && (
          <div>
            {sectionTitle("🏥 Procedure Details")}
            {sectionSubtitle("Turning the lights on — help others understand the full picture of what a procedure actually involves.")}

            {/* Treatment */}
            <div style={{ marginBottom: 20 }}>
              {fieldLabel("Which treatment are you reviewing?")}
              <select value={treatment} onChange={(e) => setTreatment(e.target.value)}
                style={{ ...inputStyle(errors.treatment), cursor: "pointer", appearance: "auto" }}>
                <option value="">Select treatment...</option>
                {treatmentOptions.map(t => (
                  <option key={t} value={t} disabled={t.startsWith("--")}
                    style={{ fontWeight: t.startsWith("--") ? 700 : 400, color: t.startsWith("--") ? colors.navy : undefined }}>
                    {t}
                  </option>
                ))}
              </select>
              {errorMsg("treatment")}
            </div>

            {/* Procedure Date */}
            <div style={{ marginBottom: 20 }}>
              {fieldLabel("Approximate procedure date")}
              <input type="month" value={procedureDate} onChange={(e) => setProcedureDate(e.target.value)}
                style={{ ...inputStyle(errors.procedureDate), maxWidth: 220 }} />
              {errorMsg("procedureDate")}
            </div>

            {/* Surgeon / Facility — collected but not published */}
            <div style={{ background: colors.lightBg, borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: colors.teal, fontWeight: 600, margin: "0 0 10px" }}>
                🔒 Surgeon/facility info is stored privately to help verify data quality. It will NOT appear publicly.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  {fieldLabel("Surgeon name", true)}
                  <input type="text" placeholder="e.g. Dr. Smith" value={surgeonName}
                    onChange={(e) => setSurgeonName(e.target.value)} style={inputStyle(false)} />
                </div>
                <div>
                  {fieldLabel("Facility / hospital", true)}
                  <input type="text" placeholder="e.g. Johns Hopkins" value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)} style={inputStyle(false)} />
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                {fieldLabel("State", true)}
                <input type="text" placeholder="e.g. NJ" value={facilityState} maxLength={2}
                  onChange={(e) => setFacilityState(e.target.value.toUpperCase())} style={{ ...inputStyle(false), maxWidth: 80 }} />
              </div>
            </div>

            {/* Cost & Wait */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 8 }}>
              <div>
                {fieldLabel("Total out-of-pocket cost ($)", true)}
                <input type="number" placeholder="e.g. 1500" value={outOfPocket}
                  onChange={(e) => setOutOfPocket(e.target.value)} style={inputStyle(false)} />
                <p style={{ fontSize: 11, color: colors.gray, margin: "3px 0 0" }}>After insurance — what YOU paid</p>
              </div>
              <div>
                {fieldLabel("Weeks from consult → procedure", true)}
                <input type="number" placeholder="e.g. 6" value={waitWeeks}
                  onChange={(e) => setWaitWeeks(e.target.value)} style={inputStyle(false)} />
                <p style={{ fontSize: 11, color: colors.gray, margin: "3px 0 0" }}>From first visit to operating day</p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: RECOVERY ── */}
        {step === 3 && (
          <div>
            {sectionTitle("🩹 Recovery Reality")}
            {sectionSubtitle("Clinical trials say 'return to work in 3 days.' We want to know what actually happened.")}

            {/* Catheter */}
            <div style={{ marginBottom: 24 }}>
              {fieldLabel("Days with a catheter after the procedure", true)}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="number" min="0" placeholder="e.g. 5" value={catheterDays}
                  onChange={(e) => setCatheterDays(e.target.value)} style={{ ...inputStyle(false), maxWidth: 100 }} />
                <span style={{ fontSize: 13, color: colors.gray }}>days</span>
                <span onClick={() => setCatheterDays("0")}
                  style={{ ...chipStyle(catheterDays === "0"), marginBottom: 0 }}>No catheter</span>
              </div>
              <p style={{ fontSize: 12, color: colors.gray, margin: "4px 0 0" }}>
                This is the #1 thing men want to know. Be honest — it really helps.
              </p>
            </div>

            {/* Pain Scores */}
            <div style={{ marginBottom: 24 }}>
              {fieldLabel("Pain level (0 = no pain, 10 = worst imaginable)", true)}
              <PainSlider value={painDay1} onChange={setPainDay1} label="Day 1 (day of procedure)" />
              <PainSlider value={painDay7} onChange={setPainDay7} label="Day 7 (one week later)" />
              <PainSlider value={painDay30} onChange={setPainDay30} label="Day 30 (one month later)" />
            </div>

            {/* Back to Baseline */}
            <div style={{ marginBottom: 8 }}>
              {fieldLabel("How many days until you could...", true)}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { key: "drive", label: "🚗 Drive", placeholder: "e.g. 3" },
                  { key: "exercise", label: "🏋️ Exercise", placeholder: "e.g. 14" },
                  { key: "sex", label: "🔒 Sexual activity", placeholder: "e.g. 30" },
                ].map(f => (
                  <div key={f.key}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: colors.navy, display: "block", marginBottom: 4 }}>{f.label}</span>
                    <input type="number" min="0" placeholder={f.placeholder} value={daysToNormal[f.key]}
                      onChange={(e) => setDaysToNormal(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ ...inputStyle(false) }} />
                    <span style={{ fontSize: 11, color: colors.gray }}>days</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: OUTCOMES ── */}
        {step === 4 && (
          <div>
            {sectionTitle("📈 Outcomes & Your Review")}
            {sectionSubtitle("This is the data that makes BPH Guide truly valuable — how are things now?")}

            {/* Months since */}
            <div style={{ marginBottom: 20 }}>
              {fieldLabel("How many months since your procedure?")}
              <input type="number" min="0" placeholder="e.g. 6" value={monthsSinceProcedure}
                onChange={(e) => setMonthsSinceProcedure(e.target.value)} style={{ ...inputStyle(false), maxWidth: 120 }} />
            </div>

            {/* Post-op IPSS */}
            <div style={{ marginBottom: 20 }}>
              {fieldLabel("Current IPSS score (post-procedure)", true)}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {[
                  { val: "calculator", label: "Calculate it now" },
                  { val: "direct", label: "I know my score" },
                  { val: "skip", label: "Skip" },
                ].map(opt => (
                  <span key={opt.val} onClick={() => setPostIpssMode(opt.val)} style={chipStyle(postIpssMode === opt.val)}>{opt.label}</span>
                ))}
              </div>
              {postIpssMode === "calculator" && <IpssCalculator values={postIpss} setValues={setPostIpss} prefix="post" />}
              {postIpssMode === "direct" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <input type="number" min="0" max="35" placeholder="0–35" value={postIpssDirectValue}
                    onChange={(e) => setPostIpssDirectValue(e.target.value)} style={{ ...inputStyle(false), maxWidth: 100 }} />
                  {postIpssScore !== null && (
                    <span style={{ fontSize: 13, fontWeight: 600, color: postIpssScore <= 7 ? colors.green : postIpssScore <= 19 ? "#92400E" : colors.error }}>
                      {ipssLabel(postIpssScore)}
                    </span>
                  )}
                </div>
              )}
              {preIpssScore !== null && postIpssScore !== null && (
                <div style={{
                  marginTop: 10, padding: "10px 16px", borderRadius: 8,
                  background: postIpssScore < preIpssScore ? colors.greenBg : colors.errorBg,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 20 }}>{postIpssScore < preIpssScore ? "📉" : "📈"}</span>
                  <span style={{ fontFamily: bodyFont, fontSize: 14, fontWeight: 600, color: postIpssScore < preIpssScore ? colors.green : colors.error }}>
                    IPSS went from {preIpssScore} → {postIpssScore} ({preIpssScore - postIpssScore > 0 ? "-" : "+"}{Math.abs(preIpssScore - postIpssScore)} points, {Math.round(((preIpssScore - postIpssScore) / preIpssScore) * 100)}% {postIpssScore < preIpssScore ? "improvement" : "worse"})
                  </span>
                </div>
              )}
            </div>

            {/* Sexual Function */}
            <div style={{ marginBottom: 20 }}>
              {fieldLabel("Sexual function impact")}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: colors.navy, display: "block", marginBottom: 6 }}>Erectile function</span>
                  {["Better", "Same", "Worse", "N/A"].map(opt => (
                    <span key={opt} onClick={() => setErectileFunction(opt)} style={chipStyle(erectileFunction === opt)}>{opt}</span>
                  ))}
                </div>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: colors.navy, display: "block", marginBottom: 6 }}>Ejaculatory function</span>
                  {["Normal", "Reduced volume", "Retrograde (dry)", "N/A"].map(opt => (
                    <span key={opt} onClick={() => setEjaculatoryFunction(opt)} style={chipStyle(ejaculatoryFunction === opt)}>{opt}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Worth It */}
            <div style={{ marginBottom: 20, background: colors.lightBg, borderRadius: 12, padding: 20 }}>
              {fieldLabel("Knowing everything you know now — was it worth it?")}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                {[
                  { val: "yes", label: "✅ Yes", bg: colors.greenBg, border: colors.green },
                  { val: "not_sure", label: "🤷 Not sure yet", bg: "#FEF9C3", border: "#D97706" },
                  { val: "no", label: "❌ No", bg: colors.errorBg, border: colors.error },
                ].map(opt => (
                  <button key={opt.val} type="button" onClick={() => setWorthIt(opt.val)}
                    style={{
                      fontFamily: bodyFont, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 10,
                      border: `2px solid ${worthIt === opt.val ? opt.border : colors.border}`,
                      background: worthIt === opt.val ? opt.bg : colors.white,
                      cursor: "pointer", flex: 1, transition: "all 0.15s",
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {errorMsg("worthIt")}
            </div>

            {/* Overall Rating */}
            <div style={{ marginBottom: 20 }}>
              {fieldLabel("Overall experience rating")}
              <StarRating value={overallRating} onChange={setOverallRating} />
              {errorMsg("overallRating")}
            </div>

            {/* Free Text */}
            <div style={{ marginBottom: 20 }}>
              {fieldLabel("Tell your story")}
              <textarea rows={5} placeholder="What do you wish you had known before? What surprised you? What advice would you give someone in your situation?"
                value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                style={{ ...inputStyle(errors.reviewText), resize: "vertical", lineHeight: 1.5 }} />
              <p style={{ fontSize: 12, color: colors.gray, margin: "3px 0 0" }}>{reviewText.trim().length}/20 characters minimum</p>
              {errorMsg("reviewText")}
            </div>

            {/* Display Info */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                {fieldLabel("Display name (first name + last initial)")}
                <input type="text" placeholder="e.g. Robert M." value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)} style={inputStyle(errors.displayName)} />
                {errorMsg("displayName")}
              </div>
              <div>
                {fieldLabel("Age", true)}
                <input type="number" min="30" max="100" placeholder="e.g. 65" value={age}
                  onChange={(e) => setAge(e.target.value)} style={inputStyle(false)} />
              </div>
            </div>

            {/* Honeypot */}
            <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
              <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
            </div>

            {/* Captcha */}
            <div style={{ marginBottom: 12 }}>
              {fieldLabel(`Quick check: What is ${captcha.a} + ${captcha.b}?`)}
              <input type="number" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)}
                style={{ ...inputStyle(errors.captcha), maxWidth: 100 }} />
              {errorMsg("captcha")}
            </div>

            {errors.general && (
              <p style={{ fontFamily: bodyFont, fontSize: 13, color: colors.error, background: colors.errorBg, padding: "10px 14px", borderRadius: 8 }}>
                {errors.general}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation Buttons ── */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        {step > 1 ? (
          <button onClick={goBack}
            style={{
              fontFamily: bodyFont, fontSize: 14, fontWeight: 600, padding: "12px 28px", borderRadius: 8,
              background: colors.white, color: colors.navy, border: `1.5px solid ${colors.border}`, cursor: "pointer",
            }}>
            ← Back
          </button>
        ) : <div />}

        {step < totalSteps ? (
          <button onClick={goNext}
            style={{
              fontFamily: bodyFont, fontSize: 14, fontWeight: 600, padding: "12px 32px", borderRadius: 8,
              background: colors.navy, color: colors.white, border: "none", cursor: "pointer",
            }}>
            Continue →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            style={{
              fontFamily: bodyFont, fontSize: 14, fontWeight: 700, padding: "12px 36px", borderRadius: 8,
              background: submitting ? colors.gray : colors.green, color: colors.white, border: "none", cursor: submitting ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}>
            {submitting ? "Submitting..." : "Submit Review ✓"}
          </button>
        )}
      </div>
    </div>
  );
}
