function validateRecord(record) {
  if (!record.name || !record.value) throw new Error('Record must have both name and value.');
  return true;
}

function generateId() {
  return Date.now();
}

module.exports = { validateRecord, generateId };
