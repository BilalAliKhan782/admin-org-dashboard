# Requirements Document

## Introduction

The Admin Dashboard is a production-ready web application that enables administrators to manage organizations and their members. The system provides secure authentication, organization creation with type-specific attributes, member invitation workflows, and a comprehensive directory view. The application enforces role-based access control ensuring admins can only manage their own organizations.

## Glossary

- **Admin**: A user with elevated privileges who can create and manage organizations
- **Organization**: A structured entity with a specific type (School, Nonprofit, or Business) that contains members
- **Member**: An individual associated with an organization, either invited or active
- **Invitation**: A record representing a pending member addition to an organization
- **Auth_System**: The Supabase authentication service managing user sessions
- **Database**: The PostgreSQL database with Row Level Security policies
- **Frontend**: The React-based user interface
- **Edge_Function**: Server-side Deno function running on Supabase infrastructure
- **RLS_Policy**: Row Level Security policy enforcing data access rules
- **Organization_Type**: An enumeration of valid organization categories (school, nonprofit, business)
- **Member_Status**: An enumeration of member states (invited, active)
- **Protected_Route**: A route that requires authentication to access
- **Directory**: A list view of all organizations with summary information

## Requirements

### Requirement 1: Admin Authentication

**User Story:** As an administrator, I want to securely sign up and sign in to the system, so that I can access organization management features.

#### Acceptance Criteria

1. THE Auth_System SHALL provide a sign-up form accepting email and password
2. WHEN a user submits valid sign-up credentials, THE Auth_System SHALL create a user account and profile record
3. WHEN a user submits sign-up credentials with an existing email, THE Auth_System SHALL return an error message indicating the email is already registered
4. THE Auth_System SHALL validate email format using RFC 5322 standard
5. THE Auth_System SHALL enforce password minimum length of 8 characters
6. THE Auth_System SHALL provide a sign-in form accepting email and password
7. WHEN a user submits valid sign-in credentials, THE Auth_System SHALL authenticate the user and establish a session
8. WHEN a user submits invalid sign-in credentials, THE Auth_System SHALL return an error message without revealing whether email or password was incorrect
9. THE Frontend SHALL display the authenticated user's email address in the application header
10. THE Frontend SHALL provide a sign-out control that terminates the user session
11. WHEN a user signs out, THE Auth_System SHALL clear the session and redirect to the sign-in page

### Requirement 2: Profile Management

**User Story:** As a system administrator, I want user profiles to be automatically created and managed, so that access control can be enforced.

#### Acceptance Criteria

1. WHEN a new user account is created, THE Database SHALL automatically create a corresponding profile record
2. THE Database SHALL store the user's email, full name, admin status, and creation timestamp in the profile
3. THE Database SHALL set is_admin to false by default for new profiles
4. THE RLS_Policy SHALL allow users to read only their own profile
5. THE RLS_Policy SHALL allow users to update only their own profile
6. THE Database SHALL prevent deletion of profiles while the associated user account exists

### Requirement 3: Protected Routes

**User Story:** As a system architect, I want unauthenticated users to be redirected to sign-in, so that organization management features remain secure.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access a Protected_Route, THE Frontend SHALL redirect to the sign-in page
2. WHEN an authenticated user accesses a Protected_Route, THE Frontend SHALL render the requested page
3. THE Frontend SHALL protect the organization directory route
4. THE Frontend SHALL protect the organization creation route
5. THE Frontend SHALL protect the organization detail route
6. THE Frontend SHALL allow unauthenticated access to the sign-in and sign-up routes

### Requirement 4: Organization Creation

**User Story:** As an admin, I want to create organizations with specific types and attributes, so that I can manage different kinds of entities.

#### Acceptance Criteria

1. THE Frontend SHALL provide an organization creation form with name and type fields
2. THE Frontend SHALL offer exactly three organization types: School, Nonprofit, and Business
3. WHEN the user selects School type, THE Frontend SHALL display a required school_district field
4. WHEN the user selects Nonprofit type, THE Frontend SHALL display a required tax_id field
5. WHEN the user selects Business type, THE Frontend SHALL display a required business_domain field
6. THE Frontend SHALL validate organization name has minimum length of 2 characters after trimming whitespace
7. THE Frontend SHALL validate type-specific fields are non-empty when their type is selected
8. WHEN the user submits a valid organization form, THE Database SHALL create an organization record with created_by set to the authenticated user's ID
9. THE Database SHALL enforce that School organizations have school_district populated and tax_id and business_domain null
10. THE Database SHALL enforce that Nonprofit organizations have tax_id populated and school_district and business_domain null
11. THE Database SHALL enforce that Business organizations have business_domain populated and school_district and tax_id null
12. THE RLS_Policy SHALL allow only users with is_admin true to create organizations
13. WHEN an organization is successfully created, THE Frontend SHALL invalidate the organization list cache and navigate to the directory

