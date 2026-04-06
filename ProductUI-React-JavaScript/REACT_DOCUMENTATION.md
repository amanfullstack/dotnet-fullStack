# React Complete Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Services](#services)
4. [Custom Hooks](#custom-hooks)
5. [Components](#components)
6. [Context API](#context-api)
7. [Routing](#routing)
8. [Forms & Validation](#forms--validation)
9. [API Integration](#api-integration)
10. [Theme Implementation](#theme-implementation)
11. [Performance Optimization](#performance-optimization)

---

## Architecture Overview

### Functional Components with Hooks
React uses **functional components** with **hooks** for state and lifecycle management:

```
Browser Request
    ↓
Vite Dev Server / Bundler
    ↓
React Bootstrap (main.jsx)
    ↓
App Component Render
    ↓
Router matches URL to Component
    ↓
Component mounts (useState, useEffect)
    ↓
useEffect fetches data via Fetch API
    ↓
State updates trigger re-render
    ↓
Component renders JSX
    ↓
User interaction → Event Handler
    ↓
State update via setState
    ↓
Component re-renders with new data
```

### Technology Stack
- **Framework:** React 18+
- **Language:** JavaScript (JSX)
- **Build Tool:** Vite (fast bundler)
- **Routing:** React Router 6
- **State Management:** Context API + Hooks
- **HTTP:** Fetch API
- **Styling:** CSS + CSS Variables
- **UI Framework:** Bootstrap 5

---

## Project Structure

```
ProductUI-React-JavaScript/
├── src/
│   ├── components/
│   │   ├── ProductList.jsx
│   │   ├── ProductForm.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── ProductDelete.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── Toast.jsx
│   ├── pages/
│   │   ├── ListPage.jsx
│   │   ├── CreatePage.jsx
│   │   ├── EditPage.jsx
│   │   └── DetailPage.jsx
│   ├── services/
│   │   └── productService.js
│   ├── hooks/
│   │   ├── useProduct.js
│   │   └── useLocalStorage.js
│   ├── context/
│   │   └── ThemeContext.jsx
│   ├── styles/
│   │   ├── App.css
│   │   ├── index.css
│   │   └── theme.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.html
├── vite.config.js
├── package.json
└── .env
```

---

## Services

### ProductService
**Location:** `src/services/productService.js`

Uses Fetch API to communicate with ProductCatalogAPI.

#### Configuration
```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

const productService = {
  // Methods...
};

export default productService;
```

#### Methods

**getAll()**
```javascript
async getAll() {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}
```

**getById(id)**
```javascript
async getById(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!response.ok) throw new Error('Product not found');
  return response.json();
}
```

**getByCategory(category)**
```javascript
async getByCategory(category) {
  const response = await fetch(
    `${API_BASE_URL}/products/category/${category}`
  );
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}
```

**create(product)**
```javascript
async create(product) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  if (!response.ok) throw new Error('Failed to create product');
  return response.json();
}
```

**update(id, product)**
```javascript
async update(id, product) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
}
```

**delete(id)**
```javascript
async delete(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete product');
}
```

#### Error Handling
```javascript
try {
  const products = await productService.getAll();
} catch (error) {
  console.error('API Error:', error.message);
  setError(error.message);
}
```

---

## Custom Hooks

### useProduct Hook
**Location:** `src/hooks/useProduct.js`

Complete CRUD operations abstraction.

```javascript
import { useState, useCallback } from 'react';
import productService from '../services/productService';

export function useProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all products
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch by ID
  const fetchById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      return await productService.getById(id);
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create product
  const create = useCallback(async (product) => {
    setLoading(true);
    setError(null);
    try {
      const newProduct = await productService.create(product);
      setProducts([...products, newProduct]);
      return newProduct;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [products]);

  // Update product
  const update = useCallback(async (id, product) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await productService.update(id, product);
      setProducts(products.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [products]);

  // Delete product
  const delete_product = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await productService.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [products]);

  return {
    products,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    delete: delete_product
  };
}
```

**Usage Example:**
```javascript
function MyComponent() {
  const { products, loading, error, fetchAll, create } = useProduct();

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    // Component JSX
  );
}
```

### useLocalStorage Hook
**Location:** `src/hooks/useLocalStorage.js`

Persist state to localStorage.

```javascript
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // State to store value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
```

**Usage:**
```javascript
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

---

## Components

### ProductList Component
**Location:** `src/components/ProductList.jsx`

Displays all products in table format.

```javascript
import React, { useState, useEffect } from 'react';
import { useProduct } from '../hooks/useProduct';
import { useNavigate } from 'react-router-dom';

export function ProductList() {
  const { products, loading, fetchAll, delete: deleteProduct } = useProduct();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    // Filter products based on search term
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteProduct(id);
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="product-list">
      <div className="controls">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={() => navigate('/create')} className="btn btn-primary">
          Add Product
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>{product.stockQuantity}</td>
              <td>
                <button onClick={() => navigate(`/edit/${product.id}`)}>
                  Edit
                </button>
                <button onClick={() => navigate(`/${product.id}`)}>
                  Details
                </button>
                <button onClick={() => handleDelete(product.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Key Concepts:**
- `useState` - Local state
- `useEffect` - Side effects (data fetching)
- `useNavigate` - Programmatic routing
- Conditional rendering with ternary operators

---

### ProductForm Component
**Location:** `src/components/ProductForm.jsx`

Form for creating/editing products.

```javascript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../hooks/useProduct';

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, create, update, fetchById } = useProduct();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    category: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    const product = await fetchById(id);
    if (product) {
      setFormData(product);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (formData.price <= 0) newErrors.price = 'Price must be > 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (id) {
        await update(id, formData);
      } else {
        await create(formData);
      }
      navigate('/');
    } catch (error) {
      alert('Failed to save product: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stockQuantity'
        ? parseFloat(value)
        : value
    }));
  };

  return (
    <div className="product-form">
      <h2>{id ? 'Edit Product' : 'Create Product'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            name="price"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className={errors.price ? 'error' : ''}
          />
          {errors.price && <span className="error-text">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label>Stock Quantity</label>
          <input
            type="number"
            name="stockQuantity"
            value={formData.stockQuantity}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : id ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  );
}
```

---

### ProductDetail Component
```javascript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../hooks/useProduct';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, fetchById } = useProduct();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    const data = await fetchById(id);
    setProduct(data);
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      <button onClick={() => navigate('/')}>← Back</button>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p className="price">Price: ${product.price.toFixed(2)}</p>
      <p>Category: {product.category}</p>
      <p>Stock: {product.stockQuantity}</p>
      <div className="actions">
        <button onClick={() => navigate(`/edit/${product.id}`)}>Edit</button>
        <button onClick={() => navigate('/')}>Back to List</button>
      </div>
    </div>
  );
}
```

---

## Context API

### ThemeContext
**Location:** `src/context/ThemeContext.jsx`

Global theme state using Context API.

```javascript
import React, { createContext, useState, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

**Usage:**
```javascript
function MyComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

---

## Routing

### App Router Setup
**Location:** `src/App.jsx`

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ListPage } from './pages/ListPage';
import { CreatePage } from './pages/CreatePage';
import { EditPage } from './pages/EditPage';
import { DetailPage } from './pages/DetailPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/edit/:id" element={<EditPage />} />
          <Route path="/:id" element={<DetailPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
```

**Route Parameters:**
- `:id` - Dynamic segment in URL
- `useParams()` - Access route parameters
- `useNavigate()` - Programmatic navigation

---

## Forms & Validation

### Controlled Components
Form inputs tied to state:

```javascript
const [formData, setFormData] = useState({ name: '', email: '' });

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

return (
  <input name="name" value={formData.name} onChange={handleChange} />
);
```

### Form Validation
```javascript
const validate = () => {
  const errors = {};
  if (!formData.name) errors.name = 'Name required';
  if (formData.email && !validateEmail(formData.email)) {
    errors.email = 'Invalid email';
  }
  setErrors(errors);
  return Object.keys(errors).length === 0;
};
```

---

## API Integration

### Environment Variables
**File:** `.env`
```
VITE_API_URL=http://localhost:5000/api
```

**Usage:**
```javascript
const API_URL = import.meta.env.VITE_API_URL;
```

### Fetch API Patterns

**GET Request:**
```javascript
const response = await fetch(url);
const data = await response.json();
```

**POST Request:**
```javascript
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

**Error Handling:**
```javascript
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(response.statusText);
  return await response.json();
} catch (error) {
  console.error('API Error:', error);
  throw error;
}
```

---

## Theme Implementation

### CSS Variables
**File:** `src/styles/theme.css`

```css
:root {
  --color-primary: #0ea5e9;
  --color-bg: #ffffff;
  --color-text: #1f2937;
  --color-border: #e5e7eb;
  --color-success: #10b981;
  --color-danger: #ef4444;
}

[data-theme="dark"] {
  --color-primary: #0ea5e9;
  --color-bg: #0f172a;
  --color-text: #f3f4f6;
  --color-border: #374151;
  --color-success: #10b981;
  --color-danger: #ef4444;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### Theme Toggle Component
```javascript
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="theme-btn">
      {theme === 'light' ? '🌙' : '☀️'} {theme}
    </button>
  );
}
```

---

## Performance Optimization

### React.memo
Prevent unnecessary re-renders:

```javascript
const ProductCard = React.memo(function ProductCard({ product, onDelete }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => onDelete(product.id)}>Delete</button>
    </div>
  );
});
```

### useCallback
Memoize functions:

```javascript
const handleDelete = useCallback((id) => {
  // Delete logic
}, [dependency]);
```

### useMemo
Memoize expensive computations:

```javascript
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);
```

### Code Splitting
Lazy load routes:

```javascript
const DetailPage = lazy(() => import('./pages/DetailPage'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/:id" element={<DetailPage />} />
      </Routes>
    </Suspense>
  );
}
```

---

## Best Practices

1. **Lift State Up** - Shared state in parent component
2. **Custom Hooks** - Reusable logic
3. **Props Drilling Prevention** - Use Context API for global state
4. **Key Prop** - Always provide key in lists
5. **Cleanup Functions** - In useEffect return cleanup
6. **Function Components** - Prefer over class components
7. **Object Spread** - For immutable state updates

---

## Building & Deployment

### Build for Production
```bash
npm run build
```

Output: `dist/` folder with optimized build

### Deployment Options
- Netlify: Drag & drop `dist` folder
- Vercel: Connect GitHub repo
- GitHub Pages: `npm install gh-pages` + configure
- Docker: Multi-stage build
- Traditional hosting: Upload `dist` to server

---

## Common Patterns

### Fetch on Mount
```javascript
useEffect(() => {
  fetchData();
}, []); // Empty dependency = runs once on mount
```

### Cleanup on Unmount
```javascript
useEffect(() => {
  const timer = setTimeout(() => {}, 1000);
  return () => clearTimeout(timer); // Cleanup
}, []);
```

### Conditional Rendering
```javascript
{loading && <Spinner />}
{error && <Error message={error} />}
{data && <DataDisplay data={data} />}
```

---

## Related Documentation
- [README.md](../../README.md) - Quick start guide
- [LEARNING_GUIDE.md](../../LEARNING_GUIDE.md) - Conceptual guide
- [React Official Docs](https://react.dev) - Full reference

