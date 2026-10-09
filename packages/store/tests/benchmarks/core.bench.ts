import { cases } from './cases'
import { registerBenchmark } from './harness'

cases.forEach(registerBenchmark)
