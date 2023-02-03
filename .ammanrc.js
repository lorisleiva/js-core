const { LOCALHOST, tmpLedgerDir } = require('@metaplex-foundation/amman');
const path = require('path');
const MOCK_STORAGE_ID = 'js-sdk';

module.exports = {
  validator: {
    killRunningValidators: true,
    programs: [],
    jsonRpcUrl: LOCALHOST,
    websocketUrl: '',
    commitment: 'confirmed',
    ledgerDir: tmpLedgerDir(),
    resetLedger: true,
    verifyFees: false,
  },
  storage: {
    storageId: MOCK_STORAGE_ID,
    clearOnStart: true,
  },
  snapshot: {
    snapshotFolder: path.join(__dirname, 'snapshots'),
  },
};
