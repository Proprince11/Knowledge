---
title: AI / ML Engineering
domain: 03 — Computer Science & Architecture
status: done
depth: graduate
prerequisites: [Python, linear algebra & calculus basics, probability]
reading_time: ~46 min
last_updated: 2026-05-29
---

# AI / ML Engineering

ML engineering is the discipline of turning a probabilistic model into a **reliable production
system**. The math (gradient descent, backprop) is necessary but not sufficient — most ML
projects fail on *data, evaluation, and deployment*, not on model architecture. This file
covers the learning machinery (loss, optimization, generalization), the model families, and the
MLOps lifecycle that separates a notebook demo from a system that holds up under real traffic
and data drift.

---

## 1. Technical Mechanisms

### 1.1 The learning problem

Supervised learning fits parameters `θ` to minimize **expected loss** over the data
distribution; in practice we minimize **empirical risk** over a training set:

```
θ* = argmin_θ  (1/N) Σ L(f_θ(xᵢ), yᵢ)  +  λ·R(θ)
                     └ data loss ┘        └ regularizer ┘
```

- **Loss functions:** MSE (regression), cross-entropy (classification), and task-specific
  losses. Cross-entropy = negative log-likelihood under a categorical model.
- **Regularization `R(θ)`:** L2 (weight decay, shrinks weights), L1 (sparsity), dropout,
  early stopping, data augmentation — all combat overfitting.

### 1.2 Gradient descent & backpropagation

Parameters update opposite the gradient:
```
θ ← θ − η · ∇_θ L          (η = learning rate)
```
**Backpropagation** is the chain rule applied through the computation graph, computing
`∇_θ L` efficiently in one backward pass. Variants:
- **SGD + momentum** (cheap, generalizes well), **Adam/AdamW** (adaptive per-parameter rates,
  the default for deep nets; AdamW decouples weight decay).
- **Learning-rate schedules** (warmup + cosine decay) are often as important as the optimizer.
- **Mini-batches** trade gradient noise for throughput; batch size interacts with LR.

### 1.3 The bias–variance tradeoff & generalization

```
Expected error ≈ bias² + variance + irreducible noise
```
- **Underfit (high bias):** model too simple → high train & test error. Fix: more capacity,
  better features, train longer.
- **Overfit (high variance):** memorizes train, fails on test. Fix: regularize, more data,
  simpler model.
- Modern deep nets exhibit **double descent** (test error can fall again past the
  interpolation threshold) — the classic U-curve is incomplete for overparameterized models,
  but the *operational discipline* (hold-out evaluation) still rules.

### 1.4 Model families & when to use them

| Family | Strength | Use when |
|---|---|---|
| Linear / logistic regression | interpretable, fast, strong baseline | tabular, need explainability |
| **Gradient-boosted trees** (XGBoost/LightGBM) | SOTA on *tabular* data | structured/tabular problems |
| CNNs | spatial features | images, grids |
| RNN/LSTM | sequences (legacy) | small sequence tasks |
| **Transformers** | attention over sequences; scale | NLP, vision, multimodal, LLMs |
| k-NN / clustering | non-parametric / unsupervised | retrieval, segmentation |

> **Key heuristic:** for **tabular** data, gradient-boosted trees usually beat deep learning.
> Reach for deep nets when you have high-dimensional unstructured data (text/images/audio) and
> enough of it.

### 1.5 The transformer & attention (the architecture behind modern AI)

Self-attention computes a weighted combination of all tokens:
```
Attention(Q, K, V) = softmax( Q·Kᵀ / √d_k ) · V
```
Each token forms a **query** that matches **keys** to produce attention weights over **values**.
Multi-head attention runs this in parallel subspaces. Transformers (Vaswani et al., 2017)
replaced recurrence with attention → parallelizable, scalable, and the basis of LLMs (see
`llm-fine-tuning.md`).

### 1.6 Evaluation: the part everyone underweights

- **Split discipline:** train / validation / test, with the test set touched *once*. Use
  cross-validation when data is scarce. Prevent **leakage** (no future info, no target-derived
  features, split *before* preprocessing).
- **Metrics match the goal, not accuracy by default.** On imbalanced data, accuracy lies; use
  precision/recall, F1, **PR-AUC** (better than ROC-AUC under heavy imbalance), calibration.
- **A threshold is a product decision:** the precision/recall tradeoff encodes the cost of
  false positives vs. negatives.

---

## 2. Application Frameworks

### 2.1 The ML project lifecycle (CRISP-DM-ish, modernized)

```
1. PROBLEM FRAMING   what decision does this inform? what's the baseline? what's "good enough"?
2. DATA              collect, clean, label; understand distribution; build a validation set FIRST
3. BASELINE          a dumb model (majority class / linear / heuristic) — beat THIS before fancy
4. ITERATE           features → model → tune; track experiments; error-analyze failures
5. EVALUATE          offline metrics + slices (per-segment) + fairness checks
6. DEPLOY            serving, monitoring, rollback
7. MONITOR           drift, performance decay, feedback loops → retrain
```

