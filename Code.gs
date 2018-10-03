
function doGet() {
  const output = HtmlService.createHtmlOutputFromFile('Form').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).setSandboxMode(HtmlService.SandboxMode.IFRAME);
  return output
    
}

function createFolder(parentFolderId, folderName) {
	try {
        var parentFolder = DriveApp.getFolderById(google_folder_id);
		var folders = parentFolder.getFoldersByName(folderName);
		var folder;
		if (folders.hasNext()) {
			folder = folders.next();
		} else {
			folder = parentFolder.createFolder(folderName);
		}     
		return {
			'folderId' : folder.getId() 
		}
	} catch (e) {
		return {
			'error' : e.toString()
		}
	}
}
function addFile(folderId, applicantEmail, applicantPhone, applicantRec, applicantPosition){

var answers = 'Email: '+applicantEmail+'\n'+'Phone number: '+applicantPhone+'\n'+'Did someone recommend that you apply?: '+ applicantRec+'\n'+'What level of staff position they are interested in? '+applicantPosition


var targetFolder = DriveApp.getFolderById(folderId);
              targetFolder.createFile('Questions.docx', 
                                 answers, 
                                MimeType.PLAIN_TEXT)  
}

function uploadFile(base64Data, fileName, folderId) {
	try {
		var splitBase = base64Data.split(','), type = splitBase[0].split(';')[0]
				.replace('data:', '');
		var byteCharacters = Utilities.base64Decode(splitBase[1]);
		var ss = Utilities.newBlob(byteCharacters, type);
		ss.setName(fileName);

		var folder = DriveApp.getFolderById(folderId);
		var files = folder.getFilesByName(fileName);
		var file;
		while (files.hasNext()) {
			// delete existing files with the same name.
			file = files.next();
			folder.removeFile(file);
		}
		file = folder.createFile(ss);
		return {
			'folderId' : folderId,
			'fileName' : file.getName()
		};
	} catch (e) {
		return {
			'error' : e.toString()
		};
	}
}

function getText() {
 	var response = UrlFetchApp.fetch('https://api.tipe.io/api/v1/document/'+document_id, {
			method: "GET",
			muteHttpExceptions: true, 
			headers: {
				"Content-Type": "application/json",
				'Authorization': auth_key,
				'Tipe-Id': tipe_id
			}
		})

		if(response.getResponseCode() === 200){
		var applyPageTextWithEmptySpaces = JSON.parse(response.getContentText()).blocks[3].value.split("\n")
		var applyPageText = []
		for(var i = 0; i < applyPageTextWithEmptySpaces.length; i++){
			if(applyPageTextWithEmptySpaces[i] !== ""){
				applyPageText.push(applyPageTextWithEmptySpaces[i].trim())
			}
		}

		return {
			applyHeader: applyPageText[0],
			resumePrompt: applyPageText[1],
			docsPrompt: applyPageText[2],
			whyPrompt: applyPageText[3],
			lawPrompt: applyPageText[4]
		}
	}
}

function emailConfirmation(email){
   try {
    //Insert your script logic here
    MailApp.sendEmail(email,
                "Progressive Talent Pipeline has received your application",
                "If you have any questions feel free to reach out to us at progressivepipelineproject@gmail.com");
     return {
       'emailSend': 'confirmation email has been sent.'
     }
  } catch(e) {
    //Catch any error here. Example below is just sending an email with the error.
    var errorMessage = 'error sending confirmation email to ' + email; 
    MailApp.sendEmail('mateo@demandprogress.org',
                     errorMessage,
                    e);
    return {
      'error': errorMessage
    }
  }
}