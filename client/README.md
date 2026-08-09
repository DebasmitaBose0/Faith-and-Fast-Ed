# Nandani Jewellers

---

## 🚀 Steps to Setup

1. **Fork the Repository**
   - Fork this repository to your GitHub account.

2. **Clone the Repository**
   - Open your terminal and run:
     ```bash
     git clone https://github.com/your-username/repository-name.git
     ```

3. **Install Client Dependencies**
   - Navigate to the client directory:
     ```bash
     cd client
     ```
   - Install the necessary dependencies:
     ```bash
     npm install
     ```
   - Run the client app:
     ```bash
     npm run dev
     ```

4. **Install Server Dependencies**
   - Navigate to the server directory:
     ```bash
     cd server
     ```
   - Install the server dependencies:
     ```bash
     npm install
     ```
   - Start the server:
     ```bash
     npm run dev
     ```

5. **Push Changes and Create Pull Request**
   - After coding each page, **push** your changes to your existing repo.
   - Create a **Pull Request** from your forked repo to the main repository.

---

## 💻 Steps for Coding

### 0. Theme Color for Website

- **Light Theme:**
  - Background: `bg-red-50`
  - Text: `text-black`

- **Dark Theme:**
  - Background: `bg-black`
  - Text: `text-white` or `text-yellow-500`

### 1. Use `MetaData` File for Web Page Title

```jsx
<MetaData title="Admin Login | City Smile Dental Clinic" />
```

### 2. Circular Progress for Loader and Data Fetching

```jsx
import { CircularProgress } from '@mui/material';
<CircularProgress />;
```

### 3. Implement Dark Mode Theme

```jsx
<div className="flex flex-col overflow-hidden bg-white dark:bg-black text-black dark:text-white">
```

### 4. Use Toastify for Alerts

```jsx
import { toast } from 'react-toastify';
toast.success('Login successful!');
```

### 5. Use Dummy Data

### 6. Code Comments

### 7. Terminal Errors

```jsx
// eslint-disable-next-line
```

### 8. Code Formatting and Readability

### 9. Buttons

```jsx
<button>{submitting ? 'Logging in...' : 'Login'}</button>
```

### 10. Make Pages Responsive for Laptop, Tablet, Mobile

### 11. TailwindCSS and MUI CSS

### 12. GSAP and Motion for Animations

### 13. Use MUI Icons for Icons

```jsx
import { IconName } from '@mui/icons-material';
<IconName />;
```

### 14. Simple Routes

### 15. Use Placeholder Where Required
