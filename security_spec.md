# Security Specification: DataMindDQ

## Data Invariants
1. **User Identity**: Every user must have a profile in `/users/{userId}` where `{userId}` matches their Auth UID.
2. **Rule Integrity**: Data Quality rules in `/dq_rules` must have a valid name, dimension, table ID, and status.
3. **Role-Based Access**: 
   - `admin`: Full access to everything.
   - `steward`: Can create and edit rules.
   - `analyst`: Can view rules and scans.

## The "Dirty Dozen" Payloads (Attack Vectors)
1. **Identity Spoofing**: Attempting to create a rule with someone else as `author`.
2. **ID Poisoning**: Attempting to use a 1KB string as a `ruleId`.
3. **Ghost Fields**: Adding `isVerified: true` to a rule to bypass logic.
4. **State Shortcutting**: Updating a rule status from `active` to `deleted` (if deleted was terminal).
5. **PII Leak**: An analyst trying to read another user's private data.
6. **Orphaned Writes**: Creating a scan result for a non-existent rule.
7. **Resource Exhaustion**: Writing a 1MB string to a table ID field.
8. **Shadow Updates**: Changing the `tableId` of an existing rule (immutable field).
9. **Email Spoofing**: Using an admin email but with `email_verified: false`.
10. **Admin Escalation**: An analyst trying to update their own role to `admin`.
11. **Blanket Read Scam**: Trying to list all user profiles without a UID filter.
12. **System Infiltration**: Trying to write to the `system/ping` document.

## Logic Patch Delta
- **Pillar 1 (Master Gate)**: Added `dq_rules` and `scans` collection paths.
- **Pillar 2 (Validation Blueprints)**: Implemented `isValidUser`, `isValidRule`, `isValidScan`.
- **Pillar 3 (Path Variable Hardening)**: Added `isValidId()` check to all document matches.
- **Pillar 4 (Tiered Identity)**: Split update permissions for users based on `affectedKeys()`.
- **Pillar 6 (PII Isolation)**: Restricted `users` read access to `isOwner()`.
- **Pillar 8 (Secure List)**: Added ` isSignedIn()` and `resource.data` invariants (to be updated).
