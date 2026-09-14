import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Check products service health' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  health() {
    return { ok: true };
  }
}
