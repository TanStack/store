<script lang="ts">
  import Display from './Display.svelte'
  import Increment from './Increment.svelte'
</script>

<h1>How many of your friends like cats or dogs?</h1>
<p>
  Press one of the buttons to add a counter of how many of your friends like
  cats or dogs
</p>
<Increment animal="dogs" />
<Display animal="dogs" />
<Increment animal="cats" />
<Display animal="cats" />
