import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Code,
  Container,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { schemaResolver, useForm } from '@mantine/form';
import { samplePatient } from './fixture';
import { MOBILITY, assessmentSchema, type Assessment } from './schema';

dayjs.extend(customParseFormat);

const SAVE_DELAY_MS = 800;

type AssessmentFormValues = {
  mrn: string;
  patientName: string;
  dateOfBirth: string | null;
  assessmentDate: string | null;
  mobility: (typeof MOBILITY)[number] | null;
  barthelIndex: number | '';
  medicationCount: number | '';
  pharmacistReviewRequested: boolean;
  followUpDate: string | null;
  consentObtained: boolean;
};

const initialValues: AssessmentFormValues = {
  mrn: '',
  patientName: '',
  dateOfBirth: null,
  assessmentDate: null,
  mobility: null,
  barthelIndex: '',
  medicationCount: '',
  pharmacistReviewRequested: false,
  followUpDate: null,
  consentObtained: false,
};

const mobilityOptions = MOBILITY.map((value) => ({
  value,
  label: formatMobilityLabel(value),
}));

function formatMobilityLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function AssessmentForm() {
  const [saving, setSaving] = useState(false);
  const [savedAssessment, setSavedAssessment] = useState<Assessment | null>(null);
  const today = dayjs().format('YYYY-MM-DD');

  const form = useForm<AssessmentFormValues, Assessment>({
    mode: 'controlled',
    initialValues,
    validate: schemaResolver(assessmentSchema, { sync: true }),
    validateInputOnBlur: true,
    transformValues: (values) => assessmentSchema.parse(values),
  });

  const loadSamplePatient = () => {
    form.setValues(samplePatient);
    form.clearErrors();
    setSavedAssessment(null);
  };

  const handleSubmit = async (values: Assessment) => {
    setSaving(true);

    await delay(SAVE_DELAY_MS);

    setSavedAssessment(values);
    setSaving(false);
  };

  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" radius="md">
        <Stack gap="lg">
          <div>
            <Title order={1}>Geriatric Care Assessment</Title>
            <Text c="dimmed" mt="xs">
              Complete the assessment and save it. Validation runs when you leave a field and again
              when you save.
            </Text>
          </div>

          <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
            <Stack gap="md">
              <TextInput
                label="Medical record number"
                placeholder="MRN-004821"
                {...form.getInputProps('mrn')}
              />

              <TextInput label="Patient name" {...form.getInputProps('patientName')} />

              <DateInput label="Date of birth" {...form.getInputProps('dateOfBirth')} />

              <DateInput
                label="Assessment date"
                maxDate={today}
                {...form.getInputProps('assessmentDate')}
              />

              <Select label="Mobility" data={mobilityOptions} {...form.getInputProps('mobility')} />

              <NumberInput
                label="Barthel Index"
                step={5}
                min={0}
                max={100}
                clampBehavior="none"
                {...form.getInputProps('barthelIndex')}
              />

              <NumberInput
                label="Regular medications"
                min={0}
                max={30}
                clampBehavior="none"
                {...form.getInputProps('medicationCount')}
              />

              <Checkbox
                label="Pharmacist review requested"
                {...form.getInputProps('pharmacistReviewRequested', { type: 'checkbox' })}
              />

              <DateInput label="Next review date" {...form.getInputProps('followUpDate')} />

              <Checkbox
                label="Patient or representative has given consent"
                {...form.getInputProps('consentObtained', { type: 'checkbox' })}
              />

              <Group>
                <Button
                  type="button"
                  variant="default"
                  onClick={loadSamplePatient}
                  disabled={saving}
                >
                  Load sample patient
                </Button>
                <Button type="submit" loading={saving}>
                  Save assessment
                </Button>
              </Group>
            </Stack>
          </form>

          {savedAssessment && (
            <Stack gap="sm">
              <Alert color="green" title="Assessment saved successfully">
                The assessment was saved. The values below are the parsed result.
              </Alert>
              <Code block>{JSON.stringify(savedAssessment, null, 2)}</Code>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
