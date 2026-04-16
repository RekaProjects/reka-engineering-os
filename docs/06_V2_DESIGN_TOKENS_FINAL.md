# V2 Design Tokens Final — ReKa Engineering OS

## Core palette
- Carbon Black: `#1D1F1E`
- Porcelain: `#FFFDF7`
- Dark Wine: `#851E1E`
- Twilight Indigo: `#142D50`
- Graphite: `#454040`
- Parchment: `#F4F3EE`

## Product design goals
- Premium internal product UI
- Enterprise-grade feel
- Calm, professional, serious, modern
- Desktop-first
- Table-first
- Strong visual hierarchy
- Excellent readability and scanning
- No gradients
- No glassmorphism
- No decorative gimmicks

## Color usage rules
- Twilight Indigo is the **primary action and navigation accent**
- Dark Wine is a **limited secondary accent** for urgent, revision, critical, and destructive states
- Carbon Black and Graphite are for text, structure, and dark surfaces
- Porcelain and Parchment are for backgrounds and cards
- Keep the interface mostly neutral, with accent colors used sparingly
- Do not oversaturate the UI with red or blue

## Base tokens
### Backgrounds
- app background: `#F4F3EE`
- card/surface: `#FFFDF7`
- surface alt: `#F8F7F2`
- surface muted: `#F1EFE8`

### Text
- text primary: `#1D1F1E`
- text secondary: `#454040`
- text muted: `#6A6666`
- text inverse: `#FFFDF7`

### Borders
- border subtle: `#DAD6CC`
- border strong: `#C9C3B7`

### Sidebar
- sidebar bg: `#1D1F1E`
- sidebar hover: `#2A2C2B`
- sidebar text: `#F4F3EE`
- sidebar text muted: `#CFCBC3`
- sidebar active bg: `rgba(20, 45, 80, 0.18)`

### Brand
- primary: `#142D50`
- primary hover: `#102440`
- primary soft: `#E8EEF8`
- primary foreground: `#FFFDF7`

### Critical / destructive
- accent critical: `#851E1E`
- accent critical hover: `#6F1717`
- accent critical soft: `#F8E9E8`
- accent critical foreground: `#FFFDF7`

### Semantic support
- success: `#166534`
- success soft: `#ECFDF3`
- warning: `#B45309`
- warning soft: `#FFFBEB`
- info: `#142D50`
- info soft: `#E8EEF8`
- danger: `#851E1E`
- danger soft: `#F8E9E8`

## CSS variables
```css
:root {
  --background: #F4F3EE;
  --surface: #FFFDF7;
  --surface-alt: #F8F7F2;
  --surface-muted: #F1EFE8;

  --text-primary: #1D1F1E;
  --text-secondary: #454040;
  --text-muted: #6A6666;
  --text-inverse: #FFFDF7;

  --border: #DAD6CC;
  --border-strong: #C9C3B7;

  --sidebar-bg: #1D1F1E;
  --sidebar-hover: #2A2C2B;
  --sidebar-text: #F4F3EE;
  --sidebar-text-muted: #CFCBC3;
  --sidebar-active-bg: rgba(20, 45, 80, 0.18);

  --primary: #142D50;
  --primary-hover: #102440;
  --primary-soft: #E8EEF8;
  --primary-foreground: #FFFDF7;

  --accent-critical: #851E1E;
  --accent-critical-hover: #6F1717;
  --accent-critical-soft: #F8E9E8;
  --accent-critical-foreground: #FFFDF7;

  --success: #166534;
  --success-soft: #ECFDF3;
  --warning: #B45309;
  --warning-soft: #FFFBEB;
  --info: #142D50;
  --info-soft: #E8EEF8;
  --danger: #851E1E;
  --danger-soft: #F8E9E8;

  --shadow-sm: 0 1px 2px rgba(29, 31, 30, 0.05);
  --shadow-md: 0 8px 24px rgba(29, 31, 30, 0.08);

  --radius-card: 16px;
  --radius-control: 12px;
  --radius-pill: 999px;

  --font-sans: "Inter", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
}
```

## Typography
- Primary font: **Inter**
- Optional mono: **IBM Plex Mono**
- Page title: `24 / 32` semibold
- Section title: `18 / 28` semibold
- Card title: `16 / 24` medium
- Body text: `14 / 22`
- Table text: `13–14 / 20`
- Meta/helper text: `12 / 18`

## Layout / spacing
- Sidebar width: `256–272px`
- Main horizontal padding: `24–32px`
- Card padding: `20px`
- Section gap: `24px`
- Card radius: `16px`
- Input/button radius: `12px`

## Component usage rules
### Buttons
- Primary button = Twilight Indigo
- Secondary button = neutral surface + border
- Danger button = Dark Wine

### Cards
- Use Porcelain surfaces
- Soft borders
- Soft shadow only

### Tables
- Header bg = surface alt
- Row hover = surface muted
- Keep clear hierarchy for status / due date / priority / assignee

### Badges
- Neutral = muted neutral
- Info/active = primary soft + primary
- Warning = warning soft + warning
- Danger/revision = danger soft + danger
- Success = success soft + success

## Charts
Use only lightweight, purposeful charts.
- primary series: Twilight Indigo
- secondary series: Graphite
- critical series: Dark Wine
- no rainbow charts
- no decorative donut overload
- no glow / 3D / gimmicks

## UX rules
- Desktop-first
- Table-first for operational modules
- One primary action per area
- Strong hierarchy: page title > section title > card title > labels > helper text
- Forms must be grouped into clear sections
- Empty states must be actionable
- Owner/admin pages should feel full-control
- Member/freelancer pages should feel focused and simpler
- Avoid visual clutter
