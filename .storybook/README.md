# Storybook Documentation

This Storybook instance provides interactive documentation for all UI components in the Smart Home Dashboard.

## 🚀 Running Storybook

### Development Mode
```bash
npm run storybook
```

This will start Storybook on `http://localhost:6006`

### Build Static Storybook
```bash
npm run build-storybook
```

This generates a static site in the `storybook-static` directory that can be deployed.

## 📚 Component Categories

### UI Components (`src/components/ui/`)
- **Button**: Various button styles (default, primary, outline, ghost)
- **Slider**: Interactive range input with customizable range
- **Input**: Form input fields
- **Select**: Dropdown selection components
- **Dialog**: Modal dialogs and overlays
- **Tabs**: Tabbed navigation component
- **Tooltip**: Hover tooltips for additional information

### Feature Components

#### Lighting (`src/features/lighting/components/`)
- **LightControlCard**: Individual light control with intensity slider, loading states, and hover interactions

#### Climate (`src/features/climate/components/`)
- **ClimateIndicator**: Real-time climate data display with circular progress rings and dynamic color-coding based on values

### Layout Components (`src/components/`)
- **ErrorBoundary**: Error handling component with fallback UI
- **ConnectionStatusIndicator**: Home Assistant connection status display
- **RoomInfoPanel**: Main control panel integrating climate and lighting controls

## 🎨 Design Tokens

The Storybook is configured with the project's design system:
- **Background**: Dark theme (`hsl(28 20% 18%)`)
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Color System**: CSS variables for semantic colors
- **Typography**: Cormorant Garamond (display) + Inter (body)
- **Spacing**: Consistent spacing scale
- **Border Radius**: Rounded corners with 8px/12px radius

## 🧪 Testing with Storybook

### Visual Testing
Storybook stories serve as visual regression tests. Each story represents a specific state or variation of a component.

### Interaction Testing
Stories can include `play` functions for automated interaction testing using `@storybook/test`.

### Accessibility Testing
Use the Accessibility addon (included) to check for a11y issues.

## 📖 Writing Stories

### Basic Story Template
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Category/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    prop1: 'value1',
    prop2: 'value2',
  },
};
```

### With Decorators
```tsx
decorators: [
  (Story) => (
    <div className="p-6 bg-background">
      <Story />
    </div>
  ),
],
```

### With Controls
```tsx
argTypes: {
  variant: {
    control: 'select',
    options: ['default', 'primary', 'outline'],
  },
  size: {
    control: { type: 'number', min: 0, max: 100 },
  },
},
```

## 🔧 Configuration

### Main Configuration (`.storybook/main.ts`)
- **Framework**: React + Vite
- **Addons**: Essentials, Interactions, Links, Themes
- **Path Aliases**: `@/` resolves to `src/`
- **Auto-docs**: Enabled for all stories

### Preview Configuration (`.storybook/preview.tsx`)
- **Global Styles**: Imports `src/index.css`
- **Theme Decorator**: Dark/Light theme switching
- **Default Background**: Dark theme
- **Controls Matchers**: Color and date matching

## 📦 Addons

### Included Addons
- **@storybook/addon-essentials**: Controls, Actions, Viewport, Backgrounds, Toolbars, Measure, Outline
- **@storybook/addon-interactions**: Interaction testing
- **@storybook/addon-links**: Link between stories
- **@storybook/addon-themes**: Theme switching support

### Using Addons
Addons provide additional panels and tools in the Storybook UI:
- **Controls**: Modify props dynamically
- **Actions**: Log event handlers
- **Viewport**: Test responsive design
- **Accessibility**: Check a11y compliance
- **Backgrounds**: Test on different backgrounds

## 🎯 Best Practices

### Story Naming
- Use descriptive names: `Default`, `WithIcon`, `Loading`, `Error`
- Group related states: `Off`, `PartiallyOn`, `FullyOn`
- Include edge cases: `Empty`, `MaxLength`, `Disabled`

### Props
- Use `args` for reusable prop values
- Use `argTypes` for controls and documentation
- Provide default values that make sense

### Documentation
- Use JSDoc comments in component files
- Add descriptions in `argTypes`
- Create MDX files for complex documentation

### Organization
- Group by feature/domain: `Features/Lighting/LightControlCard`
- Keep UI primitives separate: `UI/Button`
- Use consistent naming conventions

## 🚢 Deployment

### GitHub Pages
Add to `.github/workflows/storybook.yml`:
```yaml
- name: Build Storybook
  run: npm run build-storybook
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./storybook-static
```

### Chromatic (Visual Regression)
```bash
npm install --save-dev chromatic
npx chromatic --project-token=<your-token>
```

## 🔗 Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Component Story Format (CSF)](https://storybook.js.org/docs/react/api/csf)
- [Writing Stories](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Addons](https://storybook.js.org/docs/react/configure/storybook-addons)

---

**Built with Storybook 8.0**
