import { AuthFormCard } from '../components/auth-form-card';
import { AuthIntroduction } from '../components/auth-introduction';
import { useAuthFeature } from '../feature/auth.feature';
import { Navigate, useSearchParams } from 'react-router-dom';

export function Auth() {
  const feature = useAuthFeature();
  const [searchParams] = useSearchParams();
  const legacyToken = searchParams.get('verify');
  if (legacyToken) {
    return <Navigate to={`/verify-email?token=${encodeURIComponent(legacyToken)}`} replace />;
  }
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-8 p-4 md:grid-cols-2 md:p-8">
      <AuthIntroduction translate={feature.translate} />
      <AuthFormCard
        busy={feature.busy}
        invalidFields={feature.invalidFields}
        fieldErrors={feature.fieldErrors}
        message={feature.message}
        mode={feature.mode}
        onModeChange={feature.changeMode}
        onRoleChange={feature.changeRole}
        onSubmit={feature.submit}
        role={feature.role}
        translate={feature.translate}
      />
    </section>
  );
}
