import { EventClient } from '@tanstack/devtools-event-client'

export type StoreDevtoolsEventMap = {
  // TODO implement with your own patterns. My recommendation:
  // * NOUN-VERBED - Emitted during a specific time.
  // * REQUEST-NOUN - Emitted from devtools, expect an action to happen on core
  'store-register-changed': {
    foo?: undefined
  }
}

export const storeDevtoolsEventClient: EventClient<StoreDevtoolsEventMap> =
  new EventClient<StoreDevtoolsEventMap>({
    pluginId: 'tanstack-store',
  })
