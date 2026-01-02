# Information-Centric Prediction Market (BSC)

## 1. Overview

This system is an **information-centric prediction market platform** inspired by Polymarket, deployed on **BNB Chain (BSC)**, with a focus on **crypto-native and sports events**.

The platform is **not positioned as a gambling or betting product**, but as a **market for aggregating collective beliefs** about real-world, verifiable events. Market prices represent the crowd's implied probability that an event will occur.

Core principles:

* Prices represent **information and belief**, not odds
* Assets are **non-custodial and fully on-chain**
* Resolution is **rule-based, transparent, and challengeable**
* Centralization is allowed at early stages, but **never arbitrary**

---

## 2. Market Types

The platform supports a limited, high-integrity set of markets:

### 2.1 Crypto – Hard Fact Markets (Primary)

* On-chain data events
* Token prices reaching defined thresholds
* Governance results

Characteristics:

* Objective
* Time-bounded
* Verifiable via public data sources

### 2.2 Crypto – Event Markets (Secondary)

* Exchange listings
* Airdrop distributions
* Protocol launches

Characteristics:

* Clearly specified conditions
* Explicit resolution rules
* Manual review allowed

### 2.3 Sports Markets (Limited Scope)

* Match outcome (win / lose)
* Qualification or elimination

Explicitly excluded:

* Point spreads
* Over/under
* Complex betting structures

---

## 3. Market Lifecycle

1. Market specification is created off-chain
2. Market is deployed on-chain via MarketFactory
3. Trading opens and runs until Close Time
4. Trading closes; positions are locked
5. Oracle proposes a result
6. Challenge window opens
7. Market is finalized or escalated
8. Winning outcome holders redeem collateral

---

## 4. Market Resolution Specification

Each market is governed by a **Market Resolution Spec**, which defines:

* Exact event definition
* Time boundaries (UTC)
* Accepted data sources (with priority)
* Ambiguity handling rules
* Invalid market conditions

Resolution outcomes:

* YES
* NO
* INVALID (refund)

The Resolution Spec is immutable once trading begins.

---

## 5. Trust & Resolution Model

### 5.1 Oracle Role

The Oracle **proposes** outcomes but does not unilaterally decide truth.

Responsibilities:

* Collect data
* Publish proposed outcome
* Provide source references

### 5.2 Challenge Mechanism

After a proposed outcome:

* A fixed challenge window (24–72 hours) opens
* Any user may challenge by staking collateral
* Challenges must reference specific rule violations

### 5.3 Resolution Committee

* Multisig committee (3–7 signers)
* Independent from trading
* Reviews challenged markets
* Finalizes outcome on-chain

All actions are publicly auditable.

---

## 6. Smart Contract Architecture

### 6.1 MarketFactory

* Creates markets
* Stores metadata hash
* Defines close time and oracle type

### 6.2 OutcomeToken (ERC1155)

* Represents market positions (YES / NO)
* Transferable
* Burned or invalidated upon resolution

### 6.3 Vault

* Holds USDT / USDC
* Mints and burns outcome tokens
* No administrative withdrawal rights

### 6.4 Settlement

* Records proposed outcomes
* Manages challenge windows
* Finalizes markets
* Enables user redemption

---

## 7. Asset & Custody Model

* All collateral is held on-chain
* Platform operators cannot access user funds
* Smart contracts enforce all transfers

User trust assumptions:

* Funds are safe even if the platform disappears
* Market rules cannot be changed mid-flight

---

## 8. Pricing & Trading Model

* Central Limit Order Book (CLOB)
* Order matching occurs off-chain
* Final balances are settled on-chain

Displayed prices represent **implied probability**, not betting odds.

---

## 9. Risk Controls

* Market-level position caps
* Price movement limits
* Market suspension on extreme anomalies

Risk controls apply to **matching**, never to custody.

---

## 10. Transparency & Auditability

* All markets have public specs
* All resolutions are recorded on-chain
* All disputes are traceable

The platform is designed so that **errors are visible and costly**, rather than hidden.

---

## 11. Roadmap & Evolution

Planned future upgrades:

* Optimistic or decentralized oracle integration
* Automated market generation
* Reputation systems for predictors
* DAO-based resolution governance

Early-stage focus:

> Clear rules, minimal trust, operational clarity

---

## 12. Disclaimer

This platform provides markets for expressing probabilistic beliefs about real-world events. It does not guarantee correctness of outcomes but guarantees that **the resolution process is transparent, rule-driven, and auditable**.





