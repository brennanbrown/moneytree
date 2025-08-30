# Personal Finance Tracker - Project Specification

## Project Overview

A privacy-first, offline-capable personal finance tracking PWA built with 11ty and IndexedDB. Users can track expenses, set budgets, and analyze spending patterns without data ever leaving their device.

## Core Features

### 1. Transaction Management
- **Add Transactions**: Quick entry form with amount, category, description, date
- **Transaction Types**: Income, Expense, Transfer between accounts
- **Bulk Import**: CSV import functionality for bank statements
- **Receipt Photos**: Camera integration to attach receipt images to transactions
- **Search & Filter**: Full-text search, filter by date range, category, amount
- **Edit/Delete**: Modify or remove transactions with audit trail

### 2. Category System
- **Default Categories**: Pre-populated common categories (Food, Transportation, Entertainment, etc.)
- **Custom Categories**: User-created categories with color coding and icons
- **Subcategories**: Nested category structure (Food → Groceries, Restaurants)
- **Category Analytics**: Spending breakdown by category over time
- **Smart Categorization**: Suggest categories based on transaction description patterns

### 3. Account Management
- **Multiple Accounts**: Checking, Savings, Credit Cards, Cash
- **Account Types**: Different account types with appropriate behavior
- **Account Balances**: Real-time balance calculations based on transactions
- **Account Transfers**: Move money between accounts without affecting net worth
- **Account History**: Transaction history per account

### 4. Budget Management
- **Monthly Budgets**: Set spending limits per category per month
- **Budget Periods**: Weekly, monthly, yearly budget cycles
- **Budget Tracking**: Real-time progress against budgets with visual indicators
- **Budget Alerts**: Warnings when approaching or exceeding limits
- **Rollover Budgets**: Option to carry unused budget to next period

### 5. Analytics & Reporting
- **Spending Trends**: Line/bar charts showing spending over time
- **Category Breakdown**: Pie charts of spending by category
- **Income vs Expenses**: Monthly net income tracking
- **Yearly Comparisons**: Year-over-year spending analysis
- **Custom Date Ranges**: Flexible reporting periods
- **Export Reports**: Generate PDF or CSV reports

## Technical Architecture

### Frontend Framework
- **11ty (Eleventy)**: Static site generator for the app shell
- **Build Process**: 
  - HTML templates with Nunjucks
  - Tailwind CSS for styling with CSS custom properties
  - JavaScript bundling with esbuild
  - Service Worker generation for PWA functionality

### Data Storage
- **IndexedDB**: Primary storage for all user data
- **Database Schema**:
  ```
  Stores:
  - transactions: {id, amount, category, description, date, account, receipt}
  - categories: {id, name, color, icon, parent, budget}
  - accounts: {id, name, type, balance, color}
  - settings: {theme, currency, dateFormat, etc}
  - receipts: {id, transactionId, imageBlob, fileName}
  ```
- **Data Versioning**: Migration system for schema updates
- **Backup/Restore**: Export all data as JSON for backup

### PWA Features
- **Service Worker**: Offline functionality and app shell caching
- **Web App Manifest**: Installable app with proper icons and theming
- **Background Sync**: Queue transactions when offline, sync when online
- **Push Notifications**: Budget alerts and reminder notifications (optional)

### Performance Considerations
- **Lazy Loading**: Load transaction data incrementally
- **Virtual Scrolling**: Handle large transaction lists efficiently
- **Image Compression**: Compress receipt photos for storage
- **Data Pagination**: Load transactions in chunks to avoid memory issues

## User Interface Design

