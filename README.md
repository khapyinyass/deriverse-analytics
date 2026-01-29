# Deriverse Analytics

Deriverse Analytics is a **real-time, wallet-driven trading analytics dashboard** for the Solana ecosystem.  
It provides **accurate portfolio insights, token balances, and analytics strictly based on the connected wallet**.

> No mock data. No demo balances. Everything is real as of the wallet you connect.

---

## 🔑 Core Principle

- Wallet balance = real SOL + SPL tokens  
- Wallet with zero balance → shows zero  
- Wallet with no trades → analytics and PnL charts remain empty  

This ensures **data integrity and honesty**.

---

## 🚀 Features

### Wallet Integration
- Phantom-ready Solana wallet connection
- Detects wallet connection, disconnection, and switching
- Wallet address is the single source of truth
- Read-only blockchain access (no private keys or signing)

### Real Wallet Data
- Real SOL balance from Solana RPC
- Real SPL token balances owned by the wallet
- Updates instantly on wallet change

### Portfolio & Analytics
- Portfolio value derived from wallet balances
- Token distribution charts
- Performance metrics computed only when valid trade data exists
- Clear empty states for wallets with no trades

### Charts
- Portfolio value and token distribution charts
- Charts update dynamically with wallet and token selection
- Empty states are handled gracefully

### UX & Design
- Dark-mode, professional trading terminal style
- Color palette: deep charcoal background, electric blue accents, neon green for profits, soft red for losses
- Fully responsive (desktop, tablet, mobile)
- Clear wallet and network indicators

---

## 🛠 Tech Stack
- Next.js (App Router)  
- React & TypeScript  
- Tailwind CSS  
- Solana Wallet Adapter  
- Recharts for charts  
- Solana RPC for live balances  

---

## 🔮 Future Enhancements
- Integration with Deriverse on-chain trade indexer
- Spot/perp/options trade history
- Advanced PnL and fee analytics
- Strategy tagging and performance comparison
- Exportable trading journal

---

## 📎 Links
- GitHub Repository: [https://github.com/khapyinyass/deriverse-analytics](https://github.com/khapyinyass/deriverse-analytics)  
- Live Demo: [https://deriverse-analytics.vercel.app](https://deriverse-analytics.vercel.app)  
- X (Twitter): @khapyinyass

---

## 🔒 Security Considerations
- Read-only wallet access only  
- No private keys stored  
- Wallet address is passed securely to backend routes  
- RPC errors and wallet disconnection are handled gracefully

---

## 🧠 Zero-State Philosophy
- Wallet has no tokens → token list empty  
- Wallet has zero balance → shows 0  
- Wallet has never traded → charts and metrics show empty/zero  
- This ensures **full transparency and honesty**, avoiding fake data

---

