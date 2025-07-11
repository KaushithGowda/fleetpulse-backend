const { z } = require("zod");

const companySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  establishedOn: z.string().min(1, 'Established date is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address1: z.string().min(1, 'Address line 1 is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  primaryFirstName: z.string().min(1, 'First name is required'),
  primaryLastName: z.string().min(1, 'Last name is required'),
  primaryEmail: z.string().email('Invalid email address'),
  primaryMobile: z.string().min(1, 'Mobile number is required'),
});

module.exports = {
  companySchema,
};