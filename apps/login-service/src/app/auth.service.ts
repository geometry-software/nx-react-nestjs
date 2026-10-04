import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MongoRepository } from 'typeorm';
import { Session } from './entities/session.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Session)
    private readonly accounts: MongoRepository<Session>,
    private readonly jwt: JwtService,
  ) {}
  async register(dto: RegisterDto) {
    const email = this.normalizeEmail(dto.email);
    if (await this.accounts.findOneBy({ email }))
      throw new ConflictException('Email already registered');
    const account = await this.accounts.save(
      this.accounts.create({
        email,
        name: dto.name.trim(),
        passwordHash: await bcrypt.hash(dto.password, 12),
      }),
    );
    return this.issue(account);
  }
  async login(dto: LoginDto) {
    const account = await this.accounts.findOneBy({
      email: this.normalizeEmail(dto.email),
    });
    if (!account || !(await bcrypt.compare(dto.password, account.passwordHash)))
      throw new UnauthorizedException('Invalid credentials');
    return this.issue(account);
  }
  private issue(account: Session) {
    return {
      ...
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}

