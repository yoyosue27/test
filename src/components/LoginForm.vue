<template>
  <div class="app-shell" v-if="authUser">
    <header class="topbar">
      <div class="brand">Instagram</div>
      <div class="topbar-actions">
        <span>@{{ authUser.username }}</span>
        <button type="button" @click="handleLogout">Log out</button>
      </div>
    </header>

    <main class="feed-layout">
      <section class="composer">
        <div class="composer-header">
          <div class="avatar">{{ userInitial }}</div>
          <div>
            <strong>{{ authUser.username }}</strong>
            <p>Create a post</p>
          </div>
        </div>

        <textarea
          v-model="postForm.text"
          placeholder="Share something..."
          maxlength="500"
        ></textarea>

        <div class="photo-preview" v-if="postForm.imageData">
          <img :src="postForm.imageData" alt="Selected post preview" />
          <button type="button" @click="removePhoto">Remove photo</button>
        </div>

        <div class="composer-actions">
          <label class="photo-button">
            Add photo
            <input type="file" accept="image/*" @change="handlePhotoChange" />
          </label>
          <button type="button" class="primary-button" :disabled="isPosting" @click="createPost">
            {{ isPosting ? 'Posting...' : 'Post' }}
          </button>
        </div>

        <p class="form-message error" v-if="feedError">{{ feedError }}</p>
      </section>

      <section class="feed">
        <article class="post-card" v-for="post in posts" :key="post.id">
          <div class="post-header">
            <div class="avatar">{{ post.author.username.charAt(0).toUpperCase() }}</div>
            <div>
              <strong>{{ post.author.username }}</strong>
              <time>{{ formatDate(post.createdAt) }}</time>
            </div>
          </div>

          <p class="post-text" v-if="post.text">{{ post.text }}</p>
          <img class="post-image" v-if="post.imageData" :src="post.imageData" alt="Post image" />

          <div class="comments">
            <h2>Comments</h2>
            <p class="empty-comments" v-if="!post.comments.length">No comments yet.</p>
            <div class="comment" v-for="comment in post.comments" :key="comment.id">
              <strong>{{ comment.author.username }}</strong>
              <span>{{ comment.text }}</span>
            </div>
          </div>

          <form class="comment-form" @submit.prevent="createComment(post.id)">
            <input
              v-model="commentDrafts[post.id]"
              type="text"
              placeholder="Add a comment..."
              maxlength="240"
            />
            <button type="submit">Send</button>
          </form>
        </article>

        <div class="empty-feed" v-if="!posts.length && !isLoadingPosts">
          <h1>No posts yet</h1>
          <p>Create the first post with text, a photo, or both.</p>
        </div>
      </section>
    </main>
  </div>

  <div class="login-container" v-else>
    <div class="login-visual">
      <div class="phone-image">
        <div class="phone-screen">Your Stories Here</div>
      </div>
    </div>

    <div class="login-form-wrapper">
      <form class="login-form" @submit.prevent="isSignupMode ? handleSignup() : handleLogin()">
        <div class="logo">
          <div class="instagram-logo">Instagram</div>
        </div>

        <div class="mode-toggle">
          <span :class="{ active: !isSignupMode }" @click="isSignupMode = false">Log in</span>
          <span :class="{ active: isSignupMode }" @click="isSignupMode = true">Sign up</span>
        </div>

        <div class="error-message" :class="{ show: errorMessage }">
          {{ errorMessage }}
        </div>

        <div class="success-message" :class="{ show: successMessage }">
          {{ successMessage }}
        </div>

        <div class="social-login">
          <button type="button" class="social-btn" @click="loginWithFacebook">f Facebook</button>
          <button type="button" class="social-btn" @click="loginWithGoogle">Google</button>
        </div>

        <div class="divider">
          <span>OR</span>
        </div>

        <div class="form-group" v-if="isSignupMode">
          <label>Email</label>
          <input type="email" v-model="formData.email" placeholder="Enter your email" required @focus="clearMessages" />
        </div>

        <div class="form-group" v-if="isSignupMode">
          <label>Username</label>
          <input type="text" v-model="formData.signupUsername" placeholder="Choose a username" required @focus="clearMessages" />
        </div>

        <div class="form-group" v-if="!isSignupMode">
          <label>Username or Email</label>
          <input type="text" v-model="formData.username" placeholder="Enter your username or email" required @focus="clearMessages" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="formData.password" placeholder="Enter your password" required @focus="clearMessages" />
        </div>

        <div class="form-group remember-group">
          <input type="checkbox" id="remember" v-model="formData.rememberMe" />
          <label for="remember">Remember me</label>
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ submitLabel }}
        </button>

        <div class="forgot-password">
          <a href="#" @click.prevent="handleForgotPassword">Forgot password?</a>
        </div>

        <div class="signup-prompt" v-if="!isSignupMode">
          Don't have an account?
          <a href="#" @click.prevent="isSignupMode = true">Sign up</a>
        </div>

        <div class="signup-prompt" v-if="isSignupMode">
          Already have an account?
          <a href="#" @click.prevent="isSignupMode = false">Log in</a>
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
      isSignupMode: false,
      authUser: null,
      posts: [],
      commentDrafts: {},
      postForm: {
        text: '',
        imageData: ''
      },
      formData: {
        username: '',
        email: '',
        signupUsername: '',
        password: '',
        rememberMe: false
      },
      isLoading: false,
      isLoadingPosts: false,
      isPosting: false,
      errorMessage: '',
      successMessage: '',
      feedError: ''
    }
  },
  computed: {
    submitLabel() {
      if (this.isLoading) {
        return this.isSignupMode ? 'Creating account...' : 'Logging in...'
      }

      return this.isSignupMode ? 'Sign up' : 'Log in'
    },
    userInitial() {
      return this.authUser?.username?.charAt(0).toUpperCase() || '?'
    },
    token() {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || ''
    }
  },
  mounted() {
    this.loadStoredUser()
  },
  methods: {
    loadStoredUser() {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')

      if (!storedUser) {
        return
      }

      try {
        this.authUser = JSON.parse(storedUser)
        this.fetchPosts()
      } catch {
        localStorage.removeItem('user')
        sessionStorage.removeItem('user')
      }
    },
    storeSession(data) {
      const storage = this.formData.rememberMe ? localStorage : sessionStorage

      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      sessionStorage.removeItem('authToken')
      sessionStorage.removeItem('user')

      storage.setItem('authToken', data.token)
      storage.setItem('user', JSON.stringify(data.user))
      this.authUser = data.user
      this.fetchPosts()
    },
    async requestJson(url, options = {}) {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          ...(options.headers || {})
        }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Request failed')
      }

      return data
    },
    async fetchPosts() {
      this.isLoadingPosts = true
      this.feedError = ''

      try {
        const data = await this.requestJson('/api/posts')
        this.posts = data.posts
      } catch (error) {
        this.feedError = error.message
      } finally {
        this.isLoadingPosts = false
      }
    },
    async createPost() {
      this.feedError = ''
      this.isPosting = true

      try {
        await this.requestJson('/api/posts', {
          method: 'POST',
          body: JSON.stringify({
            action: 'create',
            text: this.postForm.text,
            imageData: this.postForm.imageData
          })
        })
        this.postForm.text = ''
        this.postForm.imageData = ''
        await this.fetchPosts()
      } catch (error) {
        this.feedError = error.message
      } finally {
        this.isPosting = false
      }
    },
    async createComment(postId) {
      const text = this.commentDrafts[postId] || ''
      this.feedError = ''

      try {
        await this.requestJson('/api/posts', {
          method: 'POST',
          body: JSON.stringify({ action: 'comment', postId, text })
        })
        this.commentDrafts[postId] = ''
        await this.fetchPosts()
      } catch (error) {
        this.feedError = error.message
      }
    },
    handlePhotoChange(event) {
      const file = event.target.files?.[0]

      if (!file) {
        return
      }

      if (!file.type.startsWith('image/')) {
        this.feedError = 'Please choose an image file.'
        return
      }

      if (file.size > 1024 * 1024 * 2) {
        this.feedError = 'Please choose an image under 2 MB.'
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        this.postForm.imageData = reader.result
      }
      reader.readAsDataURL(file)
      event.target.value = ''
    },
    removePhoto() {
      this.postForm.imageData = ''
    },
    formatDate(value) {
      return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(value))
    },
    async handleLogin() {
      this.clearMessages()
      this.isLoading = true

      try {
        const data = await this.requestJson('/api/login', {
          method: 'POST',
          body: JSON.stringify({
            action: 'login',
            email: this.formData.username,
            password: this.formData.password
          })
        })

        this.successMessage = 'Login successful. Welcome back.'
        this.storeSession(data)
        this.formData.username = ''
        this.formData.password = ''
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.isLoading = false
      }
    },
    async handleSignup() {
      this.clearMessages()
      this.isLoading = true

      try {
        const data = await this.requestJson('/api/login', {
          method: 'POST',
          body: JSON.stringify({
            action: 'register',
            email: this.formData.email,
            username: this.formData.signupUsername,
            password: this.formData.password
          })
        })

        this.successMessage = 'Account created successfully. Welcome.'
        this.storeSession(data)
        this.formData.email = ''
        this.formData.signupUsername = ''
        this.formData.password = ''
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.isLoading = false
      }
    },
    loginWithFacebook() {
      this.successMessage = 'Facebook login is not connected yet.'
      setTimeout(() => this.clearMessages(), 2000)
    },
    loginWithGoogle() {
      this.successMessage = 'Google login is not connected yet.'
      setTimeout(() => this.clearMessages(), 2000)
    },
    handleForgotPassword() {
      this.successMessage = 'Password reset is not connected yet.'
      setTimeout(() => this.clearMessages(), 3000)
    },
    handleLogout() {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      sessionStorage.removeItem('authToken')
      sessionStorage.removeItem('user')
      this.authUser = null
      this.posts = []
      this.commentDrafts = {}
      this.successMessage = 'You have been logged out.'
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
.app-shell {
  min-height: 100vh;
  background: #f6f7f9;
  color: #1f2328;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 28px;
  border-bottom: 1px solid #dedede;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
}

.brand,
.instagram-logo {
  font-family: 'Brush Script MT', cursive;
  color: #000;
}

.brand {
  font-size: 32px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  color: #656d76;
}

.topbar-actions button,
.photo-preview button,
.comment-form button,
.photo-button,
.primary-button {
  border: 1px solid #d0d7de;
  border-radius: 6px;
  background: #fff;
  color: #1f2328;
  font-weight: 700;
  cursor: pointer;
}

.topbar-actions button {
  padding: 8px 12px;
}

.feed-layout {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 620px);
  gap: 28px;
  max-width: 1030px;
  margin: 0 auto;
  padding: 28px;
  align-items: start;
}

