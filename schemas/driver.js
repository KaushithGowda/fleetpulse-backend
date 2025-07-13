const { z } = require("zod");

const driverSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name is required')
    .max(20, 'Too long'),

  lastName: z
    .string()
    .min(2, 'Last name is required')
    .max(20, 'Too long'),

  email: z
    .email('Invalid email')
    .min(5, 'Email too short')
    .max(20, 'Email too long'),

  mobile: z
    .string()
    .min(10, 'Invalid mobile number')
    .max(10, 'Invalid mobile number'),

  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required'),

  licenseNumber: z
    .string()
    .min(2, 'License number is required')
    .max(20, 'Too long'),

  experience: z
    .string()
    .min(1, 'Experience is required'),

  address1: z
    .string()
    .min(2, 'Address1 is required')
    .max(50, 'Too long'),

  address2: z
    .string()
    .optional(),

  country: z
    .string()
    .min(2, 'Country is required')
    .max(20, 'Too long'),

  city: z
    .string()
    .min(2, 'City is required')
    .max(20, 'Too long'),

  state: z
    .string()
    .min(2, 'State is required')
    .max(20, 'Too long'),

  zipCode: z
    .string()
    .min(1, 'Zip Code is required'),
});

module.exports = {
  driverSchema,
};