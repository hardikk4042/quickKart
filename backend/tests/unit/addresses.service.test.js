'use strict';

/**
 * tests/unit/addresses.service.test.js
 *
 * Unit tests for addresses.service.js (address CRUD, default switching, reverse geocoding).
 */

jest.mock('../../src/modules/addresses/addresses.repository', () => ({
  addressesRepository: {
    createAddress:        jest.fn(),
    findAddressesByUserId: jest.fn(),
    findAddressById:       jest.fn(),
    updateAddress:         jest.fn(),
    deleteAddress:         jest.fn(),
    setDefaultAddress:     jest.fn(),
  },
}));

const { addressesService }    = require('../../src/modules/addresses/addresses.service');
const { addressesRepository } = require('../../src/modules/addresses/addresses.repository');
const AppError                = require('../../src/utils/errors');

const mockAddress = {
  id: 'addr_100',
  userId: 'user_123',
  label: 'Home',
  line1: 'H.No 42, Sector 14',
  line2: 'Near Central Park',
  city: 'Rajpura',
  state: 'Punjab',
  pincode: '140401',
  country: 'India',
  latitude: 30.4843,
  longitude: 76.5932,
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('addressesService.createAddress', () => {
  beforeEach(() => jest.clearAllMocks());

  test('creates address and strips any client-supplied userId', async () => {
    addressesRepository.createAddress.mockResolvedValue(mockAddress);

    const result = await addressesService.createAddress('user_123', {
      userId: 'attacker_user_999', // client payload override attempt
      label: 'Home',
      line1: 'H.No 42, Sector 14',
      city: 'Rajpura',
      state: 'Punjab',
      pincode: '140401',
    });

    expect(result.id).toBe('addr_100');
    expect(addressesRepository.createAddress).toHaveBeenCalledWith('user_123', expect.not.objectContaining({ userId: 'attacker_user_999' }));
  });
});

describe('addressesService.getUserAddresses', () => {
  beforeEach(() => jest.clearAllMocks());

  test('lists all addresses for authenticated user', async () => {
    addressesRepository.findAddressesByUserId.mockResolvedValue([mockAddress]);

    const result = await addressesService.getUserAddresses('user_123');

    expect(result).toHaveLength(1);
    expect(result[0].city).toBe('Rajpura');
  });
});

describe('addressesService.getAddressById', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns single address by ID', async () => {
    addressesRepository.findAddressById.mockResolvedValue(mockAddress);

    const result = await addressesService.getAddressById('addr_100');

    expect(result.id).toBe('addr_100');
  });

  test('throws 404 Not Found when address does not exist', async () => {
    addressesRepository.findAddressById.mockResolvedValue(null);

    await expect(addressesService.getAddressById('addr_ghost')).rejects.toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  });
});

describe('addressesService.updateAddress', () => {
  beforeEach(() => jest.clearAllMocks());

  test('updates address fields and strips client userId override', async () => {
    addressesRepository.findAddressById.mockResolvedValue(mockAddress);
    addressesRepository.updateAddress.mockResolvedValue({
      ...mockAddress,
      line1: 'H.No 99, Sector 15',
    });

    const result = await addressesService.updateAddress('addr_100', 'user_123', {
      userId: 'attacker_user_999',
      line1: 'H.No 99, Sector 15',
    });

    expect(result.line1).toBe('H.No 99, Sector 15');
    expect(addressesRepository.updateAddress).toHaveBeenCalledWith('addr_100', 'user_123', expect.not.objectContaining({ userId: 'attacker_user_999' }));
  });

  test('throws 404 when updating non-existent address', async () => {
    addressesRepository.findAddressById.mockResolvedValue(null);

    await expect(
      addressesService.updateAddress('ghost', 'user_123', { label: 'Work' })
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('addressesService.setDefaultAddress', () => {
  beforeEach(() => jest.clearAllMocks());

  test('sets target address as default', async () => {
    addressesRepository.findAddressById.mockResolvedValue(mockAddress);
    addressesRepository.setDefaultAddress.mockResolvedValue({
      ...mockAddress,
      isDefault: true,
    });

    const result = await addressesService.setDefaultAddress('user_123', 'addr_100');

    expect(result.isDefault).toBe(true);
    expect(addressesRepository.setDefaultAddress).toHaveBeenCalledWith('user_123', 'addr_100');
  });

  test('throws 404 when address does not exist', async () => {
    addressesRepository.findAddressById.mockResolvedValue(null);

    await expect(
      addressesService.setDefaultAddress('user_123', 'addr_ghost')
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('addressesService.reverseGeocode', () => {
  test('returns structured address result for valid latitude & longitude', async () => {
    const result = await addressesService.reverseGeocode(30.4843, 76.5932);

    expect(result.address).toBeDefined();
    expect(result.address.latitude).toBe(30.4843);
    expect(result.address.longitude).toBe(76.5932);
  });
});
