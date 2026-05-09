<template>
  <div class="login-container">
    <!-- Visual side -->
    <div class="login-visual">
      <div class="phone-image">
        <div class="phone-screen">
          📸 Your Stories Here
        </div>
      </div>
    </div>

    <!-- Form side -->
    <div class="login-form-wrapper">
      <form class="login-form" @submit.prevent="handleLogin">
        <!-- Logo -->
        <div class="logo">
          <div class="instagram-logo">Instagram</div>
        </div>

        <!-- Error Message -->
        <div class="error-message" :class="{ show: errorMessage }">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div class="success-message" :class="{ show: successMessage }">
          {{ successMessage }}
        </div>

        <!-- Social Login -->
        <div class="social-login">
          <button type="button" class="social-btn" @click="loginWithFacebook">
            f Facebook
          </button>
          <button type="button" class="social-btn" @click="loginWithGoogle">
            Google
          </button>
        </div>

        <div class="divider">
          <span>OR</span>
        </div>

        <!-- Email Input -->
        <div class="form-group">
          <label>Username or Email</label>
          <input
            type="text"
            v-model="formData.username"
            placeholder="Enter your username or email"
            required
            @focus="clearMessages"
          />
        </div>

        <!-- Password Input -->
        <div class="form-group">
          <label>Password</label>
          <input
            type="password"
            v-model="formData.password"
            placeholder="Enter your password"
            required
            @focus="clearMessages"
          />
        </div>

        <!-- Remember Me -->
        <div class="form-group remember-group">
          <input
            type="checkbox"
            id="remember"
            v-model="formData.rememberMe"
          />
          <label for="remember">Remember me</label>
        </div>

        <!-- Login Button -->
        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Log in' }}
        </button>

        <!-- Forgot Password -->
        <div class="forgot-password">
          <a href="#" @click.prevent="handleForgotPassword">Forgot password?</a>
        </div>

        <!-- Signup Prompt -->
        <div class="signup-prompt">
          Don't have an account? 
          <a href="#" @click.prevent="handleSignup">Sign up</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',
  data() {
    return {
      formData: {
        username: '',
        password: '',
        rememberMe: false
      },
      isLoading: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      this.clearMessages()
      this.isLoading = true

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: this.formData.username,
            password: this.formData.password
          })
        })

        const data = await response.json()

        if (!response.ok) {
          this.errorMessage = data.error || 'Login failed'
          this.isLoading = false
          return
        }

        this.successMessage = '✓ Login successful! Welcome back.'
        
        // Store token
        if (data.token) {
          localStorage.setItem('authToken', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
        }

        this.formData.username = ''
        this.formData.password = ''

        setTimeout(() => {
          alert('Redirecting to homepage...')
        }, 1500)
      } catch (error) {
        this.errorMessage = 'Network error. Please try again.'
        console.error(error)
      }

      this.isLoading = false
    },
    loginWithFacebook() {
      this.successMessage = '✓ Facebook login initiated...'
      setTimeout(() => this.clearMessages(), 2000)
    },
    loginWithGoogle() {
      this.successMessage = '✓ Google login initiated...'
      setTimeout(() => this.clearMessages(), 2000)
    },
    handleForgotPassword() {
      this.successMessage = 'Password reset link has been sent to your email.'
      setTimeout(() => this.clearMessages(), 3000)
    },
    handleSignup() {
      this.successMessage = 'Redirecting to signup page...'
      setTimeout(() => this.clearMessages(), 2000)
    },
    clearMessages() {
      this.errorMessage = ''
      this.successMessage = ''
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background: #fafafa;
}

.login-visual {
  flex: 1;
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  display: none;
}

@media (min-width: 876px) {
  .login-visual {
    display: flex;
  }
}

.phone-image {
  width: 250px;
  height: 500px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  padding: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  text-align: center;
  padding: 20px;
}

.login-form-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 40px;
  background: white;
  min-height: 100vh;
}

@media (max-width: 875px) {
  .login-form-wrapper {
    padding: 0 20px;
  }
}

.login-form {
  width: 100%;
  max-width: 350px;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.instagram-logo {
  font-size: 32px;
  font-weight: 300;
  letter-spacing: 1px;
  font-family: 'Brush Script MT', cursive;
  color: #000;
}

.form-group {
  margin-bottom: 10px;
}

.form-group label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #dbdbdb;
  border-radius: 3px;
  font-size: 12px;
  background-color: #fafafa;
  outline: none;
  transition: all 0.2s;
}

.form-group input[type="text"]:focus,
.form-group input[type="password"]:focus {
  background-color: #fff;
  border-color: #b2b2b2;
}

.remember-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.remember-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
  cursor: pointer;
}

.remember-group label {
  margin: 0;
  font-size: 12px;
  cursor: pointer;
}

.login-btn {
  width: 100%;
  padding: 8px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 3px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin-top: 15px;
  transition: opacity 0.2s;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  margin: 15px 0;
  color: #999;
  font-size: 13px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #dbdbdb;
}

.divider span {
  margin: 0 10px;
  color: #999;
}

.social-login {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.social-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #dbdbdb;
  background: white;
  color: #385185;
  border-radius: 3px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.social-btn:hover {
  background: #f5f5f5;
}

.forgot-password {
  text-align: center;
  margin-top: 12px;
}

.forgot-password a {
  color: #385185;
  font-size: 12px;
  text-decoration: none;
}

.forgot-password a:hover {
  color: #5a8ecf;
}

.signup-prompt {
  text-align: center;
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid #e5e5e5;
  font-size: 13px;
  color: #999;
}

.signup-prompt a {
  color: #385185;
  font-weight: 600;
  text-decoration: none;
}

.signup-prompt a:hover {
  color: #5a8ecf;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 8px;
  border-radius: 3px;
  margin-bottom: 10px;
  font-size: 12px;
  display: none;
}

.error-message.show {
  display: block;
}

.success-message {
  background-color: #efe;
  color: #3c3;
  padding: 8px;
  border-radius: 3px;
  margin-bottom: 10px;
  font-size: 12px;
  display: none;
}

.success-message.show {
  display: block;
}
</style>
