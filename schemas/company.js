const { z } = require("zod");

const companySchema = z.object({
  name: z
    .string()
    .nonempty('Company name is required')
    .min(2, 'Too short')
    .max(40, 'Too long'),

  establishedOn: z
    .string()
    .nonempty('Established date is required'),

  website: z
    .url('Invalid website URL')
    .min(10, 'Too short')
    .max(30, 'Too long')
    .default('https://'),

  registrationNumber: z
    .string()
    .nonempty('Registration number is required')
    .min(2, 'Too short')
    .max(20, 'Too long'),

  address1: z
    .string()
    .nonempty('Address1 is required')
    .min(2, 'Too short')
    .max(50, 'Too long'),

  address2: z
    .string()
    .optional(),

  country: z
    .string()
    .nonempty('Country is required')
    .min(2, 'Too short')
    .max(20, 'Too long'),

  city: z
    .string()
    .nonempty('City is required')
    .min(2, 'Too short')
    .max(20, 'Too long'),

  state: z
    .string()
    .nonempty('State is required')
    .min(2, 'Too short')
    .max(20, 'Too long'),

  zipCode: z
    .string()
    .nonempty('Zip Code is required'),

  contactFirstName: z
    .string()
    .nonempty('First name is required')
    .min(2, 'Too short')
    .max(20, 'Too long'),

  contactLastName: z
    .string()
    .nonempty('Last name is required')
    .min(2, 'Too short')
    .max(20, 'Too long'),

  contactEmail: z
    .email('Invalid email')
    .min(5, 'Email too short')
    .max(20, 'Email too long'),

  contactMobile: z
    .string()
    .nonempty('Mobile number is required')
    .min(10, 'Invalid mobile number')
    .max(10, 'Invalid mobile number')
});

module.exports = {
  companySchema
};