/**
 * @description send an error response
 * @param errorCode 400 - 500 status codes
 * @param message The error message displayed in the response. Defaults to "Something went wrong. Try again later."
 * @param res the response object
 * @param error optional error object to be sent with response.
 */
module.exports.e = function(
	errorCode,
	res,
	message = 'Something went wrong. Try again later.',
	error
) {
	console.error(error);
	res.status(errorCode).json({
		success: false,
		message,
		error,
	});
}
  
/**
   * @description send a success response
   * @param message The success message displayed in the response. Defaults to "action completed successfully"
   * @param data response data (e.g. user)
   * @param res the response object
   */
module.exports.s = function(
	data = {},
	res,
	message = 'action completed successfully',
	warnings
) {
	res.status(200).json({
		success: true,
		message,
		data,
		warnings,
	});
}
  
/**
   * @async
   * @description try a block of code, catch errors
   * and send them in a response with 500 status
   * (caught errors should always be server errors.
   * Other errors should be handled differently)
   * @param tried function to execute inside the try block
   * @param res the response object
   */
module.exports.attempt = async (tried = () => {}, res = {}) => {
	try {
		await tried();
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: 'Something Went Wrong. Try Again!',
			error,
		});
	}
};