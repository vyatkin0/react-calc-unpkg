import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders App', () => {
  render(<App />);
  const element = screen.getByText('Calculation Form');
  expect(element).toBeInTheDocument();
});
