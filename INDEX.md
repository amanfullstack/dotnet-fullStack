# 🎓 .NET Full Stack Learning Projects

Complete learning projects demonstrating different technologies and patterns in the .NET ecosystem.

## 📁 Project Structure

Each project folder follows naming convention: `ProjectName-TechType`

```
dotnet-fullStack/
│
├── ProductCatalogAPI-WebAPI-EFCore/          ✅ READY
│   ├── Controllers/
│   ├── Services/
│   ├── Data/
│   ├── Models/
│   ├── Migrations/
│   ├── Program.cs
│   ├── README.md
│   ├── API_DOCUMENTATION.md
│   ├── LEARNING_GUIDE.md
│   ├── ProductCatalogAPI.http (test requests)
│   └── ProductCatalogAPI.csproj
│
├── ProductCatalogMVC-ASP.NET-MVC/           ✅ READY
│   ├── Controllers/
│   ├── Views/
│   ├── Models/
│   ├── Services/
│   ├── wwwroot/
│   ├── Program.cs
│   ├── README.md
│   ├── LEARNING_GUIDE.md
│   ├── MVC_DOCUMENTATION.md
│   └── ProductCatalogMVC.csproj
│
├── ProductCatalogRazor-ASP.NET-Razor/       (Coming Soon)
│   ├── Pages/
│   ├── Models/
│   ├── Data/
│   └── ... (Razor Pages structure)
│
├── ProductUI-React-JavaScript/              ✅ READY
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── styles/
│   ├── package.json
│   ├── vite.config.js
│   ├── README.md
│   ├── LEARNING_GUIDE.md
│   └── REACT_DOCUMENTATION.md
│
├── ProductUI-Angular-TypeScript/            ✅ READY
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── app.routing.ts
│   │   ├── assets/styles/
│   │   └── environments/
│   ├── angular.json
│   ├── tsconfig.json
│   ├── package.json
│   ├── README.md
│   ├── LEARNING_GUIDE.md
│   └── ANGULAR_DOCUMENTATION.md
│
└── INDEX.md (this file)
```

## 📌 Projects Overview

### 1. **ProductCatalogAPI-WebAPI-EFCore** ✅ COMPLETE
   - **Type:** REST API with Entity Framework Core
   - **Tech Stack:** .NET 8.0, ASP.NET Core, EF Core, SQL Server
   - **Focus:** Backend CRUD operations, database design, service layer
   - **Key Concepts:**
     - N-Tier Architecture (Controllers → Services → DbContext → Database)
     - CRUD Operations
     - Async/Await
     - Dependency Injection
     - Soft Delete Pattern
     - Entity Framework Core
     - RESTful API Design
   - **Status:** Ready to run (`dotnet run`)
   - **Documentation:** README.md, API_DOCUMENTATION.md, LEARNING_GUIDE.md

### 2. **ProductCatalogMVC-ASP.NET-MVC** ✅ COMPLETE
   - **Type:** ASP.NET MVC Web Application
   - **Tech Stack:** .NET 8.0, ASP.NET MVC, HttpClient, Bootstrap 5
   - **Focus:** Server-side rendering, Razor views, form handling
   - **Key Concepts:**
     - MVC Pattern (Model-View-Controller)
     - Razor Views & Templating
     - Form Handling & Validation
     - HttpClient Service Layer
     - Dependency Injection
     - Dark/Light Theme Support
   - **Consumes:** ProductCatalogAPI (localhost:5000)
   - **Runs on:** localhost:5001 (HTTPS) / localhost:5000 (HTTP)
   - **Documentation:** README.md, LEARNING_GUIDE.md, MVC_DOCUMENTATION.md
   - **Setup Guide:** See docs/mvc-setup.html

### 3. **ProductCatalogRazor-ASP.NET-Razor** (Planned)
   - **Type:** ASP.NET Razor Pages
   - **Tech Stack:** .NET 8.0, ASP.NET Razor Pages, EF Core, SQL Server
   - **Focus:** Page-based model, simplified structure
   - **Key Concepts:**
     - Page Model Pattern
     - PageResult vs ActionResult
     - Page Handlers
     - Simplified Data Access Pattern