## 1. Overview

This system is an **information-centric prediction market platform** inspired by Polymarket, deployed on **BNB Chain (BSC)**, with a focus on **crypto-native and sports events**.

The platform is **not positioned as a gambling or betting product**, but as a **market for aggregating collective beliefs** about real-world, verifiable events. Market prices represent the crowd's implied probability that an event will occur.

Core principles:

* Prices represent **information and belief**, not odds
* Assets are **non-custodial and fully on-chain**
* Resolution is **rule-based, transparent, and challengeable**
* Centralization is allowed at early stages, but **never arbitrary**

---

## 2. Market Types

The platform supports a limited, high-integrity set of markets:

### 2.1 Crypto – Hard Fact Markets (Primary)

* On-chain data events
* Token prices reaching defined thresholds
* Governance results

Characteristics:

* Objective
* Time-bounded
* Verifiable via public data sources

### 2.2 Crypto – Event Markets (Secondary)

* Exchange listings
* Airdrop distributions
* Protocol launches

Characteristics:

* Clearly specified conditions
* Explicit resolution rules
* Manual review allowed

### 2.3 Sports Markets (Limited Scope)

* Match outcome (win / lose)
* Qualification or elimination

Explicitly excluded:

* Point spreads
* Over/under
* Complex betting structures

---

## 3. Market Lifecycle

1. Market specification is created off-chain
2. Market is deployed on-chain via MarketFactory
3. Trading opens and runs until Close Time
4. Trading closes; positions are locked
5. Oracle proposes a result
6. Challenge window opens
7. Market is finalized or escalated
8. Winning outcome holders redeem collateral

---

## 4. Market Resolution Specification

Each market is governed by a **Market Resolution Spec**, which defines:

* Exact event definition
* Time boundaries (UTC)
* Accepted data sources (with priority)
* Ambiguity handling rules
* Invalid market conditions

Resolution outcomes:

* YES
* NO
* INVALID (refund)

The Resolution Spec is immutable once trading begins.

---

## 5. Trust & Resolution Model

### 5.1 Oracle Role

The Oracle **proposes** outcomes but does not unilaterally decide truth.

Responsibilities:

* Collect data
* Publish proposed outcome
* Provide source references

### 5.2 Challenge Mechanism

After a proposed outcome:

* A fixed challenge window (24–72 hours) opens
* Any user may challenge by staking collateral
* Challenges must reference specific rule violations

### 5.3 Resolution Committee

* Multisig committee (3–7 signers)
* Independent from trading
* Reviews challenged markets
* Finalizes outcome on-chain

All actions are publicly auditable.

---

## 6. Smart Contract Architecture

### 6.1 MarketFactory

* Creates markets
* Stores metadata hash
* Defines close time and oracle type

### 6.2 OutcomeToken (ERC1155)

* Represents market positions (YES / NO)
* Transferable
* Burned or invalidated upon resolution

### 6.3 Vault

* Holds USDT / USDC
* Mints and burns outcome tokens
* No administrative withdrawal rights

### 6.4 Settlement

* Records proposed outcomes
* Manages challenge windows
* Finalizes markets
* Enables user redemption

---

## 7. Asset & Custody Model

* All collateral is held on-chain
* Platform operators cannot access user funds
* Smart contracts enforce all transfers

User trust assumptions:

* Funds are safe even if the platform disappears
* Market rules cannot be changed mid-flight

---

## 8. Pricing & Trading Model

* Central Limit Order Book (CLOB)
* Order matching occurs off-chain
* Final balances are settled on-chain

Displayed prices represent **implied probability**, not betting odds.

---

## 9. Risk Controls

* Market-level position caps
* Price movement limits
* Market suspension on extreme anomalies

Risk controls apply to **matching**, never to custody.

---

## 10. Transparency & Auditability

* All markets have public specs
* All resolutions are recorded on-chain
* All disputes are traceable

The platform is designed so that **errors are visible and costly**, rather than hidden.

---

## 11. Roadmap & Evolution

Planned future upgrades:

* Optimistic or decentralized oracle integration
* Automated market generation
* Reputation systems for predictors
* DAO-based resolution governance

Early-stage focus:

> Clear rules, minimal trust, operational clarity

---

## 12. Disclaimer

This platform provides markets for expressing probabilistic beliefs about real-world events. It does not guarantee correctness of outcomes but guarantees that **the resolution process is transparent, rule-driven, and auditable**.




