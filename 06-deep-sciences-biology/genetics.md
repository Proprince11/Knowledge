---
title: Genetics — Molecular Foundations
domain: 06 — Deep Sciences & Biology
status: done
depth: graduate
prerequisites: [basic biology, chemistry]
last_updated: 2026-05-29
---

# Genetics — Molecular Foundations

Genetics is the study of **heredity and variation** at the level of information: how DNA encodes,
transmits, and expresses biological instructions. The central dogma — **DNA → RNA → protein** —
is the backbone, but modern genetics is about the *regulation, variation, and population
dynamics* layered on top.

## 1. Technical Mechanisms
- **DNA structure:** antiparallel double helix; complementary base pairing (A–T, G–C) via
  hydrogen bonds; the sugar-phosphate backbone. **5'→3' directionality** governs replication and
  transcription. The genome is ~3.2 billion bp in humans, ~20,000 protein-coding genes (a small
  fraction of total DNA).
- **Central dogma:** **Replication** (semiconservative, DNA polymerase, leading/lagging strands,
  Okazaki fragments) → **Transcription** (RNA polymerase reads template strand → pre-mRNA;
  **splicing** removes introns, joins exons; 5' cap + poly-A tail) → **Translation** (ribosome
  reads mRNA codons; tRNA brings amino acids; the **genetic code** is triplet, degenerate,
  near-universal).
- **Gene regulation:** promoters, enhancers, transcription factors, operons (prokaryotes);
  regulation determines *when/where/how much* a gene is expressed — the same genome yields every
  cell type (see `epigenetics.md`).
- **Mutation & variation:** point mutations (missense/nonsense/silent), indels, frameshifts,
  copy-number variation, chromosomal rearrangements. **SNPs** are the most common variation.
  Source of evolutionary raw material and disease.
- **Inheritance:** Mendelian (dominant/recessive, segregation, independent assortment), plus
  linkage, recombination, X-linkage, incomplete dominance, polygenic/quantitative traits, and
  non-Mendelian (mitochondrial, imprinting).

## 2. Application Frameworks
- **Mapping genotype→phenotype:** GWAS (genome-wide association studies) link SNPs to
  traits/disease; **polygenic risk scores** aggregate many small-effect variants. Most common
  traits are polygenic + environmental, not single-gene.
- **Sequencing technology:** Sanger (gold standard, short reads) → **NGS/Illumina** (massively
  parallel short reads) → **long-read** (PacBio, Oxford Nanopore — resolve structural variants,
  repeats). Cost collapsed from billions to ~hundreds of dollars per genome.
- **Clinical genetics:** carrier screening, pharmacogenomics (drug metabolism via CYP variants —
  links to `../05-human-physiology-optimization/herbal-pharmacology.md`), cancer genomics,
  rare-disease diagnosis.

## 3. Common Pitfalls
1. Genetic determinism ("a gene for X") — most traits are polygenic + environmental. 2. Confusing
correlation (GWAS hits) with causation/mechanism. 3. Ignoring linkage disequilibrium in
association studies. 4. Over-interpreting consumer DNA tests. 5. Forgetting that regulation, not
just sequence, defines phenotype.

## 4. Advanced Resources
- Alberts et al., *Molecular Biology of the Cell*; Watson, *Molecular Biology of the Gene*;
  NHGRI (<https://www.genome.gov/>); Ensembl/NCBI databases.

### Cross-references
`epigenetics.md` · `crispr-applications.md` · `gmo-engineering.md` · `synthetic-biology.md`
