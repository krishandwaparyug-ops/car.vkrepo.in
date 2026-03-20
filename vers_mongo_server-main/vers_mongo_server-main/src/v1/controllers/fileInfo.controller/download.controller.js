const axios = require('axios');
const { pipeline } = require('stream');
const { promisify } = require('util');
const responseError = require('../../../../errors/responseError');

const streamPipeline = promisify(pipeline);

const downloadFileInfo = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const { token } = req.query; // Support direct download link with token in query
    
    // Use either the Authorization header or the token query param
    const authHeader = req.headers.authorization || (token ? `Bearer ${token}` : null);
    
    const url = `https://webhooks.vkrepo.in/webhooks/file/download/${_id}`;
    
    console.log(`[DownloadProxy] Forwarding request for ID: ${_id} to ${url}`);

    const axiosInstance = axios.create({
      timeout: 120000 // Increase to 120 seconds for stability
    });

    const response = await axiosInstance({
      url,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'Authorization': authHeader
      }
    });

    // Copy essential headers from the response
    const headersToCopy = [
      'content-type',
      'content-disposition',
      'content-length',
      'last-modified'
    ];

    headersToCopy.forEach(header => {
      if (response.headers[header]) {
        res.setHeader(header, response.headers[header]);
      }
    });

    // Final fallback for content-disposition to ensure it triggers a download
    if (!res.getHeader('content-disposition')) {
        res.setHeader('content-disposition', 'attachment');
    }

    // Set status before streaming
    res.status(response.status);

    // Robust piping with pipeline.
    await streamPipeline(response.data, res);
    console.log(`[DownloadProxy] Successfully streamed file for ID: ${_id}`);

  } catch (error) {
    console.error('[DownloadProxy] Error:', error.message);
    
    if (res.headersSent) {
      console.error('[DownloadProxy] Stream failed after headers sent. Ending response.');
      return res.end();
    }

    if (error.response) {
        return res.status(error.response.status).json({
            success: false,
            message: `External server error: ${error.message}`
        });
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return res.status(504).json({
            success: false,
            message: "The external download server took too long to respond."
        });
    }

    return next(responseError(500, `Internal server error during download proxy: ${error.message}`));
  }
};

module.exports = { downloadFileInfo };

