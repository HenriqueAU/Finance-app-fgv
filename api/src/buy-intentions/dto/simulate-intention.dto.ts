import { PartialType } from '@nestjs/mapped-types';
import { CreateBuyIntentionDto } from './create-intention.dto';

export class UpdateIntentionDto extends PartialType(CreateBuyIntentionDto) {}
