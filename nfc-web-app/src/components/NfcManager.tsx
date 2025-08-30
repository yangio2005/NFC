import React, { useState, useEffect } from 'react';

interface NfcManagerProps {
  onRead: (data: string) => void;
  onStatusChange: (status: string) => void;
  dataToWrite: string;
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
            tagContent += textDecoder.decode(record.data) + '\n';
          }
          // Add more record type handling as needed (e.g., URL)
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
    if (ndefReader && startWriting && dataToWrite) {
      onStatusChange('Place an NFC tag near your device to write...');
      ndefReader.write({
        records: [{ recordType: 'text', data: dataToWrite }],
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
