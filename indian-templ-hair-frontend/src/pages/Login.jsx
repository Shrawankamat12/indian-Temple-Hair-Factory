import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useStore } from '../context/StoreContext';
import BrandMark from '../components/BrandMark';
import Button from '../components/Button';
import { Field, Input, Check, FormAlert } from '../components/Field';
import { cx, linkU } from '../lib/ui';

const API_BASE = 'http://localhost:5000/api/v1';
const EMPTY_FORM = { name: '', email: '', phone: '', password: '', confirmPassword: '' };

const TITLES = {
  login: 'Sign in',
  register: 'Create your account',
  forgot: 'Reset your password',
  reset: 'Set a new password',
};

const SUBS = {
  login: 'Access your orders and saved items.',
  register: 'Track orders and keep your wishlist across devices.',
  forgot: 'Enter your email and we will send you a reset link.',
  reset: 'Choose a new password for your account.',
};

const SUBMIT_LABELS = {
  login: 'Sign in',
  register: 'Create account',
  forgot: 'Send reset link',
  reset: 'Reset password',
};

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(EMPTY_FORM);
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

  function validateNewPassword() {
    if (form.password !== form.confirmPassword) throw new Error('Passwords do not match');
    if (form.password.length < 8) throw new Error('Password must be at least 8 characters');
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
        validateNewPassword();
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
        validateNewPassword();
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) throw new Error('Reset token is missing or invalid');

        await resetPassword(token, form.password);
        setForm(EMPTY_FORM);
        setMode('login');
        showToast('Password reset successfully. Please sign in.');
      }
    } catch (err) {
      setFormError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  function loginWithProvider(provider) {
    window.location.href = `${API_BASE}/auth/${provider}`;
  }

  function switchMode(nextMode) {
    setFormError('');
    setForm(EMPTY_FORM);
    setMode(nextMode);
  }

  const pwType = showPw ? 'text' : 'password';
  const linkBtn = cx(linkU, 'border-0 bg-transparent');

  const pwToggle = (
    <button
      type="button"
      className="absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center text-walnut"
      onClick={() => setShowPw((s) => !s)}
      aria-label={showPw ? 'Hide password' : 'Show password'}
    >
      {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
    </button>
  );

  return (
    <div className="flex min-h-[calc(100dvh-120px)] w-full items-center justify-center px-4 py-6">
    <div className="w-full max-w-[440px] rounded-2xl border border-line bg-white px-[clamp(20px,4vw,32px)] py-6 shadow-pop">
      <Link to="/" className="mb-4 flex justify-center" aria-label="Home">
        <BrandMark size="sm" />
      </Link>

      {(mode === 'login' || mode === 'register') && (
        <div className="grid grid-cols-2 gap-1 rounded-md bg-sand p-1" role="tablist" aria-label="Account">
          {[['login', 'Sign in'], ['register', 'Create account']].map(([m, label]) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className="min-h-[40px] rounded-sm text-[0.88rem] font-semibold text-muted transition hover:text-espresso aria-selected:bg-white aria-selected:text-espresso aria-selected:shadow-soft"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {mode === 'forgot' || mode === 'reset' ? (
        <div className="mb-5">
          <h1 className="text-[1.6rem] leading-tight">{TITLES[mode]}</h1>
          <p className="mt-1.5 text-[0.9rem] text-muted">{SUBS[mode]}</p>
        </div>
      ) : (
        <p className="mb-4 mt-4 text-center text-[0.88rem] text-muted">{SUBS[mode]}</p>
      )}

      <form className="grid gap-3.5 [&_input:not([type=checkbox])]:!h-11 [&_input:not([type=checkbox])]:!min-h-0" onSubmit={onSubmit}>
        {mode === 'register' && (
          <>
            <Field label="Full name" htmlFor="a-name">
              <Input id="a-name" autoComplete="name" required {...field('name')} />
            </Field>
            <Field label="Phone number" htmlFor="a-phone">
              <Input id="a-phone" type="tel" autoComplete="tel" {...field('phone')} />
            </Field>
          </>
        )}

        {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
          <Field label="Email address" htmlFor="a-email">
            <Input id="a-email" type="email" autoComplete="email" required {...field('email')} />
          </Field>
        )}

        {(mode === 'login' || mode === 'register' || mode === 'reset') && (
          <Field
            label={mode === 'reset' ? 'New password' : 'Password'}
            htmlFor="a-pw"
            hint={mode !== 'login' ? 'At least 8 characters.' : undefined}
          >
            <div className="relative">
              <Input
                id="a-pw"
                type={pwType}
                className="pr-[42px]"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={8}
                {...field('password')}
              />
              {pwToggle}
            </div>
          </Field>
        )}

        {(mode === 'register' || mode === 'reset') && (
          <Field label="Confirm password" htmlFor="a-pw2">
            <Input id="a-pw2" type={pwType} autoComplete="new-password" required minLength={8} {...field('confirmPassword')} />
          </Field>
        )}

        {mode === 'login' && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.88rem]">
            <Check defaultChecked>Remember me</Check>
            <button type="button" className={linkBtn} onClick={() => switchMode('forgot')}>
              Forgot password?
            </button>
          </div>
        )}

        {mode === 'register' && (
          <Check className="text-[0.82rem] text-muted" required>
            I agree to the <Link to="/policy/terms" className={linkU}>Terms</Link> and{' '}
            <Link to="/policy/privacy" className={linkU}>Privacy Policy</Link>
          </Check>
        )}

        {formError && <FormAlert>{formError}</FormAlert>}

        <Button type="submit" block loading={submitting}>
          {submitting ? 'Please wait…' : SUBMIT_LABELS[mode]}
        </Button>
      </form>

      {mode === 'login' && (
        <>
          <div className="my-4 flex items-center gap-3 text-[0.78rem] text-muted before:h-px before:flex-1 before:bg-line before:content-[''] after:h-px after:flex-1 after:bg-line after:content-['']">
            <span>or</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[['google', 'Google', FaGoogle], ['facebook', 'Facebook', FaFacebookF]].map(([provider, name, Icon]) => (
              <button
                key={provider}
                type="button"
                onClick={() => loginWithProvider(provider)}
                aria-label={`Continue with ${name}`}
                className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-md border border-line-strong bg-white text-[0.88rem] font-semibold text-espresso transition hover:border-espresso hover:bg-sand"
              >
                <Icon size={14} /> {name}
              </button>
            ))}
          </div>
        </>
      )}

      <p className="mt-4 max-w-none text-center text-[0.88rem] text-muted">
        {mode === 'login' && (
          <>New here? <button type="button" className={linkBtn} onClick={() => switchMode('register')}>Create an account</button></>
        )}
        {mode === 'register' && (
          <>Already have an account? <button type="button" className={linkBtn} onClick={() => switchMode('login')}>Sign in</button></>
        )}
        {(mode === 'forgot' || mode === 'reset') && (
          <>Remembered your password? <button type="button" className={linkBtn} onClick={() => switchMode('login')}>Sign in</button></>
        )}
      </p>
    </div>
    </div>
  );
}