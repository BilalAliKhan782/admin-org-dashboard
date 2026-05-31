# Implementation Plan: Admin Dashboard

## Overview

This implementation plan breaks down the Admin Dashboard feature into incremental coding tasks. The application is a full-stack TypeScript/React web application with Supabase backend, featuring secure authentication, organization management with type-specific attributes, member invitations, and role-based access control through Row Level Security policies.

## Tasks

- [x] 1. Set up database schema and security policies
  - [x] 1.1 Create database enums and tables
    - Create migration file with organization_type, member_status, and member_role enums
    - Create profiles table with foreign key to auth.users
    - Create organizations table with type-specific field constraints
    - Create organization_members table with unique email constraint
    - Add indexes on created_by and organization_id columns
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11_
  
  - [x] 1.2 Implement Row Level Security policies
    - Enable RLS on profiles, organizations, and organization_members tables
    - Create SELECT policy for profiles (users read own profile only)
    - Create UPDATE policy for profiles (users update own profile only)
    - Create INSERT policy for organizations (admins only, created_by = auth.uid())
    - Create SELECT, UPDATE, DELETE policies for organizations (created_by = auth.uid())
    - Create SELECT, INSERT, UPDATE policies for organization_members (via organization ownership)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11, 8.12_
  
  - [x] 1.3 Create database trigger for automatic profile creation
    - Implement handle_new_user() function to insert profile on user signup
    - Create trigger on auth.users INSERT to call handle_new_user()
    - Extract full_name from raw_user_meta_data
    - Set is_admin to false by default
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 1.4 Create organization_directory view
    - Create view joining organizations with member counts
    - Use LEFT JOIN to include organizations with zero members
    - Set security_invoker = true to inherit RLS policies
    - _Requirements: 5.8_

- [x] 2. Checkpoint - Verify database schema
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Set up TypeScript types and Supabase client
  - [x] 3.1 Define database TypeScript types
    - Create src/types/database.ts with Database interface
    - Define OrganizationType, MemberStatus, MemberRole types
    - Define Row, Insert, Update types for profiles, organizations, organization_members tables
    - Enable TypeScript strict mode in tsconfig.json
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_
  
  - [x] 3.2 Initialize Supabase client with environment configuration
    - Create src/lib/supabase.ts with createClient initialization
    - Read VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from environment
    - Create MissingSupabaseConfig component to display error when env vars missing
    - Update .env.example with required variables
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 4. Implement authentication system
  - [x] 4.1 Create authentication hook
    - Implement useAuth() hook in src/hooks/use-auth.ts
    - Get initial session on mount
    - Subscribe to auth state changes
    - Return user and loading state
    - _Requirements: 1.9_
  
  - [x] 4.2 Create authentication page with sign-up and sign-in forms
    - Create src/schemas/auth.ts with Zod schema for email and password validation
    - Create src/pages/auth-page.tsx with tabbed interface for sign-up and sign-in
    - Implement sign-up form calling supabase.auth.signUp()
    - Implement sign-in form calling supabase.auth.signInWithPassword()
    - Use React Hook Form with Zod resolver for validation
    - Display inline error messages for validation failures
    - Display error messages for authentication failures
    - Redirect to dashboard on successful authentication
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 10.1, 10.4, 10.7, 10.8, 10.9_
  
  - [x] 4.3 Write unit tests for authentication forms
    - Test email format validation
    - Test password minimum length validation
    - Test form submission with valid credentials
    - Test error handling for invalid credentials
    - _Requirements: 1.3, 1.4, 1.5, 1.8_

- [x] 5. Implement protected routes and layout
  - [x] 5.1 Create ProtectedRoute component
    - Create src/components/protected-route.tsx
    - Check authentication status using useAuth()
    - Redirect to /auth if not authenticated
    - Render children if authenticated
    - Display loading state while checking auth
    - _Requirements: 3.1, 3.2_
  
  - [x] 5.2 Create AppLayout component with header and navigation
    - Create src/components/app-layout.tsx
    - Display authenticated user's email in header
    - Implement sign-out button calling supabase.auth.signOut()
    - Clear session and redirect to /auth on sign-out
    - Add navigation links to organizations directory and create organization
    - _Requirements: 1.9, 1.10, 1.11_
  
  - [x] 5.3 Set up React Router with protected routes
    - Create src/router.tsx with route definitions
    - Configure /auth as public route
    - Configure /, /organizations/new, /organizations/:id as protected routes
    - Wrap protected routes with ProtectedRoute and AppLayout components
    - _Requirements: 3.3, 3.4, 3.5, 3.6_

