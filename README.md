# 🚑 AI-Powered Intelligent Ambulance Dispatch System

[![Status](https://img.shields.io/badge/status-in_development-orange)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Node](https://img.shields.io/badge/node-18.x-green)]()
[![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue)]()

> **Mission**: Save lives by eliminating the "Golden Hour" crisis in India's emergency medical services.

---

## 🎯 The Problem

Every year in India, thousands of preventable deaths occur not because of lack of medical facilities, but because patients don't reach the right hospital in time:

- ❌ **No unified dispatch** — 108, 102, 1099 operate in silos
- ❌ **Manual guesswork** — Outdated zone maps, no real-time GPS
- ❌ **Hospital blindness** — Ambulances rush to full ERs
- ❌ **Traffic chaos** — No smart corridor activation
- ❌ **Rural gap** — Tier 2/3 cities have zero structured EMS

---

## 💡 Our Solution

A comprehensive **AI-driven ambulance dispatch, routing, and hospital allocation platform** with:

### Core Capabilities

1. **Real-Time Optimal Dispatch Engine**
   - Live GPS tracking of all ambulances
   - Multi-factor selection (not just nearest)
   - Traffic-aware ETA calculation
   - Crew availability & equipment matching

2. **Dynamic Priority Routing**
   - OSRM-based route optimization
   - Recalculates every 30 seconds
   - Green corridor activation (signal preemption)
   - Instant rerouting for blockages

3. **Intelligent Hospital Auto-Allocation**
   - Multi-factor scoring (travel time + beds + specialists + urgency)
   - Real-time capacity tracking
   - Pre-arrival alerts to hospitals
   - Automatic reassignment if hospital rejects

4. **Predictive Fleet Positioning**
   - Hotspot analysis from historical data
   - Event-based surge prediction
   - Dynamic repositioning suggestions
   - Coverage gap identification

5. **Unified Multi-Network Dashboard**
   - Government (108/102) + private fleet integration
   - Live map with all emergencies & units
   - Dispatcher override with audit logging
   - Mass casualty incident workflows

6. **Citizen Emergency Interface**
   - One-tap emergency button
   - Auto GPS capture
   - Live ambulance tracking
   - Digital incident reports

7. **Rural & Low-Connectivity Mode**
   - SMS-based dispatch
   - USSD menu system (*108#)
   - Offline routing with cached maps
   - Cell tower triangulation

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────┐
│         Multi-Role Frontends                    │
│  Dispatcher │ Driver │ Citizen │ Admin │ Police│
└───────────────────────┬─────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────┐
│          API Gateway (Express.js)               │
│    Auth │ RBAC │ Rate Limiting │ WebSocket     │
└──┬────────────┬────────────┬───────────────────┘
   │            │            │
   │     ┌──────▼─────┐  ┌───▼─────────┐
   │     │  Routing   │  │  Hospital   │
   │     │  Service   │  │  Scoring    │
   │     │  (OSRM)    │  │  Engine     │
   │     └────────────┘  └─────────────┘
   │
┌──▼──────────────────────────────────────────────┐
│        Core Services (Node.js/Express)          │
│  Incidents │ Ambulances │ Hospitals │ Dispatch │
└──┬──────────────────────────────────────────────┘
   │
┌──▼──────────────────────────────────────────────┐
│     Data Layer (PostgreSQL + Redis)             │
│  Incidents │ Telemetry │ Assignments │ Audit   │
└─────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Node.js + Express.js
- PostgreSQL (with PostGIS)
- Redis (caching + real-time)
- OSRM (routing engine)
- Socket.io (WebSocket)

**Frontend:**
- React.js (Dispatcher Dashboard)
- React Native (Mobile Apps)
- Leaflet/Mapbox (Maps)
- Material-UI (Components)

**Infrastructure:**
- Docker + Docker Compose
- Nginx (Reverse Proxy)
- GitHub Actions (CI/CD)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 15.x
- Redis 7.x
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd ambulance-dispatch-system

# Install dependencies
cd backend/api
npm install

# Setup database
cd ../database
psql -U postgres -f schema.sql
psql -U postgres -d ambulance_dispatch -f seeds/dev_data.sql

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start services with Docker
docker-compose up -d

# Start backend API
cd backend/api
npm run dev

# Start dispatcher dashboard
cd frontend/dispatcher-dashboard
npm install
npm start
```

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

---

## 📊 API Documentation

### Core Endpoints

#### Authentication
```
POST   /api/auth/login          - Login
POST   /api/auth/register       - Register
POST   /api/auth/refresh-token  - Refresh token
```

#### Incidents
```
POST   /api/incidents           - Create emergency
GET    /api/incidents           - List incidents
GET    /api/incidents/:id       - Get incident details
PUT    /api/incidents/:id/status - Update status
```

#### Ambulances
```
GET    /api/ambulances          - List ambulances
GET    /api/ambulances/available - Available units
PUT    /api/ambulances/:id/location - Update GPS
GET    /api/ambulances/nearby   - Geospatial search
```

#### Hospitals
```
GET    /api/hospitals           - List hospitals
GET    /api/hospitals/nearby    - Search by location
PUT    /api/hospitals/:id/beds  - Update bed count
```

#### Assignments
```
POST   /api/assignments         - Create assignment
POST   /api/assignments/:id/accept - Driver accepts
PUT    /api/assignments/:id/hospital - Reassign hospital
```

#### Routing
```
POST   /api/routing/calculate   - Calculate route
POST   /api/routing/eta         - Get ETA
```

#### Traffic
```
POST   /api/traffic/corridor/activate - Green corridor
GET    /api/traffic/corridor/active   - Active corridors
```

Full API documentation available at: `/api/docs` (Swagger UI)

---

## 🔐 Security

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing (bcrypt)
- Token refresh mechanism
- Session management

### Roles & Permissions

| Role | Permissions |
|------|-------------|
| **CITIZEN** | Create incident, track own emergency |
| **DISPATCHER** | View all incidents, assign ambulances, override |
| **DRIVER** | View assignments, update location, update status |
| **HOSPITAL_STAFF** | Update bed availability, confirm arrivals |
| **ADMIN** | Full system access, user management |

### Data Protection

- End-to-end encryption for patient data
- Audit logging for all critical actions
- HIPAA compliance considerations
- Rate limiting to prevent abuse
- Input validation on all endpoints

---

## 📈 Monitoring & Analytics

### Key Metrics

- **Response Time**: Call to ambulance arrival
- **Dispatch Time**: Call to assignment
- **Hospital Match Accuracy**: Correct facility selection rate
- **Fleet Utilization**: Ambulance usage percentage
- **Coverage**: Geographic coverage analysis

### Dashboards

- **Dispatcher Dashboard**: Real-time operations
- **Analytics Dashboard**: Historical trends
- **Admin Dashboard**: System health & metrics

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## 📦 Deployment

### Production Deployment

```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec api npm run migrate

# Check health
curl http://localhost:3000/health
```

### Environment Variables

See `.env.example` for all required configuration.

Critical variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT signing
- `OSRM_URL` - OSRM routing service URL

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

## 🙏 Acknowledgments

Built from research and analysis of:
- qppd/ambulance-dispatch-management-system
- dhcsousa/hospitopt
- hackathon-NareshIT/liferoute-ai
- souravvoid/rapid-response-ems

Special thanks to the open-source community and emergency medical services professionals who provided insights.

---

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@ambulance-dispatch.example

---

## 🎯 Roadmap

### Phase 1: Foundation (Weeks 1-4) ✅ IN PROGRESS
- [x] Database schema
- [x] API gateway
- [x] Authentication
- [x] Incident management
- [x] Ambulance & hospital management

### Phase 2: Intelligent Routing (Weeks 5-8)
- [ ] OSRM integration
- [ ] Hospital scoring algorithm
- [ ] Dispatch assignment system

### Phase 3: Real-Time Coordination (Weeks 9-12)
- [ ] Driver mobile app
- [ ] Live GPS tracking
- [ ] Hospital pre-arrival alerts

### Phase 4: Advanced Features (Weeks 13-16)
- [ ] Green corridor activation
- [ ] Predictive analytics
- [ ] Traffic API integration

### Phase 5: Multi-Network (Weeks 17-20)
- [ ] Citizen mobile app
- [ ] Government EMS integration
- [ ] Multi-network dispatch

### Phase 6: Production Ready (Weeks 21-24)
- [ ] SMS/USSD fallback
- [ ] Load testing
- [ ] Security audit
- [ ] Disaster recovery

---

## 🌟 Impact

**Expected Outcomes:**
- 20-30% reduction in average response time
- Eliminate hospital overcrowding through smart allocation
- Extend structured EMS to rural India
- Save thousands of lives annually

---

**Built with ❤️ to make society better. Every second counts. 🚑**
