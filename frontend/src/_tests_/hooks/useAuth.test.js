import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../src/hooks/useAuth';

describe('useAuth Hook', () => {
  test('should validate CNPJ correctly', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.validateCNPJ('11.222.333/0001-81')).toBe(true);
    expect(result.current.validateCNPJ('invalid')).toBe(false);
  });

  test('should handle login flow', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      const success = await result.current.login('test@test.com', 'password');
      expect(success).toBe(true);
    });
  });
});