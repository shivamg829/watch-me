class ApiResponse {
    constructor(
        statusCode, 
        data, 
        message = "Success") {
        this.res = res;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400 ? true : false;
        this.errors = errors;
        this.stack = null;
        this.success = success;
    }
}

export { ApiResponse };