### Design System
- **Color Palette**: 
  - Primary: Modern green (#10B981) for money/success
  - Secondary: Blue (#3B82F6) for accounts/info
  - Danger: Red (#EF4444) for expenses/alerts
  - Success: Green (#22C55E) for income/positive
- **Typography**: System font stack for performance
- **Spacing**: 8px base unit grid system
- **Border Radius**: Consistent rounded corners (8px standard)

### Layout & Navigation
- **Mobile-First**: Responsive design starting from 320px width
- **Bottom Navigation**: Primary navigation for mobile (Dashboard, Transactions, Budgets, Analytics)
- **Header**: Page titles with context actions
- **Floating Action Button**: Quick add transaction on main screens

### Key Screens

#### Dashboard
- **Account Overview**: Cards showing account balances
- **Recent Transactions**: Last 5-10 transactions with quick actions
- **Budget Status**: Progress bars for current month's budgets
- **Quick Stats**: Monthly income/expense summary

#### Transactions List
- **Infinite Scroll**: Load more transactions as user scrolls
- **Swipe Actions**: Swipe left/right for edit/delete on mobile
- **Filter Bar**: Category, account, date range filters
- **Search**: Real-time search as user types
- **Bulk Actions**: Select multiple transactions for bulk operations

#### Add/Edit Transaction
- **Smart Form**: Auto-focus, smart defaults, keyboard optimization
- **Category Picker**: Visual category selection with search
- **Date Picker**: Calendar widget with quick date options (Today, Yesterday, etc.)
- **Camera Integration**: Take photo directly or choose from gallery
- **Split Transactions**: Ability to split one transaction across multiple categories

#### Budget Management
- **Budget Overview**: Visual progress for all categories
- **Budget Setup**: Easy category budget assignment
- **Historical View**: Compare current vs previous periods
- **Budget Recommendations**: Suggest budgets based on spending history

#### Analytics
- **Interactive Charts**: Touch-friendly charts with drill-down capability
- **Date Range Selector**: Easy period selection (This month, Last 3 months, etc.)
- **Export Options**: Share or save reports
- **Trend Analysis**: Highlight significant changes in spending patterns

### Responsive Breakpoints
- **Mobile**: 320px - 767px (primary target)
- **Tablet**: 768px - 1023px 
- **Desktop**: 1024px+ (enhanced experience)

## Data Privacy & Security

### Privacy-First Approach
- **Local Storage Only**: No data transmission to external servers
- **No Analytics**: No tracking or analytics services
- **No Account Required**: App works immediately without signup
- **Transparent**: Open source code for full transparency

### Data Security
- **No Encryption**: Data stored in plain text (acceptable for local-only app)
- **Secure Defaults**: No sensitive data in localStorage or cookies
- **Receipt Images**: Stored as IndexedDB blobs, not accessible to other apps
- **Export Security**: User controls when and how data is exported

## Technical Requirements

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **IndexedDB Support**: Required for core functionality
- **Service Worker Support**: Required for PWA features
- **Camera API**: Optional, graceful degradation if not available

### Performance Targets
- **First Contentful Paint**: < 2 seconds on 3G
- **Largest Contentful Paint**: < 3 seconds on 3G
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Time to Interactive**: < 5 seconds on 3G

### Accessibility
- **WCAG 2.1 AA Compliance**: Full accessibility support
- **Keyboard Navigation**: All features accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Management**: Clear focus indicators and logical tab order

## Development Phases

### Phase 1: MVP (4-6 weeks)
- Basic transaction CRUD operations
- Simple category system
- Basic account management
- Mobile-responsive UI
- IndexedDB data storage
- PWA basic functionality

### Phase 2: Enhanced Features (3-4 weeks)
- Budget system
- Basic analytics (simple charts)
- Receipt photo support
- Search and filtering
- Data export/import

### Phase 3: Advanced Features (3-4 weeks)
- Advanced analytics and reporting
- Custom categories and subcategories
- Budget alerts and notifications
- Performance optimizations
- Advanced PWA features

### Phase 4: Polish & Launch (2-3 weeks)
- UI/UX refinements
- Accessibility improvements
- Cross-browser testing
- Documentation
- Deployment setup

## File Structure
```
src/
├── _data/           # 11ty global data
├── _includes/       # Templates and partials
│   ├── layouts/     # Base layouts
│   ├── components/  # Reusable components
│   └── macros/      # Nunjucks macros
├── assets/
│   ├── css/         # SCSS files
│   ├── js/          # JavaScript modules
│   │   ├── core/    # Core app logic
│   │   ├── components/ # UI components
│   │   ├── utils/   # Utility functions
│   │   └── workers/ # Service worker
│   └── images/      # Static images
├── pages/           # App pages
└── manifest.json    # PWA manifest
```

## Success Metrics

### User Engagement
- **Daily Active Users**: Track through service worker analytics (privacy-friendly)
- **Transaction Volume**: Average transactions entered per user
- **Feature Adoption**: Usage of budgets, categories, analytics
- **Retention**: User return rate after 7, 30, 90 days

### Technical Metrics
- **Performance**: Core Web Vitals scores
- **Reliability**: Service Worker cache hit rates
- **Accessibility**: Lighthouse accessibility scores
- **Cross-Browser**: Functionality across target browsers

### Community Metrics
- **GitHub Stars**: Open source project popularity
- **Contributions**: Community code contributions
- **Issues/Feedback**: User-reported bugs and feature requests
- **Documentation**: Usage and contribution guide completeness