- [x] 6. Checkpoint - Verify authentication flow
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement organization management
  - [x] 7.1 Create organization Zod schema with type-specific validation
    - Create src/schemas/organization.ts
    - Define base schema with name (min 2 chars, trimmed) and type fields
    - Use discriminated union for type-specific fields (school_district, tax_id, business_domain)
    - Export OrganizationFormData type
    - _Requirements: 4.6, 4.7, 10.2, 10.5_
  
  - [x] 7.2 Create organization API hooks
    - Create src/api/organizations.ts
    - Define query keys for organizations and organization detail
    - Implement useOrganizations() hook fetching organization_directory view
    - Implement useOrganization(id) hook fetching single organization
    - Implement useCreateOrganization() mutation with cache invalidation
    - _Requirements: 4.8, 5.1, 5.9_
  
  - [x] 7.3 Create organization creation page
    - Create src/pages/create-organization-page.tsx
    - Implement form with name and type fields
    - Display conditional type-specific fields based on selected type
    - Use React Hook Form with Zod resolver
    - Call useCreateOrganization() mutation on submit
    - Navigate to directory on success
    - Display loading state during mutation
    - Display error messages on failure
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.13, 10.5, 10.7, 10.8, 10.9, 11.2, 11.3_
  
  - [x] 7.4 Write unit tests for organization creation
    - Test form validation for name length
    - Test type-specific field validation
    - Test successful organization creation
    - Test error handling for database constraints
    - _Requirements: 4.6, 4.7, 4.9, 4.10, 4.11_

- [x] 8. Implement organization directory
  - [x] 8.1 Create organization directory page
    - Create src/pages/organizations-page.tsx
    - Fetch organizations using useOrganizations() hook
    - Display list of organizations with name, type badge, member count, creation date
    - Render type badges with colors (School: blue, Nonprofit: green, Business: purple)
    - Format creation date as relative time (e.g., "2 days ago")
    - Navigate to organization detail on row click
    - Display empty state when no organizations exist
    - Display loading state during fetch
    - Display error state on failure
    - Add "Create Organization" button
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 11.1, 11.3, 11.5_
  
  - [x] 8.2 Write unit tests for organization directory
    - Test rendering of organization list
    - Test empty state display
    - Test navigation on row click
    - Test type badge colors
    - _Requirements: 5.2, 5.3, 5.7_

- [x] 9. Checkpoint - Verify organization management
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement member invitation system
  - [x] 10.1 Create invitation Zod schema
    - Create src/schemas/invitation.ts
    - Define schema with email (RFC 5322 format, lowercase transform) and role fields
    - Export InvitationFormData type
    - _Requirements: 7.3, 7.4, 10.3, 10.6_
  
  - [x] 10.2 Implement invite-member Edge Function
    - Create supabase/functions/invite-member/index.ts
    - Validate request body using Zod schema
    - Get authenticated user from Authorization header
    - Verify user owns the organization (created_by = user.id)
    - Return 403 Forbidden if verification fails
    - Insert organization_members record with status = 'invited'
    - Handle unique constraint violation (409 Conflict for duplicate email)
    - Return success response with member data
    - _Requirements: 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 12.6_
  
  - [x] 10.3 Create member invitation API hook
    - Add useMembers(orgId) hook to src/api/organizations.ts
    - Implement useInviteMember() mutation calling Edge Function
    - Invalidate members cache on success
    - _Requirements: 7.5, 7.12_
  
  - [x] 10.4 Create organization detail page with member list
    - Create src/pages/organization-detail-page.tsx
    - Fetch organization and members using hooks
    - Display organization name, type, and type-specific field value
    - Display members list with email, status badge, role, invitation date
    - Render status badges (invited: yellow, active: green)
    - Format invitation date as relative time
    - Display empty state when no members exist
    - Add "Invite Member" button navigating to invitation form
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [x] 10.5 Create member invitation form
    - Add invitation form to organization detail page or create separate component
    - Implement form with email and role fields
    - Offer role options: member and manager
    - Use React Hook Form with Zod resolver
    - Call useInviteMember() mutation on submit
    - Display error message for duplicate invitations (409 Conflict)
    - Navigate back to organization detail on success
    - _Requirements: 7.1, 7.2, 7.5, 7.11, 7.12, 10.6, 10.7, 10.8, 10.9, 11.2, 11.3_
  
  - [x] 10.6 Write integration tests for member invitation
    - Test successful member invitation
    - Test duplicate email handling
    - Test unauthorized organization access
    - Test email validation and lowercase transformation
    - _Requirements: 7.8, 7.10, 7.11_

