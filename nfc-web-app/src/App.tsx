import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Button, Form, ListGroup } from 'react-bootstrap';
import './App.css';
import NfcManager from './components/NfcManager';
import packageJson from '../package.json';
import { NfcData } from './components/NfcManager'; // Import NfcData interface

function App() {
  const [isWebNFCSupported, setIsWebNFCSupported] = useState(false);
  const [readTagContent, setReadTagContent] = useState<string>('No tag read yet.');
  const [nfcStatus, setNfcStatus] = useState<string>('Ready');
  const [nfcRecords, setNfcRecords] = useState<NfcData[]>([]); // Array to hold multiple records
  const [newRecordType, setNewRecordType] = useState<NfcData['type']>('text');
  const [newRecordValue, setNewRecordValue] = useState<string>('');
  const [isReading, setIsReading] = useState<boolean>(false);
  const [isWriting, setIsWriting] = useState<boolean>(false);

  useEffect(() => {
    if ('NDEFReader' in window) {
      setIsWebNFCSupported(true);
    } else {
      setIsWebNFCSupported(false);
    }
  }, []);

  const handleRead = useCallback((data: string) => {
    setReadTagContent(data);
    setIsReading(false); // Stop reading after a tag is read
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setNfcStatus(status);
    if (status.includes('successfully') || status.includes('Error')) {
      setIsReading(false);
      setIsWriting(false);
    }
  }, []);

  const startNfcReading = () => {
    setReadTagContent('Scanning for NFC tags...');
    setNfcStatus('Scanning for NFC tags...');
    setIsReading(true);
    setIsWriting(false); // Ensure writing is off
  };

  const addRecord = () => {
    if (newRecordValue.trim() === '') {
      setNfcStatus('Please enter a value for the new record.');
      return;
    }
    setNfcRecords([...nfcRecords, { type: newRecordType, value: newRecordValue.trim() }]);
    setNewRecordValue(''); // Clear input after adding
    setNfcStatus('Record added. Click Start Writing to write to tag.');
  };

  const removeRecord = (index: number) => {
    setNfcRecords(nfcRecords.filter((_, i) => i !== index));
    setNfcStatus('Record removed.');
  };

  const startNfcWriting = () => {
    if (nfcRecords.length === 0) {
      setNfcStatus('Please add at least one record to write.');
      return;
    }

    setNfcStatus('Place an NFC tag near your device to write...');
    setIsWriting(true);
    setIsReading(false); // Ensure reading is off
  };

  return (
    <div className="App">
      <Container className="mt-5">
        <h1 className="text-center mb-4">NFC 216 Reader/Writer</h1>

        {!isWebNFCSupported && (
          <Row className="justify-content-center mb-4">
            <Col md={8}>
              <Card bg="warning" text="white" className="text-center">
                <Card.Body>
                  <Card.Title>Web NFC Not Supported</Card.Title>
                  <Card.Text>
                    This application requires Web NFC API, which is only available on Chrome for Android and Chrome OS.
                    Please use a compatible device and browser.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {isWebNFCSupported && (
          <>
            <Row className="mb-4">
              <Col md={12}>
                <Card>
                  <Card.Header as="h5">NFC Status</Card.Header>
                  <Card.Body>
                    <p className="mb-0">{nfcStatus}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-4">
                <Card>
                  <Card.Header as="h5">Read NFC Tag</Card.Header>
                  <Card.Body>
                    <Card.Text>Place an NFC tag near your device to read its content.</Card.Text>
                    <Button variant="primary" onClick={startNfcReading} disabled={isReading || isWriting}>
                      {isReading ? 'Scanning...' : 'Start Reading'}
                    </Button>
                    <div className="mt-3">
                      <h6>Tag Content:</h6>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{readTagContent}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-4">
                <Card>
                  <Card.Header as="h5">Write NFC Tag</Card.Header>
                  <Card.Body>
                    <Card.Text>Add multiple data fields to write to the NFC tag.</Card.Text>

                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="newRecordType">New Record Type:</Form.Label>
                      <Form.Select
                        id="newRecordType"
                        value={newRecordType}
                        onChange={(e) => setNewRecordType(e.target.value as NfcData['type'])}
                        disabled={isReading || isWriting}
                      >
                        <option value="text">Text</option>
                        <option value="url">URL</option>
                        <option value="tel">Phone Number</option>
                        <option value="sms">SMS</option>
                        <option value="facebook">Facebook Profile/Page</option>
                        <option value="zalo">Zalo Profile/Page</option>
                        <option value="app">Android App Package</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="newRecordValue">New Record Value:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={1}
                        id="newRecordValue"
                        placeholder="Enter value for new record"
                        value={newRecordValue}
                        onChange={(e) => setNewRecordValue(e.target.value)}
                        disabled={isReading || isWriting}
                      />
                    </Form.Group>
                    <Button variant="secondary" onClick={addRecord} disabled={isReading || isWriting || newRecordValue.trim() === ''}>
                      Add Record
                    </Button>

                    <h6 className="mt-4">Records to Write:</h6>
                    {nfcRecords.length === 0 ? (
                      <p className="text-muted">No records added yet.</p>
                    ) : (
                      <ListGroup className="mb-3">
                        {nfcRecords.map((record, index) => (
                          <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{record.type.toUpperCase()}:</strong> {record.value}
                            </div>
                            <Button variant="danger" size="sm" onClick={() => removeRecord(index)}>
                              Remove
                            </Button>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}

                    <Button variant="success" onClick={startNfcWriting} disabled={isReading || isWriting || nfcRecords.length === 0}>
                      {isWriting ? 'Writing...' : 'Start Writing'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <NfcManager
              onRead={handleRead}
              onStatusChange={handleStatusChange}
              dataToWrite={nfcRecords}
              startReading={isReading}
              startWriting={isWriting}
            />
          </>
        )}
        <p className="text-center mt-4 text-muted">Version: {packageJson.version}</p>
      </Container>
    </div>
  );
}

export default App;
