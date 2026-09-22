/**
 * Single source of truth for ALL dynamic content in the kit.
 * Exposed as `window.mockData`; the UI binds to it (Alpine `x-for` /
 * `x-text` in the HTML edition, `useData()` in the React edition).
 * Replace this file — or swap in a fetch to a real API that assigns
 * `window.mockData` and dispatches `mockdata:ready` — and the whole
 * UI updates without markup changes.
 *
 * Presentation-only fields: `icon` references a semantic key in the
 * icon map; `status` values map to badge variants. No HTML or Tailwind
 * classes live in this file.
 */
window.mockData = {
  site: {
    name: "DreamBoard",
    tagline: "Admin Dashboard",
  },

  user: {
    name: "Maya Chen",
    email: "maya@dreamboard.io",
    role: "Product Manager",
    initials: "MC",
    photo: null, // set by Account → photo upload; avatars fall back to initials
  },

  /* Sidebar navigation. `icon` → icon registry key, `children` → collapsible group. */
  nav: [
    {
      "label": "Dashboard",
      "icon": "dashboard",
      "href": "index.html"
    },
    {
      "label": "Analytics",
      "icon": "chart",
      "children": [
        {
          "label": "Reports",
          "href": "reports.html"
        }
      ]
    },
    {
      "label": "Charts",
      "icon": "gauge",
      "children": [
        {
          "label": "Basic charts",
          "href": "charts.html"
        }
      ]
    },
    {
      "label": "Commerce",
      "icon": "cart",
      "children": [
        {
          "label": "Orders",
          "href": "orders.html"
        }
      ]
    },
    {
      "label": "Pages",
      "icon": "folder",
      "children": [
        {
          "label": "Pricing",
          "href": "pricing.html"
        },
        {
          "label": "Form Layouts",
          "href": "forms.html"
        }
      ]
    },
    {
      "label": "Account",
      "icon": "user",
      "children": [
        {
          "label": "Billing",
          "href": "billing.html"
        },
        {
          "label": "Notifications",
          "href": "notifications.html"
        },
        {
          "label": "Sign out",
          "href": "signout.html"
        }
      ]
    },
    {
      "label": "Auth",
      "icon": "lockKey",
      "children": [
        {
          "label": "Sign in",
          "href": "signin.html"
        },
        {
          "label": "Sign up",
          "href": "signup.html"
        },
        {
          "label": "Forgot password",
          "href": "forgot.html"
        }
      ]
    },
    {
      "label": "Utility",
      "icon": "wrench",
      "children": [
        {
          "label": "Error 404",
          "href": "404.html"
        },
        {
          "label": "Error 500",
          "href": "500.html"
        }
      ]
    }
  ],

  /* KPI stat cards — `spark` feeds the mini SVG sparkline. */
  stats: [
    {
      id: "revenue",
      label: "Total Revenue",
      value: 45231.89,
      format: "currency",
      delta: "+12.4%",
      deltaDir: "up",
      deltaLabel: "vs last month",
      icon: "revenue",
      spark: [12, 18, 14, 22, 19, 28, 24, 32],
    },
    {
      id: "orders",
      label: "Orders",
      value: 2356,
      format: "number",
      delta: "+8.1%",
      deltaDir: "up",
      deltaLabel: "vs last month",
      icon: "cart",
      spark: [8, 12, 10, 15, 13, 18, 16, 20],
    },
    {
      id: "customers",
      label: "Active Customers",
      value: 1218,
      format: "number",
      delta: "-2.3%",
      deltaDir: "down",
      deltaLabel: "vs last month",
      icon: "users",
      spark: [20, 18, 22, 17, 19, 15, 16, 14],
    },
    {
      id: "conversion",
      label: "Conversion Rate",
      value: 3.42,
      format: "percent",
      delta: "+0.6%",
      deltaDir: "up",
      deltaLabel: "vs last month",
      icon: "trend",
      spark: [2.1, 2.4, 2.2, 2.8, 3.0, 2.9, 3.2, 3.4],
    },
  ],

  /* Main area chart (rendered as dependency-free SVG by the UI layer). */
  revenueChart: {
    label: "Revenue over time",
    series: [
      {
        name: "This year",
        data: [31, 40, 28, 51, 42, 68, 74, 62, 80, 95, 88, 102],
      },
      {
        name: "Last year",
        data: [22, 30, 25, 38, 34, 45, 52, 48, 60, 66, 61, 70],
      },
    ],
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    yAxisLabel: "Revenue in thousands USD",
  },

  /* Bar chart — orders per weekday. */
  ordersChart: {
    label: "Orders this week",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: [54, 72, 61, 88, 96, 41, 35],
  },

  recentOrders: [
    { id: "#3210", customer: "Liam Novak", product: "Wireless Headset Pro", date: "2026-09-15", amount: 189.0, status: "paid" },
    { id: "#3209", customer: "Sofia Reyes", product: "Ergo Keyboard MK2", date: "2026-09-15", amount: 129.5, status: "pending" },
    { id: "#3208", customer: "Noah Kim", product: "4K Monitor 27\"", date: "2026-09-14", amount: 429.99, status: "paid" },
    { id: "#3207", customer: "Emma Walsh", product: "USB-C Docking Station", date: "2026-09-14", amount: 154.0, status: "refunded" },
    { id: "#3206", customer: "Lucas Meyer", product: "Webcam Studio HD", date: "2026-09-13", amount: 98.75, status: "paid" },
    { id: "#3205", customer: "Ava Fontaine", product: "Laptop Stand Aluminium", date: "2026-09-13", amount: 64.2, status: "cancelled" },
  ],

  topProducts: [
    { name: "Wireless Headset Pro", category: "Audio", price: 189.0, sold: 842, stock: 67 },
    { name: "4K Monitor 27\"", category: "Displays", price: 429.99, sold: 631, stock: 23 },
    { name: "Ergo Keyboard MK2", category: "Accessories", price: 129.5, sold: 517, stock: 104 },
    { name: "USB-C Docking Station", category: "Accessories", price: 154.0, sold: 402, stock: 12 },
    { name: "Webcam Studio HD", category: "Video", price: 98.75, sold: 356, stock: 45 },
  ],

  /* Visitors by browser / user agent — drives the dashboard's
     "By device" card. */
  userAgents: [
    { name: "Chrome", icon: "chrome", share: 58, sessions: 86020 },
    { name: "Safari", icon: "safari", share: 24, sessions: 35600 },
    { name: "Firefox", icon: "globe", share: 9, sessions: 13350 },
    { name: "Edge", icon: "globe", share: 6, sessions: 8900 },
    { name: "Other", icon: "globe", share: 3, sessions: 4450 },
  ],

  activity: [
    { actor: "Sofia Reyes", action: "placed a new order", target: "#3209", time: "2 min ago", icon: "cart" },
    { actor: "Liam Novak", action: "left a 5-star review on", target: "Wireless Headset Pro", time: "26 min ago", icon: "star" },
    { actor: "System", action: "flagged unusual login for", target: "emma@…", time: "1 h ago", icon: "shield" },
    { actor: "Noah Kim", action: "requested a refund for", target: "#3198", time: "3 h ago", icon: "refund" },
    { actor: "Ava Fontaine", action: "updated shipping address", target: "", time: "5 h ago", icon: "user" },
  ],

  notifications: [
    { id: 1, title: "New order received", body: "Sofia Reyes ordered Ergo Keyboard MK2.", time: "2 min ago", unread: true, icon: "cart" },
    { id: 2, title: "Low stock alert", body: "USB-C Docking Station has 12 units left.", time: "40 min ago", unread: true, icon: "alert" },
    { id: 3, title: "Weekly report ready", body: "Your analytics digest for week 37 is available.", time: "Yesterday", unread: false, icon: "chart" },
    { id: 4, title: "Payout processed", body: "$12,480.22 was transferred to your account.", time: "2 days ago", unread: false, icon: "revenue" },
    { id: 5, title: "New team member", body: "Isla Novak joined the workspace as an editor.", time: "2 days ago", unread: false, icon: "userPlus" },
    { id: 6, title: "API usage spike", body: "Token consumption is 40% above the weekly average.", time: "3 days ago", unread: false, icon: "pulse" },
    { id: 7, title: "Refund requested", body: "Oliver Scott requested a refund for order #3204.", time: "4 days ago", unread: false, icon: "refund" },
    { id: 8, title: "Scheduled maintenance", body: "Platform maintenance on Sunday 02:00–03:00 UTC.", time: "5 days ago", unread: false, icon: "clock" },
  ],

  userMenu: [
    {
      "label": "Billing",
      "href": "billing.html",
      "icon": "card"
    },
    {
      "label": "Sign out",
      "href": "signout.html",
      "icon": "logout"
    }
  ],

  /* Detail pages reachable from the header user dropdown. */
  pages: {
    profile: {
      heading: "Profile",
      bio: "Product manager focused on developer tooling and design systems. Previously at two B2B SaaS startups; now leading DreamBoard's dashboard roadmap.",
      location: "Berlin, Germany",
      joined: "January 2024",
      phone: "+49 30 90182044",
      website: "mayachen.dev",
      stats: [
        { label: "Projects", value: 24 },
        { label: "Reports published", value: 132 },
        { label: "Teams", value: 6 },
      ],
    },
    settings: {
      heading: "Workspace settings",
      sub: "Configure product-wide defaults, regional formats and feature availability.",
      generalFields: [
        { id: "ws-name", label: "Workspace name", value: "DreamBoard HQ", type: "text" },
        { id: "ws-slug", label: "Workspace URL", value: "dreamboard.io/ws/hq", type: "text" },
      ],
      selects: [
        { id: "ws-lang", label: "Default language", options: ["English", "Deutsch"], value: "English" },
        { id: "ws-tz", label: "Timezone", options: ["Europe/Berlin", "Europe/London", "America/New_York", "Asia/Tokyo"], value: "Europe/Berlin" },
        { id: "ws-currency", label: "Currency", options: ["EUR", "USD", "GBP"], value: "EUR" },
        { id: "ws-week", label: "Week starts on", options: ["Monday", "Sunday"], value: "Monday" },
      ],
      toggles: [
        { id: "ft-signup", label: "Public sign-ups", desc: "Let anyone with the workspace link create an account", checked: true },
        { id: "ft-analytics", label: "Usage analytics", desc: "Collect anonymized product usage statistics", checked: true },
        { id: "ft-beta", label: "Beta features", desc: "Give members early access to experimental features", checked: false },
        { id: "ft-maint", label: "Maintenance mode", desc: "Show a maintenance notice to all workspace visitors", checked: false },
      ],
      danger: {
        text: "Permanently delete this workspace and all associated data. This action cannot be undone.",
        action: "Delete workspace",
      },
    },
    account: {
      heading: "Account settings",
      sub: "Manage your personal information, photo, security and notification preferences.",
      personalFields: [
        { id: "set-first", label: "First name", value: "Maya", type: "text", autocomplete: "given-name" },
        { id: "set-last", label: "Last name", value: "Chen", type: "text", autocomplete: "family-name" },
        { id: "set-phone", label: "Phone", value: "+49 30 90182044", type: "tel", autocomplete: "tel" },
        { id: "set-email", label: "Email address", value: "maya@dreamboard.io", type: "email", autocomplete: "email" },
      ],
      bio: {
        id: "set-bio",
        label: "Bio",
        value: "Product manager focused on developer tooling and design systems. Previously at two B2B SaaS startups; now leading DreamBoard's dashboard roadmap.",
      },
      photo: {
        formats: "SVG, PNG, JPG or GIF",
        maxSize: "max. 2 MB",
      },
      passwordFields: [
        { id: "pw-current", label: "Current password", autocomplete: "current-password" },
        { id: "pw-new", label: "New password", autocomplete: "new-password" },
        { id: "pw-confirm", label: "Confirm new password", autocomplete: "new-password" },
      ],
      toggles: [
        { id: "tgl-product", label: "Product updates", desc: "New features and release notes", checked: true },
        { id: "tgl-digest", label: "Weekly digest", desc: "Summary of workspace activity every Monday", checked: true },
        { id: "tgl-security", label: "Security alerts", desc: "Sign-ins from new devices or locations", checked: true },
        { id: "tgl-marketing", label: "Marketing emails", desc: "Occasional offers, surveys and events", checked: false },
      ],
    },
    billing: {
      heading: "Billing",
      sub: "Manage your subscription, payment method and invoices.",
      plan: { name: "Pro", price: 29, period: "month", renews: "2026-01-15", seats: "5 of 10 seats used" },
      payment: { brand: "Visa", last4: "4242", expiry: "08/2027", holder: "Maya Chen" },
      invoices: [
        { id: "INV-2041", date: "2025-12-15", amount: 29.0, status: "paid" },
        { id: "INV-2017", date: "2025-11-15", amount: 29.0, status: "paid" },
        { id: "INV-1993", date: "2025-10-15", amount: 29.0, status: "paid" },
        { id: "INV-1968", date: "2025-09-15", amount: 29.0, status: "refunded" },
        { id: "INV-1942", date: "2025-08-15", amount: 29.0, status: "paid" },
      ],
    },
    signout: {
      heading: "You've been signed out",
      body: "Your session ended securely. Any unsaved changes on this device were discarded.",
    },
    analytics: {
      heading: "Analytics overview",
      sub: "Traffic and engagement for the last 30 days.",
      stats: [
        { id: "sessions", label: "Sessions", value: 148320, format: "number", delta: "+9.2%", deltaDir: "up", deltaLabel: "vs previous period", icon: "users", spark: [62, 70, 66, 78, 84, 80, 92, 98] },
        { id: "pageviews", label: "Pageviews", value: 512904, format: "number", delta: "+4.6%", deltaDir: "up", deltaLabel: "vs previous period", icon: "eye", spark: [310, 340, 325, 360, 372, 390, 410, 428] },
        { id: "bounce", label: "Bounce rate", value: 38.2, format: "percent", delta: "-1.8%", deltaDir: "down", deltaLabel: "vs previous period", icon: "trend", spark: [44, 42, 43, 40, 41, 39, 38.8, 38.2] },
        { id: "avgSession", label: "Avg. session", value: 184, format: "duration", delta: "+12s", deltaDir: "up", deltaLabel: "vs previous period", icon: "clock", spark: [152, 160, 158, 166, 170, 174, 178, 184] },
      ],
      traffic: {
        label: "Traffic over time",
        yAxisLabel: "Visits in thousands",
        labels: ["Sep 1", "Sep 4", "Sep 7", "Sep 10", "Sep 13", "Sep 16", "Sep 19", "Sep 22", "Sep 25", "Sep 28"],
        series: [
          { name: "Sessions", data: [4.1, 4.6, 4.0, 5.2, 4.8, 5.9, 6.4, 6.1, 7.0, 7.6] },
          { name: "Pageviews", data: [12.4, 13.9, 12.1, 15.6, 14.3, 17.2, 18.8, 17.9, 20.4, 22.1] },
        ],
      },
      channels: {
        label: "Traffic channels",
        labels: ["Organic search", "Direct", "Referral", "Social", "Email"],
        data: [42, 27, 14, 11, 6],
      },
      topPages: [
        { path: "/pricing", views: 48210, uniques: 39450, bounce: "32%" },
        { path: "/", views: 44780, uniques: 41022, bounce: "41%" },
        { path: "/docs/getting-started", views: 38904, uniques: 33211, bounce: "28%" },
        { path: "/blog/ui-trends-2026", views: 21440, uniques: 19987, bounce: "52%" },
        { path: "/components/table", views: 18230, uniques: 15610, bounce: "36%" },
      ],
      devices: [
        { name: "Desktop", icon: "desktop", share: 61 },
        { name: "Mobile", icon: "mobile", share: 33 },
        { name: "Tablet", icon: "tablet", share: 6 },
      ],
      /* Visitors by origin country (IP geolocation) — lon/lat feed the
         world map marker projection in components/world-map.html. */
      countries: [
        { name: "United States", code: "US", lon: -98.5, lat: 39.5, users: 41240, share: 28 },
        { name: "Germany", code: "DE", lon: 10.4, lat: 51.1, users: 22130, share: 15 },
        { name: "United Kingdom", code: "GB", lon: -2.5, lat: 54.0, users: 17690, share: 12 },
        { name: "India", code: "IN", lon: 78.0, lat: 21.0, users: 14740, share: 10 },
        { name: "Brazil", code: "BR", lon: -52.9, lat: -10.8, users: 11790, share: 8 },
        { name: "Japan", code: "JP", lon: 138.2, lat: 36.2, users: 8840, share: 6 },
        { name: "France", code: "FR", lon: 2.3, lat: 46.6, users: 7370, share: 5 },
        { name: "Australia", code: "AU", lon: 134.5, lat: -25.7, users: 5890, share: 4 },
        { name: "Canada", code: "CA", lon: -106.3, lat: 56.1, users: 4420, share: 3 },
      ],
    },
    reports: {
      heading: "Reports",
      sub: "Generated exports and scheduled digests.",
      stats: [
        { label: "Total reports", value: 128, icon: "file" },
        { label: "Scheduled", value: 12, icon: "clock" },
        { label: "This month", value: 9, icon: "calendar" },
      ],
      items: [
        { id: "RPT-2094", name: "Weekly traffic digest", range: "Sep 8 – Sep 14", created: "2026-09-15", format: "PDF", size: "1.2 MB", status: "ready" },
        { id: "RPT-2093", name: "Conversion funnel export", range: "Aug 2026", created: "2026-09-14", format: "CSV", size: "864 KB", status: "ready" },
        { id: "RPT-2092", name: "Channel performance", range: "Q3 2026", created: "2026-09-13", format: "PDF", size: "2.4 MB", status: "processing" },
        { id: "RPT-2090", name: "Monthly board summary", range: "Aug 2026", created: "2026-09-10", format: "PDF", size: "3.1 MB", status: "ready" },
        { id: "RPT-2088", name: "Cohort retention", range: "H1 2026", created: "2026-09-08", format: "XLSX", size: "5.6 MB", status: "failed" },
        { id: "RPT-2087", name: "Weekly traffic digest", range: "Sep 1 – Sep 7", created: "2026-09-08", format: "PDF", size: "1.1 MB", status: "scheduled" },
      ],
    },
    realtime: {
      heading: "Realtime",
      sub: "Live activity across your properties.",
      activeNow: 342,
      eventsNow: 512,
      // per-minute series, last 30 minutes
      perMinute: [288, 301, 295, 312, 330, 318, 309, 325, 340, 352, 344, 336, 348, 361, 370, 358, 349, 366, 372, 380, 365, 371, 382, 390, 376, 368, 374, 385, 392, 342],
      eventsPerMinute: [430, 445, 428, 452, 470, 458, 444, 461, 478, 490, 472, 466, 480, 496, 505, 488, 474, 492, 500, 515, 498, 505, 518, 526, 510, 502, 516, 524, 530, 512],
      /* Event funnel strip — generic "visit → signup → paid" demo; the
         seller dashboard drives it from GA4 realtime eventName counts. */
      funnel: [
        { key: "visits", label: "Visits", icon: "eye", value: 12400 },
        { key: "signups", label: "Signups", icon: "userPlus", value: 860 },
        { key: "paid", label: "Paid", icon: "receipt", value: 96 },
      ],
      /* Live visitors by origin country — same projection contract as
         analytics.countries. */
      countries: [
        { name: "United States", code: "US", lon: -98.5, lat: 39.5, users: 96, share: 28 },
        { name: "Germany", code: "DE", lon: 10.4, lat: 51.1, users: 62, share: 18 },
        { name: "United Kingdom", code: "GB", lon: -2.5, lat: 54.0, users: 38, share: 11 },
        { name: "India", code: "IN", lon: 78.0, lat: 21.0, users: 34, share: 10 },
        { name: "Brazil", code: "BR", lon: -52.9, lat: -10.8, users: 24, share: 7 },
        { name: "Japan", code: "JP", lon: 138.2, lat: 36.2, users: 21, share: 6 },
      ],
      /* Active sessions by browser / user agent. */
      agents: [
        { name: "Chrome", icon: "chrome", share: 58, users: 198 },
        { name: "Safari", icon: "safari", share: 24, users: 82 },
        { name: "Firefox", icon: "globe", share: 9, users: 31 },
        { name: "Edge", icon: "globe", share: 6, users: 20 },
        { name: "Other", icon: "globe", share: 3, users: 11 },
      ],
      topActivePages: [
        { path: "/pricing", users: 68 },
        { path: "/", users: 54 },
        { path: "/docs/getting-started", users: 41 },
        { path: "/blog/ui-trends-2026", users: 29 },
        { path: "/components/table", users: 22 },
      ],
      feed: [
        { actor: "Visitor from Berlin", action: "viewed", target: "/pricing", icon: "eye" },
        { actor: "Visitor from Austin", action: "started checkout on", target: "#3421", icon: "cart" },
        { actor: "Visitor from Tokyo", action: "signed up from", target: "/", icon: "user" },
        { actor: "Visitor from London", action: "viewed", target: "/docs/getting-started", icon: "eye" },
      ],
      feedPool: [
        { actor: "Visitor from Paris", action: "viewed", target: "/blog/ui-trends-2026", icon: "eye" },
        { actor: "Visitor from São Paulo", action: "placed order", target: "#3422", icon: "cart" },
        { actor: "Visitor from Toronto", action: "viewed", target: "/components/table", icon: "eye" },
        { actor: "Visitor from Sydney", action: "requested a demo on", target: "/contact", icon: "bell" },
        { actor: "Visitor from Mumbai", action: "viewed", target: "/pricing", icon: "eye" },
        { actor: "Visitor from Oslo", action: "downloaded report", target: "RPT-2094", icon: "download" },
      ],
    },
    reportNew: {
      heading: "New report",
      sub: "Configure a report and generate it on demand or on a schedule.",
      fields: {
        nameLabel: "Report name",
        namePlaceholder: "e.g. Weekly traffic digest",
        typeLabel: "Report type",
        types: ["Traffic", "Sales", "Customers", "Inventory", "Custom"],
        rangeLabel: "Date range",
        ranges: ["Last 7 days", "Last 30 days", "Last quarter", "Year to date"],
        sectionsLabel: "Include sections",
        sections: ["Revenue", "Orders", "Top products", "Traffic sources", "Devices", "Countries"],
        formatLabel: "Export format",
        formats: ["PDF", "CSV", "XLSX"],
        scheduleLabel: "Schedule",
        schedules: ["One-time", "Daily", "Weekly", "Monthly"],
        emailLabel: "Email recipients",
        emailPlaceholder: "team@example.com",
        emailHint: "Comma-separated — only used for scheduled reports.",
      },
    },
    orders: {
      heading: "Orders",
      sub: "Track, fulfil and refund customer orders.",
      stats: [
        { label: "Total orders", value: 2356, icon: "cart" },
        { label: "Revenue", value: 184210, format: "currency", icon: "revenue" },
        { label: "Pending fulfilment", value: 38, icon: "package" },
        { label: "Avg. order value", value: 78.2, format: "currency", icon: "wallet" },
      ],
      filters: [
        { key: "all", label: "All" },
        { key: "paid", label: "Paid" },
        { key: "pending", label: "Pending" },
        { key: "delivered", label: "Delivered" },
        { key: "refunded", label: "Refunded" },
        { key: "cancelled", label: "Cancelled" },
      ],
      items: [
        { id: "#3210", customer: "Liam Novak", email: "liam.novak@example.com", address: "12 Birchwood Ave, Portland, OR", payment: "Visa •• 4417", qty: 1, product: "Wireless Headset Pro", date: "2026-09-15", amount: 189.0, status: "paid" },
        { id: "#3209", customer: "Sofia Reyes", email: "sofia.reyes@example.com", address: "88 Calle Mayor, Madrid", payment: "Mastercard •• 8890", qty: 1, product: "Ergo Keyboard MK2", date: "2026-09-15", amount: 129.5, status: "pending" },
        { id: "#3208", customer: "Noah Kim", email: "noah.kim@example.com", address: "301 Gangnam-daero, Seoul", payment: "Visa •• 1024", qty: 1, product: "4K Monitor 27\"", date: "2026-09-14", amount: 429.99, status: "delivered" },
        { id: "#3207", customer: "Emma Larsen", email: "emma.larsen@example.com", address: "5 Norrebrogade, Copenhagen", payment: "Amex •• 3302", qty: 2, product: "USB-C Hub 8-in-1", date: "2026-09-14", amount: 79.0, status: "paid" },
        { id: "#3206", customer: "Lucas Meyer", email: "lucas.meyer@example.com", address: "44 Bergmannstr, Berlin", payment: "PayPal", qty: 1, product: "Noise-Cancel Earbuds", date: "2026-09-13", amount: 149.0, status: "delivered" },
        { id: "#3205", customer: "Mia Chen", email: "mia.chen@example.com", address: "77 King St W, Toronto", payment: "Visa •• 7781", qty: 1, product: "Standing Desk Frame", date: "2026-09-12", amount: 549.0, status: "pending" },
        { id: "#3204", customer: "Oliver Scott", email: "oliver.scott@example.com", address: "19 Queens Rd, Bristol", payment: "Mastercard •• 5540", qty: 1, product: "Webcam 4K Studio", date: "2026-09-12", amount: 199.0, status: "refunded" },
        { id: "#3203", customer: "Ava Dubois", email: "ava.dubois@example.com", address: "8 Rue de Rivoli, Paris", payment: "Visa •• 9012", qty: 1, product: "Mechanical Numpad", date: "2026-09-11", amount: 89.0, status: "cancelled" },
        { id: "#3202", customer: "Ethan Rossi", email: "ethan.rossi@example.com", address: "21 Via Roma, Milan", payment: "PayPal", qty: 3, product: "Monitor Light Bar", date: "2026-09-11", amount: 59.99, status: "delivered" },
        { id: "#3201", customer: "Isla Novak", email: "isla.novak@example.com", address: "3 Albert Dock, Liverpool", payment: "Visa •• 2765", qty: 1, product: "Desk Mat XL", date: "2026-09-10", amount: 39.0, status: "paid" },
      ],
      /* Shared mock for the detail template (order.html?id=…). */
      detail: {
        timelineTitle: "Timeline",
        timeline: [
          { icon: "cart", label: "Order placed", time: "09:41" },
          { icon: "card", label: "Payment confirmed", time: "09:42" },
          { icon: "package", label: "Packed", time: "11:03" },
          { icon: "send", label: "Handed to carrier", time: "14:20" },
        ],
      },
    },
    products: {
      heading: "Products",
      sub: "Catalog, inventory and pricing.",
      stats: [
        { label: "Active products", value: 148, icon: "tag" },
        { label: "Out of stock", value: 7, icon: "package" },
        { label: "Avg. rating", value: 4.6, icon: "star" },
      ],
      items: [
        { id: "SKU-1042", name: "Wireless Headset Pro", category: "Audio", price: 189.0, stock: 214, rating: 4.8, status: "in stock" },
        { id: "SKU-1039", name: "Ergo Keyboard MK2", category: "Input", price: 129.5, stock: 96, rating: 4.7, status: "in stock" },
        { id: "SKU-1035", name: "4K Monitor 27\"", category: "Displays", price: 429.99, stock: 41, rating: 4.9, status: "in stock" },
        { id: "SKU-1031", name: "USB-C Hub 8-in-1", category: "Accessories", price: 79.0, stock: 12, rating: 4.5, status: "low stock" },
        { id: "SKU-1027", name: "Noise-Cancel Earbuds", category: "Audio", price: 149.0, stock: 178, rating: 4.6, status: "in stock" },
        { id: "SKU-1024", name: "Standing Desk Frame", category: "Furniture", price: 549.0, stock: 8, rating: 4.4, status: "low stock" },
        { id: "SKU-1019", name: "Webcam 4K Studio", category: "Video", price: 199.0, stock: 0, rating: 4.3, status: "out of stock" },
        { id: "SKU-1015", name: "Monitor Light Bar", category: "Lighting", price: 59.99, stock: 263, rating: 4.7, status: "in stock" },
      ],
      /* Shared mock for the detail template (product.html?id=…). */
      detail: {
        blurb: "Flagship SKU in its category — full spec sheet, live stock, and sales history below.",
        statsTitle: "Sales snapshot",
        stats: [
          { label: "Units sold (30d)", value: 842, icon: "cart" },
          { label: "Revenue (30d)", value: 159138, format: "currency", icon: "revenue" },
          { label: "Return rate", value: 2.1, icon: "refund" },
          { label: "Restock ETA", value: 6, icon: "clock" },
        ],
      },
    },
    customers: {
      heading: "Customers",
      sub: "Accounts, lifetime value and activity.",
      stats: [
        { label: "Total customers", value: 1218, icon: "users" },
        { label: "New this month", value: 84, icon: "plus" },
        { label: "Avg. lifetime value", value: 412.4, format: "currency", icon: "wallet" },
      ],
      items: [
        { id: "CUS-884", name: "Liam Novak", email: "liam@novak.io", country: "Germany", orders: 14, spent: 2140.5, status: "active", joined: "2024-03-12" },
        { id: "CUS-871", name: "Sofia Reyes", email: "sofia@reyes.dev", country: "Spain", orders: 9, spent: 1187.0, status: "active", joined: "2024-11-02" },
        { id: "CUS-860", name: "Noah Kim", email: "noah@kim.co", country: "South Korea", orders: 22, spent: 4410.99, status: "active", joined: "2023-06-21" },
        { id: "CUS-845", name: "Emma Larsen", email: "emma@larsen.dk", country: "Denmark", orders: 5, spent: 402.0, status: "inactive", joined: "2025-01-30" },
        { id: "CUS-833", name: "Lucas Meyer", email: "lucas@meyer.de", country: "Germany", orders: 11, spent: 1763.0, status: "active", joined: "2024-08-14" },
        { id: "CUS-820", name: "Mia Chen", email: "mia@chen.design", country: "Taiwan", orders: 3, spent: 588.0, status: "inactive", joined: "2025-05-09" },
        { id: "CUS-811", name: "Oliver Scott", email: "oliver@scott.uk", country: "United Kingdom", orders: 17, spent: 2901.5, status: "active", joined: "2023-12-05" },
        { id: "CUS-799", name: "Ava Dubois", email: "ava@dubois.fr", country: "France", orders: 6, spent: 734.0, status: "inactive", joined: "2025-02-18" },
      ],
    },
    notificationsPage: {
      heading: "Notifications",
      sub: "Everything that happened in your workspace.",
    },
    auditLog: {
      heading: "Audit log",
      sub: "Every sensitive action across the workspace — who, what, when.",
      // Filter chips — `variant` keys the badge map; `icon` is a
      // semantic icons-map key. Add a type here and the filter follows.
      types: [
        { key: "auth", label: "Auth", icon: "lockKey", variant: "info" },
        { key: "data", label: "Data", icon: "file", variant: "primary" },
        { key: "settings", label: "Settings", icon: "settings", variant: "warning" },
        { key: "security", label: "Security", icon: "shield", variant: "danger" },
      ],
      // Newest first — `ts` ISO UTC; `status` maps via $statusVariant.
      events: [
        { id: "EVT-2041", ts: "2026-09-20T14:23:00Z", type: "auth", icon: "logout", actor: "Maya Chen", action: "Signed out", target: "", ip: "84.19.42.7", status: "active" },
        { id: "EVT-2040", ts: "2026-09-20T14:02:00Z", type: "data", icon: "download", actor: "Maya Chen", action: "Exported orders.csv", target: "orders.csv", ip: "84.19.42.7", status: "active" },
        { id: "EVT-2039", ts: "2026-09-20T11:47:00Z", type: "security", icon: "key", actor: "Isla Novak", action: "Revoked API key", target: "sk_live_…4f2a", ip: "62.155.10.3", status: "failed" },
        { id: "EVT-2038", ts: "2026-09-20T09:15:00Z", type: "settings", icon: "settings", actor: "Tom Becker", action: "Changed workspace timezone", target: "Europe/Berlin", ip: "77.8.201.44", status: "active" },
        { id: "EVT-2037", ts: "2026-09-19T18:31:00Z", type: "auth", icon: "lockKey", actor: "Lena Vogt", action: "Signed in", target: "", ip: "91.64.12.9", status: "active" },
        { id: "EVT-2036", ts: "2026-09-19T17:52:00Z", type: "security", icon: "shield", actor: "system", action: "Blocked sign-in attempt", target: "maya@dreamboard.io", ip: "185.220.101.4", status: "failed" },
        { id: "EVT-2035", ts: "2026-09-19T16:08:00Z", type: "data", icon: "pencil", actor: "Maya Chen", action: "Edited product", target: "DreamBoard Fullstack", ip: "84.19.42.7", status: "active" },
        { id: "EVT-2034", ts: "2026-09-19T15:44:00Z", type: "settings", icon: "palette", actor: "Isla Novak", action: "Changed accent preset", target: "violet", ip: "62.155.10.3", status: "active" },
        { id: "EVT-2033", ts: "2026-09-19T13:20:00Z", type: "auth", icon: "userPlus", actor: "Maya Chen", action: "Invited member", target: "lena@dreamboard.io", ip: "84.19.42.7", status: "active" },
        { id: "EVT-2032", ts: "2026-09-19T11:02:00Z", type: "data", icon: "trash", actor: "Tom Becker", action: "Deleted report", target: "q2-churn.csv", ip: "77.8.201.44", status: "failed" },
        { id: "EVT-2031", ts: "2026-09-18T19:36:00Z", type: "security", icon: "key", actor: "Isla Novak", action: "Created API key", target: "sk_live_…9c1d", ip: "62.155.10.3", status: "active" },
        { id: "EVT-2030", ts: "2026-09-18T16:55:00Z", type: "auth", icon: "lockKey", actor: "Maya Chen", action: "Signed in", target: "", ip: "84.19.42.7", status: "active" },
        { id: "EVT-2029", ts: "2026-09-18T14:12:00Z", type: "settings", icon: "bell", actor: "Lena Vogt", action: "Disabled email alerts", target: "Weekly digest", ip: "91.64.12.9", status: "active" },
        { id: "EVT-2028", ts: "2026-09-18T10:40:00Z", type: "data", icon: "upload", actor: "Isla Novak", action: "Uploaded file", target: "brand-guidelines.pdf", ip: "62.155.10.3", status: "active" },
        { id: "EVT-2027", ts: "2026-09-18T09:03:00Z", type: "security", icon: "shield", actor: "system", action: "Two-factor enabled", target: "maya@dreamboard.io", ip: "84.19.42.7", status: "active" },
        { id: "EVT-2026", ts: "2026-09-17T17:28:00Z", type: "auth", icon: "lockKey", actor: "Tom Becker", action: "Signed in", target: "", ip: "77.8.201.44", status: "active" },
        { id: "EVT-2025", ts: "2026-09-17T15:11:00Z", type: "data", icon: "download", actor: "Lena Vogt", action: "Exported customers.csv", target: "customers.csv", ip: "91.64.12.9", status: "active" },
        { id: "EVT-2024", ts: "2026-09-17T12:49:00Z", type: "settings", icon: "settings", actor: "Maya Chen", action: "Updated billing email", target: "billing@dreamboard.io", ip: "84.19.42.7", status: "active" },
      ],
    },
    tasks: {
      heading: "Tasks",
      sub: "Drag cards between columns, or use each card's menu to move it.",
      // Picker pools for the task editor — buyer-editable seam: edit here
      // or feed from your API; tags/assignees already on cards merge in.
      assignees: ["Isla Novak", "Lena Vogt", "Maya Chen", "Tom Becker"],
      tagOptions: [
        { tag: "Design", variant: "primary" },
        { tag: "Engineering", variant: "warning" },
        { tag: "Marketing", variant: "primary" },
        { tag: "Research", variant: "default" },
        { tag: "Strategy", variant: "info" },
      ],
      columns: [
        {
          id: "backlog",
          color: "slate",
          title: "Backlog",
          items: [
            { id: "TK-101", title: "Draft Q4 pricing experiments", tag: "Strategy", tagVariant: "info", assignee: "Maya Chen", due: "2026-10-02" },
            { id: "TK-102", title: "Audit onboarding email sequence", tag: "Marketing", tagVariant: "primary", assignee: "Tom Becker", due: "2026-10-05" },
            { id: "TK-103", title: "Evaluate vector DB providers", tag: "Research", tagVariant: "default", assignee: "Lena Vogt", due: "2026-10-08" },
          ],
        },
        {
          id: "in-progress",
          color: "sky",
          title: "In Progress",
          items: [
            { id: "TK-094", title: "Refactor checkout totals service", tag: "Engineering", tagVariant: "warning", assignee: "Lena Vogt", due: "2026-09-28" },
            { id: "TK-095", title: "Dark-mode contrast pass on charts", tag: "Design", tagVariant: "primary", assignee: "Isla Novak", due: "2026-09-30" },
          ],
        },
        {
          id: "review",
          color: "amber",
          title: "Review",
          items: [
            { id: "TK-087", title: "Locale-aware currency formatting", tag: "Engineering", tagVariant: "warning", assignee: "Maya Chen", due: "2026-09-26" },
            { id: "TK-088", title: "Customer interview synthesis", tag: "Research", tagVariant: "default", assignee: "Tom Becker", due: "2026-09-27" },
          ],
        },
        {
          id: "done",
          color: "emerald",
          title: "Done",
          items: [
            { id: "TK-071", title: "Ship ApexCharts migration", tag: "Engineering", tagVariant: "warning", assignee: "Lena Vogt", due: "2026-09-20" },
            { id: "TK-072", title: "Publish AI Suite launch notes", tag: "Marketing", tagVariant: "primary", assignee: "Isla Novak", due: "2026-09-22" },
          ],
        },
      ],
    },
    calendar: {
      heading: "Calendar",
      sub: "Schedule, deadlines and team events.",
      initialMonth: "2026-09",
      weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      variants: [
        { key: "primary", label: "Primary" },
        { key: "success", label: "Success" },
        { key: "warning", label: "Warning" },
        { key: "danger", label: "Danger" },
      ],
      events: [
        { id: "e1", date: "2026-09-03", title: "Sprint planning", variant: "primary" },
        { id: "e2", date: "2026-09-08", title: "Design review", variant: "success" },
        { id: "e3", date: "2026-09-08", title: "1:1 with Mia", variant: "default" },
        { id: "e4", date: "2026-09-12", title: "Release v1.4", variant: "danger" },
        { id: "e5", date: "2026-09-15", title: "Customer demo", variant: "primary" },
        { id: "e6", date: "2026-09-18", title: "Quarterly retro", variant: "warning" },
        { id: "e7", date: "2026-09-22", title: "Team offsite", variant: "success" },
        { id: "e8", date: "2026-09-26", title: "Bug bash", variant: "default" },
        { id: "e9", date: "2026-09-30", title: "Month-end report", variant: "primary" },
      ],
    },
    auth: {
      signin: {
        heading: "Welcome back",
        sub: "Sign in to continue to your dashboard.",
        providers: [
          { name: "Google", icon: "google" },
          { name: "GitHub", icon: "github" },
        ],
      },
      signup: {
        heading: "Create your account",
        sub: "Start your 14-day free trial. No credit card required.",
      },
      forgot: {
        heading: "Reset your password",
        sub: "Enter the email linked to your account and we'll send a reset link.",
      },
      verify: {
        heading: "Check your inbox",
        sub: "We sent a verification link to your email address. Click the link to activate your account.",
      },
      reset: {
        heading: "Choose a new password",
        sub: "Your new password must be at least 8 characters long.",
      },
      otp: {
        heading: "Two-factor authentication",
        sub: "Enter the 6-digit code from your authenticator app.",
      },
      notFound: {
        heading: "Page not found",
        sub: "The page you're looking for doesn't exist or was moved.",
      },
      serverError: {
        heading: "Something went wrong",
        sub: "We're already looking into it. Please try again in a moment.",
      },
      maintenance: {
        heading: "Scheduled maintenance",
        sub: "DreamBoard is down for a short upgrade. We'll be back at 14:00 UTC.",
      },
      comingSoon: {
        heading: "We're launching soon",
        sub: "Leave your email and we'll let you know the moment we're live.",
      },
      lockScreen: {
        heading: "Session locked",
        sub: "Enter your password to pick up where you left off.",
      },
    },
    /* ── Apps ─────────────────────────────────────────────────────── */
    inbox: {
      heading: "Inbox",
      sub: "Customer conversations and team mail in one place.",
      boxes: [
        { key: "inbox", label: "Inbox", icon: "tray" },
        { key: "starred", label: "Starred", icon: "star" },
      ],
      messages: [
        { id: "m1", from: "Liam Novak", email: "liam@novak.io", subject: "Renewal quote for the Team plan", preview: "Our annual renewal is coming up next month…", time: "09:12", unread: true, starred: false, body: "Hi Maya,\n\nour annual renewal is coming up next month. Could you send over an updated quote for 12 seats on the Team plan? We'd also like to know if the AI add-on can be billed monthly.\n\nThanks,\nLiam" },
        { id: "m2", from: "Sofia Reyes", email: "sofia@reyes.dev", subject: "Re: Q3 launch assets", preview: "Attached are the final banner sizes…", time: "08:47", unread: true, starred: true, body: "Hi Maya,\n\nattached are the final banner sizes for the Q3 launch. The hero variant is approved; the social crops need one more pass on the logo placement.\n\nBest,\nSofia" },
        { id: "m3", from: "Noah Kim", email: "noah@kim.co", subject: "Access request: analytics workspace", preview: "Could you grant me read access…", time: "Yesterday", unread: false, starred: false, body: "Hi Maya,\n\ncould you grant me read access to the analytics workspace? I need the funnel numbers for the board deck on Friday.\n\nNoah" },
        { id: "m4", from: "DreamBoard Billing", email: "billing@dreamboard.io", subject: "Your invoice INV-2026-0114 is available", preview: "Invoice INV-2026-0114 for €594.51…", time: "Yesterday", unread: false, starred: false, body: "Hello,\n\ninvoice INV-2026-0114 for €594.51 is now available in your billing portal. Payment is due within 14 days.\n\nDreamBoard Billing" },
        { id: "m5", from: "Emma Larsen", email: "emma@larsen.dk", subject: "Bug report: export button in Safari", preview: "The CSV export doesn't trigger…", time: "Mon", unread: false, starred: true, body: "Hi,\n\nthe CSV export doesn't trigger a download in Safari 19 — no error in the console either. Works fine in Chrome. Can you reproduce on your side?\n\nEmma" },
        { id: "m6", from: "Lucas Meyer", email: "lucas@meyer.de", subject: "Feedback on the new onboarding flow", preview: "The checklist really helped…", time: "Mon", unread: false, starred: false, body: "Hey Maya,\n\nthe checklist in the new onboarding flow really helped our team. Two suggestions: make the invite step skippable, and persist the collapsed state of the sidebar.\n\nLucas" },
        { id: "m7", from: "Ava Dubois", email: "ava@dubois.fr", subject: "Conference talk proposal", preview: "Would you join our panel on design systems…", time: "Sep 14", unread: false, starred: false, body: "Hello Maya,\n\nwould you join our panel on design systems at Frontend Forward in November? The topic is 'Tokens as a product' — 30 minutes, remote-friendly.\n\nAva" },
      ],
    },
    files: {
      heading: "File Manager",
      sub: "Shared workspace storage for the whole team.",
      quota: { used: 7.4, limit: 20, unit: "GB" },
      folders: [
        { id: "f-brand", name: "Brand assets", parent: null, files: 24, size: "1.2 GB" },
        { id: "f-docs", name: "Docs", parent: null, files: 38, size: "860 MB" },
        { id: "f-releases", name: "Releases", parent: null, files: 12, size: "3.1 GB" },
        { id: "f-legal", name: "Legal", parent: "f-docs", files: 7, size: "210 MB" },
        { id: "f-archive", name: "Archive", parent: "f-docs", files: 15, size: "340 MB" },
        { id: "f-v2", name: "v2.4 launch", parent: "f-releases", files: 9, size: "1.8 GB" },
      ],
      items: [
        { id: "d1", name: "brand-guidelines.pdf", icon: "filePdf", size: "4.2 MB", modified: "2026-09-14", owner: "Maya Chen", folder: "f-brand" },
        { id: "d2", name: "logo-dark.svg", icon: "fileImg", size: "18 KB", modified: "2026-09-10", owner: "Sofia Reyes", folder: "f-brand" },
        { id: "d3", name: "q3-roadmap.doc", icon: "fileDoc", size: "312 KB", modified: "2026-09-15", owner: "Maya Chen", folder: "f-docs" },
        { id: "d4", name: "nda-northwind.pdf", icon: "filePdf", size: "96 KB", modified: "2026-08-30", owner: "Liam Novak", folder: "f-legal" },
        { id: "d5", name: "screenshots-v2.zip", icon: "fileZip", size: "48 MB", modified: "2026-09-12", owner: "Noah Kim", folder: "f-v2" },
        { id: "d6", name: "launch-teaser.mp4", icon: "fileVid", size: "182 MB", modified: "2026-09-08", owner: "Sofia Reyes", folder: "f-v2" },
        { id: "d7", name: "pricing-model.xls", icon: "fileXls", size: "204 KB", modified: "2026-09-11", owner: "Lucas Meyer", folder: "f-docs" },
        { id: "d8", name: "podcast-intro.mp3", icon: "fileAudio", size: "3.4 MB", modified: "2026-09-05", owner: "Ava Dubois", folder: null },
        { id: "d9", name: "api-spec.pdf", icon: "filePdf", size: "1.1 MB", modified: "2026-09-16", owner: "Noah Kim", folder: null },
        { id: "d10", name: "team-photo.png", icon: "fileImg", size: "6.8 MB", modified: "2026-09-02", owner: "Emma Larsen", folder: null },
      ],
    },
    invoice: {
      heading: "Invoice",
      sub: "Billing detail for your records — print or download as PDF.",
      inv: {
        number: "INV-2026-0114",
        status: "paid",
        issued: "2026-09-15",
        due: "2026-09-29",
        from: { name: "DreamBoard GmbH", lines: ["Torstraße 140", "10119 Berlin", "Germany", "billing@dreamboard.io"] },
        to: { name: "Northwind Labs", lines: ["Attn: Maya Chen", "Ritterstraße 12", "10969 Berlin", "Germany"] },
        items: [
          { desc: "DreamBoard Pro — annual license", qty: 1, price: 299.0 },
          { desc: "Additional developer seats", qty: 4, price: 49.0 },
          { desc: "Priority support, 12 months", qty: 1, price: 120.0 },
        ],
        taxRate: 0.19,
        note: "Thank you for your business. Payment by bank transfer within 14 days.",
      },
    },
    pricing: {
      heading: "Pricing",
      sub: "Simple tiers that scale with your team — switch any time.",
      cycle: { monthly: "Monthly", annual: "Annual", save: "Save 20%" },
      tiers: [
        {
          name: "Starter", monthly: 0, annual: 0,
          desc: "For side projects and evaluation.",
          features: ["1 project", "Core components", "Community support"],
          cta: "Start free", popular: false,
        },
        {
          name: "Pro", monthly: 29, annual: 23,
          desc: "For teams shipping production dashboards.",
          features: ["Unlimited projects", "All components & templates", "Priority support", "Figma source files"],
          cta: "Start 14-day trial", popular: true,
        },
        {
          name: "Enterprise", monthly: 99, annual: 79,
          desc: "For organizations with compliance needs.",
          features: ["Everything in Pro", "SSO & audit logs", "Dedicated manager", "Custom licensing"],
          cta: "Contact sales", popular: false,
        },
      ],
    },
    user: {
      heading: "User detail",
      sub: "Customer record, order history and activity.",
      activity: [
        { title: "Placed order #3210", body: "Wireless Headset Pro", time: "Sep 15", variant: "primary" },
        { title: "Left a 5-star review", body: "Ergo Keyboard MK2", time: "Sep 8", variant: "success" },
        { title: "Updated shipping address", body: "Berlin, Germany", time: "Aug 28", variant: "warning" },
        { title: "Account created", body: "Signed up via referral", time: "Mar 12", variant: "danger" },
      ],
    },
    landing: {
      heading: "A dashboard your team will actually love",
      sub: "DreamBoard gives you 56 production-ready pages, accessible components and a data layer you can swap for your API in minutes.",
      ctaPrimary: "Start free trial",
      ctaSecondary: "View live demo",
      featuresTitle: "Everything you need to ship",
      featuresSub: "Built for product teams that care about craft.",
      features: [
        { icon: "users", title: "56 ready pages", body: "Dashboards, commerce, AI suite, auth flows and utilities — all data-driven." },
        { icon: "pulse", title: "Accessible by default", body: "WCAG 2.2 AA verified on every page, light and dark, with keyboard-complete components." },
        { icon: "palette", title: "One-file theming", body: "Re-skin the whole kit by editing a single CSS-token file — presets included." },
        { icon: "files", title: "Swap-in data layer", body: "Every view binds to one data file. Point it at your API and the UI updates." },
        { icon: "globe", title: "Localized", body: "English and German out of the box; add locales through a single dictionary file." },
        { icon: "gauge", title: "Charts included", body: "13 ApexCharts demos, theme-aware and screen-reader-equivalent." },
      ],
      bannerTitle: "Ready to build your next dashboard?",
      bannerSub: "Join 2,400+ teams shipping faster with DreamBoard.",
      bannerCta: "Get DreamBoard",
      footNote: "Built with Tailwind CSS v4 and Alpine.js — zero build tooling required.",
    },
    landing2: {
      badge: "New — AI suite included",
      heading: "One kit. Every accent.",
      sub: "Click a swatch — the whole interface re-themes instantly. Six built-in presets plus a custom-color engine, all driven by a single token file.",
      ctaPrimary: "Start building",
      ctaSecondary: "Browse components",
      accentsLabel: "Try it — pick an accent",
      stats: [
        { label: "Ready pages", value: "56" },
        { label: "Chart demos", value: "13" },
        { label: "Axe violations", value: "0" },
        { label: "Editions", value: "2" },
      ],
      featuresTitle: "A system, not a pile of screens",
      featuresSub: "Tokens, data and a11y contracts keep every page consistent — and every port faithful.",
      bento: [
        { icon: "palette", title: "Live theming", body: "The accent engine rebuilds the whole primary scale at runtime. Watch charts, buttons and badges follow instantly.", size: "big" },
        { icon: "shield", title: "WCAG 2.2 AA", body: "Axe-audited in light and dark on every commit.", size: "sm" },
        { icon: "files", title: "One data file", body: "Swap mockData for your API — zero markup changes.", size: "sm" },
        { icon: "translate", title: "Localized", body: "English + German dictionaries; add locales by file.", size: "sm" },
        { icon: "gauge", title: "Fast by default", body: "Zero-CDN build, vendored assets, instant first paint.", size: "sm" },
        { icon: "brain", title: "AI suite built in", body: "Chat, agents, prompt library, model manager and token usage — five more pages your SaaS needs anyway.", size: "big" },
      ],
      quote: {
        text: "We replaced a year of accumulated dashboard debt in a weekend. The accessibility contract alone was worth it.",
        name: "Jonas Reimann",
        role: "Head of Product, Fieldbase",
      },
      bannerTitle: "Make it yours in one file",
      bannerSub: "Theme tokens, accent presets and a swappable data layer — DreamBoard adapts to your product, not the other way around.",
      bannerCta: "Get DreamBoard",
      footNote: "Works with Tailwind CSS v4, Alpine.js and React — pick your stack.",
    },
    landing3: {
      badge: "v1.0 — now shipping",
      headingA: "Ship a dashboard",
      headingB: "this week.",
      sub: "Stop rebuilding tables, charts and modals. DreamBoard ships the whole product surface — you wire the endpoints.",
      ctaPrimary: "Get the kit",
      ctaSecondary: "See it live",
      logosLabel: "Trusted by product teams at",
      logos: ["Fieldbase", "Norra", "Klarheit", "Loopwerk", "Datenraum", "Helio"],
      stepsTitle: "Three steps to production",
      stepsSub: "From download to deployed dashboard in an afternoon.",
      steps: [
        { title: "Unzip and run", body: "npm install, npm run dev — the full app boots in seconds. No config files, no codegen." },
        { title: "Point at your API", body: "Swap data/mockData.js for fetch() calls of the same shape. Every page keeps working." },
        { title: "Ship it", body: "npm run build emits static assets — host them anywhere. A11y gate passes out of the box." },
      ],
      quotesTitle: "Teams ship faster with DreamBoard",
      quotes: [
        { text: "The table conventions saved us weeks — sorting, selection, CSV export and column settings on every grid.", name: "Priya Anand", role: "Frontend Lead, Norra" },
        { text: "Finally a kit where dark mode isn't an afterthought. Both themes pass axe with zero violations.", name: "Marco Belli", role: "Design Engineer, Loopwerk" },
        { text: "We bought it for the AI pages and stayed for the data contract. Cleanest mock layer we've seen.", name: "Elena Frolova", role: "CTO, Helio" },
      ],
      bannerTitle: "Your next dashboard is already built",
      bannerSub: "56 pages, two editions, one data contract — for less than a day of contractor time.",
      bannerCta: "Get DreamBoard",
      footNote: "HTML + React editions included. Free updates for v1.x.",
    },
    landing4: {
      badge: "Live theming engine",
      heading: "Your brand. Your dashboard. One click.",
      sub: "Pick an accent, flip the lights — every component, chart and table follows. This is the exact theming system that ships inside the kit.",
      ctaPrimary: "Get the kit",
      ctaSecondary: "Browse components",
      accentsLabel: "Try it — pick an accent",
      darkToggle: "Toggle dark mode",
      heroChips: [
        { icon: "shield", label: "0 axe violations" },
        { icon: "files", label: "56 ready pages" },
        { icon: "translate", label: "EN + DE included" },
      ],
      stats: [
        { label: "Ready pages", value: "56" },
        { label: "Chart demos", value: "13" },
        { label: "Axe violations", value: "0" },
        { label: "Editions", value: "2" },
      ],
      boxTitle: "Everything in the box",
      boxSub: "One purchase, the whole product surface — no add-ons, no tiers, no upsells.",
      box: [
        "56 production pages",
        "AI suite — chat, agents, prompts",
        "Hardened data tables",
        "13 theme-aware charts",
        "Full auth flow",
        "Kanban, calendar, inbox, files",
        "WCAG 2.2 AA audit tooling",
        "EN + DE i18n layer",
      ],
      featuresTitle: "A system, not a pile of screens",
      featuresSub: "Tokens, data and a11y contracts keep every page consistent — and every port faithful.",
      bento: [
        { icon: "palette", title: "Live theming", body: "The accent engine rebuilds the whole primary scale at runtime. Watch charts, buttons and badges follow instantly.", size: "big" },
        { icon: "moon", title: "Real dark mode", body: "Not an inverted afterthought — a second token set, audited to the same AA bar.", size: "sm" },
        { icon: "files", title: "One data file", body: "Swap mockData for your API — zero markup changes.", size: "sm" },
        { icon: "gauge", title: "Fast by default", body: "Zero-CDN build, vendored assets, instant first paint.", size: "sm" },
        { icon: "shield", title: "WCAG 2.2 AA", body: "Axe-audited in light and dark on every commit.", size: "sm" },
        { icon: "brain", title: "AI suite built in", body: "Chat, agents, prompt library, model manager and token usage — five more pages your SaaS needs anyway.", size: "big" },
      ],
      teaserTitle: "One purchase, every edition",
      teaserSub: "HTML and React JS ship together — same pages, same contract, verified DOM parity.",
      teaserPrice: "from €49",
      teaserPoints: ["Instant download", "Free v1.x updates", "Use in unlimited projects"],
      teaserCta: "See pricing",
      quote: {
        text: "The theme engine sold it. We handed our brand tokens to DreamBoard and every screen just… matched.",
        name: "Sofia Marchetti",
        role: "Founder, Klarheit",
      },
      bannerTitle: "Make it yours in one file",
      bannerSub: "Theme tokens, accent presets and a swappable data layer — DreamBoard adapts to your product, not the other way around.",
      bannerCta: "Get DreamBoard",
      reassure: ["Instant download", "Free v1.x updates", "30-day refund"],
      footNote: "Works with Tailwind CSS v4, Alpine.js and React — pick your stack.",
    },
    landing5: {
      badge: "New — realtime pages inside",
      heading: "Ship the product, not the plumbing",
      sub: "Tables, charts, auth, AI — already designed, audited and wired to one data contract. You keep the part that makes you money.",
      ctaPrimary: "Start building",
      ctaSecondary: "See it live",
      accentsLabel: "Pick an accent — watch it follow",
      logosLabel: "Trusted by product teams at",
      logos: ["Fieldbase", "Norra", "Klarheit", "Loopwerk", "Datenraum", "Helio"],
      rowsTitle: "Built for the parts you'll ship anyway",
      rowsSub: "Every screen your SaaS needs, already past design review.",
      rows: [
        {
          icon: "users",
          title: "Tables that behave",
          body: "Sorting, pagination, row selection, bulk actions, CSV export and column settings — the same hardened conventions on every grid.",
          points: ["Sticky columns", "Expandable rows", "Keyboard-complete"],
          visual: "table",
        },
        {
          icon: "gauge",
          title: "Charts with a contract",
          body: "Thirteen ApexCharts demos driven by plain data. Theme-aware, screen-reader-equivalent, and they follow your accent live.",
          points: ["Light + dark specs", "Realtime rolling series", "SR fallback table"],
          visual: "chart",
        },
        {
          icon: "brain",
          title: "The AI suite your users expect",
          body: "Streaming chat, agent manager, prompt library, model admin and token usage — the five pages every SaaS bolts on later.",
          points: ["Streaming UI pattern", "Session sidebar", "Usage metering"],
          visual: "kanban",
        },
      ],
      vsTitle: "The math is simple",
      vsSub: "Same destination. Very different invoices.",
      vsDiyTitle: "Build it yourself",
      vsKitTitle: "With DreamBoard",
      vsRows: [
        { label: "Data tables", diy: "3 weeks", kit: "0 days" },
        { label: "Auth flows", diy: "2 weeks", kit: "0 days" },
        { label: "Charts + realtime", diy: "2 weeks", kit: "0 days" },
        { label: "Accessibility pass", diy: "1 week", kit: "built in" },
      ],
      vsVerdict: "≈ 8 weeks of UI work — or an afternoon of wiring.",
      quote: {
        text: "We scoped the dashboard at two sprints. DreamBoard turned it into a ticket.",
        name: "Tomas Erben",
        role: "Engineering Lead, Datenraum",
      },
      bannerTitle: "Stop rebuilding the boring 80%",
      bannerSub: "Your roadmap deserves the hours a dashboard rebuild would eat.",
      bannerCta: "Get DreamBoard",
      reassure: ["Instant download", "Free v1.x updates", "30-day refund"],
      footNote: "Static build, vendored assets — deploys anywhere HTML does.",
    },
    landing6: {
      badge: "v1.0 — now shipping",
      headingA: "The boring 80%,",
      headingB: "already done.",
      sub: "Every SaaS ships the same screens. DreamBoard ships them audited, themed and wired to one contract — you wire the endpoints.",
      ctaPrimary: "Get the kit",
      ctaSecondary: "See it live",
      logosLabel: "Trusted by product teams at",
      logos: ["Fieldbase", "Norra", "Klarheit", "Loopwerk", "Datenraum", "Helio"],
      accentTitle: "Try the accent engine — live",
      accentSub: "These swatches drive the real theme store. The card on the right is the same kit, re-skinned.",
      accentsLabel: "Pick an accent",
      previewCardTitle: "MRR",
      previewCardValue: "€12,480",
      previewCardDelta: "+8.2% vs last month",
      featuresTitle: "A system, not a pile of screens",
      featuresSub: "Tokens, data and a11y contracts keep every page consistent — and every port faithful.",
      bento: [
        { icon: "palette", title: "Live theming", body: "The accent engine rebuilds the whole primary scale at runtime. Watch charts, buttons and badges follow instantly.", size: "big" },
        { icon: "shield", title: "WCAG 2.2 AA", body: "Axe-audited in light and dark on every commit.", size: "sm" },
        { icon: "files", title: "One data file", body: "Swap mockData for your API — zero markup changes.", size: "sm" },
        { icon: "translate", title: "Localized", body: "English + German dictionaries; add locales by file.", size: "sm" },
        { icon: "gauge", title: "Fast by default", body: "Zero-CDN build, vendored assets, instant first paint.", size: "sm" },
        { icon: "brain", title: "AI suite built in", body: "Chat, agents, prompt library, model manager and token usage — five more pages your SaaS needs anyway.", size: "big" },
      ],
      stepsTitle: "Three steps to production",
      stepsSub: "From download to deployed dashboard in an afternoon.",
      steps: [
        { title: "Unzip and run", body: "npm install, npm run dev — the full app boots in seconds. No config files, no codegen." },
        { title: "Point at your API", body: "Swap data/mockData.js for fetch() calls of the same shape. Every page keeps working." },
        { title: "Ship it", body: "npm run build emits static assets — host them anywhere. A11y gate passes out of the box." },
      ],
      quotesTitle: "Teams ship faster with DreamBoard",
      quotes: [
        { text: "The table conventions saved us weeks — sorting, selection, CSV export and column settings on every grid.", name: "Priya Anand", role: "Frontend Lead, Norra" },
        { text: "Finally a kit where dark mode isn't an afterthought. Both themes pass axe with zero violations.", name: "Marco Belli", role: "Design Engineer, Loopwerk" },
        { text: "We bought it for the AI pages and stayed for the data contract. Cleanest mock layer we've seen.", name: "Elena Frolova", role: "CTO, Helio" },
      ],
      bannerTitle: "Your next dashboard is already built",
      bannerSub: "56 pages, two editions, one data contract — for less than a day of contractor time.",
      bannerCta: "Get DreamBoard",
      reassure: ["Instant download", "Free v1.x updates", "30-day refund"],
      footNote: "HTML + React editions included. Free updates for v1.x.",
    },
    charts: {
      heading: "Charts",
      sub: "Every spec below is plain data rendered through the vendored ApexCharts bundle — swap it for API responses without touching the markup.",
      cards: [
        {
          key: "line", type: "line", title: "Line chart",
          sub: "Monthly recurring revenue vs. operating cost.",
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          series: [
            { name: "Revenue", data: [84, 92, 88, 101, 96, 118, 124, 117, 132, 128, 141, 152] },
            { name: "Expenses", data: [58, 61, 57, 66, 71, 69, 74, 78, 73, 81, 79, 86] },
          ],
        },
        {
          key: "area", type: "area", title: "Area chart",
          sub: "Traffic split across the week.",
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          series: [
            { name: "Sessions", data: [420, 480, 510, 560, 590, 380, 340] },
            { name: "Page views", data: [980, 1120, 1240, 1310, 1420, 860, 720] },
          ],
        },
        {
          key: "bar", type: "bar", title: "Bar chart",
          sub: "Orders per weekday.",
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          series: [{ name: "Orders", data: [62, 78, 71, 88, 96, 44, 37] }],
        },
        {
          key: "barh", type: "bar", horizontal: true, title: "Horizontal bar",
          sub: "Sales by category.",
          labels: ["Electronics", "Apparel", "Home", "Beauty", "Sports"],
          series: [{ name: "Sales", data: [420, 355, 288, 234, 190] }],
        },
        {
          key: "live", type: "area", live: true, title: "Live area",
          sub: "Realtime endpoint — the newest sample pulses.",
          labels: ["-29m", "-25m", "-21m", "-17m", "-13m", "-9m", "-5m", "now"],
          series: [{ name: "Active users", data: [288, 301, 295, 312, 330, 318, 340, 352] }],
        },
        {
          key: "donut", type: "donut", title: "Donut chart",
          sub: "Traffic sources share.",
          labels: ["Direct", "Organic search", "Referral", "Social"],
          series: [44, 28, 17, 11],
        },
        {
          key: "radial", type: "radialBar", title: "Radial bar",
          sub: "Quota usage per resource.",
          labels: ["Storage", "Bandwidth", "Seats"],
          series: [72, 54, 38],
        },
      ],
    },
    chartsAdvanced: {
      heading: "Advanced charts",
      sub: "Higher-density visualizations — same data contract, richer chart types.",
      cards: [
        {
          key: "heat", type: "heatmap", wide: true, title: "Activity heatmap",
          sub: "Support tickets by weekday and hour.",
          labels: ["9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p"],
          series: [
            { name: "Mon", data: [{ x: "9a", y: 12 }, { x: "10a", y: 18 }, { x: "11a", y: 26 }, { x: "12p", y: 22 }, { x: "1p", y: 15 }, { x: "2p", y: 19 }, { x: "3p", y: 24 }, { x: "4p", y: 17 }, { x: "5p", y: 9 }] },
            { name: "Tue", data: [{ x: "9a", y: 14 }, { x: "10a", y: 21 }, { x: "11a", y: 29 }, { x: "12p", y: 25 }, { x: "1p", y: 18 }, { x: "2p", y: 22 }, { x: "3p", y: 27 }, { x: "4p", y: 19 }, { x: "5p", y: 11 }] },
            { name: "Wed", data: [{ x: "9a", y: 16 }, { x: "10a", y: 24 }, { x: "11a", y: 31 }, { x: "12p", y: 28 }, { x: "1p", y: 20 }, { x: "2p", y: 26 }, { x: "3p", y: 30 }, { x: "4p", y: 22 }, { x: "5p", y: 13 }] },
            { name: "Thu", data: [{ x: "9a", y: 15 }, { x: "10a", y: 22 }, { x: "11a", y: 28 }, { x: "12p", y: 26 }, { x: "1p", y: 17 }, { x: "2p", y: 24 }, { x: "3p", y: 29 }, { x: "4p", y: 20 }, { x: "5p", y: 12 }] },
            { name: "Fri", data: [{ x: "9a", y: 11 }, { x: "10a", y: 16 }, { x: "11a", y: 22 }, { x: "12p", y: 19 }, { x: "1p", y: 13 }, { x: "2p", y: 17 }, { x: "3p", y: 20 }, { x: "4p", y: 14 }, { x: "5p", y: 7 }] },
          ],
        },
        {
          key: "radar", type: "radar", title: "Radar chart",
          sub: "Product scorecard, this vs. last quarter.",
          labels: ["Speed", "Reliability", "Comfort", "Safety", "Efficiency", "Support"],
          series: [
            { name: "This quarter", data: [82, 91, 74, 88, 69, 95] },
            { name: "Last quarter", data: [74, 85, 70, 80, 62, 88] },
          ],
        },
        {
          key: "candle", type: "candlestick", title: "Candlestick",
          sub: "Daily OHLC for the week.",
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          series: [{
            data: [
              { x: "Mon", y: [6620, 6658, 6579, 6632] },
              { x: "Tue", y: [6632, 6690, 6610, 6678] },
              { x: "Wed", y: [6678, 6712, 6640, 6651] },
              { x: "Thu", y: [6651, 6702, 6628, 6689] },
              { x: "Fri", y: [6689, 6741, 6670, 6728] },
            ],
          }],
        },
        {
          key: "tree", type: "treemap", title: "Treemap",
          sub: "Headcount by department.",
          labels: ["Engineering", "Design", "Sales", "Marketing", "Support", "Operations"],
          series: [{
            data: [
              { x: "Engineering", y: 52 }, { x: "Design", y: 18 },
              { x: "Sales", y: 34 }, { x: "Marketing", y: 21 },
              { x: "Support", y: 27 }, { x: "Operations", y: 14 },
            ],
          }],
        },
        {
          key: "range", type: "rangeBar", title: "Timeline",
          sub: "Project phases by week.",
          labels: ["Discovery", "Design", "Development", "QA", "Launch"],
          series: [{
            data: [
              { x: "Discovery", y: [1, 4] }, { x: "Design", y: [3, 8] },
              { x: "Development", y: [7, 16] }, { x: "QA", y: [15, 19] },
              { x: "Launch", y: [19, 21] },
            ],
          }],
        },
        {
          key: "polar", type: "polarArea", title: "Polar area",
          sub: "Devices share.",
          labels: ["Desktop", "Mobile", "Tablet", "Smart TV", "Console"],
          series: [42, 31, 14, 8, 5],
        },
{
          key: "scatter", type: "scatter", title: "Scatter plot",
          sub: "Session length vs. conversion.",
          labels: ["1", "2", "3", "4", "5", "6", "7", "8"],
          series: [
            { name: "Trial users", data: [[1.2, 3.1], [2.4, 4.2], [3.1, 5.0], [4.6, 6.1], [5.2, 5.4], [6.8, 7.2], [7.5, 8.0], [8.4, 7.6]] },
            { name: "Paid users", data: [[1.5, 5.2], [2.8, 6.4], [3.9, 7.1], [4.9, 8.3], [5.8, 8.9], [6.6, 9.4], [7.9, 9.1], [9.0, 10.2]] },
          ],
        },
        {
          key: "world", type: "world", wide: true, mapLimit: 6, title: "World map",
          sub: "Visitors by origin country — IP geolocation on a dotted projection.",
          countries: [
            { name: "United States", code: "US", lon: -98.5, lat: 39.5, users: 41240, share: 28 },
            { name: "Germany", code: "DE", lon: 10.4, lat: 51.1, users: 22130, share: 15 },
            { name: "United Kingdom", code: "GB", lon: -2.5, lat: 54.0, users: 17690, share: 12 },
            { name: "India", code: "IN", lon: 78.0, lat: 21.0, users: 14740, share: 10 },
            { name: "Brazil", code: "BR", lon: -52.9, lat: -10.8, users: 11790, share: 8 },
            { name: "Japan", code: "JP", lon: 138.2, lat: 36.2, users: 8840, share: 6 },
          ],
        },
              ],
    },
    faq: {
      heading: "Frequently asked questions",
      sub: "Licensing, updates, customization and support — answered.",
      groups: [
        {
          label: "Licensing",
          items: [
            { q: "Can I use DreamBoard in a SaaS product?", a: "Yes — that requires the Extended license. The Regular license covers a single end product that is free for end users." },
            { q: "How many projects does one purchase cover?", a: "Regular covers one end product; Extended covers one end product including paid and SaaS use. Team bundles cover unlimited projects within your organization." },
            { q: "Do you offer refunds?", a: "Yes — 14 days, no questions asked, as long as the product hasn't been deployed to production." },
          ],
        },
        {
          label: "Product",
          items: [
            { q: "How do I change the brand color?", a: "Edit the --color-primary-* scale in packages/tailwind-config/theme.css — every component, chart and icon follows the tokens. Six presets ship built in." },
            { q: "How do I connect a real API?", a: "All content renders from data/mockData.js. Replace its values with fetch() payloads of the same shape and the UI updates without markup changes." },
            { q: "Is the kit really WCAG 2.2 AA?", a: "Every page is audited with axe-core in light and dark mode on each commit — including contrast, keyboard traps and ARIA state." },
          ],
        },
      ],
    },
    help: {
      heading: "Help center",
      sub: "Guides, references and support — everything in one place.",
      searchPlaceholder: "Search articles…",
      /* Docs seam — point `docsUrl` at the deployed docs site (VitePress
         build ships under docs/; swap for a public URL when hosted). */
      docsUrl: "docs/index.html",
      topics: [
        { icon: "bolt", label: "Getting started", desc: "Install, build and run the kit in minutes.", articles: 6 },
        { icon: "palette", label: "Theming", desc: "Accent presets, tokens and dark mode.", articles: 4 },
        { icon: "cpu", label: "Data & APIs", desc: "Wire mockData to a real backend.", articles: 5 },
        { icon: "grid", label: "Components", desc: "Every partial, its contract and variants.", articles: 12 },
        { icon: "shield", label: "Accessibility", desc: "WCAG 2.2 AA patterns used across the kit.", articles: 3 },
        { icon: "globe", label: "Deployment", desc: "Static hosting, Docker and the fullstack editions.", articles: 4 },
      ],
      articles: [
        { icon: "file", topic: "Getting started", title: "Project structure and the build pipeline", excerpt: "Where pages, partials, tokens and data live — and how npm run build assembles dist/.", minutes: 4 },
        { icon: "file", topic: "Getting started", title: "Running the dev server", excerpt: "Rebuild-on-change workflow, the audit gate and what QUALITY GATE checks.", minutes: 3 },
        { icon: "palette", topic: "Theming", title: "Changing the accent color", excerpt: "Six presets ship built in — or drop a custom hex and the primary scale regenerates at runtime.", minutes: 2 },
        { icon: "cpu", topic: "Data & APIs", title: "The mockData contract", excerpt: "Every page binds to window.mockData — swap the file for a fetch and the UI follows.", minutes: 6 },
        { icon: "cpu", topic: "Data & APIs", title: "Write-through seams", excerpt: "How apiPost keeps optimistic UI and real backends in sync behind one helper.", minutes: 5 },
        { icon: "shield", topic: "Accessibility", title: "Focus, contrast and keyboard contracts", excerpt: "Ring tokens, aria-expanded disclosures and the rules the audit enforces.", minutes: 5 },
      ],
      supportTitle: "Still need help?",
      supportSub: "Can’t find the answer? Reach out — we reply within 2-6 business days.",
      support: [
        { icon: "mail", label: "Email support", desc: "help@motiondreamatix.de", href: "mailto:help@motiondreamatix.de" },
        { icon: "files", label: "Full documentation", desc: "Browse the complete docs", href: "docs/index.html" },
      ],
      noResults: "No articles match your search.",
    },
    forms: {
      heading: "Form layouts",
      sub: "Stacked, two-column and multi-step wizard patterns — all data-driven.",
      stackedFields: [
        { id: "fl-name", label: "Full name", type: "text", autocomplete: "name", required: true, value: "Maya Chen" },
        { id: "fl-email", label: "Email", type: "email", autocomplete: "email", required: true, value: "maya@dreamboard.io" },
        { id: "fl-role", label: "Role", type: "text", required: false, value: "Product Manager" },
      ],
      gridFields: [
        { id: "fg-first", label: "First name", type: "text", autocomplete: "given-name", required: true, value: "Maya" },
        { id: "fg-last", label: "Last name", type: "text", autocomplete: "family-name", required: true, value: "Chen" },
        { id: "fg-company", label: "Company", type: "text", autocomplete: "organization", required: false, value: "Northwind Labs" },
        { id: "fg-vat", label: "VAT ID", type: "text", required: false, value: "DE314159265" },
      ],
      states: [
        { id: "fs-ok", label: "Workspace slug", value: "dreamboard-hq", state: "success", hint: "Slug is available." },
        { id: "fs-err", label: "Workspace slug", value: "dreamboard hq!", state: "error", hint: "Only lowercase letters, numbers and dashes." },
        { id: "fs-dis", label: "Workspace slug", value: "reserved-name", state: "disabled", hint: "This field is managed by your admin." },
      ],
      wizardSteps: [
        { title: "Account", desc: "Credentials" },
        { title: "Profile", desc: "Personal details" },
        { title: "Confirm", desc: "Review & finish" },
      ],
      wizardFields: [
        [
          { id: "wz-email", label: "Email", type: "email", autocomplete: "email", required: true, value: "" },
          { id: "wz-pass", label: "Password", type: "password", autocomplete: "new-password", required: true, value: "" },
        ],
        [
          { id: "wz-name", label: "Full name", type: "text", autocomplete: "name", required: true, value: "" },
          { id: "wz-team", label: "Team size", type: "text", required: false, value: "" },
        ],
        [],
      ],
    },
    onboarding: {
      heading: "Set up your workspace",
      sub: "Three quick steps — everything is editable later.",
      steps: [
        { title: "Workspace", desc: "Name your space" },
        { title: "Your role", desc: "Tailor the defaults" },
        { title: "Look & feel", desc: "Accent + density" },
        { title: "Done", desc: "Ready to go" },
      ],
      roles: [
        { key: "founder", label: "Founder / PM", icon: "gauge" },
        { key: "developer", label: "Developer", icon: "cpu" },
        { key: "designer", label: "Designer", icon: "palette" },
        { key: "other", label: "Other", icon: "dots" },
      ],
    },
    /* ── AI Suite ─────────────────────────────────────────────────── */
    aiChat: {
      heading: "AI Chat",
      sub: "Converse with your models, iterate on prompts, keep every thread.",
      models: [
        { name: "Nova 3 Turbo", desc: "Fast, low cost — best default" },
        { name: "Nova 3 Pro", desc: "Highest quality reasoning" },
        { name: "Helix 2 Mini", desc: "On-device, privacy-first" },
      ],
      conversations: [
        { id: "c1", title: "Q3 launch email variants", model: "Nova 3 Turbo", updated: "2m ago", preview: "Here are three subject-line options…", pinned: true, unread: false },
        { id: "c2", title: "Refund policy summariser", model: "Nova 3 Pro", updated: "1h ago", preview: "The policy boils down to three rules…", pinned: true, unread: true },
        { id: "c3", title: "SQL for churn cohort", model: "Nova 3 Turbo", updated: "Yesterday", preview: "SELECT date_trunc('week', …) ", pinned: false, unread: false },
        { id: "c4", title: "Onboarding flow critique", model: "Helix 2 Mini", updated: "Mon", preview: "Three friction points stand out…", pinned: false, unread: false },
        { id: "c5", title: "Blog outline: AI in retail", model: "Nova 3 Pro", updated: "Sep 20", preview: "I. Hook, II. Trends, III. Case study…", pinned: false, unread: false },
      ],
      threads: {
        c1: [
          { role: "user", text: "Draft three subject lines for our Q3 feature-launch email. Tone: confident, not salesy.", time: "14:02", tokens: 24 },
          { role: "assistant", text: "Here are three options, ordered from subtle to bold:\n\n1. **The quiet upgrade your workflow asked for** — leads with customer benefit.\n2. **Q3 is here: faster reports, smarter alerts** — concrete feature call-outs.\n3. **We rebuilt the boring part** — playful, works well for warm lists.\n\nWant a variant set aimed at trial users specifically?", time: "14:02", tokens: 118 },
          { role: "user", text: "Option 2 is closest. Give me two more in that style.", time: "14:04", tokens: 15 },
          { role: "assistant", text: "Two more in that concrete, feature-forward style:\n\n1. **New in Q3: dashboards that update themselves** — emphasises automation.\n2. **Your Q3 toolkit: alerts, exports, zero busywork** — triadic rhythm, scannable.\n\nBoth stay under 50 characters, so they survive mobile truncation.", time: "14:04", tokens: 96 },
        ],
        c2: [
          { role: "user", text: "Summarise our refund policy in plain English for the help centre.", time: "09:31", tokens: 18 },
          { role: "assistant", text: "The policy boils down to three rules:\n\n- **30 days, no questions** — full refund within a month of purchase.\n- **After 30 days** — pro-rated credit for annual plans only.\n- **Add-ons are final** — usage-based charges aren't refundable.\n\nSuggested help-centre title: *\"Refunds: the short version\"*.", time: "09:31", tokens: 104 },
        ],
      },
      replies: [
        "Here's a refined version. I tightened the opening, moved the key metric into the first paragraph, and softened the call-to-action so it reads as helpful rather than pushy. Want me to produce a shorter variant for mobile readers?",
        "Good direction. A few observations:\n\n- The second paragraph carries the strongest argument — consider leading with it.\n- Terms like \"leverage\" and \"synergy\" dilute the message; plain verbs land better.\n- Adding one concrete number would raise credibility.\n\nShall I apply these edits?",
        "I analysed the thread and found two recurring themes: latency concerns and pricing clarity. I can draft a response addressing both, or split them into separate messages per stakeholder. Which do you prefer?",
        "Done. The output uses your brand voice profile: short sentences, active voice, and no exclamation marks. Confidence is high on sections 1–3; section 4 may need a human pass on the legal wording.",
      ],
      suggestions: ["Summarise this week's support tickets", "Draft a release note for v2.4", "Explain our pricing tiers to a lead", "Brainstorm names for a reports feature"],
    },

    aiAgents: {
      heading: "Agents",
      sub: "Autonomous workflows running on your data — pause, resume, inspect.",
      stats: [
        { label: "Active agents", value: 4, format: "number", icon: "robot" },
        { label: "Runs this week", value: 1284, format: "number", icon: "pulse" },
        { label: "Avg. success rate", value: 97.2, format: "percent", icon: "check" },
      ],
      items: [
        { id: "a1", name: "Ticket triage", desc: "Classifies inbound support tickets and routes them to the right queue.", icon: "tag", status: "running", runs: 412, success: 98.1, lastRun: "4m ago", schedule: "Every new ticket" },
        { id: "a2", name: "Weekly digest", desc: "Summarises product analytics into a Slack-ready Monday briefing.", icon: "mail", status: "running", runs: 38, success: 100, lastRun: "Mon 09:00", schedule: "Weekly · Mon 9:00" },
        { id: "a3", name: "Churn watcher", desc: "Flags accounts whose usage drops 40% week-over-week.", icon: "alert", status: "running", runs: 52, success: 94.2, lastRun: "26m ago", schedule: "Hourly" },
        { id: "a4", name: "Invoice chaser", desc: "Sends polite payment reminders at 3, 7 and 14 days overdue.", icon: "wallet", status: "paused", runs: 186, success: 96.8, lastRun: "Paused", schedule: "Daily · 08:00" },
        { id: "a5", name: "Doc indexer", desc: "Embeds new help-centre articles into the knowledge base.", icon: "file", status: "running", runs: 596, success: 99.0, lastRun: "12m ago", schedule: "On publish" },
        { id: "a6", name: "Lead enricher", desc: "Backfills firmographic data when a signup lands.", icon: "users", status: "error", runs: 74, success: 88.4, lastRun: "2h ago", schedule: "Every new signup" },
      ],
    },

    aiPrompts: {
      heading: "Prompt library",
      sub: "Curated, versioned prompts your whole workspace can reuse.",
      categories: ["All", "Marketing", "Support", "Engineering", "Sales"],
      items: [
        { id: "p1", title: "Launch email", desc: "Feature-announcement email with three subject-line options.", category: "Marketing", uses: 1240, prompt: "Draft a launch email for {feature}. Audience: {segment}. Tone: confident, no hype. Include 3 subject lines under 50 chars." },
        { id: "p2", title: "Ticket summary", desc: "Condenses a long support thread into three bullets.", category: "Support", uses: 2310, prompt: "Summarise this support thread in ≤3 bullets: what happened, what the customer wants, what we promised. Flag any SLA risk." },
        { id: "p3", title: "PR reviewer", desc: "Reviews a diff for bugs, style and missing tests.", category: "Engineering", uses: 980, prompt: "Review this diff. List: (1) correctness risks, (2) style issues, (3) missing test coverage. Be terse; cite line numbers." },
        { id: "p4", title: "Cold outreach", desc: "Personalised opener using the prospect's latest post.", category: "Sales", uses: 640, prompt: "Write a 60-word opener for {prospect}. Reference their post about {topic}. Ask one question, no pitch." },
        { id: "p5", title: "Release notes", desc: "Turns merged PRs into customer-facing release notes.", category: "Engineering", uses: 1730, prompt: "Convert these merged PRs into release notes. Group by Added / Fixed / Improved. Plain language, no ticket IDs." },
        { id: "p6", title: "Churn-save reply", desc: "Empathetic response to a cancellation request.", category: "Support", uses: 415, prompt: "Reply to this cancellation request. Acknowledge the reason, offer the annual-discount option once, keep it under 80 words." },
        { id: "p7", title: "Ad variants", desc: "Five short ad variants from one product brief.", category: "Marketing", uses: 860, prompt: "Write 5 ad variants (max 90 chars each) for {product}. Vary the hook: pain, benefit, social proof, curiosity, offer." },
        { id: "p8", title: "SQL helper", desc: "Natural-language question to a documented query.", category: "Engineering", uses: 1540, prompt: "Schema: {schema}. Write a query answering: {question}. Use CTEs, comment each step, and note any assumptions." },
      ],
    },

    aiModels: {
      heading: "Models",
      sub: "Every model enabled for your workspace, with cost and quality side-by-side.",
      stats: [
        { label: "Enabled models", value: 8, format: "number", icon: "cpu" },
        { label: "Avg. latency", value: 0.8, format: "seconds", icon: "pulse" },
        { label: "Cheapest / 1M tok", value: 0.12, format: "currency", icon: "wallet" },
      ],
      items: [
        { name: "Nova 3 Turbo", provider: "Tailkit", context: "128K", input: 0.40, output: 1.20, latency: "0.6s", quality: 92, status: "available", default: true },
        { name: "Nova 3 Pro", provider: "Tailkit", context: "256K", input: 1.50, output: 4.50, latency: "1.1s", quality: 97, status: "available", default: false },
        { name: "Helix 2 Mini", provider: "Helix", context: "32K", input: 0.12, output: 0.36, latency: "0.4s", quality: 84, status: "available", default: false },
        { name: "Helix 2 Max", provider: "Helix", context: "200K", input: 2.80, output: 8.40, latency: "1.6s", quality: 95, status: "beta", default: false },
        { name: "Mistral L", provider: "Mistral", context: "128K", input: 0.90, output: 2.70, latency: "0.9s", quality: 90, status: "available", default: false },
        { name: "Orion 1", provider: "Orion", context: "64K", input: 0.60, output: 1.80, latency: "0.7s", quality: 88, status: "available", default: false },
        { name: "Kappa Embed", provider: "Kappa", context: "8K", input: 0.02, output: 0.00, latency: "0.1s", quality: 90, status: "available", default: false },
        { name: "Nova 2", provider: "Tailkit", context: "32K", input: 0.30, output: 0.90, latency: "0.8s", quality: 85, status: "deprecated", default: false },
      ],
    },

    aiUsage: {
      heading: "Usage",
      sub: "Token consumption, cost and quota — updated hourly.",
      stats: [
        { label: "Tokens this month", value: 3412600, format: "compact", icon: "bolt" },
        { label: "API requests", value: 48210, format: "compact", icon: "pulse" },
        { label: "Est. cost", value: 1284.5, format: "currency", icon: "wallet" },
        { label: "Avg. latency", value: 0.8, format: "seconds", icon: "clock" },
      ],
      chart: {
        labels: ["Sep 1", "Sep 3", "Sep 5", "Sep 7", "Sep 9", "Sep 11", "Sep 13", "Sep 15", "Sep 17", "Sep 19", "Sep 21", "Sep 23", "Sep 25", "Sep 27"],
        series: [62, 74, 71, 88, 95, 91, 110, 104, 118, 126, 119, 134, 141, 152],
      },
      perModel: [
        { model: "Nova 3 Turbo", tokens: 1820000, requests: 24100, cost: 612.4, share: 53 },
        { model: "Nova 3 Pro", tokens: 840000, requests: 11200, cost: 428.6, share: 25 },
        { model: "Helix 2 Mini", tokens: 430000, requests: 9800, cost: 128.9, share: 13 },
        { model: "Mistral L", tokens: 210000, requests: 2600, cost: 86.2, share: 6 },
        { model: "Kappa Embed", tokens: 112600, requests: 510, cost: 28.4, share: 3 },
      ],
      quota: { plan: "Growth", used: 3412600, limit: 5000000, resetsIn: 6 },
    },

    aiKeys: {
      heading: "API keys",
      sub: "Programmatic access to every enabled model. Rotate freely.",
      items: [
        { id: "k1", name: "Production backend", prefix: "tk_live_9f2K", created: "2025-06-02", lastUsed: "2m ago", scopes: ["chat", "embed"], status: "active" },
        { id: "k2", name: "Staging", prefix: "tk_test_4xQa", created: "2025-06-02", lastUsed: "1d ago", scopes: ["chat"], status: "active" },
        { id: "k3", name: "Zapier integration", prefix: "tk_live_m8Rt", created: "2025-07-19", lastUsed: "3h ago", scopes: ["chat", "agents"], status: "active" },
        { id: "k4", name: "Old mobile app", prefix: "tk_live_77dd", created: "2025-03-14", lastUsed: "—", scopes: ["chat"], status: "revoked" },
      ],
      scopes: ["chat", "embed", "agents", "files"],
    },

    aiMembers: {
      heading: "Members",
      sub: "Who can use the suite, and with which permissions.",
      stats: [
        { label: "Seats used", value: 8, format: "number", icon: "users" },
        { label: "Pending invites", value: 1, format: "number", icon: "mail" },
        { label: "Admins", value: 2, format: "number", icon: "shield" },
      ],
      roles: ["Admin", "Member", "Viewer"],
      items: [
        { name: "Maya Chen", email: "maya@dreamboard.io", role: "Owner", status: "active", lastActive: "Now" },
        { name: "Jonas Weber", email: "jonas@dreamboard.io", role: "Admin", status: "active", lastActive: "12m ago" },
        { name: "Priya Nair", email: "priya@dreamboard.io", role: "Admin", status: "active", lastActive: "1h ago" },
        { name: "Tom Okafor", email: "tom@dreamboard.io", role: "Member", status: "active", lastActive: "3h ago" },
        { name: "Sofia Ricci", email: "sofia@dreamboard.io", role: "Member", status: "active", lastActive: "Yesterday" },
        { name: "Leo Park", email: "leo@dreamboard.io", role: "Member", status: "active", lastActive: "Mon" },
        { name: "Ana Duarte", email: "ana@dreamboard.io", role: "Viewer", status: "active", lastActive: "Fri" },
        { name: "Ben Holm", email: "ben@client.co", role: "Member", status: "invited", lastActive: "—" },
      ],
    },
    explorer: {
      heading: "Component explorer",
      sub: "Every partial rendered in isolation — copy the include snippet and drop it into your own page.",
    },
  },

  /* Component explorer + showcase data (explorer.html) */
  ui: {
    tabs: [
      {
        id: "account",
        label: "Account",
        heading: "Account settings",
        body: "Manage your public profile, display name, and contact details. Changes here are visible to other members of your workspace.",
      },
      {
        id: "notifications",
        label: "Notifications",
        heading: "Notification preferences",
        body: "Choose which events trigger an email or in-app alert. Digest mode bundles non-urgent updates into a single daily message.",
      },
      {
        id: "billing",
        label: "Billing",
        heading: "Billing & invoices",
        body: "Update payment methods, download past invoices, and manage your subscription tier from one place.",
      },
    ],
    alerts: [
      { variant: "info", title: "Heads up", body: "A new version of the UI kit is available to download." },
      { variant: "success", title: "Payment received", body: "Invoice #INV-2041 was paid in full." },
      { variant: "warning", title: "Storage almost full", body: "You have used 92% of your asset storage quota." },
      { variant: "danger", title: "Deployment failed", body: "Build #1847 exited with code 1. View logs for details." },
    ],
    badges: [
      { label: "Default", variant: "default" },
      { label: "Primary", variant: "primary" },
      { label: "Success", variant: "success" },
      { label: "Warning", variant: "warning" },
      { label: "Danger", variant: "danger" },
    ],
    // Accent presets — `key` maps to <html data-accent="…"> blocks in
    // packages/tailwind-config/theme.css; `hex` (the 500 shade) paints swatches.
    accents: [
      { key: "indigo", label: "Indigo (default)", hex: "#465fff" },
      { key: "blue", label: "Blue", hex: "#3b82f6" },
      { key: "emerald", label: "Emerald", hex: "#10b981" },
      { key: "violet", label: "Violet", hex: "#8b5cf6" },
      { key: "rose", label: "Rose", hex: "#f43f5e" },
      { key: "amber", label: "Amber", hex: "#f59e0b" },
    ],
    /* Seed chips for the tags-input demo. */
    tagSeed: ["Design", "Research", "Sprint 3"],
    /* Tooltip demos for the components showcase. */
    tooltipDemos: [
      { key: "top", label: "Hover me", tip: "Saved automatically every 30 seconds", pos: "top" },
      { key: "bottom", label: "Focus me", tip: "Press Enter to apply changes", pos: "bottom" },
    ],
    toastDemos: [
      { variant: "success", title: "Report generated", body: "Your export is ready to download." },
      { variant: "info", title: "Sync complete", body: "All integrations are up to date." },
      { variant: "warning", title: "Storage almost full", body: "You have used 92% of your asset quota." },
      { variant: "danger", title: "Payment failed", body: "Card ending in 4242 was declined. Update billing." },
    ],
    plans: ["Starter", "Growth", "Enterprise"],

    /* Component explorer (explorer.html) — one entry per showcased
       component. `cat` groups cards under section headings on the page;
       `file`/`snippet`/`binds` render verbatim (code samples); `label`
       and `cat` go through $t(). Card scopes pull their fixture from
       explorerFixtures by key. */
    explorer: [
      /* Actions */
      { id: "buttons", cat: "Actions", label: "Buttons", file: "src/css/main.css (.btn*)",
        snippet: "<button class=\"btn btn-primary\">…</button>",
        binds: "Component classes, not a partial — .btn + variant (.btn-primary/.btn-secondary/.btn-ghost/.btn-danger). Icon-only buttons need aria-label." },
      { id: "menus", cat: "Actions", label: "Menus", file: "src/js/app.js — Alpine.data(\"dropdown\")",
        snippet: "<div x-data=\"dropdown\"> trigger + role=\"menu\" …",
        binds: "APG menu pattern — ArrowDown opens to first item, Escape refocuses the trigger, click-outside closes. Items use .menu-panel/.menu-item." },
      { id: "context", cat: "Actions", label: "Context menu", file: "pattern — x-on:contextmenu",
        snippet: "@contextmenu.prevent=\"ctx = { x, y }\" + fixed role=\"menu\"",
        binds: "Position from event coords; menu closes on click-outside/scroll/Escape; arrows navigate ($focus.wrap). Focus moves into the menu on open." },
      /* Forms */
      { id: "forms", cat: "Forms", label: "Form elements", file: "src/css/main.css (.input, .check, .range)",
        snippet: "<input class=\"input\"> / .check checkbox / role=\"switch\"",
        binds: "Native inputs styled via .input/.range; the custom checkbox pairs a sr-only input with a .check box (peer-checked). Switch needs role=\"switch\" + aria-checked." },
      { id: "adv-inputs", cat: "Forms", label: "Advanced inputs", file: "src/js/app.js — select / datePicker / tagsInput / dropzone",
        snippet: "x-data=\"select(options)\" · \"datePicker\" · \"tagsInput(seed)\" · \"dropzone\"",
        binds: "Four Alpine.data factories: listbox select (aria-activedescendant), APG date-picker grid, chip input (Enter/comma commit), drag-drop zone with live file list." },
      /* Feedback */
      { id: "alerts", cat: "Feedback", label: "Alerts", file: "src/js/app.js — alertVariant()",
        snippet: "<div role=\"alert\" :class=\"alertVariant(a.variant).cls\">…",
        binds: "Variant map (success|info|warning|danger) supplies border/text/icon classes + icon key. Items render role=\"alert\"." },
      { id: "toasts", cat: "Feedback", label: "Toasts", file: "src/components/toasts.html",
        snippet: "$store.toasts.push({ title, body, variant, ttl })",
        binds: "Global store — push from anywhere; the stack itself lives in the base layout (role=\"log\", auto-dismiss)." },
      { id: "skeletons", cat: "Feedback", label: "Skeletons", file: "pattern — .animate-pulse placeholders",
        snippet: "<div class=\"h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700\">",
        binds: "Pure markup — aria-hidden placeholder shapes paired with a role=\"status\" announcement while real content loads." },
      { id: "empty", cat: "Feedback", label: "Empty state", file: "src/components/table-empty.html",
        snippet: "{{> components/table-empty}}",
        binds: "Renders the empty <tbody> row inside a paginated() scope — shows when `items` is empty." },
      { id: "tooltips", cat: "Feedback", label: "Tooltips", file: "src/js/app.js — Alpine.data(\"tooltip\")",
        snippet: "<span x-data=\"tooltip\" x-id=\"['tip']\"> trigger + role=\"tooltip\"",
        binds: "aria-describedby links trigger and tip; opens on hover + focus, Escape closes; position via t.pos (top|bottom)." },
      /* Overlays */
      { id: "modal", cat: "Overlays", label: "Modal", file: "src/components/modal.html",
        snippet: "{{> components/modal}}",
        binds: "Self-contained (x-data=\"modal\"). ARIA dialog, focus trap, Escape, focus return. Destructive-confirm variant included below." },
      { id: "drawer", cat: "Overlays", label: "Drawer", file: "src/components/drawer.html",
        snippet: "{{> components/drawer}}",
        binds: "Self-contained — same a11y contract as modal, right-anchored slide-over." },
      /* Data display */
      { id: "statcard", cat: "Data display", label: "Stat card", file: "src/components/statcard.html",
        snippet: "{{> components/statcard}}",
        binds: "Binds `s` — { label, value, format, delta, deltaDir, deltaLabel, icon, spark[] }. Use inside x-for or provide `s` in scope." },
      { id: "ministat", cat: "Data display", label: "Mini stat", file: "src/components/ministat.html",
        snippet: "{{> components/ministat}}",
        binds: "Binds `s` — { label, value, format?, icon }. Compact KPI strip item." },
      { id: "badges", cat: "Data display", label: "Badges", file: "src/js/app.js — badge() / statusVariant()",
        snippet: "<span :class=\"badge(statusVariant(row.status))\">…",
        binds: "badge(variant) → pill classes; statusVariant(status) maps record status enums → variants. Both are scope helpers." },
      { id: "avatars", cat: "Data display", label: "Avatars", file: "src/css/main.css (.avatar) + initials()",
        snippet: "<span class=\"avatar size-10\" x-text=\"initials(n)\">",
        binds: ".avatar circle + initials(name) helper; sizes via size-*, stacked groups via -space-x + ring." },
      { id: "tabs", cat: "Data display", label: "Tabs", file: "src/js/app.js — Alpine.data(\"tabs\")",
        snippet: "x-data=\"tabs\" + role=\"tablist\"/\"tab\"/\"tabpanel\"",
        binds: "APG tabs — roving tabindex, arrow keys, aria-selected/aria-controls linkage; panels bind isActive(i)." },
      { id: "accordion", cat: "Data display", label: "Accordion", file: "src/js/app.js — Alpine.data(\"accordion\")",
        snippet: "x-data=\"accordion()\" + aria-expanded panels",
        binds: "Disclosure group — button per item (aria-expanded/aria-controls), region panels, arrow-key support via onKeydown." },
      { id: "timeline", cat: "Data display", label: "Timeline", file: "src/components/timeline-list.html",
        snippet: "{{> components/timeline-list}}",
        binds: "Binds `items` — [{ title, body, time, variant }]; variant: primary|success|warning|danger." },
      { id: "breadcrumbs", cat: "Data display", label: "Breadcrumbs", file: "src/components/breadcrumbs.html",
        snippet: "{{> components/breadcrumbs}}",
        binds: "Binds `crumbs` — [{ label, href? }]; last item renders as current page." },
      { id: "table", cat: "Data display", label: "Table toolkit", file: "src/components/table-search.html + th-sort + check-all + pagination",
        snippet: "{{> components/table-search}} … {{> components/pagination}}",
        binds: "Include inside x-data=\"paginated(itemsFn, perPage)\". th-sort needs a `cols` array; check-all/row-check carry .sticky-col." },
      /* Charts */
      { id: "chart-card", cat: "Charts", label: "Chart card", file: "src/components/chart-card.html",
        snippet: "{{> components/chart-card}}",
        binds: "Binds `c` — chart spec { key, title, sub, type, labels, series }. Apex options come from apexSpec(); the sr-only table mirrors the data." },
      { id: "world-map", cat: "Charts", label: "World map", file: "src/components/world-map.html",
        snippet: "{{> components/world-map}}",
        binds: "Scope: { countries: [{ name, code, lon, lat, users, share }], mapLimit, ...worldMapView() }." },
      /* Layout */
      { id: "page-heading", cat: "Layout", label: "Page heading", file: "src/components/page-heading.html",
        snippet: "{{@var phH \"d.pages.x.heading\"}} + {{> components/page-heading}}",
        binds: "Build-time contract — phH/phS are Alpine expressions declared as page vars." },
    ],
    /* Category order on explorer.html — labels are $t msgids. */
    explorerCats: ["Actions", "Forms", "Feedback", "Overlays", "Data display", "Charts", "Layout"],
    /* Fixtures for the explorer previews — keyed by scope variable. */
    explorerFixtures: {
      stat: { id: "rev", label: "Monthly revenue", value: 48210, format: "currency",
        delta: "+12.4%", deltaDir: "up", deltaLabel: "vs last month",
        icon: "revenue", spark: [12, 18, 14, 22, 19, 28, 24, 32, 29, 38] },
      mini: { label: "Active users", value: 1284, format: "number", icon: "users" },
      chart: {
        key: "explorer-area", type: "area", title: "Weekly signups",
        sub: "Fixture spec — swap c.* for your own data.",
        labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
        series: [
          { name: "Signups", data: [42, 55, 48, 66, 61, 78, 84, 92] },
          { name: "Activations", data: [18, 24, 21, 30, 28, 36, 41, 47] },
        ],
      },
      countries: [
        { name: "United States", code: "US", lon: -98.5, lat: 39.5, users: 41240, share: 34 },
        { name: "Germany", code: "DE", lon: 10.4, lat: 51.1, users: 22130, share: 18 },
        { name: "United Kingdom", code: "GB", lon: -2.5, lat: 54.0, users: 17690, share: 15 },
        { name: "India", code: "IN", lon: 78.0, lat: 21.0, users: 14740, share: 12 },
        { name: "Brazil", code: "BR", lon: -52.9, lat: -10.8, users: 11790, share: 10 },
      ],
      timeline: [
        { title: "Project kicked off", body: "Kickoff call with all stakeholders", time: "Sep 9", variant: "primary" },
        { title: "Design approved", body: "Final mockups signed off by the client", time: "Sep 12", variant: "success" },
        { title: "Sprint 3 started", body: "Focus: dashboard widgets and data layer", time: "Sep 15", variant: "warning" },
        { title: "Beta release", body: "Internal build shared with the QA team", time: "Sep 22", variant: "danger" },
      ],
      crumbs: [
        { label: "Dashboard", href: "index.html" },
        { label: "Components" },
      ],
      cols: [
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "status", label: "Status", sort: false },
      ],
      rows: [
        { id: "u1", name: "Maya Chen", role: "Admin", status: "active" },
        { id: "u2", name: "Jonas Weber", role: "Editor", status: "active" },
        { id: "u3", name: "Sara Lind", role: "Viewer", status: "invited" },
        { id: "u4", name: "Tom Berger", role: "Editor", status: "active" },
        { id: "u5", name: "Lisa Park", role: "Viewer", status: "disabled" },
        { id: "u6", name: "Omar Aziz", role: "Admin", status: "active" },
        { id: "u7", name: "Nina Roth", role: "Editor", status: "invited" },
      ],
    },
  },

  /* AI Suite quota shown in the sidebar footer. */
  ai: {
    quota: { plan: "Growth", used: 3412600, limit: 5000000, usedPct: 68, resetsIn: 6 },
  },
};

/* Signals the layout that data is ready — the UI bootstrap runs only after
   this fires. The API swap keeps this exact contract:

     fetch("/api/bootstrap")
       .then((r) => r.json())
       .then((data) => {
         window.mockData = data;
         window.dispatchEvent(new Event("mockdata:ready"));
       });
*/
window.dispatchEvent(new Event("mockdata:ready"));
