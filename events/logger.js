const vaultEvents = require('./index');

vaultEvents.on('recordAdded', record => {
  console.log(`[EVENT] Record added: ID ${record.id}, Name: ${record.name}`);
});

vaultEvents.on('recordUpdated', record => {
  console.log(`[EVENT] Record updated: ID ${record.id}, Name: ${record.name}`);
});

vaultEvents.on('recordDeleted', record => {
  console.log(`[EVENT] Record deleted: ID ${record.id}, Name: ${record.name}`);
});
