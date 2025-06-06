import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../../src/contexts/AppProvider';
import App from '../../src/App';

describe('Quote Flow Integration', () => {
  test('complete quote request flow', async () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    // Login
    fireEvent.click(screen.getByText('Login'));
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'buyer@test.com' }
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'password' }
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    // Request quote
    await waitFor(() => {
      expect(screen.getByText('Solicitar Cotação')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Solicitar Cotação'));
    
    // Verify modal opens
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});