<template>
  <div id="app-container">
    <LoginForm />
  </div>
</template>

<script>
import LoginForm from './components/LoginForm.vue'

export default {
  name: 'App',
  components: {
    LoginForm
  }
}
</script>

<style scoped>
#app-container {
  width: 100%;
  height: 100%;
}
</style>
