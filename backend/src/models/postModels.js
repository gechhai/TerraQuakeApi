import { Schema, model } from 'mongoose'

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    excerpt: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    categories: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one category is required'
      }
    },
    content: {
      type: String,
      required: true
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'posts'
  }
)

const Post = model('posts', postSchema)

export default Post