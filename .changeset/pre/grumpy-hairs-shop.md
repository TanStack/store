---
'@tanstack/vue-store': major
---

Drop Vue 2 support from `@tanstack/vue-store`. The adapter now requires Vue 3 (`vue: ^3.0.0`) and imports Vue APIs and types directly, removing its `vue-demi` dependency and optional `@vue/composition-api` peer dependency.

Vue 2 applications must upgrade to Vue 3 or keep using a previous version of `@tanstack/vue-store`. The adapter's public hooks and their behavior are unchanged for Vue 3 applications.