.composer,
.post-card {
  border: 1px solid #dedede;
  border-radius: 8px;
  background: #fff;
}

.composer {
  position: sticky;
  top: 92px;
  padding: 18px;
}

.composer-header,
.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.composer-header p,
.post-header time {
  display: block;
  margin-top: 2px;
  color: #656d76;
  font-size: 12px;
}

.avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f58529, #dd2a7b, #8134af);
  color: #fff;
  font-weight: 800;
}

.composer textarea {
  width: 100%;
  min-height: 120px;
  margin: 16px 0;
  padding: 12px;
  resize: vertical;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  font: inherit;
}

.photo-preview {
  margin-bottom: 14px;
}

.photo-preview img,
.post-image {
  width: 100%;
  display: block;
  object-fit: cover;
}

.photo-preview img {
  max-height: 260px;
  border-radius: 6px;
}

.photo-preview button {
  margin-top: 8px;
  padding: 7px 10px;
}

.composer-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.photo-button,
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  font-size: 14px;
}

.photo-button input {
  display: none;
}

.primary-button {
  border-color: #0095f6;
  background: #0095f6;
  color: #fff;
}

.primary-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.feed {
  display: grid;
  gap: 18px;
}

.post-card {
  overflow: hidden;
}

.post-header {
  padding: 14px 16px;
}

