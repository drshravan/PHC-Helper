import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { test, expect } from 'vitest';

test('renders the home page with all links', () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );

  expect(screen.getByText('🐶 Dog Bite Management')).toBeInTheDocument();
  expect(screen.getByText('🤰 EDD List')).toBeInTheDocument();
  expect(screen.getByText('🏥 PHC Data')).toBeInTheDocument();
  expect(screen.getByText('🧪 Test Page')).toBeInTheDocument();
  expect(screen.getByText('🤰 Pregnancy Calculator')).toBeInTheDocument();
});
