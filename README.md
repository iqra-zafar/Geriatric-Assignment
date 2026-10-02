# Geriatric Care Assessment Form

## Overview

This is a frontend take-home assignment: a one-page geriatric care assessment form built with React, TypeScript, Mantine, and Zod. A nurse can enter an assessment, load a made-up sample patient, and save it. Saving is simulated in the browser. There is no backend.

Validation lives in one Zod schema. The form uses `@mantine/form` and `schemaResolver`, so field errors are the schema messages.

## Tech Stack

- React 19
- TypeScript
- Vite
- Mantine
- @mantine/form
- @mantine/dates
- Zod
- dayjs
- Vitest
- React Testing Library

## Features

- 10-field assessment form
- Zod schema validation
- Cross-field validation for age, follow-up date, and polypharmacy
- Blur and submit validation, with untouched fields left quiet
- Sample patient fixture
- Simulated save of about 800ms
- Loading state on the save button
- Success alert with the parsed Zod values
- Schema and form tests

## Validation Rules

All of these rules are in `src/features/assessment/schema.ts`:

- Medical record number must look like `MRN-004821`
- Patient name must be 2 to 60 characters
- The patient must be 60 or older on the assessment date, including a 60th birthday
- Mobility must be one of independent, cane, walker, wheelchair, or bedbound
- Barthel Index must be a whole number from 0 to 100 in steps of 5
- Regular medication count must be a whole number from 0 to 30
- Five or more medications requires a pharmacist review
- The next review date must be after the assessment date
- Consent must be obtained before the assessment can be saved

A blank form reports nine errors. `pharmacistReviewRequested` is a boolean, so it is not a required-field error on its own. Cross-field checks do not run while the required dates are empty.

## Running Locally

Use Node.js 24.21.0, the version in `.nvmrc`. The jsdom test environment requires it.

```bash
yarn install
yarn dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

## Testing

```bash
yarn test
```

`yarn test` typechecks, checks formatting, lints, runs Vitest, and builds.

```bash
yarn vitest
```

The tests cover:

- The 60-year age boundary, including a birthday on the assessment date
- Other schema boundaries such as Barthel Index, polypharmacy, follow-up date, and consent
- Rendering all 10 fields, including mobility options derived from `MOBILITY`
- Blur validation that leaves other fields quiet
- A blank submit producing exactly nine required errors and no cross-field errors
- Loading the sample patient, saving, and showing the parsed values

## Build

```bash
yarn build
```

The production files are written to `dist`.

## Deployment

Live Demo: not deployed yet

Replace the line above with the real URL after the app is deployed. Do not leave a guessed URL in its place.

## Time Spent

Approximately:
1 hour

## Unfinished / Future Improvements

No known unfinished requirements from the assignment.

GitHub push and deployment still have to be done outside this workspace. After those are done, put the real demo URL in the Deployment section.
