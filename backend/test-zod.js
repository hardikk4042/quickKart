const { z } = require('zod');

const schema = z.object({
  managerId: z.string().cuid('Invalid manager ID format').optional().nullable(),
});

console.log('Testing null:', schema.safeParse({ managerId: null }));
console.log('Testing empty string:', schema.safeParse({ managerId: '' }));
console.log('Testing valid cuid:', schema.safeParse({ managerId: 'cmsr6vwi60002siu6a05lz257' }));
