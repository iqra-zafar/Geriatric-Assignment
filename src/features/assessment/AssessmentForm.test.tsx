import { render, screen, userEvent } from '@test-utils';
import { AssessmentForm } from './AssessmentForm';
import { samplePatient } from './fixture';
import { assessmentSchema } from './schema';

const emptyFormErrors = [
  'Must look like MRN-004821',
  'Patient name must be at least 2 characters',
  'Date of birth is required',
  'Assessment date is required',
  'Select a mobility status',
  'Barthel Index score is required',
  'Enter the number of regular medications',
  'Next review date is required',
  'Consent must be obtained before the assessment can be saved',
];

const crossFieldErrors = [
  'This pathway is for patients aged 60 and over',
  'Next review must be after the assessment date',
  'Five or more medications is polypharmacy: a pharmacist review is required',
];

function issuePaths(result: ReturnType<typeof assessmentSchema.safeParse>) {
  return result.success ? [] : result.error.issues.map((issue) => String(issue.path[0]));
}

function issueMessage(result: ReturnType<typeof assessmentSchema.safeParse>, path: string) {
  return result.success
    ? undefined
    : result.error.issues.find((issue) => issue.path[0] === path)?.message;
}

describe('assessmentSchema age boundary', () => {
  it('accepts a patient who turns 60 on the assessment date', () => {
    const result = assessmentSchema.safeParse({
      ...samplePatient,
      dateOfBirth: '1966-08-07',
      assessmentDate: '2026-08-07',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a patient who turns 60 the day after the assessment', () => {
    const result = assessmentSchema.safeParse({
      ...samplePatient,
      dateOfBirth: '1966-08-08',
      assessmentDate: '2026-08-07',
    });

    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContain('dateOfBirth');
    expect(issueMessage(result, 'dateOfBirth')).toBe(
      'This pathway is for patients aged 60 and over'
    );
  });

  it('accepts the Barthel bounds and fewer than five medications without a review', () => {
    expect(assessmentSchema.safeParse({ ...samplePatient, barthelIndex: 0 }).success).toBe(true);
    expect(assessmentSchema.safeParse({ ...samplePatient, barthelIndex: 100 }).success).toBe(true);
    expect(
      assessmentSchema.safeParse({
        ...samplePatient,
        medicationCount: 4,
        pharmacistReviewRequested: false,
      }).success
    ).toBe(true);
  });

  it('attaches each invalid clinical value to its own field', () => {
    const cases: Array<{ values: Record<string, unknown>; path: string }> = [
      { values: { ...samplePatient, mrn: 'MRN-4821' }, path: 'mrn' },
      { values: { ...samplePatient, patientName: 'S' }, path: 'patientName' },
      { values: { ...samplePatient, mobility: 'crutches' }, path: 'mobility' },
      { values: { ...samplePatient, barthelIndex: 82 }, path: 'barthelIndex' },
      { values: { ...samplePatient, barthelIndex: 105 }, path: 'barthelIndex' },
      {
        values: { ...samplePatient, medicationCount: 5, pharmacistReviewRequested: false },
        path: 'pharmacistReviewRequested',
      },
      {
        values: { ...samplePatient, assessmentDate: '2026-08-07', followUpDate: '2026-08-07' },
        path: 'followUpDate',
      },
      { values: { ...samplePatient, consentObtained: false }, path: 'consentObtained' },
    ];

    for (const testCase of cases) {
      const result = assessmentSchema.safeParse(testCase.values);

      expect(result.success).toBe(false);
      expect(issuePaths(result)).toContain(testCase.path);
    }
  });
});

describe('AssessmentForm', () => {
  it('renders every assessment field without showing errors', async () => {
    const user = userEvent.setup();
    render(<AssessmentForm />);

    expect(screen.getByRole('heading', { name: 'Geriatric Care Assessment' })).toBeInTheDocument();
    expect(screen.getByLabelText('Medical record number')).toHaveAttribute(
      'placeholder',
      'MRN-004821'
    );
    expect(screen.getByLabelText('Patient name')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of birth')).toBeInTheDocument();
    expect(screen.getByLabelText('Assessment date')).toBeInTheDocument();
    expect(screen.getByLabelText('Barthel Index')).toBeInTheDocument();
    expect(screen.getByLabelText('Regular medications')).toBeInTheDocument();
    expect(screen.getByLabelText('Pharmacist review requested')).not.toBeChecked();
    expect(screen.getByLabelText('Next review date')).toBeInTheDocument();
    expect(screen.getByLabelText('Patient or representative has given consent')).not.toBeChecked();

    await user.click(screen.getByRole('combobox', { name: 'Mobility' }));
    expect(screen.getByRole('option', { name: 'Independent' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cane' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Walker' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Wheelchair' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Bedbound' })).toBeInTheDocument();

    for (const message of emptyFormErrors) {
      expect(screen.queryByText(message)).not.toBeInTheDocument();
    }
  });

  it('validates the blurred field and leaves untouched fields quiet', async () => {
    const user = userEvent.setup();
    render(<AssessmentForm />);

    await user.click(screen.getByLabelText('Medical record number'));
    await user.tab();

    expect(screen.getByText('Must look like MRN-004821')).toBeInTheDocument();
    expect(
      screen.queryByText('Patient name must be at least 2 characters')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Date of birth is required')).not.toBeInTheDocument();
  });

  it('shows exactly the nine required errors for a blank submit', async () => {
    const user = userEvent.setup();
    render(<AssessmentForm />);

    await user.click(screen.getByRole('button', { name: 'Save assessment' }));

    for (const message of emptyFormErrors) {
      expect(screen.getByText(message)).toBeInTheDocument();
    }

    for (const message of crossFieldErrors) {
      expect(screen.queryByText(message)).not.toBeInTheDocument();
    }

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('loads the sample patient and displays the parsed values after save', async () => {
    const user = userEvent.setup();
    render(<AssessmentForm />);

    await user.click(screen.getByRole('button', { name: 'Load sample patient' }));

    expect(screen.getByLabelText('Medical record number')).toHaveValue(samplePatient.mrn);
    expect(screen.getByLabelText('Patient name')).toHaveValue(samplePatient.patientName);
    expect(screen.getByLabelText('Pharmacist review requested')).not.toBeChecked();
    expect(screen.getByLabelText('Patient or representative has given consent')).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Save assessment' }));

    expect(screen.getByRole('button', { name: 'Save assessment' })).toBeDisabled();

    const alert = await screen.findByRole('alert', undefined, { timeout: 3000 });
    expect(alert).toHaveTextContent('Assessment saved successfully');

    const saved = document.querySelector('pre');
    expect(saved).not.toBeNull();
    expect(JSON.parse(saved?.textContent ?? '')).toEqual(samplePatient);
  });
});
