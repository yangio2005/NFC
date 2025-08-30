import React, { useState, useEffect } from 'react';

interface NfcData {
  type: 'text' | 'url' | 'tel' | 'sms' | 'app' | 'facebook' | 'zalo';
  value: string;
}

interface NfcManagerProps {
  onRead: (data: string) => void;
  onStatusChange: (status: string) => void;
  dataToWrite: NfcData | null;
  startReading: boolean;
  startWriting: boolean;
}

const NfcManager: React.FC<NfcManagerProps> = ({
  onRead,
  onStatusChange,
  dataToWrite,
  startReading,
  startWriting,
}) => {
  const [ndefReader, setNdefReader] = useState<NDEFReader | null>(null);

  useEffect(() => {
    if ('NDEFReader' in window) {
      const reader = new NDEFReader();
      setNdefReader(reader);

      reader.addEventListener('reading', ({ message, serialNumber }) => {
        let tagContent = '';
        for (const record of message.records) {
          if (record.recordType === 'text') {
            const textDecoder = new TextDecoder(record.encoding);
            tagContent += textDecoder.decode(record.data) + '
';
          } else if (record.recordType === 'url') {
            const urlDecoder = new TextDecoder();
            tagContent += urlDecoder.decode(record.data) + '\n';
          }
          // Add more record type handling as needed
        }
        onRead(tagContent.trim());
        onStatusChange('Tag read successfully!');
      });

      reader.addEventListener('readingerror', (event) => {
        onStatusChange(`Error reading tag: ${event.message}`);
      });
    } else {
      onStatusChange('Web NFC is not supported in this browser.');
    }
  }, [onRead, onStatusChange]);

  useEffect(() => {
    if (ndefReader && startReading) {
      onStatusChange('Scanning for NFC tags...');
      ndefReader.scan().catch((error) => {
        onStatusChange(`Error starting scan: ${error.message}`);
      });
    }
  }, [ndefReader, startReading, onStatusChange]);

  useEffect(() => {
    const createNdefRecord = (data: NfcData): NDEFRecordInit => {
      switch (data.type) {
        case 'url':
          return { recordType: 'url', data: data.value };
        case 'tel':
          return { recordType: 'url', data: `tel:${data.value}` };
        case 'sms':
          return { recordType: 'url', data: `sms:${data.value}` };
        case 'facebook':
          return { recordType: 'url', data: `https://www.facebook.com/${data.value}` };
        case 'zalo':
          return { recordType: 'url', data: `https://zalo.me/${data.value}` };
        case 'app':
          // For Android Application Record (AAR)
          return { recordType: 'android.com:pkg', data: data.value };
        case 'text':
        default:
          return { recordType: 'text', data: data.value };
      }
    };

    if (ndefReader && startWriting && dataToWrite) {
      onStatusChange('Place an NFC tag near your device to write...');
      ndefReader.write({
        records: [createNdefRecord(dataToWrite)],
      })
      .then(() => {
        onStatusChange('Data written successfully!');
      })
      .catch((error) => {
        onStatusChange(`Error writing data: ${error.message}`);
      });
    }
  }, [ndefReader, startWriting, dataToWrite, onStatusChange]);

  return null; // This component doesn't render anything directly
};

export default NfcManager;
