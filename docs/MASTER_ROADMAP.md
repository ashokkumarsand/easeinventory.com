# EaseInventory Master Roadmap - Comprehensive Feature Plan

## Executive Summary

This document outlines the implementation plan for major enhancements:
1. **Mobile App** - React Native with Expo for iOS/Android
2. **AI Integration** - Smart help bot, semantic search, product intelligence
3. **Product Library** - Pre-built catalog with barcode database
4. **Accessibility** - WCAG 2.1 AA compliance
5. **UI/UX Improvements** - Mobile-responsive design overhaul
6. **Cross-Platform Auth** - Unified web + mobile authentication

---

## Phase 1: Foundation & Infrastructure (Current Sprint)

### 1.1 Commit Pending Changes
- [ ] Review and commit existing feature pages
- [ ] Clean up untracked files (about, api-docs, changelog, etc.)

### 1.2 API Enhancements for Mobile
| Task | File | Description |
|------|------|-------------|
| Add API versioning | `/src/app/api/v1/` | Version all endpoints |
| Rate limiting | `/src/middleware.ts` | Add rate limit headers |
| Mobile-optimized responses | All API routes | Add `?fields=` param for sparse fieldsets |
| Batch operations | `/src/app/api/v1/batch/route.ts` | Batch create/update/delete |

### 1.3 PWA Foundation
| Task | File | Description |
|------|------|-------------|
| Service Worker | `/public/sw.js` | Offline caching strategy |
| Web App Manifest | `/public/manifest.json` | PWA installable config |
| Offline indicator | `/src/components/ui/OfflineIndicator.tsx` | Show offline status |

---

## Phase 2: AI Integration

### 2.1 AI Help Bot (Claude/OpenAI Integration)
| Task | File | Description |
|------|------|-------------|
| AI Service | `/src/lib/ai-service.ts` | Claude API integration |
| Smart Help API | `/src/app/api/help/ai-chat/route.ts` | AI-powered responses |
| Help Widget | `/src/components/help/AIHelpWidget.tsx` | Floating help button |
| Knowledge Base | `/src/lib/knowledge-base.ts` | RAG context provider |

### 2.2 Smart Product Search
| Task | File | Description |
|------|------|-------------|
| Vector embeddings | `/src/lib/embeddings.ts` | Product description embeddings |
| Semantic search API | `/src/app/api/products/search/route.ts` | AI-powered search |
| Search UI | `/src/components/inventory/SmartSearch.tsx` | Natural language search bar |

### 2.3 AI Product Intelligence
| Task | File | Description |
|------|------|-------------|
| Auto-categorization | `/src/lib/ai/categorize.ts` | AI category suggestions |
| Demand forecasting | `/src/lib/ai/forecast.ts` | Stock prediction |
| Anomaly detection | `/src/lib/ai/anomaly.ts` | Unusual pattern alerts |

---

## Phase 3: Product Library & Barcode System

### 3.1 Database Schema Updates
```prisma
model ProductCatalog {
  id          String   @id @default(cuid())
  barcode     String   @unique
  name        String
  description String?
  category    String?
  brand       String?
  manufacturer String?
  hsnCode     String?
  gstRate     Float    @default(18)
  mrp         Float?
  imageUrl    String?
  specifications Json?
  source      String   // 'MANUAL' | 'OPEN_FOOD_FACTS' | 'UPC_DATABASE' | 'CUSTOM'
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([barcode])
  @@index([name])
  @@map("product_catalog")
}
```

### 3.2 Barcode APIs
| Task | File | Description |
|------|------|-------------|
| Barcode lookup | `/src/app/api/barcode/lookup/route.ts` | Search product catalog |
| External API integration | `/src/lib/barcode-api.ts` | Open Food Facts, UPC Database |
| Barcode generator | `/src/app/api/barcode/generate/route.ts` | Generate EAN-13/Code128 |
| Bulk import | `/src/app/api/products/import/route.ts` | CSV/Excel import |

