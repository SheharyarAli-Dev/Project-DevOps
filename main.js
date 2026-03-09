require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const db = require('./db');
require('./events/logger'); // Initialize event logger


// ----------------- MongoDB Setup -----------------
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ----------------- Readline Interface -----------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ----------------- Backup Helper -----------------
function createBackup(vault) {
  if (!Array.isArray(vault)) return;

  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  const now = new Date();
  const timestamp = now.toISOString().replace(/:/g, '-').split('.')[0];
  const backupFileName = `backup_${timestamp}.json`;
  const backupPath = path.join(backupDir, backupFileName);

  fs.writeFileSync(backupPath, JSON.stringify(vault, null, 2), 'utf-8');
  console.log(`✅ Backup created successfully: ${backupFileName}`);
}

// ----------------- Export Helper -----------------
function exportVaultData(vault) {
  if (!Array.isArray(vault) || vault.length === 0) {
    console.log("\nVault is empty. Nothing to export.\n");
    return;
  }

  const fileName = 'export.txt';
  const filePath = path.join(__dirname, fileName);

  const now = new Date();
  const header = `Vault Export\nDate: ${now.toLocaleString()}\nTotal Records: ${vault.length}\nFile: ${fileName}\n\n`;

  const recordsText = vault.map((r, idx) => {
    const created = r.created ? r.created : 'N/A';
    return `${idx + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${created}`;
  }).join('\n');

  fs.writeFileSync(filePath, header + recordsText, 'utf-8');
  console.log(`\n✅ Data exported successfully to ${fileName}\n`);
}

// ----------------- Sort Records Helper -----------------
function sortRecords() {
  const vault = db.listRecords();
  if (!vault.length) {
    console.log("\nVault is empty. Nothing to sort.\n");
    return menu();
  }

  rl.question('Choose field to sort by (name/created): ', field => {
    const fieldChoice = field.trim().toLowerCase();
    rl.question('Choose order (asc/desc): ', order => {
      const orderChoice = order.trim().toLowerCase();

      const sortedVault = [...vault].sort((a, b) => {
        let valA = a[fieldChoice] ? a[fieldChoice].toString().toLowerCase() : '';
        let valB = b[fieldChoice] ? b[fieldChoice].toString().toLowerCase() : '';

        if (fieldChoice === 'created') {
          valA = a.created ? new Date(a.created) : new Date(0);
          valB = b.created ? new Date(b.created) : new Date(0);
        }

        if (valA < valB) return orderChoice === 'asc' ? -1 : 1;
        if (valA > valB) return orderChoice === 'asc' ? 1 : -1;
        return 0;
      });

      console.log(`\nSorted Records (${fieldChoice}, ${orderChoice.toUpperCase()}):`);
      sortedVault.forEach((r, idx) => {
        const created = r.created ? r.created : 'N/A';
        console.log(`${idx + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${created}`);
      });
      console.log('');
      menu();
    });
  });
}

// ----------------- Search Records Helper -----------------
function searchRecords() {
  const vault = db.listRecords();
  if (!vault.length) {
    console.log("\nVault is empty. No records to search.\n");
    return menu();
  }

  rl.question('\nEnter search keyword (ID or Name): ', keyword => {
    const kw = keyword.trim().toLowerCase();
    const matches = vault.filter(rec => {
      const recId = rec.id ? String(rec.id).toLowerCase() : '';
      const recName = rec.name ? String(rec.name).toLowerCase() : '';
      return recId.includes(kw) || recName.includes(kw);
    });

    if (!matches.length) console.log("\nNo records found.\n");
    else {
      console.log(`\nFound ${matches.length} matching record${matches.length > 1 ? 's' : ''}:`);
      matches.forEach((r, idx) => {
        const created = r.created ? r.created : 'N/A';
        console.log(`${idx + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${created}`);
      });
      console.log('');
    }
    menu();
  });
}

// ----------------- Vault Statistics Helper -----------------
function viewVaultStatistics() {
  const vault = db.listRecords();
  if (!vault.length) {
    console.log("\nVault is empty. No statistics available.\n");
    return menu();
  }

  const totalRecords = vault.length;
  const lastModified = vault.reduce((latest, r) => {
    const date = r.created ? new Date(r.created) : new Date(0);
    return date > latest ? date : latest;
  }, new Date(0));

  const longestName = vault.reduce((prev, r) => (r.name && r.name.length > prev.length ? r.name : prev), '');

  const dates = vault
    .filter(r => r.created)
    .map(r => new Date(r.created))
    .filter(d => !isNaN(d.getTime()));

  const earliest = dates.length ? new Date(Math.min(...dates)) : 'N/A';
  const latest = dates.length ? new Date(Math.max(...dates)) : 'N/A';

  console.log('\nVault Statistics:');
  console.log('--------------------------');
  console.log(`Total Records: ${totalRecords}`);
  console.log(`Last Modified: ${lastModified.toLocaleString()}`);
  console.log(`Longest Name: ${longestName} (${longestName.length} characters)`);
  console.log(`Earliest Record: ${earliest instanceof Date ? earliest.toLocaleDateString() : earliest}`);
  console.log(`Latest Record: ${latest instanceof Date ? latest.toLocaleDateString() : latest}`);
  console.log('');
  menu();
}

// ----------------- Main Menu -----------------
function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
=====================
  `);

  rl.question('Choose option: ', ans => {
    switch (ans.trim()) {
      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', value => {
            db.addRecord({ name, value }); // should add created timestamp internally
            console.log('✅ Record added successfully!');
            createBackup(db.listRecords());
            menu();
          });
        });
        break;

      case '2':
        const records = db.listRecords();
        if (!records.length) console.log('No records found.');
        else records.forEach(r => {
          const created = r.created ? r.created : 'N/A';
          console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${created}`);
        });
        menu();
        break;

      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', value => {
              const updated = db.updateRecord(Number(id), name, value);
              console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
              if (updated) createBackup(db.listRecords());
              menu();
            });
          });
        });
        break;

      case '4':
        rl.question('Enter record ID to delete: ', id => {
          const deleted = db.deleteRecord(Number(id));
          console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
          if (deleted) createBackup(db.listRecords());
          menu();
        });
        break;

      case '5':
        searchRecords();
        break;

      case '6':
        sortRecords();
        break;

      case '7':
        exportVaultData(db.listRecords());
        menu();
        break;

      case '8':
        viewVaultStatistics();
        break;

      case '9':
        console.log('👋 Exiting NodeVault...');
        mongoose.connection.close(() => {
          console.log('MongoDB connection closed.');
          rl.close();
          process.exit(0);
        });
        break;

      default:
        console.log('Invalid option.');
        menu();
    }
  });
}

// ----------------- Start App -----------------
menu();


