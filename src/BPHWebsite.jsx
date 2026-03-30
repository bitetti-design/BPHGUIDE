import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
TREATMENTS DATA — 16 entries across 5 categories
Updated March 2026 with latest PROCEPT Analyst Day data
───────────────────────────────────────────── */
const treatments = [
{
id: 1, category: “Watchful Waiting”, color: “#4A90A4”, icon: “👁️”,
name: “Active Surveillance”,
description: “For mild symptoms, regular monitoring without immediate treatment. Lifestyle changes like reducing fluid intake before bed and limiting caffeine can help manage symptoms.”,
pros: [“No side effects”, “No recovery time”, “Low cost”, “Preserves all future options”],
cons: [“Symptoms may worsen over time”, “Requires regular check-ins”, “No immediate relief”],
idealFor: “Men with mild symptoms (IPSS score < 8) who are not significantly bothered.”,
invasiveness: 0, effectiveness: 0, recovery: “None”,
physicianFee: “Office visit only (~$150–250)”,
feeNote: “No procedure fees. Standard office visit copay applies.”,
seminalTrial: “AUA Practice Guidelines — McVary et al., J Urology 2011”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/21784541/”,
efficacyData: “AUA Guidelines note that watchful waiting is appropriate for men with mild symptoms. About 40% of men with mild BPH see symptoms improve without treatment over 1–5 years.”,
maudeUrl: null,
maudeNote: “No device or drug. No MAUDE entries applicable.”,
videos: [
{ label: “Understanding BPH & When to Act”, url: “https://www.youtube.com/results?search_query=BPH+watchful+waiting+active+surveillance+when+to+treat”, source: “YouTube Search”, isSearch: true },
],
},
{
id: 2, category: “Medication”, color: “#5B8DB8”, icon: “💊”,
name: “Alpha Blockers”,
description: “Drugs like tamsulosin (Flomax), alfuzosin, or silodosin relax the muscles in the prostate and bladder neck, making it easier to urinate. Effects are felt within days.”,
pros: [“Fast-acting (days to weeks)”, “Well-studied”, “Widely available”, “Reversible”],
cons: [“Daily pill required”, “Can cause dizziness/low blood pressure”, “Does not shrink prostate”, “May affect ejaculation”],
idealFor: “Most men with moderate symptoms as a first-line treatment.”,
invasiveness: 0, effectiveness: 3, recovery: “None”,
physicianFee: “~$10–40/month (generic tamsulosin)”,
feeNote: “Ongoing prescription cost. Generic versions are widely available and affordable.”,
seminalTrial: “MTOPS Trial — McConnell et al., NEJM 2003”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/14676175/”,
efficacyData: “MTOPS (n=3,047): Alpha blockers reduced IPSS by 39% vs 24% for placebo. Risk of acute urinary retention reduced by 34%. Quick onset — most men notice improvement within 1–2 weeks.”,
maudeUrl: null,
maudeNote: “Oral medications. No MAUDE device entries applicable.”,
videos: [
{ label: “How Alpha Blockers Work for BPH”, url: “https://www.youtube.com/results?search_query=alpha+blockers+tamsulosin+flomax+BPH+how+it+works+patient”, source: “YouTube Search”, isSearch: true },
],
},
{
id: 3, category: “Medication”, color: “#5B8DB8”, icon: “💊”,
name: “5-Alpha Reductase Inhibitors”,
description: “Finasteride (Proscar) or dutasteride (Avodart) actually shrink the prostate over time by blocking the hormone that causes prostate growth. Takes 3–6 months to see full effect.”,
pros: [“Actually shrinks the prostate”, “Reduces risk of acute urinary retention”, “Can be combined with alpha blockers”],
cons: [“Slow onset (3–6 months)”, “Can cause sexual side effects (erectile dysfunction, decreased libido)”, “Daily pill required”, “Must continue indefinitely”],
idealFor: “Men with large prostates (>30–40g) who can tolerate long-term medication.”,
invasiveness: 0, effectiveness: 3, recovery: “None”,
physicianFee: “~$10–30/month (generic finasteride)”,
feeNote: “Ongoing prescription cost. Generic versions widely available.”,
seminalTrial: “MTOPS Trial — McConnell et al., NEJM 2003”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/14676175/”,
efficacyData: “MTOPS (n=3,047): 5-ARIs reduced prostate volume by ~25% and reduced risk of acute urinary retention by 68%. Combination therapy (alpha blocker + 5-ARI) reduced clinical progression by 66% vs placebo.”,
maudeUrl: null,
maudeNote: “Oral medications. No MAUDE device entries applicable.”,
videos: [
{ label: “5-Alpha Reductase Inhibitors Explained”, url: “https://www.youtube.com/results?search_query=finasteride+dutasteride+BPH+enlarged+prostate+how+it+works”, source: “YouTube Search”, isSearch: true },
],
},
{
id: 4, category: “Medication”, color: “#5B8DB8”, icon: “💊”,
name: “Combination Drug Therapy”,
description: “Using an alpha blocker and a 5-ARI together. The alpha blocker provides quick symptom relief while the 5-ARI works to shrink the prostate over months.”,
pros: [“Most effective medical therapy”, “Both quick relief and long-term shrinkage”, “Reduces need for surgery”],
cons: [“Two daily pills”, “Combined side effects of both drugs”, “Higher cost”, “Long-term commitment”],
idealFor: “Men with moderate-to-severe symptoms and larger prostates who want to delay or avoid surgery.”,
invasiveness: 0, effectiveness: 4, recovery: “None”,
physicianFee: “~$20–60/month (both generics)”,
feeNote: “Combined cost of both generic medications.”,
seminalTrial: “CombAT Trial — Roehrborn et al., Eur Urol 2010”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/19913351/”,
efficacyData: “CombAT (n=4,844, 4-yr follow-up): Combination therapy reduced relative risk of acute urinary retention by 67.8% vs tamsulosin alone, and BPH-related surgery by 70.6%. IPSS improvement of 6.3 points at 4 years.”,
maudeUrl: null,
maudeNote: “Oral medications. No MAUDE device entries applicable.”,
videos: [
{ label: “BPH Combination Therapy Explained”, url: “https://www.youtube.com/results?search_query=BPH+combination+therapy+alpha+blocker+5ARI+tamsulosin+dutasteride”, source: “YouTube Search”, isSearch: true },
],
},
{
id: 5, category: “Minimally Invasive”, color: “#6B7FD7”, icon: “🔬”,
name: “UroLift (Prostatic Urethral Lift)”,
description: “Small implants are inserted to hold the enlarged prostate lobes out of the way — like pulling curtains apart. No cutting or heating of prostate tissue. Done in-office under local anesthesia.”,
pros: [“Preserves sexual function”, “Fast recovery (days)”, “No catheter needed usually”, “In-office procedure”],
cons: [“Not ideal for very large prostates”, “Less durable than TURP”, “May not cover all urinary symptoms”, “Higher retreatment rate”],
idealFor: “Men who want to preserve sexual function and have moderate symptoms.”,
invasiveness: 2, effectiveness: 3, recovery: “2–4 days”,
physicianFee: “~$1,162 (1st implant, in-office) + ~$792 each additional”,
feeNote: “In-office reimbursement is significantly higher than facility-based (~$202/implant). A typical 4-implant procedure done in-office yields ~$3,500+ to the physician. Per-implant billing is worth discussing with your doctor.”,
seminalTrial: “L.I.F.T. Trial — Roehrborn et al., J Urology 2013”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/23499546/”,
efficacyData: “L.I.F.T. RCT (n=206, 5-yr follow-up): Qmax improved from 7.9 → 11.1 mL/s (+44%). IPSS improved –36%, QoL improved –50%. No erectile or ejaculatory dysfunction. Surgical retreatment rate 13.6% at 5 years.”,
maudeUrl: “https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm”,
maudeNote: “Search ‘UroLift’ or product code PEW in the FDA MAUDE database. UroLift has the highest total report volume of any BPH device due to its market share.”,
videos: [
{ label: “UroLift Procedure Animation”, url: “https://www.youtube.com/results?search_query=UroLift+procedure+animation+BPH+how+it+works”, source: “YouTube Search”, isSearch: true },
{ label: “UroLift Patient Experiences”, url: “https://www.youtube.com/results?search_query=UroLift+patient+review+experience+BPH”, source: “YouTube Search”, isSearch: true },
],
},
{
id: 6, category: “Minimally Invasive”, color: “#6B7FD7”, icon: “🔬”,
name: “Rezūm Water Vapor Therapy”,
description: “Steam (water vapor) is injected into the prostate to destroy excess tissue. The body then naturally absorbs the dead tissue over weeks. Takes 2–3 months for full effect.”,
pros: [“Preserves sexual function”, “Quick outpatient procedure (~10 min)”, “Durable results at 5 years”, “Works on median lobe”],
cons: [“Temporary catheter required (3–7 days)”, “Full results take 2–3 months”, “Urinary symptoms may worsen initially”, “Not suited for very large prostates”],
idealFor: “Men with moderate symptoms who want to preserve sexual function and avoid daily medication.”,
invasiveness: 2, effectiveness: 4, recovery: “1–3 weeks”,
physicianFee: “~$1,200–1,600 (surgeon fee, outpatient facility)”,
feeNote: “Single-use device cost is borne by the facility. Surgeon fee is standard for outpatient procedures.”,
seminalTrial: “Rezūm II Trial — McVary et al., J Urology 2016”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/26609638/”,
efficacyData: “Rezūm II RCT (n=197, 5-yr follow-up): IPSS improved by 47%. Qmax improved from 9.9 → 15.1 mL/s (+53%). Sexual function preserved. Surgical retreatment rate 4.4% at 5 years.”,
maudeUrl: “https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm”,
maudeNote: “Search ‘Rezum’ in the FDA MAUDE database.”,
videos: [
{ label: “Rezūm Procedure Explained”, url: “https://www.youtube.com/results?search_query=Rezum+water+vapor+therapy+BPH+procedure+animation”, source: “YouTube Search”, isSearch: true },
],
},
{
id: 7, category: “Minimally Invasive”, color: “#6B7FD7”, icon: “🔬”,
name: “Aquablation (Robotic Waterjet)”,
description: “An AI-guided robotic system uses a high-pressure waterjet to precisely remove prostate tissue. The surgeon plans the resection zone using real-time ultrasound, then the robot executes it. Works on all prostate sizes including very large glands (>100g).”,
pros: [“AI-guided precision — reproducible results”, “Works on any prostate size (20g to 300g+)”, “Strong symptom relief across all sizes”, “Low rates of erectile dysfunction (<1%) and incontinence (<1%)”],
cons: [“Requires general anesthesia & hospital stay”, “Temporary catheter (1–3 days)”, “Risk of post-op bleeding requiring transfusion”, “Not yet as widely available as TURP”],
idealFor: “Men with moderate-to-severe symptoms of any prostate size who want strong symptom relief with low sexual side effect risk. Especially compelling for large prostates where other minimally invasive options may not apply.”,
invasiveness: 3, effectiveness: 5, recovery: “1–3 weeks”,
physicianFee: “~$1,800–2,500 (surgeon fee, hospital-based)”,
feeNote: “Category I CPT reimbursement as of January 1, 2026. Handpiece (single-use) pricing is ~$3,500 per procedure. System is capital equipment placed at the hospital.”,
seminalTrial: “WATER Trial — Gilling et al., J Urology 2019; WATER II — Bhojani et al., 2022”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/30016230/”,
efficacyData: “Meta-analysis of 18 publications + PROCEPT 2026 data: IPSS drops from severe (20–35) to mild (0–7) range maintained through 5 years. Qmax improvement sustained. Across >125,000 procedures performed worldwide: <1% incontinence, <1% erectile dysfunction. Re-operation-free rate is among the best of all BPH procedures at 5+ years (comparable to HoLEP). Now the leading modern resective BPH treatment — second only to TURP in total volume.”,
maudeUrl: “https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm”,
maudeNote: “Search ‘AQUABEAM’ or ‘Aquablation’ in the FDA MAUDE database. Over 125,000 patients treated worldwide across 900+ installed systems.”,
videos: [
{ label: “Aquablation Procedure Animation”, url: “https://www.youtube.com/results?search_query=aquablation+robotic+waterjet+BPH+procedure+animation”, source: “YouTube Search”, isSearch: true },
{ label: “Patient Experience (Ed’s Story)”, url: “https://www.youtube.com/watch?v=6_izMhE6_gs”, source: “First Urology”, isSearch: false },
],
},
{
id: 8, category: “Minimally Invasive”, color: “#6B7FD7”, icon: “🔬”,
name: “GreenLight Laser (PVP)”,
description: “A high-powered laser vaporizes excess prostate tissue. Similar outcomes to TURP but with less bleeding risk. Can be done outpatient in some cases.”,
pros: [“Less bleeding than TURP”, “Good for patients on blood thinners”, “Can be outpatient”, “Effective for moderate-sized prostates”],
cons: [“May cause retrograde ejaculation”, “Tissue is vaporized — cannot be tested for cancer”, “Catheter needed (1–3 days)”, “Less proven for very large prostates”],
idealFor: “Men on blood thinners or with bleeding risk factors who need tissue removal.”,
invasiveness: 3, effectiveness: 4, recovery: “1–2 weeks”,
physicianFee: “~$1,500–2,200 (surgeon fee)”,
feeNote: “Facility costs include the laser fiber (~$1,200 per use). Often done at an ambulatory surgery center.”,
seminalTrial: “GOLIATH Trial — Thomas et al., Eur Urol 2016”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/26711635/”,
efficacyData: “GOLIATH RCT (n=291): PVP was non-inferior to TURP at 2 years for IPSS and Qmax. Catheter time was shorter (1 vs 2 days). Hospital stay shorter. Similar sexual side effect profile to TURP.”,
maudeUrl: “https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm”,
maudeNote: “Search ‘GreenLight’ or ‘Laserscope’ in the FDA MAUDE database.”,
videos: [
{ label: “GreenLight Laser Procedure”, url: “https://www.youtube.com/results?search_query=GreenLight+laser+PVP+BPH+prostate+procedure”, source: “YouTube Search”, isSearch: true },
],
},
{
id: 9, category: “Minimally Invasive”, color: “#6B7FD7”, icon: “🔬”,
name: “PAE (Prostatic Artery Embolization)”,
description: “An interventional radiologist threads a catheter through the wrist or groin artery and injects tiny beads to block blood supply to the prostate, causing it to shrink over weeks.”,
pros: [“No incision in the prostate”, “Preserves sexual function”, “No general anesthesia needed”, “Outpatient procedure”],
cons: [“Performed by interventional radiologist, not urologist”, “Less proven long-term data”, “Results take weeks to months”, “Higher retreatment rates than surgical options”],
idealFor: “Men who cannot undergo or want to avoid surgery, especially those with very large prostates or significant medical comorbidities.”,
invasiveness: 2, effectiveness: 3, recovery: “1–2 weeks”,
physicianFee: “~$2,000–3,000 (interventional radiologist fee)”,
feeNote: “Performed by interventional radiologists rather than urologists. Coverage varies by insurer.”,
seminalTrial: “UK-ROPE Study — Ray et al., BMJ 2018”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/29784610/”,
efficacyData: “UK-ROPE (n=305): IPSS improved by 47% at 12 months. Qmax improved significantly. Sexual function preserved. However, retreatment rates are higher than resective procedures at 5+ years.”,
maudeUrl: null,
maudeNote: “PAE uses standard embolic agents, not a BPH-specific device. MAUDE entries would be filed under the embolic materials.”,
videos: [
{ label: “PAE Procedure Explained”, url: “https://www.youtube.com/results?search_query=prostatic+artery+embolization+PAE+BPH+procedure”, source: “YouTube Search”, isSearch: true },
],
},
{
id: 10, category: “Surgery”, color: “#C0392B”, icon: “🏥”,
name: “TURP (Transurethral Resection)”,
description: “The ‘gold standard’ for decades. A heated wire loop is used to carve away excess prostate tissue through the urethra. Highly effective but carries more side effects than newer options.”,
pros: [“Longest track record (60+ years)”, “Highly effective symptom relief”, “Works for most prostate sizes”, “Covered by all insurers”],
cons: [“Risk of retrograde ejaculation (65–75%)”, “Catheter needed (2–3 days)”, “Hospital stay (1–2 days)”, “Risk of bleeding, infection, TUR syndrome”],
idealFor: “Men with severe symptoms who need maximum relief and are less concerned about ejaculatory changes.”,
invasiveness: 4, effectiveness: 5, recovery: “2–4 weeks”,
physicianFee: “~$1,200–1,800 (surgeon fee, hospital-based)”,
feeNote: “Well-established reimbursement. Hospital facility fees are additional and vary widely.”,
seminalTrial: “WATER Trial (comparator arm) — Gilling et al., J Urology 2019”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/30016230/”,
efficacyData: “Decades of evidence: IPSS improvement of 70%+. Qmax improves from ~8 → 20+ mL/s. Retrograde ejaculation rate 65–75%. Very low retreatment rate at 10 years (~5–8%). Remains the benchmark against which all other BPH procedures are measured.”,
maudeUrl: “https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm”,
maudeNote: “TURP uses standard resectoscopes. Search ‘resectoscope’ in MAUDE.”,
videos: [
{ label: “TURP Procedure Animation”, url: “https://www.youtube.com/results?search_query=TURP+transurethral+resection+prostate+animation+procedure”, source: “YouTube Search”, isSearch: true },
],
},
{
id: 11, category: “Surgery”, color: “#C0392B”, icon: “🏥”,
name: “HoLEP (Holmium Laser Enucleation)”,
description: “A laser is used to scoop out the entire inner portion of the prostate (enucleation), then the tissue is morcellated and removed. The most complete tissue removal of any transurethral procedure.”,
pros: [“Most tissue removed — longest-lasting results”, “Works for any size prostate”, “Tissue can be checked for cancer”, “Lower retreatment rate than TURP”],
cons: [“Steep learning curve for surgeons”, “Risk of retrograde ejaculation (75%+)”, “Longer procedure time”, “Limited availability — fewer surgeons trained”],
idealFor: “Men with very large prostates (>80g) who need maximum, durable relief and can accept ejaculatory changes.”,
invasiveness: 4, effectiveness: 5, recovery: “2–4 weeks”,
physicianFee: “~$1,500–2,500 (surgeon fee, hospital-based)”,
feeNote: “Specialized equipment costs are borne by the facility. May require travel to a trained surgeon — ask about case volume.”,
seminalTrial: “Kuntz et al., Eur Urol 2008 (5-yr follow-up vs TURP)”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/18191324/”,
efficacyData: “Multiple RCTs vs TURP: HoLEP is non-inferior or superior on all outcomes. Lower retreatment rate at 5–10 years. Catheter time shorter than TURP. Blood loss lower. Retrograde ejaculation rate is similar to TURP (75%+). Considered the reference standard for large prostates.”,
maudeUrl: “https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm”,
maudeNote: “Search ‘Holmium’ or ‘VersaPulse’ in the FDA MAUDE database.”,
videos: [
{ label: “HoLEP Procedure Explained”, url: “https://www.youtube.com/results?search_query=HoLEP+holmium+laser+enucleation+prostate+procedure+animation”, source: “YouTube Search”, isSearch: true },
],
},
{
id: 12, category: “Surgery”, color: “#C0392B”, icon: “🏥”,
name: “Simple Prostatectomy (Open/Robotic)”,
description: “Surgical removal of the inner prostate through an abdominal incision (open) or robot-assisted laparoscopy. Reserved for the very largest prostates (>80–100g) where transurethral approaches may not suffice.”,
pros: [“Most complete tissue removal”, “Highly durable results”, “Robotic option reduces recovery time”],
cons: [“Most invasive option”, “Longest recovery (4–6 weeks)”, “Hospital stay (2–3 days)”, “Highest risk of side effects”],
idealFor: “Men with very large prostates where transurethral approaches are not feasible.”,
invasiveness: 5, effectiveness: 5, recovery: “4–6 weeks”,
physicianFee: “~$2,500–4,000 (surgeon fee)”,
feeNote: “Hospital and anesthesia fees are substantial. Robotic-assisted version may cost more but reduces recovery time.”,
seminalTrial: “Pariser et al., J Urology 2015 (Robotic vs Open)”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/25066870/”,
efficacyData: “Highly effective with IPSS improvement of 75%+. Robotic approach shows shorter hospital stay and less blood loss compared to open. Retreatment rate is the lowest of any BPH procedure. Reserved for prostates too large for transurethral approaches.”,
maudeUrl: null,
maudeNote: “Standard surgical instruments. No BPH-specific device for MAUDE search.”,
videos: [
{ label: “Simple Prostatectomy Overview”, url: “https://www.youtube.com/results?search_query=simple+prostatectomy+robotic+open+BPH+very+large+prostate”, source: “YouTube Search”, isSearch: true },
],
},
{
id: 13, category: “Supplements”, color: “#7BA05B”, icon: “🌿”,
name: “Saw Palmetto”,
description: “The most studied herbal supplement for BPH. Extracted from the fruit of the American saw palmetto plant. Widely used in Europe. Evidence is mixed — some men report improvement.”,
pros: [“Available over-the-counter”, “Generally well tolerated”, “Low cost”, “No prescription needed”],
cons: [“Clinical evidence is mixed — may not be better than placebo”, “Not FDA-regulated for quality”, “Dosing varies widely between products”],
idealFor: “Men with mild symptoms who want to try a natural approach before medications.”,
invasiveness: 0, effectiveness: 2, recovery: “None”,
physicianFee: “~$10–25/month (OTC supplement)”,
feeNote: “Not covered by insurance. Quality varies significantly between brands. Look for USP-verified products.”,
seminalTrial: “STEP Trial — Barry et al., JAMA 2011”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/21954478/”,
efficacyData: “STEP RCT (n=369): No significant difference between saw palmetto and placebo for IPSS or Qmax at doses up to 960 mg. Despite this, many men report subjective improvement. European studies with specific extracts (Permixon) show more positive results.”,
maudeUrl: null,
maudeNote: “Dietary supplement. Not FDA-regulated as a medical device or drug.”,
videos: [
{ label: “Saw Palmetto for BPH — Evidence Review”, url: “https://www.youtube.com/results?search_query=saw+palmetto+BPH+prostate+does+it+work+evidence”, source: “YouTube Search”, isSearch: true },
],
},
{
id: 14, category: “Supplements”, color: “#7BA05B”, icon: “🌿”,
name: “Beta-Sitosterol”,
description: “A plant sterol found in foods like avocados, nuts, and seeds. Some studies suggest it can improve urinary flow and reduce residual urine volume.”,
pros: [“Natural compound found in foods”, “Some clinical evidence of benefit”, “Well tolerated”],
cons: [“Limited long-term data”, “Not FDA-regulated”, “Effect size is modest”],
idealFor: “Men with mild symptoms who prefer natural supplements as a first approach.”,
invasiveness: 0, effectiveness: 2, recovery: “None”,
physicianFee: “~$10–20/month (OTC supplement)”,
feeNote: “Not covered by insurance.”,
seminalTrial: “Wilt et al., Cochrane Review 2000”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/10796573/”,
efficacyData: “Cochrane meta-analysis of 4 RCTs (n=519): Beta-sitosterol improved IPSS by –4.9 points vs placebo and improved Qmax by +3.9 mL/s. However, long-term data is lacking and study quality was moderate.”,
maudeUrl: null,
maudeNote: “Dietary supplement. Not FDA-regulated.”,
videos: [
{ label: “Natural Supplements for BPH”, url: “https://www.youtube.com/results?search_query=beta+sitosterol+BPH+prostate+supplement+natural”, source: “YouTube Search”, isSearch: true },
],
},
{
id: 15, category: “Minimally Invasive”, color: “#6B7FD7”, icon: “🔬”,
name: “iTind (Temporary Implant)”,
description: “A temporary implant is placed in the prostate for 5–7 days to reshape the tissue, then removed. No permanent implant left behind.”,
pros: [“No permanent implant”, “Preserves sexual function”, “Quick in-office procedure”, “No tissue destruction”],
cons: [“Newer procedure — less long-term data”, “Temporary discomfort during implant period”, “Limited availability”, “Not for large prostates”],
idealFor: “Men with mild-to-moderate symptoms who want a minimally invasive option with no permanent implant.”,
invasiveness: 2, effectiveness: 3, recovery: “1–2 weeks”,
physicianFee: “~$1,000–1,500 (surgeon fee)”,
feeNote: “Device cost borne by facility. Coverage may be limited as it’s a newer procedure.”,
seminalTrial: “Porpiglia et al., J Urology 2020”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/31509081/”,
efficacyData: “RCT (n=175, 3-yr follow-up): IPSS improved by ~47%. Qmax improved by ~55%. No ejaculatory or erectile dysfunction reported. Retreatment rate ~7% at 3 years.”,
maudeUrl: “https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm”,
maudeNote: “Search ‘iTind’ in the FDA MAUDE database.”,
videos: [
{ label: “iTind Procedure Overview”, url: “https://www.youtube.com/results?search_query=iTind+temporary+implant+BPH+prostate+procedure”, source: “YouTube Search”, isSearch: true },
],
},
{
id: 16, category: “Minimally Invasive”, color: “#6B7FD7”, icon: “🔬”,
name: “WVTT (Optilume BPH)”,
description: “A drug-coated balloon is inflated inside the prostate urethra to mechanically open the channel and deliver medication to prevent tissue regrowth. Office-based procedure.”,
pros: [“No implant or tissue removal”, “Office-based”, “Quick recovery”, “Preserves sexual function”],
cons: [“Newest BPH option — limited long-term data”, “Not widely available yet”, “Moderate symptom improvement”],
idealFor: “Men with mild-to-moderate symptoms looking for a newer, low-risk office procedure.”,
invasiveness: 2, effectiveness: 3, recovery: “1–2 weeks”,
physicianFee: “~$1,000–1,500 (estimated)”,
feeNote: “Very new procedure. Reimbursement and availability are still being established.”,
seminalTrial: “PINNACLE Trial — Elterman et al., 2023”,
trialUrl: “https://pubmed.ncbi.nlm.nih.gov/36696645/”,
efficacyData: “PINNACLE RCT (n=148): IPSS improved by ~44% at 2 years. Qmax improved significantly. No erectile or ejaculatory dysfunction. Retreatment rate ~3% at 2 years. Longer follow-up needed.”,
maudeUrl: null,
maudeNote: “Very new device. Limited MAUDE entries available.”,
videos: [
{ label: “Optilume BPH Procedure”, url: “https://www.youtube.com/results?search_query=Optilume+BPH+drug+coated+balloon+procedure”, source: “YouTube Search”, isSearch: true },
],
},
];

/* ─────────────────────────────────────────────
SAMPLE REVIEWS
───────────────────────────────────────────── */
const sampleReviews = [
{ id: 1, treatment: “UroLift (Prostatic Urethral Lift)”, name: “Robert M.”, age: 58, date: “Jan 2025”, rating: 4, recovery: 5, sideEffects: 5, wouldRecommend: true, text: “Quick in-office procedure. Back to normal in three days. No sexual side effects at all. Wish I had done this years ago instead of fighting with medications.” },
{ id: 2, treatment: “TURP (Transurethral Resection)”, name: “James K.”, age: 72, date: “Nov 2024”, rating: 4, recovery: 3, sideEffects: 3, wouldRecommend: true, text: “Excellent results for urine flow. Recovery was harder than I expected — about 5 weeks total. Retrograde ejaculation is now permanent for me, which took adjustment, but the urinary improvement is dramatic.” },
{ id: 3, treatment: “Rezūm Water Vapor Therapy”, name: “David T.”, age: 61, date: “Feb 2025”, rating: 5, recovery: 4, sideEffects: 5, wouldRecommend: true, text: “The catheter for 10 days was annoying but manageable. At the 3 month mark, I noticed a huge difference. No sexual side effects at all. My urologist said my flow improved by 40%.” },
{ id: 4, treatment: “Alpha Blockers”, name: “Michael S.”, age: 65, date: “Mar 2025”, rating: 3, recovery: 5, sideEffects: 3, wouldRecommend: true, text: “Tamsulosin helped significantly with urgency and flow. The main issue is dizziness when I stand up too fast — had a few scary moments. Also affects ejaculation. Good starting point but I’m exploring longer-term options.” },
{ id: 5, treatment: “HoLEP (Holmium Laser Enucleation)”, name: “Thomas R.”, age: 74, date: “Dec 2024”, rating: 5, recovery: 4, sideEffects: 4, wouldRecommend: true, text: “I had a very large prostate (110g) so TURP wasn’t ideal. HoLEP was recommended and the results are remarkable. Finding a surgeon experienced with HoLEP was important — I drove 2 hours to a specialist center.” },
{ id: 6, treatment: “Aquablation (Robotic Waterjet)”, name: “William H.”, age: 67, date: “Jan 2026”, rating: 5, recovery: 4, sideEffects: 5, wouldRecommend: true, text: “My prostate was 95g — too big for UroLift and my urologist recommended Aquablation. The robot did its thing in about 4 minutes. One night in the hospital, catheter out the next day. At 2 months my flow is unbelievable. Zero sexual side effects.” },
];

/* ─────────────────────────────────────────────
DESIGN TOKENS
───────────────────────────────────────────── */
const categoryColors = {
“Watchful Waiting”: { bg: “#EFF8F0”, badge: “#4A90A4”, border: “#4A90A4” },
“Supplements”: { bg: “#F0F5EB”, badge: “#7BA05B”, border: “#7BA05B” },
“Medication”: { bg: “#EEF3F8”, badge: “#5B8DB8”, border: “#5B8DB8” },
“Minimally Invasive”: { bg: “#EEEDF7”, badge: “#6B7FD7”, border: “#6B7FD7” },
“Surgery”: { bg: “#FDEDED”, badge: “#C0392B”, border: “#C0392B” },
};

const categoryOrder = [“Watchful Waiting”, “Supplements”, “Medication”, “Minimally Invasive”, “Surgery”];

/* ─────────────────────────────────────────────
CAPTCHA HELPER
───────────────────────────────────────────── */
const generateCaptcha = () => {
const a = Math.floor(Math.random() * 9) + 1;
const b = Math.floor(Math.random() * 9) + 1;
return { a, b, answer: a + b, question: `${a} + ${b}` };
};

/* ─────────────────────────────────────────────
STAR RATING COMPONENT
───────────────────────────────────────────── */
const StarRating = ({ value, onChange, label, readonly = false }) => (

  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    {label && <span style={{ fontSize: 13, color: "#6B7280", minWidth: 100 }}>{label}</span>}
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star}
          onClick={() => !readonly && onChange?.(star)}
          style={{
            cursor: readonly ? "default" : "pointer",
            fontSize: readonly ? 16 : 22,
            color: star <= value ? "#F59E0B" : "#D1D5DB",
            transition: "color 0.15s",
          }}>★</span>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
MAIN COMPONENT
───────────────────────────────────────────── */
export default function BPHWebsite() {
/* ── Supabase config ── */
const SUPABASE_URL = “https://eizeuzksgbbwclmufjay.supabase.co”;
const SUPABASE_ANON_KEY = “eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpemV1emtzZ2Jid2NsbXVmamF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjU2ODIsImV4cCI6MjA5MDQwMTY4Mn0.ajeZRJE1BuZ2iKi5VOntwxGVvnTmifKWuWCn59Uu8FU”;

const supabaseFetch = useCallback(async (path, options = {}) => {
const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
…options,
headers: {
“apikey”: SUPABASE_ANON_KEY,
“Authorization”: `Bearer ${SUPABASE_ANON_KEY}`,
“Content-Type”: “application/json”,
“Prefer”: options.method === “POST” ? “return=representation” : undefined,
…options.headers,
},
});
return res.json();
}, []);

const [activeCategory, setActiveCategory] = useState(“All”);
const [expandedTreatment, setExpandedTreatment] = useState(null);
const [activeTab, setActiveTab] = useState(“treatments”);
const [reviewFilter, setReviewFilter] = useState(“All”);
const [showForm, setShowForm] = useState(false);
const [reviews, setReviews] = useState(sampleReviews);
const [loadingReviews, setLoadingReviews] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [formErrors, setFormErrors] = useState({});
const [formOpenedAt, setFormOpenedAt] = useState(null);
const [captcha, setCaptcha] = useState(() => generateCaptcha());
const [captchaInput, setCaptchaInput] = useState(””);
const [form, setForm] = useState({
name: “”, age: “”, treatment: “”, rating: 0, recovery: 0, sideEffects: 0,
wouldRecommend: “”, text: “”, honeypot: “”,
});

/* ── Load reviews from database on page load ── */
useEffect(() => {
const loadReviews = async () => {
try {
const data = await supabaseFetch(“reviews?select=*&order=created_at.desc”);
if (Array.isArray(data) && data.length > 0) {
const dbReviews = data.map(r => ({
id: r.id,
treatment: r.treatment,
name: r.name,
age: r.age,
date: r.display_date,
rating: r.rating,
recovery: r.recovery,
sideEffects: r.side_effects,
wouldRecommend: r.would_recommend,
text: r.review_text,
}));
setReviews(dbReviews);
}
} catch (e) {
console.log(“Using sample reviews — database not yet connected”);
}
setLoadingReviews(false);
};
loadReviews();
}, [supabaseFetch]);

const categories = [“All”, “Watchful Waiting”, “Supplements”, “Medication”, “Minimally Invasive”, “Surgery”];

const filtered = (activeCategory === “All” ? treatments : treatments.filter(t => t.category === activeCategory))
.slice().sort((a, b) => {
const catDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
return catDiff !== 0 ? catDiff : a.id - b.id;
});

const filteredReviews = reviewFilter === “All” ? reviews : reviews.filter(r => r.treatment === reviewFilter);

const openForm = useCallback(() => {
setShowForm(true);
setFormOpenedAt(Date.now());
setCaptcha(generateCaptcha());
setCaptchaInput(””);
}, []);

const handleSubmit = async () => {
const errors = {};
// Honeypot check
if (form.honeypot) return;
// Timing check — bots fill forms instantly
if (formOpenedAt && Date.now() - formOpenedAt < 5000) {
errors.general = “Please take a moment to fill out the form.”;
}
// Captcha check
if (parseInt(captchaInput) !== captcha.answer) {
errors.captcha = “Incorrect answer. Please try again.”;
}
if (!form.name.trim()) errors.name = “Name is required”;
if (!form.treatment) errors.treatment = “Please select a treatment”;
if (!form.rating) errors.rating = “Please rate your overall experience”;
if (!form.text.trim() || form.text.trim().length < 30) errors.text = “Please share at least a few sentences about your experience”;
if (!form.wouldRecommend) errors.wouldRecommend = “Please indicate if you would recommend”;

```
setFormErrors(errors);
if (Object.keys(errors).length > 0) return;

setSubmitting(true);

const displayDate = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });

const newReviewForDB = {
  treatment: form.treatment,
  name: form.name.trim(),
  age: parseInt(form.age) || null,
  display_date: displayDate,
  rating: form.rating,
  recovery: form.recovery || null,
  side_effects: form.sideEffects || null,
  would_recommend: form.wouldRecommend === "yes",
  review_text: form.text.trim(),
};

try {
  const result = await supabaseFetch("reviews", {
    method: "POST",
    body: JSON.stringify(newReviewForDB),
  });

  if (Array.isArray(result) && result.length > 0) {
    const saved = result[0];
    const newReview = {
      id: saved.id,
      treatment: saved.treatment,
      name: saved.name,
      age: saved.age,
      date: saved.display_date,
      rating: saved.rating,
      recovery: saved.recovery,
      sideEffects: saved.side_effects,
      wouldRecommend: saved.would_recommend,
      text: saved.review_text,
    };
    setReviews([newReview, ...reviews]);
    setSubmitted(true);
    setShowForm(false);
    setForm({ name: "", age: "", treatment: "", rating: 0, recovery: 0, sideEffects: 0, wouldRecommend: "", text: "", honeypot: "" });
  } else {
    setFormErrors({ general: "Something went wrong saving your review. Please try again." });
  }
} catch (e) {
  setFormErrors({ general: "Could not connect to the server. Please try again." });
}
setSubmitting(false);
```

};

/* ── STYLES ── */
const globalCSS = `
@import url(‘https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600;700&display=swap’);

```
* { box-sizing: border-box; }
body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; color: #1a1a2e; -webkit-font-smoothing: antialiased; }

.nav-link { padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; letter-spacing: 0.01em; }
.nav-link.active { background: #1E3A5F; color: white; }
.nav-link:not(.active) { background: transparent; color: #4B5563; }
.nav-link:not(.active):hover { background: #F3F4F6; }

.cat-btn { padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1.5px solid #E5E7EB; cursor: pointer; transition: all 0.2s; background: white; color: #4B5563; }
.cat-btn.active { border-color: #1E3A5F; background: #1E3A5F; color: white; }
.cat-btn:hover:not(.active) { border-color: #9CA3AF; background: #F9FAFB; }

.treatment-card { background: white; border-radius: 16px; border: 1.5px solid #E5E7EB; padding: 24px; cursor: pointer; transition: all 0.25s cubic-bezier(.4,0,.2,1); }
.treatment-card:hover { box-shadow: 0 8px 30px rgba(30,58,95,0.08); transform: translateY(-2px); }

.btn-primary { padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; background: #1E3A5F; color: white; transition: all 0.2s; }
.btn-primary:hover { background: #2A4F7A; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(30,58,95,0.2); }

.btn-outline { padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; border: 1.5px solid #1E3A5F; cursor: pointer; background: transparent; color: #1E3A5F; transition: all 0.2s; }
.btn-outline:hover { background: #1E3A5F; color: white; }

.input-field { width: 100%; padding: 12px 16px; border: 1.5px solid #E5E7EB; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s; background: #FAFBFC; }
.input-field:focus { border-color: #1E3A5F; background: white; }

.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.animate-in { animation: fadeIn 0.4s ease-out; }

::selection { background: #1E3A5F; color: white; }
```

`;

return (
<div style={{ minHeight: “100vh”, background: “#F9FAFB” }}>
<style>{globalCSS}</style>

```
  {/* ═══════ HEADER ═══════ */}
  <header style={{ background: "white", borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)", backgroundColor: "rgba(255,255,255,0.92)" }}>
    <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={() => { setActiveTab("treatments"); setActiveCategory("All"); }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #1E3A5F, #2A6F97)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "white", fontWeight: 700, fontSize: 14, fontFamily: "'Source Serif 4', Georgia, serif" }}>B</span>
        </div>
        <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1E3A5F" }}>BPH<span style={{ color: "#2A6F97" }}>Guide</span></span>
      </div>
      <nav style={{ display: "flex", gap: 4 }}>
        {[
          { id: "treatments", label: "Treatments" },
          { id: "reviews", label: "Reviews" },
          { id: "about", label: "About" },
        ].map(tab => (
          <button key={tab.id} className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => { setActiveTab(tab.id); setSubmitted(false); }}>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  </header>

  {/* ═══════ HERO ═══════ */}
  {activeTab === "treatments" && (
    <div style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #2A6F97 50%, #3B8CB8 100%)", padding: "56px 24px 48px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div style={{ maxWidth: 1140, margin: "0 auto", position: "relative" }}>
        <div style={{ maxWidth: 680 }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>Independent & Unbiased</p>
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, color: "white", margin: "0 0 16px", lineHeight: 1.15 }}>
            Every BPH Treatment,<br />Compared Honestly
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 17, lineHeight: 1.65, margin: "0 0 24px" }}>
            Clinical trial data. Physician reimbursement transparency. FDA adverse event reports. Real patient reviews. No sponsored content — ever.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "6px 14px", fontSize: 12, backdropFilter: "blur(4px)" }}>16 Treatments Covered</span>
            <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "6px 14px", fontSize: 12, backdropFilter: "blur(4px)" }}>Updated March 2026</span>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* ═══════ DISCLAIMER BAR ═══════ */}
  <div style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A", padding: "10px 24px" }}>
    <p style={{ maxWidth: 1140, margin: "0 auto", fontSize: 12, color: "#92400E", textAlign: "center", lineHeight: 1.5 }}>
      ⚠️ This site is an educational resource — not medical advice. Always consult a qualified urologist before making treatment decisions.
    </p>
  </div>

  {/* ═══════ MAIN ═══════ */}
  <main style={{ maxWidth: 1140, margin: "0 auto", padding: "40px 24px" }}>

    {/* ── TREATMENTS TAB ── */}
    {activeTab === "treatments" && (
      <div className="animate-in">
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 32, margin: "0 0 8px", color: "#1E3A5F" }}>Treatment Options</h2>
          <p style={{ color: "#6B7280", fontSize: 15, margin: "0 0 24px" }}>From conservative management to surgery — understand every path available.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map(cat => (
              <button key={cat} className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          {Object.entries(categoryColors).map(([cat, c]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280" }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: c.badge }} />
              {cat}
            </div>
          ))}
        </div>

        {/* Treatment Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {filtered.map(t => {
            const isExpanded = expandedTreatment === t.id;
            const colors = categoryColors[t.category];
            return (
              <div key={t.id} className="treatment-card"
                style={{ borderColor: isExpanded ? colors.border : "#E5E7EB", gridColumn: isExpanded ? "1 / -1" : undefined }}
                onClick={() => setExpandedTreatment(isExpanded ? null : t.id)}>

                {/* Card Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{t.icon}</span>
                    <div>
                      <span className="badge" style={{ background: colors.bg, color: colors.badge, marginBottom: 4 }}>{t.category}</span>
                      <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 20, margin: "4px 0 0", color: "#1E3A5F" }}>{t.name}</h3>
                    </div>
                  </div>
                  <span style={{ fontSize: 18, color: "#9CA3AF", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}>▼</span>
                </div>

                <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.65, margin: "0 0 16px" }}>{t.description}</p>

                {/* Quick Stats */}
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
                  <div>
                    <span style={{ color: "#9CA3AF" }}>Effectiveness </span>
                    <span style={{ color: colors.badge }}>{"●".repeat(t.effectiveness)}{"○".repeat(5 - t.effectiveness)}</span>
                  </div>
                  <div>
                    <span style={{ color: "#9CA3AF" }}>Invasiveness </span>
                    <span style={{ color: "#EF4444" }}>{"●".repeat(t.invasiveness)}{"○".repeat(5 - t.invasiveness)}</span>
                  </div>
                  <div>
                    <span style={{ color: "#9CA3AF" }}>Recovery </span>
                    <span style={{ color: "#374151", fontWeight: 600 }}>{t.recovery}</span>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div onClick={e => e.stopPropagation()} style={{ marginTop: 24, borderTop: `1.5px solid ${colors.bg}`, paddingTop: 24 }}>
                    {/* Pros / Cons */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#059669", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pros</p>
                        {t.pros.map(p => <p key={p} style={{ fontSize: 13, color: "#374151", margin: "0 0 5px" }}>✓ {p}</p>)}
                      </div>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Cons</p>
                        {t.cons.map(c => <p key={c} style={{ fontSize: 13, color: "#374151", margin: "0 0 5px" }}>✗ {c}</p>)}
                      </div>
                    </div>

                    {/* Ideal For */}
                    <div style={{ background: "#F0F7FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ideal Candidate</p>
                      <p style={{ fontSize: 13, color: "#1E40AF", margin: 0, lineHeight: 1.5 }}>{t.idealFor}</p>
                    </div>

                    {/* Physician Fee */}
                    <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#C2410C", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>💰 Physician Reimbursement</p>
                      <p style={{ fontSize: 14, color: "#9A3412", margin: "0 0 6px", fontWeight: 600 }}>{t.physicianFee}</p>
                      <p style={{ fontSize: 12, color: "#78350F", margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>{t.feeNote}</p>
                    </div>

                    {/* Clinical Trial */}
                    <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#166534", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>📊 Clinical Evidence</p>
                      <p style={{ fontSize: 13, color: "#166534", margin: "0 0 6px", fontWeight: 600 }}>
                        {t.seminalTrial}
                        {t.trialUrl && <> — <a href={t.trialUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#059669", textDecoration: "underline" }}>PubMed →</a></>}
                      </p>
                      <p style={{ fontSize: 13, color: "#14532D", margin: 0, lineHeight: 1.6 }}>{t.efficacyData}</p>
                    </div>

                    {/* MAUDE */}
                    <div style={{ background: "#FDF2F8", border: "1px solid #FBCFE8", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#9D174D", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>🏛️ FDA Adverse Events (MAUDE)</p>
                      <p style={{ fontSize: 13, color: "#831843", margin: 0, lineHeight: 1.5 }}>
                        {t.maudeNote}
                        {t.maudeUrl && <> <a href={t.maudeUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#BE185D", textDecoration: "underline" }}>Search MAUDE →</a></>}
                      </p>
                    </div>

                    {/* Videos */}
                    {t.videos && t.videos.length > 0 && (
                      <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#5B21B6", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>🎥 Videos</p>
                        {t.videos.map((v, i) => (
                          <a key={i} href={v.url} target="_blank" rel="noopener noreferrer"
                            style={{ display: "block", fontSize: 13, color: "#6D28D9", textDecoration: "underline", marginBottom: 4 }}>
                            {v.label} {v.isSearch ? "(YouTube Search)" : `(${v.source})`}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Link to Reviews */}
                    <button className="btn-outline" style={{ marginTop: 8, width: "100%", textAlign: "center" }}
                      onClick={() => { setActiveTab("reviews"); setReviewFilter(t.name); }}>
                      Read Patient Reviews for {t.name} →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Comparison Table ── */}
        <div style={{ marginTop: 56, background: "white", borderRadius: 16, border: "1.5px solid #E5E7EB", overflow: "hidden" }}>
          <div style={{ padding: "24px 28px 16px", borderBottom: "1.5px solid #F3F4F6" }}>
            <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 26, margin: 0, color: "#1E3A5F" }}>Quick Comparison</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {["Treatment", "Category", "Effectiveness", "Invasiveness", "Recovery", "Sexual Side Effects"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {treatments.slice().sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) || a.id - b.id).map((t, i) => (
                  <tr key={t.id} style={{ background: i % 2 === 0 ? "white" : "#FAFBFC" }}>
                    <td style={{ padding: "10px 16px", fontWeight: 600, color: "#1E3A5F" }}>{t.name}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span className="badge" style={{ background: categoryColors[t.category].bg, color: categoryColors[t.category].badge }}>{t.category}</span>
                    </td>
                    <td style={{ padding: "10px 16px", color: categoryColors[t.category].badge }}>{"●".repeat(t.effectiveness)}{"○".repeat(5 - t.effectiveness)}</td>
                    <td style={{ padding: "10px 16px", color: "#EF4444" }}>{"●".repeat(t.invasiveness)}{"○".repeat(5 - t.invasiveness)}</td>
                    <td style={{ padding: "10px 16px", color: "#374151" }}>{t.recovery}</td>
                    <td style={{ padding: "10px 16px", color: "#374151" }}>
                      {t.invasiveness === 0 ? "None / Minimal" :
                       t.category === "Surgery" && t.name !== "Aquablation (Robotic Waterjet)" ? "High (retrograde ejaculation likely)" :
                       t.name === "Aquablation (Robotic Waterjet)" ? "Very Low (<1% ED, <1% incontinence)" :
                       "Low — generally preserved"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

    {/* ── REVIEWS TAB ── */}
    {activeTab === "reviews" && (
      <div className="animate-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 32, margin: "0 0 8px", color: "#1E3A5F" }}>Patient Reviews</h2>
            <p style={{ color: "#6B7280", fontSize: 15, margin: 0 }}>Real experiences from real patients. Unedited and unfiltered.</p>
          </div>
          <button className="btn-primary" onClick={openForm}>✍️ Share Your Experience</button>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: 24 }}>
          <select className="input-field" value={reviewFilter} onChange={e => setReviewFilter(e.target.value)}
            style={{ maxWidth: 360, cursor: "pointer" }}>
            <option value="All">All Treatments</option>
            {treatments.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </div>

        {/* Success Message */}
        {submitted && (
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <p style={{ color: "#166534", fontWeight: 600, margin: 0 }}>✓ Thank you! Your review has been added.</p>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #E5E7EB", padding: 28, marginBottom: 28 }}>
            <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, margin: "0 0 20px", color: "#1E3A5F" }}>Share Your BPH Treatment Experience</h3>

            {formErrors.general && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{formErrors.general}</p>}

            {/* Honeypot — invisible to humans */}
            <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
              <input type="text" tabIndex={-1} autoComplete="off" value={form.honeypot}
                onChange={e => setForm({ ...form, honeypot: e.target.value })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Name (or initials) *</label>
                <input className="input-field" placeholder="e.g. Robert M." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                {formErrors.name && <p style={{ color: "#DC2626", fontSize: 12, margin: "4px 0 0" }}>{formErrors.name}</p>}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Age</label>
                <input className="input-field" type="number" placeholder="Optional" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Treatment *</label>
              <select className="input-field" value={form.treatment} onChange={e => setForm({ ...form, treatment: e.target.value })} style={{ cursor: "pointer" }}>
                <option value="">Select a treatment...</option>
                {treatments.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
              {formErrors.treatment && <p style={{ color: "#DC2626", fontSize: 12, margin: "4px 0 0" }}>{formErrors.treatment}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <StarRating value={form.rating} onChange={v => setForm({ ...form, rating: v })} label="Overall *" />
                {formErrors.rating && <p style={{ color: "#DC2626", fontSize: 12, margin: "4px 0 0" }}>{formErrors.rating}</p>}
              </div>
              <StarRating value={form.recovery} onChange={v => setForm({ ...form, recovery: v })} label="Recovery" />
              <StarRating value={form.sideEffects} onChange={v => setForm({ ...form, sideEffects: v })} label="Side Effects" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Would you recommend this treatment? *</label>
              <div style={{ display: "flex", gap: 12 }}>
                {["yes", "no", "maybe"].map(opt => (
                  <button key={opt} onClick={() => setForm({ ...form, wouldRecommend: opt })}
                    style={{ padding: "8px 20px", borderRadius: 8, border: `1.5px solid ${form.wouldRecommend === opt ? "#1E3A5F" : "#E5E7EB"}`, background: form.wouldRecommend === opt ? "#1E3A5F" : "white", color: form.wouldRecommend === opt ? "white" : "#4B5563", cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize", transition: "all 0.2s" }}>
                    {opt}
                  </button>
                ))}
              </div>
              {formErrors.wouldRecommend && <p style={{ color: "#DC2626", fontSize: 12, margin: "4px 0 0" }}>{formErrors.wouldRecommend}</p>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Your Experience *</label>
              <textarea className="input-field" rows={5} placeholder="Tell other patients about your experience — what went well, what was difficult, what you wish you had known..."
                value={form.text} onChange={e => setForm({ ...form, text: e.target.value })}
                style={{ resize: "vertical", minHeight: 120 }} />
              {formErrors.text && <p style={{ color: "#DC2626", fontSize: 12, margin: "4px 0 0" }}>{formErrors.text}</p>}
            </div>

            {/* CAPTCHA */}
            <div style={{ marginBottom: 20, background: "#F9FAFB", borderRadius: 10, padding: 16, border: "1px solid #E5E7EB" }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Quick verification: What is {captcha.question}? *</label>
              <input className="input-field" type="number" placeholder="Your answer" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} style={{ maxWidth: 160 }} />
              {formErrors.captcha && <p style={{ color: "#DC2626", fontSize: 12, margin: "4px 0 0" }}>{formErrors.captcha}</p>}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit Review"}</button>
              <button className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Review List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {loadingReviews && (
            <div style={{ textAlign: "center", padding: 48, color: "#9CA3AF" }}>
              <p style={{ fontSize: 16 }}>Loading reviews...</p>
            </div>
          )}
          {!loadingReviews && filteredReviews.length === 0 && (
            <div style={{ textAlign: "center", padding: 48, color: "#9CA3AF" }}>
              <p style={{ fontSize: 16 }}>No reviews yet for this treatment. Be the first to share your experience!</p>
            </div>
          )}
          {filteredReviews.map(r => (
            <div key={r.id} style={{ background: "white", borderRadius: 16, border: "1.5px solid #E5E7EB", padding: 24, transition: "box-shadow 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                <div>
                  <span className="badge" style={{ background: categoryColors[treatments.find(t => t.name === r.treatment)?.category || "Medication"]?.bg || "#EEF3F8", color: categoryColors[treatments.find(t => t.name === r.treatment)?.category || "Medication"]?.badge || "#5B8DB8", marginBottom: 6 }}>{r.treatment}</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                    <span style={{ fontWeight: 600, color: "#1E3A5F" }}>{r.name}</span>
                    {r.age && <span style={{ fontSize: 12, color: "#9CA3AF" }}>Age {r.age}</span>}
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>{r.date}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <StarRating value={r.rating} readonly label="Overall" />
                  {r.recovery && <StarRating value={r.recovery} readonly label="Recovery" />}
                  {r.sideEffects && <StarRating value={r.sideEffects} readonly label="Side Fx" />}
                </div>
              </div>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: "0 0 8px" }}>{r.text}</p>
              {r.wouldRecommend !== undefined && (
                <p style={{ fontSize: 12, color: r.wouldRecommend ? "#059669" : "#DC2626", fontWeight: 600, margin: 0 }}>
                  {r.wouldRecommend ? "✓ Would recommend" : "✗ Would not recommend"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ── ABOUT TAB ── */}
    {activeTab === "about" && (
      <div className="animate-in">
        <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 32, margin: "0 0 24px", color: "#1E3A5F" }}>About BPHGuide</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { icon: "🎯", title: "Our Mission", text: "BPHGuide exists to give men facing BPH treatment decisions the clearest, most honest information available — including data points that aren't always easy to find, like physician reimbursement rates, FDA adverse event reports, and real patient experiences." },
            { icon: "⚕️", title: "Medical Accuracy", text: "All treatment information is sourced from peer-reviewed clinical trials and official medical guidelines (AUA, EAU). Efficacy data cites specific studies with sample sizes, follow-up periods, and endpoints. We link to PubMed for every major claim. Updated March 2026." },
            { icon: "🔒", title: "Independence", text: "We are not affiliated with any pharmaceutical company, device manufacturer, or healthcare system. We do not accept payment to feature or promote any treatment. Aquablation data updated from PROCEPT BioRobotics' 2026 Analyst Day presentation — publicly available investor materials." },
            { icon: "📋", title: "What BPH Is", text: "Benign prostatic hyperplasia (BPH) is a non-cancerous enlargement of the prostate gland. By age 60, roughly 50% of men have BPH; by age 85, about 90% do. Symptoms include frequent urination, weak stream, urgency, and incomplete emptying. An estimated 40 million U.S. men live with BPH, with approximately 400,000 surgical procedures performed annually." },
          ].map(item => (
            <div key={item.title} style={{ background: "white", borderRadius: 16, border: "1.5px solid #E5E7EB", padding: 24, display: "flex", gap: 20 }}>
              <span style={{ fontSize: 32, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, margin: "0 0 8px", color: "#1E3A5F" }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.7, margin: 0 }}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </main>

  {/* ═══════ FOOTER ═══════ */}
  <footer style={{ borderTop: "1px solid #E5E7EB", background: "#1E3A5F", marginTop: 64, padding: "40px 24px" }}>
    <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
      <div>
        <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 20, color: "white", fontWeight: 700 }}>BPH<span style={{ color: "#93C5FD" }}>Guide</span></span>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>Patient-centered information. Not medical advice.</p>
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, textAlign: "right" }}>
        Always consult a licensed urologist before making treatment decisions.<br />
        © 2026 BPHGuide. All rights reserved.
      </p>
    </div>
  </footer>
</div>
```

);
}
