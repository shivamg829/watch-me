// 1.This is promise-based error handling for async functions in Express.js.
const asyncHalder = (requestHandler) =>  {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((error) => {
                res.status(error.code || 500).json({
                    success: false,
                    message: error.message || "Internal Server Error"
                });
            });
    };
}
export default asyncHalder;
// 2.This method is try-catch based error handling for async functions in Express.js.
// const asyncHandler = (fn) => async (req, res, next) => {
//     try{
//         await fn(req, res, next);
//     }catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message || "Internal Server Error"
//         });
//     }
// }