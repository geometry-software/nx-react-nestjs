import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';

export function AuthIntroduction({ translate }: { translate: Translate }) {
  return (
    <div className="flex flex-col items-center gap-8">
      <svg
        aria-hidden="true"
        className="h-auto w-full max-w-[460px]"
        fill="none"
        viewBox="0 0 520 380"
      >
        <circle className="fill-muted" cx="260" cy="190" r="174" />
        <circle className="stroke-border" cx="260" cy="190" r="149" strokeDasharray="5 9" strokeWidth="2" />

        <rect className="fill-card stroke-border" height="215" rx="24" strokeWidth="3" width="292" x="114" y="78" />
        <path className="stroke-border" d="M115 132h290" strokeWidth="3" />
        <circle className="fill-primary" cx="143" cy="105" r="5" />
        <circle className="fill-muted-foreground" cx="161" cy="105" r="5" />
        <circle className="fill-muted-foreground" cx="179" cy="105" r="5" />

        <circle className="fill-primary/10 stroke-primary" cx="218" cy="202" r="48" strokeWidth="3" />
        <circle className="stroke-primary" cx="218" cy="188" r="13" strokeWidth="4" />
        <path className="stroke-primary" d="M190 231c4-16 14-24 28-24s24 8 28 24" strokeLinecap="round" strokeWidth="4" />

        <path className="stroke-border" d="M289 177h76M289 197h58M289 217h44" strokeLinecap="round" strokeWidth="8" />
        <rect className="fill-primary" height="31" rx="15.5" width="88" x="285" y="239" />
        <path className="stroke-primary-foreground" d="m315 255 9 9 18-18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />

        <rect className="fill-card stroke-primary" height="86" rx="20" strokeWidth="3" width="86" x="371" y="34" />
        <path className="stroke-primary" d="M398 72v-9a16 16 0 0 1 32 0v9" strokeLinecap="round" strokeWidth="4" />
        <rect className="fill-primary" height="29" rx="7" width="40" x="394" y="71" />
        <circle className="fill-primary-foreground" cx="414" cy="83" r="3" />
        <path className="stroke-primary-foreground" d="M414 85v7" strokeLinecap="round" strokeWidth="3" />

        <circle className="fill-card stroke-border" cx="106" cy="292" r="27" strokeWidth="3" />
        <path className="stroke-primary" d="m95 292 8 8 15-17" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        <path className="stroke-primary" d="M70 79v14M63 86h14M443 283v16M435 291h16" strokeLinecap="round" strokeWidth="3" />
      </svg>
      <Button asChild size="lg" variant="outline">
        <Link to="/products?page=1&limit=10&sort=createdAt&order=desc">
          <ArrowLeft />
          {translate('auth.back')}
        </Link>
      </Button>
    </div>
  );
}