- [x] 11. Implement UI components and styling
  - [x] 11.1 Create reusable UI components
    - Ensure shadcn/ui components exist: Button, Card, Input, Label, Select, Badge, FormField
    - Create or update components in src/components/ui/
    - Apply TailwindCSS styling
    - Ensure accessibility compliance (ARIA labels, keyboard navigation)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 11.2 Apply global styles and theme
    - Update src/styles.css with Tailwind directives
    - Configure tailwind.config.ts with color scheme
    - Ensure consistent spacing and typography
    - _Requirements: 11.1_

- [x] 12. Configure deployment and environment
  - [x] 12.1 Configure Vercel deployment
    - Create or update vercel.json with build configuration
    - Set build command to "npm run build"
    - Set output directory to "dist"
    - Configure environment variables in Vercel dashboard (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
    - Set up production environment for main branch
    - Set up preview environment for development branch
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
  
  - [x] 12.2 Write deployment verification tests
    - Test build process completes without errors
    - Test TypeScript compilation with tsc --noEmit
    - Test environment variable loading
    - _Requirements: 15.8_

- [x] 13. Final integration and testing
  - [x] 13.1 Verify end-to-end user flows
    - Test complete sign-up flow
    - Test complete sign-in and sign-out flow
    - Test organization creation with all three types
    - Test organization directory display
    - Test member invitation flow
    - Test error handling for all forms
    - _Requirements: 1.1-1.11, 4.1-4.13, 5.1-5.9, 6.1-6.8, 7.1-7.13_
  
  - [x] 13.2 Verify RLS policies are enforced
    - Test that admins cannot access other admins' organizations
    - Test that non-admin users cannot create organizations
    - Test that admins cannot invite members to organizations they don't own
    - _Requirements: 8.1-8.12_
  
  - [x] 13.3 Write integration tests for critical paths
    - Test authentication flow
    - Test organization CRUD operations
    - Test member invitation with RLS enforcement
    - _Requirements: 8.7, 8.11_

- [x] 14. Final checkpoint - Production readiness
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- The implementation uses TypeScript throughout (React, Zod, Supabase types)
- Database schema must be deployed before frontend implementation
- RLS policies are critical for security and must be tested thoroughly
- All forms use React Hook Form with Zod validation for type safety
- React Query handles caching and automatic refetching for optimal UX

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["4.2", "5.1"] },
    { "id": 5, "tasks": ["4.3", "5.2"] },
    { "id": 6, "tasks": ["5.3", "7.1"] },
    { "id": 7, "tasks": ["7.2"] },
    { "id": 8, "tasks": ["7.3", "8.1"] },
    { "id": 9, "tasks": ["7.4", "8.2", "10.1"] },
    { "id": 10, "tasks": ["10.2"] },
    { "id": 11, "tasks": ["10.3"] },
    { "id": 12, "tasks": ["10.4"] },
    { "id": 13, "tasks": ["10.5", "11.1"] },
    { "id": 14, "tasks": ["10.6", "11.2"] },
    { "id": 15, "tasks": ["12.1"] },
    { "id": 16, "tasks": ["12.2", "13.1"] },
    { "id": 17, "tasks": ["13.2"] },
    { "id": 18, "tasks": ["13.3"] }
  ]
}
```