### 4. **ProductUI-React-JavaScript** ✅ COMPLETE
   - **Type:** React Frontend Application
   - **Tech Stack:** React 18, JavaScript, Vite, React Router 6, Bootstrap 5
   - **Focus:** Modern frontend consuming ProductCatalogAPI
   - **Key Concepts:**
     - Functional Components & Hooks
     - Custom Hooks (useProduct, useLocalStorage)
     - State Management (useState, useContext)
     - API Integration (Fetch API)
     - CRUD Operations
     - Context API for Theme
     - React Router Navigation
   - **Consumes:** ProductCatalogAPI (localhost:5000)
   - **Runs on:** localhost:5173 (Vite dev server)
   - **Documentation:** README.md, LEARNING_GUIDE.md, REACT_DOCUMENTATION.md
   - **Setup Guide:** See docs/react-setup.html

### 5. **ProductUI-Angular-TypeScript** ✅ COMPLETE
   - **Type:** Angular Frontend Application
   - **Tech Stack:** Angular 18+, TypeScript 5.2+, RxJS 7.8+, Bootstrap 5
   - **Focus:** Enterprise-grade frontend alternative
   - **Key Concepts:**
     - Component-Based Architecture
     - Services & Dependency Injection
     - Observables & RxJS
     - Reactive Forms with Validation
     - Angular Router
     - HttpClientModule
     - Strong TypeScript Typing
   - **Consumes:** ProductCatalogAPI (localhost:5000)
   - **Runs on:** localhost:4200 (Angular CLI)
   - **Documentation:** README.md, LEARNING_GUIDE.md, ANGULAR_DOCUMENTATION.md
   - **Setup Guide:** See docs/angular-setup.html

## 🚀 Quick Start

### Run ProductCatalogAPI-WebAPI-EFCore
```bash
cd ProductCatalogAPI-WebAPI-EFCore
dotnet run
```
- API runs on: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`
- Test file: `ProductCatalogAPI.http` (VS Code REST Client)

## 📚 Learning Paths

### Path 1: Backend Foundation (APIs & Databases)
1. Start with **ProductCatalogAPI-WebAPI-EFCore**
   - Understand REST APIs
   - Learn EF Core
   - Master async operations

2. Progress to **ProductCatalogMVC-ASP.NET-MVC**
   - Learn MVC pattern
   - Server-side rendering
   - Form handling

3. Explore **ProductCatalogRazor-ASP.NET-Razor**
   - Simplified page-based approach
   - Compare with API pattern

### Path 2: Full Stack (API + Frontend)
1. Start with **ProductCatalogAPI-WebAPI-EFCore** (backend)
2. Build **ProductUI-React-JavaScript** (frontend)
   - Fetch data from API
   - CRUD operations in React
   - State management

### Path 3: Angular Alternative
1. Use same **ProductCatalogAPI-WebAPI-EFCore** (backend)
2. Build **ProductUI-Angular-TypeScript** (frontend)
   - Compare Angular vs React approach
   - Learn RxJS Observables
   - Services pattern

### Path 4: Compare All Approaches
1. Create all 5 projects
2. Understand different architectural approaches
3. Learn when to use each technology
4. Master multiple frameworks

## 🎯 What You'll Learn

### Backend Concepts
- ✅ RESTful API Design
- ✅ N-Tier Architecture
- ✅ Database Design & Migrations
- ✅ Entity Framework Core
- ✅ Dependency Injection
- ✅ Async/Await Programming
- ✅ Error Handling & Validation
- ✅ CRUD Operations
- ✅ Service Layer Pattern
- ✅ Repository Pattern (future projects)

### Frontend Concepts
- ✅ Component-Based Architecture
- ✅ State Management
- ✅ API Integration
- ✅ Form Handling
- ✅ Reactive Programming
- ✅ Routing
- ✅ Building UIs

### Architectural Concepts
- ✅ Separation of Concerns
- ✅ Dependency Injection
- ✅ Design Patterns
- ✅ Scalability
- ✅ Testability
- ✅ Code Organization

## 📋 Project Creation Checklist

Use this template for creating new projects:

```
FolderName: ProjectName-TechType
Examples:
  - ProductCatalogAPI-WebAPI-EFCore ✅
  - ProductCatalogMVC-ASP.NET-MVC (TODO)
  - ProductCatalogRazor-ASP.NET-Razor (TODO)
  - ProductUI-React-JavaScript (TODO)
  - ProductUI-Angular-TypeScript (TODO)
  - InventorySystem-MinimalAPIs-Caching (TODO)
  - Dashboard-Blazor-WebAssembly (TODO)
