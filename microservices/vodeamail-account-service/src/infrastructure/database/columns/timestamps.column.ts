export const createdAt = () => ({
  name: 'createdAt',
  type: 'datetime',
  isNullable: true,
  default: 'CURRENT_TIMESTAMP',
});

export const updatedAt = () => ({
  name: 'updatedAt',
  type: 'datetime',
  isNullable: true,
  default: 'CURRENT_TIMESTAMP',
});

export const deletedAt = () => ({
  name: 'deletedAt',
  type: 'datetime',
  isNullable: true,
});

export const timestamps = () => [createdAt(), updatedAt(), deletedAt()];
