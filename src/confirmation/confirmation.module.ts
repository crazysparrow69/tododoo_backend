import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  SubtaskConfirmation,
  SubtaskConfirmationSchema,
} from 'src/confirmation/subtask-confirmation.schema';
import { SubtaskConfirmService } from './subtask-confirmation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubtaskConfirmation.name, schema: SubtaskConfirmationSchema },
    ]),
  ],
  providers: [SubtaskConfirmService],
  exports: [SubtaskConfirmService]
})
export class ConfirmationModule {}
