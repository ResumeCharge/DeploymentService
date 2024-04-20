import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  getUserIdFromAuthToken,
  getTokenFromExecutionContext,
  isValidRequest,
} from '../../auth/auth.helpers';
import { DeploymentsService } from '../../deployments/deployments.service';
import { Types } from 'mongoose';

/**
 * Used by the DeploymentsController (oder was changed to deployment and I'm
 * too lazy to change it here) to gate access to the deployment's functionality.
 * Prevents unauthorized requests to create a new deployment and prevents users
 * accessing deployments which don't belong to them.
 * */
@Injectable()
export class OrderGuardService extends AuthGuard('order') {
  constructor(private readonly deploymentsService: DeploymentsService) {
    super();
  }

  /**
   * Return true if the user can perform the desired function,
   * false otherwise.
   * */
  async canActivate(context: ExecutionContext) {
    if (!isValidRequest(context)) {
      return false;
    }
    const token = getTokenFromExecutionContext(context);
    const userId = await getUserIdFromAuthToken(token);
    const method = context.switchToHttp().getRequest().method;
    if (method === 'POST') {
      return await this.canCreateOrder(userId, context);
    } else if (method === 'DELETE' || method === 'GET' || method === 'PATCH') {
      return await this.canAccessOrder(userId, context);
    }
    return false;
  }

  /**
   * Determines if the user is allowed to access a specific deployment.
   * The userId must match the userId of the deployment and the orderId
   * provided must be valid*/
  async canAccessOrder(
    userIdFromRequest: string,
    context: ExecutionContext,
  ): Promise<boolean> {
    const orderId = context.switchToHttp().getRequest().params.id;
    const isValidOrderId = Types.ObjectId.isValid(orderId);
    if (!isValidOrderId) {
      return false;
    }
    const order = await this.deploymentsService.findOne(orderId);
    if (!order) {
      throw new NotFoundException('order with id ' + orderId + ' not found');
    }
    if (order.userId) {
      return userIdFromRequest === order.userId;
    }
    return false;
  }

  /**
   * Validates the userId from the auth token matches the userId of the
   * new deployment.
   * */
  async canCreateOrder(
    userIdFromToken: string,
    context: ExecutionContext,
  ): Promise<boolean> {
    const userIdFromRequest = context.switchToHttp().getRequest().body.userId;
    return userIdFromToken != null && userIdFromRequest === userIdFromToken;
  }
}
