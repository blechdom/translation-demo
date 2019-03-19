// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const assert = require('assert');

const texttospeechModule = require('../src');

const FAKE_STATUS_CODE = 1;
const error = new Error();
error.code = FAKE_STATUS_CODE;

describe('TextToSpeechClient', () => {
  describe('listVoices', () => {
    it('invokes listVoices without error', done => {
      const client = new texttospeechModule.v1beta1.TextToSpeechClient({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      const languageCode = 'languageCode-412800396';
      const request = {
        languageCode: languageCode,
      };

      // Mock response
      const expectedResponse = {};

      // Mock Grpc layer
      client._innerApiCalls.listVoices = mockSimpleGrpcMethod(
        request,
        expectedResponse
      );

      client.listVoices(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse);
        done();
      });
    });

    it('invokes listVoices with error', done => {
      const client = new texttospeechModule.v1beta1.TextToSpeechClient({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      const languageCode = 'languageCode-412800396';
      const request = {
        languageCode: languageCode,
      };

      // Mock Grpc layer
      client._innerApiCalls.listVoices = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.listVoices(request, (err, response) => {
        assert(err instanceof Error);
        assert.strictEqual(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('synthesizeSpeech', () => {
    it('invokes synthesizeSpeech without error', done => {
      const client = new texttospeechModule.v1beta1.TextToSpeechClient({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      const input = {};
      const voice = {};
      const audioConfig = {};
      const request = {
        input: input,
        voice: voice,
        audioConfig: audioConfig,
      };

      // Mock response
      const audioContent = '16';
      const expectedResponse = {
        audioContent: audioContent,
      };

      // Mock Grpc layer
      client._innerApiCalls.synthesizeSpeech = mockSimpleGrpcMethod(
        request,
        expectedResponse
      );

      client.synthesizeSpeech(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse);
        done();
      });
    });

    it('invokes synthesizeSpeech with error', done => {
      const client = new texttospeechModule.v1beta1.TextToSpeechClient({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      const input = {};
      const voice = {};
      const audioConfig = {};
      const request = {
        input: input,
        voice: voice,
        audioConfig: audioConfig,
      };

      // Mock Grpc layer
      client._innerApiCalls.synthesizeSpeech = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.synthesizeSpeech(request, (err, response) => {
        assert(err instanceof Error);
        assert.strictEqual(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('synthesizeTacotron2', () => {
    it('invokes synthesizeTacotron2 without error', done => {
      const client = new texttospeechModule.v1beta1.TextToSpeechClient({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      const name = 'name3373707';
      const inputText = 'inputText1386673282';
      const request = {
        name: name,
        inputText: inputText,
      };

      // Mock response
      const audioContent = '16';
      const expectedResponse = {
        audioContent: audioContent,
      };

      // Mock Grpc layer
      client._innerApiCalls.synthesizeTacotron2 = mockSimpleGrpcMethod(
        request,
        expectedResponse
      );

      client.synthesizeTacotron2(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse);
        done();
      });
    });

    it('invokes synthesizeTacotron2 with error', done => {
      const client = new texttospeechModule.v1beta1.TextToSpeechClient({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      const name = 'name3373707';
      const inputText = 'inputText1386673282';
      const request = {
        name: name,
        inputText: inputText,
      };

      // Mock Grpc layer
      client._innerApiCalls.synthesizeTacotron2 = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.synthesizeTacotron2(request, (err, response) => {
        assert(err instanceof Error);
        assert.strictEqual(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

});

function mockSimpleGrpcMethod(expectedRequest, response, error) {
  return function(actualRequest, options, callback) {
    assert.deepStrictEqual(actualRequest, expectedRequest);
    if (error) {
      callback(error);
    } else if (response) {
      callback(null, response);
    } else {
      callback(null);
    }
  };
}
