// Authentication UI Components
import { authService } from './supabase-client.js';
import { presetService } from './preset-service.js';

export class AuthUI {
    constructor() {
        this.currentUser = null;
        this.setupAuthListener();
    }

    // Set up authentication state listener
    setupAuthListener() {
        authService.onUserChange = (user) => {
            this.currentUser = user;
            this.updateUI();
            if (user) {
                this.loadUserPresets();
            }
        };
    }

    // Update UI based on authentication state
    updateUI() {
        const authContainer = document.getElementById('auth-container');
        const userInfo = document.getElementById('user-info');
        const planPill = document.getElementById('plan-pill');
        const upgradeBtn = document.getElementById('upgrade-btn');

        if (this.currentUser) {
            // User is logged in
            if (authContainer) authContainer.classList.add('hidden');
            if (userInfo) {
                userInfo.classList.remove('hidden');
                this.updateUserInfo();
            }
            
            // Check subscription status
            this.checkSubscriptionStatus();
        } else {
            // User is not logged in
            if (authContainer) authContainer.classList.remove('hidden');
            if (userInfo) userInfo.classList.add('hidden');
            if (planPill) planPill.textContent = 'Free Plan';
            if (upgradeBtn) upgradeBtn.classList.remove('hidden');
        }
    }

    // Update user information display
    updateUserInfo() {
        const userEmail = document.getElementById('user-email');
        const userAvatar = document.getElementById('user-avatar');
        const logoutBtn = document.getElementById('logout-btn');

        if (userEmail) {
            userEmail.textContent = this.currentUser.email;
        }

        if (userAvatar) {
            userAvatar.textContent = this.currentUser.email.charAt(0).toUpperCase();
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    // Check and update subscription status
    async checkSubscriptionStatus() {
        const hasPro = await authService.hasProSubscription();
        const planPill = document.getElementById('plan-pill');
        const upgradeBtn = document.getElementById('upgrade-btn');

        if (hasPro) {
            if (planPill) {
                planPill.textContent = 'Pro Plan';
                planPill.classList.replace('bg-slate-200', 'bg-green-100');
                planPill.classList.replace('text-slate-700', 'text-green-800');
            }
            if (upgradeBtn) upgradeBtn.classList.add('hidden');
        } else {
            if (planPill) {
                planPill.textContent = 'Free Plan';
                planPill.classList.replace('bg-green-100', 'bg-slate-200');
                planPill.classList.replace('text-green-800', 'text-slate-700');
            }
            if (upgradeBtn) upgradeBtn.classList.remove('hidden');
        }
    }

    // Load user presets from database
    async loadUserPresets() {
        try {
            const presets = await presetService.getUserPresets();
            this.updatePresetSelect(presets);
        } catch (error) {
            console.error('Error loading user presets:', error);
        }
    }

    // Update preset select dropdown
    updatePresetSelect(presets) {
        const presetSelect = document.getElementById('preset-select');
        if (!presetSelect) return;

        presetSelect.innerHTML = '<option value="">Load preset…</option>';
        presets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.name;
            presetSelect.appendChild(option);
        });
    }

    // Handle logout
    async handleLogout() {
        try {
            await authService.signOut();
            // Clear local presets
            this.clearLocalPresets();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Clear local presets when user logs out
    clearLocalPresets() {
        const presetSelect = document.getElementById('preset-select');
        if (presetSelect) {
            presetSelect.innerHTML = '<option value="">Load preset…</option>';
        }
    }

    // Show login modal
    showLoginModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.setupAuthForms();
        }
    }

    // Hide login modal
    hideLoginModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Setup authentication forms
    setupAuthForms() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const switchToSignup = document.getElementById('switch-to-signup');
        const switchToLogin = document.getElementById('switch-to-login');

        if (switchToSignup) {
            switchToSignup.addEventListener('click', () => this.switchForm('signup'));
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', () => this.switchForm('login'));
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
    }

    // Switch between login and signup forms
    switchForm(formType) {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        if (formType === 'signup') {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        } else {
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        }
    }

    // Handle login form submission
    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        const result = await authService.signIn(email, password);
        
        if (result.success) {
            this.hideLoginModal();
            this.showNotification('Successfully logged in!', 'success');
        } else {
            this.showNotification(result.error, 'error');
        }
    }

    // Handle signup form submission
    async handleSignup(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm-password');

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        const result = await authService.signUp(email, password);
        
        if (result.success) {
            this.showNotification('Account created! Please check your email to verify your account.', 'success');
            this.switchForm('login');
        } else {
            this.showNotification(result.error, 'error');
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Initialize auth UI
    init() {
        // Add auth container to the page if it doesn't exist
        this.createAuthContainer();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check initial auth state
        authService.getCurrentUser().then(() => {
            this.updateUI();
        });
    }

    // Create authentication container
    createAuthContainer() {
        if (document.getElementById('auth-container')) return;

        const header = document.querySelector('header');
        if (!header) return;

        const authContainer = document.createElement('div');
        authContainer.id = 'auth-container';
        authContainer.className = 'absolute top-4 right-4 flex gap-2 items-center';
        authContainer.innerHTML = `
            <button id="login-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                Login
            </button>
            <button id="signup-btn" class="bg-white hover:bg-gray-50 text-indigo-600 font-semibold px-4 py-2 rounded-lg border border-indigo-600 transition-colors">
                Sign Up
            </button>
        `;

        header.appendChild(authContainer);
    }

    // Setup event listeners
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'login-btn') {
                this.showLoginModal();
            } else if (e.target.id === 'signup-btn') {
                this.showLoginModal();
                this.switchForm('signup');
            }
        });
    }
}

// Create global auth UI instance
export const authUI = new AuthUI(); 