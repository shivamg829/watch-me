class ApiResponse {
    constructor(
        statusCode, 
        message = "Success", 
        data = null, 
        success = true,
        errors = [], 
        res = null) {
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