### Requirement 5: Organization Directory

**User Story:** As an admin, I want to view all organizations I created with summary information, so that I can navigate to specific organizations.

#### Acceptance Criteria

1. THE Frontend SHALL display a list of all organizations created by the authenticated admin
2. THE Frontend SHALL display organization name, type, member count, and creation date for each organization
3. THE Frontend SHALL render organization type as a colored badge (School: blue, Nonprofit: green, Business: purple)
4. THE Frontend SHALL format creation date as a human-readable relative time (e.g., "2 days ago")
5. THE Frontend SHALL display member count as an integer
6. WHEN the user clicks an organization row, THE Frontend SHALL navigate to the organization detail page
7. WHEN no organizations exist, THE Frontend SHALL display an empty state message prompting the user to create an organization
8. THE Database SHALL provide a view that joins organizations with member counts
9. THE RLS_Policy SHALL allow admins to read only organizations where created_by matches their user ID

### Requirement 6: Organization Detail View

**User Story:** As an admin, I want to view detailed information about an organization and its members, so that I can manage the organization effectively.

#### Acceptance Criteria

1. THE Frontend SHALL display the organization name, type, and type-specific field value
2. THE Frontend SHALL display a list of all members associated with the organization
3. THE Frontend SHALL display member email, status, role, and invitation date for each member
4. THE Frontend SHALL render member status as a badge (invited: yellow, active: green)
5. THE Frontend SHALL format invitation date as a human-readable relative time
6. WHEN no members exist, THE Frontend SHALL display an empty state message
7. THE Frontend SHALL provide a button to navigate to the member invitation form
8. THE RLS_Policy SHALL allow admins to read members only for organizations they created

### Requirement 7: Member Invitation

**User Story:** As an admin, I want to invite members to an organization by email, so that I can build the organization's membership.

#### Acceptance Criteria

1. THE Frontend SHALL provide a member invitation form with email and role fields
2. THE Frontend SHALL offer two role options: member and manager
3. THE Frontend SHALL validate email format using RFC 5322 standard
4. THE Frontend SHALL convert email to lowercase before submission
5. WHEN the user submits a valid invitation form, THE Frontend SHALL call the Edge_Function with organization_id, email, and role
6. THE Edge_Function SHALL validate the request body matches the invitation schema
7. THE Edge_Function SHALL verify the authenticated user is the creator of the specified organization
8. WHEN the organization verification fails, THE Edge_Function SHALL return a 403 Forbidden error
9. THE Edge_Function SHALL insert an organization_members record with status set to invited
10. THE Database SHALL enforce a unique constraint on organization_id and email combinations
11. WHEN a duplicate invitation is attempted, THE Edge_Function SHALL return a 409 Conflict error with a descriptive message
12. WHEN an invitation is successfully created, THE Frontend SHALL invalidate the members list cache and navigate to the organization detail page
13. THE RLS_Policy SHALL allow admins to insert members only for organizations they created

### Requirement 8: Data Security

**User Story:** As a security architect, I want Row Level Security policies enforced on all tables, so that admins can only access their own data.

#### Acceptance Criteria

1. THE Database SHALL enable Row Level Security on the profiles table
2. THE Database SHALL enable Row Level Security on the organizations table
3. THE Database SHALL enable Row Level Security on the organization_members table
4. THE RLS_Policy SHALL prevent users from reading profiles other than their own
5. THE RLS_Policy SHALL prevent users from updating profiles other than their own
6. THE RLS_Policy SHALL prevent non-admin users from creating organizations
7. THE RLS_Policy SHALL prevent admins from reading organizations created by other admins
8. THE RLS_Policy SHALL prevent admins from updating organizations created by other admins
9. THE RLS_Policy SHALL prevent admins from deleting organizations created by other admins
10. THE RLS_Policy SHALL prevent admins from reading members of organizations created by other admins
11. THE RLS_Policy SHALL prevent admins from inserting members into organizations created by other admins
12. THE RLS_Policy SHALL prevent admins from updating members of organizations created by other admins

### Requirement 9: Database Schema Integrity

**User Story:** As a database administrator, I want proper foreign keys and constraints enforced, so that data integrity is maintained.

#### Acceptance Criteria

1. THE Database SHALL define organization_type as an enum with values: school, nonprofit, business
2. THE Database SHALL define member_status as an enum with values: invited, active
3. THE Database SHALL define member_role as an enum with values: member, manager
4. THE Database SHALL enforce a foreign key from profiles.id to auth.users.id with cascade delete
5. THE Database SHALL enforce a foreign key from organizations.created_by to auth.users.id with cascade delete
6. THE Database SHALL enforce a foreign key from organization_members.organization_id to organizations.id with cascade delete
7. THE Database SHALL enforce a foreign key from organization_members.user_id to auth.users.id with set null delete
8. THE Database SHALL create an index on organizations.created_by for query performance
9. THE Database SHALL create an index on organization_members.organization_id for query performance
10. THE Database SHALL enforce email format validation using a regular expression check constraint
11. THE Database SHALL enforce email lowercase constraint on organization_members.email

