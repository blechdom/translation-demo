// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

/**
 * TODO(developer): Uncomment the following line before running the sample.
 */
 const bucketName = 'batch-transcribe';

async function listFiles(){

// Lists files in the bucket
const [files] = await storage.bucket(bucketName).getFiles();

console.log('Files:');
files.forEach(file => {
  console.log(file.name);
});
}
listFiles();
