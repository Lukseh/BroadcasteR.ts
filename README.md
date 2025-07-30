# 📡 BroadcasteR.ts

A modern TypeScript-based broadcasting overlay system for Counter-Strike 2 (CS2) with real-time Game State Integration (GSI), Twitch integration, and dynamic player statistics display.

**IN FUTURE WP SUPPORT**

![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![CS2](https://img.shields.io/badge/CS2-GSI-orange.svg)

## ✨ Features

- 🎮 **Real-time CS2 Integration** - Live game state data via GSI
- 📊 **Dynamic Player Stats** - Health, money, weapons, K/D, ADR, HS%
- 💥 **Visual Effects** - Damage flashing, bomb states, team switching
- 🎬 **Twitch Integration** - Embedded player and chat
- 🔧 **Multi-Instance Support** - Multiple broadcast configurations
- 🎨 **Modern UI** - Responsive design with smooth animations
- 🔄 **Hot Reload** - Real-time updates without refresh
- 📱 **Mobile Friendly** - Works on various screen sizes

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Counter-Strike 2** with GSI enabled
- **Twitch account** (for stream integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Lukseh/BroadcasteR.ts.git
   cd BroadcasteR.ts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure instances**
   ```bash
   cp instances.json5.example instances.json5
   # Edit instances.json5 with your broadcast settings
   ```

4. **Compile TypeScript**
   ```bash
   npm run comp
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Access your broadcast**
   - Main dashboard: `http://localhost:8740`
   - Broadcast page: `http://localhost:8740/broadcast/your-instance-id`

## ⚙️ Configuration

### Instance Configuration

Create `instances.json5` with your broadcast settings:

```json5
{
  instances: [
    {
      id: "main-tournament",
      url: "/main-tournament",
      page_title: "Tournament Stream",
      page_name: "Main Event",
      twitch_channel: "your_twitch_channel",
      delay_ms: 10000
    }
  ]
}
```

### CS2 Game State Integration

1. **Create GSI configuration file**
   
   Create file: `Counter-Strike Global Offensive/game/csgo/cfg/gamestate_integration_broadcaster.cfg`
   
   ```cfg
   "BroadcasteR GSI"
   {
     "uri"               "http://localhost:8740/gsi/your-instance-id"
     "timeout"           "5.0"
     "buffer"            "0.1"
     "throttle"          "0.5"
     "heartbeat"         "30.0"
     "auth"
     {
       "token"           "super-secret-key"
     }
     "data"
     {
       "provider"        "1"
       "map"             "1"
       "round"           "1"
       "player_id"       "1"
       "player_state"    "1"
       "player_weapons"  "1"
       "player_match_stats" "1"
       "allplayers_id"   "1"
       "allplayers_state" "1"
       "allplayers_match_stats" "1"
       "allplayers_weapons" "1"
       "bomb"            "1"
     }
   }
   ```

2. **Restart CS2** to load the configuration

### Environment Variables

Optional environment configuration:

```bash
PORT=8740                    # Server port
BASE_PATH=/broadcast        # Base URL path
AUTH_KEY=super-secret-key   # GSI authentication key
PAGE_TITLE=BroadcasteR.ts   # Main page title
```

## 🎯 Usage

### Development Mode

For development with demo data:

```bash
# Start server
npm start

# In another terminal, run demo data
npm run demo
```

### Production Deployment

1. **Build the project**
   ```bash
   npm run comp
   ```

2. **Start with process manager**
   ```bash
   pm2 start dist/index.js --name "broadcaster"
   ```

3. **Set up reverse proxy** (nginx example)
   ```nginx
   location /broadcast {
     proxy_pass http://localhost:8740;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection 'upgrade';
     proxy_set_header Host $host;
     proxy_cache_bypass $http_upgrade;
   }
   ```

## 📁 Project Structure

```
BroadcasteR.ts/
├── assets/                    # Static assets
│   ├── scripts/broadcast/    # Modular JavaScript
│   ├── weapons/              # Weapon icons
│   └── style.css            # Main stylesheet
├── src/                      # TypeScript source
│   ├── index.ts             # Main server
│   ├── renderer.ts          # HTML generation
│   └── types.ts             # Type definitions
├── dist/                     # Compiled output
├── instances.json5          # Instance configuration
└── package.json             # Dependencies
```

## 🛠️ Development

### Available Scripts

- `npm run comp` - Compile TypeScript
- `npm start` - Start the server
- `npm run demo` - Run demo data generator
- `npm run dev` - Development mode with watch

### Module Structure

The broadcast frontend is modular:

- **nav.js** - Navigation and instance switching
- **twitch.js** - Twitch player/chat integration
- **players.js** - Player cards and animations
- **score.js** - Scoreboard and bomb effects
- **polling.js** - GSI data fetching
- **broadcast.js** - Main coordinator

## 🎨 Customization

### Styling

Edit `assets/style.css` for visual customization:

- Team colors
- Player card layouts
- Animation effects
- Responsive breakpoints

### Adding Features

1. Create new modules in `assets/scripts/broadcast/`
2. Import in `broadcast.js`
3. Add TypeScript types in `types.ts`
4. Update renderer in `renderer.ts`

## 🔧 Troubleshooting

### Common Issues

**GSI not working:**
- Check CS2 GSI config file path
- Verify auth key matches
- Ensure CS2 is running
- Check firewall settings

**Players not showing:**
- Verify GSI data contains `allplayers`
- Check console for steamid issues
- Ensure game is in progress

**Twitch not loading:**
- Check channel name spelling
- Verify parent domain settings
- Check browser security settings

### Debug Mode

Enable detailed logging:
```bash
DEBUG=broadcaster:* npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Counter-Strike 2 community for GSI documentation
- Twitch for embed APIs
- TypeScript and Node.js communities

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/Lukseh/BroadcasteR.ts/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Lukseh/BroadcasteR.ts/discussions)
- 🌐 **Website**: [lukseh.org](https://lukseh.org)

---

Made with ❤️ by [Lukseh](https://github.com/Lukseh)
