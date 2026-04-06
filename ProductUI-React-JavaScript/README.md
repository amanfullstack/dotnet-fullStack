# ProductUI-React - React JavaScript Frontend

A modern React 18 Single Page Application (SPA) for managing products. Built with Vite, hooks, and Context API, consuming the ProductCatalogAPI.

**Tech Stack:**
- React 18+
- JavaScript (JSX)
- Vite (modern bundler)
- React Router 6 (navigation)
- Bootstrap 5 (responsive UI)
- Context API (state management)
- Custom Hooks

## Quick Start

### Prerequisites
- Node.js 16+ and npm 7+
- ProductCatalogAPI running on `http://localhost:5000`

### Installation & Running

```bash
# Navigate to project
cd ProductUI-React-JavaScript

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173 (or shown port)
```

## Features

✅ **Product Management**
- Real-time product list with pagination
- Search and filter by name/category
- Create new products (modal)
- Edit existing products
- View product details
- Delete products with confirmation

✅ **Modern UI/UX**
- Responsive Bootstrap 5 design
- Dark/Light theme toggle
- Loading states & spinners
- Toast notifications
- Form validation
- Smooth transitions

✅ **React Patterns**
- Functional components with hooks
- Custom hooks (useProduct)
- Context API for state
- Custom hooks for localStorage
- Error boundaries
- Lazy loading components

## Project Structure

```
src/
├── components/
│   ├── ProductList.jsx
│   ├── ProductForm.jsx
│   ├── ProductDetail.jsx
│   ├── ProductDelete.jsx
│   ├── ThemeToggle.jsx
│   └── Toast.jsx
├── pages/
│   ├── ListPage.jsx
│   ├── CreatePage.jsx
│   ├── EditPage.jsx
│   └── DetailPage.jsx
├── services/
│   └── productService.js
├── hooks/
│   ├── useProduct.js
│   └── useLocalStorage.js
├── context/
│   └── ThemeContext.jsx
├── styles/
│   ├── App.css
│   └── theme.css
├── App.jsx
└── main.jsx
```

## Key Concepts

### 1. Functional Components with Hooks

```jsx
function ProductList() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="product-list">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

### 2. Custom Hooks

```jsx
// Hook for product CRUD
function useProduct() {
  const [products, setProducts] = useState([]);

  const create = async (product) => {
    const newProduct = await productService.create(product);
    setProducts([...products, newProduct]);
    return newProduct;
  };

  const update = async (id, product) => {
    await productService.update(id, product);
    setProducts(products.map(p => p.id === id ? product : p));
  };

  const delete_product = async (id) => {
    await productService.delete(id);
    setProducts(products.filter(p => p.id !== id));
  };

  return { products, create, update, delete_product };
}
```

### 3. Context API for Theme

```jsx
// ThemeContext.jsx
export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
    localStorage.setItem('theme', theme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Usage
function App() {
  const { theme } = useContext(ThemeContext);
  return <div className={`app ${theme}`}>{/* ... */}</div>;
}
```

### 4. React Router

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/edit/:id" element={<EditPage />} />
        <Route path="/:id" element={<DetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Building & Deployment

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Deploy to Netlify
```bash
npm run build
# Drag dist/ folder to Netlify
# Or use: npm install -g netlify-cli && netlify deploy
```

### Deploy to Vercel
```bash
npm run build
# Install vercel CLI
npm run deploy       # Push to Vercel
```

## Testing

```bash
# Unit tests (Vitest)
npm run test

# E2E tests (Playwright)
npm run test:e2e
```

## Troubleshooting

**Issue:** CORS errors from API
```js
// Solution: Configure proxy in vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}
```

**Issue:** State not updating
```jsx
// Don't mutate state directly
✗ products.push(newProduct);           // Wrong
✓ setProducts([...products, newProduct]); // Correct
```

## Learning Resources

See `LEARNING_GUIDE.md` for hooks, Context API, and React best practices.

---

**View Source:** [GitHub](https://github.com/[USER]/dotnet-fullStack/tree/main/ProductUI-React-JavaScript)
