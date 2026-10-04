import { AuthFormCard } from '../components/auth-form-card';
import { AuthIntroduction } from '../components/auth-introduction';
import { useAuthPage } from './auth.page.ts';

export function Auth() {
  const model = useAuthPage();
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-8 p-4 md:grid-cols-2 md:p-8">
      <AuthIntroduction translate={model.translate} />
      <AuthFormCard
        busy={model.busy}
        invalidFields={model.invalidFields}
        message={model.message}
        mode={model.mode}
        onModeChange={model.changeMode}
        onSubmit={model.submit}
        success={model.success}
        translate={model.translate}
      />
    </section>
  );
}
