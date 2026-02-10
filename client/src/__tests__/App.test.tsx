import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App';

describe('App Component', () => {
  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByText('ASI Website')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
