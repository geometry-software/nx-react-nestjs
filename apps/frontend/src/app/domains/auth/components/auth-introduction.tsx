import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';

export function AuthIntroduction({ translate }: { translate: Translate }) {
  return (
    <div className="space-y-6">
      <Button asChild size="lg" variant="outline">
        <Link to="/products?page=1&limit=10&sort=createdAt&order=desc">
          <ArrowLeft />
          {translate('auth.back')}
        </Link>
      </Button>
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        {translate('auth.title')}
      </h1>
    </div>
  );
}