### 3.3 Scanner Improvements
| Task | File | Description |
|------|------|-------------|
| Enhanced scanner | `/src/components/ui/BarcodeScanner.tsx` | Improved camera handling |
| Quick add from scan | `/src/components/inventory/QuickAddFromScan.tsx` | Auto-fill from catalog |
| Batch scanning | `/src/components/inventory/BatchScanner.tsx` | Scan multiple items |

---

## Phase 4: Mobile App (React Native + Expo)

### 4.1 Project Setup
```
/mobile
├── app/                    # Expo Router pages
│   ├── (auth)/            # Auth screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/            # Main app tabs
│   │   ├── dashboard.tsx
│   │   ├── inventory.tsx
│   │   ├── scanner.tsx
│   │   └── settings.tsx
│   └── _layout.tsx
├── components/            # Shared components
├── lib/                   # API client, auth, storage
├── hooks/                 # Custom hooks
└── assets/               # Images, fonts
```

### 4.2 Core Mobile Features
| Feature | Description |
|---------|-------------|
| Biometric Auth | Face ID / Touch ID login |
| QR/Barcode Scanner | Native camera scanner |
| Offline Mode | SQLite local database |
| Push Notifications | Expo Notifications |
| Deep Linking | Universal links for web↔app |

### 4.3 Cross-Platform Auth
| Task | File | Description |
|------|------|-------------|
| Mobile auth endpoint | `/src/app/api/auth/mobile/route.ts` | Mobile-specific auth |
| Device tokens | Schema update | Store device tokens |
| Session sync | `/src/lib/session-sync.ts` | Sync sessions across devices |
| QR login | `/src/app/api/auth/qr-login/route.ts` | Scan QR to login on web |

---

## Phase 5: Accessibility (WCAG 2.1 AA)

### 5.1 Audit & Fixes
| Task | File | Description |
|------|------|-------------|
| Skip links | `/src/components/ui/SkipLink.tsx` | Skip to main content |
| Focus management | `/src/hooks/useFocusTrap.ts` | Modal focus trapping |
| ARIA labels | All components | Add missing labels |
| Keyboard navigation | All interactive elements | Full keyboard support |

### 5.2 New Accessibility Features
| Task | File | Description |
|------|------|-------------|
| Screen reader announcements | `/src/components/ui/LiveRegion.tsx` | ARIA live regions |
| High contrast mode | `/src/styles/high-contrast.css` | Alternative theme |
| Text scaling | Tailwind config | Relative font sizes |
| Reduced motion | `/src/hooks/useReducedMotion.ts` | Respect prefers-reduced-motion |

### 5.3 Testing
- Automated: axe-core, WAVE
- Manual: NVDA, VoiceOver, JAWS
- Keyboard-only navigation testing

---

## Phase 6: UI/UX Mobile Optimization

### 6.1 Component Updates
| Component | Changes |
|-----------|---------|
| DataTable | Mobile card view, horizontal scroll |
| Forms | Stacked layout on mobile, larger touch targets |
| Modals | Full-screen on mobile, bottom sheets |
| Navigation | Bottom nav bar on mobile |
| Charts | Responsive sizing, touch interactions |

### 6.2 New Mobile Components
| Component | File | Description |
|-----------|------|-------------|
| BottomSheet | `/src/components/ui/BottomSheet.tsx` | Draggable bottom modal |
| SwipeableCard | `/src/components/ui/SwipeableCard.tsx` | Swipe actions |
| PullToRefresh | `/src/components/ui/PullToRefresh.tsx` | Pull down to refresh |
| MobileNav | `/src/components/ui/MobileNav.tsx` | Bottom navigation |

### 6.3 Touch Optimizations
- Minimum 44x44px touch targets
- Swipe gestures for common actions
- Haptic feedback on actions
- Pull-to-refresh on lists

