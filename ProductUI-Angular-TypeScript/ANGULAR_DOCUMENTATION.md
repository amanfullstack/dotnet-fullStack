# Angular Complete Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Services](#services)
4. [Components](#components)
5. [Models & Interfaces](#models--interfaces)
6. [Routing](#routing)
7. [Forms & Validation](#forms--validation)
8. [State Management](#state-management)
9. [API Integration](#api-integration)
10. [Theme Implementation](#theme-implementation)
11. [RxJS Observables](#rxjs-observables)

---

## Architecture Overview

### SPA Pattern with Components
Angular uses a **component-based architecture** with reactive programming:

```
Browser Request
    ↓
Angular Bootstrap (main.ts)
    ↓
App Module Initialization
    ↓
Router matches URL to Component
    ↓
Component loads (OnInit)
    ↓
Service fetches data via HttpClient
    ↓
Observable returns data
    ↓
Component renders template
    ↓
User interaction → Component method
    ↓
Service updates data via HTTP
    ↓
Observable emits new value
    ↓
Component updates view
```

### Technology Stack
- **Framework:** Angular 18+
- **Language:** TypeScript 5.2+
- **Reactive:** RxJS 7.8+
- **Build Tool:** Angular CLI / Webpack
- **HTTP:** HttpClientModule
- **Forms:** Reactive Forms (FormBuilder)
- **Routing:** Angular Router
- **Styling:** SCSS with CSS Variables

---

## Project Structure

```
ProductUI-Angular-TypeScript/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── product-list/
│   │   │   │   ├── product-list.component.ts
│   │   │   │   ├── product-list.component.html
│   │   │   │   └── product-list.component.scss
│   │   │   ├── product-form/
│   │   │   │   ├── product-form.component.ts
│   │   │   │   ├── product-form.component.html
│   │   │   │   └── product-form.component.scss
│   │   │   ├── product-detail/
│   │   │   │   ├── product-detail.component.ts
│   │   │   │   ├── product-detail.component.html
│   │   │   │   └── product-detail.component.scss
│   │   │   └── product-delete/
│   │   │       ├── product-delete.component.ts
│   │   │       ├── product-delete.component.html
│   │   │       └── product-delete.component.scss
│   │   ├── services/
│   │   │   └── product.service.ts
│   │   ├── models/
│   │   │   └── product.ts
│   │   ├── app.routing.ts
│   │   ├── app.module.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   └── app.component.scss
│   ├── assets/
│   │   └── styles/
│   │       └── theme.scss
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── tsconfig.json
└── package.json
```

---

## Services

### ProductService
**Location:** `src/app/services/product.service.ts`

#### Definition
```typescript
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Methods...
}
```

**Decorator:** `@Injectable({ providedIn: 'root' })` - Available app-wide through dependency injection

#### Methods

**getAllProducts()**
```typescript
getAllProducts(): Observable<Product[]> {
  return this.http.get<Product[]>(`${this.apiUrl}/products`);
}
```
Returns: Observable of Product array
Usage: Emits fresh data from API

**getProductById(id: number)**
```typescript
getProductById(id: number): Observable<Product> {
  return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
}
```
Returns: Observable of single Product

**getProductsByCategory(category: string)**
```typescript
getProductsByCategory(category: string): Observable<Product[]> {
  return this.http.get<Product[]>(
    `${this.apiUrl}/products/category/${category}`
  );
}
```
Returns: Filtered Observable of Products

**createProduct(product: Product): Observable<Product>**
```typescript
createProduct(product: Product): Observable<Product> {
  return this.http.post<Product>(
    `${this.apiUrl}/products`,
    product
  );
}
```

**updateProduct(id: number, product: Product): Observable<Product>**
```typescript
updateProduct(id: number, product: Product): Observable<Product> {
  return this.http.put<Product>(
    `${this.apiUrl}/products/${id}`,
    product
  );
}
```

**deleteProduct(id: number): Observable<void>**
```typescript
deleteProduct(id: number): Observable<void> {
  return this.http.delete<void>(
    `${this.apiUrl}/products/${id}`
  );
}
```

#### HttpClient Features
- Type-safe generic: `<Product[]>`, `<Product>`
- Automatic JSON serialization/deserialization
- Interceptors for headers, error handling
- Request headers automatically set to `application/json`

---

## Components

### ProductListComponent
**Location:** `src/app/components/product-list/`

#### Component Class
```typescript
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products$: Observable<Product[]>;
  loading = false;
  searchTerm = '';
  categoryFilter = '';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.products$ = this.productService.getAllProducts()
      .pipe(
        finalize(() => this.loading = false),
        catchError(err => {
          console.error('Error loading products:', err);
          return of([]);
        })
      );
  }

  searchProducts() {
    // Filter based on searchTerm
  }

  filterByCategory(category: string) {
    this.categoryFilter = category;
    // Re-load products
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure?')) {
      this.productService.deleteProduct(id)
        .subscribe(() => this.loadProducts());
    }
  }
}
```

**Template:**
```html
<div class="product-list">
  <div class="search-bar">
    <input [(ngModel)]="searchTerm" placeholder="Search...">
    <button (click)="searchProducts()">Search</button>
  </div>

  <div *ngIf="loading" class="spinner">Loading...</div>

  <table *ngIf="(products$ | async) as products">
    <tr *ngFor="let product of products">
      <td>{{ product.name }}</td>
      <td>{{ product.price | currency }}</td>
      <td>{{ product.category }}</td>
      <td>
        <button (click)="editProduct(product.id)">Edit</button>
        <button (click)="deleteProduct(product.id)">Delete</button>
        <button (click)="viewDetails(product.id)">Details</button>
      </td>
    </tr>
  </table>
</div>
```

**Key Directives:**
- `*ngIf` - Conditional rendering
- `*ngFor` - Loop through arrays
- `[(ngModel)]` - Two-way binding
- `(click)` - Event binding
- `{{ }}` - Interpolation
- `| async` - Unsubscribe automatically

---

### ProductFormComponent
**Location:** `src/app/components/product-form/`

#### Component Class
```typescript
@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  form: FormGroup;
  isEditing = false;
  productId: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.createForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.productId = params['id'];
        this.loadProduct();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stockQuantity: [0, Validators.required],
      category: ['']
    });
  }

  loadProduct() {
    this.productService.getProductById(this.productId)
      .subscribe(product => {
        this.form.patchValue(product);
      });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const operation = this.isEditing
      ? this.productService.updateProduct(this.productId, this.form.value)
      : this.productService.createProduct(this.form.value);

    operation
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error saving product:', err);
        }
      });
  }

  get name() { return this.form.get('name'); }
  get price() { return this.form.get('price'); }
}
```

#### Template
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <div class="form-group">
    <label>Product Name</label>
    <input formControlName="name" type="text">
    <div *ngIf="name.invalid && name.touched" class="error">
      Name is required (min 2 chars)
    </div>
  </div>

  <div class="form-group">
    <label>Price</label>
    <input formControlName="price" type="number" step="0.01">
    <div *ngIf="price.invalid && price.touched" class="error">
      Price must be greater than 0
    </div>
  </div>

  <div class="form-group">
    <label>Category</label>
    <input formControlName="category" type="text">
  </div>

  <button type="submit" [disabled]="form.invalid || loading">
    {{ isEditing ? 'Update' : 'Create' }}
  </button>
</form>
```

---

### ProductDetailComponent
```typescript
@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  product$: Observable<Product>;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.product$ = this.route.params.pipe(
      switchMap(params => this.productService.getProductById(params['id']))
    );
  }
}
```

---

### ProductDeleteComponent
```typescript
@Component({
  selector: 'app-product-delete',
  template: `
    <div class="modal">
      <p>Are you sure you want to delete this product?</p>
      <button (click)="confirm()">Delete</button>
      <button (click)="cancel()">Cancel</button>
    </div>
  `
})
export class ProductDeleteComponent {
  @Input() product: Product;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirm() {
    this.confirmed.emit();
  }

  cancel() {
    this.cancelled.emit();
  }
}
```

---

## Models & Interfaces

### Product Interface
**Location:** `src/app/models/product.ts`

```typescript
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  category?: string;
  createdDate: Date;
  updatedDate: Date;
  isActive: boolean;
}
```

**Note:** Use interfaces (not classes) for DTOs in Angular - no overhead

---

## Routing

### App Routing Module
**Location:** `src/app/app.routing.ts`

```typescript
const routes: Routes = [
  {
    path: '',
    component: ProductListComponent
  },
  {
    path: 'create',
    component: ProductFormComponent
  },
  {
    path: 'edit/:id',
    component: ProductFormComponent
  },
  {
    path: ':id',
    component: ProductDetailComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

**Route Parameters:**
- `:id` - Captured from URL
- Access via: `this.route.params`
- Dynamic routing with `switchMap`

---

## Forms & Validation

### Reactive Forms
Using `FormBuilder` for type-safe forms:

```typescript
form = this.fb.group({
  name: ['', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(100)
  ]],
  price: [0, [
    Validators.required,
    Validators.min(0.01),
    Validators.pattern(/^\d+(\.\d{1,2})?$/)
  ]],
  category: ['']
});
```

### Validation Status
```typescript
form.valid        // true if all valid
form.invalid      // true if any invalid
form.touched      // true if user interacted
form.pristine     // true if unchanged
form.dirty        // true if changed

form.get('name').hasError('required')
form.get('name').errors // { required: true, minlength: {...} }
```

### Form Submission
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <!-- Fields -->
  <button type="submit" [disabled]="form.invalid">Submit</button>
</form>
```

---

## State Management

### Using Observables as State
```typescript
private products$ = new BehaviorSubject<Product[]>([]);

getProducts$(): Observable<Product[]> {
  return this.products$.asObservable();
}

addProduct(product: Product) {
  const current = this.products$.getValue();
  this.products$.next([...current, product]);
}
```

### BehaviorSubject vs Subject
- **BehaviorSubject:** Emits latest value immediately on subscribe
- **Subject:** Only emits values after subscribe (no initial value)

---

## API Integration

### Environment Configuration
**Development (`environment.ts`):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

**Production (`environment.prod.ts`):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com'
};
```

### HttpClient Usage
```typescript
// GET
this.http.get<T>(url)

// POST with body
this.http.post<T>(url, body)

// PUT
this.http.put<T>(url, body)

// DELETE
this.http.delete<void>(url)

// GET with query params
this.http.get<T>(url, { params: { key: 'value' } })

// GET with headers
this.http.get<T>(url, {
  headers: new HttpHeaders({
    'Authorization': 'Bearer token'
  })
})
```

### Error Handling
```typescript
this.productService.getProducts()
  .pipe(
    catchError(error => {
      console.error('API Error:', error);
      return throwError(() => new Error('Failed to load products'));
    })
  )
  .subscribe(...);
```

---

## Theme Implementation

### CSS Variables
**File:** `src/assets/styles/theme.scss`

```scss
:root {
  --color-primary: #0ea5e9;
  --color-bg: #ffffff;
  --color-text: #1f2937;
  --color-border: #e5e7eb;
}

[data-theme="dark"] {
  --color-primary: #0ea5e9;
  --color-bg: #0f172a;
  --color-text: #f3f4f6;
  --color-border: #374151;
}
```

### Theme Service
```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<string>('light');
  theme$ = this.themeSubject.asObservable();

  toggleTheme() {
    const current = this.themeSubject.getValue();
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    this.themeSubject.next(next);
  }
}
```

### Using in Component
```typescript
constructor(private themeService: ThemeService) {}

theme$ = this.themeService.theme$;

toggleTheme() {
  this.themeService.toggleTheme();
}
```

Template:
```html
<button (click)="toggleTheme()" [ngClass]="(theme$ | async) === 'dark' ? 'dark' : 'light'">
  🌙 Theme
</button>
```

---

## RxJS Observables

### Common Operators

**map** - Transform data
```typescript
this.products$ = this.productService.getAllProducts()
  .pipe(
    map(products => products.filter(p => p.isActive))
  );
```

**switchMap** - Switch to new Observable
```typescript
this.product$ = this.route.params.pipe(
  switchMap(params => this.productService.getProductById(params['id']))
);
```

**catchError** - Handle errors
```typescript
products$ = this.productService.getAllProducts()
  .pipe(
    catchError(error => {
      console.error(error);
      return of([]);
    })
  );
```

**finalize** - Run after completion
```typescript
.pipe(
  finalize(() => this.loading = false)
)
```

**debounceTime** - Delay emission
```typescript
this.searchTerm$.pipe(
  debounceTime(300),
  switchMap(term => this.search(term))
)
```

**distinctUntilChanged** - Skip duplicate values
```typescript
this.searchTerm$.pipe(
  distinctUntilChanged(),
  switchMap(term => this.search(term))
)
```

---

## Async Pipe

Automatically subscribes to Observables in templates:

```html
<!-- Equivalent to: products.subscribe(p => ...) -->
<div *ngFor="let product of (products$ | async)">
  {{ product.name }}
</div>
```

**Benefits:**
- Auto-unsubscribe on component destroy (prevents memory leaks)
- Change detection triggers on new values
- Cleaner templates

---

## Dependency Injection

Services are injected into components:

```typescript
constructor(
  private productService: ProductService,
  private route: ActivatedRoute,
  private router: Router
) {}
```

**Lifetime:**
- `providedIn: 'root'` - Singleton (one instance app-wide)
- `providedIn: SomeModule` - Scoped to module
- `providers: [Service]` in component - Component-scoped

---

## Performance Tips

1. **Use OnPush Change Detection**
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   ```

2. **Unsubscribe from Observables**
   ```typescript
   private destroy$ = new Subject<void>();

   ngOnInit() {
     this.service.method()
       .pipe(takeUntil(this.destroy$))
       .subscribe();
   }

   ngOnDestroy() {
     this.destroy$.next();
     this.destroy$.complete();
   }
   ```

3. **Use async pipe in templates** - Automatic unsubscribe

4. **Lazy load modules**
   ```typescript
   { path: 'products', loadChildren: () => import('./products/products.module').then(m => m.ProductsModule) }
   ```

---

## Testing

### Unit Test Example
```typescript
describe('ProductService', () => {
  let service: ProductService;
  let httpClient: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ProductService);
    httpClient = TestBed.inject(HttpTestingController);
  });

  it('should fetch products', () => {
    const mockProducts: Product[] = [/* ... */];

    service.getAllProducts().subscribe(products => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpClient.expectOne('http://localhost:5000/api/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });
});
```

---

## Deployment

### Build for Production
```bash
ng build --configuration production
```

Output: `dist/ProductUI-Angular-TypeScript/`
- All code minified and optimized
- Tree-shaking removes unused code
- Lazy-loaded modules split into chunks

### Deployment Targets
- Firebase Hosting
- Netlify
- Vercel
- GitHub Pages (with baseHref)
- Azure Static Web Apps

---

## Related Documentation
- [README.md](../../README.md) - Quick start guide
- [LEARNING_GUIDE.md](../../LEARNING_GUIDE.md) - Conceptual guide
- [Angular Official Docs](https://angular.io/docs) - Full reference

