import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} from '#services/users.service.js'
import {
    userIdSchema,
    updateUserSchema,
} from '#validations/users.validation.js'
import { formatValidationError } from '#utils/format.js'
import logger from '#config/logger.js'

export const fetchAllUsers = async (req, res, next) => {
    try {
        logger.info('Getting users ...')

        const allUsers = await getAllUsers()

        res.json({
            message: 'Successfully retrieved users',
            users: allUsers,
            count: allUsers?.length,
        })
    } catch (e) {
        logger.error(e)
        next(e)
    }
}

export const fetchUserById = async (req, res, next) => {
    try {
        const validationResult = userIdSchema.safeParse(req.params)

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error),
            })
        }

        const { id } = validationResult.data
        logger.info(`Getting user by id: ${id}`)

        const user = await getUserById(id)

        res.json({
            message: 'User retrieved successfully',
            user,
        })
    } catch (e) {
        logger.error(`Error fetching user: ${e}`)

        if (e.message === 'User not found') {
            return res.status(404).json({ error: 'User not found' })
        }

        next(e)
    }
}

export const updateUserById = async (req, res, next) => {
    try {
        // Validate URL parameters
        const paramValidation = userIdSchema.safeParse(req.params)
        if (!paramValidation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(paramValidation.error),
            })
        }

        // Validate request body
        const bodyValidation = updateUserSchema.safeParse(req.body)
        if (!bodyValidation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(bodyValidation.error),
            })
        }

        const { id } = paramValidation.data
        const updates = bodyValidation.data
        const currentUser = req.user

        logger.info(`Updating user ${id} by user ${currentUser.id}`)

        // Authorization checks
        // Users can only update their own information
        if (currentUser.id !== id && currentUser.role !== 'admin') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only update your own profile',
            })
        }

        // Only admin users can change roles
        if (updates.role && currentUser.role !== 'admin') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Only administrators can change user roles',
            })
        }

        // Prevent non-admins from changing their own role
        if (
            updates.role &&
            currentUser.id === id &&
            currentUser.role !== 'admin'
        ) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You cannot change your own role',
            })
        }

        const updatedUser = await updateUser(id, updates)

        res.json({
            message: 'User updated successfully',
            user: updatedUser,
        })
    } catch (e) {
        logger.error(`Error updating user: ${e}`)

        if (e.message === 'User not found') {
            return res.status(404).json({ error: 'User not found' })
        }

        if (e.message === 'User with this email already exists') {
            return res.status(409).json({ error: 'Email already exists' })
        }

        next(e)
    }
}

export const deleteUserById = async (req, res, next) => {
    try {
        const validationResult = userIdSchema.safeParse(req.params)

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error),
            })
        }

        const { id } = validationResult.data
        const currentUser = req.user

        logger.info(`Deleting user ${id} by user ${currentUser.id}`)

        // Authorization checks
        // Users can delete their own account or admins can delete any account
        if (currentUser.id !== id && currentUser.role !== 'admin') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only delete your own account',
            })
        }

        // Prevent users from deleting themselves if they're the only admin (optional safety check)
        // This is a business logic decision - you might want to allow it or handle it differently

        const deletedUser = await deleteUser(id)

        res.json({
            message: 'User deleted successfully',
            user: deletedUser,
        })
    } catch (e) {
        logger.error(`Error deleting user: ${e}`)

        if (e.message === 'User not found') {
            return res.status(404).json({ error: 'User not found' })
        }

        next(e)
    }
}
