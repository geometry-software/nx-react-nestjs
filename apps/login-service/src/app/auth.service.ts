import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  LoginFirebaseAuthAdapter,
  type SocialCredentialInput,
} from './adapters/login-firebase-auth.adapter';
import { SessionSqlAdapter } from './adapters/session-sql.adapter';
import { UserMongoDBAdapter } from './adapters/user-mongodb.adapter';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Session } from './entities/session.entity';
import { User } from './entities/user.entity';
import { EmailService } from './services/email.service';
import { normalizeEmail } from './utils/normalize-email';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly sessions: SessionSqlAdapter,
    private readonly users: UserMongoDBAdapter,
    private readonly firebaseAuth: LoginFirebaseAuthAdapter,
    private readonly jwt: JwtService,
    private readonly emailService: EmailService,
  ) {}

  public async prepareSession(idToken: string): Promise<{ uid: string; created: boolean }> {
    const uid = await this.firebaseAuth.verifyAnonymousIdToken(idToken);
    const existing = await this.sessions.findByFirebaseUid(uid);
    if (existing) {
      if (existing.firebaseIdToken !== idToken) {
        await this.sessions.update(existing.id, { firebaseIdToken: idToken });
      }
      return { uid, created: false };
    }
    try {
      await this.sessions.create(Object.assign(new Session(), {
        userId: null,
        name: null,
        email: null,
        firebaseUid: uid,
        firebaseIdToken: idToken,
      }));
      return { uid, created: true };
    } catch (error) {
      // A concurrent first request can create the same browser session first.
      if (await this.sessions.findByFirebaseUid(uid)) return { uid, created: false };
      throw error;
    }
  }

  public socialLogin(credentials: SocialCredentialInput) {
    return this.firebaseAuth.socialLogin(credentials);
  }

  public async register(dto: RegisterDto) {
    const { uid } = await this.prepareSession(dto.firebaseIdToken);
    const pendingSession = await this.sessions.findByFirebaseUid(uid);
    if (!pendingSession || pendingSession.userId) {
      throw new ConflictException('Firebase session is already registered');
    }
    const email = normalizeEmail(dto.email);
    if (await this.users.findByEmail(email) || await this.sessions.findByEmail(email)) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.users.create(Object.assign(new User(), {
      name: dto.name.trim(),
      email,
      role: dto.role,
      active: true,
    }));
    let session: Session;
    try {
      session = await this.sessions.update(pendingSession.id, {
        userId: user.id,
        name: user.name,
        email,
        passwordHash: await bcrypt.hash(dto.password, 12),
        firebaseIdToken: dto.firebaseIdToken,
      });
    } catch (error) {
      await this.users.remove(user.id).catch(() => this.logger.warn('User rollback failed'));
      throw error;
    }
    const result = this.authResponse(user, session);
    const verificationToken = this.jwt.sign(
      { sub: user.id, sid: session.id, email, type: 'verify-email' },
      { expiresIn: '24h' },
    );
    void Promise.resolve()
      .then(() => this.emailService.sendRegistrationEmail(email, verificationToken, dto.language ?? 'en'))
      .catch(() => this.logger.warn('Registration email dispatch failed'));
    return result;
  }

  public async login(dto: LoginDto) {
    const email = normalizeEmail(dto.email);
    const previousSession = await this.sessions.findByEmail(email);
    if (!previousSession?.passwordHash ||
        !(await bcrypt.compare(dto.password, previousSession.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    let user = await this.users.findByEmail(email);
    if (user && !user.active) throw new UnauthorizedException('Invalid credentials');
    if (!user) {
      user = await this.users.create(Object.assign(new User(), {
        name: previousSession.name ?? email,
        email,
        role: 'viewer',
        active: true,
      }));
    }
    const session = await this.sessions.create(Object.assign(new Session(), {
      userId: user.id,
      name: user.name,
      email,
      passwordHash: previousSession.passwordHash,
      verifiedAt: previousSession.verifiedAt,
    }));
    return this.authResponse(user, session);
  }

  public async verifyEmail(token: string): Promise<{ status: 'ok' }> {
    let payload: { sub?: string; sid?: string; email?: string; type?: string };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
    if (payload.type !== 'verify-email' || !payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid verification token');
    }
    const session = payload.sid
      ? await this.sessions.findOne(payload.sid).catch(() => null)
      : await this.sessions.findByEmail(payload.email);
    if (!session || session.userId !== payload.sub || session.email !== payload.email) {
      throw new UnauthorizedException('Verification session not found');
    }
    if (!session.verifiedAt) {
      await this.sessions.update(session.id, { verifiedAt: new Date() });
    }
    const latestSession = await this.sessions.findByEmail(payload.email);
    if (latestSession && latestSession.id !== session.id &&
        latestSession.userId === payload.sub && !latestSession.verifiedAt) {
      await this.sessions.update(latestSession.id, { verifiedAt: new Date() });
    }
    return { status: 'ok' };
  }

  private authResponse(user: User, session: Session) {
    return {
      accessToken: this.jwt.sign({
        sub: user.id,
        sid: session.id,
        email: user.email,
      }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
