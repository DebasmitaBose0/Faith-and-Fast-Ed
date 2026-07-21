# Faith & Fast Project Issues

This document tracks planned improvements and contribution opportunities for the Faith & Fast E-commerce project.

---

## Newbie Issues (Difficulty: newbie)

### 1. Remove Hardcoded Dummy Data from ContactUs Page

- **Difficulty**: newbie
- **Labels**: `faith-fast`, `newbie`, `enhancement`, `good first issue`
- **Description**:
  - **Problem Statement**: The `ContactUs.jsx` component currently uses a hardcoded `dummyData` object and a `setTimeout` to simulate an API call.
  - **Current Behavior**: Contact details are static and defined inside the component.
  - **Expected Behavior**: Contact details should be managed via a configuration file or fetched from a backend settings API.
  - **Suggested Solution**: Move the contact information to a new `client/src/config/contact.js` file and import it into the component.
  - **Acceptance Criteria**:
    - Component no longer contains hardcoded personal details.
    - The `setTimeout` is removed.
    - UI remains identical.
- **Why It Matters**: Improves maintainability and allows project admins to change contact info without touching component logic.

### 2. Standardize File Naming and Fix Controller Spelling

- **Difficulty**: newbie
- **Labels**: `faith-fast`, `newbie`, `bug`, `refactor`
- **Description**:
  - **Problem Statement**: There is a typo in the file name `server/controllers/addressConroller.js` (missing 't').
  - **Current Behavior**: The file is named `addressConroller.js`.
  - **Expected Behavior**: The file should be named `addressController.js` to match the project's naming convention.
  - **Suggested Solution**: Rename the file and update the import in `server/route/addressRoute.js`.
  - **Acceptance Criteria**:
    - File renamed to `addressController.js`.
    - All backend imports updated.
    - Address functionality still works correctly.
- **Why It Matters**: Enhances code quality and prevents confusion for new contributors.

### 3. Implement "No Orders Found" Empty State

- **Difficulty**: newbie
- **Labels**: `faith-fast`, `newbie`, `ui`, `enhancement`
- **Description**:
  - **Problem Statement**: The `MyOrders.jsx` page shows a generic message when no orders are found.
  - **Current Behavior**: Basic text display.
  - **Expected Behavior**: A visually appealing empty state with an icon and a "Start Shopping" button.
  - **Suggested Solution**: Add a new sub-component or conditional render in `MyOrders.jsx` that uses Lucide icons and a call-to-action button.
  - **Acceptance Criteria**:
    - Custom UI for empty order history.
    - "Shop Now" button redirects to `/products`.
- **Why It Matters**: Significantly improves the User Experience (UX) for new customers.

---

## Adventurer Issues (Difficulty: adventurer)

### 1. Dynamic "Popular Reviews" on Homepage

- **Difficulty**: adventurer
- **Labels**: `faith-fast`, `adventurer`, `enhancement`
- **Description**:
  - **Problem Statement**: The `ReviewSection.jsx` on the homepage contains static, hardcoded reviews that reference "Flipkart".
  - **Current Behavior**: Static HTML reviews.
  - **Expected Behavior**: The section should display real reviews fetched from the database, ideally the most recent or highest-rated ones.
  - **Suggested Solution**:
    - Create a backend endpoint `GET /api/product/top-reviews`.
    - Update the frontend component to fetch and map through these reviews.
  - **Acceptance Criteria**:
    - Reviews are dynamic and real.
    - "Flipkart" references are removed.
- **Why It Matters**: Increases trust and social proof for the platform.

### 2. Product Stock Status and Validation

- **Difficulty**: adventurer
- **Labels**: `faith-fast`, `adventurer`, `bug`, `logic`
- **Description**:
  - **Problem Statement**: Products with 0 stock can still be viewed and potentially added to the cart.
  - **Current Behavior**: No visual "Out of Stock" indicator in the product grid.
  - **Expected Behavior**:
    - Show "Out of Stock" badge on product cards.
    - Disable "Add to Cart" button for out-of-stock items.
  - **Suggested Solution**: Update `ProductCard.jsx` and `SingleProduct.jsx` to check the `stock` property of the product object.
  - **Acceptance Criteria**:
    - Badges appear correctly.
    - Logic prevents adding 0-stock items to cart.
- **Why It Matters**: Prevents customer frustration from ordering unavailable items.

### 3. Form Validation with Formik or Zod

- **Difficulty**: adventurer
- **Labels**: `faith-fast`, `adventurer`, `refactor`, `security`
- **Description**:
  - **Problem Statement**: Current forms (Login, Signup, Address) use basic HTML validation or manual state checks.
  - **Current Behavior**: Manual error handling.
  - **Expected Behavior**: Robust, consistent validation with clear error messages.
  - **Suggested Solution**: Integrate `Formik` and `Yup` (or `React Hook Form` and `Zod`) for frontend form management and validation.
  - **Acceptance Criteria**:
    - Real-time validation feedback.
    - Consistent error styling across all forms.
- **Why It Matters**: Improves security and data integrity while enhancing UX.

---

## Veteran Issues (Difficulty: veteran)

### 1. Admin Analytics Dashboard with Charts

- **Difficulty**: veteran
- **Labels**: `faith-fast`, `veteran`, `admin`, `enhancement`
- **Description**:
  - **Problem Statement**: The Admin Dashboard is currently a placeholder with a welcome message.
  - **Current Behavior**: Static welcome text.
  - **Expected Behavior**: A full-featured dashboard with data visualization.
  - **Suggested Solution**:
    - Implement backend aggregation pipelines for: Total Sales, Daily Orders, Top Selling Products, and User Growth.
    - Use `Recharts` or `Chart.js` on the frontend to display this data.
  - **Acceptance Criteria**:
    - At least 3 different charts showing business metrics.
    - Date range filtering (e.g., last 7 days, 30 days).
- **Why It Matters**: Essential for admins to make data-driven decisions.

### 2. Robust Image Processing and Optimization

- **Difficulty**: veteran
- **Labels**: `faith-fast`, `veteran`, `performance`
- **Description**:
  - **Problem Statement**: High-resolution images are uploaded directly, causing slow load times on mobile devices.
  - **Current Behavior**: Direct Cloudinary upload.
  - **Expected Behavior**: Images should be automatically optimized for different screen sizes and use modern formats (WebP).
  - **Suggested Solution**:
    - Update backend `cloudinary.js` to apply transformation parameters during upload.
    - Implement responsive image loading using the `srcset` attribute on the frontend.
  - **Acceptance Criteria**:
    - Images served in WebP format.
    - Significant reduction in homepage and product page load times.
- **Why It Matters**: Critical for SEO and mobile user retention.

### 3. Multi-Vendor Support (Sub-Admin Role)

- **Difficulty**: veteran
- **Labels**: `faith-fast`, `veteran`, `architecture`, `enhancement`
- **Description**:
  - **Problem Statement**: The system only supports one global Admin.
  - **Current Behavior**: Binary Admin/User role system.
  - **Expected Behavior**: Support for "Vendors" who can manage their own products and orders but cannot see other vendors' data.
  - **Suggested Solution**:
    - Add `VENDOR` to User roles.
    - Update Product schema to include a `vendorId`.
    - Refactor middleware and controllers to enforce vendor-level scoping.
  - **Acceptance Criteria**:
    - Vendors can register and log into a restricted dashboard.
    - Admins retain oversight of all vendors.
- **Why It Matters**: Allows the project to scale from a single store to a marketplace.
