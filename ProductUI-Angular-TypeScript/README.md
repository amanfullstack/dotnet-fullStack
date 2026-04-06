# ProductUI-Angular - Angular TypeScript Frontend

A modern Angular 18 Single Page Application (SPA) for managing products. Built with TypeScript, Reactive Forms, and RxJS, consuming the ProductCatalogAPI.

**Tech Stack:**
- Angular 18+
- TypeScript 5.2+
- RxJS for reactive programming
- Bootstrap 5 (responsive UI)
- Reactive Forms (form handling)
- Angular Router (navigation)

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- ProductCatalogAPI running on `http://localhost:5000`
- Angular CLI: `npm install -g @angular/cli`

### Installation & Running

```bash
# Navigate to project
cd ProductUI-Angular-TypeScript

# Install dependencies
npm install

# Start development server
ng serve

# Open browser to http://localhost:4200
```

## Features

✅ **Product Management**
- Real-time product list with pagination
- Search and filter by name/category
- Create new products (modal form)
- Edit existing products
- View product details
- Delete products (with confirmation)

✅ **Modern UI/UX**
- Responsive design (mobile-first)
- Dark/Light theme toggle
- Loading spinners
- Toast notifications
- Form validation (Reactive Forms)
- Smooth animations

✅ **Architecture**
- Service-based layer (HttpClient)
- Component-oriented design
- Dependency Injection
- RxJS Observables & Operators
- Strong typing (TypeScript)
- Error handling utilities

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── product-list/
│   │   ├── product-form/
│   │   ├── product-detail/
│   │   └── product-delete/
│   ├── services/
│   │   └── product.service.ts
│   ├── models/
│   │   └── product.ts
│   ├── app.routing.ts
│   ├── app.component.ts
│   └── app.module.ts
├── assets/
│   └── styles/
│       └── theme.scss
├── index.html
└── main.ts
```

## Key Concepts

### 1. Services & HttpClient

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:5000/api/products');
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>('http://localhost:5000/api/products', product);
  }
}
```

### 2. Components & Observables

```typescript
export class ProductListComponent implements OnInit {
  products$: Observable<Product[]>;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.products$ = this.productService.getAllProducts();
  }
}
```

### 3. Reactive Forms

```typescript
export class ProductFormComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = fb.group({
      name: ['', Validators.required],
      price: [0, Validators.required],
      category: ['']
    });
  }

  submit() {
    if (this.form.valid) {
      // Submit to API
    }
  }
}
```

### 4. Routing

```typescript
const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'create', component: ProductFormComponent },
  { path: 'edit/:id', component: ProductFormComponent },
  { path: ':id', component: ProductDetailComponent }
];
```

## Running Tests

```bash
# Unit tests
ng test

# Build for production
ng build --configuration production
```

## Deployment

### To Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init
ng build
firebase deploy
```

### To Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## Learning Resources

See `LEARNING_GUIDE.md` for detailed Angular concepts, RxJS patterns, and best practices.

—

**View Source:** [GitHub](https://github.com/[USER]/dotnet-fullStack/tree/main/ProductUI-Angular-TypeScript)
