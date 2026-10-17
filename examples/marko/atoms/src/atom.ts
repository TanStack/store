import { createAtom } from '@tanstack/marko-store'

// You can create atoms outside of components, at module scope.
export const countAtom = createAtom(0)