### Requirement 10: Client-Side Validation

**User Story:** As a frontend developer, I want all forms validated with Zod schemas, so that invalid data is caught before submission.

#### Acceptance Criteria

1. THE Frontend SHALL define a Zod schema for authentication forms with email and password fields
2. THE Frontend SHALL define a Zod schema for organization creation with name, type, and conditional type-specific fields
3. THE Frontend SHALL define a Zod schema for member invitation with email and role fields
4. THE Frontend SHALL validate authentication forms using React Hook Form with Zod resolver
5. THE Frontend SHALL validate organization creation forms using React Hook Form with Zod resolver
6. THE Frontend SHALL validate invitation forms using React Hook Form with Zod resolver
7. WHEN a form field fails validation, THE Frontend SHALL display an inline error message below the field
8. THE Frontend SHALL disable form submission while validation errors exist
9. THE Frontend SHALL display field-level errors in real-time as the user types

### Requirement 11: Loading and Error States

**User Story:** As a user, I want clear feedback during asynchronous operations, so that I understand the system state.

#### Acceptance Criteria

1. WHEN data is being fetched, THE Frontend SHALL display a loading indicator
2. WHEN a mutation is in progress, THE Frontend SHALL disable the submit button and show a loading state
3. WHEN an API request fails, THE Frontend SHALL display an error message describing the failure
4. WHEN a network error occurs, THE Frontend SHALL display a user-friendly error message
5. WHEN a list query returns no results, THE Frontend SHALL display an empty state with guidance
6. THE Frontend SHALL clear error messages when the user retries the operation

### Requirement 12: Environment Configuration

**User Story:** As a deployment engineer, I want environment variables properly configured, so that the application connects to the correct Supabase instance.

#### Acceptance Criteria

1. THE Frontend SHALL read Supabase URL from VITE_SUPABASE_URL environment variable
2. THE Frontend SHALL read Supabase anonymous key from VITE_SUPABASE_ANON_KEY environment variable
3. WHEN required environment variables are missing, THE Frontend SHALL display a configuration error message
4. THE Frontend SHALL not commit environment variable values to version control
5. THE Frontend SHALL provide an .env.example file documenting required variables
6. THE Edge_Function SHALL access the service role key from Supabase-provided environment variables

### Requirement 13: Deployment Configuration

**User Story:** As a DevOps engineer, I want the application deployed to Vercel with production and preview environments, so that changes can be tested before release.

#### Acceptance Criteria

1. THE Frontend SHALL be configured as a Vite application in vercel.json
2. THE Frontend SHALL deploy the main branch to Vercel production environment
3. THE Frontend SHALL deploy the development branch to Vercel preview environment
4. THE Frontend SHALL configure VITE_SUPABASE_URL in both Vercel environments
5. THE Frontend SHALL configure VITE_SUPABASE_ANON_KEY in both Vercel environments
6. THE Frontend SHALL build successfully using the npm run build command
7. THE Frontend SHALL serve the built application from the dist directory

### Requirement 14: Git Workflow

**User Story:** As a project manager, I want a clean git history with meaningful commits and pull requests, so that changes are reviewable and traceable.

#### Acceptance Criteria

1. THE Repository SHALL maintain a main branch for production-ready code
2. THE Repository SHALL maintain a development branch for integration
3. THE Repository SHALL create feature branches from development for new work
4. THE Repository SHALL merge at least two pull requests into development
5. THE Repository SHALL use conventional commit messages describing the change
6. THE Repository SHALL include a descriptive pull request title under 70 characters
7. THE Repository SHALL include a pull request description summarizing changes and testing performed

### Requirement 15: Type Safety

**User Story:** As a TypeScript developer, I want comprehensive type definitions for the database schema, so that compile-time errors catch data mismatches.

#### Acceptance Criteria

1. THE Frontend SHALL define TypeScript types for OrganizationType with values: school, nonprofit, business
2. THE Frontend SHALL define TypeScript types for MemberStatus with values: invited, active
3. THE Frontend SHALL define TypeScript types for MemberRole with values: member, manager
4. THE Frontend SHALL define a Database interface matching the Supabase schema
5. THE Frontend SHALL define Row, Insert, and Update types for each table
6. THE Frontend SHALL define relationship types for foreign keys
7. THE Frontend SHALL enable TypeScript strict mode in tsconfig.json
8. THE Frontend SHALL compile without type errors using the tsc command
