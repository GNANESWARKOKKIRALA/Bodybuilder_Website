import { render, screen } from '@testing-library/react';
import HomePage from '../pages/public/HomePage.jsx';

test('renders main heading', () => {
  render(<HomePage />);
  const heading = screen.getByRole('heading', { name: /welcome to bodybuilder fitness platform/i });
  expect(heading).toBeInTheDocument();
});
