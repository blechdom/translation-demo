// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const bucketName = 'batch-transcribe';
// const filename = 'File to delete, e.g. file.txt';
async function deleteFiles(){

	// Lists files in the bucket
	const [files] = await storage.bucket(bucketName).getFiles();

	console.log('Files:');
	files.forEach(file => {
  	console.log(file.name);
		deleteFile(file.name);
	});
}
async function deleteFile(filename){
	 await storage
                        .bucket(bucketName)
                        .file(filename)
                        .delete();
}
deleteFiles();
