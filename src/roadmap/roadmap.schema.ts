import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

import { AbstractDocument } from "../database";
import { User } from "src/user/user.schema";

@Schema()
export class RoadmapQuarter extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: Number })
  start: number;

  @Prop({ required: true, type: Number })
  end: number;
}

export const RoadmapQuarterSchema =
  SchemaFactory.createForClass(RoadmapQuarter);

@Schema()
export class RoadmapMilestone extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: Number })
  position: number;
}

export const RoadmapMilestoneSchema =
  SchemaFactory.createForClass(RoadmapMilestone);

@Schema()
export class RoadmapCategoryRowTask extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: Number })
  progress: number;

  @Prop({ required: true, type: Number })
  start: number;

  @Prop({ required: true, type: Number })
  end: number;

  @Prop({ required: true, type: String })
  status: string;
}

export const RoadmapCategoryRowTaskSchema =
  SchemaFactory.createForClass(RoadmapCategoryRowTask);

@Schema()
export class RoadmapCategoryRow extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ type: [RoadmapCategoryRowTaskSchema], default: [] })
  tasks: Types.DocumentArray<RoadmapCategoryRowTask>;
}

export const RoadmapCategoryRowSchema =
  SchemaFactory.createForClass(RoadmapCategoryRow);

@Schema()
export class RoadmapCategory extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  color: string;

  @Prop({ type: [RoadmapCategoryRowSchema], default: [] })
  rows: Types.DocumentArray<RoadmapCategoryRow>;
}

export const RoadmapCategorySchema =
  SchemaFactory.createForClass(RoadmapCategory);

export type RoadmapDocument = HydratedDocument<Roadmap>;

@Schema()
export class Roadmap extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: User;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  })
  userIds: User[];

  @Prop({ type: [RoadmapQuarterSchema], default: [] })
  quarters: Types.DocumentArray<RoadmapQuarter>;

  @Prop({ type: [RoadmapMilestoneSchema], default: [] })
  milestones: Types.DocumentArray<RoadmapMilestone>;

  @Prop({ type: [RoadmapCategorySchema], default: [] })
  categories: Types.DocumentArray<RoadmapCategory>;
}

export const RoadmapSchema = SchemaFactory.createForClass(Roadmap);
