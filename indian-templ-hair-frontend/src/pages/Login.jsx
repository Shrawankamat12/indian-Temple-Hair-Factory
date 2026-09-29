import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import { useStore } from '../context/StoreContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import BrandMark from '../components/BrandMark';
import Button from '../components/Button';
import authImg from '../assets/photos/hero-model.jpg';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPw, setShowPw] = useState(false); // UI only

  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, forgotPassword, resetPassword, showToast } = useStore();

  const redirectTo = location.state?.from || '/account';

  function field(key) {
    return {
      value: form[key],
      onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        navigate(redirectTo);
        return;
      }

      if (mode === 'register') {
        if (form.password !== form.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (form.password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        await register({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        });
        navigate(redirectTo);
        return;
      }

      if (mode === 'forgot') {
        if (!form.email) throw new Error('Please enter your email address');
        await forgotPassword(form.email);
        return;
      }

      if (mode === 'reset') {
        if (form.password !== form.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (form.password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) throw new Error('Reset token is missing or invalid');

        await resetPassword(token, form.password);
        setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
        setMode('login');
        showToast('Password reset successfully. Please login.');
      }
    } catch (err) {
      setFormError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  function loginWithGoogle() {
    window.location.href = 'http://localhost:5000/api/v1/auth/google';
  }

  function loginWithFacebook() {
    window.location.href = 'http://localhost:5000/api/v1/auth/facebook';
  }

  function switchMode(nextMode) {
    setFormError('');
    setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    setMode(nextMode);
  }

  const titles = { login: 'Welcome back', register: 'Create your account', forgot: 'Forgot password', reset: 'Reset password' };
  const subs = {
    login: 'Sign in to view your orders and saved pieces.',
    register: 'Join to track orders and keep your wishlist across devices.',
    forgot: 'Enter your email and we will send you a password reset link.',
    reset: 'Create a new password for your account.',
  };
  const pwType = showPw ? 'text' : 'password';
  const PwToggle = () => (
    <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'}>
      {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
    </button>
  );

  return (
    <div className="auth">
      <aside className="auth-art" aria-hidden="true">
        <div className="auth-art-arch"><img src={authImg} alt="" /></div>
        <p className="auth-art-line">Premium Indian hair, crafted for confidence.</p>
      </aside>

      <div className="auth-panel">
        <div className="auth-box">
          <Link to="/" className="auth-brand" aria-label="Home"><BrandMark size="sm" /></Link>

          {(mode === 'login' || mode === 'register') && (
            <div className="seg" role="tablist" aria-label="Account">
              <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'is-on' : ''} onClick={() => switchMode('login')}>Sign in</button>
              <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'is-on' : ''} onClick={() => switchMode('register')}>Create account</button>
            </div>
          )}

          <h1 className="auth-title">{titles[mode]}</h1>
          <p className="auth-sub">{subs[mode]}</p>

          <form className="auth-form" onSubmit={onSubmit} noValidate={false}>
            {mode === 'register' && (
              <>
                <div className="field">
                  <label className="field-label" htmlFor="a-name">Full name</label>
                  <input id="a-name" className="input" autoComplete="name" required {...field('name')} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="a-phone">Phone number</label>
                  <input id="a-phone" type="tel" className="input" autoComplete="tel" {...field('phone')} />
                </div>
              </>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
              <div className="field">
                <label className="field-label" htmlFor="a-email">Email address</label>
                <input id="a-email" type="email" className="input" autoComplete="email" required {...field('email')} />
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'reset') && (
              <div className="field">
                <label className="field-label" htmlFor="a-pw">{mode === 'reset' ? 'New password' : 'Password'}</label>
                <div className="pw-wrap">
                  <input id="a-pw" type={pwType} className="input" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} {...field('password')} />
                  <PwToggle />
                </div>
                {mode !== 'login' && <span className="field-hint">At least 8 characters.</span>}
              </div>
            )}

            {(mode === 'register' || mode === 'reset') && (
              <div className="field">
                <label className="field-label" htmlFor="a-pw2">Confirm password</label>
                <input id="a-pw2" type={pwType} className="input" autoComplete="new-password" required minLength={8} {...field('confirmPassword')} />
              </div>
            )}

            {mode === 'login' && (
              <div className="auth-row">
                <label className="check"><input type="checkbox" defaultChecked /> Remember me</label>
                <button type="button" className="link-u" onClick={() => switchMode('forgot')}>Forgot password?</button>
              </div>
            )}

            {mode === 'register' && (
              <label className="check auth-terms">
                <input type="checkbox" required />
                <span>I agree to the <Link to="/policy/terms" className="link-u">Terms</Link> and <Link to="/policy/privacy" className="link-u">Privacy Policy</Link></span>
              </label>
            )}

            {formError && <p className="form-alert form-alert-error" role="alert">{formError}</p>}

            <Button type="submit" size="lg" block loading={submitting}>
              {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Reset password'}
            </Button>
          </form>

          {mode === 'login' && (
            <>
              <div className="auth-or"><span>Or continue with</span></div>
              <div className="auth-social">
                <button type="button" onClick={loginWithGoogle} aria-label="Continue with Google"><FaGoogle /> Google</button>
                <button type="button" onClick={loginWithFacebook} aria-label="Continue with Facebook"><FaFacebookF /> Facebook</button>
              </div>
            </>
          )}

          <p className="auth-switch">
            {mode === 'login' && <>New here? <button type="button" className="link-u" onClick={() => switchMode('register')}>Create an account</button></>}
            {mode === 'register' && <>Already have an account? <button type="button" className="link-u" onClick={() => switchMode('login')}>Sign in</button></>}
            {(mode === 'forgot' || mode === 'reset') && <>Remember your password? <button type="button" className="link-u" onClick={() => switchMode('login')}>Sign in</button></>}
          </p>
        </div>
      </div>
    </div>
  );
}
