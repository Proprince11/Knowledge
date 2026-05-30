---
title: LLM Fine-Tuning & Adaptation
domain: 03 — Computer Science & Architecture
status: done
depth: graduate
prerequisites: [ai-ml-engineering.md, Python, transformers basics]
reading_time: ~44 min
last_updated: 2026-05-29
---

# LLM Fine-Tuning & Adaptation

Adapting a large language model is an **optimization-under-constraints** problem: you want
maximum behavior change for minimum compute, data, and risk of degrading the base model's
general ability. The single most important decision is *whether to fine-tune at all* — prompt
engineering and retrieval (RAG) solve most problems faster and cheaper. This file gives the
decision framework first, then the methods (PEFT/LoRA, full fine-tune, alignment), the data
discipline, and evaluation.

---

## 1. Technical Mechanisms

### 1.1 The adaptation ladder (cheapest → most expensive)

```
1. PROMPTING            instructions + few-shot examples. Zero training. Try this first.
2. RAG (retrieval)      inject relevant context at inference from a knowledge store. Best for
                        FACTS/knowledge that change. No weight changes.
3. PEFT / LoRA          train a tiny adapter (<1% of params). Best for STYLE/FORMAT/skill.
4. FULL FINE-TUNE       update all weights. Expensive; risk of catastrophic forgetting.
5. CONTINUED PRETRAIN   new domain at scale (massive corpora, large compute).
6. RLHF / DPO alignment shape preferences/safety on top of an SFT model.
```

> **Decision rule:** *Fine-tuning teaches a model how to behave (style, format, task); RAG
> teaches it what to know (facts).* Don't fine-tune to inject knowledge that changes — you'll
> bake in stale facts and pay to retrain. Don't RAG to fix tone — that's a fine-tune job.

### 1.2 Why fine-tuning is expensive and risky at full scale

A full fine-tune updates billions of parameters, requiring optimizer state (Adam keeps ~2
extra tensors per parameter) → memory ≈ several× model size. It also risks **catastrophic
forgetting** (degrading general ability) and **overfitting** to a small dataset. This is why
**parameter-efficient fine-tuning (PEFT)** dominates practice.

### 1.3 LoRA & QLoRA (the workhorses)

**LoRA** (Low-Rank Adaptation, Hu et al., 2021) freezes the pretrained weights `W` and learns a
low-rank update:
```
W' = W + ΔW,   ΔW = B·A,   where A ∈ ℝ^{r×d}, B ∈ ℝ^{d×r},  rank r ≪ d
```
Only `A` and `B` train (often <1% of parameters). Benefits: tiny checkpoints, multiple swappable
adapters per base model, no added inference latency once merged.
- Key hyperparameters: **rank `r`** (capacity, e.g., 8–64), **alpha** (scaling), **target
  modules** (attention projections, sometimes MLP), dropout.
- **QLoRA** (Dettmers et al., 2023) quantizes the frozen base to **4-bit (NF4)** and trains LoRA
  adapters on top → fine-tune a large model on a single GPU with minimal quality loss.

### 1.4 The training objectives

