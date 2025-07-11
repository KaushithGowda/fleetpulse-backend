const { z } = require("zod");

const driverSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  mobile: z.string().min(10, 'Mobile number is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  address1: z.string().optional(),
  address2: z.string().optional(),
  zipCode: z.string().min(1, 'Zip Code is required'),
  licenseStartDate: z.string().min(1, 'License start date is required'),
  dateOfBirth: z.string().min(1, 'Date of Birth is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
});

module.exports = {
  driverSchema,
};