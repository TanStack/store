import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/svelte'
import { afterEach } from 'vitest'

// https://testing-library.com/docs/svelte-testing-library/api/#cleanup
afterEach(() => cleanup())
