export const success = <T>(data: T, message = 'Success', status = 200, res?: { status: (code: number) => any; json: (body: unknown) => any }) => {
    if (res) return res.status(status).json({ success: true, message, data, statusCode: status });
    return { success: true, message, data, statusCode: status };
};


export const error = (message: string, status = 500, err?: string, res?: { status: (code: number) => any; json: (body: unknown) => any }) => {
    if (res) return res.status(status).json({ success: false, message, error: err, statusCode: status });
    return { success: false, message, error: err, statusCode: status };
};


export default {
    success,
    error
};