---

## Phase 7: Real-time & Notifications

### 7.1 WebSocket Integration
| Task | File | Description |
|------|------|-------------|
| WebSocket server | `/src/lib/websocket.ts` | Socket.io or Pusher |
| Real-time inventory | `/src/hooks/useInventorySync.ts` | Live stock updates |
| Notification stream | `/src/components/ui/NotificationBell.tsx` | Real-time alerts |

### 7.2 Push Notifications
| Task | File | Description |
|------|------|-------------|
| Web Push | `/src/lib/web-push.ts` | Browser notifications |
| Mobile Push | Expo Notifications | iOS/Android push |
| Notification preferences | `/src/app/api/notifications/preferences/route.ts` | User settings |

---

## Implementation Priority Order

### Sprint 1 (Immediate - Foundation)
1. ✅ Commit pending changes
2. PWA manifest & service worker
3. API versioning setup
4. Mobile-responsive fixes for existing components

### Sprint 2 (AI Integration)
1. Claude API integration for help bot
2. AI-powered search
3. Knowledge base for RAG

### Sprint 3 (Product Library)
1. ProductCatalog schema
2. Barcode lookup API with external sources
3. CSV import/export
4. Enhanced scanner UI

### Sprint 4 (Mobile App Start)
1. Expo project setup
2. Authentication flow
3. Core screens (Dashboard, Inventory, Scanner)
4. Offline storage

### Sprint 5 (Accessibility)
1. ARIA audit and fixes
2. Keyboard navigation
3. Screen reader testing
4. High contrast mode

### Sprint 6 (Polish)
1. Real-time updates
2. Push notifications
3. Performance optimization
4. Final mobile app features

---

## Technical Decisions

### Mobile App Stack
- **Framework**: React Native with Expo SDK 52
- **Navigation**: Expo Router (file-based)
- **State**: Zustand + React Query
- **Offline DB**: SQLite (expo-sqlite)
- **Auth**: expo-secure-store for tokens

### AI Stack
- **LLM**: Claude 3.5 Sonnet via Anthropic API
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector Store**: Pinecone or pgvector (PostgreSQL extension)
- **RAG**: LangChain for orchestration

### Barcode Data Sources
1. **Open Food Facts** - Free, food products
2. **UPC Database API** - Paid, comprehensive
3. **Custom catalog** - User-contributed products
4. **Manual entry** - Fallback

---

## Files to Create/Modify Summary

### New Files (Count: 50+)
- `/public/manifest.json`
- `/public/sw.js`
- `/src/lib/ai-service.ts`
- `/src/lib/barcode-api.ts`
- `/src/lib/embeddings.ts`
- `/src/components/help/AIHelpWidget.tsx`
- `/src/components/ui/BottomSheet.tsx`
- `/src/components/ui/MobileNav.tsx`
- `/src/components/ui/SkipLink.tsx`
- `/src/app/api/v1/*` (versioned APIs)
- `/src/app/api/barcode/*`
- `/src/app/api/help/ai-chat/route.ts`
- `/mobile/*` (entire mobile app)

### Schema Updates
- Add `ProductCatalog` model
- Add `DeviceToken` model for push notifications
- Add `UserPreferences` for notification settings

---

## Success Metrics

| Feature | Metric | Target |
|---------|--------|--------|
| Mobile App | App Store rating | 4.5+ stars |
| AI Help | Resolution rate | 80% without human |
| Search | Relevance score | 90% accuracy |
| Accessibility | WCAG compliance | AA level |
| Performance | Lighthouse mobile | 90+ score |
| Offline | Data sync reliability | 99.9% |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| AI costs | Rate limiting, caching responses |
| Barcode API limits | Local caching, multiple providers |
| Mobile complexity | Start with MVP, iterate |
| Accessibility scope | Prioritize critical paths first |

---

*Document created: 2026-02-04*
*Last updated: 2026-02-04*
