import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubtaskConfirmService } from './subtask-confirmation.service';
import {
  SubtaskConfirmation,
  SubtaskConfirmationSchema,
} from '../confirmation/subtask-confirmation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubtaskConfirmation.name, schema: SubtaskConfirmationSchema },
    ]),
  ],
  providers: [SubtaskConfirmService],
  exports: [SubtaskConfirmService],
})
export class ConfirmationModule {}
