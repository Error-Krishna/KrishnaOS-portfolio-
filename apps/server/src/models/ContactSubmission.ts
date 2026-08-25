import { Schema, model, type InferSchemaType } from 'mongoose';

const contactSubmissionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 320 },
    subject: { type: String, required: false, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: true },
);

export type ContactSubmissionDoc = InferSchemaType<typeof contactSubmissionSchema>;

export const ContactSubmissionModel = model('ContactSubmission', contactSubmissionSchema);
