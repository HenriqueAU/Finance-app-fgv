import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    request.user = { 
      id: 'd290f1ee-6c54-4b01-90e6-d701748f0851' 
    };
    
    return true;
  }
}