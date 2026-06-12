export function unixtimestamp(): number {
	return Math.floor(Date.now() / 1000);
}

export function generateOTP(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getMimeTypeFile(buffer: Buffer) {                                                                            
	// Ambil 4 byte pertama dan jadikan string Hex                                                                
	const header = buffer.subarray(0, 4).toString('hex').toUpperCase();                                           
																												  
	if (header.startsWith('FFD8FF')) {                                                                            
		return 'image/jpeg'; // JPG / JPEG                                                                        
	} else if (header === '89504E47') {                                                                           
		return 'image/png'; // PNG                                                                                
	} else if (header === '47494638') {                                                                           
		return 'image/gif'; // GIF                                                                                
	}                                                                                                             
																				                                  
	const webpHeader = buffer.subarray(8, 12).toString('ascii');                                                  
	if (webpHeader === 'WEBP') {                                                                                  
		return 'image/webp'; // WEBP                                                                              
	}                                                                                                             
																												  
	return 'image/jpeg'; // fallback                                                                      
}