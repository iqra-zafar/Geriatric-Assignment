import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { AssessmentForm } from './features/assessment/AssessmentForm';
import { theme } from './theme';

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <DatesProvider settings={{ consistentWeeks: true }}>
        <AssessmentForm />
      </DatesProvider>
    </MantineProvider>
  );
}
