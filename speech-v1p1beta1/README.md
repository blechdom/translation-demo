# Node.js Client for Cloud Speech-to-Text API ([Alpha](https://github.com/GoogleCloudPlatform/google-cloud-node#versioning))

[Cloud Speech-to-Text API][Product Documentation]:
Converts audio to text by applying powerful neural network models.
- [Client Library Documentation][]
- [Product Documentation][]

## Quick Start
In order to use this library, you first need to go through the following
steps:

1. [Select or create a Cloud Platform project.](https://console.cloud.google.com/project)
2. [Enable billing for your project.](https://cloud.google.com/billing/docs/how-to/modify-project#enable_billing_for_a_project)
3. [Enable the Cloud Speech-to-Text API.](https://console.cloud.google.com/apis/library/speech.googleapis.com)
4. [Setup Authentication.](https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/master/guides/authentication)

### Installation
```
$ npm install --save speech
```

### Preview
#### SpeechClient
```js
 const speech = require('speech.v1p1beta1');

 const client = speech.SpeechClient({
   // optional auth parameters.
 });

 const languageCode = 'en-US';
 const sampleRateHertz = 44100;
 const encoding = 'FLAC';
 const config = {
   languageCode: languageCode,
   sampleRateHertz: sampleRateHertz,
   encoding: encoding,
 };
 const uri = 'gs://gapic-toolkit/hello.flac';
 const audio = {
   uri: uri,
 };
 const name = '';
 const request = {
   config: config,
   audio: audio,
   name: name,
 };
 client.recognize(request)
   .then(responses => {
     const response = responses[0];
     // doThingsWith(response)
   })
   .catch(err => {
     console.error(err);
   });
```

### Next Steps
- Read the [Client Library Documentation][] for Cloud Speech-to-Text API
  to see other available methods on the client.
- Read the [Cloud Speech-to-Text API Product documentation][Product Documentation]
  to learn more about the product and see How-to Guides.
- View this [repository's main README](https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/README.md)
  to see the full list of Cloud APIs that we cover.

[Client Library Documentation]: https://googlecloudplatform.github.io/google-cloud-node/#/docs/speech
[Product Documentation]: https://cloud.google.com/speech