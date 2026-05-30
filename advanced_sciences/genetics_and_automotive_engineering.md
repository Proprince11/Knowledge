# Genetics & Automotive Engineering — Dual-Domain Technical Brief

> A graduate-level technical brief unifying two engineering disciplines that are
> increasingly converging: **molecular engineering of life** (CRISPR, epigenetics,
> synthetic biology, precision agriculture) and **mechanical engineering of mobility**
> (internal-combustion thermodynamics, vehicular fluid dynamics, electric powertrains,
> structural mechanics). The two halves are written to be read independently or as a
> single survey of how engineered systems — biological and mechanical — extract work
> and information from physical law.

---

## Table of Contents

### Part I — Genetics & GMOs
1. [CRISPR-Cas9 Mechanics](#1-crispr-cas9-mechanics)
2. [Epigenetic Alteration Vectors](#2-epigenetic-alteration-vectors)
3. [Synthetic Biology Foundations](#3-synthetic-biology-foundations)
4. [Precision Agricultural Science](#4-precision-agricultural-science)

### Part II — Automotive Engineering
5. [Thermodynamics of Internal Combustion Engines](#5-thermodynamics-of-internal-combustion-engines)
6. [Vehicle Fluid Dynamics](#6-vehicle-fluid-dynamics)
7. [Electric Vehicle Powertrain Mechanics](#7-electric-vehicle-powertrain-mechanics)
8. [Structural & Material Mechanics](#8-structural--material-mechanics)

### Appendix
9. [Constants, Equations & References](#9-appendix)

---

# PART I — GENETICS & GMOs

## 1. CRISPR-Cas9 Mechanics

CRISPR-Cas9 is a **bacterial adaptive immune system** repurposed as a programmable
genome-editing platform. Native CRISPR ("Clustered Regularly Interspaced Short
Palindromic Repeats") loci let prokaryotes record fragments of invading phage DNA into
**CRISPR arrays**, then transcribe and process them into guide RNAs that direct Cas
nucleases to cleave matching sequences on subsequent infection (Barrangou et al.,
*Science*, 2007; Jinek et al., *Science*, 2012).

### 1.1 Molecular Components

| Component | Description |
|---|---|
| **SpCas9** | A 1368-aa Type II-A Class 2 endonuclease from *Streptococcus pyogenes*. Bilobed (REC + NUC). Two nuclease domains: **HNH** (cleaves target strand) and **RuvC** (cleaves non-target strand). |
| **crRNA (CRISPR RNA)** | 20-nt **spacer** complementary to the protospacer in target DNA, fused to a tracrRNA-binding scaffold. |
| **tracrRNA (trans-activating)** | Bridges crRNA to Cas9; required for crRNA maturation in native systems. |
| **sgRNA (single-guide RNA)** | Engineered fusion of crRNA + tracrRNA into a ~100-nt single transcript (Jinek 2012). The standard tool. |
| **PAM (Protospacer Adjacent Motif)** | A 2–6 nt motif immediately 3′ of the protospacer in the target DNA. For SpCas9: **5′-NGG-3′**. Required for binding and cleavage; absent PAM → no editing. |

### 1.2 Catalytic Cycle

1. **Apo Cas9** is conformationally inactive.
2. **sgRNA loading** triggers a large rearrangement that exposes a positively charged
   "channel" for DNA.
3. **PAM recognition** — Cas9 surveils dsDNA in 3-D, transiently sampling sequences. The
   PAM-interacting (PI) domain reads the **NGG** through major-groove contacts.
4. **R-loop formation** — once a PAM is engaged, the strands locally separate and the
   sgRNA spacer interrogates the **non-PAM** strand, base-pairing 3′→5′ from the PAM.
   Mismatches in the **PAM-proximal seed (~10 nt)** abort binding; distal mismatches are
   tolerated.
5. **Conformational locking** — full 20-nt complementarity drives HNH into its active
   state.
6. **Cleavage** — HNH cuts the target strand and RuvC cuts the non-target strand,
   producing a **blunt-end DSB** ~3 nt upstream of the PAM.

### 1.3 Repair Outcomes — Editing Modalities

A double-strand break is repaired by competing pathways:

| Pathway | Hallmark | Editing outcome |
|---|---|---|
| **NHEJ** Non-homologous end joining | Active throughout the cell cycle; error-prone | **Indels** at the cut site → frameshift → gene knockout |
| **MMEJ / Alt-EJ** | Microhomology-mediated end joining | Predictable small deletions; useful for "footprint" editing |
| **HDR** Homology-directed repair | S/G2 only; requires a homologous donor template | **Precise replacement / insertion** |
| **Single-strand annealing** | Long homologous repeats | Large deletions; rarely desired |

To achieve a precise edit, supply an exogenous **donor template** (ssODN for ≤ ~200 bp
edits; dsDNA / AAV donors for larger) flanked by homology arms ≥ 35 nt for ssODNs and
500–1000 bp for dsDNA donors.

### 1.4 Engineered Variants

| Variant | Innovation | Use |
|---|---|---|
| **eSpCas9 / SpCas9-HF1 / HiFi** | Engineered to reduce off-target binding | Therapeutic edits |
| **xCas9 / SpRY** | Relaxed PAM (near-PAM-less) | Targets without nearby NGG |
| **dCas9** (catalytically dead) | D10A + H840A double mutant | Programmable DNA binder; CRISPRi/CRISPRa with effector fusions |
| **nCas9 (nickase)** | Single-strand cut | Reduces off-target with paired-nickase strategies; substrate for base/prime editing |
| **Base editors** (CBE, ABE) | dCas9 / nickase fused to cytidine or adenosine deaminase | C·G → T·A and A·T → G·C without DSB (Komor 2016, Gaudelli 2017) |
| **Prime editors** (PE2, PE3, PE5, twinPE) | nCas9-H840A fused to engineered reverse transcriptase + pegRNA | Arbitrary small substitutions, insertions, deletions without DSB or donor (Anzalone 2019) |
| **Cas12a (Cpf1)** | Different PAM (TTTV), staggered cuts, processes its own crRNA | Multiplexing |
| **Cas13** | RNA-targeting | Transient knockdown, RNA editing, diagnostics (SHERLOCK) |

### 1.5 Delivery

| Modality | Format | Strengths | Limits |
|---|---|---|---|
| **Plasmid + lipofection** | DNA | Cheap; long expression | Random integration risk; off-targets accumulate |
| **mRNA + LNP** | RNA, lipid nanoparticle | Transient; clinical (Casgevy, Verve) | Tissue tropism limited mainly to liver |
| **RNP electroporation** | Pre-assembled Cas9–sgRNA | Fastest on/off, lowest off-target burden | Ex vivo cell therapies |
| **AAV** | Viral, ssDNA | In-vivo delivery to many tissues | ~4.7 kb cargo limit; pre-existing immunity |
| **Lentivirus** | Viral, integrative | Stable expression in dividing & non-dividing cells | Insertional mutagenesis risk |
| **VLPs (eVLPs)** | Engineered virus-like particles | RNP delivery in vivo with no viral genome | Emerging; production scale |

### 1.6 Off-Target Mitigation

- **gRNA design** — favor unique 20-mers; rank by predicted off-target score (CFD,
  MIT score). Tools: Benchling, CHOPCHOP, CRISPOR.
- **Use HiFi or eSpCas9** when therapeutically relevant.
- **Empirical assays**: GUIDE-seq, CIRCLE-seq, DISCOVER-seq, Digenome-seq for unbiased
  off-target nomination.
- **Paired nickase** strategy when off-targets must be near zero.

### 1.7 Therapeutic Translation (state of the art)

- **Casgevy (exa-cel)** — first FDA-approved CRISPR therapy (2023). Ex-vivo edit of
  patient HSCs to disrupt **BCL11A enhancer**, re-activating fetal hemoglobin to treat
  sickle-cell disease and β-thalassemia.
- **Verve / Beam — base-editing therapeutics** for familial hypercholesterolemia (PCSK9
  knockdown).
- **In-vivo LNP delivery** to the liver is approaching clinical reality for amyloidosis
  (Intellia NTLA-2001).

References: Jinek et al., *Science* 337, 816 (2012); Anzalone et al., *Nature* 576, 149
(2019); Komor et al., *Nature* 533, 420 (2016); Frangoul et al., *NEJM* 384, 252 (2021).

---

## 2. Epigenetic Alteration Vectors

The genome is annotated by a layer of **chemically reversible marks** that govern which
genes are accessible and transcribed without altering the DNA sequence. Engineering this
layer ("epigenome editing") avoids permanent genetic changes and — in principle — allows
modulation rather than irreversible knockout.

### 2.1 The Epigenetic Toolkit

| Mark | Carrier | Effect |
|---|---|---|
| **DNA methylation** | 5-methylcytosine on CpGs (5mC); 5-hydroxymethylcytosine (5hmC) | Promoter-CpG-island methylation usually silences |
| **Histone acetylation** (H3K27ac, H3K9ac) | Lys ε-amine acetyl groups via HATs | Open chromatin, active enhancers/promoters |
| **Histone methylation** | Mono/di/tri-methyl on Lys (K4, K9, K27, K36, K79) and Arg | Activating (H3K4me3, H3K36me3) or repressive (H3K9me3, H3K27me3) |
| **Histone variants** | H2A.Z, H3.3, macroH2A | Define specialized chromatin states |
| **Non-coding RNAs** | lncRNAs (e.g., XIST), miRNAs | Recruit chromatin modifiers; X-inactivation |
| **Chromatin compartments** | A (active) vs. B (inactive); TAD boundaries | 3-D genome organization (Hi-C topology) |

### 2.2 Programmable Epigenome Editors

By fusing a **DNA-binding scaffold** (dCas9, ZF, TALE) to a **chromatin effector**, one can
deliver writes, erasers, or readers to a precise locus:

| Tool | Effector | Effect |
|---|---|---|
| **CRISPRi** | dCas9–KRAB | Repressive H3K9me3 deposition; gene silencing |
| **CRISPRi-v2 / dCas9–KRAB-MeCP2** | Enhanced KRAB | Stronger silencing |
| **CRISPRa** | dCas9–VP64 / VPR / SAM / SunTag | Activate transcription (H3K27ac, RNAP II recruitment) |
| **dCas9–DNMT3A / DNMT3A-3L** | de-novo DNA methyltransferase | Heritable promoter methylation → durable silencing |
| **dCas9–TET1cd** | DNA demethylase catalytic domain | Locus-specific 5mC erasure → gene activation |
| **dCas9–p300** | HAT acetyltransferase | H3K27ac deposition; enhancer activation |
| **dCas9–LSD1** | Histone demethylase | H3K4me1/2 erasure; enhancer decommissioning |
| **CRISPRoff / CRISPRon** | Multi-domain fusions (KRAB + DNMT3A + DNMT3L) | Heritable, *reversible* silencing without DNA cuts (Nuñez et al., 2021) |

### 2.3 Heritability of Epigenetic Edits

- **DNA methylation** propagates through DNA replication via **DNMT1** maintenance
  methylation — durable across cell divisions and biologically meaningful for engineered
  silencing.
- **Histone marks** are partially inherited via parental-nucleosome partitioning at the
  replication fork; reinforced by reader-writer feedback loops (e.g., H3K27me3 is read and
  re-written by PRC2). Without continued upstream signal, marks decay.
- **Transgenerational inheritance** in mammals is contested. Most parental epigenetic
  marks are erased twice in the germline; a minority of CpG islands and certain
  imprinted loci escape. Engineered transgenerational epigenetic effects in humans
  remain **speculative**.

### 2.4 Design Considerations

- **Off-target binding** — dCas9 binds many genomic sites transiently, but only a subset
  yield strong epigenetic effects (chromatin context dependent).
- **Locus geometry** — methylation has greatest effect at CpG-island promoters; CRISPRa
  works best when guides target the −150 to +50 region around the TSS.
- **Reversibility** — KRAB-only silencing reverts within days/weeks; KRAB+DNMT3A+DNMT3L
  silencing has been shown stable for ≥ 50 cell divisions and across multiple tissues
  *in vivo*.

### 2.5 Therapeutic Vectors

- **In-vivo LNP delivery** of mRNA encoding dCas9-KRAB-DNMT3A targeting *PCSK9* — a
  permanent epigenetic LDL-cholesterol therapy (Tunable Therapeutics / Chroma early
  pipeline).
- **Cell-therapy contexts** — temporal control of CAR-T exhaustion programs via CRISPRi on
  *TOX* / *NR4A* family.
- **Aging research** — partial reprogramming via cyclic OSK(M) expression resets
  age-associated methylation patterns (Ocampo et al., *Cell*, 2016; ongoing work).

References: Thakore et al., *Nat Methods*, 2015; Nuñez et al., *Cell*, 2021;
Liu et al., *Cell*, 2018 (TET1).

---

## 3. Synthetic Biology Foundations

Synthetic biology applies engineering abstractions — standardized parts, modular design,
hierarchical assembly, and quantitative models — to living systems.

### 3.1 The Abstraction Hierarchy

```
DNA  →  PARTS  →  DEVICES  →  SYSTEMS  →  ORGANISMS
```

- **Parts** — promoters, RBSs, CDSs, terminators (BioBrick, MoClo, Marionette libraries).
- **Devices** — composed parts performing a function: a sensor, a logic gate, a recorder.
- **Systems** — networks of devices: oscillators, switches, computational pathways.
- **Organisms** — cellular chassis (E. coli, S. cerevisiae, Bacillus, mammalian) hosting
  the engineered circuits.

### 3.2 Iconic Genetic Circuits

| Circuit | Components | Function |
|---|---|---|
| **Toggle switch** (Gardner et al., 2000) | Two mutually repressing TFs | Bistable cellular memory |
| **Repressilator** (Elowitz & Leibler, 2000) | Three-node ring of repressors | Sustained oscillations |
| **Riboswitch** | Aptamer + ribozyme/expression platform | Ligand-dependent translation |
| **Quorum-sensing relay** | LuxI/LuxR with AHL | Cell-density-dependent activation |
| **CRISPR logic** | dCas9 + multiple sgRNAs | Programmable Boolean circuits |

### 3.3 Standardized Assembly Methods

| Method | Mechanism | Throughput |
|---|---|---|
| **Restriction–ligation (BioBrick)** | Type II REs with prefix/suffix | Low; single insert per round |
| **Golden Gate / MoClo** | Type IIS REs (BsaI, BsmBI) cut outside their recognition site, generating defined 4-nt overhangs | High; one-pot assembly of dozens of parts |
| **Gibson assembly** | Exonuclease + polymerase + ligase on overlapping fragments | High; sequence-flexible |
| **Yeast TAR / *in-vivo* assembly** | Homologous recombination in *S. cerevisiae* | Megabase-scale (*Mycoplasma*, yeast chromosome syntheses) |
| **DNA synthesis** (Twist, IDT, Ansa) | Phosphoramidite or enzymatic synthesis | Bypasses cloning entirely for ≤ ~10 kb |

### 3.4 Quantitative Engineering — Beyond Cloning

Modern syn-bio increasingly resembles electrical engineering:

- **Promoter strength** measured in transcription units (e.g., RPU, Relative Promoter
  Units; Anderson library, Marionette-Sensor library).
- **Ribosome binding sites (RBS)** designed via the **RBS Calculator** (Salis 2009),
  predicting translation initiation rate from ΔG of mRNA-rRNA hybridization and folding.
- **Genetic context effects** — promoter strength is not orthogonal to surrounding DNA;
  insulators (e.g., Marionette ribozymes) buffer against context.
- **Burden** — heterologous expression diverts ribosomes; circuits should be designed with
  burden-aware models (Ceroni et al., *Nat Methods*, 2018).

### 3.5 Chassis Engineering

| Chassis | Strengths | Weaknesses |
|---|---|---|
| **E. coli** | Fast, well-characterized, deep tooling | No protein glycosylation; LPS toxin |
| **S. cerevisiae** | Eukaryotic; PTMs; large heterologous pathways | Slower; secretion limits |
| **Bacillus subtilis** | Strong secretion, Gram-positive (no LPS) | Weaker tooling |
| **Pichia pastoris** | Methanol-induced expression, glycosylation | Specialized fermentation |
| **CHO mammalian** | Therapeutic proteins, human-like glycosylation | Slow, expensive |
| **Cell-free systems (TX-TL)** | No host constraints; rapid prototyping | Limited cofactor recycling |

### 3.6 Application Verticals

- **Pharmaceuticals** — semi-synthetic artemisinin (Keasling/Amyris); insulin; therapeutic
  antibodies.
- **Materials** — spider-silk fibers (Bolt Threads), engineered leather (Modern Meadow),
  polymers from microbes.
- **Energy & chemicals** — bio-isobutanol; long-chain fatty acids for diesel;
  CO₂-fixing organisms.
- **Food & agriculture** — precision-fermentation dairy (Perfect Day), animal-free egg
  whites (Clara Foods), heme-enabled plant burgers (Impossible).
- **Cell therapies** — CAR-T, in-vivo CAR generation, regenerative cell programs.
- **Diagnostics & biosensors** — SHERLOCK, DETECTR (Cas13/Cas12-based detection).

### 3.7 Safety & Containment

Engineered organisms should incorporate **kill switches**, **auxotrophy** for synthetic
amino acids (e.g., recoded *E. coli* requiring biphenylalanine; Mandell et al., 2015), and
**host range restrictions** to prevent escape and horizontal gene transfer. Dual-use
research is governed by the iGEM safety framework, the Cartagena Protocol, and national
biosecurity oversight bodies.

---

## 4. Precision Agricultural Science

Precision agriculture marries **genetic engineering**, **sensor networks**, and
**data analytics** to optimize input-per-output yield while reducing environmental load.

### 4.1 Trait Engineering in Crops

| Trait | Mechanism | Examples |
|---|---|---|
| **Herbicide tolerance** | EPSPS variant or transgene insensitive to glyphosate | Roundup-Ready soy, corn, cotton |
| **Insect resistance** | *Bt* (*Bacillus thuringiensis*) Cry/Cyt toxin transgenes | Bt corn, cotton |
| **Drought tolerance** | Stress-responsive TFs (e.g., *DREB*, *NF-YB1*) | DroughtGard maize |
| **Disease resistance** | R-gene stacking, NLR engineering | Potato (late blight); rice (bacterial blight) |
| **Nutritional enhancement** | Pathway insertion (β-carotene → Golden Rice; iron biofortification) | Golden Rice 2 |
| **Yield architecture** | Tiller, panicle, fruit-size genes (e.g., *IPA1*, *Gn1a*) | High-yield rice varieties |
| **Photosynthesis upgrades** | C4 retrofit, RuBisCO engineering, photorespiration bypass | Long lab program; first field gains in Synthetic photorespiration (South et al., *Science*, 2019) |
| **Genome-edited (non-transgenic)** | CRISPR knockouts of susceptibility / repressor genes | Mildew-resistant wheat (TaMLO); browning-resistant mushrooms; high-GABA tomato |

### 4.2 Genome-Editing in Agriculture

CRISPR has reframed regulatory definitions of "GMO." In the EU until recent reforms,
genome-edited plants without foreign DNA are classified as GMOs; in the US, USDA/APHIS
generally exempts simple knockouts ("SECURE" rule). Genome editing enables:

- **Allele introgression** — recreating elite alleles from wild relatives without years
  of backcrossing.
- **Multiplex editing** — knocking out paralog families simultaneously.
- **Promoter engineering** — fine-tuning expression rather than binary on/off.
- **De-novo domestication** — converting wild progenitors into productive crops in 2–3
  generations (e.g., wild tomato → cultivated traits; Zsögön et al., *Nat Biotechnol*,
  2018).

### 4.3 Soil, Water, and Inputs

#### 4.3.1 Soil Health Metrics

| Metric | What it indicates |
|---|---|
| **Organic matter %** | Long-term carbon, water-holding capacity |
| **CEC (cation exchange capacity)** | Nutrient retention (meq/100 g) |
| **Bulk density** | Compaction; root penetrability |
| **pH** | Nutrient availability (most crops 6.0–7.0) |
| **Microbial biomass C/N** | Biological activity |
| **Aggregate stability** | Erosion resistance |

#### 4.3.2 Input Optimization

- **4R Nutrient Stewardship** — Right source, Right rate, Right time, Right place.
- **Variable-rate application (VRA)** — GPS-guided sprayers/seeders deliver inputs at the
  resolution of management zones (typically 1–5 m).
- **Fertigation** — micro-dosing via drip irrigation aligned to crop phenology.
- **Decision support models** — ET₀ from Penman-Monteith; crop coefficient `Kc`; canopy
  N status from spectral indices (NDVI, NDRE, MCARI).

```
ET_c = Kc · ET_0          (crop evapotranspiration)
```

### 4.4 Sensing Stack

| Layer | Sensors |
|---|---|
| Satellite | Sentinel-2, Planet, Landsat — 3–10 m, multispectral, weekly |
| UAV | Multispectral, thermal, LiDAR; cm-resolution |
| Ground | Soil moisture (TDR/capacitance), EC, pH, NIR-spec |
| In-plant | Sap-flow, stem dendrometers, canopy chlorophyll |
| Animal | RFID, accelerometers, biometric collars |

Data fusion → **digital twin of the field** → optimal sowing date, irrigation pulses,
pest pressure forecasts.

### 4.5 Microbiome and Biological Inputs

- **N-fixing microbes** for non-legume crops (Pivot Bio's *Klebsiella variicola* product
  fixes atmospheric N₂ in maize roots, displacing ~25 lb/acre synthetic N).
- **Mycorrhizal inoculants** — endo (AMF) and ecto associations enhancing P uptake and
  drought tolerance.
- **Biopesticides** — *Bacillus thuringiensis* sprays, RNAi-based products (e.g.,
  ledprona), pheromone disruption.

### 4.6 Closed-Loop Robotics

Modern row-crop farms deploy:

- **Autonomous tractors** (John Deere, Monarch) with RTK-GPS to ±2 cm.
- **Computer-vision weeders** (Carbon Robotics, FarmWise) firing lasers or microbursts of
  spray at recognized weeds, sparing the crop.
- **Selective harvesters** (Tortuga AgTech for berries; Advanced Farm Technologies for
  strawberries) with end-effectors that grasp by maturity stage.

The cumulative effect: **input reductions of 30–80%**, yield uplifts of 5–25%, with
reduced runoff and lower greenhouse-gas intensity per unit yield.

---

# PART II — AUTOMOTIVE ENGINEERING

## 5. Thermodynamics of Internal Combustion Engines

A reciprocating ICE converts chemical energy in fuel into mechanical work via cyclic
combustion. Thermodynamic analysis idealizes this as the **Otto** (SI), **Diesel** (CI),
or **Atkinson/Miller** cycle.

### 5.1 Cycle Definitions and Efficiency

#### 5.1.1 Otto Cycle (idealized SI)

Four reversible processes on a P-V diagram:

1. **1→2 Isentropic compression**.
2. **2→3 Constant-volume heat addition** (combustion).
3. **3→4 Isentropic expansion** (power stroke).
4. **4→1 Constant-volume heat rejection** (exhaust + intake idealization).

Thermal efficiency:

```
η_Otto = 1 − (1 / r^(γ−1))
```

where `r = V_max/V_min` is the **compression ratio** and `γ = c_p/c_v` (≈ 1.4 for air).

Practical SI engines have `r = 10–14` (premium fuel, knock-limited). At `r = 12`:
`η_Otto ≈ 1 − 1/12^{0.4} ≈ 0.63`. **Real-world η** is 30–40% due to incomplete combustion,
heat loss, friction, and pumping losses.

#### 5.1.2 Diesel Cycle

Differs from Otto in that heat addition is **at constant pressure** rather than constant
volume:

```
η_Diesel = 1 − (1/r^{γ−1}) · [(r_c^γ − 1) / (γ · (r_c − 1))]
```

where `r_c = V_3/V_2` is the cutoff ratio (volume increase during combustion). At equal
compression ratios `η_Diesel < η_Otto`, but Diesel cycles run at much higher `r` (15–22),
giving them superior real-world efficiency (40–50%). Compression ignition also tolerates
lean mixtures, lowering pumping losses.

#### 5.1.3 Atkinson / Miller Cycle

Expansion ratio > compression ratio: intake valve closes late (Atkinson) or early
(Miller), reducing effective compression while preserving expansion. Trades peak power for
**+5–10% thermal efficiency**. Used in hybrid powertrains (Toyota, Honda) where the
electric motor compensates for the lost low-end torque.

### 5.2 Mean Effective Pressure & Power

Indicated Mean Effective Pressure (IMEP) is the average pressure that, applied over one
expansion stroke, would produce the same work as the actual cycle:

```
W_cycle = IMEP · V_disp
P_brake = (BMEP · V_disp · N) / (n_R · 60)
```

- `V_disp` = swept displacement (m³).
- `N` = engine speed (rpm).
- `n_R` = revolutions per power stroke (2 for 4-stroke, 1 for 2-stroke).
- `BMEP` = brake (output) MEP, accounts for friction and pumping losses.

Modern naturally-aspirated SI engines: BMEP ≈ 10–14 bar.
Modern turbocharged SI: BMEP ≈ 20–28 bar.
Modern turbodiesel: BMEP ≈ 22–30 bar.
F1 V6 hybrid: BMEP ≈ 30–40 bar (at the cost of ~$10M/engine).

### 5.3 Combustion Chemistry

Stoichiometric combustion of iso-octane (gasoline surrogate, C₈H₁₈):

```
C₈H₁₈ + 12.5 O₂ + 47 N₂ → 8 CO₂ + 9 H₂O + 47 N₂
```

The **air-fuel ratio (AFR)** at stoichiometry is ~14.7:1 for gasoline (λ = 1).
Lean (λ > 1) → lower temperatures, more NOₓ in a narrow window, possible misfire.
Rich (λ < 1) → cooler in-cylinder peak (used to protect turbines and catalysts at WOT)
but high CO and unburned HC.

#### Key emissions chemistry

- **NOₓ**: Zeldovich mechanism — high temperatures (>1800 K) split N₂ and form NO.
- **CO**: incomplete oxidation; rich mixtures.
- **HC**: crevice quench, oil-film absorption, misfire.
- **PM (particulates)**: pool fires in direct-injection SI; soot in diesel diffusion
  flames.

#### Three-way catalyst (TWC)

Operates only near λ = 1. Pt/Rh/Pd reduce NOₓ and oxidize CO + HC simultaneously. Modern
SI engines use **closed-loop λ control** with wideband O₂ sensors and short-pulse
secondary injection during cold start to bring catalyst light-off temperature
(~250–300 °C) within 10–30 s.

### 5.4 Forced Induction

| Method | Mechanism | Trade-offs |
|---|---|---|
| **Turbocharger** | Exhaust-driven turbine spins compressor | Free energy from waste heat; boost lag |
| **Supercharger** (Roots, twin-screw, centrifugal) | Mechanically driven | Instant boost; parasitic load |
| **Electric supercharger / e-turbo** | Motor-assisted | Eliminates lag; needs 48 V or HV system |
| **Twin-charging** | Super + turbo | Bridges low- and high-RPM boost; complex |

Boost adiabatic compression heats charge air; an **intercooler** restores density
(`ρ ∝ P/T`), permitting higher mass flow and reducing knock tendency.

### 5.5 Knock and Pre-Ignition

**Knock** = end-gas auto-ignition ahead of the flame front, producing pressure waves at
~6 kHz. Mitigated by:

- Higher-octane fuel (RON 95–100 in Europe, AKI 91–93 in the US).
- Knock sensors (piezoelectric on the block) → ECU retards spark by 1–5 °CA.
- Charge cooling via direct injection (latent heat of vaporization).
- Lower compression ratio.

**LSPI** (Low-Speed Pre-Ignition) is a more violent failure mode in turbo SI engines;
addressed by oil chemistry (low Ca, modified detergent packages) and dynamic combustion
phasing.

### 5.6 Ignition and Injection Control

- **Spark advance** in °CA before TDC, mapped vs. load and RPM. **MBT** (Maximum Brake
  Torque) timing is the angle that maximizes work; modern engines spark slightly before
  MBT to leave knock margin.
- **Direct injection** (GDI) at 200–500 bar; **port injection** at 4–6 bar. Many engines
  combine both to balance HC emissions and PM.
- **Variable valve timing** (Honda VTEC, BMW Vanos, Toyota VVT-iE) and **variable lift**
  reshape the breathing curve across RPM.
- **Cylinder deactivation** shuts half the cylinders at part load, raising BMEP on the
  active cylinders into a more efficient zone.

### 5.7 Friction and Heat Loss

Engine **mechanical efficiency** ≈ 80–90%; the rest is friction (rings, bearings, valve
train) and pumping losses. Modern reductions:

- DLC (diamond-like carbon) tappet coatings.
- Lower-tension piston rings.
- Friction-modified low-viscosity oils (0W-16, 0W-20).
- Variable-pressure oil pumps.
- Asymmetric piston skirts.

---

## 6. Vehicle Fluid Dynamics

### 6.1 External Aerodynamics

Drag and lift on a vehicle:

```
F_D = ½ · ρ · V² · C_D · A
F_L = ½ · ρ · V² · C_L · A
```

- `ρ` = air density (≈ 1.225 kg/m³ at sea level).
- `V` = vehicle velocity (m/s).
- `C_D` = drag coefficient (dimensionless).
- `C_L` = lift coefficient.
- `A` = frontal area (m²).

**C_D values**: classic sedan 0.32–0.35; modern aero EV 0.20–0.23 (Mercedes EQS at 0.20);
F1 car 0.7–1.0 *with* large negative `C_L` (downforce); pickup truck 0.40–0.50.

Power required to overcome drag rises with the **cube** of velocity:

```
P_drag = F_D · V = ½ · ρ · V³ · C_D · A
```

Doubling speed → 8× the drag power. This is why EV range collapses on the highway and why
streamlining yields *more* benefit at higher speeds.

### 6.2 Boundary Layer & Reynolds Number

```
Re = ρ · V · L / μ
```

For a 4 m car at 30 m/s in air (μ ≈ 1.8 × 10⁻⁵ Pa·s):
`Re ≈ 1.225 × 30 × 4 / 1.8e-5 ≈ 8 × 10⁶` — fully turbulent.

Boundary-layer separation behind the rear of the vehicle creates a **wake** with low base
pressure (a major drag contributor). Mitigations:

- **Rounded rear edges / tapered "Kammback"** to delay separation.
- **Vortex generators** to mix energetic outer flow into the boundary layer.
- **Active rear spoilers / underbody flaps** that change geometry by speed.
- **Underbody panels and rear diffusers** to control wake structure and add downforce.

### 6.3 Downforce in Performance Vehicles

Downforce (`F_L < 0`) keeps tires loaded for cornering. Sources:

- **Wings** — reverse-airfoil pressure differential.
- **Diffuser** — accelerates underbody flow (Bernoulli) → low pressure under car.
- **Vortex generators** at the wing tips and underbody edges.
- **Ground effect** (F1 2022+, sports cars) — venturi tunnels under the floor.

Downforce comes with **drag penalty** (`L/D` ratio); race teams trade them for circuit
specifics. A modern F1 car can generate downforce equal to ~3.5× car weight at 250 km/h.

### 6.4 Internal Flows

#### 6.4.1 Intake & Exhaust Tuning

Helmholtz resonance in intake runners:

```
f = (c / 2π) · √(A / (V·L))
```

- `A` = cross-section, `L` = runner length, `V` = plenum/cylinder volume, `c` = speed of
  sound.

Tuned-length runners pulse positive pressure waves at the intake valve at target RPM,
boosting volumetric efficiency. Variable-length intake manifolds (Audi, BMW) shift the
peak.

#### 6.4.2 Cooling System

- **Radiator** — cross-flow heat exchanger; heat duty 30–60 kW for typical passenger
  cars at full load.
- **Coolant flow** managed via thermostat + electric water pump; modern systems target
  cylinder-head temp 90–110 °C, block 90 °C.
- **Charge-air coolers** (intercoolers) drop intake-charge temperature 30–80 K depending
  on boost level, recovering 5–15% torque.

### 6.5 Tire Aerodynamics & Rolling Resistance

Rolling resistance:

```
F_RR = C_RR · m · g
```

`C_RR` 0.006–0.010 for modern passenger tires; LRR (low rolling resistance) tires reach
0.005. At 100 km/h, drag and rolling resistance roughly equalize for a sedan, so each
deserves engineering effort.

### 6.6 Computational Fluid Dynamics (CFD)

Industry standard for vehicle aero is **RANS** (Reynolds-Averaged Navier-Stokes) with
turbulence models like **k-ω SST**, transitioning to **DES (Detached Eddy Simulation)**
or **LES (Large-Eddy Simulation)** for high-fidelity wake/transient work. Wind-tunnel
correlation is still mandatory; CFD complements rather than replaces it.

---

## 7. Electric Vehicle Powertrain Mechanics

### 7.1 The Powertrain Stack

```
HV Battery  →  Inverter  →  Electric Motor  →  Reduction Gear  →  Wheels
                                ↑
                              Cooling
                                ↑
                              Control (motor controller, BMS, VCU)
```

### 7.2 Battery — The Energy Domain

Most modern EV packs use **lithium-ion** cells, in three dominant chemistries:

| Chemistry | Cathode | Pros | Cons |
|---|---|---|---|
| **NMC** (LiNi_xMn_yCo_z O₂) | High Ni (NMC811, NMC9.55) | ~250–280 Wh/kg cell; high power | Cobalt cost; thermal runaway risk |
| **LFP** (LiFePO₄) | Iron phosphate | Cheaper, safer (no thermal runaway), 5,000+ cycles | ~160 Wh/kg cell; weak in cold |
| **NCA** (LiNi_xCo_yAl_z O₂) | Nickel-cobalt-aluminum | High energy; Tesla legacy | Cycle/calendar life concerns |
| **Solid-state (emerging)** | Various | 400+ Wh/kg potential, non-flammable | Manufacturing scale; interface degradation |

#### Pack architecture

- **Cell formats**: cylindrical (18650, 21700, 4680), prismatic, pouch.
- **Modules and packs**: cells → modules → pack with cooling plates, busbars, BMS.
- **Cell-to-pack (CTP)** and **cell-to-chassis (CTC)** designs (BYD Blade, Tesla
  structural pack) eliminate module layer for higher pack-level density.

#### Battery Management System (BMS)

Core duties:

- **Voltage monitoring** per cell or cell-group; balance to ±10 mV.
- **Current measurement** at 1–10 kHz for SOC integration.
- **Temperature sensors** distributed across cells.
- **State-of-charge (SOC)** estimation via Coulomb counting + open-circuit-voltage
  curves + Kalman filter.
- **State-of-health (SOH)** via capacity tracking and impedance fingerprinting.
- **Thermal control** via liquid plates (50:50 glycol-water, common); refrigerant in
  performance EVs.
- **Safety**: contactor opening on isolation faults, overtemperature, overcurrent;
  pyrofuse for crash events.

### 7.3 Inverter — Converting DC to AC

The inverter converts pack DC into 3-phase AC for the motor and provides **regenerative
braking** by inverting the flow:

- **Topology**: 6-switch 3-phase bridge using **IGBTs** (older) or **SiC MOSFETs**
  (Tesla Model 3+, Hyundai E-GMP, Lucid). SiC reduces switching losses 50–70%, enables
  800 V architectures.
- **Control**: **Field-Oriented Control (FOC)** decomposes stator currents into d (flux)
  and q (torque) components in a rotating frame, giving DC-machine-like control of
  torque.
- **PWM**: switching frequencies 5–20 kHz; higher frequencies for lower current ripple
  but higher switching losses.
- **DC-link capacitor** smooths the bus; energy density and ripple-current handling
  determine inverter weight.

### 7.4 Electric Motor — Converting Electrical to Mechanical

Two dominant types:

| Type | Construction | Where it shines |
|---|---|---|
| **PMSM** Permanent Magnet Synchronous Motor | Rotor with NdFeB or ferrite magnets; stator with windings | Highest efficiency at part load; most passenger EVs (Tesla Model 3 rear, Hyundai E-GMP) |
| **IPM** Interior Permanent Magnet | Magnets buried; reluctance + magnetic torque | Best for high speed range with field weakening |
| **Induction (ACIM)** | Squirrel-cage rotor; no magnets | No rare-earths; robust at high temperature; classical Tesla front motor |
| **WRSM** Wound-Rotor Synchronous | Rotor field via brushes/slip-rings | Used by BMW iX (no magnets, controllable rotor field) |
| **Axial-flux** | Disc-shaped, magnets on rotor disks | Very high power density (Yasa, Mercedes-AMG) |

#### Performance equations

Synchronous-motor torque (PM machine, dq frame):

```
T = (3/2) · p · [ψ_PM · i_q + (L_d − L_q) · i_d · i_q]
```

- `p` = pole pairs.
- `ψ_PM` = magnet flux linkage.
- `L_d, L_q` = direct- and quadrature-axis inductances.
- `i_d, i_q` = stator currents in dq frame.

The first term is **magnet torque**; the second is **reluctance torque**. IPM rotors are
designed (via flux barriers) to maximize `(L_q − L_d)` for high-speed efficiency through
field weakening (negative `i_d`).

#### Efficiency map

PMSMs achieve **≥ 95% peak efficiency** and >90% across a wide operating envelope.
Map shape determines real-world consumption — automakers optimize the map for the most
common driving regions (urban / highway).

### 7.5 Reduction Gearbox & Driveline

EVs typically use a **single-speed reducer** (~8–10:1 ratio) because motor torque is
available from 0 RPM and motors spin to 15,000–20,000 RPM. Some performance EVs (Porsche
Taycan, several Chinese OEMs) use **2-speed transmissions** for better top-end and
efficiency at sustained speeds.

Drivetrain efficiency from battery → wheel: **85–90%** (motor + inverter + reducer +
auxiliaries). ICE drivetrain comparable: ~25–30%.

### 7.6 Charging & Architectures

- **AC (onboard charger)**: 7.4 / 11 / 22 kW from grid AC; rectified onboard.
- **DC fast charge**: 50–350 kW direct to pack via CCS, NACS, or CHAdeMO connector;
  conversion done off-vehicle.
- **400 V vs 800 V architectures**: 800 V (Porsche Taycan, Hyundai E-GMP, Lucid) halves
  the current for the same power, reducing cable mass and enabling 270–350 kW peak charge
  rates. Requires SiC inverter and motor capable of higher voltage.
- **Bidirectional charging (V2L, V2H, V2G)**: vehicle as mobile battery — increasingly a
  product spec.

### 7.7 Regenerative Braking

Decelerating the vehicle drives the motor as a generator, returning energy to the pack:

```
P_regen = T_drag · ω_motor    (subject to inverter rating and pack acceptance limit)
```

Limits:

- **Cold pack** can't accept high regen (Li-plating risk) → friction brakes do more work.
- **Full pack** can't accept regen → braking blends in friction.
- **Tire grip** is the absolute ceiling at the wheel.

One-pedal driving recovers 60–80% of braking energy in urban cycles — a major contributor
to EVs' real-world efficiency advantage over hybrids.

### 7.8 Thermal Management

Modern EVs use **integrated heat-pump** thermal systems linking battery, drive unit,
cabin, and ambient. A heat pump can deliver 2–4 kW of cabin heat per kW electrical
consumed (COP 2–4), versus the 1:1 of resistive heaters — adding 20–30% winter range.

---

## 8. Structural & Material Mechanics

### 8.1 Loads and Failure Criteria

Vehicles experience **static, dynamic, and impact loads**: stiffness for ride/handling,
strength for crash, fatigue for durability. Material selection optimizes these against
mass and cost.

#### Stress / strain basics

```
σ = F / A           (engineering stress)
ε = ΔL / L₀         (engineering strain)
σ = E · ε           (Hooke's law in elastic regime)
```

- `E` (Young's modulus) — steel ~200 GPa; aluminum ~70 GPa; CFRP ~70–150 GPa
  (highly directional); titanium ~110 GPa.

Failure criteria for ductile metals: **von Mises** (yield) for static; **Goodman /
Soderberg / Haigh** for fatigue under mean + alternating stress.

```
σ_v = √[ ½ · ((σ₁−σ₂)² + (σ₂−σ₃)² + (σ₃−σ₁)²) ]      (von Mises stress)
```

### 8.2 Material Hierarchy in Modern Vehicles

| Material | Typical UTS | Use |
|---|---|---|
| Mild steel | 270–350 MPa | Inner panels, brackets |
| HSLA (high-strength low-alloy) | 350–550 MPa | Underbody rails |
| AHSS (advanced high-strength steel) — DP, TRIP, CP | 500–1500 MPa | Pillars, cross-members |
| Press-hardened steel (PHS, "boron") | 1500–2000 MPa | A/B-pillar reinforcements, bumpers |
| Aluminum 5xxx, 6xxx (rolled, extruded) | 200–350 MPa | Hoods, doors, structural extrusions (Audi Space Frame, Tesla Model S) |
| Aluminum 7xxx | 500–700 MPa | High-strength reinforcements |
| Magnesium AZ91 | 230 MPa | Steering wheel armatures, magnesium die-castings |
| CFRP (carbon-fiber reinforced polymer) | 600–1500 MPa (laminate, in-plane) | Roof, monocoques, BMW i3/i8, McLaren chassis |
| Titanium Ti-6Al-4V | 950 MPa | Exhaust, fasteners, valve springs (specialist) |

### 8.3 Body-in-White Architectures

| Architecture | Concept | Examples |
|---|---|---|
| **Unibody (monocoque)** | Body and frame integrated; load paths are continuous | Most passenger cars |
| **Body-on-frame** | Separate ladder frame + body | Trucks (F-150), some SUVs |
| **Space frame** | Welded/bolted aluminum extrusions + nodes | Audi A8 ASF, Lotus Elise |
| **Carbon monocoque** | Single CFRP tub | F1, McLaren, BMW i8 (LifeDrive) |
| **Mega-castings** | Single-piece HPDC aluminum nodes (Tesla Model Y front/rear; Volvo EX90) | Reduces parts count, weld lines |
| **CTC structural pack** | Battery becomes a structural floor element | Tesla Model Y, BYD Seal |

### 8.4 Crashworthiness

Energy absorbed during a crash:

```
E = ½ · m · v² = ∫ F dx   ≈   F_avg · s
```

For a 1500 kg car at 56 km/h (15.6 m/s): `E ≈ 182 kJ`. A 600 mm crumple stroke at constant
deceleration would require `F_avg ≈ 304 kN`, producing ~20 g average. Engineering target
is to spread that into **graduated stages** that protect occupants:

1. **Bumper / crash boxes** (low-speed energy absorption).
2. **Front rails / longitudinals** (progressive folding; ~20 g pulses).
3. **Firewall / footwell** integrity (no intrusion).
4. **Side impact bars / B-pillar** (intrusion limit).
5. **Roof crush** ≥ 4× vehicle weight (FMVSS 216).
6. **Pole / oblique** modes (small overlap, IIHS).

Crash steel (PHS) yields at the rails in folding modes; AHSS resists intrusion in the
safety cell. Aluminum extrusions absorb energy via stable folding and are sized via
EA/mass metrics (typically 30–60 kJ/kg specific energy absorption).

### 8.5 Vehicle Dynamics — Stiffness

- **Torsional stiffness** (Nm/deg): a luxury/performance benchmark; a stiff body permits
  the suspension tuner to control wheel motion precisely.
- **Bending stiffness**: prevents local panel resonance ("body shake") and improves NVH.
- **Modal frequencies**: first body bending mode > 25 Hz, first torsion > 30 Hz to
  decouple from suspension and engine modes.

### 8.6 NVH (Noise, Vibration, Harshness)

| Source | Mitigation |
|---|---|
| Powertrain | Active engine mounts; balance shafts; cylinder deactivation timing |
| Tire / road | Acoustically lined tires (foam-filled); body cavity foam; underbody panels |
| Wind | Aero-acoustic seal design; A-pillar / mirror geometry; laminated glass |
| Driveline | Tuned dampers on driveshafts; harmonic balancers |
| Brake | Shimmed pads, friction-material formulation, anti-noise grease |

EVs change the spectral mix dramatically: **no combustion mask**, so previously buried
sources (gear whine, inverter switching at 5–20 kHz, tire road noise, wind) become
audible. Hence the heavier acoustic glazing, foam-filled tires, and active sound design
characteristic of premium EVs.

### 8.7 Fatigue and Durability

Vehicles see 10⁶–10⁹ load cycles over their life. Design uses **S-N curves** (Wöhler) and
**rainflow counting** of strain histories. **Miner's rule** sums damage:

```
D = Σ (n_i / N_i)        D ≥ 1 → predicted failure
```

`n_i` = applied cycles at stress level `i`; `N_i` = cycles to failure at that level.

Critical inspection points: weld nuggets, bolt holes, suspension knuckles, subframe
mounting bushings, battery tray welds (EVs).

### 8.8 Manufacturing-Driven Material Choices

- **Stamping** dominates steel BIW (continuous, fast, cheap).
- **Hot-stamping (PHS)** introduces martensitic structures by quenching in-die.
- **Extrusion + hydroforming** produces variable-section aluminum members.
- **High-pressure die-casting (HPDC)** scales mega-castings; Tesla 6,000–9,000-tonne
  presses have set the precedent.
- **Resin Transfer Molding (RTM)** for CFRP at series volumes (BMW i3 cell took ~2 min
  cycle time vs. hours for autoclave).
- **Additive manufacturing** for low-volume nodes, brackets, and tooling inserts.

Manufacturing process sets the *minimum thickness, geometry constraints, and joining
strategy* — and thus the achievable mass.

---

## 9. Appendix

### 9.1 Genetic Engineering — Quick Reference

```
DSB repair:        NHEJ (knockout)  |  HDR (precise edit)  |  PE/BE (no DSB)
SpCas9 PAM:        5'-NGG-3'         (xCas9/SpRY relax this)
Editing window:    3 nt upstream of PAM (blunt cut)
Off-target tools:  GUIDE-seq, CIRCLE-seq, CRISPOR
Chassis options:   E. coli, S. cerevisiae, B. subtilis, P. pastoris, CHO, cell-free
Epigenome editors: dCas9-KRAB (silence) | dCas9-VPR (activate)
                    dCas9-DNMT3A/3L (durable methylation)
                    dCas9-TET1 (demethylation) | dCas9-p300 (H3K27ac)
Crop traits:       herbicide tol., Bt, drought, biofortification, dz resistance,
                    edited susceptibility KO, multiplex domestication
```

### 9.2 Engine Thermodynamics — Quick Reference

```
η_Otto = 1 − 1/r^(γ−1)        γ ≈ 1.4 for air; r = compression ratio
η_Diesel = 1 − [(r_c^γ − 1)/(γ(r_c−1))] / r^(γ−1)
P_brake = (BMEP · V_d · N) / (n_R · 60)
AFR_stoich (gasoline) ≈ 14.7
NOx formation (Zeldovich): >1800 K
TWC operational window: λ ≈ 1
Modern BMEP: NA SI 10–14 bar, turbo SI 20–28, turbodiesel 22–30, F1 hybrid 30–40
```

### 9.3 Vehicle Aero & Fluid Dynamics — Quick Reference

```
F_drag = ½·ρ·V²·C_D·A         doubling V → 4× F_drag, 8× P_drag
Re = ρVL/μ                     vehicle scale: Re ~ 10⁶–10⁷ → fully turbulent
LRR tires: C_RR ≈ 0.005–0.007
Cooling duty: 30–60 kW typical passenger car at full load
F1 downforce: ≥ 3.5× car weight at 250 km/h
```

### 9.4 EV Powertrain — Quick Reference

```
Cell chemistries:         NMC (energy)  |  LFP (cycle/safety)  |  NCA  |  solid-state
Pack architecture:        cell → module → pack → CTP → CTC
Inverter switches:        Si IGBT (legacy) → SiC MOSFET (modern, 800 V)
Motor torque (PMSM, dq):  T = (3/2)·p·(ψ_PM·i_q + (L_d − L_q)·i_d·i_q)
Drivetrain efficiency:    EV ≈ 85–90%   |   ICE ≈ 25–30%
Heat-pump COP cabin:      2–4×
Architectures:            400 V (legacy)  |  800 V (Porsche, Hyundai E-GMP, Lucid)
```

### 9.5 Structural Mechanics — Quick Reference

```
σ = F/A      ε = ΔL/L₀      σ = E·ε
σ_v (von Mises): ductile yield criterion
Crash energy: E = ½mv²; spread over ~ 0.5–1.0 m crumple to limit ~20 g pulse
Body modes target: 1st bending > 25 Hz, 1st torsion > 30 Hz
Materials ladder: mild → HSLA → AHSS → PHS → Al 6xxx/7xxx → CFRP → Ti
Mfg processes: stamping, hot-stamping, extrusion+hydroform, HPDC mega-cast, RTM
```

### 9.6 Selected Primary References

#### Genetics

- Jinek M., et al. *Science* 337, 816–821 (2012).
- Anzalone A.V., et al. *Nature* 576, 149–157 (2019).
- Komor A.C., et al. *Nature* 533, 420–424 (2016).
- Gaudelli N.M., et al. *Nature* 551, 464–471 (2017).
- Frangoul H., et al. *NEJM* 384, 252–260 (2021).
- Nuñez J.K., et al. *Cell* 184, 2503–2519 (2021).
- South P.F., et al. *Science* 363, eaat9077 (2019).
- Zsögön A., et al. *Nat Biotechnol* 36, 1211–1216 (2018).
- Salis H.M., et al. *Nat Biotechnol* 27, 946 (2009).

#### Automotive

- Heywood J.B., *Internal Combustion Engine Fundamentals*, 2nd ed. McGraw-Hill.
- Hucho W.-H., *Aerodynamics of Road Vehicles*. SAE.
- Gillespie T.D., *Fundamentals of Vehicle Dynamics*. SAE.
- Pulkrabek W.W., *Engineering Fundamentals of the IC Engine*.
- Ehsani M. et al., *Modern Electric, Hybrid Electric, and Fuel Cell Vehicles*. CRC.
- Krause P.C., *Analysis of Electric Machinery and Drive Systems*, 3rd ed. Wiley.

---

> **Closing thesis.** Whether the substrate is a strand of DNA or a sheet of boron-alloyed
> steel, modern engineering is the disciplined application of mathematics to material —
> and the discipline becomes powerful only when the practitioner can see the equations
> living inside the artifact. The cell and the car are both machines; both yield to the
> same toolkit of conservation laws, modular abstraction, and quantitative modeling.