.post-text {
  padding: 0 16px 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.post-image {
  max-height: 680px;
}

.comments {
  padding: 14px 16px 0;
}

.comments h2 {
  margin-bottom: 8px;
  font-size: 13px;
}

.empty-comments {
  color: #656d76;
  font-size: 13px;
}

.comment {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.comment span {
  overflow-wrap: anywhere;
}

.comment-form {
  display: flex;
  gap: 10px;
  padding: 14px 16px 16px;
  border-top: 1px solid #ececec;
}

.comment-form input {
  min-width: 0;
  flex: 1;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  padding: 9px 10px;
}

.comment-form button {
  padding: 0 12px;
  color: #0095f6;
}

.empty-feed {
  padding: 48px 16px;
  text-align: center;
  color: #656d76;
}

.empty-feed h1 {
  margin-bottom: 8px;
  color: #1f2328;
  font-size: 22px;
}

.form-message {
  margin-top: 12px;
  font-size: 13px;
}

.form-message.error {
  color: #c33;
}

.login-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background: #fafafa;
}

.login-visual {
  flex: 1;
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  display: none;
  align-items: center;
  justify-content: center;
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
}

.mode-toggle {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 10px;
}

.mode-toggle span {
  font-size: 14px;
  font-weight: 600;
  color: #999;
  cursor: pointer;
  padding-bottom: 10px;
  margin-bottom: -10px;
  transition: all 0.2s;
}

.mode-toggle span.active {
  color: #000;
  border-bottom: 2px solid #000;
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
.form-group input[type="email"],
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
.form-group input[type="email"]:focus,
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
}

.forgot-password {
  text-align: center;
  margin-top: 12px;
}

.forgot-password a,
.signup-prompt a {
  color: #385185;
  text-decoration: none;
}

.forgot-password a {
  font-size: 12px;
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
  font-weight: 600;
}

.error-message,
.success-message {
  padding: 8px;
  border-radius: 3px;
  margin-bottom: 10px;
  font-size: 12px;
  display: none;
}

.error-message {
  background-color: #fee;
  color: #c33;
}

.success-message {
  background-color: #efe;
  color: #2f7d32;
}

.error-message.show,
.success-message.show {
  display: block;
}

@media (max-width: 860px) {
  .feed-layout {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .composer {
    position: static;
  }

  .topbar {
    padding: 0 16px;
  }

  .brand {
    font-size: 26px;
  }
}

@media (max-width: 875px) {
  .login-form-wrapper {
    padding: 0 20px;
  }
}
</style>
