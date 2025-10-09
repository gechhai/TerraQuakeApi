import { isValidObjectId } from 'mongoose'

/**
 * Controller: Create a new post.
 *
 * - Requires an authenticated user (validated by middleware).
 * - Validates presence of required fields in the request body.
 * - Ensures that the provided slug is unique.
 * - Persists the post in MongoDB and returns a formatted response.
 */
export const createPost = ({ Post, buildResponse, handleHttpError }) => {
  return async (req, res) => {
    if (!req.user) {
      return handleHttpError(res, 'Unauthorized', 401)
    }

    const requiredFields = ['title', 'excerpt', 'slug', 'author', 'categories', 'content']
    const missingFields = requiredFields.filter((field) => {
      const value = req.body?.[field]
      if (field === 'categories') {
        return !Array.isArray(value) || value.length === 0
      }
      return value === undefined || value === null || value === ''
    })

    if (missingFields.length > 0) {
      return handleHttpError(
        res,
        `Missing required fields: ${missingFields.join(', ')}`,
        400
      )
    }

    try {
      const {
        title,
        excerpt,
        slug,
        author,
        categories,
        content,
        tags = []
      } = req.body

      const invalidStringField = ['title', 'excerpt', 'slug', 'content'].find(
        (field) => typeof req.body[field] !== 'string'
      )

      if (invalidStringField) {
        return handleHttpError(
          res,
          `${invalidStringField} must be a string`,
          400
        )
      }

      if (typeof author !== 'string') {
        return handleHttpError(res, 'author must be a string', 400)
      }

      if (author !== String(req.user._id)) {
        return handleHttpError(res, 'Authenticated user does not match author', 403)
      }

      if (!isValidObjectId(author)) {
        return handleHttpError(res, 'author must be a valid user id', 400)
      }

      if (!Array.isArray(categories)) {
        return handleHttpError(res, 'categories must be an array', 400)
      }

      const sanitizedCategories = categories
        .map((category) => (typeof category === 'string' ? category.trim() : category))
        .filter((category) => typeof category === 'string' && category !== '')

      if (sanitizedCategories.length === 0) {
        return handleHttpError(res, 'At least one valid category is required', 400)
      }

      let sanitizedTags = []
      if (Array.isArray(tags)) {
        sanitizedTags = tags
          .map((tag) => (typeof tag === 'string' ? tag.trim() : tag))
          .filter((tag) => typeof tag === 'string' && tag !== '')
      }

      const slugExists = await Post.exists({ slug: slug.trim().toLowerCase() })
      if (slugExists) {
        return handleHttpError(res, 'Slug already exists. Please choose another one.', 409)
      }

      const post = await Post.create({
        title: title.trim(),
        excerpt: excerpt.trim(),
        slug: slug.trim().toLowerCase(),
        author,
        categories: sanitizedCategories,
        content,
        tags: sanitizedTags
      })

      res.status(201).json(
        buildResponse(req, 'Post created successfully', post, null, {
          code: 201,
          status: 'Created'
        })
      )
    } catch (error) {
      console.error('Error in postController/createPost:', error.message)
      handleHttpError(
        res,
        error.message.includes('HTTP error') ? error.message : undefined
      )
    }
  }
}