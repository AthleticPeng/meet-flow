# MeetFlow

## Project Description

![](/public/banner.jpeg)

Meet Flow is a meeting availability finder built with Next.js. Add members, mark their free time on a weekly grid (Mon–Fri, 9–17), and see overlapping slots so you can pick meeting times that work for everyone.

## Project Startup

### Prerequisites

- Node.js (v18+ recommended)
- npm, yarn, pnpm, or bun

### Install & run

```bash
# Install dependencies
npm install
# or: yarn | pnpm install | bun install

# Start development server
npm run dev
# or: yarn dev | pnpm dev | bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other scripts

- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — run ESLint

## Contributing

### Branch practices

- Work on **feature branches**, not directly on `main`.
- Branch names: `feat/<short-description>` or `fix/<short-description>` (e.g. `feature/add-export`, `fix/calendar-timezone`).
- Keep branches short-lived and up to date with `main` (rebase or merge as agreed).

### Commit practices

- Write **clear, present-tense** messages (e.g. "Add export to CSV", "Fix slot highlight on mobile").
- Prefer one logical change per commit.
- Reference issues/PRs when relevant (e.g. "Fix #12: overlapping slots on narrow screens").

## 🚀 CEO 特色功能：智慧自動提醒系統 (MeetFlow AI Reminder)

[cite_start]為了徹底解決「會議過多容易撞期」與「改期程序繁瑣」的痛點，MeetFlow 導入了自動化提醒邏輯：

1. [cite_start]**衝突預警**：當系統偵測到新會議與現有行程重疊時，主動發送推播通知。
2. [cite_start]**多平台同步**：自動發送 Email 提醒至所有參與者，確保資訊不一致導致的延誤降至最低 。
3. [cite_start]**一鍵確認**：提醒通知中包含「確認參加」與「要求改期」快捷按鈕，大幅縮減溝通成本。

> [cite_start]*「MeetFlow 與其他工具不同之處，在於它著重自動化的主動提醒功能，能夠在衝突發生前就先行介入，有效改善資訊分散與溝通延遲的問題。」*

---

This project uses [Next.js](https://nextjs.org) and was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
