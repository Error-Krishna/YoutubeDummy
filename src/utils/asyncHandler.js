const asyncHandler = (requestHnadler) => {
    return (req, res, next) => {
        Promise.resolve(requestHnadler(req, res, next)).catch((err) => next(err))
    }
}
export {asyncHandler}










// const async asyncHandler=(fn) => async(req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch(error) {
//         res.status(error.code || 500).json{
//             sucess: false,
//             message: error.message
//         }
//     }
// }