```

### Steps for Creating New Project:
1. Create folder: `mkdir FolderName`
2. Create .NET project inside
3. Create comprehensive README in folder
4. Write detailed code comments
5. Include example requests/UI screenshots
6. Add IMPORTANT FLOWS documentation
7. Test thoroughly before marking ✅

## 🔗 Integration Points

### API ↔ Frontend Communication
```
ProductCatalogAPI-WebAPI-EFCore (localhost:5000)
    ↓ REST Endpoints ↓
ProductUI-React (localhost:3000)
or
ProductUI-Angular (localhost:4200)
```

**CORS already configured** in API for:
- React: `http://localhost:3000`
- Angular: `http://localhost:4200`

## 📈 Complexity Progression

**Level 1: Foundational**
- ProductCatalogAPI-WebAPI-EFCore

**Level 2: Alternative Patterns**
- ProductCatalogMVC-ASP.NET-MVC
- ProductCatalogRazor-ASP.NET-Razor

**Level 3: Frontend**
- ProductUI-React-JavaScript
- ProductUI-Angular-TypeScript

**Level 4: Advanced (Future)**
- MinimalAPIs, Caching, Microservices
- Blazor, gRPC, Real-time SignalR
- Authentication & Authorization
- Unit & Integration Testing

## 📖 Documentation Standard

Each project includes:
1. **README.md** - Quick start & overview
2. **Documentation specific file** - Complete technical details
3. **Code comments** - IMPORTANT FLOWS explained
4. **Test files** - Example requests/test cases
5. **Learning materials** - Guides for understanding

## ✨ Immediate Status

### Completed ✅
- ✅ ProductCatalogAPI-WebAPI-EFCore (Backend API - Session 1)
- ✅ ProductCatalogMVC-ASP.NET-MVC (Server-side rendering - Session 5)
- ✅ ProductUI-React-JavaScript (React Frontend - Session 5)
- ✅ ProductUI-Angular-TypeScript (Angular Frontend - Session 5)
- ✅ DevDocs Documentation Site (Sessions 1-5)

### Documentation Sets
- ✅ 3 Overview pages: mvc.html, angular.html, react.html
- ✅ 3 Setup guides: mvc-setup.html, angular-setup.html, react-setup.html
- ✅ Complete references: MVC_DOCUMENTATION.md, ANGULAR_DOCUMENTATION.md, REACT_DOCUMENTATION.md
- ✅ 3 Interview pages: interview-mvc.html, interview-angular.html, interview-react.html

### Coming Soon
1. **ProductCatalogRazor-ASP.NET-Razor**
   - Simplified page-based alternative to MVC
   - Compare page model with controller pattern

2. **Advanced Features**
   - Authentication & Authorization
   - Unit & Integration Tests
   - Cloud Deployment
   - API Caching Strategies

## ✨ Next Steps (Session 5 Continuation)

## 💡 Tips for Learning

1. **Read comments first** - Each "IMPORTANT FLOW" has detailed explanations
2. **Run the projects** - Execute and test while learning
3. **Compare patterns** - See how same problem solved differently
4. **Try modifications** - Change code, break things, learn why
5. **Build projects incrementally** - Master one before starting next

## 📞 Project Navigation

```bash
# Navigate to specific project
cd ProductCatalogAPI-WebAPI-EFCore
dotnet run

# Check README
cat README.md

# View all docs
ls *.md

# Run tests
cat ProductCatalogAPI.http
```

## 🎓 Learning Outcomes

After completing these projects, you'll understand:

✅ How backend APIs are built
✅ How databases are designed and queried
✅ How frontend connects to backend
✅ Multiple architectural patterns
✅ When to use each technology
✅ Professional code organization
✅ Important design patterns
✅ Best practices in .NET ecosystem

---

**Status:** 🎉 **Session 5 COMPLETE!** All core projects ready (API + MVC + React + Angular + Full Documentation). Ready for advanced features? 🚀