- **SFT (Supervised Fine-Tuning):** next-token cross-entropy on curated
  instruction→response pairs. The foundation of instruction-following. Mask the loss to the
  *response* tokens (don't train on the prompt).
- **Preference alignment:**
  - **RLHF** (Reinforcement Learning from Human Feedback): train a reward model on human
    preference pairs, then optimize the policy with PPO against it. Powerful but complex/unstable.
  - **DPO** (Direct Preference Optimization, Rafailov et al., 2023): a closed-form loss on
    preference pairs that skips the separate reward model and RL loop — simpler, stable, widely
    adopted. Variants: IPO, KTO, ORPO.

### 1.5 Quantization & inference efficiency

- **Post-training quantization:** FP16/BF16 → INT8/INT4 (GPTQ, AWQ, bitsandbytes) shrinks
  memory and speeds inference with modest quality loss.
- **KV-cache** dominates memory at long context; techniques like paged attention (vLLM),
  grouped-query attention, and flash attention manage it.
- **Distillation:** train a smaller "student" on a larger "teacher's" outputs for cheap serving.

---

## 2. Application Frameworks

### 2.1 The decision framework (run this before training anything)

```
Q1: Is the problem KNOWLEDGE (facts/docs) or BEHAVIOR (style/format/task)?
     KNOWLEDGE → RAG.   BEHAVIOR → continue.
Q2: Can prompting + few-shot get you to "good enough"? → ship it; revisit later.
Q3: Need consistent format/tone/domain skill prompting can't hold? → LoRA/QLoRA SFT.
Q4: Need preference/safety shaping beyond SFT? → DPO (try before RLHF).
Q5: Truly need to alter the base distribution at scale? → full FT / continued pretrain (rare).
```

### 2.2 Data is the product (SFT dataset construction)

The quality ceiling of a fine-tune is its data. Evidence (e.g., the **LIMA** result, Zhou et
al. 2023) shows **~1k high-quality, diverse examples** can beat tens of thousands of noisy ones.

- **Format consistency:** exact chat template / special tokens the base model expects (a
  frequent silent failure — wrong template ⇒ garbage).
- **Diversity > volume:** cover the real input distribution; dedupe near-duplicates.
- **Quality control:** human review, filtering, decontamination against eval sets (leakage
  inflates scores).
- **Balance:** avoid one task/format dominating; include refusals/edge cases if you want them
  learned.

### 2.3 A practical QLoRA SFT recipe (conceptual)

```
1. Pick base model sized to your serving budget; load in 4-bit (NF4).
2. Apply LoRA to attention (and MLP) projections; r=16, alpha=32, dropout=0.05 (tune).
3. Format data with the model's chat template; mask loss to response tokens.
4. Train: small LR (1e-4–2e-4 for LoRA), cosine schedule + warmup, 1–3 epochs, grad accumulation.
5. Watch eval loss + a held-out qualitative set; STOP when general ability starts degrading.
6. Merge adapter (or serve adapter live); quantize for inference; evaluate (§2.4).
```

> **Hyperparameter intuition:** LoRA tolerates higher LR than full FT; too many epochs on small
> data overfits fast. Always keep a held-out *qualitative* probe set, not just loss.

### 2.4 Evaluation (the hard part for generative models)

There is no single accuracy number. Layer your evals:
- **Task metrics** where they exist (exact match, BLEU/ROUGE for constrained tasks — but these
  correlate weakly with quality).
- **LLM-as-judge** (pairwise preference vs. a baseline) — scalable, but validate the judge and
  watch for bias (position/verbosity); calibrate against human ratings.
- **Human evaluation** on a representative set — the gold standard for open-ended quality.
- **Regression suite:** check the fine-tune didn't degrade general capability (run a general
  benchmark before/after) and didn't break safety.
- **Decontamination:** ensure eval data never appeared in training.

### 2.5 RAG done right (since it's the answer for most "knowledge" needs)

```
chunk docs → embed → store in vector DB → at query: embed query → retrieve top-k →
re-rank → stuff into prompt with citations → generate
```
- **Chunking + retrieval quality** dominate RAG performance (garbage retrieval → garbage
  answer). Tune chunk size/overlap, add re-ranking, hybrid (keyword + vector) search.
- Combine with light prompting/fine-tuning for *format*; keep facts in the retrievable store so
  they can be updated without retraining (`dbms.md` covers pgvector/vector stores).

---

## 3. Common Pitfalls

1. **Fine-tuning to add knowledge.** Bakes in stale facts; use RAG for knowledge.
2. **Wrong chat template / special tokens** → silent quality collapse.
3. **Too little / low-diversity data, or too many epochs** → overfitting, catastrophic
   forgetting.
4. **No held-out eval / judging only by train loss** → can't tell if you helped or hurt.
5. **Data contamination** (eval examples in training) → inflated, dishonest scores.
6. **Jumping to full fine-tune / RLHF** when LoRA + DPO (or just prompting/RAG) suffices.
7. **Ignoring general-capability regression** — the model gets better at your task, worse at
   everything.
8. **Under-resourcing data work** — quality data is the lever; architecture rarely is.
9. **Skipping safety/refusal evals** after alignment changes.
10. **No inference-cost plan** (quantization/distillation) → a model you can't afford to serve.

---

## 4. Advanced Resources

**Core papers**
- Hu et al. *LoRA: Low-Rank Adaptation of Large Language Models.* 2021:
  <https://arxiv.org/abs/2106.09685>
- Dettmers et al. *QLoRA: Efficient Finetuning of Quantized LLMs.* 2023:
  <https://arxiv.org/abs/2305.14314>
- Rafailov et al. *Direct Preference Optimization.* 2023: <https://arxiv.org/abs/2305.18290>
- Ouyang et al. *Training language models to follow instructions with human feedback (InstructGPT).*
  2022: <https://arxiv.org/abs/2203.02155>
- Zhou et al. *LIMA: Less Is More for Alignment.* 2023: <https://arxiv.org/abs/2305.11206>
- Lewis et al. *Retrieval-Augmented Generation.* 2020: <https://arxiv.org/abs/2005.11401>

**Tooling / practical**
- Hugging Face `transformers`, `peft`, `trl` (SFT/DPO), `datasets`; bitsandbytes; vLLM.
- Hugging Face alignment & fine-tuning guides: <https://huggingface.co/docs>

---

### Cross-references
- `ai-ml-engineering.md` — transformers, training, evaluation, MLOps foundations.
- `python-masterclass.md` — the implementation language.
- `dbms.md` — vector stores (pgvector) for RAG.
- `../04-security/owasp-frameworks.md` — prompt injection & LLM application security (OWASP LLM Top 10).
