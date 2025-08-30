import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import './App.css';
import NfcManager from './components/NfcManager';

function App() {
  const [isWebNFCSupported, setIsWebNFCSupported] = useState(false);
  const [readTagContent, setReadTagContent] = useState<string>('No tag read yet.');
  const [nfcStatus, setNfcStatus] = useState<string>('Ready');
  const [dataInput, setDataInput] = useState<string>('');
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

  const startNfcWriting = () => {
    if (!dataInput) {
      setNfcStatus('Please enter data to write.');
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
                    <Card.Text>Enter data below and place an NFC tag near your device to write.</Card.Text>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="writeData">Data to Write:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        id="writeData"
                        placeholder="Enter text to write"
                        value={dataInput}
                        onChange={(e) => setDataInput(e.target.value)}
                        disabled={isReading || isWriting}
                      />
                    </Form.Group>
                    <Button variant="success" onClick={startNfcWriting} disabled={isReading || isWriting || !dataInput}>
                      {isWriting ? 'Writing...' : 'Start Writing'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <NfcManager
              onRead={handleRead}
              onStatusChange={handleStatusChange}
              dataToWrite={dataInput}
              startReading={isReading}
              startWriting={isWriting}
            />
          </>
        )}
      </Container>
    </div>
  );
}

export default App;
