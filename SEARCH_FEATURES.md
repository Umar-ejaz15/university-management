# University Management System - Search & Programs Update

## New Features Added

### 1. **Global Search Functionality**

A comprehensive search feature has been added across multiple pages that allows users to search for:
- **Faculties**: Search by faculty name, short name, or dean name
- **Departments**: Search by department name, head name, or description
- **People (Staff)**: Search by name, email, designation, or specialization

#### Search Bar Locations:
- ✅ **Dashboard** (`/uni-dashboard`) - Main university dashboard
- ✅ **Faculties Listing** (`/faculties`) - All faculties overview
- ✅ **Faculty Detail** (`/faculties/[facultyId]`) - Individual faculty pages
- ✅ **Department Detail** (`/faculties/[facultyId]/[departmentId]`) - Department pages

#### Features:
- **Real-time search** with 300ms debounce
- **Autocomplete dropdown** with results grouped by type
- **Visual icons** to distinguish between faculties, departments, and people
- **Click-to-navigate** directly to the selected result
- **Minimum 2 characters** required to trigger search
- **Responsive design** works on all screen sizes

### 2. **Department Programs**

Programs offered by each department are now fully integrated:

#### Seeded Program Data:
Each department now includes a list of academic programs such as:
- BS (Bachelor of Science) programs
- MS (Master of Science) programs  
- PhD programs
- Certificate and Diploma programs

#### Examples:
- **Department of Agricultural Engineering**: BS Agricultural Engineering, MS Agricultural Engineering, PhD Agricultural Engineering
- **Institute of Plant Breeding and Biotechnology**: BS Plant Breeding & Genetics, MS Plant Breeding & Genetics, PhD Plant Breeding & Genetics, MS Biotechnology
- **Department of Mathematics and Statistics**: BS Mathematics, BS Statistics, MS Mathematics, MS Statistics, PhD Statistics

#### Display:
- Programs are displayed on each department's detail page
- Clean tag-based UI with gray background badges
- Automatically counts and displays total programs in department statistics

## Technical Implementation

### New Components:
- `components/SearchBar.tsx` - Reusable search component with autocomplete

### New API Endpoints:
- `app/api/search/route.ts` - Global search endpoint supporting faculties, departments, and staff

### Updated Files:
- `app/uni-dashboard/page.tsx` - Added search bar
- `app/faculties/page.tsx` - Added search bar
- `app/faculties/[facultyId]/page.tsx` - Added search bar
- `app/faculties/[facultyId]/[departmentId]/page.tsx` - Added search bar
- `prisma/seed.ts` - Updated with program data for all departments

### Database:
- Program model already existed in schema
- Updated seed file to populate programs for each department
- Programs are linked to departments via foreign key relationship

## Setup Instructions

To apply these changes to your database:

1. **Reset and reseed the database**:
   ```powershell
   pnpm prisma migrate reset --force
   ```
   This will:
   - Drop existing data
   - Run all migrations
   - Execute the seed file with new program data

2. **Alternative: Just reseed without reset** (if you want to keep other data):
   ```powershell
   pnpm prisma db seed
   ```

3. **Start the development server**:
   ```powershell
   pnpm dev
   ```

4. **Test the search feature**:
   - Navigate to `/uni-dashboard`
   - Type in the search bar (e.g., "Computer", "Dr. Sara", "Engineering")
   - Click on any result to navigate to that page

## API Usage

### Search Endpoint:
```
GET /api/search?q=<search_term>
```

**Response:**
```json
{
  "results": [
    {
      "type": "faculty|department|person",
      "id": "...",
      "name": "...",
      "subtitle": "...",
      "url": "..."
    }
  ],
  "count": 10,
  "query": "search_term"
}
```

## Future Enhancements

Potential improvements:
- Add filters (search only faculties, only departments, etc.)
- Keyboard navigation (arrow keys to navigate results)
- Search history/recent searches
- Advanced search with multiple criteria
- Export search results
- Search within programs and research areas