> **The #1 lesson:** spend your time on **data and evaluation**, not architecture. A clean
> dataset + a strong baseline + honest evaluation beats a fancy model on dirty data nearly
> every time.

### 2.2 The feature/data pipeline

- **Train/serve skew** is a top production bug: features computed differently in training vs.
  serving. Use a **feature store** or shared transformation code.
- **Reproducibility:** version data + code + config + random seeds. An unversioned dataset
  makes results irreproducible.
- **Handle the messy reality:** missing values, outliers, categorical encoding, scaling, class
  imbalance (resampling / class weights / focal loss).

### 2.3 Experiment tracking & tuning

- **Track everything** (params, metrics, artifacts) — MLflow / Weights & Biases.
- **Hyperparameter search:** random search > grid (Bergstra & Bengio); Bayesian/Optuna for
  expensive models. Tune LR, regularization, capacity first.
- **One change at a time** + a fixed validation set, or you can't attribute improvements.

### 2.4 Deployment patterns (MLOps)

| Pattern | Use |
|---|---|
| Batch / offline scoring | precompute predictions on a schedule |
| Online / real-time API | low-latency per-request inference |
| Streaming | continuous scoring on event streams |
| Edge / on-device | latency/privacy; quantized/distilled models |

- **Optimize inference:** quantization (FP16/INT8), distillation, batching, ONNX/TensorRT,
  caching. Serve with versioned model artifacts and a rollback path.
- **Shadow / canary / A-B** releases: validate a new model on live traffic before full rollout
  (ties to `../01-monetization-digital-empires/high-conversion-ads.md` experiment discipline).

### 2.5 Monitoring in production (models decay)

- **Data drift** (input distribution shifts) and **concept drift** (the X→Y relationship
  shifts) silently degrade models. Monitor input distributions, prediction distributions, and —
  when labels arrive — live performance.
- **Feedback loops:** a model that influences the data it later trains on (recommenders) can
  self-reinforce bias; monitor and de-bias.
- **Alerting + automated retraining** triggers close the loop.

### 2.6 Responsible AI (not optional)

- **Fairness:** evaluate metrics *per protected slice*; a model can be accurate overall and
  harmful to a subgroup.
- **Explainability:** SHAP / feature importance / partial-dependence for stakeholder trust and
  debugging.
- **Privacy & governance:** data minimization, consent, PII handling; document datasets and
  models (datasheets / model cards).

---

## 3. Common Pitfalls

1. **Skipping the baseline.** Without a dumb baseline you can't tell if your model adds value.
2. **Data leakage.** Future info / target-derived features / preprocessing before the split →
   inflated offline metrics, production collapse.
3. **Accuracy on imbalanced data.** Use precision/recall/PR-AUC and pick a threshold by cost.
4. **Train/serve skew.** Different feature code paths; use shared transforms / a feature store.
5. **Overfitting the test set.** Repeatedly tuning against "test" turns it into a training set;
   keep it sacred.
6. **No experiment tracking / no data versioning** → irreproducible results.
7. **Deep learning on tabular data** when boosted trees would win faster and cheaper.
8. **Ignoring drift.** "It worked at launch" → silent decay months later.
9. **Optimizing the model, neglecting the data.** Most gains live in data quality/labels.
10. **No monitoring or rollback** in production → undetected failures.
11. **Ignoring fairness/slices** → harmful, biased, or non-compliant systems.

---

## 4. Advanced Resources

**Foundational papers/books**
- Goodfellow, Bengio, Courville. *Deep Learning* (free online): <https://www.deeplearningbook.org/>
- Hastie, Tibshirani, Friedman. *The Elements of Statistical Learning* (free PDF).
- Vaswani et al. *Attention Is All You Need.* NeurIPS 2017: <https://arxiv.org/abs/1706.03762>
- Bergstra & Bengio. *Random Search for Hyper-Parameter Optimization.* JMLR 2012.

**Engineering / MLOps**
- Huyen, C. *Designing Machine Learning Systems* (O'Reilly) — the production-systems canon.
- Google's *Rules of Machine Learning* (Zinkevich):
  <https://developers.google.com/machine-learning/guides/rules-of-ml>
- *Machine Learning: The High-Interest Credit Card of Technical Debt* (Sculley et al., NeurIPS
  2015) — the hidden costs of ML systems.

**Tooling**
- scikit-learn, PyTorch, XGBoost/LightGBM docs; MLflow / Weights & Biases; ONNX Runtime.

---

### Cross-references
- `llm-fine-tuning.md` — transformers, training, and adaptation at the LLM scale.
- `python-masterclass.md` — the implementation language and numerical stack.
- `dbms.md` / `system-design.md` — feature stores, serving infrastructure, data pipelines.
- `../01-monetization-digital-empires/high-conversion-ads.md` — online experimentation/A-B math.
