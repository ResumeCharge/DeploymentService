import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResumesService } from '../../resumes/resumes.service';
import { AuthGuard } from '@nestjs/passport';
import {
  getUserIdFromAuthToken,
  getTokenFromExecutionContext,
  isValidRequest,
} from '../../auth/auth.helpers';

@Injectable()
export class ResumeGuardService extends AuthGuard('resume') {
  constructor(private readonly resumesService: ResumesService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    if (!isValidRequest(context)) {
      return false;
    }
    const token = getTokenFromExecutionContext(context);
    const uid = await getUserIdFromAuthToken(token);
    const method = context.switchToHttp().getRequest().method;
    if (method === 'POST') {
      return await this.canCreateResume(uid, context);
    } else if (method === 'DELETE' || method === 'GET' || method === 'PATCH') {
      return await this.canAccessResume(uid, context);
    }

    return false;
  }

  async canAccessResume(
    userIdFromRequest: string,
    context: ExecutionContext,
  ): Promise<boolean> {
    const resumeId = context.switchToHttp().getRequest().params.id;
    const resume = await this.resumesService.findOneResume(resumeId);
    if (!resume) {
      throw new NotFoundException('resume with id ' + resumeId + ' not found');
    }
    if (resume.userId) {
      return userIdFromRequest === resume.userId;
    }
    return false;
  }

  async canCreateResume(
    userIdFromToken: string,
    context: ExecutionContext,
  ): Promise<boolean> {
    const userIdFromRequest = context.switchToHttp().getRequest().body.userId;
    return userIdFromRequest === userIdFromToken;
  }
}
