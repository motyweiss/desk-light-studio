# Smart Home Dashboard

A modern, responsive smart home control interface with Home Assistant integration.

## 🏗️ Architecture

Clean, feature-based architecture with clear separation of concerns:

```
src/
├── api/homeAssistant/      # External API layer
├── features/               # Isolated feature modules
├── shared/                 # Reusable hooks & utilities
├── components/             # UI components
└── pages/                  # Route pages
```

## 🚀 Features

- **Smart Lighting**: Real-time intensity control with visual hotspots
- **Climate Monitoring**: Temperature, humidity, air quality tracking
- **Media Player**: Spotify + Sonos with speaker groups
- **Optimistic Updates**: Instant UI feedback
- **WebSocket Sync**: Real-time multi-device coordination

## 🛠️ Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + Framer Motion
- Home Assistant REST + WebSocket
- Radix UI primitives

## 📚 Documentation

See [REFACTORING.md](./REFACTORING.md) for complete architecture documentation.

## 🔧 Setup

### CORS Configuration
Add to Home Assistant `configuration.yaml`:

```yaml
http:
  cors_allowed_origins:
    - https://lovableproject.com
    - https://[your-project-id].lovableproject.com
```

### Development

```bash
npm install
npm run dev
```

### Configuration
1. Click settings icon (⚙️)
2. Enter HA URL and access token
3. Test connection
4. Configure entity mappings

## 📖 Learn More

- [Home Assistant](https://www.home-assistant.io/)
- [Lovable](https://lovable.dev/)
- [Project Documentation](./REFACTORING.md)

---

Built with [Lovable](https://lovable.dev) 💚
