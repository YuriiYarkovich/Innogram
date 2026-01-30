import { createNamespace, getNamespace } from 'cls-hooked';

const NAMESPACE = 'namespace';

export const context = getNamespace(NAMESPACE) || createNamespace(NAMESPACE);

export const CONTEXT_KEYS = {
  USER: 'user',
};
