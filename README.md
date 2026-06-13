# UniSphere: Smart Campus Management System

UniSphere is a modern, enterprise-grade web application designed to streamline campus management. It features facility/resource bookings, campus incident management (ticketing), real-time notifications, and modular security controls.

---

## 🛠️ Languages & Tools Used

### Languages
- **Java (v21)**: Core backend programming language.
- **JavaScript / JSX**: Frontend client logic and component views.
- **SQL**: Database schemas, relations, and optimized queries.
- **HTML5 & CSS3**: Document structure and layout styling.

### Tools & Frameworks
- **Spring Boot (v3.5.15)**: Backend microservice framework.
- **React (v19)**: Frontend component-based library.
- **Vite (v8)**: Modern frontend build tool and hot module replacement server.
- **Tailwind CSS (v4)**: Modern CSS utility-first framework for UI layouts.
- **Zustand (v5)**: Clean, lightweight state management for React.
- **Maven**: Project builder, dependency manager, and testing runner.
- **MySQL Database**: High-performance relational database storage.
- **WebSockets (STOMP/SockJS)**: Real-time full-duplex communication protocols.
- **OpenAPI Swagger**: Interface for backend API endpoint documentation.
- **ESLint**: Linter for identifying Javascript and React syntax patterns.

---

## 🏛️ Component Spotlight: Campus Resource & Facility Management
The Resource/Facility component provides end-to-end control for listing, searching, creating, updating, and exporting campus assets (e.g., lecture halls, study labs, sports facilities, AV equipment, and vehicles).

### Backend Specifications
1. **Database Schema & Entity (`Resource`)**:
   - `name`: 2 to 100 character text constraint.
   - `type`: Category indicator (Halls, Computer Labs, Discussion Rooms, Sports Venues, Equipment, Vehicles).
   - `capacity`: Numeric validator (minimum capacity of 1).
   - `location`: Campus zone/building locator.
   - `status`: Dual state enum (`ACTIVE` or `OUT_OF_SERVICE`).
   - `availabilityStart` & `availabilityEnd`: Working hours check.
   - `description`: Text area block (up to 500 characters).
   - **Optimistic Locking (`@Version`)**: Version tracking to prevent concurrent writing overrides.
   - **Audit Trails**: Automates change logging via `@CreationTimestamp` and `@UpdateTimestamp`.
   - **Index Optimizations**: Configured database index keys (`idx_resource_type` and `idx_resource_status`) for high-speed search queries.

2. **API Endpoint Architecture (`ResourceController`)**:
   - `GET /api/resources`: Retrieves all registered campus facilities.
   - `GET /api/resources/{id}`: Detailed specifications of a single asset.
   - `GET /api/resources/search`: Query filters supporting `type`, `location`, `minCapacity`, and `status`.
   - `POST /api/resources`: Registers a new resource (restricted to `ADMIN` role).
   - `PUT /api/resources/{id}`: Updates existing attributes (restricted to `ADMIN` role).
   - `DELETE /api/resources/{id}`: Deletes an asset (restricted to `ADMIN` role).

### Frontend Specifications
1. **Interactive UI Layouts**:
   - **Hero Carousel Banner**: Dynamic sliding track showcasing spaces (Library, Auditoriums) with dot navigation.
   - **Dynamic KPI Panels**: Shows live counts of Total Assets, Active Resources, Maintenance queue, and Locations.
   - **FacilitiesSidebar**: Quick navigation bar filtering resources by location and types.
   - **Grid & List Views**: Fast rendering layout toggles with hover micro-animations.
   - **Type-Based Styling**: Automatic color-coded badge themes and SVG icon selectors based on resource categories.

2. **Admin Operations**:
   - **ResourceModal**: Handles validations for creating and editing resource details.
   - **Smart QR Tag Generator**: Generates and downloads asset identification tags featuring custom scanning visuals.
   - **Bulk Actions**: Select multiple table items to delete records in batches.
   - **CSV Data Exporter**: Instant download of all resource database listings formatted to standard CSV.

---

## 🚀 Key Project Features (Whole System)

### 1. High-Tech Command Console (Dashboard)
- **Glassmorphic Theme**: Tailored user dashboards styled with backdrop filters and pulsing badges.
- **Modules Telemetry**: Dynamic metrics monitoring active tickets, pending approvals, alerts, and ping latency.
- **Workflow Operations**: Quick actions allowing HODs/Admins to approve/reject bookings, technicians to manage incident states, and lecturers to cancel reservations.

### 2. Resource & Facility Booking
- **Conflict Validation**: Engine checks for date-time conflicts, stopping double-bookings of rooms.
- **Big Calendar**: Interactive calendar view charting events on monthly, weekly, or daily grids.
- **Role Workflow**: Integrates multi-role approval checks (`ADMIN`, `SUPER_ADMIN`, `HOD`, `FACILITY_MANAGER`).

### 3. Incident Management (Ticketing)
- **Incident Pipeline**: Creates, routes, and progresses tickets through states (`PENDING`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`).
- **Attachments & Comments**: Supports uploading files and adding comments within ticket details.

### 4. Real-time Notification Dispatcher
- Delivers system-wide instant alerts to users upon status transitions.

---

## ⚙️ Project Layout
```
├── backend/            # Spring Boot server application
│   ├── src/            # Java backend source code
│   ├── mvnw            # Maven wrapper script
│   └── pom.xml         # Maven project descriptor
├── frontend/           # Vite React client application
│   ├── src/            # UI components and hooks
│   ├── package.json    # Frontend dependency descriptor
│   └── tailwind.config.js
└── README.md
```

---

## 🏁 Running the Application

### 1. Backend Setup
1. Navigate to `/backend`.
2. Configure credentials in `src/main/resources/application-local.yml` or as environment variables (DB name, user, password, and Google OAuth2).
3. Start the Spring application:
   ```bash
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
   ```
   *Runs on port `8080`. API Docs: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)*

### 2. Frontend Setup
1. Navigate to `/frontend`.
2. Install dependencies & configure `.env.local` to point to port `8080`.
3. Launch development server:
   ```bash
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5174/`.*

### 3. Testing
```bash
# Backend tests
cd backend && ./mvnw test

# Frontend linting
cd frontend && npm run lint
```
