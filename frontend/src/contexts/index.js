export { AppProvider, useAppContext } from './AppProvider';

/*
BEFORE (múltiplos providers):
<AuthProvider>
  <UIProvider>
    <ProductsProvider>
      <QuotesProvider>
        <App />
      </QuotesProvider>
    </ProductsProvider>
  </UIProvider>
</AuthProvider>

AFTER (provider único):
<AppProvider>
  <App />
</AppProvider>

HOOKS DISPONÍVEIS:
- useAppContext()    // Hook principal com tudo

EXEMPLO DE USO EM COMPONENTES:
import { useAppContext } from '../contexts';
*/