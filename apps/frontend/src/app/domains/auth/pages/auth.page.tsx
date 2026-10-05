import { AuthFormCard } from '../components/auth-form-card';
import { AuthIntroduction } from '../components/auth-introduction';
import { useAuthFeature } from '../feature/auth.feature';

export function Auth() {
  const feature = useAuthFeature();
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
        onSubmit={feature.submit}
        success={feature.success}
        translate={feature.translate}
      />
    </section>
  );
}
